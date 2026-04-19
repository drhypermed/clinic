/**
 * تجميع إعدادات التكوين والرموز السرية (Secret Configuration Aggregator)
 * يقوم هذا الملف بتجميع وتنظيم الوظائف الحيوية للسكرتارية من ملفات فرعية متخصصة:
 * 1. التأكد من ربط الحسابات (Ensure Connectivity).
 * 2. إدارة الرموز السرية للدخول (Secret Keys).
 * 3. إعدادات الجلسة والربط بالبريد الإلكتروني للطبيب (Settings & Session).
 */

export {
  ensureBookingConfigUserId,
  setBookingDoctorEmail,
  repairBookingConnection,
} from './secretConfig.ensure';

export {
  getOrCreateBookingSecret,
  getBookingSecretByUserId,
} from './secretConfig.secret';

export {
  getBookingConfigByUserId,
  saveBookingCredentials,
  getBookingConfig,
  getSecretaryLoginTargetByDoctorEmail,
  getSecretaryLoginTargetByUserEmail,
  setBookingSecretaryVitalsVisibility,
  updateBookingSettings,
  setSecretarySessionToken,
} from './secretConfig.settings';
