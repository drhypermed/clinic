// ─────────────────────────────────────────────────────────────────────────────
// حاسبة إيرادات الاشتراكات (Revenue Calculator)
// ─────────────────────────────────────────────────────────────────────────────
// دالة نقية (Pure Function) بتحسب إيراد شهري بناء على:
//   - قائمة الأطباء المدفوعين (برو وبرو ماكس) في النظام
//   - أسعار كل شهر من أشهر السنة المختارة (بسعر منفصل لكل فئة)
//   - السنة المحددة للحساب
//
// كيف بيتحسب الإيراد:
//   - لكل طبيب مدفوع له premiumStartDate و premiumExpiryDate:
//     * نحسب فرق الشهور بين البداية والنهاية.
//     * لو >= 12 شهر: اشتراك سنوي (yearly).
//     * لو >= 6 شهور: اشتراك نصف سنوي (sixMonths).
//     * غير كده: اشتراك شهري (monthly).
//   - لـ برو: نجيب السعر من prices (monthly/sixMonths/yearly).
//   - لـ برو ماكس: نجيب السعر من proMaxPrices (monthly/sixMonths/yearly)
//     — مع fallback لأسعار برو لو الأدمن ما ضبطش proMaxPrices.
//
// حالات الاستبعاد:
//   - لو ما فيش premiumStartDate — تجاهل
//   - لو ما فيش premiumExpiryDate — نعدّه كـ "missing" ونحذّر الأدمن
//   - لو ما فيش سعر للشهر ده — تجاهل الطبيب من الإيراد
// ─────────────────────────────────────────────────────────────────────────────

import type { ProMaxSubscriptionPrices, RevenueData, SubscriptionPrices } from './types';

interface CombinedMonthPrices {
  prices: SubscriptionPrices;
  proMaxPrices?: ProMaxSubscriptionPrices;
}

export interface RevenueCalculationInput {
  /** قائمة الأطباء في Firestore (الفلترة لمدفوع تتم داخل الدالة) */
  doctors: Record<string, any>[];
  /**
   * خريطة أسعار الاشتراكات لكل شهر (مفتاح: "YYYY-MM")
   * يمكن تكون SubscriptionPrices (نمط قديم — برو فقط) أو CombinedMonthPrices (نمط جديد — برو + برو ماكس)
   */
  pricesByMonth: Record<string, SubscriptionPrices | CombinedMonthPrices>;
  /** السنة المراد حساب الإيراد لها */
  selectedYear: number;
}

export interface RevenueCalculationResult {
  /** مصفوفة ثابتة طولها 12 — إيراد كل شهر في السنة (حتى لو صفر) */
  revenueData: RevenueData[];
  /** عدد أطباء مدفوعين في السنة ببيانات ناقصة (premiumExpiryDate مفقود) */
  doctorsMissingExpiry: number;
}

/** helper: نطبّع الـ pricesByMonth entry للشكل الموحد (مع دعم النمط القديم والجديد) */
const normalizePriceEntry = (raw: SubscriptionPrices | CombinedMonthPrices | undefined):
  { prices: SubscriptionPrices; proMaxPrices: ProMaxSubscriptionPrices | null } | null => {
  if (!raw) return null;
  // لو القيمة SubscriptionPrices قديمة (مباشرة monthly/sixMonths/yearly)
  if ('monthly' in raw && 'sixMonths' in raw && 'yearly' in raw && !('prices' in raw)) {
    return { prices: raw as SubscriptionPrices, proMaxPrices: null };
  }
  // القيمة الجديدة (مع .prices و .proMaxPrices)
  const combined = raw as CombinedMonthPrices;
  return {
    prices: combined.prices,
    proMaxPrices: combined.proMaxPrices || null,
  };
};

/** helper: نختار السعر الصحيح حسب الفئة + المدة (مع fallback من pro_max لـ premium) */
const pickPrice = (
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

/**
 * الحساب الأساسي للإيراد من قائمة الأطباء + أسعار الشهور.
 * لا يلمس Firestore ولا الـ state — ممكن نستخدمه في اختبارات أو حساب offline.
 */
export const computeRevenueFromDoctors = (
  input: RevenueCalculationInput
): RevenueCalculationResult => {
  const { doctors, pricesByMonth, selectedYear } = input;

  // فلترة الأطباء المدفوعين (برو أو برو ماكس)
  const paidDoctors = doctors.filter(
    (item) => item?.accountType === 'premium' || item?.accountType === 'pro_max'
  );

  // خريطة الإيراد لكل شهر (نبنيها ثم نحولها لمصفوفة مرتبة)
  const monthlyRevenue: Record<
    string,
    {
      revenue: number;
      proMaxRevenue: number;
      monthlyCount: number;
      sixMonthsCount: number;
      yearlyCount: number;
      proMaxMonthlyCount: number;
      proMaxSixMonthsCount: number;
      proMaxYearlyCount: number;
    }
  > = {};

  let missingExpiryInYear = 0;

  paidDoctors.forEach((data) => {
    if (!data.premiumStartDate) return;

    const startDate = new Date(data.premiumStartDate);
    const yearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

    // لو السنة مش المطلوبة — تجاهل
    if (startDate.getFullYear() !== selectedYear) return;

    // premiumExpiryDate مفقود = نحصي الحالة ونتجاوز الطبيب
    if (!data.premiumExpiryDate) {
      missingExpiryInYear += 1;
      return;
    }

    if (!monthlyRevenue[yearMonth]) {
      monthlyRevenue[yearMonth] = {
        revenue: 0,
        proMaxRevenue: 0,
        monthlyCount: 0,
        sixMonthsCount: 0,
        yearlyCount: 0,
        proMaxMonthlyCount: 0,
        proMaxSixMonthsCount: 0,
        proMaxYearlyCount: 0,
      };
    }

    const priceEntry = normalizePriceEntry(pricesByMonth[yearMonth]);
    if (!priceEntry) return; // تخطي في حال عدم وجود أسعار لهذا الشهر

    // حساب فرق الشهور بين البداية والنهاية
    const endDate = new Date(data.premiumExpiryDate);
    const rawMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth();
    const diffMonths = endDate.getDate() >= startDate.getDate() ? rawMonths : rawMonths - 1;

    const isProMax = data.accountType === 'pro_max';
    const tier: 'premium' | 'pro_max' = isProMax ? 'pro_max' : 'premium';
    const duration: 'monthly' | 'sixMonths' | 'yearly' =
      diffMonths >= 12 ? 'yearly' : diffMonths >= 6 ? 'sixMonths' : 'monthly';

    const price = pickPrice(tier, duration, priceEntry.prices, priceEntry.proMaxPrices);
    const bucket = monthlyRevenue[yearMonth];
    bucket.revenue += price;

    // عد منفصل لكل فئة × مدة
    if (isProMax) {
      bucket.proMaxRevenue += price;
      if (duration === 'yearly') bucket.proMaxYearlyCount += 1;
      else if (duration === 'sixMonths') bucket.proMaxSixMonthsCount += 1;
      else bucket.proMaxMonthlyCount += 1;
    } else {
      if (duration === 'yearly') bucket.yearlyCount += 1;
      else if (duration === 'sixMonths') bucket.sixMonthsCount += 1;
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

  return { revenueData, doctorsMissingExpiry: missingExpiryInYear };
};
