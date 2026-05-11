/**
 * تنظيف كائن قبل كتابته في Firestore (Firestore Sanitize)
 *
 * Firestore بيرفض القيم undefined مع رساله:
 *   "Unsupported field value: undefined"
 *
 * الدالّه دي بتنزّل في الكائن، تشيل أي حقل قيمته undefined، وكمان
 * تشيل أي حقل داخل arrays أو nested objects. القيم الأخرى (null,
 * 0, '', false) بتفضل زي ما هي لأن Firestore بيقبلها.
 */

/** نوع عام يشبه JSON بس مع undefined مسموح */
type AnyValue = unknown;

/**
 * بترجع نسخه جديده من الكائن بدون أي حقول قيمتها undefined.
 * arrays بيتم تنظيفها item بـitem، nested objects نفس الكلام recursively.
 */
export const stripUndefinedDeep = <T>(value: T): T => {
    if (value === undefined) {
        // الـcaller المفروض ما يبعتش undefined في الـtop-level
        return undefined as unknown as T;
    }
    if (value === null) return value;
    if (Array.isArray(value)) {
        return (value as AnyValue[])
            .filter((item) => item !== undefined)
            .map((item) => stripUndefinedDeep(item)) as unknown as T;
    }
    if (typeof value === 'object') {
        const out: Record<string, AnyValue> = {};
        Object.entries(value as Record<string, AnyValue>).forEach(([k, v]) => {
            if (v === undefined) return;
            out[k] = stripUndefinedDeep(v);
        });
        return out as unknown as T;
    }
    return value;
};
