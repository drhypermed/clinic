/**
 * سجل تغييرات الأسعار (Price Change History)
 *
 * كل تعديل على الأسعار الثابتة (عبر `saveFixedPricesWithHistory` في `prices.ts`)
 * يُسجَّل كمستند في:
 * `users/{uid}/financialData/priceHistory/entries/{autoId}`
 *
 * هذا الـ module يوفر وظائف قراءة وحذف سجلات التاريخ:
 *   - `getPriceChangeHistory`  : جلب كل السجلات مرتبة من الأحدث للأقدم.
 *   - `deletePriceChangeEntry` : حذف سجل واحد نهائياً.
 */

import { deleteDoc, doc, query } from 'firebase/firestore';
import { getDocsCacheFirst } from '../firestore/cacheFirst';
import {
    getPriceHistoryEntriesCollection,
    toPriceChangeHistoryEntry,
} from './normalizers';
import type { PriceChangeHistoryEntry } from './types';

/** جلب سجل تغييرات الأسعار (الأحدث أولاً) — مع فلترة اختيارية حسب الفرع */
export const getPriceChangeHistory = async (userId: string, branchId?: string): Promise<PriceChangeHistoryEntry[]> => {
    try {
        const historyRef = getPriceHistoryEntriesCollection(userId);
        const snapshot = await getDocsCacheFirst(query(historyRef));

        const targetBranch = (!branchId || branchId === 'main') ? undefined : branchId;
        const entries: PriceChangeHistoryEntry[] = [];
        snapshot.forEach((entry) => {
            const data = entry.data() as {
                changedAt?: unknown;
                updatedAt?: unknown;
                createdAt?: unknown;
                oldExaminationPrice?: unknown;
                newExaminationPrice?: unknown;
                oldConsultationPrice?: unknown;
                newConsultationPrice?: unknown;
                branchId?: string;
            };
            // فلترة: السجلات بدون branchId تخص الفرع الرئيسي
            const entryBranch = data.branchId || undefined;
            if (entryBranch === targetBranch) {
                entries.push(toPriceChangeHistoryEntry(entry.id, data));
            }
        });

        entries.sort((a, b) => b.changedAt - a.changedAt);
        return entries;
    } catch {
        return [];
    }
};

/** حذف إدخال من سجل تغييرات الأسعار سحابياً */
export const deletePriceChangeEntry = async (userId: string, entryId: string): Promise<void> => {
    const historyRef = getPriceHistoryEntriesCollection(userId);
    await deleteDoc(doc(historyRef, entryId));
};
