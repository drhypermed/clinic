import type { ClinicAppointment, PatientRecord } from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { playNotificationCue } from '../../../utils/notificationSound';
import {
  resolveLatestRecordIdByName,
  resolveLatestRecordIdByPhone,
  resolveSourceRecordIdByPatientAndDay,
  resolveSourceRecordIdFromExamAppointment,
} from './helpers';

/**
 * الملف: useAppointmentExecutionActions.ts (Hook)
 * الوصف: هذا الـ Hook مسؤول عن "تنفيذ" الإجراءات على المواعيد. 
 * عندما يقرر الطبيب "فتح الكشف" لمريض أو "بدء استشارة"، يتم استدعاء الوظائف هنا. 
 * يقوم الـ Hook بـ: 
 * - وسم الموعد كمكتمل (Completed) وتخزين وقت الانتهاء. 
 * - الربط الذكي للاستشارات (Backfill) بالسجلات الطبية القديمة لضمان تسلسل تاريخ المريض. 
 * - إشعار نظام السكرتارية بقبول المريض للدخول (Approved Entry).
 */

interface UseAppointmentExecutionActionsArgs {
  userId: string;
  bookingSecret: string | null;
  records: PatientRecord[];
  sortedList: ClinicAppointment[];
  onOpenExam: (apt: ClinicAppointment) => void;
  onOpenConsultation: (apt: ClinicAppointment) => boolean;
}

export const useAppointmentExecutionActions = ({
  userId,
  bookingSecret,
  records,
  sortedList,
  onOpenExam,
  onOpenConsultation,
}: UseAppointmentExecutionActionsArgs) => {
  /** 
   * محاولة ربط الاستشارة بالسجل الطبي (Consultation Backfill). 
   * نظام الاستشارات يعتمد على وجود "كشف أصلي" سابق. هذا المنطق يبحث في 
   * تاريخ المريض عن أقرب كشف لم تكتمل استشارته بعد لربطه بالموعد الحالي تلقائياً.
   */
  const resolveConsultationRecordId = (apt: ClinicAppointment): string | undefined => {
    // 1. إذا كان الموعد يحتوي بالفعل على معرّف السجل
    if (apt.consultationSourceRecordId) return apt.consultationSourceRecordId;
    
    // 2. إذا كان الموعد مرتبطاً بموعد كشف آخر (لم يحفظ السجل فيه بعد)
    if (apt.consultationSourceAppointmentId) {
      const sourceApt = sortedList.find((item) => item.id === apt.consultationSourceAppointmentId);
      if (sourceApt) {
        const fromSourceAppointment = resolveSourceRecordIdFromExamAppointment(records, sourceApt);
        if (fromSourceAppointment) return fromSourceAppointment;
      }
    }

    // 3. البحث في السجلات بناءً على الاسم والهاتف وتاريخ الكشف المفترض
    const byPatientAndDay = resolveSourceRecordIdByPatientAndDay(
      records, apt.patientName || '', apt.phone, apt.consultationSourceCompletedAt || apt.dateTime
    );
    if (byPatientAndDay) return byPatientAndDay;

    // 4. البحث عن آخر سجل لهذا المريض بأي تاريخ
    return resolveLatestRecordIdByPhone(records, apt.phone) 
           || resolveLatestRecordIdByName(records, apt.patientName || '');
  };

  /** حذف موعد من قائمة المواعيد */
  const removeAppointment = async (id: string) => {
    if (!userId) return;
    try {
      await firestoreService.deleteAppointment(userId, id);
      // 🗑️ صوت حذف — نغمة هابطة لتذكير المستخدم بأن شيئاً أُزيل
      void playNotificationCue('appointment_deleted');
    } catch (err) {
      // ❌ صوت خطأ
      void playNotificationCue('error');
      console.error('Error deleting appointment:', err);
    }
  };

  /** بدء الكشف (تحويل الموعد إلى كشف فعلي) */
  const openExam = async (apt: ClinicAppointment) => {
    if (!userId) return;

    // إشعار السكرتارية بقبول دخول المريض
    if (bookingSecret) {
      firestoreService.addSecretaryApprovedEntryId(bookingSecret, apt.id, apt.branchId).catch(() => { });
    }
    // تمرير كامل بيانات الموعد (بما فيها بيانات التأمين) لفتح شاشة الكشف
    onOpenExam(apt);
  };

  /** بدء الاستشارة */
  const openConsultation = async (apt: ClinicAppointment) => {
    if (!userId) return;
    const consultationSourceRecordId = resolveConsultationRecordId(apt);
    
    const resolvedForOpen: ClinicAppointment = consultationSourceRecordId
      ? { ...apt, consultationSourceRecordId }
      : apt;

    // تحديث بيانات الموعد لربطه بالسجل المكتشف (Backfill)
    if (consultationSourceRecordId && !apt.consultationSourceRecordId) {
      firestoreService.saveAppointment(userId, resolvedForOpen).catch(() => {});
    }

    // تنفيذ عملية فتح شاشة الاستشارة في المكون الرئيسي
    const opened = onOpenConsultation(resolvedForOpen);
    if (!opened) return;
    
    if (bookingSecret) {
      firestoreService.addSecretaryApprovedEntryId(bookingSecret, apt.id, apt.branchId).catch(() => { });
    }
  };

  return { removeAppointment, openExam, openConsultation };
};
