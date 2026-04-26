/**
 * مرآة الأسعار إلى إعدادات الحجز (Booking Config Mirror)
 *
 * عندما يُعدّل الطبيب أسعار الكشف/الاستشارة (سواء ثابتة أو شهرية)، يجب أن
 * تُسجَّل نسخة مرآة تحت `bookingConfig/{secret}` ليقرأها نظام الحجز العام
 * والسكرتارية. هذه الوحدة توفر ثلاث helpers غير-حرجة (Best-effort):
 *   1. `syncPricesToBookingConfig` — مرآة للأسعار الثابتة.
 *   2. `syncMonthlyPricesToBookingConfig` — مرآة لأسعار شهر واحد.
 *   3. `syncAllMonthlyPricesToBookingConfig` — مرآة شاملة لكل الأشهر
 *      المخزنة (يُستخدم كـ backfill).
 *
 * ملاحظة: أي فشل في هذه الـ helpers لا يُعاد توليده — الهدف هو عدم كسر
 * مسار الحفظ/القراءة الرئيسي حتى لو فشلت مزامنة المرآة.
 */

import { collection, doc, query, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst } from '../firestore/cacheFirst';
import { getBookingSecretByUserId } from '../firestore/booking-secretary/secretConfig.secret';
import { normalizeBookingSecret, parseBranchDocKey, toPriceText } from './normalizers';

/**
 * جلب booking secret لمستخدم.
 * لو تم تمرير branchId (مش main)، يقرأ الـ secret من document الفرع.
 * لو branchId = main أو undefined، يستخدم الـ secret العام من ملف المستخدم.
 */
const getUserBookingSecret = async (userId: string, branchId?: string): Promise<string> => {
    try {
        if (!userId) return '';

        // لو فرع غير الرئيسي، نقرأ الـ secret من document الفرع
        if (branchId && branchId !== 'main') {
            const branchRef = doc(db, 'users', userId, 'branches', branchId);
            const branchSnap = await getDocCacheFirst(branchRef);
            if (branchSnap.exists()) {
                const branchSecret = normalizeBookingSecret((branchSnap.data() as { secretarySecret?: unknown })?.secretarySecret);
                if (branchSecret) return branchSecret;
            }
        }

        // الفرع الرئيسي أو fallback: نقرأ من مستند المستخدم
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDocCacheFirst(userRef);
        const userData = userSnap.exists() ? (userSnap.data() as { bookingSecret?: unknown }) : {};
        const secretFromUserDoc = normalizeBookingSecret(userData?.bookingSecret);
        if (secretFromUserDoc) return secretFromUserDoc;

        const fallbackSecret = await getBookingSecretByUserId(userId).catch(() => null);
        return normalizeBookingSecret(fallbackSecret);
    } catch {
        return '';
    }
};

/** مرآة أسعار شهر واحد إلى bookingConfig/{secret}/monthlyPrices/{monthKey} */
export const syncMonthlyPricesToBookingConfig = async (
    userId: string,
    monthKey: string,
    prices: { examinationPrice?: string; consultationPrice?: string; updatedAt?: number },
    branchId?: string,
): Promise<void> => {
    const normalizedUserId = String(userId || '').trim();
    const normalizedMonthKey = String(monthKey || '').trim();
    if (!normalizedUserId || !normalizedMonthKey) return;

    try {
        const bookingSecret = await getUserBookingSecret(normalizedUserId, branchId);
        if (!bookingSecret) return;
        const mirrorRef = doc(db, 'bookingConfig', bookingSecret, 'monthlyPrices', normalizedMonthKey);
        await setDoc(mirrorRef, {
            examinationPrice: prices.examinationPrice || '',
            consultationPrice: prices.consultationPrice || '',
            updatedAt: Number(prices.updatedAt || Date.now()) || Date.now(),
        }, { merge: true });
    } catch {
        // Best-effort mirror sync only; keep primary save/read flow stable.
    }
};

/** مرآة الأسعار الثابتة إلى bookingConfig/{secret}/prices/current */
export const syncPricesToBookingConfig = async (
    userId: string,
    prices: { examinationPrice?: string; consultationPrice?: string; updatedAt?: number },
    branchId?: string,
): Promise<void> => {
    const normalizedUserId = String(userId || '').trim();
    if (!normalizedUserId) return;

    try {
        const bookingSecret = await getUserBookingSecret(normalizedUserId, branchId);
        if (!bookingSecret) return;

        const mirrorRef = doc(db, 'bookingConfig', bookingSecret, 'prices', 'current');
        await setDoc(
            mirrorRef,
            {
                examinationPrice: toPriceText(prices.examinationPrice),
                consultationPrice: toPriceText(prices.consultationPrice),
                updatedAt: Number(prices.updatedAt || Date.now()) || Date.now(),
            },
            { merge: true }
        );
    } catch {
        // Best-effort mirror sync only; keep primary save/read flow stable.
    }
};

/** Backfill: مرآة كل الأشهر المحفوظة تحت users/{uid}/monthlyPrices إلى bookingConfig */
export const syncAllMonthlyPricesToBookingConfig = async (userId: string): Promise<void> => {
    const normalizedUserId = String(userId || '').trim();
    if (!normalizedUserId) return;

    try {
        const bookingSecret = await getUserBookingSecret(normalizedUserId);
        if (!bookingSecret) return;

        const collectionRef = collection(db, 'users', normalizedUserId, 'monthlyPrices');
        const snapshot = await getDocsCacheFirst(query(collectionRef));

        const mirrorWrites: Promise<void>[] = [];
        snapshot.forEach((entry) => {
            const monthKey = String(entry.id || '').trim();
            if (!monthKey) return;

            const data = entry.data() as { examinationPrice?: string; consultationPrice?: string; updatedAt?: number };
            const mirrorRef = doc(db, 'bookingConfig', bookingSecret, 'monthlyPrices', monthKey);
            mirrorWrites.push(
                setDoc(mirrorRef, {
                    examinationPrice: data.examinationPrice || '',
                    consultationPrice: data.consultationPrice || '',
                    updatedAt: Number(data.updatedAt || Date.now()) || Date.now(),
                }, { merge: true }).then(() => undefined)
            );
        });

        if (mirrorWrites.length > 0) {
            await Promise.allSettled(mirrorWrites);
        }
    } catch {
        // Best-effort backfill only; never block UI paths.
    }
};
