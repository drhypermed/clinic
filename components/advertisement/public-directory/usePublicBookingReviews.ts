// ─────────────────────────────────────────────────────────────────────────────
// Hook تقييمات الحجوزات العامة (usePublicBookingReviews)
// ─────────────────────────────────────────────────────────────────────────────
// يسمح للمريض بعد الكشف بـ:
//   • كتابة تقييم (نجوم من 1 لـ 5 + تعليق اختياري)
//   • تعديل تقييم موجود (الـ backend يقبل overwrite)
//   • حذف تقييم (لو المريض غير رأيه)
//
// منطق التقييمات:
//   - getBookingReviewDraft: يرجع مسودة التقييم الحالية (لو موجودة)
//   - updateBookingReviewDraft: يحدث المسودة محلياً قبل الحفظ
//   - submitBookingReview: يبعت التقييم لـ Firestore + يُحدث متوسط الطبيب
//   - deleteBookingReview: يحذف التقييم + يُحدث المتوسط
//
// كل العمليات بتمر على firestoreService (مش Firestore مباشرة).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

import type { PublicUserBooking } from '../../../types';
import { firestoreService } from '../../../services/firestore';

const mapSubmitReviewError = (rawMessage: string) => {
  if (rawMessage.includes('booking-not-completed')) return 'لا يمكن التقييم قبل إتمام الكشف.';
  if (rawMessage.includes('booking-already-reviewed'))
    return 'تم إرسال تقييم لهذا الحجز بالفعل. يمكنك تعديل التقييم الحالي فقط.';
  if (rawMessage.includes('doctor-ad-not-found')) return 'لم يتم العثور على صفحة الطبيب.';
  if (rawMessage.includes('permission')) return 'ليس لديك صلاحية تنفيذ هذا الإجراء.';
  return 'حدث خطأ أثناء إرسال التقييم. حاول مرة أخرى.';
};

const mapDeleteReviewError = (rawMessage: string) => {
  if (rawMessage.includes('booking-review-not-found')) return 'لم يتم العثور على التقييم.';
  if (rawMessage.includes('booking-not-completed')) return 'لا يمكن حذف تقييم لحجز غير مكتمل.';
  if (rawMessage.includes('permission')) return 'ليس لديك صلاحية تنفيذ هذا الإجراء.';
  return 'حدث خطأ أثناء حذف التقييم. حاول مرة أخرى.';
};

const getInitialReviewDraft = (booking: PublicUserBooking) => ({
  rating:
    typeof booking.rating === 'number' ? Math.max(1, Math.min(5, Math.round(booking.rating))) : 0,
  comment: booking.reviewComment || '',
});

export const usePublicBookingReviews = (userId: string) => {
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [reviewSubmittingId, setReviewSubmittingId] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<
    Record<string, { type: 'success' | 'error'; message: string }>
  >({});

  const clearReviewFeedbackForBooking = (bookingId: string) => {
    setReviewFeedback((prev) => {
      const next = { ...prev };
      delete next[bookingId];
      return next;
    });
  };

  const getBookingReviewDraft = (booking: PublicUserBooking) => {
    const draft = reviewDrafts[booking.id];
    if (draft) return draft;
    return getInitialReviewDraft(booking);
  };

  const updateBookingReviewDraft = (
    booking: PublicUserBooking,
    patch: Partial<{ rating: number; comment: string }>
  ) => {
    setReviewDrafts((prev) => {
      const base = prev[booking.id] ?? getInitialReviewDraft(booking);
      return {
        ...prev,
        [booking.id]: {
          rating: patch.rating ?? base.rating,
          comment: patch.comment ?? base.comment,
        },
      };
    });
  };

  const submitBookingReview = async (booking: PublicUserBooking) => {
    if (typeof booking.rating === 'number' && Number.isFinite(booking.rating)) {
      setReviewFeedback((prev) => ({
        ...prev,
        [booking.id]: {
          type: 'error',
          message: 'تم إرسال تقييم لهذا الحجز بالفعل. يمكنك تعديل التقييم الحالي فقط.',
        },
      }));
      return;
    }

    const draft = getBookingReviewDraft(booking);
    if (draft.rating < 1 || draft.rating > 5) {
      setReviewFeedback((prev) => ({
        ...prev,
        [booking.id]: { type: 'error', message: 'يرجى اختيار تقييم من 1 إلى 5 نجوم.' },
      }));
      return;
    }

    setReviewSubmittingId(booking.id);
    clearReviewFeedbackForBooking(booking.id);

    try {
      await firestoreService.submitPublicUserBookingReview(userId, booking.id, draft.rating, draft.comment);
      setReviewFeedback((prev) => ({
        ...prev,
        [booking.id]: { type: 'success', message: '✅ تم حفظ التقييم بنجاح.' },
      }));
      setTimeout(() => {
        setReviewFeedback((prev) => {
          const current = prev[booking.id];
          if (!current || current.type !== 'success') return prev;
          const next = { ...prev };
          delete next[booking.id];
          return next;
        });
      }, 3500);
    } catch (err: any) {
      const rawMessage = typeof err?.message === 'string' ? err.message : '';
      setReviewFeedback((prev) => ({
        ...prev,
        [booking.id]: { type: 'error', message: mapSubmitReviewError(rawMessage) },
      }));
    } finally {
      setReviewSubmittingId(null);
    }
  };

  const deleteBookingReview = async (booking: PublicUserBooking) => {
    if (!(typeof booking.rating === 'number' && Number.isFinite(booking.rating))) return;

    setReviewSubmittingId(booking.id);
    clearReviewFeedbackForBooking(booking.id);

    try {
      await firestoreService.deletePublicUserBookingReview(userId, booking.id);
      setReviewDrafts((prev) => ({
        ...prev,
        [booking.id]: { rating: 0, comment: '' },
      }));
      setReviewFeedback((prev) => ({
        ...prev,
        [booking.id]: { type: 'success', message: '✅ تم حذف التقييم بنجاح.' },
      }));
    } catch (err: any) {
      const rawMessage = typeof err?.message === 'string' ? err.message : '';
      setReviewFeedback((prev) => ({
        ...prev,
        [booking.id]: { type: 'error', message: mapDeleteReviewError(rawMessage) },
      }));
    } finally {
      setReviewSubmittingId(null);
    }
  };

  return {
    reviewFeedback,
    reviewSubmittingId,
    getBookingReviewDraft,
    updateBookingReviewDraft,
    submitBookingReview,
    deleteBookingReview,
  };
};

