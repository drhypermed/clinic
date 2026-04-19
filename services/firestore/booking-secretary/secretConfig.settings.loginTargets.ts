/**
 * secretConfig.settings.loginTargets — البحث عن جلسة دخول السكرتارية
 *
 * يحتوي على الدالتين اللتين تُحدّدان هدف تسجيل دخول السكرتارية (secret +
 * userId + hash كلمة المرور) بناءً على البريد الإلكتروني:
 *
 *   1. `getSecretaryLoginTargetByDoctorEmail` — البحث عبر `secretaryLoginIndex`
 *      ثم جلب bookingConfig المطابق.
 *   2. `getSecretaryLoginTargetByUserEmail`   — البحث في `users` collection
 *      عبر حقلَي `doctorEmail` أو `email`.
 *
 * مستخرج من `secretConfig.settings.ts` لتقليل حجمه.
 */

import { collection, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst } from '../cacheFirst';
import { normalizeBookingSecret, normalizeEmail, sanitizeDocSegment, toOptionalText } from './helpers';
import { getBookingSecretByUserId } from './secretConfig.secret';
import { readSecretaryAuthBySecret } from './secretaryAuthStorage';
import type { SecretaryLoginTarget } from './types';

const getSecretaryLoginIndexRef = (doctorEmail: string) => {
    const normalizedEmail = normalizeEmail(doctorEmail);
    const docId = sanitizeDocSegment(normalizedEmail);
    if (!docId) return null;
    return doc(db, 'secretaryLoginIndex', docId);
};

/** جلب هدف دخول السكرتارية عبر إيميل الطبيب (secretaryLoginIndex) */
export const getSecretaryLoginTargetByDoctorEmail = async (
    doctorEmail: string
): Promise<SecretaryLoginTarget | null> => {
    const normalizedEmail = normalizeEmail(doctorEmail);
    if (!normalizedEmail) return null;

    try {
        const indexRef = getSecretaryLoginIndexRef(normalizedEmail);
        if (!indexRef) return null;

        const indexSnap = await getDocCacheFirst(indexRef);
        if (!indexSnap.exists()) return null;

        const indexData = indexSnap.data();
        const userId = sanitizeDocSegment(indexData?.userId);
        if (!userId) return null;

        const indexedSecret = normalizeBookingSecret(indexData?.secret);
        const secret = indexedSecret || (await getBookingSecretByUserId(userId));
        if (!secret) return null;

        const [configSnap, authData] = await Promise.all([
            getDocCacheFirst(doc(db, 'bookingConfig', secret)),
            readSecretaryAuthBySecret(secret),
        ]);
        const configData = configSnap.exists() ? (configSnap.data() as Record<string, unknown>) : {};

        return {
            secret,
            userId,
            secretaryPasswordHash: authData.secretaryPasswordHash,
            formTitle: toOptionalText(configData?.formTitle),
        };
    } catch (error) {
        console.error('[Firestore] Error resolving secretary login target by doctor email:', error);
        return null;
    }
};

/** جلب هدف دخول السكرتارية عبر إيميل المستخدم (بحث مباشر في users collection) */
export const getSecretaryLoginTargetByUserEmail = async (
    email: string,
    fetchBookingConfig: (secret: string) => Promise<{ formTitle?: string } | null>
): Promise<SecretaryLoginTarget | null> => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    try {
        const usersRef = collection(db, 'users');
        const qByDoctorEmail = query(usersRef, where('doctorEmail', '==', normalizedEmail));
        const qByEmail = query(usersRef, where('email', '==', normalizedEmail));
        const [snap1, snap2] = await Promise.all([
            getDocsCacheFirst(qByDoctorEmail),
            getDocsCacheFirst(qByEmail),
        ]);

        const userSnap = snap1.docs[0] || snap2.docs[0];
        if (!userSnap) return null;

        const userId = sanitizeDocSegment(userSnap.id);
        if (!userId) return null;

        const profileSecret = normalizeBookingSecret((userSnap.data() as Record<string, unknown>)?.bookingSecret);
        const secret = profileSecret || (await getBookingSecretByUserId(userId));
        if (!secret) return null;

        const [config, authData] = await Promise.all([
            fetchBookingConfig(secret),
            readSecretaryAuthBySecret(secret),
        ]);
        if (!config) return null;

        return {
            secret,
            userId,
            secretaryPasswordHash: authData.secretaryPasswordHash,
            formTitle: config.formTitle,
        };
    } catch (error) {
        console.error('[Firestore] Error resolving secretary login target by user email:', error);
        return null;
    }
};

// Internal export للاستخدام من update-settings
export const getSecretaryLoginIndexRefInternal = getSecretaryLoginIndexRef;
