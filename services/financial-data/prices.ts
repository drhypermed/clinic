/**
 * أسعار الكشف والاستشارة (Examination/Consultation Prices)
 *
 * يغطي هذا الـ module ثلاث استراتيجيات تخزين للأسعار:
 *
 *   1. **النظام الثابت (Legacy / Fixed)** — سعر واحد ساري لكل الأوقات:
 *      `users/{uid}/financialData/prices`
 *      يُستخدم كمصدر أسعار افتراضي إذا لم يكن هناك سعر شهري مخصص.
 *
 *   2. **النظام الشهري (Monthly Override)** — سعر مخصص لكل شهر:
 *      `users/{uid}/monthlyPrices/{YYYY-MM}`
 *      للأطباء الذين يُعدّلون الأسعار شهرياً.
 *
 *   3. **قراءة عبر Secret (Booking Mirror)** — نسخة مرآة لنظام السكرتارية:
 *      `bookingConfig/{secret}/prices/current` و
 *      `bookingConfig/{secret}/monthlyPrices/{YYYY-MM}`
 *      تُستخدم من طرف السكرتارية/الحجز العام بدون صلاحيات كاملة.
 *
 * كل عملية حفظ أسعار تُطلق مزامنة مرآة best-effort عبر
 * `bookingConfigMirror` لضمان ظهور السعر الجديد فوراً للسكرتارية.
 */

import {
    collection,
    doc,
    query,
    setDoc,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst, subscribeDocCacheFirst } from '../firestore/cacheFirst';
import {
    syncMonthlyPricesToBookingConfig,
    syncPricesToBookingConfig,
} from './bookingConfigMirror';
import {
    branchDocKey,
    getPriceHistoryEntriesCollection,
    isPermissionDeniedError,
    normalizeBookingSecret,
    normalizePricesPayload,
    parseBranchDocKey,
    toNonNegativePriceNumber,
    toPriceText,
    toTimestampMillis,
} from './normalizers';
import type { PricesTextPayload } from './types';

// ─────────────────────────────────────────────────────────────
// النظام الثابت (Legacy / Fixed Prices)
// ─────────────────────────────────────────────────────────────

/**
 * جلب الأسعار الثابته (Legacy) مع fallback لآخر سعر شهري مخزن.
 *
 * ملاحظه عن المرآة (bookingConfigMirror): اتشال الـsync من القراءه. كان قبل كده
 * كل قراءه بتعمل write للمرآه بنفس البيانات ـ مكلف ومش له فايده. المرآه دلوقت
 * بتتحدّث بس وقت `savePrices` و `saveMonthlyPrices` (عند تغيير حقيقي).
 */
export const getPrices = async (userId: string, branchId?: string): Promise<PricesTextPayload> => {
    try {
        const docRef = doc(db, 'users', userId, 'financialData', branchDocKey('prices', branchId));
        const snapshot = await getDocCacheFirst(docRef);

        if (snapshot.exists()) {
            return normalizePricesPayload(
                snapshot.data() as { examinationPrice?: unknown; consultationPrice?: unknown; updatedAt?: unknown }
            );
        }

        // توافق رجعي: إن لم توجد الأسعار الثابته بعد، نستخدم آخر سعر شهري محفوظ.
        // مهم: نُرشِّح الإدخالات حسب الفرع المطلوب (parseBranchDocKey) حتى لا
        // نخلط أسعار الفروع المختلفه — وإلا فإن أحدث إدخال لأي فرع سيتسرّب
        // إلى الفرع المسؤول عن هذا الاستعلام.
        const targetBranchId = !branchId || branchId === 'main' ? 'main' : branchId;
        const legacyRef = collection(db, 'users', userId, 'monthlyPrices');
        const legacySnapshot = await getDocsCacheFirst(query(legacyRef));
        let latestMonth = '';
        let latestPrices: PricesTextPayload | null = null;

        legacySnapshot.forEach((entry) => {
            const rawId = String(entry.id || '').trim();
            if (!rawId) return;
            const parsed = parseBranchDocKey(rawId);
            if (parsed.branchId !== targetBranchId) return;
            const monthKey = parsed.key;
            if (!monthKey) return;
            if (!latestMonth || monthKey.localeCompare(latestMonth) > 0) {
                latestMonth = monthKey;
                latestPrices = entry.data() as PricesTextPayload;
            }
        });

        if (latestPrices) {
            const prices = latestPrices as PricesTextPayload;
            const migratedPayload = {
                examinationPrice: toPriceText(prices.examinationPrice || ''),
                consultationPrice: toPriceText(prices.consultationPrice || ''),
                updatedAt: toTimestampMillis((prices.updatedAt || 0) as number) || Date.now(),
            };
            // الـmigration كتابه فعليه (مش مجرد قراءه) → سينك المرآه ضروري هنا.
            await setDoc(docRef, migratedPayload, { merge: true });
            void syncPricesToBookingConfig(userId, migratedPayload, branchId);
            return migratedPayload;
        }

        return {};
    } catch (error) {
        console.error('[FinancialData] Error getting prices:', error);
        return {};
    }
};

