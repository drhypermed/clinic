/**
 * دوال مساعدة مشتركة لشاشات المواعيد والحجز (Appointments Utilities)
 * يحتوي هذا الملف على وظائف معالجة التواريخ، أرقام الهواتف، وحسابات السن.
 * الهدف: توحيد طريقة عرض البيانات بين واجهة الطبيب، السكرتارية، والجمهور.
 */

import { buildCairoDateTime, getCairoCurrentTimeMin, getCairoDayKey } from '../../utils/cairoTime';

/**
 * تحويل تاريخ Date إلى نص بصيغة YYYY-MM-DD
 * تستخدم لضمان التوافق مع حقول الإدخال من نوع <input type="date">
 */
export function toLocalDateStr(d: Date): string {
  return getCairoDayKey(d);
}

/**
 * إنشاء كائن Date محلي (Local) من نص التاريخ والوقت.
 * تمنع هذه الوظيفة مشكلة "إزاحة التوقيت" (Timezone Offset) التي قد تؤدي 
 * لتغيير يوم الحجز عند التعامل مع توقيت UTC بعد منتصف الليل.
 */
export function buildLocalDateTime(dateStr: string, timeStr: string): Date {
  return buildCairoDateTime(dateStr, timeStr);
}

/** الحصول على الوقت الحالي بصيغة (HH:MM) للإعدادات الافتراضية */
export function currentTimeMin(): string {
  return getCairoCurrentTimeMin();
}

/** تعريف وحدات السن المدعومة في التطبيق */
export type AgeUnit = 'year' | 'month' | 'day';

const AGE_UNIT_LABELS: Record<AgeUnit, string> = { year: 'سنة', month: 'شهر', day: 'يوم' };

/**
 * تحويل القيمة والوحدة إلى نص مخزّن موحد (مثلاً: "٣٠ سنة").
 * تدعم تحويل الأرقام العربية المدخلة بلوحة المفاتيح إلى أرقام إنجليزية قبل الحفظ.
 */
export function formatAgeForStorage(value: string, unit: AgeUnit): string {
  const v = value.trim().replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  if (!v || !/^\d+$/.test(v)) return '';
  const label = unit === 'month' ? 'شهر' : unit === 'day' ? 'يوم' : 'سنة';
  return `${v} ${label}`;
}

/** دالة داخلية لاستخراج الرقم فقط من نص السن */
function parseAgeNumber(s: string): number {
  const v = s.replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).replace(/\D/g, '');
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

/** تحليل نص السن المخزن (Storage Format) إلى قيمة ووحدة منفصلين (لعرضهما في الفورم) */
export function parseAgeFromStorage(age: string): { value: string; unit: AgeUnit } {
  if (!age || typeof age !== 'string') return { value: '', unit: 'year' };
  const t = age.trim();
  if (t.includes('شهر')) return { value: String(parseAgeNumber(t)), unit: 'month' };
  if (t.includes('يوم')) return { value: String(parseAgeNumber(t)), unit: 'day' };
  return { value: String(parseAgeNumber(t)), unit: 'year' };
}

/** تحويل السن إلى هيكلية (سنوات/شهور/أيام) متوافقة مع شاشة الروشتة الرئيسية */
export function parseAgeToYearsMonthsDays(age: string): { years: string; months: string; days: string } {
  const { value, unit } = parseAgeFromStorage(age);
  if (unit === 'year') return { years: value || '', months: '', days: '' };
  if (unit === 'month') return { years: '', months: value || '', days: '' };
  return { years: '', months: '', days: value || '' };
}

export function getAgeUnitLabel(unit: AgeUnit): string {
  return AGE_UNIT_LABELS[unit];
}
