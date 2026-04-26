// ─────────────────────────────────────────────────────────────────────────────
// حاسبة إيرادات الاشتراكات (Revenue Calculator)
// ─────────────────────────────────────────────────────────────────────────────
// دالة نقية (Pure Function) بتحسب إيراد شهري بناء على:
//   - قائمة الأطباء المدفوعين (برو وبرو ماكس) — كل طبيب فيه subscriptionHistory[]
//   - أسعار كل شهر من أشهر السنة المختارة (للـ fallback لو الـ entry مفيهوش pricePaid)
//   - السنة المحددة للحساب
//
// المنطق الجديد بعد إصلاح "السعر التاريخي":
//   - نقرأ subscriptionHistory[] لكل طبيب
//   - كل entry فيه startDate + endDate + (اختيارياً) pricePaid + tier + planType
//   - نضيف pricePaid لشهر startDate.getFullYear()-getMonth()
//   - لو الـ entry قديم ومفيهوش pricePaid (entries قبل الإصلاح):
//     * نحسب المدة بالشهور
//     * نختار planType حسب المدة
//     * نجيب السعر من pricesByMonth للشهر اللي ابتدت فيه الفترة
//
// مزايا هذا المنطق:
//   - الأرقام التاريخية ثابتة حتى لو الأسعار اتغيرت
//   - كل تمديد/تجديد يُحسب بسعره وقت التنفيذ، مش وقت العرض
//   - Backward-compatible مع الـ entries القديمة
// ─────────────────────────────────────────────────────────────────────────────

import type { ProMaxSubscriptionPrices, RevenueData, SubscriptionPrices } from './types';

interface CombinedMonthPrices {
  prices: SubscriptionPrices;
  proMaxPrices?: ProMaxSubscriptionPrices;
}

/** entry واحد في subscriptionHistory الخاص بالطبيب. */
interface SubscriptionPeriodLike {
  startDate?: string;
  endDate?: string;
  tier?: 'premium' | 'pro_max';
  planType?: 'monthly' | 'sixMonths' | 'yearly';
  durationMonths?: number;
  pricePaid?: number;
  changeType?: string;
}

interface RevenueCalculationInput {
  /** قائمة الأطباء في Firestore (الفلترة لمدفوع تتم داخل الدالة) */
  doctors: Record<string, any>[];
  /**
   * خريطة أسعار الاشتراكات لكل شهر (مفتاح: "YYYY-MM") — تُستخدم كـ fallback
   * فقط عند غياب pricePaid في الـ entry (entries قبل إصلاح حفظ السعر).
   */
  pricesByMonth: Record<string, SubscriptionPrices | CombinedMonthPrices>;
  /** السنة المراد حساب الإيراد لها */
  selectedYear: number;
}

interface RevenueCalculationResult {
  /** مصفوفة ثابتة طولها 12 — إيراد كل شهر في السنة (حتى لو صفر) */
  revenueData: RevenueData[];
  /** عدد أطباء مدفوعين في السنة ببيانات ناقصة (entries بدون startDate) */
  doctorsMissingExpiry: number;
}

/** نطبّع الـ pricesByMonth entry للشكل الموحد (مع دعم النمط القديم والجديد). */
const normalizePriceEntry = (
  raw: SubscriptionPrices | CombinedMonthPrices | undefined,
):
  | { prices: SubscriptionPrices; proMaxPrices: ProMaxSubscriptionPrices | null }
  | null => {
  if (!raw) return null;
  if ('monthly' in raw && 'sixMonths' in raw && 'yearly' in raw && !('prices' in raw)) {
    return { prices: raw as SubscriptionPrices, proMaxPrices: null };
  }
  const combined = raw as CombinedMonthPrices;
  return {
    prices: combined.prices,
    proMaxPrices: combined.proMaxPrices || null,
  };
};

/** يختار السعر الصحيح حسب الفئة + المدة (مع fallback من pro_max لـ premium). */
const pickFallbackPrice = (
  tier: 'premium' | 'pro_max',
  duration: 'monthly' | 'sixMonths' | 'yearly',
  prices: SubscriptionPrices,
  proMaxPrices: ProMaxSubscriptionPrices | null,
): number => {
  if (tier === 'pro_max' && proMaxPrices) {
    const v = proMaxPrices[duration];
    if (typeof v === 'number' && v > 0) return v;
  }
  return prices[duration] || 0;
};

