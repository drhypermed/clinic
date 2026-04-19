/**
 * fcmTokenResolver — حل FCM token مع fallback وإعادة محاولات
 *
 * مستخرج من `messagingService.ts`. يحتوي على منطق الحصول على FCM token:
 *   1. محاولة بـ VAPID key + serviceWorkerRegistration.
 *   2. fallback بدون VAPID.
 *   3. fallback بدون serviceWorkerRegistration صريح.
 *   4. إعادة محاولات (retries) مع delays متزايدة عبر كل الـ registrations
 *      المتاحة (backup لما تتعدد service workers في الصفحة).
 */

import { getToken, type Messaging } from 'firebase/messaging';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface FcmTokenResult {
    token: string | null;
    errorCode?: string;
    errorMessage?: string;
}

interface FcmTokenWithScopeResult extends FcmTokenResult {
    errorScope?: string;
}

/** حل FCM token من registration واحد مع fallback (VAPID ↔ بدون VAPID) */
export const getFcmTokenWithFallback = async (
    msg: Messaging,
    serviceWorkerRegistration: ServiceWorkerRegistration,
    vapidKey?: string
): Promise<FcmTokenResult> => {
    const parseError = (error: unknown) => {
        const code = typeof (error as { code?: unknown })?.code === 'string'
            ? String((error as { code?: string }).code)
            : '';
        const message = typeof (error as { message?: unknown })?.message === 'string'
            ? String((error as { message?: string }).message)
            : String(error || '');
        return { code, message };
    };

    let lastErrorCode = '';
    let lastErrorMessage = '';

    if (vapidKey) {
        try {
            const token = await getToken(msg, { serviceWorkerRegistration, vapidKey });
            if (token) return { token };
        } catch (error) {
            const parsed = parseError(error);
            lastErrorCode = parsed.code;
            lastErrorMessage = parsed.message;
            console.warn('[FCM] getToken with VAPID failed, retrying without VAPID key:', error);
        }
    }

    try {
        const token = await getToken(msg, { serviceWorkerRegistration });
        if (token) return { token };

        if (vapidKey) {
            try {
                const tokenWithoutExplicitRegistration = await getToken(msg, { vapidKey });
                if (tokenWithoutExplicitRegistration) return { token: tokenWithoutExplicitRegistration };
            } catch (error) {
                const parsed = parseError(error);
                lastErrorCode = parsed.code || lastErrorCode;
                lastErrorMessage = parsed.message || lastErrorMessage;
            }
        } else {
            try {
                const tokenWithoutExplicitRegistration = await getToken(msg);
                if (tokenWithoutExplicitRegistration) return { token: tokenWithoutExplicitRegistration };
            } catch (error) {
                const parsed = parseError(error);
                lastErrorCode = parsed.code || lastErrorCode;
                lastErrorMessage = parsed.message || lastErrorMessage;
            }
        }

        return {
            token: null,
            errorCode: lastErrorCode || 'messaging/token-subscribe-no-token',
            errorMessage: lastErrorMessage || 'FCM returned empty token',
        };
    } catch (error) {
        const parsed = parseError(error);
        return {
            token: null,
            errorCode: parsed.code || lastErrorCode || 'messaging/token-subscribe-failed',
            errorMessage: parsed.message || lastErrorMessage || 'FCM token subscribe failed',
        };
    }
};

/** حل FCM token مع إعادة محاولات متعددة عبر كل الـ registrations */
export const getFcmTokenWithRetries = async (
    msg: Messaging,
    registrations: ServiceWorkerRegistration[],
    vapidKey?: string
): Promise<FcmTokenWithScopeResult> => {
    const attemptsDelaysMs = [0, 800, 1800];
    let lastErrorCode = '';
    let lastErrorMessage = '';
    let lastErrorScope = '';

    for (let attemptIndex = 0; attemptIndex < attemptsDelaysMs.length; attemptIndex += 1) {
        const delayMs = attemptsDelaysMs[attemptIndex];
        if (delayMs > 0) {
            await sleep(delayMs);
        }
        for (const registration of registrations) {
            try {
                registration.update().catch(() => { });
                const result = await getFcmTokenWithFallback(msg, registration, vapidKey);
                if (result.token) return { token: result.token };
                if (result.errorCode) {
                    lastErrorCode = result.errorCode;
                    lastErrorMessage = result.errorMessage || '';
                    lastErrorScope = registration.scope;
                }
            } catch (tokenError) {
                console.warn('[FCM] getToken failed for registration scope:', registration.scope, tokenError);
            }
        }
    }

    return {
        token: null,
        errorCode: lastErrorCode || 'messaging/token-subscribe-no-token',
        errorMessage: lastErrorMessage || 'FCM token could not be resolved after retries',
        errorScope: lastErrorScope,
    };
};
