/**
 * أدوات مساعدة لإدارة المرضى (Patient Utils)
 * تحتوي على منطق حساب المعايير (Metrics) للمرضى مثل معدل التقييم وعدد المواعيد.
 */

import { PublicUserBooking } from '../../../types';

/** هل الحجز يحتوي على تقييم صالح؟ */
export const isRatedBooking = (booking: PublicUserBooking) =>
  typeof booking.rating === 'number' && booking.rating > 0;

/**
 * هل الحجز "مكتمل"؟
 * نوحّد الفحص في دالة واحدة لأن الـ schema تاريخياً استخدم اسمين مختلفين:
 *   - status='completed' (الحقل الحالي)
 *   - appointmentStatus='completed' (legacy، قد يكون موجوداً في وثائق قديمة)
 * نقبل أي منهما عشان لا نفقد إحصائيات الحجوزات القديمة.
 */
const isCompletedBooking = (booking: PublicUserBooking) =>
  booking.status === 'completed' || (booking as any).appointmentStatus === 'completed';

/** حساب إحصائيات المريض (عدد الحجوزات، المكتملة، التقييمات) */
export const getPatientMetrics = (bookings: PublicUserBooking[]) => {
  const confirmed = bookings.filter(isCompletedBooking);
  const reviews = confirmed.filter((booking) => isRatedBooking(booking));

  let averageRating = '0';
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    averageRating = (sum / reviews.length).toFixed(1);
  }

  return {
    totalAppointments: bookings.length,
    confirmedAppointments: confirmed.length,
    totalReviews: reviews.length,
    averageRating,
  };
};

export const clearBookingReview = (booking: PublicUserBooking) => ({
  ...booking,
  rating: undefined,
  reviewComment: undefined,
  reviewedAt: undefined,
});
