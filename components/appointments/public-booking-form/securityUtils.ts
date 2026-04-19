/**
 * الملف: securityUtils.ts
 * الوصف: "درع الحماية" لفورم الجمهور. 
 * بما أن هذا الفورم مفتوح للعامة، فإنه يحتاج لحماية خاصة ضد البيانات الخبيثة. 
 * يحتوي هذا الملف على وظائف لـ: 
 * - تنظيف النصوص (Sanitization) من الرموز البرمجية المخفية. 
 * - التحقق من سلامة الروابط الخارجية (Safe URLs). 
 * - استخراج "معلومات الكوتا" (Quota Info) من أخطاء الـ Backend لتحويلها 
 *   لرسائل مفهومة للمريض مع روابط تواصل واتساب.
 */
import type { BookingQuotaNotice } from './types';
import { CONTROL_CHARS_REGEX as CONTROL_CHAR_REGEX } from '../../../utils/controlChars';

const UNSAFE_URL_REGEX = /^\s*(javascript|data|vbscript)\s*:/i;

export const sanitizePublicText = (value: string, maxLength: number): string => {
  return String(value || '').replace(CONTROL_CHAR_REGEX, '').slice(0, maxLength);
};

export const sanitizePhoneDigits = (value: string, maxLength: number): string => {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength);
};

export const sanitizeExternalUrl = (url: string): string => {
  const normalized = String(url || '').trim();
  if (!normalized) return '';
  if (UNSAFE_URL_REGEX.test(normalized)) return '';

  if (/^[a-z][a-z0-9+\-.]*:/i.test(normalized)) {
    const scheme = normalized.split(':', 1)[0].toLowerCase();
    const allowed = new Set(['https', 'http', 'mailto', 'tel']);
    return allowed.has(scheme) ? normalized : '';
  }

  return normalized;
};

const buildWhatsAppUrlFromNumber = (number: string, message: string): string => {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return '';
  const text = encodeURIComponent(String(message || '').trim());
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};

export const extractBookingQuotaNotice = (error: unknown): BookingQuotaNotice | null => {
  const e = error as { code?: string; message?: string; details?: unknown };
  const code = String(e?.code || '').replace(/^functions\//, '');
  const message = String(e?.message || '');
  const isDailyLimit = code === 'resource-exhausted' || message.includes('BOOKING_DAILY_LIMIT_REACHED');
  if (!isDailyLimit) return null;

  const details = e?.details && typeof e.details === 'object'
    ? (e.details as Record<string, unknown>)
    : null;

  const limit = Number(details?.limit || 0);
  const withLimit = (template: string) => template.replace(/\{\s*limit\s*\}/gi, String(limit));

  const limitReachedMessage = withLimit(String(details?.limitReachedMessage || '').trim());
  const whatsappMessage = withLimit(String(details?.whatsappMessage || '').trim());
  const whatsappNumber = String(details?.whatsappNumber || '').trim();

  const whatsappUrl =
    buildWhatsAppUrlFromNumber(whatsappNumber, whatsappMessage || limitReachedMessage) ||
    sanitizeExternalUrl(String(details?.whatsappUrl || '').trim());

  return {
    message: limitReachedMessage || 'تم استهلاك الحد اليومي للمواعيد.',
    whatsappUrl,
    whatsappNumber,
  };
};