/** يحسب فرق الشهور بين تاريخين بنفس قواعد subscriptionPricing.ts. */
const computeDurationMonths = (startDate: Date, endDate: Date): number => {
  const rawMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();
  return endDate.getDate() >= startDate.getDate() ? rawMonths : rawMonths - 1;
};

/** يستنتج planType من المدة بنفس قواعد derivePlanTypeFromDuration. */
const derivePlanType = (
  durationMonths: number,
): 'monthly' | 'sixMonths' | 'yearly' => {
  if (durationMonths >= 12) return 'yearly';
  if (durationMonths >= 6) return 'sixMonths';
  return 'monthly';
};

/**
 * يحسب السعر النهائي للـ entry — يستخدم pricePaid لو متاح، وإلا fallback على
 * أسعار الشهر من pricesByMonth.
 */
const resolveEntryPrice = (params: {
  entry: SubscriptionPeriodLike;
  doctorTier: 'premium' | 'pro_max';
  startDate: Date;
  pricesByMonth: Record<string, SubscriptionPrices | CombinedMonthPrices>;
}): { price: number; planType: 'monthly' | 'sixMonths' | 'yearly'; tier: 'premium' | 'pro_max' } => {
  const tier: 'premium' | 'pro_max' = params.entry.tier || params.doctorTier;

  // أولوية ١: pricePaid محفوظ في الـ entry (الإصلاح الجديد)
  if (
    typeof params.entry.pricePaid === 'number' &&
    Number.isFinite(params.entry.pricePaid) &&
    params.entry.pricePaid > 0
  ) {
    const planType =
      params.entry.planType ||
      derivePlanType(
        params.entry.durationMonths ||
          (params.entry.endDate
            ? computeDurationMonths(params.startDate, new Date(params.entry.endDate))
            : 0),
      );
    return { price: params.entry.pricePaid, planType, tier };
  }

  // أولوية ٢: حساب من جدول الأسعار للشهر (للـ entries القديمة)
  if (!params.entry.endDate) {
    return { price: 0, planType: 'monthly', tier };
  }
  const endDate = new Date(params.entry.endDate);
  if (Number.isNaN(endDate.getTime())) {
    return { price: 0, planType: 'monthly', tier };
  }
  const durationMonths = Math.max(0, computeDurationMonths(params.startDate, endDate));
  const planType: 'monthly' | 'sixMonths' | 'yearly' = derivePlanType(durationMonths);

  const yearMonth = `${params.startDate.getFullYear()}-${String(params.startDate.getMonth() + 1).padStart(2, '0')}`;
  const priceEntry = normalizePriceEntry(params.pricesByMonth[yearMonth]);
  if (!priceEntry) {
    return { price: 0, planType, tier };
  }

  const price = pickFallbackPrice(tier, planType, priceEntry.prices, priceEntry.proMaxPrices);
  return { price, planType, tier };
};

interface MonthlyBucket {
  revenue: number;
  proMaxRevenue: number;
  monthlyCount: number;
  sixMonthsCount: number;
  yearlyCount: number;
  proMaxMonthlyCount: number;
  proMaxSixMonthsCount: number;
  proMaxYearlyCount: number;
}

const emptyBucket = (): MonthlyBucket => ({
  revenue: 0,
  proMaxRevenue: 0,
  monthlyCount: 0,
  sixMonthsCount: 0,
  yearlyCount: 0,
  proMaxMonthlyCount: 0,
  proMaxSixMonthsCount: 0,
  proMaxYearlyCount: 0,
});

/**
 * الحساب الأساسي للإيراد من قائمة الأطباء + سجلات اشتراكاتهم.
 * لا يلمس Firestore ولا الـ state — ممكن نستخدمه في اختبارات أو حساب offline.
 */
