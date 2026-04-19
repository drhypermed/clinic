// ─────────────────────────────────────────────────────────────────────────────
// حاسبة إيرادات الاشتراكات (Revenue Calculator)
// ─────────────────────────────────────────────────────────────────────────────
// دالة نقية (Pure Function) بتحسب إيراد شهري بناء على:
//   - قائمة الأطباء Premium في النظام
//   - أسعار كل شهر من أشهر السنة المختارة
//   - السنة المحددة للحساب
//
// ليه دالة منفصلة ونقية؟
//   1) سهلة الاختبار (ممكن نكتب unit tests لها بدون Firebase).
//   2) فصل المنطق عن تحميل البيانات (hook) وعن العرض (component).
//   3) لو غيّرنا خوارزمية الحساب نعدل مكان واحد.
//
// كيف بيتحسب الإيراد:
//   - لكل طبيب Premium له premiumStartDate و premiumExpiryDate:
//     * نحسب فرق الشهور بين البداية والنهاية.
//     * لو >= 12 شهر: اشتراك سنوي (yearly).
//     * لو >= 6 شهور: اشتراك نصف سنوي (sixMonths).
//     * غير كده: اشتراك شهري (monthly).
//   - نجيب السعر من prices لشهر البداية ونجمعه على شهر البداية.
//
// حالات الاستبعاد:
//   - لو ما فيش premiumStartDate — تجاهل
//   - لو ما فيش premiumExpiryDate — نعدّه كـ "missing" ونحذّر الأدمن
//   - لو ما فيش سعر للشهر ده — تجاهل الطبيب من الإيراد
// ─────────────────────────────────────────────────────────────────────────────

import type { RevenueData, SubscriptionPrices } from './types';

export interface RevenueCalculationInput {
  /** قائمة الأطباء في Firestore (الفلترة لـ Premium تتم داخل الدالة) */
  doctors: Record<string, any>[];
  /** خريطة أسعار الاشتراكات لكل شهر (مفتاح: "YYYY-MM") */
  pricesByMonth: Record<string, SubscriptionPrices>;
  /** السنة المراد حساب الإيراد لها */
  selectedYear: number;
}

export interface RevenueCalculationResult {
  /** مصفوفة ثابتة طولها 12 — إيراد كل شهر في السنة (حتى لو صفر) */
  revenueData: RevenueData[];
  /** عدد أطباء Premium في السنة ببيانات ناقصة (premiumExpiryDate مفقود) */
  doctorsMissingExpiry: number;
}

/**
 * الحساب الأساسي للإيراد من قائمة الأطباء + أسعار الشهور.
 * لا يلمس Firestore ولا الـ state — ممكن نستخدمه في اختبارات أو حساب offline.
 */
export const computeRevenueFromDoctors = (
  input: RevenueCalculationInput
): RevenueCalculationResult => {
  const { doctors, pricesByMonth, selectedYear } = input;

  // فلترة الأطباء Premium فقط
  const premiumDoctors = doctors.filter((item) => item?.accountType === 'premium');

  // خريطة الإيراد لكل شهر (نبنيها ثم نحولها لمصفوفة مرتبة)
  const monthlyRevenue: Record<
    string,
    {
      revenue: number;
      monthlyCount: number;
      sixMonthsCount: number;
      yearlyCount: number;
    }
  > = {};

  let missingExpiryInYear = 0;

  premiumDoctors.forEach((data) => {
    if (!data.premiumStartDate) return;

    const startDate = new Date(data.premiumStartDate);
    const yearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

    // لو السنة مش المطلوبة — تجاهل
    if (startDate.getFullYear() !== selectedYear) return;

    // بدلاً من افتراض صامت بأنه شهري، نتجاوز الطبيب إذا كان premiumExpiryDate مفقوداً
    // ونُحصي الحالة لعرض تحذير واضح للأدمن.
    if (!data.premiumExpiryDate) {
      missingExpiryInYear += 1;
      return;
    }

    if (!monthlyRevenue[yearMonth]) {
      monthlyRevenue[yearMonth] = {
        revenue: 0,
        monthlyCount: 0,
        sixMonthsCount: 0,
        yearlyCount: 0,
      };
    }

    const monthPrices = pricesByMonth[yearMonth];
    if (!monthPrices) return; // تخطي في حال عدم وجود أسعار محددة لهذا الشهر

    // حساب فرق الشهور بين البداية والنهاية (مع مراعاة يوم الشهر)
    const endDate = new Date(data.premiumExpiryDate);
    const rawMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      endDate.getMonth() -
      startDate.getMonth();
    const diffMonths = endDate.getDate() >= startDate.getDate() ? rawMonths : rawMonths - 1;

    // تصنيف نوع الاشتراك بناءً على المدة
    if (diffMonths >= 12) {
      monthlyRevenue[yearMonth].revenue += monthPrices.yearly;
      monthlyRevenue[yearMonth].yearlyCount += 1;
    } else if (diffMonths >= 6) {
      monthlyRevenue[yearMonth].revenue += monthPrices.sixMonths;
      monthlyRevenue[yearMonth].sixMonthsCount += 1;
    } else {
      monthlyRevenue[yearMonth].revenue += monthPrices.monthly;
      monthlyRevenue[yearMonth].monthlyCount += 1;
    }
  });

  // تحويل الخريطة لمصفوفة ثابتة طولها 12 شهر (حتى لو بعضها صفر)
  const revenueData: RevenueData[] = [];
  for (let month = 1; month <= 12; month += 1) {
    const monthStr = `${selectedYear}-${String(month).padStart(2, '0')}`;
    revenueData.push({
      month: monthStr,
      revenue: monthlyRevenue[monthStr]?.revenue || 0,
      monthlyCount: monthlyRevenue[monthStr]?.monthlyCount || 0,
      sixMonthsCount: monthlyRevenue[monthStr]?.sixMonthsCount || 0,
      yearlyCount: monthlyRevenue[monthStr]?.yearlyCount || 0,
    });
  }

  return { revenueData, doctorsMissingExpiry: missingExpiryInYear };
};
