/**
 * إنشاء المواعيد من الحجز العام (Create Appointment from Public)
 * هذا الملف هو الجسر الذي يربط بين حجز المريض من الرابط العام وبين جدول مواعيد الطبيب داخل العيادة.
 * الميزات:
 * 1. خصم من "كوتة" الحجوزات المتاحة للطبيب (Quota Management).
 * 2. استخدام التبادل الذري (Atomic Transaction) لضمان حجز الموعد وحذف الفترة الزمنية في لحظة واحدة ومنع الحجز المزدوج.
 * 3. إنشاء نسخة "مرآة" (Mirror) من الحجز في سجل المريض الشخصي لمتابعته لاحقاً.
 */

import { collection, doc, runTransaction } from 'firebase/firestore';
import { ClinicAppointment } from '../../../types';
import { normalizeText } from '../../../utils/textEncoding';
import { consumeBookingQuota } from '../../accountTypeControlsService';
import { db } from '../../firebaseConfig';
import {
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
  /** جنس المريض (ثابت) — ينتقل من فورم الجمهور للموعد */
  gender?: 'male' | 'female';
  /** تاريخ الميلاد — ثابت، لحساب السن تلقائياً في الزيارات القادمة */
  dateOfBirth?: string;
  /** حامل؟ snapshot لهذا الموعد (يُسأل كل زيارة) */
  pregnant?: boolean;
  /** مرضعة؟ snapshot لهذا الموعد */
  breastfeeding?: boolean;
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

  // Check quota before creating the appointment document. Appointment create triggers
  // doctor push notifications, so a post-create rollback can leave a phantom alert.
  await consumeBookingQuota('publicFormBooking', normalizedUserId, normalizedPublicSecret);

  const createdAt = new Date().toISOString();
  const patientName = normalizeText(data.patientName);
  const phone = normalizeText(data.phone);
  const age = normalizeText(data.age);
  const visitReason = normalizeText(data.visitReason);
  const doctorName = normalizeText(meta?.doctorName) || 'غير معروف';
  const doctorSpecialty = normalizeText(meta?.doctorSpecialty);
  const requestedBranchId = typeof data.branchId === 'string' ? data.branchId.trim() : '';
  let resolvedBranchId = requestedBranchId || 'main';
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
    branchId: resolvedBranchId,
    // حقول الهوية الجديدة — تنتشر مع الموعد للسكرتارية والطبيب
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    pregnant: data.pregnant,
    breastfeeding: data.breastfeeding,
  };

  // الـ Slot يبقى متاحاً لباقي الجمهور بعد الحجز — الإخفاء لمن حجز يتم client-side
  // عبر فلترة مواعيد المستخدم. الـ Transaction قبل خصم الكوتة حتى لا نخسرها لو الـ Slot غير موجود.
  //
  // ─── حماية server-side ضد الحجز المكرر (نفس الـslot لنفس المريض) ───
  // قبل ده، الـguard كان client-side فقط (myBookedDateTimes filter). لو مريض شطر فتح
  // متصفحين أو مسح localStorage، كان يقدر يحجز نفس الـslot مرتين. دلوقتي بنحفظ
  // claim doc بـid ثابت بناءً على الـsecret+slot+المعرّف (Google UID أو الهاتف).
  // لو الـclaim موجود = duplicate → نرفض الحجز قبل خصم الكوتة.
  //
  // الـclaim doc محفوظ في collection publicBookingClaims/{claimKey} وفيه:
  // - userId (الطبيب)
  // - slotId
  // - publicUserId أو phoneDigits
  // - createdAt
  // الـrules بتسمح للجميع بكتابة claim جديد بس مش بتعديل/حذف القديم.
  const phoneDigits = String(data.phone || '').replace(/\D/g, '');
  const claimIdentifier = meta?.publicUserId || phoneDigits || 'anonymous';
  const claimKey = `${normalizedPublicSecret}_${normalizedSlotId}_${claimIdentifier}`;
  const claimRef = doc(db, 'publicBookingClaims', claimKey);

  // ─── rate limit: نفس الهاتف عند نفس الطبيب — حد أقصى 5 حجوزات في 24 ساعه ───
  // doc بـid ثابت لكل phone+doctor، فيه bucketStart + count.
  // bucket = أول لحظة في الـ24 ساعه الجارية (UTC). لو الـbucket انتهى، reset.
  // الـlimit الحالي: 5 — مرن لأطباء عيلات (الأب يحجز لأولاده مثلاً).
  const RATE_LIMIT_PER_24H = 5;
  const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
  const rateLimitKey = `${normalizedUserId}_${phoneDigits || 'anonymous'}`;
  const rateLimitRef = doc(db, 'publicBookingRateLimits', rateLimitKey);
  const nowMs = Date.now();

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
    const slotBranchId = typeof slotData.branchId === 'string' ? slotData.branchId.trim() : '';
    if (slotBranchId && requestedBranchId && slotBranchId !== requestedBranchId) {
      throw new Error('public-slot-branch-mismatch');
    }
    resolvedBranchId = slotBranchId || requestedBranchId || 'main';

    // فحص الـclaim — لو موجود يبقى المريض ده حجز نفس الـslot قبل كده
    const claimSnap = await transaction.get(claimRef);
    if (claimSnap.exists()) {
      throw new Error('slot-already-booked-by-user');
    }

    // فحص rate limit — لو الـbucket لسه نشط وعدد الحجوزات تجاوز الحد، رفض
    let bucketCount = 0;
    let bucketStart = nowMs;
    if (phoneDigits) {
      const rateLimitSnap = await transaction.get(rateLimitRef);
      if (rateLimitSnap.exists()) {
        const rateLimitData = rateLimitSnap.data() as Record<string, unknown>;
        const storedBucketStart = Number(rateLimitData.bucketStart) || 0;
        const storedCount = Number(rateLimitData.count) || 0;
        if (nowMs - storedBucketStart < RATE_LIMIT_WINDOW_MS) {
          if (storedCount >= RATE_LIMIT_PER_24H) {
            throw new Error('rate-limit-exceeded');
          }
          bucketStart = storedBucketStart;
          bucketCount = storedCount;
        }
      }
    }

    // claim الـslot للمريض ده — مفتاح ثابت يمنع أي محاوله تانيه لنفس التوليفه
    transaction.set(claimRef, {
      userId: normalizedUserId,
      slotId: normalizedSlotId,
      publicUserId: meta?.publicUserId || null,
      phone: phoneDigits || null,
      appointmentId: appointmentDocRef.id,
      createdAt,
    });

    // تحديث rate limit — increment أو reset البكت
    if (phoneDigits) {
      transaction.set(rateLimitRef, {
        userId: normalizedUserId,
        phone: phoneDigits,
        bucketStart,
        count: bucketCount + 1,
        lastBookingAt: createdAt,
      });
    }

    transaction.set(
      appointmentDocRef,
      omitUndefined({ ...(appointment as unknown as Record<string, unknown>), branchId: resolvedBranchId })
    );
  });

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
        branchId: resolvedBranchId,
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


