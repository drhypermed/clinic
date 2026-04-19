/**
 * أدوات مساعدة لنظام السكرتارية (Secretary Module Helpers)
 * يحتوي هذا الملف على وظائف عامة لتنظيف ومعالجة البيانات المستخدمة في نظام الحجز والسكرتارية:
 * 1. تنظيف النصوص والبريد الإلكتروني.
 * 2. توليد رموز سرية (Secrets) وروابط (Slugs) آمنة عشوائياً.
 * 3. التعامل الآمن مع التخزين المحلي (LocalStorage) لتجنب أخطاء المتصفح.
 * 4. التحقق من صحة الصيغ (Regex Validation).
 */

import { getSecureRandomHex } from '../../../utils/cryptoHelpers';
import { omitUndefined as sharedOmitUndefined } from '../../../utils/firestoreHelpers';
import { safeLsGet, safeLsSet } from '../../../utils/localStorageHelpers';
import { normalizeText } from '../../../utils/textEncoding';
import { USER_TEXT_MAX_LENGTH, clampUserTextLength } from '../../../utils/userTextLengthPolicy';

const BOOKING_SECRET_PATTERN = /^b_[a-z0-9]{10,120}$/i;
const SLUG_PATTERN = /^[a-z0-9]{2,64}$/;

/** تحويل القيمة إلى نص نظيف، أو إرجاع undefined إذا كانت فارغة */
export const toOptionalText = (value: unknown): string | undefined => {
  const normalized = clampUserTextLength(normalizeText(value), USER_TEXT_MAX_LENGTH);
  return normalized || undefined;
};

/** حذف الحقول التي قيمتها undefined من الكائنات قبل إرسالها لـ Firestore */
export const omitUndefined = sharedOmitUndefined;

/** توحيد صيغة البريد الإلكتروني (حروف صغيرة وبدون مسافات) */
export const normalizeEmail = (value: unknown): string => String(value || '').trim().toLowerCase();

/** تنظيف الأجزاء المستخدمة في مسارات المستندات (Documents) لمنع أخطاء Firestore */
export const sanitizeDocSegment = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  if (!normalized) return '';
  if (normalized.includes('/')) return '';
  return normalized;
};

/** التحقق من صحة الرمز السري للحجز وتوحيد صيغتة */
export const normalizeBookingSecret = (value: unknown): string => {
  const normalized = sanitizeDocSegment(value);
  if (!normalized) return '';
  return BOOKING_SECRET_PATTERN.test(normalized) ? normalized : '';
};

/** التحقق من صحة الرابط القصير (Slug) وتوحيد صيغتة */
export const normalizeSlug = (value: unknown): string => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  return SLUG_PATTERN.test(normalized) ? normalized : '';
};

/** إنشاء رمز سري فريد للعيادة يبدأ بـ _b لتمييزه */
export const createBookingSecret = (): string => {
  const randomPart = getSecureRandomHex(16);
  const timePart = Date.now().toString(36);
  return `b_${randomPart}${timePart}`;
};

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/** إنشاء رابط عشوائي قصير سهل القراءة (بحد أدنى 6 أحرف) */
export const createRandomSlug = (prefix: string, length = 6): string => {
  const safePrefix = normalizeSlug(prefix).slice(0, 1);
  const start = safePrefix || 'b';

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    const randomPart = Array.from(bytes, (byte) => SLUG_CHARS[byte % SLUG_CHARS.length]).join('');
    return `${start}${randomPart}`;
  }

  const randomPart = Array.from({ length }, () => {
    const idx = Math.floor(Math.random() * SLUG_CHARS.length);
    return SLUG_CHARS[idx];
  }).join('');
  return `${start}${randomPart}`;
};

/** قراءة البيانات من التخزين المحلي مع معالجة الأخطاء (صلاحيات المتصفح) */
export const readLocalStorageSafe = (key: string): string | null => safeLsGet(key);

/** كتابة البيانات في التخزين المحلي مع معالجة الأخطاء */
export const writeLocalStorageSafe = (key: string, value: string): void => safeLsSet(key, value);

