/**
 * خدمة سكرتارية المواعيد (Booking Secretary Service)
 * هذا الملف هو النقطة المركزية لإدارة عمليات السكرتارية في العيادة.
 * يجمع الوظائف من الملفات الفرعية لتنظيم:
 * 1. الدخول الآمن (Authentication) للسكرتارية عبر الرموز السرية.
 * 2. إدارة ملفات السكرتارية وتنبيهات الدخول.
 * 3. مزامنة بيانات المواعيد للمنصة الخاصة بالسكرتارية.
 * 4. توليد الروابط (Slugs) للحجز العام والخاص.
 */

import {
  ensureBookingConfigUserId,
  getBookingConfig,
  getBookingConfigByUserId,
  getBookingSecretByUserId,
  getOrCreateBookingSecret,
  getSecretaryLoginTargetByDoctorEmail,
  getSecretaryLoginTargetByUserEmail,
  repairBookingConnection,
  saveBookingCredentials,
  setBookingSecretaryVitalsVisibility,
  setBookingDoctorEmail,
  setSecretarySessionToken,
  updateBookingSettings,
} from './booking-secretary/secretConfig';
import {
  getOrCreateBookingUrlSlug,
  getOrCreatePublicUrlSlug,
  generateBookingUrlSlug,
  generatePublicUrlSlug,
  getUserIdByBookingSlug,
  getUserIdByPublicSlug,
} from './booking-secretary/slugs';
import {
  getSecretaryProfile,
  saveSecretaryProfile,
  subscribeToSecretaryProfile,
} from './booking-secretary/profile';
import {
  addSecretaryApprovedEntryId,
  clearSecretaryEntryAlertResponse,
  respondToDoctorEntryAlert,
  setEntryAlert,
  setSecretaryEntryAlertResponse,
  subscribeToSecretaryApprovedEntryIds,
  subscribeToSecretaryEntryAlertResponse,
} from './booking-secretary/entryAlerts';
import {
  setBookingConfigPatientDirectory,
  setBookingConfigPatientDirectoryByBranch,
  setBookingConfigRecentExamPatients,
  setBookingConfigRecentExamPatientsByBranch,
  setBookingConfigTodayAppointments,
  setBookingConfigTodayAppointmentsByBranch,
  setBookingConfigUpcomingAppointmentsByBranch,
  setBookingConfigCompletedAppointmentsByBranch,
  subscribeToBookingConfig,
} from './booking-secretary/bookingConfigSync';
import {
  clearDoctorEntryResponse,
  clearSecretaryEntryRequest,
  getSecretaryEntryRequest,
  respondToSecretaryEntryRequest,
  setDoctorEntryResponse,
  setSecretaryEntryRequest,
  subscribeToSecretaryEntryRequest,
} from './booking-secretary/entryRequests';
import { createAppointmentFromSecret } from './booking-secretary/appointments';

export const bookingSecretaryService = {
  getOrCreateBookingSecret,
  getBookingConfigByUserId,
  saveBookingCredentials,
  getBookingConfig,
  getBookingSecretByUserId,
  getSecretaryProfile,
  saveSecretaryProfile,
  subscribeToSecretaryProfile,
  getSecretaryLoginTargetByDoctorEmail,
  getSecretaryLoginTargetByUserEmail,
  updateBookingSettings,
  setBookingSecretaryVitalsVisibility,
  ensureBookingConfigUserId,
  setBookingDoctorEmail,
  repairBookingConnection,
  setEntryAlert,
  setSecretaryEntryAlertResponse,
  respondToDoctorEntryAlert,
  subscribeToSecretaryEntryAlertResponse,
  clearSecretaryEntryAlertResponse,
  addSecretaryApprovedEntryId,
  subscribeToSecretaryApprovedEntryIds,
  setBookingConfigTodayAppointments,
  setBookingConfigTodayAppointmentsByBranch,
  setBookingConfigUpcomingAppointmentsByBranch,
  setBookingConfigCompletedAppointmentsByBranch,
  setBookingConfigRecentExamPatients,
  setBookingConfigRecentExamPatientsByBranch,
  setBookingConfigPatientDirectory,
  setBookingConfigPatientDirectoryByBranch,
  subscribeToBookingConfig,
  setSecretaryEntryRequest,
  getSecretaryEntryRequest,
  subscribeToSecretaryEntryRequest,
  clearSecretaryEntryRequest,
  setDoctorEntryResponse,
  respondToSecretaryEntryRequest,
  clearDoctorEntryResponse,
  createAppointmentFromSecret,
  getOrCreateBookingUrlSlug,
  getOrCreatePublicUrlSlug,
  generateBookingUrlSlug,
  generatePublicUrlSlug,
  getUserIdByBookingSlug,
  getUserIdByPublicSlug,
  setSecretarySessionToken,
};

