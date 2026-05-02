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

import { collection, doc, documentId, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst, subscribeDocCacheFirst } from '../firestore/cacheFirst';
import type { DailyFinancialData } from './types';
import { branchDocIdRange, branchDocKey, parseBranchDocKey } from './normalizers';

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

/**
 * الاشتراك اللحظي في تحديثات البيانات اليوميه (cache-first + onSnapshot حقيقي).
 * كان قبل كده one-shot — لو tab تاني كتب نفس اليوم، الـUI ما كانش بيشوف التحديث.
 */
export const subscribeToDailyData = (
    userId: string,
    dateKey: string,
    onUpdate: (data: DailyFinancialData) => void,
    onError?: (error: string) => void,
    branchId?: string,
) => {
    const docRef = doc(db, 'users', userId, 'financialData', 'daily', 'entries', branchDocKey(dateKey, branchId));
    return subscribeDocCacheFirst(docRef, {
        next: (snapshot) => {
            onUpdate(snapshot.exists() ? (snapshot.data() as DailyFinancialData) : {});
        },
        error: (error) => {
            console.error('[FinancialData] Error reading daily data:', error);
            if (onError) onError(error?.message || 'Unknown error');
        },
    });
};

/** جلب جميع إدخالات الأيام لشهر محدد (لغرض حساب الإجماليات والتقارير) */
export const getAllDailyEntriesForMonth = async (
    userId: string,
    monthKey: string,
    branchId?: string,
): Promise<Record<string, DailyFinancialData>> => {
    try {
        const entriesRef = collection(db, 'users', userId, 'financialData', 'daily', 'entries');
        // قراءة الفرع المطلوب للشهر فقط من Firestore مباشرة (بدل قراءة كل البيانات وفلترة في الذاكرة)
        const { start, end } = branchDocIdRange(`${monthKey}-`, branchId);
        const snapshot = await getDocsCacheFirst(query(
            entriesRef,
            where(documentId(), '>=', start),
            where(documentId(), '<=', end),
        ));

        const entries: Record<string, DailyFinancialData> = {};
        snapshot.forEach((d) => {
            // الـ Firestore range ضمن إن النتائج تخص الفرع والشهر المطلوبَين فقط — parseBranchDocKey للحصول على المفتاح المنظف
            const { key } = parseBranchDocKey(d.id);
            entries[key] = d.data() as DailyFinancialData;
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
        // قراءة وثائق الفرع/السنة المطلوبَين فقط — يقلل القراءات بكتير عند ٣ فروع × عدة سنوات
        const { start, end } = branchDocIdRange(`${year}-`, branchId);
        const snapshot = await getDocsCacheFirst(query(
            entriesRef,
            where(documentId(), '>=', start),
            where(documentId(), '<=', end),
        ));

        const entries: Record<string, DailyFinancialData> = {};
        snapshot.forEach((d) => {
            const { key } = parseBranchDocKey(d.id);
            entries[key] = d.data() as DailyFinancialData;
        });

        return entries;
    } catch (error) {
        console.error('[FinancialData] Error getting yearly daily entries:', error);
        return {};
    }
};
