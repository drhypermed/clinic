// ─────────────────────────────────────────────────────────────────────────────
// درع أمان صفحة إعلان الطبيب (Doctor Advertisement Security Utils)
// ─────────────────────────────────────────────────────────────────────────────
// دوال تطهير وتحقق من المدخلات قبل حفظها في Firestore أو عرضها للجمهور:
//   - safeDocId: يتأكد أن الـ id مش فيه "/" (علشان ما يكسر مسار Firestore)
//   - sanitizeTextInput: يشيل رموز التحكم ويحدد طول أقصى
//   - sanitizeSocialUrl: يقبل فقط http/https URLs
//   - sanitizeSocialLinks: تطهير كل روابط السوشيال ميديا
//   - mapDoctorAdActionError: ترجمة أخطاء Firebase لرسائل عربية مفهومة
//
// ليه مهم؟ الطبيب بيدخل نصوص هتظهر لآلاف المرضى — لازم نحمي من HTML injection
// ورموز التحكم اللي ممكن تكسر العرض أو تسمح بهجمات.
// ─────────────────────────────────────────────────────────────────────────────

import type { DoctorSocialLink } from './types';
import { CONTROL_CHARS_REGEX } from '../../../utils/controlChars';

/**
 * يتحقق أن القيمة صالحة كـ Firestore document ID.
 * الـ "/" ممنوعة لأنها بتكسر مسار المستند.
 */
export const safeDocId = (value: unknown): string | null => {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.includes('/')) return null;
  return normalized;
};

/** تطهير نص عام: يشيل رموز التحكم + trim + قص لطول أقصى. */
export const sanitizeTextInput = (value: unknown, maxLength: number) =>
  String(value || '')
    .replace(CONTROL_CHARS_REGEX, ' ')
    .trim()
    .slice(0, maxLength);

/**
 * تطهير نص متعدد الأسطر (textarea): بيشيل رموز التحكم الخطيرة
 * بس بيحافظ على `\n` (السطر الجديد) عشان الطبيب لما يكتب كلام في أكتر
 * من سطر في خانة الإعلان، الأسطر تفضل زي ما هي قدام الجمهور.
 *
 * Why: CONTROL_CHARS_REGEX الأصلي بيعتبر \n حرف تحكم وبيستبدله بمسافة،
 * فكان أي كتابة في textarea بتتحول لسطر واحد طويل.
 */
export const sanitizeMultilineInput = (value: unknown, maxLength: number) =>
  String(value || '')
    // نوحّد \r\n و \r إلى \n قبل التنظيف
    .replace(/\r\n?/g, '\n')
    // نشيل كل أحرف التحكم ما عدا \n (\u000A) و \t (\u0009)
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength);

/**
 * يتحقق أن الرابط: صالح كـ URL، ويبدأ بـ http:// أو https:// فقط.
 * رفض javascript:, data:, file:, وغيرها من الـ protocols اللي ممكن تكون خطر.
 */
const isSafeExternalUrl = (value: unknown) => {
  const normalized = sanitizeTextInput(value, 2048);
  if (!normalized) return false;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/** تطهير رابط سوشيال ميديا — يرجع نص فارغ لو الرابط مش آمن. */
export const sanitizeSocialUrl = (value: unknown) => {
  const normalized = sanitizeTextInput(value, 2048);
  return isSafeExternalUrl(normalized) ? normalized : '';
};

/**
 * تطهير مصفوفة روابط السوشيال كاملة:
 *   - يطهر كل id/platform/url
 *   - يشيل اللي مفيهوش platform أو url (روابط فاضية)
 */
export const sanitizeSocialLinks = (links: DoctorSocialLink[]) =>
  (Array.isArray(links) ? links : [])
    .map((item, index) => ({
      id: sanitizeTextInput(item?.id || `social-${index + 1}`, 80) || `social-${index + 1}`,
      platform: sanitizeTextInput(item?.platform, 80),
      url: sanitizeSocialUrl(item?.url),
    }))
    .filter((item) => item.platform && item.url);

/** ترجمة أخطاء Firebase للإعلان إلى رسائل عربية مفهومة للطبيب. */
export const mapDoctorAdActionError = (error: unknown, fallback: string) => {
  const raw = error instanceof Error ? error.message.toLowerCase() : '';
  if (raw.includes('permission-denied')) return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
  if (raw.includes('unauthenticated')) return 'يجب تسجيل الدخول أولاً.';
  if (raw.includes('unauthorized')) return 'غير مصرح لك بهذا الإجراء.';
  if (raw.includes('storage/unauthorized')) return 'لا تملك صلاحية الوصول لملفات التخزين.';
  if (raw.includes('storage/object-not-found')) return 'الملف المطلوب غير موجود.';
  if (raw.includes('network')) return 'تعذر الاتصال بالخدمة حالياً. حاول مرة أخرى.';
  return fallback;
};
