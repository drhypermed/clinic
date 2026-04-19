import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import type { ExternalNotificationAudience } from '../../services/externalNotificationBroadcastService';
import { playNotificationCue } from '../../utils/notificationSound';

type AppAudience = 'doctors' | 'secretaries' | 'public';

type InAppBroadcastRecord = {
  id: string;
  title: string;
  body: string;
  targetAudience: ExternalNotificationAudience;
  status: string;
  createdAtMs: number;
  expiresAtMs: number;
  targetScopeIds: string[];
};

type InAppAudienceNotificationPopupProps = {
  audience: AppAudience;
  scopeIds?: string[];
};

const TARGETS_BY_AUDIENCE: Record<AppAudience, ExternalNotificationAudience[]> = {
  doctors: [
    'doctors',
    'doctor_secretaries',
    'doctor_public',
    'doctors_premium_active',
    'doctors_free_never_premium',
    'doctors_free_expired_premium',
    'all',
  ],
  secretaries: ['secretaries', 'doctor_secretaries', 'all'],
  public: ['public', 'doctor_public', 'all'],
};

const toSafeString = (value: unknown, fallback = ''): string => {
  const normalized = String(value || '').trim();
  return normalized || fallback;
};

const toSafeNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeScopeIds = (scopeIds: string[] | undefined): string[] => {
  if (!Array.isArray(scopeIds)) return [];
  return Array.from(
    new Set(
      scopeIds
        .map((scope) => toSafeString(scope).toLowerCase())
        .filter(Boolean)
    )
  );
};

const shouldMatchByAudience = (record: InAppBroadcastRecord, audience: AppAudience): boolean => {
  const allowedTargets = TARGETS_BY_AUDIENCE[audience];
  return allowedTargets.includes(record.targetAudience);
};

// ═══ localStorage fallback ═══
// يضمن عمل الإغلاق حتى قبل نشر قواعد Firestore الجديدة، ويحترم الإغلاقات القديمة
// المحفوظة من النسخة السابقة.
const LEGACY_DISMISS_PREFIX = 'dh_in_app_popup_dismissed:';

const readLocalDismissal = (broadcastId: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`${LEGACY_DISMISS_PREFIX}${broadcastId}`) === '1';
  } catch {
    return false;
  }
};