export const computeRevenueFromDoctors = (
  input: RevenueCalculationInput,
): RevenueCalculationResult => {
  const { doctors, pricesByMonth, selectedYear } = input;

  // فلترة الأطباء اللي عندهم اشتراكات تاريخية أو حالية
  const candidateDoctors = doctors.filter((item) => {
    const accountType = String(item?.accountType || '');
    const hasHistory = Array.isArray(item?.subscriptionHistory) && item.subscriptionHistory.length > 0;
    return (
      accountType === 'premium' ||
      accountType === 'pro_max' ||
      hasHistory // حتى لو رجع free، اشتراكاته القديمة تتحسب
    );
  });

  const monthlyRevenue: Record<string, MonthlyBucket> = {};
  let missingStartDateInYear = 0;

  candidateDoctors.forEach((data) => {
    const doctorTier: 'premium' | 'pro_max' =
      data?.accountType === 'pro_max' ? 'pro_max' : 'premium';
    const history: SubscriptionPeriodLike[] = Array.isArray(data?.subscriptionHistory)
      ? data.subscriptionHistory
      : [];

    if (history.length > 0) {
      // المسار الجديد: نقرأ من السجل التاريخي
      history.forEach((entry) => {
        if (!entry?.startDate) {
          missingStartDateInYear += 1;
          return;
        }
        const entryStart = new Date(entry.startDate);
        if (Number.isNaN(entryStart.getTime())) return;
        if (entryStart.getFullYear() !== selectedYear) return;

        const yearMonth = `${entryStart.getFullYear()}-${String(entryStart.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyRevenue[yearMonth]) {
          monthlyRevenue[yearMonth] = emptyBucket();
        }

        const { price, planType, tier } = resolveEntryPrice({
          entry,
          doctorTier,
          startDate: entryStart,
          pricesByMonth,
        });

        if (price <= 0) return; // ما عرفناش السعر — نتخطى عشان ما نضيفش رقم خاطئ

        const bucket = monthlyRevenue[yearMonth];
        bucket.revenue += price;

        const isProMax = tier === 'pro_max';
        if (isProMax) {
          bucket.proMaxRevenue += price;
          if (planType === 'yearly') bucket.proMaxYearlyCount += 1;
          else if (planType === 'sixMonths') bucket.proMaxSixMonthsCount += 1;
          else bucket.proMaxMonthlyCount += 1;
        } else {
          if (planType === 'yearly') bucket.yearlyCount += 1;
          else if (planType === 'sixMonths') bucket.sixMonthsCount += 1;
          else bucket.monthlyCount += 1;
        }
      });
      return;
    }

    // ── المسار القديم (Backward-compat): طبيب بدون subscriptionHistory ──
    // قبل إصلاح السجل التاريخي. نستخدم premiumStartDate/premiumExpiryDate.
    if (!data.premiumStartDate) return;
    const startDate = new Date(data.premiumStartDate);
    if (Number.isNaN(startDate.getTime())) return;
    if (startDate.getFullYear() !== selectedYear) return;

    if (!data.premiumExpiryDate) {
      missingStartDateInYear += 1;
      return;
    }

    const yearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyRevenue[yearMonth]) {
      monthlyRevenue[yearMonth] = emptyBucket();
    }

    const { price, planType, tier } = resolveEntryPrice({
      entry: {
        startDate: data.premiumStartDate,
        endDate: data.premiumExpiryDate,
        tier: doctorTier,
      },
      doctorTier,
      startDate,
      pricesByMonth,
    });

    if (price <= 0) return;

    const bucket = monthlyRevenue[yearMonth];
    bucket.revenue += price;
    const isProMax = tier === 'pro_max';
    if (isProMax) {
      bucket.proMaxRevenue += price;
      if (planType === 'yearly') bucket.proMaxYearlyCount += 1;
      else if (planType === 'sixMonths') bucket.proMaxSixMonthsCount += 1;
      else bucket.proMaxMonthlyCount += 1;
    } else {
      if (planType === 'yearly') bucket.yearlyCount += 1;
      else if (planType === 'sixMonths') bucket.sixMonthsCount += 1;
      else bucket.monthlyCount += 1;
    }
  });

  // تحويل لمصفوفة ثابتة طولها 12 شهر
  const revenueData: RevenueData[] = [];
  for (let month = 1; month <= 12; month += 1) {
    const monthStr = `${selectedYear}-${String(month).padStart(2, '0')}`;
    const bucket = monthlyRevenue[monthStr];
    revenueData.push({
      month: monthStr,
      revenue: bucket?.revenue || 0,
      monthlyCount: bucket?.monthlyCount || 0,
      sixMonthsCount: bucket?.sixMonthsCount || 0,
      yearlyCount: bucket?.yearlyCount || 0,
      proMaxMonthlyCount: bucket?.proMaxMonthlyCount || 0,
      proMaxSixMonthsCount: bucket?.proMaxSixMonthsCount || 0,
      proMaxYearlyCount: bucket?.proMaxYearlyCount || 0,
      proMaxRevenue: bucket?.proMaxRevenue || 0,
    });
  }

  return { revenueData, doctorsMissingExpiry: missingStartDateInYear };
};
