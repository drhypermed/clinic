/**
 * أدوات تنظيف/تحويل البيانات المالية (Financial Data Normalizers)
 *
 * وظائف مساعدة تُستخدم داخلياً في كل module من modules الـ financial-data:
 *   - فحوص الأخطاء (permission-denied من Firestore).
 *   - تحويل قيم الأسعار من أي نوع إلى رقم/نص آمن.
 *   - توحيد صيغة الـ timestamp مهما كان مصدره (ms/s/Firestore Timestamp).
 *   - بناء payload الأسعار للحفظ/القراءة.
 *   - بناء المسار لمجموعة سجل تغييرات الأسعار.
 */

import { collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { PriceChangeHistoryEntry } from './types';

/**
 * بناء مفتاح مستند مالي يراعي الفرع.
 * الفرع الرئيسي (main) أو undefined يستخدم المفتاح الأصلي (backward compatible).
 * الفروع الأخرى تستخدم مفتاح مركب: `{branchId}__{key}`
 */
export const branchDocKey = (key: string, branchId?: string): string => {
    if (!branchId || branchId === 'main') return key;
    return `${branchId}__${key}`;
};

/**
 * استخراج المفتاح الأصلي و branchId من مفتاح مستند مركب.
 * مثال: `branch_123__2026-04-12` → { key: '2026-04-12', branchId: 'branch_123' }
 * مثال: `2026-04-12` → { key: '2026-04-12', branchId: 'main' }
 */
export const parseBranchDocKey = (docId: string): { key: string; branchId: string } => {
    const separatorIndex = docId.indexOf('__');
    if (separatorIndex === -1) return { key: docId, branchId: 'main' };
    return {
        branchId: docId.substring(0, separatorIndex),
        key: docId.substring(separatorIndex + 2),
    };
};

/**
 * بناء نطاق documentId() لقراءة وثائق فرع معيّن تبدأ بـ keyPrefix محدد من Firestore مباشرة.
 * - الفرع الرئيسي (main): النطاق على الـ keyPrefix كما هو (بدون بادئة).
 * - الفروع الأخرى: النطاق بيشمل بادئة الفرع `{branchId}__`.
 *
 * المنفعة: استبدال "اقرأ الكل ثم فلترة في الذاكرة" بـ Firestore range query.
 * مثال: لجلب كل وثائق سنة 2026 لفرع main → keyPrefix = "2026-"، النطاق:
 *   start = "2026-",  end = "2026-"  (بيقطع كل YYYY-MM-DD اللي تبدأ بـ "2026-")
 *  رمز Unicode عالي بيتفسّر كنهاية أي prefix في الـ string sort الخاص بـ Firestore.
 */
export const branchDocIdRange = (keyPrefix: string, branchId?: string): { start: string; end: string } => {
    const fullPrefix = !branchId || branchId === 'main' ? keyPrefix : `${branchId}__${keyPrefix}`;
    return { start: fullPrefix, end: `${fullPrefix}` };
};

/** هل الخطأ ناتج عن نقص الصلاحيات في Firestore Rules؟ */
export const isPermissionDeniedError = (error: unknown): boolean => {
    const rawCode = String((error as { code?: unknown })?.code || '').trim().toLowerCase();
    const code = rawCode.replace(/^firebase\//, '').replace(/^firestore\//, '');
    if (code === 'permission-denied' || code === 'insufficient-permission') return true;
    const message = String((error as { message?: unknown })?.message || '').toLowerCase();
    return message.includes('missing or insufficient permissions');
};

/** توحيد رقم booking secret كنص مقصوص */
export const normalizeBookingSecret = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

/** تحويل قيمة إلى رقم موجب أو 0 عند الفشل */
export const toNonNegativePriceNumber = (value: unknown): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
};

/** تحويل قيمة إلى نص رقم آمن للحفظ */
export const toPriceText = (value: unknown): string => String(toNonNegativePriceNumber(value));

/** تحويل قيمة إلى نص رقم اختياري (يرجع undefined إذا كانت فارغة/غير صالحة) */
const toOptionalPriceText = (value: unknown): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return undefined;
    return String(parsed);
};

