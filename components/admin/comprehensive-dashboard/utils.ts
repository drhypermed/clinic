// ─────────────────────────────────────────────────────────────────────────────
// أدوات اللوحة الإدارية الشاملة (Admin Dashboard Utils)
// ─────────────────────────────────────────────────────────────────────────────
// هذا الملف مسؤول عن:
//   1) تنظيف النصوص (sanitizeText) من رموز التحكم قبل عرضها أو تخزينها.
//   2) ترجمة أخطاء Firebase التقنية إلى جمل عربية واضحة (mapAdminActionError).
//   3) دالة مركزية لاستخلاص رسالة الخطأ النهائية (getAdminActionError).
//
// ملاحظة مهمة: normalizeEmail اتنقل لمكانه المركزي في
// services/auth-service/validation.ts عشان نمنع التكرار — استورده من هناك.
// ─────────────────────────────────────────────────────────────────────────────

import { CONTROL_CHARS_REGEX } from '../../../utils/controlChars';

/** تنظيف النصوص من رموز التحكم وتحديد الطول الأقصى */
const sanitizeText = (value: unknown, max = 220) =>
  String(value || '')
    .replace(CONTROL_CHARS_REGEX, ' ')
    .trim()
    .slice(0, max);

/** تحويل أخطاء Firebase إلى رسائل عربية مفهومة للمسؤول */
const mapAdminActionError = (raw: string, fallback: string): string => {
  const normalized = raw.toLowerCase();
  if (normalized.includes('permission-denied')) return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
  if (normalized.includes('unauthenticated')) return 'يجب تسجيل الدخول أولاً.';
  if (normalized.includes('unavailable')) return 'الخدمة غير متاحة حالياً، حاول مرة أخرى.';
  return fallback;
};

/** استخراج ومعالجة رسائل الخطأ من العمليات الإدارية */
export const getAdminActionError = (
  error: unknown,
  fallback = 'تعذر تنفيذ العملية حالياً.'
): string => {
  const raw = error instanceof Error && error.message ? sanitizeText(error.message) : '';
  if (!raw) return fallback;
  return mapAdminActionError(raw, sanitizeText(raw));
};
