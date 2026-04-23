/**
 * الملف: types.ts
 * الوصف: "هيكل البيانات المالية". 
 * يحدد القواعد البرمجية والأنواع المستخدمة في إدارة الحسابات والماليات: 
 * - FinancialData: يمثل إجمالي الإيرادات والمصروفات والأرباح. 
 * - RevenueRecord: هيكل سجل الدخل الفردي (الاشتراكات). 
 * - ExpenseRecord: هيكل سجل المصروفات (التشغيل، الرواتب، الخدمات). 
 * - FinancialView: تحديد نوع العرض الحالي (شهري أو سنوي).
 * تحدد هياكل البيانات للإيرادات، المصروفات، أسعار الاشتراكات، والحالات المالية.
 */

/** أسعار باقة برو (premium) — 3 مدد */
export interface SubscriptionPrices {
  monthly: number;
  sixMonths: number;
  yearly: number;
}

/** أسعار باقة برو ماكس (pro_max) — نفس المدد بس مفصولة */
export interface ProMaxSubscriptionPrices {
  monthly: number;
  sixMonths: number;
  yearly: number;
}

export interface MonthlyPrices {
  month: string;
  prices: SubscriptionPrices;
  /** أسعار برو ماكس — optional عشان الشهور القديمة ما تكسرش */
  proMaxPrices?: ProMaxSubscriptionPrices;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
  description: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  monthlyCount: number;
  sixMonthsCount: number;
  yearlyCount: number;
  // عدادات برو ماكس منفصلة — لكل مدة
  proMaxMonthlyCount?: number;
  proMaxSixMonthsCount?: number;
  proMaxYearlyCount?: number;
  /** إيرادات برو ماكس منفصلة — للعرض المفصّل */
  proMaxRevenue?: number;
}

export interface NewExpenseInput {
  month: string;
  amount: number;
  description: string;
}

export type FinancialViewMode = 'monthly' | 'yearly';

export interface Totals {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface YearlyStats extends Totals {
  monthlyCount: number;
  sixMonthsCount: number;
  yearlyCount: number;
  // عدادات برو ماكس منفصلة
  proMaxMonthlyCount?: number;
  proMaxSixMonthsCount?: number;
  proMaxYearlyCount?: number;
  proMaxRevenue?: number;
}
