/**
 * إدارة حجوزات وتقييمات المرضى (Public User Bookings & Reviews)
 * هذا الملف هو المحرك الرئيسي لعملية الحجز من طرف المريض:
 * 1. حفظ وتعديل بيانات الحجز الخاصة بالمريض.
 * 2. متابعة حالة الحجز (مكتمل، ملغى، إلخ).
 * 3. نظام التقييمات (Reviews): تقديم مراجعات الطبيب مع تحديث إحصائيات التقييم (Rating)
 *    عبر عمليات تبادلية (Transactions) لضمان دقة البيانات.
 */

import { collection, doc, onSnapshot, orderBy, query, runTransaction, setDoc } from 'firebase/firestore';
import { DoctorPublicReview, PublicUserBooking } from '../../../types';
import { normalizeText } from '../../../utils/textEncoding';
import { db } from '../../firebaseConfig';
import { getDocsCacheFirst } from '../cacheFirst';
import {
  normalizeDoctorPublicReview,
  normalizePublicUserBooking,
  omitUndefined,
  sanitizeDocSegment,
  toOptionalText,
} from './helpers';

/** حفظ بيانات الحجز الخاصة بالمريض في سجله الشخصي */
export const savePublicUserBooking = async (
  publicUserId: string,
  booking: PublicUserBooking
): Promise<void> => {
  const normalizedPublicUserId = sanitizeDocSegment(publicUserId);
  const normalizedBookingId = sanitizeDocSegment(booking.id);
  if (!normalizedPublicUserId || !normalizedBookingId) return;

  const bookingRef = doc(db, 'users', normalizedPublicUserId, 'publicBookings', normalizedBookingId);
  
  // تنظيف وتجهيز البيانات للتخزين
  const sanitizedBooking = omitUndefined({
    ...booking,
    id: normalizedBookingId,
    doctorName: normalizeText(booking.doctorName) || 'غير معروف',
    doctorSpecialty: normalizeText(booking.doctorSpecialty),
    patientName: normalizeText(booking.patientName),
    phone: normalizeText(booking.phone),
    visitReason: booking.visitReason ? normalizeText(booking.visitReason) : undefined,
    reviewComment: booking.reviewComment ? normalizeText(booking.reviewComment) : undefined,
    completedAt: booking.completedAt,
    rating: booking.rating,
    reviewedAt: booking.reviewedAt,
  });

  await setDoc(bookingRef, sanitizedBooking, { merge: true });
};

/** الاشتراك اللحظي في قائمة حجوزات المريض يظهر له مواعيده القادمة والسابقة */
export const subscribeToPublicUserBookings = (
  publicUserId: string,
  onUpdate: (bookings: PublicUserBooking[]) => void
) => {
  const normalizedPublicUserId = sanitizeDocSegment(publicUserId);
  if (!normalizedPublicUserId) {
    onUpdate([]);
    return () => undefined;
  }

  const bookingsRef = collection(db, 'users', normalizedPublicUserId, 'publicBookings');
  const q = query(bookingsRef, orderBy('createdAt', 'desc'));

  /** معالجة وتحويل البيانات للشكل الموحد */
  const handleSnap = (snapshot: any) => {
    const bookings = snapshot.docs
      .map((item: any) => normalizePublicUserBooking(item.id, item.data() as Record<string, unknown>))
      .filter((item) => Boolean(item.dateTime));
    onUpdate(bookings);
  };

  // 1. القراءة من الكاش أولاً (0ms)
  getDocsCacheFirst(q).then(snap => {
    if (!snap.empty) handleSnap(snap);
  }).catch(() => {});

  // 2. المزامنة من السيرفر
  return onSnapshot(
    q,
    handleSnap,
    (error) => {
      console.error('[Firestore] Error subscribing to public user bookings:', error);
      onUpdate([]);
    }
  );
};

