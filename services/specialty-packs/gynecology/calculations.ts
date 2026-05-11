/**
 * حسابات الحمل (Pregnancy Calculations)
 *
 * كل الحسابات الأساسيه: LMP → أسبوع الحمل + ميعاد الولاده.
 * مفصوله عن الـUI عشان تتقدر تتختبر لوحدها لو احتجنا.
 *
 * القاعده الطبيه: الحمل من LMP بياخد 280 يوم (40 أسبوع كامله) → ده الـEDD.
 * أسبوع الحمل وقت أي زياره = (تاريخ الزياره - LMP) / 7 (نأخذ الجزء الصحيح + 1).
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const PREGNANCY_DURATION_DAYS = 280; // 40 أسبوع

/**
 * تحويل YYYY-MM-DD إلى Date (UTC, منتصف الليل) — متجاهل الـtimezone عشان
 * الحسابات الطبيه نهارية (الأسبوع لا يتأثر بفرق ساعات).
 */
const parseDateKey = (dateKey?: string | null): Date | null => {
    if (!dateKey) return null;
    const trimmed = String(dateKey).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
    const [year, month, day] = trimmed.split('-').map(Number);
    if (!year || !month || !day) return null;
    const d = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(d.getTime())) return null;
    return d;
};

/** صيغه YYYY-MM-DD من Date — UTC */
const formatDateKey = (date: Date): string => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/** اليوم الحالي بصيغه YYYY-MM-DD (UTC) — مفيد للحسابات الفوريه */
export const getTodayDateKey = (): string => formatDateKey(new Date());

/**
 * حساب ميعاد الولاده المتوقع (EDD) من LMP.
 * @param lmp تاريخ آخر دوره (YYYY-MM-DD)
 * @returns تاريخ الولاده المتوقع (YYYY-MM-DD) أو null لو LMP غير صالح
 */
export const calculateEDD = (lmp?: string | null): string | null => {
    const lmpDate = parseDateKey(lmp);
    if (!lmpDate) return null;
    const edd = new Date(lmpDate.getTime() + PREGNANCY_DURATION_DAYS * MS_PER_DAY);
    return formatDateKey(edd);
};

/**
 * حساب أسبوع الحمل في تاريخ معين.
 * @param lmp آخر دوره (YYYY-MM-DD)
 * @param at تاريخ القياس (YYYY-MM-DD) — لو فاضي، يستخدم النهارده
 * @returns الأسبوع (1..42) أو null لو LMP غير صالح أو التاريخ قبل LMP
 */
export const calculateGestationalWeek = (
    lmp?: string | null,
    at?: string | null,
): number | null => {
    const lmpDate = parseDateKey(lmp);
    if (!lmpDate) return null;
    const atDate = parseDateKey(at) || new Date();
    const diffMs = atDate.getTime() - lmpDate.getTime();
    if (diffMs < 0) return null;
    const days = Math.floor(diffMs / MS_PER_DAY);
    const week = Math.floor(days / 7) + 1;
    if (week < 1) return 1;
    if (week > 42) return 42; // حد منطقي
    return week;
};

/**
 * حساب اليوم داخل الأسبوع (0..6) — للحسابات الدقيقه (مثلاً "16+3").
 */
export const calculateGestationalDay = (
    lmp?: string | null,
    at?: string | null,
): number | null => {
    const lmpDate = parseDateKey(lmp);
    if (!lmpDate) return null;
    const atDate = parseDateKey(at) || new Date();
    const diffMs = atDate.getTime() - lmpDate.getTime();
    if (diffMs < 0) return null;
    const days = Math.floor(diffMs / MS_PER_DAY);
    return days % 7;
};

/** نص ودّي للأسبوع: "12+3 أسبوع" */
export const formatGestationalAge = (
    lmp?: string | null,
    at?: string | null,
): string => {
    const week = calculateGestationalWeek(lmp, at);
    if (week === null) return '';
    const day = calculateGestationalDay(lmp, at) ?? 0;
    return `${week}+${day} أسبوع`;
};

/** تصنيف الترايمستر بناء على الأسبوع */
export const getTrimester = (week?: number | null): 1 | 2 | 3 | null => {
    if (!week || week < 1) return null;
    if (week <= 13) return 1;
    if (week <= 27) return 2;
    return 3;
};
