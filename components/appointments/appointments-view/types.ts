import type {
  ClinicAppointment,
  CustomBox,
  PatientRecord,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
  VitalSignConfig,
} from '../../../types';

/**
 * الملف: types.ts
 * الوصف: تحديد الهياكل البيانية (Interfaces) المستخدمة حصرياً في وحدة عرض المواعيد. 
 * تضمن هذه التعريفات وضوح تدفق البيانات (Type Safety) بين المكونات المختلفة، 
 * مثل خصائص شاشة المواعيد وتنبيهات الاستجابة من السكرتارية.
 */

/** خصائص مكون عرض المواعيد الرئيسي */
export interface AppointmentsViewProps {
  bookingSecret: string | null;            // المعرف السري لروابط الحجز
  onBookingSecretReady?: (secret: string) => void;
  prescriptionVitalsConfig?: VitalSignConfig[];
  prescriptionCustomBoxes?: CustomBox[];
  onSyncSecretaryVitalsVisibility?: (
    visibility: SecretaryVitalsVisibility,
    fields: SecretaryVitalFieldDefinition[],
    resolvedSecret?: string
  ) => Promise<void> | void;
  records: PatientRecord[];                // سجلات المرضى التاريخية
  appointments: ClinicAppointment[];       // قائمة المواعيد الحالية
  onOpenExam: (apt: ClinicAppointment) => void; // دالة فتح كشف جديد (تستقبل الموعد كاملاً)
  onOpenConsultation: (apt: ClinicAppointment) => boolean;                // دالة فتح استشارة
  showNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
  onClose: () => void;
  /** الفرع النشط — يُستخدم لمزامنة دليل المرضى per-branch */
  activeBranchId?: string;
}

/** تمثيل لمجموعة مواعيد في يوم واحد */
export interface AppointmentDayGroup {
  date: string;                           // التاريخ (YYYY-MM-DD)
  appointments: ClinicAppointment[];      // قائمة المواعيد في هذا اليوم
}

/** هيكل رد السكرتارية على طلب دخول مريض */
export interface SecretaryEntryAlertResponse {
  status: 'approved' | 'rejected';        // حالة الطلب (مقبول / مرفوض)
  appointmentId: string;                  // معرّف الموعد المعني
  respondedAt: string;                    // وقت الاستجابة
}
