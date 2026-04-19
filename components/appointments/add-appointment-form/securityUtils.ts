/**
 * أدوات الحماية والتعامل مع الروابط الخارجية (Security & URL Utilities)
 * تضمن هذه الأدوات أن الروابط المستخدمة في التطبيق آمنة وتتبع البروتوكولات الصحيحة.
 */

/** التأكد من أن الرابط يبدأ ببروتوكول http أو https */
const startsWithHttpProtocol = (value: string) => /^https?:\/\//i.test(value);

/** التأكد من أن الرابط يخص نطاق واتساب */
const startsWithWhatsAppHost = (value: string) =>
  /^(wa\.me\/|api\.whatsapp\.com\/)/i.test(value);

/**
 * تطهير الروابط الخارجية (Sanitize URL)
 * تمنع هجمات XSS وتضمن أن الرابط صالح للاستخدام في المتصفح.
 */
export const sanitizeExternalHttpUrl = (value?: string): string => {
  const raw = (value || '').trim();
  if (!raw) return '';
  const normalized = startsWithHttpProtocol(raw)
    ? raw
    : (startsWithWhatsAppHost(raw) ? `https://${raw}` : '');
  if (!normalized) return '';

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString();
  } catch {
    return '';
  }
};