/**
 * جلب حجوزات المريض مرّه واحده فقط (بدون listener دائم).
 * بيستخدم cache-first: لو فيه كاش يرجّع فوراً، مفيش كاش = طلب واحد للسيرفر.
 * ده بديل آمن ورخيص لـsubscribeToPublicUserBookings في الصفحات اللي مش محتاجه
 * مزامنه لحظيّه (زي صفحه الجمهور — مفيش طبيب هيغيّر حجوزات المريض من بعيد).
 *
 * لو المستخدم فتح panel حجوزاتي، بنجيبها بس وقتها = توفير 99% من القراءات.
 */
export const getPublicUserBookingsOnce = async (
  publicUserId: string
): Promise<PublicUserBooking[]> => {
  const normalizedPublicUserId = sanitizeDocSegment(publicUserId);
  if (!normalizedPublicUserId) return [];

  const bookingsRef = collection(db, 'users', normalizedPublicUserId, 'publicBookings');
  const q = query(bookingsRef, orderBy('createdAt', 'desc'));

  try {
    const snapshot = await getDocsCacheFirst(q);
    return snapshot.docs
      .map((item: any) => normalizePublicUserBooking(item.id, item.data() as Record<string, unknown>))
      .filter((item) => Boolean(item.dateTime));
  } catch (error) {
    console.error('[Firestore] Error fetching public user bookings:', error);
    return [];
  }
};

