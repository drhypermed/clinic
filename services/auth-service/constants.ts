/**
 * ثوابت خدمة المصادقة (Authentication Constants):
 * هذا الملف يحتوي على كافة المفاتيح والقيم الثابتة المستخدمة في نظام الحماية والمصادقة.
 * يشمل مفاتيح التخزين المحلي، إعدادات الروابط السحرية، وقواعد حظر المحاولات.
 */

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
