/**
 * عمليات البيانات المالية اليومية (Daily Financial Entries)
 *
 * يحتوي هذا الـ module على كل الوظائف المرتبطة بـ "المستند اليومي" المخزن
 * تحت المسار: `users/{uid}/financialData/daily/entries/{YYYY-MM-DD}`
 *
 * الوظائف المتاحة:
 *   - `getDailyData`         : جلب اليوم (قراءة واحدة).
 *   - `saveDailyData`        : حفظ/دمج بيانات اليوم.
 *   - `subscribeToDailyData` : اشتراك لحظي في اليوم.
 *   - `getAllDailyEntriesForMonth` : جلب كل أيام شهر معيّن.
 *   - `getYearlyDailyEntries`: جلب كل أيام سنة معيّنة (لتقارير الأرباح السنوية).
 */

import { collection, doc, query, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst } from '../firestore/cacheFirst';
import type { DailyFinancialData } from './types';
import { branchDocKey, parseBranchDocKey } from './normalizers';

/** جلب البيانات المالية اليومية لتاريخ محدد (مفتاح التاريخ بصيغة YYYY-MM-DD) */
export const getDailyData = async (userId: string, dateKey: string, branchId?: string): Promise<DailyFinancialData> => {
    try {
        const docRef = doc(db, 'users', userId, 'financialData', 'daily', 'entries', branchDocKey(dateKey, branchId));
        const snapshot = await getDocCacheFirst(docRef);

        if (snapshot.exists()) {
            return snapshot.data() as DailyFinancialData;
        }
        return {};
    } catch (error) {
        console.error('[FinancialData] Error getting daily data:', error);
        return {};
    }
};

/** حفظ البيانات المالية اليومية لتاريخ محدد مع دمج البيانات الحالية (Merge) */
export const saveDailyData = async (userId: string, dateKey: string, data: DailyFinancialData, branchId?: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    try {
        const docRef = doc(db, 'users', userId, 'financialData', 'daily', 'entries', branchDocKey(dateKey, branchId));
        await setDoc(docRef, {
            ...data,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (error) {
        console.error('[FinancialData] Error saving daily data:', error);
        throw error;
    }
};

/** الاشتراك في تحديثات البيانات اليومية لحظة بلحظة */
export const subscribeToDailyData = (
    userId: string,
    dateKey: string,
    onUpdate: (data: DailyFinancialData) => void,
    onError?: (error: string) => void,
    branchId?: string,
) => {
    const docRef = doc(db, 'users', userId, 'financialData', 'daily', 'entries', branchDocKey(dateKey, branchId));
    let cancelled = false;

    getDocCacheFirst(docRef).then((snapshot) => {
        if (cancelled) return;
        if (snapshot.exists()) {
            onUpdate(snapshot.data() as DailyFinancialData);
        } else {
            onUpdate({});
        }
    }).catch((error) => {
        if (cancelled) return;
        console.error('[FinancialData] Error reading daily data:', error);
        if (onError) onError(error?.message || 'Unknown error');
    });

    return () => { cancelled = true; };
};

/** جلب جميع إدخالات الأيام لشهر محدد (لغرض حساب الإجماليات والتقارير) */
export const getAllDailyEntriesForMonth = async (
    userId: string,
    monthKey: string,
    branchId?: string,
): Promise<Record<string, DailyFinancialData>> => {
    try {
        const entriesRef = collection(db, 'users', userId, 'financialData', 'daily', 'entries');
        const snapshot = await getDocsCacheFirst(query(entriesRef));

        const entries: Record<string, DailyFinancialData> = {};
        snapshot.forEach((d) => {
            const parsed = parseBranchDocKey(d.id);
            // فلترة حسب الفرع ثم حسب الشهر
            const targetBranch = branchId || 'main';
            if (parsed.branchId === targetBranch && parsed.key.startsWith(monthKey)) {
                entries[parsed.key] = d.data() as DailyFinancialData;
            }
        });

        return entries;
    } catch (error) {
        console.error('[FinancialData] Error getting all daily entries:', error);
        return {};
    }
};

/** جلب جميع الإدخالات اليومية لسنة كاملة (لغرض تقارير الأرباح السنوية) */
export const getYearlyDailyEntries = async (
    userId: string,
    year: number,
    branchId?: string,
): Promise<Record<string, DailyFinancialData>> => {
    try {
        const entriesRef = collection(db, 'users', userId, 'financialData', 'daily', 'entries');
        const snapshot = await getDocsCacheFirst(query(entriesRef));

        const entries: Record<string, DailyFinancialData> = {};
        const prefix = `${year}-`;
        snapshot.forEach((d) => {
            const parsed = parseBranchDocKey(d.id);
            const targetBranch = branchId || 'main';
            if (parsed.branchId === targetBranch && parsed.key.startsWith(prefix)) {
                entries[parsed.key] = d.data() as DailyFinancialData;
            }
        });

        return entries;
    } catch (error) {
        console.error('[FinancialData] Error getting yearly daily entries:', error);
        return {};
    }
};