/** تحديث حالة الحجز إلى "مكتمل" عند انتهاء التوقيت أو تأكيد الطبيب */
export const markPublicUserBookingCompleted = async (
  publicUserId: string,
  bookingId: string,
  completedAt: string
): Promise<void> => {
  const normalizedPublicUserId = sanitizeDocSegment(publicUserId);
  const normalizedBookingId = sanitizeDocSegment(bookingId);
  if (!normalizedPublicUserId || !normalizedBookingId) return;

  const bookingRef = doc(db, 'users', normalizedPublicUserId, 'publicBookings', normalizedBookingId);
  await setDoc(
    bookingRef,
    {
      status: 'completed',
      completedAt,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

/** 
 * تقديم تقييم ومراجعة للطبيب (Submit Review).
 * عملية معقدة تستخدم الـ Transaction لتحديث 3 أماكن في وقت واحد:
 * 1. حجز المريض (لإضافة التقييم).
 * 2. ملف الطبيب (Doctor Ad) لتحديث متوسط التقييم (Average Rating).
 * 3. سجل المراجعات العام للطبيب (للعرض العام).
 */
export const submitPublicUserBookingReview = async (
  publicUserId: string,
  bookingId: string,
  rating: number,
  reviewComment?: string
): Promise<void> => {
  const normalizedPublicUserId = sanitizeDocSegment(publicUserId);
  const normalizedBookingId = sanitizeDocSegment(bookingId);
  if (!normalizedPublicUserId || !normalizedBookingId) return;

  const nextRating = Math.max(1, Math.min(5, Math.round(rating)));
  const comment = typeof reviewComment === 'string' ? normalizeText(reviewComment).slice(0, 600) : '';
  const bookingRef = doc(db, 'users', normalizedPublicUserId, 'publicBookings', normalizedBookingId);
  const nowIso = new Date().toISOString();

  await runTransaction(db, async (transaction) => {
    // 1. التحقق من صلاحية الحجز للتقييم
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) throw new Error('booking-not-found');

    const bookingData = bookingSnap.data() as Record<string, unknown>;
    const doctorId = sanitizeDocSegment(bookingData.doctorId);
    if (!doctorId) throw new Error('booking-missing-doctor');
    if (bookingData.status !== 'completed') throw new Error('booking-not-completed');
    if (
      (typeof bookingData.reviewedAt === 'string' && bookingData.reviewedAt.trim()) ||
      (typeof bookingData.rating === 'number' && Number.isFinite(bookingData.rating))
    ) {
      throw new Error('booking-already-reviewed');
    }

    const reviewRef = doc(db, 'doctorAdReviews', doctorId, 'items', normalizedBookingId);
    // 2. كتابة التقييم في حجز المريض + سجل المراجعات فقط.
    // تجميع ratingAverage/ratingCount/ratingTotal يتم الآن Server-side عبر Cloud Function.
    transaction.set(
      bookingRef,
      {
        rating: nextRating,
        reviewComment: comment || '',
        reviewedAt: nowIso,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    transaction.set(
      reviewRef,
      omitUndefined({
        doctorId,
        bookingId: normalizedBookingId,
        publicUserId: normalizedPublicUserId,
        rating: nextRating,
        reviewComment: comment || undefined,
        reviewedAt: nowIso,
        patientName: toOptionalText(bookingData.patientName),
        updatedAt: nowIso,
      })
    );
  });
};

/** 
 * حذف مراجعة سابقة (Delete Review).
 * تستخدم الـ Transaction أيضاً لعكس الحسابات الرياضية لمتوسط التقييم بدقة.
 */
export const deletePublicUserBookingReview = async (
  publicUserId: string,
  bookingId: string
): Promise<void> => {
  const normalizedPublicUserId = sanitizeDocSegment(publicUserId);
  const normalizedBookingId = sanitizeDocSegment(bookingId);
  if (!normalizedPublicUserId || !normalizedBookingId) return;

  const bookingRef = doc(db, 'users', normalizedPublicUserId, 'publicBookings', normalizedBookingId);
  const nowIso = new Date().toISOString();

  await runTransaction(db, async (transaction) => {
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) throw new Error('booking-not-found');

    const bookingData = bookingSnap.data() as Record<string, unknown>;
    const doctorId = sanitizeDocSegment(bookingData.doctorId);
    if (!doctorId) throw new Error('booking-missing-doctor');
    if (bookingData.status !== 'completed') throw new Error('booking-not-completed');

    const currentRating =
      typeof bookingData.rating === 'number' && Number.isFinite(bookingData.rating)
        ? Math.min(5, Math.max(1, Math.round(bookingData.rating)))
        : null;
    if (currentRating == null) throw new Error('booking-review-not-found');

    const reviewRef = doc(db, 'doctorAdReviews', doctorId, 'items', normalizedBookingId);

    transaction.set(
      bookingRef,
      {
        rating: null,
        reviewComment: null,
        reviewedAt: null,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    transaction.delete(reviewRef);
  });
};

/** الاشتراك في مراجعات طبيب معين لعرضها في ملفه الشخصي العام للجمهور */
export const subscribeToDoctorPublicReviews = (
  doctorId: string,
  onUpdate: (reviews: DoctorPublicReview[]) => void
) => {
  const normalizedDoctorId = sanitizeDocSegment(doctorId);
  if (!normalizedDoctorId) {
    onUpdate([]);
    return () => undefined;
  }

  const reviewsRef = collection(db, 'doctorAdReviews', normalizedDoctorId, 'items');
  const q = query(reviewsRef, orderBy('reviewedAt', 'desc'));

  /** معالجة المراجعات وتحويلها للنموذج الموحد */
  const handleSnap = (snapshot: any) => {
    const reviews = snapshot.docs
      .map((item: any) => normalizeDoctorPublicReview(item.id, item.data() as Record<string, unknown>))
      .filter((item): item is DoctorPublicReview => Boolean(item));
    onUpdate(reviews);
  };

  // 1. عرض المراجعات من الكاش فوراً (0ms) للجمهور
  getDocsCacheFirst(q).then(snap => {
    if (!snap.empty) handleSnap(snap);
  }).catch(() => {});

  // 2. المزامنة والاشتراك في التحديثات الجديدة من السيرفر
  return onSnapshot(
    q,
    handleSnap,
    (error) => {
      console.error('[Firestore] Error subscribing to doctor public reviews:', error);
      onUpdate([]);
    }
  );
};
