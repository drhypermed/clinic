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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type AgeParts = { years: string; months: string; days: string };

export function isValidDateKey(value?: string | null): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const parseDateKeyUtc = (value?: string | null): Date | null => {
  if (!isValidDateKey(value)) return null;
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateKeyUtc = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const daysInMonthUtc = (year: number, monthIndex: number): number =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

const addMonthsClampedUtc = (date: Date, monthDelta: number): Date => {
  const sourceYear = date.getUTCFullYear();
  const sourceMonth = date.getUTCMonth();
  const target = sourceYear * 12 + sourceMonth + monthDelta;
  const targetYear = Math.floor(target / 12);
  const targetMonth = ((target % 12) + 12) % 12;
  const maxDay = daysInMonthUtc(targetYear, targetMonth);
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(date.getUTCDate(), maxDay)));
};

export function calculateAgePartsFromDateOfBirth(
  dateOfBirth?: string | null,
  atDateKey?: string | null,
): AgeParts | null {
  const dob = parseDateKeyUtc(dateOfBirth);
  const at = parseDateKeyUtc(atDateKey) || parseDateKeyUtc(toLocalDateStr(new Date()));
  if (!dob || !at || dob.getTime() > at.getTime()) return null;

  let years = at.getUTCFullYear() - dob.getUTCFullYear();
  const birthdayThisYear = addMonthsClampedUtc(dob, years * 12);
  if (birthdayThisYear.getTime() > at.getTime()) years -= 1;

  const afterYears = addMonthsClampedUtc(dob, years * 12);
  let months = (at.getUTCFullYear() - afterYears.getUTCFullYear()) * 12 +
    (at.getUTCMonth() - afterYears.getUTCMonth());
  const afterMonths = addMonthsClampedUtc(afterYears, months);
  if (afterMonths.getTime() > at.getTime()) months -= 1;

  const anchor = addMonthsClampedUtc(afterYears, months);
  const days = Math.max(0, Math.floor((at.getTime() - anchor.getTime()) / MS_PER_DAY));

  return { years: String(years), months: String(Math.max(0, months)), days: String(days) };
}

export function formatAgeFromDateOfBirth(
  dateOfBirth?: string | null,
  atDateKey?: string | null,
): string {
  const parts = calculateAgePartsFromDateOfBirth(dateOfBirth, atDateKey);
  if (!parts) return '';
  const years = parseInt(parts.years || '0', 10) || 0;
  const months = parseInt(parts.months || '0', 10) || 0;
  const days = parseInt(parts.days || '0', 10) || 0;
  if (years > 0) return formatAgeForStorage(String(years), 'year');
  if (months > 0) return formatAgeForStorage(String(months), 'month');
  return formatAgeForStorage(String(days), 'day');
}

export function estimateDateOfBirthFromAgeParts(
  ageParts: Partial<AgeParts>,
  atDateKey?: string | null,
): string {
  const at = parseDateKeyUtc(atDateKey) || parseDateKeyUtc(toLocalDateStr(new Date()));
  if (!at) return '';
  const years = Math.max(0, parseInt(ageParts.years || '0', 10) || 0);
  const months = Math.max(0, parseInt(ageParts.months || '0', 10) || 0);
  const days = Math.max(0, parseInt(ageParts.days || '0', 10) || 0);
  if (years === 0 && months === 0 && days === 0) return '';

  const afterYearsMonths = addMonthsClampedUtc(at, -(years * 12 + months));
  const estimated = new Date(afterYearsMonths.getTime() - days * MS_PER_DAY);
  const today = parseDateKeyUtc(toLocalDateStr(new Date()));
  if (today && estimated.getTime() > today.getTime()) return formatDateKeyUtc(today);
  return formatDateKeyUtc(estimated);
}

export function estimateDateOfBirthFromAgeString(
  age: string,
  atDateKey?: string | null,
): string {
  return estimateDateOfBirthFromAgeParts(parseAgeToYearsMonthsDays(age), atDateKey);
}
