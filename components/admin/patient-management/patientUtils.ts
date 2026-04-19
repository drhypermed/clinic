/**
 * أدوات مساعدة لإدارة المرضى (Patient Utils)
 * تحتوي على منطق حساب المعايير (Metrics) للمرضى مثل معدل التقييم 
 * وعدد المواعيد، بالإضافة إلى بناء محرك البحث النصي للمرضى.
 */

import { PublicUserBooking } from '../../../types';
import { PatientAccount } from './types';

/** هل الحجز يحتوي على تقييم صالح؟ */
export const isRatedBooking = (booking: PublicUserBooking) =>
  typeof booking.rating === 'number' && booking.rating > 0;

/** حساب إحصائيات المريض (عدد الحجوزات، المكتملة، التقييمات) */
export const getPatientMetrics = (bookings: PublicUserBooking[]) => {
  const confirmed = bookings.filter(
    (booking) => booking.status === 'completed' || (booking as any).appointmentStatus === 'completed'
  );
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

export const buildPatientSearchCorpus = (patient: PatientAccount) => {
  const reviewSearchCorpus = patient.bookings
    .map((booking) => {
      const ratingText = typeof booking.rating === 'number' ? String(booking.rating) : '';
      return [
        booking.id,
        booking.doctorName,
        booking.doctorSpecialty,
        booking.patientName,
        booking.phone,
        booking.visitReason,
        booking.reviewComment,
        booking.reviewedAt,
        booking.dateTime,
        booking.status,
        (booking as any).appointmentStatus,
        ratingText,
      ].join(' ');
    })
    .join(' ');

  return [
    patient.id,
    patient.name,
    patient.email,
    patient.createdAt,
    patient.lastLoginAt,
    patient.disabledReason,
    patient.averageRating,
    String(patient.totalAppointments),
    String(patient.completedAppointments),
    String(patient.totalReviews),
    reviewSearchCorpus,
  ]
    .join(' ')
    .toLowerCase();
};

