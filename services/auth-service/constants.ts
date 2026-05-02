/**
 * ثوابت خدمة المصادقة (Authentication Constants):
 * هذا الملف يحتوي على كافة المفاتيح والقيم الثابتة المستخدمة في نظام الحماية والمصادقة.
 * يشمل مفاتيح التخزين المحلي، إعدادات الروابط السحرية، وقواعد حظر المحاولات.
 */

import type { ActionCodeSettings } from 'firebase/auth';

/** مفاتيح التخزين في الـ LocalStorage */
export const SESSION_ROLE_STORAGE_KEY = 'dh_auth_role';           // دور الجلسة الحالية
export const PUBLIC_PENDING_EMAIL_KEY = 'dh_public_pending_email'; // البريد المنتظر لتسجيل الرابط السحري
export const PUBLIC_PENDING_PROFILE_KEY = 'dh_public_pending_profile'; // بيانات ملف الجمهور المؤقتة
export const PUBLIC_AUTH_ERROR_KEY = 'dh_public_auth_error';     // رسائل خطأ دخول الجمهور
export const PENDING_GOOGLE_REDIRECT_ROLE_KEY = 'dh_pending_google_redirect_role'; // الدور عند العودة من جوجل
export const PENDING_GOOGLE_AUTH_ROLE_KEY = 'dh_pending_google_auth_role'; // الدور أثناء عملية النافذة المنبثقة
// رسالة فشل تحديد دور المستخدم — بتترسم في صفحة الدخول لما الحارس يفصل الجلسة
// بعد timeout (مثلاً Firestore بطيء أو البروفايل ناقص). الصياغه عربيه عشان تظهر للمستخدم.
export const ROLE_RESOLUTION_ERROR_KEY = 'dh_role_resolution_error';

/** الروابط وإعدادات إعادة التوجيه للرسائل البريدية */
// روابط الإيميلات للدكاتره (تأكيد/إعاده تعيين) لازم ترجع لدومين العياده
// عشان ما يحصلش: دكتور يضغط رابط → يلاقي نفسه على صفحه المريض (drhypermed.com)
const ACTION_LINK_BASE_URL = 'https://clinic.drhypermed.com';

const buildAuthContinueUrl = (path = '/login/doctor') =>
  new URL(path, ACTION_LINK_BASE_URL).toString();

/** إعدادات روابط توثيق البريد وتغيير كلمة المرور للأطباء */
export const doctorAuthActionCodeSettings: ActionCodeSettings = {
  url: buildAuthContinueUrl('/login/doctor'),
  handleCodeInApp: false, // يتم معالجة الرابط عبر صفحة الويب الافتراضية لفايربيز
};
