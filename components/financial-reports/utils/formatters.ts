/**
 * Financial reports formatters.
 */

import { formatUserDate, getCairoDateParts, getCairoDayKey } from '../../../utils/cairoTime';

const formatAmount = (num: number, compact: boolean = false): string => {
    if (compact && num >= 1000000) {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
            notation: 'compact'
        }).format(num);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

export const formatCurrency = (num: number, compact: boolean = false): string => {
    const currencyLabel = '\u062C.\u0645'; // ج.م
    return `${formatAmount(num, compact)} ${currencyLabel}`;
};

export const formatDateKey = (date: Date): string => {
    return getCairoDayKey(date);
};

export const formatMonthKey = (date: Date): string => {
    const parts = getCairoDateParts(date);
    return `${parts.year}-${String(parts.month).padStart(2, '0')}`;
};

export const formatMonthLabel = (date: Date): string => {
    return formatUserDate(date, { month: 'long', year: 'numeric' }, 'ar-EG-u-nu-latn');
};

export const formatDayLabel = (date: Date): string => {
    return formatUserDate(date, { weekday: 'long', day: 'numeric', month: 'long' }, 'ar-EG-u-nu-latn');
};

/**
 * يبني مفتاح localStorage يراعي الفرع (يطابق نمط branchDocKey في Firestore).
 * الفرع 'main' أو undefined ← يستخدم المفتاح الأصلي (backward compatible للمستخدمين بدون فروع).
 * الفروع الأخرى ← يضاف prefix: `{branchId}__{key}`.
 */
export const branchLocalKey = (key: string, branchId?: string): string => {
    if (!branchId || branchId === 'main') return key;
    return `${branchId}__${key}`;
};
