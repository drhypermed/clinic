import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import type { ExternalNotificationAudience } from '../../services/externalNotificationBroadcastService';
import { playNotificationCue } from '../../utils/notificationSound';

// آخر ٢٤ ساعة فقط للقراءة الأولية — بثّ أقدم من ده ما عاد محتاج يطلع لأول مرة.
const INITIAL_LOOKBACK_MS = 24 * 60 * 60 * 1000;
// حد أقصى ٥ بثوث نشطة في القراءة الأولية. الأدمن نادراً ينشر أكثر من ده في الفترة دي.
const MAX_INITIAL_BROADCASTS = 5;
// حد أقصى ٥ بثوث جديدة في الجلسة الواحدة عبر الاشتراك اللحظي.
const MAX_LIVE_BROADCASTS = 5;

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
  // علم تحميل قائمة المغلقات — يمنع ظهور الإشعار "للحظة ثم اختفاء"
  // لما القائمة تتأخر في التحميل بعد ما البث الأساسي اتجاب.
  const [dismissedReady, setDismissedReady] = useState(false);
  const lastPlayedBroadcastIdRef = useRef<string | null>(null);

  const normalizedScopeIds = useMemo(() => normalizeScopeIds(scopeIds), [scopeIds]);

  /**
   * يقرأ البثوث على مرحلتين لتقليل التكلفة على آلاف المستخدمين:
   *   ١) قراءة أولية واحدة (getDocs) لآخر ٢٤ ساعة من البثوث النشطة فقط
   *   ٢) اشتراك لحظي (onSnapshot) على البثوث الجديدة الناشئة بعد فتح الجلسة فقط
   * الفرق عن النسخة السابقة: كان onSnapshot على آخر ٣٠ بث بدون فلتر، يولّد
   * ٣٠ قراءة لكل مستخدم عند فتح التطبيق.
   */
  useEffect(() => {
    let isMounted = true;
    const sessionStartMs = Date.now();
    const initialCutoffMs = sessionStartMs - INITIAL_LOOKBACK_MS;
    const initialDocs = new Map<string, InAppBroadcastRecord>();
    const liveDocs = new Map<string, InAppBroadcastRecord>();
    let unsubscribeLive: (() => void) | null = null;

    const mergeAndPublish = () => {
      if (!isMounted) return;
      // نضمن دمج المرحلتين بدون تكرار، مع ترتيب تنازلي بـ createdAtMs.
      const combined = new Map<string, InAppBroadcastRecord>();
      initialDocs.forEach((value, key) => combined.set(key, value));
      liveDocs.forEach((value, key) => combined.set(key, value));
      const sorted = Array.from(combined.values()).sort(
        (a, b) => b.createdAtMs - a.createdAtMs,
      );
      setBroadcasts(sorted);
    };

    const toRecord = (docSnap: { id: string; data: () => unknown }): InAppBroadcastRecord => {
      const data = (docSnap.data() || {}) as Record<string, unknown>;
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
    };

    // ── المرحلة ١: قراءة لقطة واحدة للبثوث النشطة الحديثة ──
    const initialQuery = query(
      collection(db, 'inAppNotificationBroadcasts'),
      where('status', '==', 'active'),
      where('createdAtMs', '>', initialCutoffMs),
      orderBy('createdAtMs', 'desc'),
      limit(MAX_INITIAL_BROADCASTS),
    );

    getDocs(initialQuery)
      .then((snapshot) => {
        if (!isMounted) return;
        snapshot.docs.forEach((docSnap) => {
          initialDocs.set(docSnap.id, toRecord(docSnap));
        });
        mergeAndPublish();
      })
      .catch(() => {
        // فشل القراءة — نتعامل كأن لا توجد بثوث ولا نعطّل الـ live.
      })
      .finally(() => {
        if (!isMounted) return;
        // ── المرحلة ٢: اشتراك على الجديد بعد بداية الجلسة فقط ──
        const liveQuery = query(
          collection(db, 'inAppNotificationBroadcasts'),
          where('status', '==', 'active'),
          where('createdAtMs', '>', sessionStartMs),
          orderBy('createdAtMs', 'desc'),
          limit(MAX_LIVE_BROADCASTS),
        );

        unsubscribeLive = onSnapshot(
          liveQuery,
          (snapshot) => {
            if (!isMounted) return;
            // نمسح ونعيد البناء لأن الاشتراك يعرض اللقطة الحالية بالكامل لمدى الاستعلام.
            liveDocs.clear();
            snapshot.docs.forEach((docSnap) => {
              liveDocs.set(docSnap.id, toRecord(docSnap));
            });
            mergeAndPublish();
          },
          () => {
            // فشل الاشتراك (صلاحيات/شبكة) — نُبقي اللقطة الأولية بدون تغيير.
          },
        );
      });

    return () => {
      isMounted = false;
      if (unsubscribeLive) unsubscribeLive();
    };
  }, []);

  /**
   * الاشتراك في قائمة الإشعارات المُغلقة من المستخدم (Firestore per-user).
   * يحل محل localStorage القديم — يعمل عبر كل الأجهزة وبعد تسجيل الخروج/الدخول.
   *
   * dismissedReady بيتحدد True بعد أول لقطة (نجاح أو فشل) عشان الـ popup
   * ما يظهرش لحظة قبل ما القائمة توصل ثم يختفي بعد ما توصل.
   */
  useEffect(() => {
    setDismissedReady(false);

    if (!userId) {
      // لا يوجد مستخدم — لا توجد قائمة محفوظة، نعتبر القراءة جاهزة بقائمة فارغة
      // عشان الإشعار يظهر للزوار وللحسابات اللي لسه ما سجلتش.
      setDismissedIds(new Set());
      setDismissedReady(true);
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
        setDismissedReady(true);
      },
      () => {
        // فشل القراءة (مثلاً صلاحيات مش متاحة) — نعتبر لا شيء مغلق ونكمّل.
        setDismissedIds(new Set());
        setDismissedReady(true);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  /**
   * احتساب البثّ النشط بعد دمج القائمتين (متاح + غير مُغلق من المستخدم).
   * مُحصّن مزدوج: الإشعار يُعتبر مُغلقاً لو موجود في Firestore أو في localStorage
   * (يضمن استمرار احترام الإغلاقات القديمة + يعمل حتى قبل نشر قواعد Firestore).
   *
   * ننتظر اكتمال تحميل dismissedReady قبل عرض الإشعار. ده يمنع الـ flash اللي
   * بيحصل لما الإشعار يظهر للحظة ثم يختفي بعد ما القائمة توصل بأنه مغلق.
   */
  useEffect(() => {
    if (!dismissedReady) return;
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
  }, [broadcasts, dismissedIds, audience, normalizedScopeIds, dismissedReady]);

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
      <div className="rounded-2xl border border-brand-200 bg-white shadow-[0_24px_52px_-30px_rgba(2,6,23,0.82)] px-4 py-3 sm:px-5 sm:py-4">
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
