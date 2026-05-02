import { useEffect, useMemo, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useTrustedNow } from './useTrustedNow';
import { getUserProfileDocRef } from '../services/firestore/profileRoles';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';
import { ROOT_ADMIN_UID } from '../app/drug-catalog/admin';
import { db } from '../services/firebaseConfig';

/**
 * Hook تحذير انتهاء المدة المجانية (useInactivityWarning):
 *
 * ─── المنطق الصحيح (2026-05) ───
 * المجاني = "اشتراك تجريبي مدته 3 شهور" — مش بناءً على الخمول.
 * كل طبيب مجاني عنده `freeAccountExpiryDate` بيتم تعيينه عند الاعتماد
 * أو التحويل للمجاني. بعد التاريخ ده، الحساب يتعطل تلقائياً.
 *
 * الـ hook ده بيحسب الأيام المتبقية من الـ freeAccountExpiryDate ويعرض
 * warning للطبيب لو الـ window 30 يوم أو أقل.
 *
 * ─── الفئات ───
 * • مجاني (free) فقط → الـ warning يظهر
 * • برو/برو ماكس → لا يظهر (الباقات المدفوعة محمية، عندها premiumExpiryDate)
 * • الأدمن → لا يظهر
 *
 * ─── الفرق عن usePremiumExpiryCheck ───
 * usePremiumExpiryCheck = تنبيه قبل انتهاء الاشتراك المدفوع (للبرو/برو ماكس)
 * useInactivityWarning  = تنبيه قبل انتهاء المدة المجانية (للمجاني فقط)
 */

export interface InactivityWarning {
  /** هل نعرض شريط التحذير؟ */
  show: boolean;
  /** الأيام المتبقية قبل التعطيل التلقائي (0 لو متعطل بالفعل) */
  daysRemaining: number;
  /** تاريخ التعطيل المتوقع */
  expectedDisableDate: Date | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WARNING_WINDOW_DAYS = 30; // قبل كم يوم نبدأ نعرض الـ warning

const defaultWarning: InactivityWarning = {
  show: false,
  daysRemaining: 0,
  expectedDisableDate: null,
};

export const useInactivityWarning = (
  user: { uid?: string; email?: string | null } | null,
): InactivityWarning => {
  const [accountData, setAccountData] = useState<Record<string, unknown> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { nowMs } = useTrustedNow({ tickMs: 60 * 60 * 1000, syncIntervalMs: 6 * 60 * 60 * 1000 });

  useEffect(() => {
    if (!user?.uid) {
      setAccountData(null);
      return;
    }

    let cancelled = false;
    getDocCacheFirst(getUserProfileDocRef(user.uid))
      .then((docSnap) => {
        if (cancelled) return;
        setAccountData(docSnap.exists() ? (docSnap.data() as Record<string, unknown>) : null);
      })
      .catch(() => { if (!cancelled) setAccountData(null); });

    return () => { cancelled = true; };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) { setIsAdmin(false); return; }
    if (user.uid === ROOT_ADMIN_UID) { setIsAdmin(true); return; }
    let cancelled = false;
    const normalizedEmail = (user.email || '').trim().toLowerCase();
    if (!normalizedEmail) { setIsAdmin(false); return; }
    getDocCacheFirst(doc(db, 'admins', normalizedEmail))
      .then((snap) => { if (!cancelled) setIsAdmin(snap.exists()); })
      .catch(() => { if (!cancelled) setIsAdmin(false); });
    return () => { cancelled = true; };
  }, [user?.uid, user?.email]);

  return useMemo<InactivityWarning>(() => {
    if (isAdmin) return defaultWarning;
    if (!accountData) return defaultWarning;

    // الـ warning للمجاني فقط — الباقات المدفوعة عندها expiry warning مختلف
    const accountType = String(accountData.accountType || 'free').trim().toLowerCase();
    if (accountType !== 'free') return defaultWarning;

    // قراءة freeAccountExpiryDate (تاريخ انتهاء المدة المجانية)
    const expiryStr = typeof accountData.freeAccountExpiryDate === 'string'
      ? accountData.freeAccountExpiryDate
      : '';
    if (!expiryStr) return defaultWarning;

    const expiryMs = Date.parse(expiryStr);
    if (!Number.isFinite(expiryMs) || expiryMs <= 0) return defaultWarning;

    // الأيام المتبقية حتى انتهاء المدة المجانية
    const daysRemaining = Math.ceil((expiryMs - nowMs) / DAY_MS);

    // الـ warning يظهر فقط لو لسه ما انتهتش + في الـ window 30 يوم
    if (daysRemaining <= 0 || daysRemaining > WARNING_WINDOW_DAYS) return defaultWarning;

    return {
      show: true,
      daysRemaining,
      expectedDisableDate: new Date(expiryMs),
    };
  }, [accountData, isAdmin, nowMs]);
};
