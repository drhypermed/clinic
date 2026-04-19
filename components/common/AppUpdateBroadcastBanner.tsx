import React, { useEffect, useMemo, useRef } from 'react';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../services/firestore/cacheFirst';
import type { UpdateBroadcastAudience } from '../../services/updateBroadcastService';
import { applyPendingPwaUpdateNow } from '../../services/pwaUpdateService';

type AppAudience = 'doctors' | 'secretaries' | 'public';

type RolloutRecord = {
  id: string;
  targetAudience: UpdateBroadcastAudience;
  status: string;
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

const toSafeString = (value: unknown, fallback = ''): string => {
  const normalized = String(value || '').trim();
  return normalized || fallback;
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
    let cancelled = false;

    const rolloutQuery = query(
      collection(db, 'appUpdateRollouts'),
      orderBy('createdAtMs', 'desc'),
      limit(25)
    );

    getDocsCacheFirst(rolloutQuery).then((snapshot) => {
      if (cancelled) return;
      if (isApplyingRef.current) return;

      const latestApplicableRollout = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            targetAudience: toSafeString(data.targetAudience, 'all') as UpdateBroadcastAudience,
            status: toSafeString(data.status, 'sent'),
          } as RolloutRecord;
        })
        .find((record) => record.status === 'sent' && allowedTargets.includes(record.targetAudience));

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
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [appliedStorageKey, audience]);

  return null;
};
