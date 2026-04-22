/**
 * خدمة الحجز العام (Public Booking Service)
 * هذا الملف يعمل كمجمع (Aggregator) لكافة الوظائف المتعلقة بحجز المرضى من الرابط العام:
 * 1. إدارة الرموز السرية وإعدادات نموذج الحجز.
 * 2. التحكم في الفترات الزمنية (Slots) المتاحة للجمهور.
 * 3. متابعة حجوزات المرضى وتقييماتهم للأطباء.
 * 4. تنفيذ عملية الحجز الفعلي وتحويله لموعد في العيادة.
 */

import {
  ensurePublicBookingConfig,
  getOrCreatePublicBookingSecret,
  getPublicBookingConfig,
  getPublicSecretByUserId,
  savePublicFormSettings,
  subscribeToPublicConfig,
} from './booking-public/secretConfig';
import {
  addPublicSlot,
  deletePublicSlot,
  getPublicSlots,
  subscribeToPublicSlots,
} from './booking-public/slots';
import {
  deletePublicUserBookingReview,
  getPublicUserBookingsOnce,
  markPublicUserBookingCompleted,
  savePublicUserBooking,
  submitPublicUserBookingReview,
  subscribeToDoctorPublicReviews,
  subscribeToPublicUserBookings,
} from './booking-public/publicUserBookings';
import { createAppointmentFromPublic } from './booking-public/publicAppointment';
import { getPublicBranches, savePublicBranches } from './booking-public/publicBranches';

/** واجهة الخدمة الموحدة للحجز العام */
export const bookingPublicService = {
  getOrCreatePublicBookingSecret,
  ensurePublicBookingConfig,
  getPublicBookingConfig,
  getPublicSecretByUserId,
  savePublicFormSettings,
  getPublicSlots,
  subscribeToPublicConfig,
  subscribeToPublicSlots,
  addPublicSlot,
  deletePublicSlot,
  savePublicUserBooking,
  subscribeToPublicUserBookings,
  getPublicUserBookingsOnce,
  markPublicUserBookingCompleted,
  submitPublicUserBookingReview,
  deletePublicUserBookingReview,
  subscribeToDoctorPublicReviews,
  createAppointmentFromPublic,
  getPublicBranches,
  savePublicBranches,
};

