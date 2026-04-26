/**
 * ملف: subscriptionPricing.ts
 *
 * يحسب سعر الاشتراك/التمديد لحظة التنفيذ بناءً على:
 *   - مدة الاشتراك بالشهور (تحدد planType: monthly/sixMonths/yearly)
 *   - فئة الباقة (premium / pro_max)
 *   - أسعار الشهر اللي بتتم فيه العملية (من collection subscriptionPrices)
 *
 * الفائدة: نحفظ السعر الفعلي مع كل entry في subscriptionHistory، بحيث الإيراد
 * التاريخي يفضل ثابت حتى لو الأسعار تغيرت بعدين أو الطبيب جدد اشتراكه.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import type {
  SubscriptionPlanType,
  SubscriptionTier,
} from './types';

/**
 * يحدد planType بناءً على المدة بالشهور، طبقاً لنفس قواعد revenueCalculator:
 *   - ١٢ شهر فأكثر → سنوي
 *   - ٦-١١ شهر    → نص سنوي
 *   - أقل من ٦    → شهري
 */
export const derivePlanTypeFromDuration = (durationMonths: number): SubscriptionPlanType => {
  if (durationMonths >= 12) return 'yearly';
  if (durationMonths >= 6) return 'sixMonths';
  return 'monthly';
};

/** يحسب فرق الشهور بين تاريخين بنفس قواعد revenueCalculator (لتطابق الحساب). */
export const computeDurationMonths = (startDate: Date, endDate: Date): number => {
  const rawMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();
  return endDate.getDate() >= startDate.getDate() ? rawMonths : rawMonths - 1;
};

/** يحول التاريخ لمعرف شهر بصيغة YYYY-MM. */
const toMonthDocId = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

interface MonthPricesRaw {
  monthly?: number;
  sixMonths?: number;
  yearly?: number;
  proMaxPrices?: {
    monthly?: number;
    sixMonths?: number;
    yearly?: number;
  };
}

const toSafePrice = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
};

/**
 * يجلب سعر الاشتراك من جدول الأسعار الشهري.
 * يرجّع 0 لو الأسعار مش متاحة لهذا الشهر — الـ caller يقدر يقرر إيه يعمل
 * (مثلاً ما يحفظش pricePaid في حالة 0).
 */
export const fetchSubscriptionPrice = async (params: {
  /** تاريخ بداية فترة الاشتراك (يحدد شهر الأسعار). */
  startDate: Date;
  /** فئة الباقة. */
  tier: SubscriptionTier;
  /** نوع المدة. */
  planType: SubscriptionPlanType;
}): Promise<{ price: number; source: 'pricing_table' | 'unknown' }> => {
  const monthDocId = toMonthDocId(params.startDate);

  try {
    const snap = await getDoc(doc(db, 'subscriptionPrices', monthDocId));
    if (!snap.exists()) return { price: 0, source: 'unknown' };

    const raw = snap.data() as MonthPricesRaw;

    // برو ماكس: نحاول من proMaxPrices الأول، fallback على أسعار برو لو ما اتحطتش.
    if (params.tier === 'pro_max') {
      const proMaxPrice = toSafePrice(raw.proMaxPrices?.[params.planType]);
      if (proMaxPrice > 0) return { price: proMaxPrice, source: 'pricing_table' };
    }

    const price = toSafePrice(raw[params.planType]);
    return { price, source: price > 0 ? 'pricing_table' : 'unknown' };
  } catch (error) {
    console.warn('[fetchSubscriptionPrice] Failed to load price:', error);
    return { price: 0, source: 'unknown' };
  }
};

/**
 * يحسب السعر التقديري + المعلومات المرتبطة (planType, durationMonths) لحظة العملية.
 * يستخدمها كل من handleUpdateAccountType و handleExtendSubscription و handleUpdateSubscriptionDates.
 */
export const computePeriodPricing = async (params: {
  startDate: Date;
  endDate: Date;
  tier: SubscriptionTier;
}): Promise<{
  durationMonths: number;
  planType: SubscriptionPlanType;
  pricePaid: number;
  priceSource: 'pricing_table' | 'unknown';
}> => {
  const durationMonths = Math.max(0, computeDurationMonths(params.startDate, params.endDate));
  const planType = derivePlanTypeFromDuration(durationMonths);
  const { price, source } = await fetchSubscriptionPrice({
    startDate: params.startDate,
    tier: params.tier,
    planType,
  });

  return {
    durationMonths,
    planType,
    pricePaid: price,
    priceSource: source,
  };
};