const writeLocalDismissal = (broadcastId: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LEGACY_DISMISS_PREFIX}${broadcastId}`, '1');
  } catch {
    // ignore storage failures (e.g. private mode)
  }
};

const shouldMatchCustomScopes = (record: InAppBroadcastRecord, normalizedScopeIds: string[]): boolean => {
  if (record.targetAudience !== 'custom') return false;
  if (normalizedScopeIds.length === 0) return false;
  const targetScopeSet = new Set(
    (Array.isArray(record.targetScopeIds) ? record.targetScopeIds : [])
      .map((scope) => toSafeString(scope).toLowerCase())
      .filter(Boolean)
  );
  return normalizedScopeIds.some((scope) => targetScopeSet.has(scope));
};

export const InAppAudienceNotificationPopup: React.FC<InAppAudienceNotificationPopupProps> = ({
  audience,
  scopeIds,
}) => {
  const { user } = useAuth();
  const userId = user?.uid || '';

  const [activeBroadcast, setActiveBroadcast] = useState<InAppBroadcastRecord | null>(null);
  const [broadcasts, setBroadcasts] = useState<InAppBroadcastRecord[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const lastPlayedBroadcastIdRef = useRef<string | null>(null);

  const normalizedScopeIds = useMemo(() => normalizeScopeIds(scopeIds), [scopeIds]);

  /**
   * الاشتراك في قائمة البثوث.
   * يُفلتر لاحقاً بناءً على الجمهور + قائمة المُغلَقات.
   */
  useEffect(() => {
    const broadcastsQuery = query(
      collection(db, 'inAppNotificationBroadcasts'),
      orderBy('createdAtMs', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      broadcastsQuery,
      (snapshot) => {
        const records: InAppBroadcastRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            title: toSafeString(data.title),
            body: toSafeString(data.body),
            targetAudience: (toSafeString(data.targetAudience, 'all') as ExternalNotificationAudience),
            status: toSafeString(data.status, 'active'),
            createdAtMs: toSafeNumber(data.createdAtMs),
            expiresAtMs: toSafeNumber(data.expiresAtMs),
            targetScopeIds: Array.isArray(data.targetScopeIds)
              ? data.targetScopeIds.map((item) => toSafeString(item))
              : [],
          };
        });
        setBroadcasts(records);
      },
      (error) => {
        if ((error as { code?: string })?.code === 'permission-denied') {
          setBroadcasts([]);
          return;
        }
        setBroadcasts([]);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * الاشتراك في قائمة الإشعارات المُغلقة من المستخدم (Firestore per-user).
   * يحل محل localStorage القديم — يعمل عبر كل الأجهزة وبعد تسجيل الخروج/الدخول.
   */
  useEffect(() => {
    if (!userId) {
      setDismissedIds(new Set());
      return undefined;
    }

    const dismissedQuery = collection(db, 'users', userId, 'dismissedBroadcasts');
    const unsubscribe = onSnapshot(
      dismissedQuery,
      (snapshot) => {
        const next = new Set<string>();
        snapshot.docs.forEach((docSnap) => {
          const broadcastId = toSafeString(docSnap.id);
          if (broadcastId) next.add(broadcastId);
        });
        setDismissedIds(next);
      },
      () => {
        // في حال فشل القراءة (مثلاً لم يسجل دخول بعد) — نفترض لا شيء مُغلق.
        setDismissedIds(new Set());
      }
    );

    return () => unsubscribe();
  }, [userId]);

  /**
   * احتساب البثّ النشط بعد دمج القائمتين (متاح + غير مُغلق من المستخدم).
   * مُحصّن مزدوج: الإشعار يُعتبر مُغلقاً لو موجود في Firestore أو في localStorage
   * (يضمن استمرار احترام الإغلاقات القديمة + يعمل حتى قبل نشر قواعد Firestore).
   */
  useEffect(() => {
    const nowMs = Date.now();
    const applicable = broadcasts.find((record) => {
      if (record.status !== 'active') return false;
      if (!record.title || !record.body) return false;
      if (record.expiresAtMs > 0 && record.expiresAtMs <= nowMs) return false;

      const audienceMatch = shouldMatchByAudience(record, audience);
      const customMatch = shouldMatchCustomScopes(record, normalizedScopeIds);
      if (!audienceMatch && !customMatch) return false;

      // فحص الإغلاق من المصدرين معاً:
      if (dismissedIds.has(record.id)) return false;
      if (readLocalDismissal(record.id)) return false;

      return true;
    }) || null;

    setActiveBroadcast(applicable);
  }, [broadcasts, dismissedIds, audience, normalizedScopeIds]);

  useEffect(() => {
    if (!activeBroadcast) {
      lastPlayedBroadcastIdRef.current = null;
      return;
    }
    if (lastPlayedBroadcastIdRef.current === activeBroadcast.id) return;
    lastPlayedBroadcastIdRef.current = activeBroadcast.id;
    void playNotificationCue('broadcast');
  }, [activeBroadcast]);

  const handleDismiss = async () => {
    if (!activeBroadcast) return;
    const broadcastId = activeBroadcast.id;

    // 1. كتابة فورية في localStorage — تضمن عدم عودة الإشعار حتى لو فشلت Firestore.
    writeLocalDismissal(broadcastId);

    // 2. تحديث الواجهة (optimistic).
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(broadcastId);
      return next;
    });
    setActiveBroadcast(null);

    // 3. كتابة دائمة في Firestore — تُمكّن التزامن عبر الأجهزة بعد نشر القواعد.
    //    لو فشلت (قبل deploy أو بسبب شبكة) → localStorage يغطّي الحالي.
    if (userId) {
      try {
        await setDoc(
          doc(db, 'users', userId, 'dismissedBroadcasts', broadcastId),
          {
            broadcastId,
            dismissedAt: serverTimestamp(),
            audience,
          },
          { merge: true },
        );
      } catch (err) {
        console.warn('[InAppAudienceNotificationPopup] Firestore dismissal failed (localStorage still applied):', err);
      }
    }
  };

  if (!activeBroadcast) return null;

  const popup = (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10040] w-[min(94vw,34rem)]" dir="rtl">
      <div className="rounded-2xl border border-cyan-200 bg-white shadow-[0_24px_52px_-30px_rgba(2,6,23,0.82)] px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-slate-900 text-sm sm:text-base font-black leading-snug">{activeBroadcast.title}</h4>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 whitespace-pre-wrap leading-relaxed">{activeBroadcast.body}</p>
          </div>

          <button
            type="button"
            onClick={() => { void handleDismiss(); }}
            className="shrink-0 h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-black"
            aria-label="إغلاق الإشعار"
            title="إغلاق"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return popup;
  return createPortal(popup, document.body);
};
