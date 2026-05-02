/**
 * عمليات البيانات المالية الشهرية (Monthly Financial Entries)
 *
 * يحتوي هذا الـ module على وظائف "المصروفات الشهرية الثابتة" (إيجار/رواتب/
 * كهرباء/أدوات/إلخ) المخزنة تحت:
 * `users/{uid}/financialData/monthly/entries/{YYYY-MM}`
 *
 * الوظائف المتاحة:
 *   - `getMonthlyData`         : جلب شهر واحد.
 *   - `saveMonthlyData`        : حفظ/دمج بيانات شهر واحد.
 *   - `subscribeToMonthlyData` : اشتراك لحظي في شهر واحد.
 *   - `getYearlyMonthlyEntries`: جلب كل الأشهر لسنة (لتقارير سنوية).
 */

import { collection, doc, documentId, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst, subscribeDocCacheFirst } from '../firestore/cacheFirst';
import type { MonthlyFinancialData } from './types';
import { branchDocIdRange, branchDocKey, parseBranchDocKey } from './normalizers';

/** جلب المصروفات الشهرية لمفتاح شهر محدد (بصيغة YYYY-MM) */
export const getMonthlyData = async (userId: string, monthKey: string, branchId?: string): Promise<MonthlyFinancialData> => {
    try {
        const docRef = doc(db, 'users', userId, 'financialData', 'monthly', 'entries', branchDocKey(monthKey, branchId));
        const snapshot = await getDocCacheFirst(docRef);

        if (snapshot.exists()) {
            return snapshot.data() as MonthlyFinancialData;
        }
        return {};
    } catch (error) {
        console.error('[FinancialData] Error getting monthly data:', error);
        return {};
    }
};

/** حفظ المصروفات الشهرية (إيجارات، رواتب، إلخ) */
export const saveMonthlyData = async (userId: string, monthKey: string, data: MonthlyFinancialData, branchId?: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    try {
        const docRef = doc(db, 'users', userId, 'financialData', 'monthly', 'entries', branchDocKey(monthKey, branchId));
        await setDoc(docRef, {
            ...data,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (error) {
        console.error('[FinancialData] Error saving monthly data:', error);
        throw error;
    }
};

/**
 * الاشتراك اللحظي في المصروفات الشهريه (cache-first + onSnapshot حقيقي).
 * كان قبل كده one-shot — تحديثات من tab/جهاز تاني ما كانتش بتظهر.
 */
export const subscribeToMonthlyData = (
    userId: string,
    monthKey: string,
    onUpdate: (data: MonthlyFinancialData) => void,
    onError?: (error: string) => void,
    branchId?: string,
) => {
    const docRef = doc(db, 'users', userId, 'financialData', 'monthly', 'entries', branchDocKey(monthKey, branchId));
    return subscribeDocCacheFirst(docRef, {
        next: (snapshot) => {
            onUpdate(snapshot.exists() ? (snapshot.data() as MonthlyFinancialData) : {});
        },
        error: (error) => {
            console.error('[FinancialData] Error reading monthly data:', error);
            if (onError) onError(error?.message || 'Unknown error');
        },
    });
};

/** جلب المصروفات الشهرية لسنة كاملة */
export const getYearlyMonthlyEntries = async (
    userId: string,
    year: number,
    branchId?: string,
): Promise<Record<string, MonthlyFinancialData>> => {
    try {
        const entriesRef = collection(db, 'users', userId, 'financialData', 'monthly', 'entries');
        // قراءة وثائق الفرع/السنة المطلوبَين فقط من Firestore (range query على documentId)
        const { start, end } = branchDocIdRange(`${year}-`, branchId);
        const snapshot = await getDocsCacheFirst(query(
            entriesRef,
            where(documentId(), '>=', start),
            where(documentId(), '<=', end),
        ));

        const entries: Record<string, MonthlyFinancialData> = {};
        snapshot.forEach((d) => {
            const { key } = parseBranchDocKey(d.id);
            entries[key] = d.data() as MonthlyFinancialData;
        });

        return entries;
    } catch (error) {
        console.error('[FinancialData] Error getting yearly monthly entries:', error);
        return {};
    }
};
