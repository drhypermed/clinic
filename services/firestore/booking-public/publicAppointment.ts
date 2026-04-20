/**
 * إنشاء المواعيد من الحجز العام (Create Appointment from Public)
 * هذا الملف هو الجسر الذي يربط بين حجز المريض من الرابط العام وبين جدول مواعيد الطبيب داخل العيادة.
 * الميزات:
 * 1. خصم من "كوتة" الحجوزات المتاحة للطبيب (Quota Management).
 * 2. استخدام التبادل الذري (Atomic Transaction) لضمان حجز الموعد وحذف الفترة الزمنية في لحظة واحدة ومنع الحجز المزدوج.
 * 3. إنشاء نسخة "مرآة" (Mirror) من الحجز في سجل المريض الشخصي لمتابعته لاحقاً.
 */

import { collection, deleteDoc, doc, runTransaction } from 'firebase/firestore';
import { ClinicAppointment } from '../../../types';
import { normalizeText } from '../../../utils/textEncoding';
import { consumeBookingQuota } from '../../accountTypeControlsService';
import { db } from '../../firebaseConfig';
import {
  isBookingLimitExceededError,
  normalizePublicSecret,
  omitUndefined,
  sanitizeDocSegment,
} from './helpers';
import { savePublicUserBooking } from './publicUserBookings';

/** البيانات المطلوبة من المريض عند الحجز */
interface PublicBookingPayload {
  patientName: string;
  age: string;
  phone: string;
  visitReason: string;
  /** أول زيارة؟ — من سؤال فورم الجمهور (true/false); undefined لو لم يُحدَّد */
  isFirstVisit?: boolean;
  appointmentType?: 'exam' | 'consultation';
  consultationSourceAppointmentId?: string;
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;
  paymentType?: 'cash' | 'insurance' | 'discount';
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
  insuranceMembershipId?: string;
  insuranceApprovalCode?: string;
  patientSharePercent?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountReasonId?: string;
  discountReasonLabel?: string;
  /** معرّف الفرع */
  branchId?: string;
}

/** بيانات إضافية عن الطبيب والمريض لربط الحسابات */
interface PublicBookingMeta {
  publicUserId?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
}

/** 
 * الوظيفة الرئيسية لتحويل الحجز العام إلى موعد عيادة رسمي.
 * تقوم بالتحقق من التوقيت، وخصم الكوتة، وتوثيق الموعد في قاعدة بيانات الطبيب.
 */
