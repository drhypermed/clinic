/**
 * الملف: constants.ts
 * الوصف: "الثوابت التقنية" لواجهة السكرتارية. 
 * يحدد هذا الملف المعايير الثابتة التي يعمل بها النظام: 
 * - مفاتيح التخزين (LocalStorage Keys) لحفظ الجلسات وتأجيل الإشعارات. 
 * - مدد الانتظار (Timeouts)؛ مثل مدة إخفاء رسالة طلب الإشعارات. 
 * - القيود الرقمية (Limits)؛ مثل أقصى طول مسموح لاسم السكرتير أو رقم الهاتف.
 */
export const SECRETARY_PUSH_PROMPT_HIDE_UNTIL_KEY = 'dh_push_prompt_hide_until_secretary';
// مدّة تأجيل بطاقة تفعيل إشعارات السكرتيرة = أسبوع كامل.
// بعد الأسبوع البطاقة ترجع تلقائياً للتذكير لحد ما السكرتيرة تفعّل الإشعارات.
export const SECRETARY_PUSH_PROMPT_HIDE_MS = 7 * 24 * 60 * 60 * 1000;
export const SECRETARY_LAST_SECRET_KEY = 'dh_secretary_last_secret';
export const SECRETARY_TOAST_AUTO_HIDE_MS = 5 * 1000;

// الحدود القصوى لعدد الحروف في المدخلات لضمان سلامة البيانات وتناسق التصميم
export const SECRETARY_NAME_MAX_LENGTH = 80;
export const BOOKING_TEXT_MAX_LENGTH = 200;
export const BOOKING_PHONE_MAX_LENGTH = 20;
export const PUSH_ACTION_APPOINTMENT_ID_MAX_LENGTH = 128;
