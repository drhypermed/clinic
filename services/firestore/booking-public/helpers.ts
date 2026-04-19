/**
 * مساعدات الحجز العام (Public Booking Helpers)
 * هذا الملف يحتوي على دوال مساعدة لعملية حجز المرضى من خلال الروابط العامة:
 * 1. تنظيف وتأمين أسماء المجموعات (Segments) في قاعدة البيانات.
 * 2. توليد والتحقق من "الرموز السرية" (Secrets) للحجز العام.
 * 3. التعامل الآمن مع التخزين المحلي (LocalStorage) لبيانات المريض.
 * 4. توحيد بيانات الحجوزات والمراجعات (Reviews).
 */

import { DoctorPublicReview, PublicUserBooking } from '../../../types';
import { getSecureRandomHex } from '../../../utils/cryptoHelpers';
import { isBookingLimitExceededError as sharedIsBookingLimitExceededError } from '../../../utils/errorHelpers';
import { omitUndefined as sharedOmitUndefined } from '../../../utils/firestoreHelpers';
import { safeLsGet, safeLsSet } from '../../../utils/localStorageHelpers';
import { normalizeText } from '../../../utils/textEncoding';
import { USER_TEXT_MAX_LENGTH, clampUserTextLength } from '../../../utils/userTextLengthPolicy';

/** نمط الرمز السري للحجز العام: يبدأ بـ p_ ويليه حروف وأرقام */
const PUBLIC_SECRET_PATTERN = /^p_[a-z0-9]{10,120}$/i;

/** تنظيف الجزء المستخدم في مسار قاعدة البيانات (Doc Segment) لمنع أي محاولات اختراق للمسارات */
export const sanitizeDocSegment = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  if (!normalized) return '';
  if (normalized.includes('/')) return '';
  return normalized;
};

/** التأكد من أن الرمز السري للحجز العام يتبع النمط الصحيح وآمن للاستخدام */
export const normalizePublicSecret = (value: unknown): string => {
  const normalized = sanitizeDocSegment(value);
  if (!normalized) return '';
  return PUBLIC_SECRET_PATTERN.test(normalized) ? normalized : '';
};

/** إنشاء رمز سري عشوائي جديد للحجز العام p_... */
export const createPublicBookingSecret = (): string => {
  const randomPart = getSecureRandomHex(16);
  const timePart = Date.now().toString(36);
  return `p_${randomPart}${timePart}`;
};

/** قراءة نص من LocalStorage بأمان لتجنب أخطاء SSR أو القيود */
export const readLocalStorageSafe = (key: string): string | null => safeLsGet(key);

/** حفظ نص في LocalStorage بأمان */
export const writeLocalStorageSafe = (key: string, value: string): void => safeLsSet(key, value);

/** التحقق مما إذا كان الوقت المختار قد ولى (منتهي الصلاحية) */
export const isSlotExpired = (dateTime: unknown, nowMs: number): boolean => {
  const t =
    dateTime && typeof (dateTime as { toDate?: () => Date }).toDate === 'function'
      ? (dateTime as { toDate: () => Date }).toDate().getTime()
      : new Date(dateTime as string).getTime();
  return Number.isFinite(t) && t < nowMs;
};

export const toOptionalText = (value: unknown): string | undefined => {
  const normalized = clampUserTextLength(normalizeText(value), USER_TEXT_MAX_LENGTH);
  return normalized || undefined;
};

/** حذف الحقول التي قيمتها undefined من الكائن قبل إرساله لقاعدة البيانات */
export const omitUndefined = sharedOmitUndefined;

/** التحقق من وصول الطبيب إلى حد الحجوزات اليومي المسموح به */
export const isBookingLimitExceededError = sharedIsBookingLimitExceededError;

/** توحيد ومعالجة بيانات حجز المريض القادمة من الواجهة العامة */
export const normalizePublicUserBooking = (
  id: string,
  data: Record<string, unknown>
): PublicUserBooking => ({
  id,
  doctorId: typeof data.doctorId === 'string' ? data.doctorId.trim() : '',
  doctorName: normalizeText(data.doctorName) || 'غير معروف',
  doctorSpecialty: normalizeText(data.doctorSpecialty),
  dateTime: typeof data.dateTime === 'string' ? data.dateTime : '',
  createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
  patientName: normalizeText(data.patientName),
  phone: normalizeText(data.phone),
  visitReason: toOptionalText(data.visitReason),
  appointmentType:
    data.appointmentType === 'consultation'
      ? 'consultation'
      : data.appointmentType === 'exam'
        ? 'exam'
        : undefined,
  consultationSourceAppointmentId:
    typeof data.consultationSourceAppointmentId === 'string'
      ? data.consultationSourceAppointmentId
      : undefined,
  consultationSourceCompletedAt:
    typeof data.consultationSourceCompletedAt === 'string'
      ? data.consultationSourceCompletedAt
      : undefined,
  consultationSourceRecordId:
    typeof data.consultationSourceRecordId === 'string' ? data.consultationSourceRecordId : undefined,
  status: data.status === 'completed' ? 'completed' : 'pending',
  completedAt: typeof data.completedAt === 'string' ? data.completedAt : undefined,
  rating:
    typeof data.rating === 'number' && Number.isFinite(data.rating)
      ? Math.min(5, Math.max(1, Math.round(data.rating)))
      : undefined,
  reviewComment: toOptionalText(data.reviewComment),
  reviewedAt: typeof data.reviewedAt === 'string' ? data.reviewedAt : undefined,
});

/** توحيد ومعالجة بيانات تقييم المريض للطبيب */
export const normalizeDoctorPublicReview = (
  id: string,
  data: Record<string, unknown>
): DoctorPublicReview | null => {
  const doctorId = typeof data.doctorId === 'string' ? data.doctorId.trim() : '';
  const bookingId = typeof data.bookingId === 'string' ? data.bookingId.trim() : '';
  const publicUserId = typeof data.publicUserId === 'string' ? data.publicUserId.trim() : '';
  const rating =
    typeof data.rating === 'number' && Number.isFinite(data.rating)
      ? Math.min(5, Math.max(1, Math.round(data.rating)))
      : null;
  const reviewedAt = typeof data.reviewedAt === 'string' ? data.reviewedAt : '';

  if (data.isDeleted === true) return null;
  if (!doctorId || !bookingId || !reviewedAt || rating == null) return null;

  const reviewComment =
    toOptionalText(data.reviewComment) || toOptionalText(data.comment) || toOptionalText(data.feedback);
  const patientName =
    toOptionalText(data.patientName) || toOptionalText(data.publicUserName) || toOptionalText(data.name);

  return {
    id,
    doctorId,
    bookingId,
    publicUserId: publicUserId || 'unknown',
    rating,
    reviewComment,
    reviewedAt,
    patientName,
  };
};

