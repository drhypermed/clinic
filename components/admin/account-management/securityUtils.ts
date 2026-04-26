// ─────────────────────────────────────────────────────────────────────────────
// درع الأمان والتحقق لإدارة الحسابات (Account Management Security Utils)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي هذا الملف على أدوات مساعدة خاصة بإدارة الحسابات:
//   1) sanitizeAdminReasonInput: تطهير نصوص الأسباب (تعطيل/حذف حساب) من الرموز الغريبة.
//   2) isPositiveSafeInteger: التحقق من أن مدة الاشتراك رقم صحيح موجب.
//   3) parseAdminDateTime: تحويل التاريخ والوقت المدخل يدوياً إلى كائن Date.
//   4) isDoctorLikeUser: تصنيف المستخدم هل هو طبيب أم لا.
//
// ملاحظة: normalizeEmail اتنقلت لمكانها الرئيسي في services/auth-service/validation.ts
// عشان نمنع التكرار في المشروع كله — استوردها من هناك مباشرة.
// ─────────────────────────────────────────────────────────────────────────────

import { CONTROL_CHARS_REGEX } from '../../../utils/controlChars';

/** التحقق من تنسيق التاريخ (YYYY-MM-DD) */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
/** التحقق من تنسيق الوقت (HH:MM) */
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** تطهير نصوص الأسباب (مثل سبب التعطيل أو الحذف) لمنع الرموز الغريبة */
export const sanitizeAdminReasonInput = (value: unknown, maxLength = 500): string => {
  if (typeof value !== 'string') return '';
  const withoutControlChars = value.replace(CONTROL_CHARS_REGEX, ' ');
  const collapsedWhitespace = withoutControlChars.replace(/\s+/g, ' ').trim();
  return collapsedWhitespace.slice(0, maxLength);
};

/** التحقق من أن القيمة عدد صحيح موجب (يستخدم لمدد الاشتراك) */
export const isPositiveSafeInteger = (value: unknown, max = 36500): value is number => {
  if (typeof value !== 'number') return false;
  if (!Number.isInteger(value)) return false;
  return value > 0 && value <= max;
};

const isStrictDate = (date: string): boolean => DATE_REGEX.test(date);
const isStrictTime = (time: string): boolean => TIME_REGEX.test(time);

/** معالجة التاريخ والوقت المدخل من واجهة الإدارة وتحويله إلى كائن Date */
export const parseAdminDateTime = (date: string, time: string): Date | null => {
  if (!isStrictDate(date) || !isStrictTime(time)) return null;

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);

  // التحقق من صحة التاريخ الناتج (أيام الشهور مثلاً)
  if (!Number.isFinite(parsed.getTime())) return null;
  if (parsed.getFullYear() !== year) return null;
  if (parsed.getMonth() !== month - 1) return null;
  if (parsed.getDate() !== day) return null;
  if (parsed.getHours() !== hour) return null;
  if (parsed.getMinutes() !== minute) return null;

  return parsed;
};

/** هل المستخدم يمثل شخصاً من الجمهور العام؟ */
const isPublicUser = (data: Record<string, any>) =>
  data?.authRole === 'public' ||
  data?.userRole === 'public' ||
  data?.role === 'public' ||
  data?.accountType === 'public';

