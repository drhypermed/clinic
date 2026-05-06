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
    where,
    type Query,
} from 'firebase/firestore';
import { getDocsCacheFirst } from './cacheFirst';
import { PatientRecord } from '../../types';
import { DEFAULT_BRANCH_ID } from './branches';

export const patientsService = {
    /**
     * الاشتراك في سجلات المرضى لمستخدم معين مع تحديث لحظي.
     * تتضمن الدالة منطق "رجوع آمن" (Fallback) في حال عدم وجود فهرس (Index) في Firestore.
     *
     * تحسين التكلفة (multi-branch):
     *   - لو الفرع فرعي (≠ main): نضيف where('branchId') للـ subscription عشان
     *     Firestore يقرأ سجلات الفرع فقط بدل ما يقرأ كل السجلات ويفلتر في الذاكرة.
     *   - للفرع الرئيسي أو بدون branchId: نقرأ كل السجلات عشان البيانات القديمة
     *     (قبل نظام الفروع) ما عندهاش حقل branchId — لو طبقنا where عليها هتختفي.
     *
     *   الـ fallback لما الـ composite index (branchId, date desc) ما يكونش
     *   موجود: نسقط على query بـ where فقط بدون orderBy — single-field index
     *   تلقائي، فالـ filter يستمر يعمل ولا نخسر فايدة الـ where.
     *
     * @param branchId - لو تم تمريره، يتم فلترة السجلات حسب الفرع المحدد
     */
    subscribeToRecords: (userId: string, onUpdate: (records: PatientRecord[]) => void, branchId?: string) => {
        const recordsRef = collection(db, 'users', userId, 'records');

        // server-side filter للفروع الفرعية فقط (انظر التعليق أعلاه)
        const isSubBranch = Boolean(branchId) && branchId !== DEFAULT_BRANCH_ID;
        const baseTarget: Query = isSubBranch
            ? query(recordsRef, where('branchId', '==', branchId))
            : recordsRef;
        const orderedTarget: Query = isSubBranch
            ? query(recordsRef, where('branchId', '==', branchId), orderBy('date', 'desc'))
            : query(recordsRef, orderBy('date', 'desc'));

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

            // فلترة حسب الفرع (البيانات القديمة بدون branchId تُعتبر تابعة للفرع الرئيسي).
            // لازمة للفرع الرئيسي اللي بيقرأ كل السجلات؛ للفرع الفرعي الـ where
            // أصلاً فلتر السيرفر، فالـ filter ده لا يضر (مجرد no-op).
            if (branchId) {
                return sorted.filter(r => (r.branchId || DEFAULT_BRANCH_ID) === branchId);
            }

            return sorted;
        };

        getDocsCacheFirst(baseTarget).then(cachedSnapshot => {
            if (!cachedSnapshot.empty) {
                onUpdate(processRecords(cachedSnapshot.docs));
            }
        }).catch(() => {});

        let innerUnsubscribe: (() => void) | null = null;
        // علم بيتفعّل لمّا الـfallback يشتغل — بعد كده نتجاهل أي callback من الـlistener الأصلي
        // عشان ما يحصلش onUpdate() مرتين (واحد من الـorderedTarget + واحد من الـfallback).
        let fallbackActive = false;

        const unsubscribe = onSnapshot(orderedTarget, (snapshot) => {
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
                // مهم: نستخدم baseTarget (مع where لو فرع فرعي) عشان نحافظ على فلتر السيرفر.
                const fallbackSnapshot = await getDocsCacheFirst(baseTarget);
                onUpdate(processRecords(fallbackSnapshot.docs));

                innerUnsubscribe = onSnapshot(baseTarget, (snapshot) => {
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

