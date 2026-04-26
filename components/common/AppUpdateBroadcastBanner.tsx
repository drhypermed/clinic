import React, { useEffect, useMemo, useRef } from 'react';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import type { UpdateBroadcastAudience } from '../../services/updateBroadcastService';
import { applyPendingPwaUpdateNow } from '../../services/pwaUpdateService';

type AppAudience = 'doctors' | 'secretaries' | 'public';

type RolloutRecord = {
  id: string;
  targetAudience: UpdateBroadcastAudience;
  status: string;
  createdAtMs: number;
};

type AppUpdateBroadcastBannerProps = {
  audience: AppAudience;
  scopeId?: string;
  className?: string;
};

const TARGETS_BY_AUDIENCE: Record<AppAudience, UpdateBroadcastAudience[]> = {
  doctors: ['doctors', 'doctor_secretaries', 'all'],
  secretaries: ['secretaries', 'doctor_secretaries', 'all'],
  public: ['public', 'all'],
};

// نتجاهل أي رولأوت أقدم من ٢٤ ساعة لمنع تطبيق رولأوت قديم على متصفح جديد
// (مستخدم يفتح التطبيق لأول مرة على جهازه، ما يستحقش reload لرولأوت قديم).
const ROLLOUT_LOOKBACK_MS = 24 * 60 * 60 * 1000;

const toSafeString = (value: unknown, fallback = ''): string => {
  const normalized = String(value || '').trim();
  return normalized || fallback;
};

const toSafeNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const makeAppliedStorageKey = (audience: AppAudience, scopeId?: string): string => {
  const normalizedScope = toSafeString(scopeId, 'global');
  return `dh_silent_update_rollout_applied:${audience}:${normalizedScope}`;
};

const readAppliedRolloutId = (key: string): string => {
  if (typeof window === 'undefined') return '';
  try {
    return String(localStorage.getItem(key) || '').trim();
  } catch {
    return '';
  }
};

const saveAppliedRolloutId = (key: string, rolloutId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, rolloutId);
  } catch {
    // ignore storage failures
  }
};

export const AppUpdateBroadcastBanner: React.FC<AppUpdateBroadcastBannerProps> = ({
  audience,
  scopeId,
}) => {
  const isApplyingRef = useRef(false);
  const appliedStorageKey = useMemo(() => makeAppliedStorageKey(audience, scopeId), [audience, scopeId]);

  useEffect(() => {
    const allowedTargets = TARGETS_BY_AUDIENCE[audience];
    const cutoffMs = Date.now() - ROLLOUT_LOOKBACK_MS;

    // اشتراك لحظي بدلاً من قراءة واحدة — لما الأدمن ينفذ تحديث وكل التطبيقات
    // المفتوحة تلاحظه فوراً وتعيد تحميل نفسها (هذا الوعد في رسالة الـ Cloud Function).
    // الفلتر بالـ status و createdAtMs يقلل القراءات: المستخدم لا يقرأ كل الرولأوتس،
    // فقط الناجحة من آخر ٢٤ ساعة (عادة ٠-٢ سجل).
    const rolloutQuery = query(
      collection(db, 'appUpdateRollouts'),
      where('status', '==', 'sent'),
      where('createdAtMs', '>', cutoffMs),
      orderBy('createdAtMs', 'desc'),
      limit(5),
    );

    const unsubscribe = onSnapshot(
      rolloutQuery,
      (snapshot) => {
        if (isApplyingRef.current) return;

        const latestApplicableRollout = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() as Record<string, unknown>;
            return {
              id: docSnap.id,
              targetAudience: toSafeString(data.targetAudience, 'all') as UpdateBroadcastAudience,
              status: toSafeString(data.status, 'sent'),
              createdAtMs: toSafeNumber(data.createdAtMs),
            } as RolloutRecord;
          })
          .find((record) => allowedTargets.includes(record.targetAudience));

        if (!latestApplicableRollout) return;

        const appliedRolloutId = readAppliedRolloutId(appliedStorageKey);
        if (appliedRolloutId === latestApplicableRollout.id) return;

        isApplyingRef.current = true;
        saveAppliedRolloutId(appliedStorageKey, latestApplicableRollout.id);

        void applyPendingPwaUpdateNow().finally(() => {
          setTimeout(() => {
            isApplyingRef.current = false;
          }, 4000);
        });
      },
      () => {
        // فشل الاشتراك — لا نفعل شيء (التحديث يحصل عند فتحة لاحقة).
      },
    );

    return () => unsubscribe();
  }, [appliedStorageKey, audience]);

  return null;
};
