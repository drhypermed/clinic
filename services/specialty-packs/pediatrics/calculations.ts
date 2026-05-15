/**
 * حسابات الأطفال (Pediatric Calculations)
 *
 * كل العمليات المعتمده على تاريخ الميلاد:
 *   - حساب العمر (سنوات/شهور/أيام)
 *   - تحديد التطعيمات المتأخره/المستحقه/الجايه
 *   - حساب الفرق بين قياسين (لمتابعه اتجاه النمو)
 *
 * مفصوله عن الـUI عشان نقدر نختبرها لوحدها.
 */

import { getCairoDayKey } from '../../../utils/cairoTime';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const parseDateKey = (dateKey?: string | null): Date | null => {
    if (!dateKey) return null;
    const trimmed = String(dateKey).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
    const [y, m, d] = trimmed.split('-').map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(Date.UTC(y, m - 1, d));
    if (Number.isNaN(date.getTime())) return null;
    return date;
};

/** تاريخ النهارده بصيغه YYYY-MM-DD حسب توقيت العيادة في مصر */
export const getTodayDateKey = (): string => getCairoDayKey(new Date());

/** عمر الطفل بالأيام في تاريخ معيّن */
export const calculateAgeInDays = (
    dateOfBirth?: string | null,
    at?: string | null,
): number | null => {
    const dob = parseDateKey(dateOfBirth);
    if (!dob) return null;
    const atDate = parseDateKey(at) || new Date();
    const diff = atDate.getTime() - dob.getTime();
    if (diff < 0) return null;
    return Math.floor(diff / MS_PER_DAY);
};

/** عمر الطفل بالشهور (تقريبي) */
export const calculateAgeInMonths = (
    dateOfBirth?: string | null,
    at?: string | null,
): number | null => {
    const days = calculateAgeInDays(dateOfBirth, at);
    if (days === null) return null;
    return Math.floor(days / 30.4375); // متوسط أيام الشهر
};

/**
 * صياغه عمر ودّيه بالعربي:
 *   - أقل من سنه: "X شهور" (أو "X يوم" لو أقل من شهر)
 *   - من سنه فأكتر: "X سنه و Y شهور"
 */
export const formatChildAge = (
    dateOfBirth?: string | null,
    at?: string | null,
): string => {
    const days = calculateAgeInDays(dateOfBirth, at);
    if (days === null) return '';
    if (days < 30) {
        if (days === 0) return 'النهارده';
        if (days === 1) return 'يوم';
        if (days === 2) return 'يومين';
        return `${days} أيام`;
    }
    const months = Math.floor(days / 30.4375);
    if (months < 12) {
        if (months === 1) return 'شهر';
        if (months === 2) return 'شهرين';
        return `${months} شهور`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yearsLabel = years === 1 ? 'سنه' : years === 2 ? 'سنتين' : `${years} سنوات`;
    if (remainingMonths === 0) return yearsLabel;
    const monthsLabel =
        remainingMonths === 1 ? 'شهر' :
        remainingMonths === 2 ? 'شهرين' :
        `${remainingMonths} شهور`;
    return `${yearsLabel} و ${monthsLabel}`;
};

/**
 * حاله موعد التطعيم بالنسبه للعمر الحالي:
 *   - 'overdue': العمر الحالي بعدّ الموعد المتوقع بأكتر من شهر
 *   - 'due': العمر الحالي ضمن نافذه الشهر الجاي/الفايت
 *   - 'upcoming': لسه بدري
 */
export type VaccinationTiming = 'overdue' | 'due' | 'upcoming';

export const calculateVaccinationTiming = (
    scheduleAgeMonths: number,
    currentAgeMonths: number | null,
): VaccinationTiming => {
    if (currentAgeMonths === null) return 'upcoming';
    const delta = currentAgeMonths - scheduleAgeMonths;
    if (delta > 1) return 'overdue';
    if (delta >= -1) return 'due';
    return 'upcoming';
};

/**
 * فرق وزن بين قياسين — للعرض السريع للدكتور.
 * يرجع كائن فيه القيمه + الاتجاه (زياده/نقصان/ثابت).
 */
export interface MeasurementDelta {
    /** الفرق بنفس الوحده (موجب = زياده) */
    delta: number;
    /** الاتجاه — أصفر لو ثابت، أخضر لو زياده، أحمر لو نقصان */
    direction: 'up' | 'down' | 'flat';
    /** نسبه التغيير المئويه */
    percentChange: number;
}

export const calculateDelta = (
    previousValue?: string | number | null,
    currentValue?: string | number | null,
): MeasurementDelta | null => {
    const prev = typeof previousValue === 'number' ? previousValue : parseFloat(String(previousValue || ''));
    const curr = typeof currentValue === 'number' ? currentValue : parseFloat(String(currentValue || ''));
    if (!Number.isFinite(prev) || !Number.isFinite(curr)) return null;
    const delta = curr - prev;
    const direction: MeasurementDelta['direction'] =
        Math.abs(delta) < 0.001 ? 'flat' : delta > 0 ? 'up' : 'down';
    const percentChange = prev !== 0 ? (delta / prev) * 100 : 0;
    return { delta, direction, percentChange };
};
