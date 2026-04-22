/**
 * خدمة سجلات المرضى (Patients Service)
 * تدير هذه الخدمة بيانات المرضى (الزيارات/السجلات) في Firestore:
 * 1. الاشتراك في السجلات مع معالجة ذكية للأخطاء (فقدان الفهارس/Indexes).
 * 2. حفظ وتحديث السجلات الفردية.
 * 3. حذف السجلات.
 */

import { db } from '../firebaseConfig';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';
import { getDocsCacheFirst } from './cacheFirst';
import { PatientRecord } from '../../types';
import { DEFAULT_BRANCH_ID } from './branches';

export const patientsService = {
    /**
     * الاشتراك في سجلات المرضى لمستخدم معين مع تحديث لحظي.
     * تتضمن الدالة منطق "رجوع آمن" (Fallback) في حال عدم وجود فهرس (Index) في Firestore.
     * @param branchId - لو تم تمريره، يتم فلترة السجلات حسب الفرع المحدد
     */
    subscribeToRecords: (userId: string, onUpdate: (records: PatientRecord[]) => void, branchId?: string) => {
        const recordsRef = collection(db, 'users', userId, 'records');

        // معالج آمن للتاريخ — بيقبل ISO string أو Firestore Timestamp.
        // نفس باترن appointments.ts. لو القيمه مش صالحه بنرجّع 0 عشان الـsort
        // ما يبقاش NaN (NaN بيخلي ترتيب JS غير محدد).
        const getDateMs = (value: unknown): number => {
            if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
                return (value as { toDate: () => Date }).toDate().getTime();
            }
            const ms = new Date(value as string).getTime();
            return Number.isFinite(ms) ? ms : 0;
        };

        /** وظيفة مشتركة لمعالجة البيانات وترتيبها */
        const processRecords = (docs: any[]) => {
            const records = docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as PatientRecord[];

            // الترتيب (تنازلياً حسب التاريخ) - نضمن الترتيب برمجياً تحسباً لأي لغبطة في الفهارس
            const sorted = records.sort((a, b) => {
                return getDateMs(b.date) - getDateMs(a.date);
            });

            // فلترة حسب الفرع (البيانات القديمة بدون branchId تُعتبر تابعة للفرع الرئيسي)
            if (branchId) {
                return sorted.filter(r => (r.branchId || DEFAULT_BRANCH_ID) === branchId);
            }

            return sorted;
        };

        getDocsCacheFirst(recordsRef).then(cachedSnapshot => {
            if (!cachedSnapshot.empty) {
                onUpdate(processRecords(cachedSnapshot.docs));
            }
        }).catch(() => {});

        const orderedQuery = query(recordsRef, orderBy('date', 'desc'));
        let innerUnsubscribe: (() => void) | null = null;
        // علم بيتفعّل لمّا الـfallback يشتغل — بعد كده نتجاهل أي callback من الـlistener الأصلي
        // عشان ما يحصلش onUpdate() مرتين (واحد من الـorderedQuery + واحد من الـfallback).
        let fallbackActive = false;

        const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
            // لو الـfallback اشتغل قبل كده، تجاهل أي success متأخر من الـlistener الأصلي.
            if (fallbackActive) return;
            onUpdate(processRecords(snapshot.docs));
        }, async (error) => {
            console.error("[Firestore] Index missing or query failed:", error);

            // منع تكرار الـfallback لو الـerror handler اتنادى أكتر من مره (شبكه متقطعه مثلاً).
            // بدون الـguard ده، كل error بيفتح listener جديد والقديم يتسرب.
            if (fallbackActive) return;
            fallbackActive = true;

            try {
                // الكاش أولاً (لتجربه فوريّه)، ثم listener بدون ترتيب لتفادي خطأ الـindex.
                const fallbackSnapshot = await getDocsCacheFirst(recordsRef);
                onUpdate(processRecords(fallbackSnapshot.docs));

                innerUnsubscribe = onSnapshot(recordsRef, (snapshot) => {
                    onUpdate(processRecords(snapshot.docs));
                });
            } catch (fallbackError) {
                console.error("[Firestore] Full fallback failed:", fallbackError);
                onUpdate([]);
            }
        });

        // تنظيف موحّد للمستمعين (الأصلي + الـfallback لو اتفعّل)
        return () => {
            unsubscribe();
            if (innerUnsubscribe) innerUnsubscribe();
        };
    },

    /** حفظ سجل جديد أو تحديث سجل موجود */
    saveRecord: async (userId: string, record: PatientRecord) => {
        try {
            const recordRef = doc(db, 'users', userId, 'records', record.id);
            await setDoc(recordRef, record);
        } catch (error) {
            console.error("[Firestore] Error saving record:", error);
            throw error;
        }
    },

    /** حذف سجل مريض نهائياً */
    deleteRecord: async (userId: string, recordId: string) => {
        try {
            const recordRef = doc(db, 'users', userId, 'records', recordId);
            await deleteDoc(recordRef);
        } catch (error) {
            console.error("Error deleting record:", error);
            throw error;
        }
    }
};