/** حفظ الأسعار الثابتة (النظام القديم — للتوافق مع الإصدارات السابقة) */
export const savePrices = async (
    userId: string,
    prices: { examinationPrice?: string; consultationPrice?: string },
    branchId?: string,
): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    try {
        const docRef = doc(db, 'users', userId, 'financialData', branchDocKey('prices', branchId));
        const payload = {
            examinationPrice: toPriceText(prices.examinationPrice),
            consultationPrice: toPriceText(prices.consultationPrice),
            updatedAt: Date.now(),
        };
        await setDoc(docRef, payload, { merge: true });
        await syncPricesToBookingConfig(userId, payload, branchId);
    } catch (error) {
        console.error('[FinancialData] Error saving prices:', error);
        throw error;
    }
};

/**
 * حفظ الأسعار الثابتة مع تسجيل سجل تغيير مفصل (من -> إلى).
 * لا يُسجَّل سجل جديد إذا كانت القيم لم تتغير فعلياً.
 */
export const saveFixedPricesWithHistory = async (
    userId: string,
    prices: { examinationPrice?: string; consultationPrice?: string },
    branchId?: string,
): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    const oldPrices = await getPrices(userId, branchId);
    const oldExam = toNonNegativePriceNumber(oldPrices.examinationPrice);
    const oldConsult = toNonNegativePriceNumber(oldPrices.consultationPrice);
    const newExam = toNonNegativePriceNumber(prices.examinationPrice);
    const newConsult = toNonNegativePriceNumber(prices.consultationPrice);

    const updatedAt = Date.now();
    const payload = {
        examinationPrice: String(newExam),
        consultationPrice: String(newConsult),
        updatedAt,
    };

    const hasActualChange = oldExam !== newExam || oldConsult !== newConsult;

    if (!hasActualChange) {
        await savePrices(userId, payload, branchId);
        return;
    }

    // Commit prices + history together so historical totals never drift if one write fails.
    const pricesRef = doc(db, 'users', userId, 'financialData', branchDocKey('prices', branchId));
    const historyRef = getPriceHistoryEntriesCollection(userId);
    const historyDocRef = doc(historyRef);
    const batch = writeBatch(db);

    batch.set(pricesRef, payload, { merge: true });
    batch.set(historyDocRef, {
        changedAt: updatedAt,
        oldExaminationPrice: oldExam,
        newExaminationPrice: newExam,
        oldConsultationPrice: oldConsult,
        newConsultationPrice: newConsult,
        ...(branchId && branchId !== 'main' ? { branchId } : {}),
    });

    await batch.commit();
    await syncPricesToBookingConfig(userId, payload, branchId);
};

/**
 * الاشتراك اللحظي في الأسعار الثابته (cache-first + onSnapshot حقيقي).
 * كان قبل كده one-shot — لمّا الدكتور يحدّث السعر من tab، tab السكرتيره ما كانش بيشوف.
 */
