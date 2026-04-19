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

export interface SubscriptionPrices {
  monthly: number;
  sixMonths: number;
  yearly: number;
}

export interface MonthlyPrices {
  month: string;
  prices: SubscriptionPrices;
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
}
