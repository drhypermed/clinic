/**
 * مساعدات الجلسة الخاصة بطرف السكرتارية (Secretary Session Helpers)
 *
 * يُصدر هذا الملف دوال داخلية يستخدمها hook `usePublicBookingAppointmentActions`
 * للتعامل مع أخطاء الجلسة المنتهية و retry logic عند استدعاء Cloud Functions
 * من طرف السكرتارية.
 *
 * الفكرة: token الجلسة قد يتغير أثناء التنفيذ (إذا تم refresh تلقائي)،
 * فنعمل استدعاءً أولياً بالـ token الحالي، وإن فشل بسبب انتهاء الصلاحية
 * نعيد المحاولة مرة واحدة بـ token الجديد.
 */

/** تطبيع كود الخطأ القادم من Cloud Functions إلى نص منخفض الأحرف بدون بادئة functions/ */
export const normalizeFunctionsErrorCode = (error: unknown): string =>
    String((error as { code?: unknown })?.code || '')
        .trim()
        .toLowerCase()
        .replace(/^functions\//, '');

/** هل الخطأ يدل على انتهاء/عدم وجود جلسة السكرتارية الحالية؟ */
export const isInvalidSecretarySessionError = (error: unknown): boolean => {
    const code = normalizeFunctionsErrorCode(error);
    const message = String((error as { message?: unknown })?.message || '').toUpperCase();
    return (
        code === 'unauthenticated' ||
        message.includes('INVALID_SESSION_TOKEN') ||
        message.includes('SECRETARY_SESSION_EXPIRED')
    );
};

/** استدعاء دالة مع إعادة محاولة واحدة إذا تم تحديث token الجلسة أثناء الفشل */
export const callWithSessionRetry = async <T>(
    action: (sessionToken?: string) => Promise<T>,
    resolveCurrentSessionToken: () => string | undefined
): Promise<T> => {
    const firstToken = resolveCurrentSessionToken();
    try {
        return await action(firstToken);
    } catch (firstError) {
        if (!isInvalidSecretarySessionError(firstError)) {
            throw firstError;
        }
        const latestToken = resolveCurrentSessionToken();
        if (!latestToken || latestToken === firstToken) {
            throw firstError;
        }
        return action(latestToken);
    }
};
