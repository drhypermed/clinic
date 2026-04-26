/**
 * invoiceImportHelpers.ts — مساعدات استيراد بنود الفاتورة من التكاليف
 *
 * بيدمج التكاليف الكاش (تداخلات/دخل آخر) + مطالبات التأمين في قائمة موحدة
 * يقدر يستوردها مستخدم الفاتورة بضغطة. نفس فكرة useCostInvoiceSelection
 * بس خفيف ومستقل — مستخدم في PatientFileInvoiceSection.
 */

import type {
  PatientCostItem,
  PatientInsuranceItem,
} from '../../services/patientCostService';

// ─── Types ────────────────────────────────────────────────────────────────────

/** بند موحّد قابل للاستيراد إلى الفاتورة. */
export interface ImportableInvoiceItem {
  /** id فريد — نفس id العنصر الأصلي مع prefix يميّز نوعه */
  id: string;
  /** كاش أو تأمين */
  kind: 'cash' | 'insurance';
  /** التاريخ YYYY-MM-DD — نستخدمه للترتيب والتجميع */
  dateKey: string;
  /** الوصف اللي هيظهر في الفاتورة (تداخل/دخل آخر/تأمين شركة X) */
  label: string;
  /** المبلغ بالجنيه */
  amount: number;
}

// ─── Builders ─────────────────────────────────────────────────────────────────

/**
 * يحوّل عنصر تكلفة كاش لبند فاتورة موحّد.
 * نوع التكلفة (تداخل/دخل آخر) يظهر في الـ label عشان الطبيب يميّز.
 */
function cashToImportable(c: PatientCostItem): ImportableInvoiceItem {
  const typeLabel = c.type === 'interventions' ? 'تداخل' : 'دخل آخر';
  return {
    id: `cash_${c.id}`,
    kind: 'cash',
    dateKey: c.dateKey,
    label: c.note ? `${typeLabel} — ${c.note}` : typeLabel,
    amount: c.amount,
  };
}

/**
 * يحوّل مطالبة تأمين لبند فاتورة موحّد.
 * اسم الشركة بيظهر في الـ label عشان الطبيب يفهم البند جاي منين.
 */
function insuranceToImportable(i: PatientInsuranceItem): ImportableInvoiceItem {
  return {
    id: `ins_${i.id}`,
    kind: 'insurance',
    dateKey: i.dateKey,
    label: i.note ? `تأمين ${i.companyName} — ${i.note}` : `تأمين ${i.companyName}`,
    amount: i.amount,
  };
}

/**
 * يبني قائمة كاملة بكل البنود القابلة للاستيراد (كاش + تأمين)
 * مرتبة تنازلياً بالتاريخ — الأحدث أولاً.
 */
export function buildImportableList(
  costs: PatientCostItem[],
  insurance: PatientInsuranceItem[],
): ImportableInvoiceItem[] {
  const cash = costs.map(cashToImportable);
  const ins = insurance.map(insuranceToImportable);
  // ترتيب تنازلي: الأحدث فوق
  return [...cash, ...ins].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

/**
 * تجميع البنود حسب التاريخ — يرجع Map من dateKey لقائمة بنوده.
 * مفيد لعرض الـ checkbox مجمّع بالأيام في الـ UI.
 */
export function groupImportableByDate(
  items: ImportableInvoiceItem[],
): Array<[string, ImportableInvoiceItem[]]> {
  const map = new Map<string, ImportableInvoiceItem[]>();
  for (const item of items) {
    const arr = map.get(item.dateKey) || [];
    arr.push(item);
    map.set(item.dateKey, arr);
  }
  // ترتيب تنازلي بالتاريخ
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

/** تنسيق تاريخ بالعربية للعرض في رأس مجموعة اليوم. */
export function formatImportDayLabel(dateKey: string): string {
  try {
    const d = new Date(dateKey + 'T00:00:00');
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'Africa/Cairo',
    });
  } catch {
    return dateKey;
  }
}
