// ─────────────────────────────────────────────────────────────────────────────
// مساعدات مطالبات التأمين (Insurance Claims Helpers)
// ─────────────────────────────────────────────────────────────────────────────
// أنواع ودوال خالصة تستخدمها useInsuranceClaims لتجميع كشوفات التأمين:
//   - CompanyClaim: البنية الكاملة لمطالبة شركة واحدة (كشوفات + استشارات + extras)
//   - createEmptyClaim: ينشئ سجل مطالبة فارغ للشركة قبل التعبئة
//   - asTimestamp: تحويل آمن لتاريخ ISO إلى ms (مع fallback لـ NaN)
//   - readInsuranceExtrasForDay: قراءة extras من خريطة Firestore اليومية (IndexedDB cache)
// ─────────────────────────────────────────────────────────────────────────────

import type { DailyFinancialData } from '../../../services/financial-data';
import type { DailyInsuranceExtraEntry } from '../hooks/useFinancialData';

/** البنية الكاملة لمطالبة شركة تأمين واحدة داخل شهر أو فترة محددة. */
export interface CompanyClaim {
  companyName: string;
  /** عدد الكشوفات المؤمنة للشركة */
  examsCount: number;
  /** عدد الاستشارات المؤمنة للشركة */
  consultationsCount: number;
  /** حصة الشركة من الكشوفات (بعد خصم حصة المريض) */
  examsCompanyShare: number;
  /** حصة الشركة من الاستشارات */
  consultsCompanyShare: number;
  /** إجمالي عدد الحالات (كشوفات + استشارات) */
  totalCases: number;
  /** إجمالي المبلغ قبل خصم حصة المريض */
  totalBilled: number;
  /** إجمالي حصة الشركة (examsCompanyShare + consultsCompanyShare) */
  companyShare: number;

  /** كل الإضافات التأمينية (تداخلات + دخل آخر) */
  insuranceExtrasCount: number;
  insuranceExtrasTotal: number;

  /** التداخلات فقط */
  interventionsExtrasCount: number;
  interventionsExtrasTotal: number;

  /** الدخل الآخر فقط */
  otherExtrasCount: number;
  otherExtrasTotal: number;
}

/** تحويل تاريخ ISO إلى ms بشكل آمن (يرجع NaN لو التاريخ غلط). */
export const asTimestamp = (value?: string): number => {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : NaN;
};

/** ينشئ مطالبة فارغة لشركة — يستخدم قبل التعبئة من السجلات والـ extras. */
export const createEmptyClaim = (companyName: string): CompanyClaim => ({
  companyName,
  examsCount: 0,
  consultationsCount: 0,
  examsCompanyShare: 0,
  consultsCompanyShare: 0,
  totalCases: 0,
  totalBilled: 0,
  companyShare: 0,
  insuranceExtrasCount: 0,
  insuranceExtrasTotal: 0,
  interventionsExtrasCount: 0,
  interventionsExtrasTotal: 0,
  otherExtrasCount: 0,
  otherExtrasTotal: 0,
});

/**
 * قراءة extras ليوم معين من خريطة Firestore اليومية (الفرع مفلتر بالفعل
 * على مستوى الـ Firestore doc، فمش محتاجين re-filter).
 */
export const readInsuranceExtrasForDay = (
  dayKey: string,
  yearlyDailyMap: Record<string, DailyFinancialData>,
): DailyInsuranceExtraEntry[] => {
  const entry = yearlyDailyMap[dayKey];
  if (!entry || !Array.isArray(entry.insuranceExtras)) return [];
  return entry.insuranceExtras as DailyInsuranceExtraEntry[];
};

/**
 * إضافة يوم لتاريخ بشكل dateKey (YYYY-MM-DD) — يستخدم UTC لتفادي مشاكل DST.
 * بدون هذا، التحول بين الصيفي/الشتوي ممكن يخطي أو يكرر يوم.
 */
export const addDaysToKey = (dateKey: string, add: number): string => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  dt.setUTCDate(dt.getUTCDate() + add);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};
