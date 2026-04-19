/** أنواع المواعيد المتاحة في النظام */
type AppointmentTypeValue = 'exam' | 'consultation';

/** 
 * واجهة بيانات الموعد (AppointmentTypeLike):
 * تُستخدم للتعامل مع الكائنات التي قد تحتوي على معلومات عن نوع الزيارة.
 */
interface AppointmentTypeLike {
  appointmentType?: string | null;                // 'exam' (كشف) أو 'consultation' (استشارة)
  consultationSourceAppointmentId?: string | null; // معرف موعد الكشف الأصلي (في حال كانت استشارة)
  consultationSourceCompletedAt?: string | null;
  consultationSourceRecordId?: string | null;
}

/** تطبيع نص نوع الموعد للمقارنة البرمجية */
const normalizeAppointmentType = (value?: string | null): string =>
  String(value || '').trim().toLowerCase();

/** 
 * التحقق من وجود "علامات الاستشارة" (Consultation Markers):
 * حتى لو لم يتم تحديد النوع صراحة، إذا وُجدت روابط لموعد سابق، نعتبرها استشارة.
 */
const hasConsultationMarkers = (value: AppointmentTypeLike): boolean => Boolean(
  value.consultationSourceAppointmentId ||
  value.consultationSourceCompletedAt ||
  value.consultationSourceRecordId
);

/** 
 * استنتاج نوع الموعد (resolveAppointmentType):
 * دالة ذكية تحدد ما إذا كان المريض قادم لكشف جديد (Payable) 
 * أم لاستشارة مجانية/متابعة بناءً على حقول البيانات المختلفة.
 */
export const resolveAppointmentType = (value: AppointmentTypeLike): AppointmentTypeValue => {
  const normalizedType = normalizeAppointmentType(value.appointmentType);
  if (normalizedType === 'consultation') return 'consultation';
  if (normalizedType === 'exam') return 'exam';
  
  // إذا لم يُذكر النوع، نتحقق من وجود "روابط" لموعد كشف سابق
  return hasConsultationMarkers(value) ? 'consultation' : 'exam';
};

/** هل هذا الموعد استشارة؟ */
export const isConsultationAppointment = (value: AppointmentTypeLike): boolean =>
  resolveAppointmentType(value) === 'consultation';

/** هل يحتوي الكائن على أي تلميح لنوع الموعد؟ */
export const hasAppointmentTypeHint = (value: AppointmentTypeLike): boolean => Boolean(
  (typeof value.appointmentType === 'string' && value.appointmentType.trim().length > 0) ||
  hasConsultationMarkers(value)
);