export const createAppointmentFromPublic = async (
  userId: string,
  publicSecret: string,
  slotId: string,
  slotDateTime: string,
  data: PublicBookingPayload,
  meta?: PublicBookingMeta
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedPublicSecret = normalizePublicSecret(publicSecret);
  const normalizedSlotId = sanitizeDocSegment(slotId);

  if (!normalizedUserId || !normalizedPublicSecret || !normalizedSlotId) {
    throw new Error('invalid-public-booking-context');
  }

  // تحقق تماسك بيانات التأمين والخصم قبل الحفظ لمنع تخزين حالات مستحيلة
  if (data.paymentType === 'insurance' && !(data.insuranceCompanyId && data.insuranceCompanyId.trim())) {
    throw new Error('insurance-company-required');
  }
  if ((data.discountAmount ?? 0) > 0 && (data.discountPercent ?? 0) > 0) {
    throw new Error('discount-conflict');
  }

  const createdAt = new Date().toISOString();
  const patientName = normalizeText(data.patientName);
  const phone = normalizeText(data.phone);
  const age = normalizeText(data.age);
  const visitReason = normalizeText(data.visitReason);
  const doctorName = normalizeText(meta?.doctorName) || 'غير معروف';
  const doctorSpecialty = normalizeText(meta?.doctorSpecialty);
  const isConsultationBooking =
    data.appointmentType === 'consultation' || Boolean(data.consultationSourceAppointmentId);

  // مراجع قاعدة البيانات
  const appointmentsRef = collection(db, 'users', normalizedUserId, 'appointments');
  const appointmentDocRef = doc(appointmentsRef);
  const slotRef = doc(db, 'publicBookingConfig', normalizedPublicSecret, 'slots', normalizedSlotId);

  // تجهيز كائن الموعد للعيادة — نستخدم doc ID الفعلي (من Firestore) ليطابق مسار الوثيقة ويمنع أي تناقض عند القراءة
  const appointment: ClinicAppointment & { publicBookingSecret: string } = {
    id: appointmentDocRef.id,
    patientName,
    phone,
    dateTime: slotDateTime,
    createdAt,
    age: age || undefined,
    visitReason: visitReason || undefined,
    isFirstVisit: typeof data.isFirstVisit === 'boolean' ? data.isFirstVisit : undefined,
    source: 'public', // المصدر: حجز عام من الرابط
    publicUserId: meta?.publicUserId,
    appointmentType: isConsultationBooking ? 'consultation' : 'exam',
    consultationSourceAppointmentId: data.consultationSourceAppointmentId,
    consultationSourceCompletedAt: data.consultationSourceCompletedAt,
    consultationSourceRecordId: data.consultationSourceRecordId,
    publicBookingSecret: normalizedPublicSecret,
    paymentType: data.paymentType,
    insuranceCompanyId: data.insuranceCompanyId,
    insuranceCompanyName: data.insuranceCompanyName,
    insuranceMembershipId: data.insuranceMembershipId,
    insuranceApprovalCode: data.insuranceApprovalCode,
    patientSharePercent: data.patientSharePercent,
    discountAmount: data.discountAmount,
    discountPercent: data.discountPercent,
    discountReasonId: data.discountReasonId,
    discountReasonLabel: data.discountReasonLabel,
    branchId: data.branchId,
  };

  // الـ Slot يبقى متاحاً لباقي الجمهور بعد الحجز — الإخفاء لمن حجز يتم client-side
  // عبر فلترة مواعيد المستخدم. الـ Transaction قبل خصم الكوتة حتى لا نخسرها لو الـ Slot غير موجود.
  await runTransaction(db, async (transaction) => {
    const slotSnap = await transaction.get(slotRef);
    if (!slotSnap.exists()) {
      throw new Error('public-slot-not-found');
    }

    const slotData = slotSnap.data() as Record<string, unknown>;
    const storedDateTime = typeof slotData.dateTime === 'string' ? slotData.dateTime : '';
    if (storedDateTime && storedDateTime !== slotDateTime) {
      throw new Error('public-slot-mismatch');
    }

    transaction.set(
      appointmentDocRef,
      omitUndefined(appointment as unknown as Record<string, unknown>)
    );
  });

  // إدارة الكوتة بعد نجاح الحجز: لو فشلت، نحذف الموعد كإجراء تراجعي
  try {
    await consumeBookingQuota('publicFormBooking', normalizedUserId, normalizedPublicSecret);
  } catch (error) {
    try { await deleteDoc(appointmentDocRef); } catch { /* best-effort rollback */ }
    if (isBookingLimitExceededError(error)) throw error;
    throw new Error('booking-quota-check-failed');
  }

  // إنشاء نسخة مرآة (Mirror) في حساب المريض لتمكينه من رؤية مواعيده
  const normalizedPublicUserId = sanitizeDocSegment(meta?.publicUserId);
  if (normalizedPublicUserId) {
    try {
      await savePublicUserBooking(normalizedPublicUserId, {
        id: appointmentDocRef.id,
        doctorId: sanitizeDocSegment(meta?.doctorId) || normalizedUserId,
        doctorName,
        doctorSpecialty,
        dateTime: slotDateTime,
        createdAt,
        patientName,
        phone,
        visitReason: visitReason || undefined,
        appointmentType: isConsultationBooking ? 'consultation' : 'exam',
        consultationSourceAppointmentId: data.consultationSourceAppointmentId,
        consultationSourceCompletedAt: data.consultationSourceCompletedAt,
        consultationSourceRecordId: data.consultationSourceRecordId,
        status: 'pending',
      });
    } catch (error) {
      // فشل التوثيق في جانب المريض لا يجب أن يعطل الحجز عند الطبيب
      console.warn('[Firestore] Public user booking mirror failed (non-blocking):', error);
    }
  }
};


