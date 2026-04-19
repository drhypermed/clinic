/**
 * إنشاء المواعيد عبر السكرتارية (Secretary Appointment Creation)
 * هذا الملف مسؤول عن عملية تسجيل موعد جديد من خلال لوحة تحكم السكرتير:
 * 1. التحقق من كوتة المواعيد (Booking Quota) المتاحة للطبيب.
 * 2. معالجة بيانات المريض (الاسم، السن، الهاتف، سبب الزيارة).
 * 3. تحديد نوع الموعد (كشف عادي أو استشارة بناءً على بيانات سابقة).
 * 4. حفظ الموعد في مجموعة المواعيد الخاصة بالطبيب مع وسم المصدر بـ 'secretary'.
 */

import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { consumeBookingQuota } from '../../accountTypeControlsService';
import { isQuotaLimitExceededError, isQuotaTransientError } from '../../account-type-controls/quotaErrors';
import { omitUndefined, normalizeBookingSecret, sanitizeDocSegment, toOptionalText } from './helpers';
import type { PaymentType } from '../../../types';

/** البيانات المطلوبة لإنشاء موعد من خلال السكرتارية */
interface CreateAppointmentFromSecretPayload {
  patientName: string;
  age: string;
  phone: string;
  dateTime: string;
  visitReason: string;
  appointmentType?: 'exam' | 'consultation';
  consultationSourceAppointmentId?: string;
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;
  paymentType?: PaymentType;
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

/** 
 * إنشاء موعد جديد وربطه بالدكتور باستخدام الرمز السري للسكرتارية.
 * تتضمن الوظيفة فحص الكوتة مع توفير خطة بديلة (Fallback) لضمان عدم توقف الحجز في حالات ضعف الاتصال.
 */
export const createAppointmentFromSecret = async (
  userId: string,
  bookingSecret: string,
  data: CreateAppointmentFromSecretPayload
): Promise<{ appointmentId: string }> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedBookingSecret = normalizeBookingSecret(bookingSecret);
  if (!normalizedUserId || !normalizedBookingSecret) {
    throw new Error('invalid-booking-context');
  }

  // تحقق تماسك بيانات التأمين والخصم قبل الحفظ لمنع تخزين حالات مستحيلة
  if (data.paymentType === 'insurance' && !toOptionalText(data.insuranceCompanyId)) {
    throw new Error('insurance-company-required');
  }
  if ((data.discountAmount ?? 0) > 0 && (data.discountPercent ?? 0) > 0) {
    throw new Error('discount-conflict');
  }

  console.log('[Firestore] createAppointmentFromSecret called for user:', normalizedUserId);

  try {
    // محاولة استهلاك الكوتة (Quota)
    await consumeBookingQuota('secretaryEntryRequest', normalizedUserId, normalizedBookingSecret);
  } catch (error) {
    if (isQuotaLimitExceededError(error)) {
      throw error; // إذا تجاوز الحد، نوقف العملية
    }
    // في حال وجود خطأ عابر (مثل ضعف الإنترنت)، نستمر في الحجز لضمان انسيابية العمل في العيادة
    if (isQuotaTransientError(error)) {
      console.warn(
        '[Firestore] consumeBookingQuota failed (transient/offline) in secretary booking, continuing with local-first write:',
        error
      );
    } else {
      // خطأ غير عابر (مثل خطأ مصادقة أو تكوين) — نوقف الحجز
      throw error;
    }
  }

  const appointmentsRef = collection(db, 'users', normalizedUserId, 'appointments');

  // الـ branchId يجب أن يُمرَّر من الـ caller (من session السكرتارية).
  // لو مش موجود لأي سبب، نستخدم الفرع الرئيسي كـ fallback صريح بدل undefined.
  const resolvedBranchId = data.branchId || 'main';

  // حماية من الحجز المزدوج: نبحث عن أي موعد معلق في نفس الوقت وبنفس الفرع قبل الإنشاء.
  // ملاحظة: الفحص ليس ذرياً مع الكتابة (Firestore لا يدعم unique constraints)،
  // لكنه يقلّص نافذة التصادم بشكل كبير مقارنة بالكتابة الفورية.
  try {
    const collisionQuery = query(
      appointmentsRef,
      where('dateTime', '==', data.dateTime),
      where('branchId', '==', resolvedBranchId)
    );
    const existing = await getDocs(collisionQuery);
    const hasActiveCollision = existing.docs.some((d) => {
      const raw = d.data() as { examCompletedAt?: unknown };
      return !raw.examCompletedAt;
    });
    if (hasActiveCollision) {
      throw new Error('slot-already-booked');
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'slot-already-booked') throw err;
    // في حال فشل الاستعلام (شبكة/صلاحيات)، نواصل الحجز حتى لا نعطل العمل في العيادة.
    console.warn('[Firestore] Slot collision check failed (continuing with booking):', err);
  }

  const patientName = toOptionalText(data.patientName) || '';
  const phone = toOptionalText(data.phone) || '';
  const age = toOptionalText(data.age) || '';
  const visitReason = toOptionalText(data.visitReason) || '';

  // تحديد ما إذا كان الموعد "استشارة" بناءً على النوع المختار أو وجود بيانات مصدرية لاستشارة
  const normalizedRequestedType = String(data.appointmentType || '').trim().toLowerCase();
  const isConsultationBooking =
    normalizedRequestedType === 'consultation' ||
    Boolean(data.consultationSourceAppointmentId) ||
    Boolean(data.consultationSourceCompletedAt) ||
    Boolean(data.consultationSourceRecordId);

  const appointment = {
    patientName,
    phone,
    dateTime: data.dateTime,
    createdAt: new Date().toISOString(),
    age: age || undefined,
    visitReason: visitReason || undefined,
    source: 'secretary', // وسم المصدر لتمييزه عن الحجز العام أو كشف العيادة المباشر
    appointmentType: isConsultationBooking ? 'consultation' : 'exam',
    consultationSourceAppointmentId: data.consultationSourceAppointmentId,
    consultationSourceCompletedAt: data.consultationSourceCompletedAt,
    consultationSourceRecordId: data.consultationSourceRecordId,
    bookingSecret: normalizedBookingSecret,
    paymentType: data.paymentType ?? 'cash',
    insuranceCompanyId: data.insuranceCompanyId,
    insuranceCompanyName: data.insuranceCompanyName,
    insuranceMembershipId: data.insuranceMembershipId,
    insuranceApprovalCode: data.insuranceApprovalCode,
    patientSharePercent: data.patientSharePercent,
    discountAmount: data.discountAmount,
    discountPercent: data.discountPercent,
    discountReasonId: data.discountReasonId,
    discountReasonLabel: data.discountReasonLabel,
    branchId: resolvedBranchId,
  };

  // إضافة الوثيقة إلى Firestore
  const createdRef = await addDoc(
    appointmentsRef,
    omitUndefined(appointment as unknown as Record<string, unknown>)
  );

  console.log('[Firestore] Appointment created successfully');
  return { appointmentId: createdRef.id };
};

