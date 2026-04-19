/**
 * أدوات الأمان والتحقق (Patient Management Security Utils)
 * توفر دوال لتطهير المدخلات (Sanitization)، التحقق من صحة المعرفات،
 * وخرائط الأخطاء الخاصة بعمليات إدارة الجمهور.
 */
import { mapFirebaseActionError } from '../../../utils/firebaseErrorMap';
import { CONTROL_CHARS_REGEX } from '../../../utils/controlChars';

export const safeDocId = (rawId: unknown): string | null => {
  const id = String(rawId || '').trim();
  if (!id || id.includes('/')) return null;
  return id;
};

export const sanitizeReasonInput = (value: unknown, maxLength = 500): string => {
  if (typeof value !== 'string') return '';
  return value
    .replace(CONTROL_CHARS_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

/** خريطة أخطاء عمليات إدارة المرضى (تعيد تصدير الدالة المشتركة). */
export const mapPatientActionError = mapFirebaseActionError;
