/**
 * خدمة سجلات المرضى (Patients Service)
 * تدير هذه الخدمة عمليات Firestore الفردية على السجلات (حفظ/حذف).
 * القراءة بـpagination الحديثة بتتعمل في hooks/useDrHyper/useDrHyper.realtime.ts.
 */

import { db } from '../firebaseConfig';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { PatientRecord } from '../../types';

export const patientsService = {
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
