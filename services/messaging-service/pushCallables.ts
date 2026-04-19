/**
 * pushCallables — استدعاء Cloud Functions لتسجيل/إلغاء FCM tokens
 *
 * مستخرج من `messagingService.ts`. يحتوي على:
 *   - `saveTokenViaCallable`       : استدعاء `registerPushToken` مع retry على auth.
 *   - `unregisterTokenViaCallable` : استدعاء `unregisterPushToken` مع retry على auth.
 *   - `buildPushCallablePayload`   : بناء payload مناسب للـ role (doctor/secretary/public).
 *
 * كل استدعاء يتحقق من وجود currentUser قبل التنفيذ، ويحاول refresh token عند
 * فشل بـ unauthenticated ثم يعيد المحاولة مرة واحدة.
 */

import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebaseConfig';

const registerPushTokenCallable = httpsCallable(functions, 'registerPushToken');
const unregisterPushTokenCallable = httpsCallable(functions, 'unregisterPushToken');

export const buildPushCallablePayload = (
    role: 'doctor' | 'secretary' | 'public',
    targetId: string,
    token: string,
    branchId?: string,
    sessionToken?: string
) => (
    role === 'doctor'
        ? { role: 'doctor', token, userId: targetId }
        : role === 'secretary'
            ? {
                role: 'secretary',
                token,
                secret: targetId,
                // branchId يُمرَّر للسكرتيرة فقط لعزل الإشعارات بين الفروع.
                // الفرع الافتراضي 'main' لو مش محدد (للتوافق مع النظام القديم).
                branchId: (branchId || 'main').trim() || 'main',
                // sessionToken يُمرَّر كـ auth fallback لو Firebase Auth انتهى
                // (السكرتيرة بعد إعادة فتح المتصفح — custom token ينتهي بعد ساعة).
                ...(sessionToken ? { sessionToken } : {}),
              }
            : { role: 'public', token, userId: targetId }
);

export const isUnauthenticatedCallableError = (error: unknown): boolean => {
    const code = String((error as { code?: unknown })?.code || '').toLowerCase();
    const message = String((error as { message?: unknown })?.message || '').toLowerCase();
    return code.includes('unauthenticated') || message.includes('unauthenticated');
};

export const ensureFreshAuthToken = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;

    try {
        await user.getIdToken(true);
        return true;
    } catch {
        return false;
    }
};

/**
 * تسجيل push token عبر Cloud Function مع retry على unauthenticated.
 * - للسكرتيرة: يمكن تمرير `sessionToken` كـ auth fallback (لو Firebase Auth انتهى)
 *   — الـ function ستتحقق من الـ sessionToken مقابل `secretaryAuth/{secret}`.
 * - للطبيب/public: يعتمد على `auth.currentUser` فقط.
 */
export const saveTokenViaCallable = async (
    role: 'doctor' | 'secretary' | 'public',
    targetId: string,
    token: string,
    branchId?: string,
    sessionToken?: string
): Promise<boolean> => {
    const payload = buildPushCallablePayload(role, targetId, token, branchId, sessionToken);

    const invokeRegister = async () => {
        await registerPushTokenCallable(payload);
    };

    // للسكرتيرة: نسمح بالاستدعاء بدون auth.currentUser إذا كان `sessionToken` مُمرّر
    // (الـ function ستتحقق من الـ sessionToken). للأدوار الأخرى: نتطلب auth.
    if (!auth.currentUser && !(role === 'secretary' && sessionToken)) {
        console.info('[FCM] registerPushToken skipped: no authenticated user session', { role });
        return false;
    }

    try {
        await invokeRegister();
        return true;
    } catch (error) {
        if (isUnauthenticatedCallableError(error)) {
            // للسكرتيرة مع sessionToken: لا نحاول refresh (الـ function رفضت الـ session)
            if (role === 'secretary' && sessionToken) {
                console.warn('[FCM] registerPushToken: secretary session rejected by server', error);
                return false;
            }
            const refreshed = await ensureFreshAuthToken();
            if (refreshed) {
                try {
                    await invokeRegister();
                    return true;
                } catch (retryError) {
                    if (isUnauthenticatedCallableError(retryError)) {
                        console.info('[FCM] registerPushToken skipped: unauthenticated session');
                        return false;
                    }
                    console.warn('[FCM] registerPushToken callable failed:', retryError);
                    return false;
                }
            }

            console.info('[FCM] registerPushToken skipped: unauthenticated session');
            return false;
        }

        console.warn('[FCM] registerPushToken callable failed:', error);
        return false;
    }
};

/** إلغاء تسجيل push token عبر Cloud Function مع retry على unauthenticated */
export const unregisterTokenViaCallable = async (
    role: 'doctor' | 'secretary' | 'public',
    targetId: string,
    token: string,
    branchId?: string
): Promise<boolean> => {
    const payload = buildPushCallablePayload(role, targetId, token, branchId);

    const invokeUnregister = async () => {
        await unregisterPushTokenCallable(payload);
    };

    if (!auth.currentUser) {
        console.info('[FCM] unregisterPushToken skipped: no authenticated user session');
        return false;
    }

    try {
        await invokeUnregister();
        return true;
    } catch (error) {
        if (isUnauthenticatedCallableError(error)) {
            const refreshed = await ensureFreshAuthToken();
            if (refreshed) {
                try {
                    await invokeUnregister();
                    return true;
                } catch (retryError) {
                    if (isUnauthenticatedCallableError(retryError)) {
                        console.info('[FCM] unregisterPushToken skipped: unauthenticated session');
                        return false;
                    }
                    console.warn('[FCM] unregisterPushToken callable failed:', retryError);
                    return false;
                }
            }

            console.info('[FCM] unregisterPushToken skipped: unauthenticated session');
            return false;
        }

        console.warn('[FCM] unregisterPushToken callable failed:', error);
        return false;
    }
};