export const subscribeToPrices = (
    userId: string,
    onUpdate: (prices: PricesTextPayload) => void,
    onError?: (error: string) => void,
    branchId?: string,
) => {
    const docRef = doc(db, 'users', userId, 'financialData', branchDocKey('prices', branchId));
    return subscribeDocCacheFirst(docRef, {
        next: (snapshot) => {
            onUpdate(
                snapshot.exists()
                    ? normalizePricesPayload(
                        snapshot.data() as { examinationPrice?: unknown; consultationPrice?: unknown; updatedAt?: unknown }
                    )
                    : {}
            );
        },
        error: (error) => {
            if (isPermissionDeniedError(error)) {
                onUpdate({});
                if (onError) onError('لا توجد صلاحيه لقراءة الأسعار حالياً.');
                return;
            }
            console.error('[FinancialData] Error reading prices:', error);
            if (onError) onError((error as { message?: string })?.message || 'Unknown error');
        },
    });
};

// ─────────────────────────────────────────────────────────────
// النظام الشهري (Monthly Overrides)
// ─────────────────────────────────────────────────────────────

/** حفظ أسعار الكشف والاستشارة لشهر محدد (النظام الجديد) */
export const saveMonthlyPrices = async (
    userId: string,
    monthKey: string,
    prices: { examinationPrice?: string; consultationPrice?: string },
    branchId?: string,
): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    try {
        const docRef = doc(db, 'users', userId, 'monthlyPrices', branchDocKey(monthKey, branchId));
        const payload = {
            ...prices,
            updatedAt: Date.now()
        };

        await setDoc(docRef, payload, { merge: true });
        await syncMonthlyPricesToBookingConfig(userId, monthKey, payload, branchId);
    } catch (error) {
        console.error('[FinancialData] Error saving monthly prices:', error);
        throw error;
    }
};

/**
 * جلب أسعار الكشف لشهر محدد.
 * المرآه (mirror) اتشالت من القراءه — كانت بتعمل write بنفس البيانات بدون فايده.
 * المرآه دلوقت بتتحدّث بس وقت `saveMonthlyPrices`.
 */
export const getMonthlyPrices = async (
    userId: string,
    monthKey: string,
    branchId?: string,
): Promise<PricesTextPayload> => {
    try {
        const docRef = doc(db, 'users', userId, 'monthlyPrices', branchDocKey(monthKey, branchId));
        const snapshot = await getDocCacheFirst(docRef);

        if (snapshot.exists()) {
            return snapshot.data() as PricesTextPayload;
        }
        return {};
    } catch (error) {
        console.error('[FinancialData] Error getting monthly prices:', error);
        return {};
    }
};

/** جلب سجل جميع الأسعار الشهرية المسجلة مسبقاً (الأحدث أولاً) */
export const getAllMonthlyPrices = async (
    userId: string
): Promise<Array<{ month: string; examinationPrice?: string; consultationPrice?: string; updatedAt?: number }>> => {
    try {
        const collectionRef = collection(db, 'users', userId, 'monthlyPrices');
        const snapshot = await getDocsCacheFirst(query(collectionRef));

        const allPrices: Array<{ month: string; examinationPrice?: string; consultationPrice?: string; updatedAt?: number }> = [];
        snapshot.forEach(doc => {
            allPrices.push({
                month: doc.id,
                ...doc.data() as PricesTextPayload,
            });
        });

        // ترتيب النتائج تنازلياً حسب الشهر (الأحدث أولاً)
        allPrices.sort((a, b) => b.month.localeCompare(a.month));
        return allPrices;
    } catch (error) {
        console.error('[FinancialData] Error getting all monthly prices:', error);
        return [];
    }
};