/**
 * تحويل قيمة timestamp من أي مصدر إلى ms رقم صحيح.
 * يدعم: Number (ms), String (ISO أو رقمي), Firestore Timestamp
 * (مع خصائص `seconds`/`nanoseconds` أو `_seconds`/`_nanoseconds`).
 */
export const toTimestampMillis = (value: unknown): number => {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value > 0 ? value : 0;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return 0;

        const asNumber = Number(trimmed);
        if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;

        const asDate = Date.parse(trimmed);
        if (Number.isFinite(asDate) && asDate > 0) return asDate;
        return 0;
    }

    if (!value || typeof value !== 'object') return 0;

    const maybeTimestamp = value as {
        toMillis?: () => number;
        seconds?: number;
        nanoseconds?: number;
        _seconds?: number;
        _nanoseconds?: number;
    };

    if (typeof maybeTimestamp.toMillis === 'function') {
        const millis = Number(maybeTimestamp.toMillis());
        if (Number.isFinite(millis) && millis > 0) return millis;
    }

    const seconds = Number(
        maybeTimestamp.seconds ?? maybeTimestamp._seconds ?? NaN
    );
    const nanos = Number(
        maybeTimestamp.nanoseconds ?? maybeTimestamp._nanoseconds ?? 0
    );
    if (Number.isFinite(seconds) && seconds > 0) {
        const millis = (seconds * 1000) + Math.floor((Number.isFinite(nanos) ? nanos : 0) / 1_000_000);
        return Number.isFinite(millis) && millis > 0 ? millis : 0;
    }

    return 0;
};

/** توحيد payload أسعار الكشف/الاستشارة قبل الحفظ أو القراءة */
export const normalizePricesPayload = (
    data?: { examinationPrice?: unknown; consultationPrice?: unknown; updatedAt?: unknown } | null
): { examinationPrice?: string; consultationPrice?: string; updatedAt?: number } => {
    if (!data) return {};

    const normalized: { examinationPrice?: string; consultationPrice?: string; updatedAt?: number } = {};

    const exam = toOptionalPriceText(data.examinationPrice);
    const consult = toOptionalPriceText(data.consultationPrice);
    const updatedAt = toTimestampMillis(data.updatedAt);

    if (exam !== undefined) normalized.examinationPrice = exam;
    if (consult !== undefined) normalized.consultationPrice = consult;
    if (updatedAt > 0) normalized.updatedAt = updatedAt;

    return normalized;
};

/** بناء المرجع لمجموعة سجل تغييرات الأسعار الخاصة بمستخدم */
export const getPriceHistoryEntriesCollection = (userId: string) =>
    collection(db, 'users', userId, 'financialData', 'priceHistory', 'entries');

/** تحويل مستند Firestore خام إلى PriceChangeHistoryEntry منسقة */
export const toPriceChangeHistoryEntry = (
    id: string,
    data: {
        changedAt?: unknown;
        updatedAt?: unknown;
        createdAt?: unknown;
        oldExaminationPrice?: unknown;
        newExaminationPrice?: unknown;
        oldConsultationPrice?: unknown;
        newConsultationPrice?: unknown;
    }
): PriceChangeHistoryEntry => {
    const resolvedChangedAt =
        toTimestampMillis(data.changedAt)
        || toTimestampMillis(data.updatedAt)
        || toTimestampMillis(data.createdAt);

    return {
        id,
        changedAt: resolvedChangedAt,
        oldExaminationPrice: toNonNegativePriceNumber(data.oldExaminationPrice),
        newExaminationPrice: toNonNegativePriceNumber(data.newExaminationPrice),
        oldConsultationPrice: toNonNegativePriceNumber(data.oldConsultationPrice),
        newConsultationPrice: toNonNegativePriceNumber(data.newConsultationPrice),
    };
};
