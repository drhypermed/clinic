import { useEffect, useMemo, useState } from 'react';
import { getPremiumTimingSnapshot } from '../utils/accountStatusTime';
import { useTrustedNow } from './useTrustedNow';
import {
  getUserProfileDocRef,
} from '../services/firestore/profileRoles';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';

/** هيكل بيانات تحذير انتهاء الصلاحية */
interface ExpiryWarning {
  show: boolean;                 // هل يجب إظهار شريط التحذير في واجهة التطبيق؟
  expiryDate: Date | null;        // تاريخ الانتهاء الدقيق
  remainingPercentage: number;   // النسبة المئوية المتبقية من الاشتراك
  isPro: boolean;                // هل الحساب مدفوع (برو أو برو ماكس) حالياً؟
  /** الفئة الفعلية النشطة دلوقتي — null لو الحساب مجاني/منتهي */
  tier: 'pro' | 'pro_max' | null;
  isExpired: boolean;            // هل انتهى الاشتراك بالفعل؟
}

const PREMIUM_WARNING_THRESHOLD_PERCENT = 5;

/**
 * Hook مراقب انتهاء الاشتراك (usePremiumExpiryCheck):
 * يقوم بمتابعة صلاحية اشتراك الطبيب برو (Pro) وحساب المدة المنقضية.
 * الهدف: تنبيه الطبيب عندما يصبح المتبقي أقل من أو يساوي 5% من إجمالي مدة الاشتراك.
 */
export const usePremiumExpiryCheck = (user: { uid?: string } | null) => {
  const [accountData, setAccountData] = useState<Record<string, unknown> | null>(null);
  // الاشتراك ينتهي بالأيام وليس الثواني، 5 دقائق كافية لإعادة حساب نسبة المتبقي
  const { nowMs, isSynchronized } = useTrustedNow({ tickMs: 5 * 60 * 1000, syncIntervalMs: 30 * 60 * 1000 });

  const defaultWarning = useMemo<ExpiryWarning>(() => ({
    show: false,
    expiryDate: null,
    remainingPercentage: 100,
    isPro: false,
    tier: null,
    isExpired: false,
  }), []);

  useEffect(() => {
    if (!user?.uid) {
      setAccountData(null);
      return;
    }

    // حالة الاشتراك بتتغير مرة في الشهر — كاش يكفي بدل مراقبة مستمرة
    let cancelled = false;

    getDocCacheFirst(getUserProfileDocRef(user.uid))
      .then((docSnap) => {
        if (cancelled) return;
        setAccountData(docSnap.exists() ? (docSnap.data() as Record<string, unknown>) : null);
      })
      .catch((error) => {
        if (cancelled) return;
        const code = String((error as { code?: unknown })?.code || '');
        if (code === 'permission-denied') {
          setAccountData(null);
          return;
        }
        console.error('Error monitoring user premium expiry:', error);
      });

    return () => { cancelled = true; };
  }, [user?.uid]);

  return useMemo<ExpiryWarning>(() => {
    if (!accountData) return defaultWarning;

    // برو وبرو ماكس الاتنين يحسبوا Pro لأغراض تنبيه الانتهاء
    const rawAccountType: 'paid' | 'free' =
      accountData.accountType === 'premium' || accountData.accountType === 'pro_max'
        ? 'paid'
        : 'free';
    const snapshot = getPremiumTimingSnapshot(accountData, nowMs);
    const knownExpiryDate = snapshot.knownExpiryMs !== null ? new Date(snapshot.knownExpiryMs) : null;

    // الفئة الفعلية من raw accountType (قبل فحص الانتهاء) — للحالة المؤقتة قبل sync
    const rawTier: 'pro' | 'pro_max' | null =
      accountData.accountType === 'pro_max' ? 'pro_max'
      : accountData.accountType === 'premium' ? 'pro'
      : null;

    if (!isSynchronized) {
      return {
        show: false,
        expiryDate: knownExpiryDate,
        remainingPercentage: rawAccountType === 'paid' ? 100 : 0,
        isPro: rawAccountType === 'paid',
        tier: rawTier,
        isExpired: false,
      };
    }

    // effectiveAccountType ممكن يكون premium أو pro_max (الاتنين مدفوع). free = مجاني.
    const effectiveTier: 'pro' | 'pro_max' | null =
      snapshot.effectiveAccountType === 'pro_max' ? 'pro_max'
      : snapshot.effectiveAccountType === 'premium' ? 'pro'
      : null;
    if (!effectiveTier) {
      return {
        show: false,
        expiryDate: knownExpiryDate,
        remainingPercentage: snapshot.isExpired ? 0 : 100,
        isPro: false,
        tier: null,
        isExpired: snapshot.isExpired,
      };
    }

    if (
      snapshot.premiumStartMs === null ||
      snapshot.premiumExpiryMs === null ||
      snapshot.premiumStartMs >= snapshot.premiumExpiryMs
    ) {
      return {
        show: false,
        expiryDate: knownExpiryDate,
        remainingPercentage: 100,
        isPro: true,
        tier: effectiveTier,
        isExpired: false,
      };
    }

    const totalMs = snapshot.premiumExpiryMs - snapshot.premiumStartMs;
    const remainingMs = Math.max(0, snapshot.premiumExpiryMs - nowMs);
    const remainingPercentage = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));

    return {
      show: remainingPercentage <= PREMIUM_WARNING_THRESHOLD_PERCENT,
      expiryDate: new Date(snapshot.premiumExpiryMs),
      remainingPercentage,
      isPro: true,
      tier: effectiveTier,
      isExpired: false,
    };
  }, [accountData, defaultWarning, isSynchronized, nowMs]);
};