/** الاشتراك اللحظي في الأسعار الشهريه (cache-first + onSnapshot حقيقي) */
export const subscribeToMonthlyPrices = (
    userId: string,
    monthKey: string,
    onUpdate: (prices: PricesTextPayload) => void,
    onError?: (error: string) => void,
    branchId?: string,
) => {
    const docRef = doc(db, 'users', userId, 'monthlyPrices', branchDocKey(monthKey, branchId));
    return subscribeDocCacheFirst(docRef, {
        next: (snapshot) => {
            onUpdate(snapshot.exists() ? (snapshot.data() as PricesTextPayload) : {});
        },
        error: (error) => {
            if (isPermissionDeniedError(error)) {
                onUpdate({});
                if (onError) onError('لا توجد صلاحيه لقراءة أسعار هذا القسم حالياً.');
                return;
            }
            console.error('[FinancialData] Error reading monthly prices:', error);
            if (onError) onError((error as { message?: string })?.message || 'Unknown error');
        },
    });
};

// ─────────────────────────────────────────────────────────────
// قراءة الأسعار عبر Secret (Booking Mirror)
// ─────────────────────────────────────────────────────────────

/** جلب أسعار الكشف/الاستشارة من المرآة العامة للسكرتارية عبر secret */
export const getMonthlyPricesBySecret = async (
    secret: string,
    monthKey: string
): Promise<PricesTextPayload> => {
    const normalizedSecret = normalizeBookingSecret(secret);
    const normalizedMonthKey = String(monthKey || '').trim();
    if (!normalizedSecret || !normalizedMonthKey) return {};

    try {
        const docRef = doc(db, 'bookingConfig', normalizedSecret, 'monthlyPrices', normalizedMonthKey);
        const snapshot = await getDocCacheFirst(docRef);
        if (snapshot.exists()) {
            return snapshot.data() as PricesTextPayload;
        }
        const collectionRef = collection(db, 'bookingConfig', normalizedSecret, 'monthlyPrices');
        const allSnapshot = await getDocsCacheFirst(query(collectionRef));

        let latestMonthId = '';
        let latestData: PricesTextPayload | null = null;
        allSnapshot.forEach((entry) => {
            const monthId = String(entry.id || '').trim();
            if (!monthId) return;
            if (!latestMonthId || monthId.localeCompare(latestMonthId) > 0) {
                latestMonthId = monthId;
                latestData = entry.data() as PricesTextPayload;
            }
        });

        return latestData || {};
    } catch {
        return {};
    }
};

/** جلب الأسعار الثابتة من مرآة السكرتارية عبر secret */
export const getPricesBySecret = async (
    secret: string
): Promise<PricesTextPayload> => {
    const normalizedSecret = normalizeBookingSecret(secret);
    if (!normalizedSecret) return {};

    try {
        const docRef = doc(db, 'bookingConfig', normalizedSecret, 'prices', 'current');
        const snapshot = await getDocCacheFirst(docRef);
        if (snapshot.exists()) {
            return normalizePricesPayload(
                snapshot.data() as { examinationPrice?: unknown; consultationPrice?: unknown; updatedAt?: unknown }
            );
        }
        return {};
    } catch {
        return {};
    }
};

/**
 * اشتراك لحظي في الأسعار الثابته من مرآة السكرتاريه (cache-first + onSnapshot حقيقي).
 * هنا الاشتراك الحقيقي مهم جداً: السكرتاريه لازم تشوف تحديث السعر فور حفظ الدكتور.
 */
export const subscribeToPricesBySecret = (
    secret: string,
    onUpdate: (prices: PricesTextPayload) => void,
    onError?: (error: string) => void
) => {
    const normalizedSecret = normalizeBookingSecret(secret);
    if (!normalizedSecret) {
        onUpdate({});
        return () => { };
    }

    const docRef = doc(db, 'bookingConfig', normalizedSecret, 'prices', 'current');
    return subscribeDocCacheFirst(docRef, {
        next: (snapshot) => {
            onUpdate(
                snapshot.exists()
                    ? normalizePricesPayload(
                        snapshot.data() as { examinationPrice?: unknown; consultationPrice?: unknown; updatedAt?: unknown }
                    )
                    : {}
            );
        },
        error: (error) => {
            if (isPermissionDeniedError(error)) {
                onUpdate({});
                if (onError) onError('لا توجد صلاحيه لقراءة الأسعار حالياً.');
                return;
            }
            if (onError) onError((error as { message?: string })?.message || 'Unknown error');
        },
    });
};
