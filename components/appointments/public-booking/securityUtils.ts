/**
 * الملف: securityUtils.ts
 * الوصف: "أدوات التطهير والأمان" للسكرتارية. 
 * يحتوي على وظائف لحماية البيانات المدخلة في واجهة السكرتير: 
 * - تنظيف النصوص (Sanitize) من الرموز البرمجية المخفية (Control Characters). 
 * - التحقق من سلامة أرقام الهواتف (Phone Digits). 
 * - التأكد من أن "معرف الموعد" (Appointment ID) القادم من الإشعارات آمن 
 *   ولا يحتوي على محاولات اختراق (Injections).
 */
import {
  BOOKING_PHONE_MAX_LENGTH,
  BOOKING_TEXT_MAX_LENGTH,
  PUSH_ACTION_APPOINTMENT_ID_MAX_LENGTH,
  SECRETARY_NAME_MAX_LENGTH,
} from './constants';
import { CONTROL_CHARS_REGEX as CONTROL_CHAR_REGEX } from '../../../utils/controlChars';
// تعبير نمطي للتأكد من أن معرف الموعد يحتوي فقط على حروف وأرقام ورموز آمنة
const APPOINTMENT_ID_SAFE_REGEX = /^[A-Za-z0-9_-]+$/;

/**
 * تنظيف النصوص العامة المدخلة من قبل الجمهور أو السكرتارية.
 * تقوم بإزالة حروف التحكم واقتصاص النص للطول المسموح به.
 */
export const sanitizePublicText = (value: string, maxLength = BOOKING_TEXT_MAX_LENGTH): string => {
  return String(value || '').replace(CONTROL_CHAR_REGEX, '').slice(0, maxLength).trim();
};

/**
 * استخراج أرقام الهاتف فقط واقتصاصها للطول المناسب.
 */
export const sanitizePhoneDigits = (value: string, maxLength = BOOKING_PHONE_MAX_LENGTH): string => {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength);
};

/**
 * تنظيف اسم السكرتارية باستخدام حدود الطول المخصصة لها.
 */
export const sanitizeSecretaryName = (value: string): string => {
  return sanitizePublicText(value, SECRETARY_NAME_MAX_LENGTH);
};

/**
 * التحقق من سلامة معرف الموعد القادم عبر روابط الإشعارات (Push Actions).
 * تضمن عدم وجود حروف خبيثة أو طول غير مبرر.
 */
export const isSafePushActionAppointmentId = (value: string): boolean => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return false;
  if (trimmed.length > PUSH_ACTION_APPOINTMENT_ID_MAX_LENGTH) return false;
  return APPOINTMENT_ID_SAFE_REGEX.test(trimmed);
};

