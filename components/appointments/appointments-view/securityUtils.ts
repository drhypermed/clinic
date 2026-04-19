/**
 * أدوات الأمان وتطهير الروابط (Security Utilities)
 * تضمن هذه الدوال أن جميع الروابط الخارجية (مثل واتساب) آمنة وتتبع البروتوكولات الصحيحة
 * لمنع ثغرات حقن الروابط أو التوجيه الضار.
 */

const startsWithHttpProtocol = (value: string) => /^https?:\/\//i.test(value);
const startsWithWhatsAppHost = (value: string) => /^(wa\.me\/|api\.whatsapp\.com\/)/i.test(value);

/**
 * دالة تطهير الروابط (Sanitize URL)
 * تتأكد من أن الرابط يبدأ بـ http أو https أو أنه رابط واتساب موثوق.
 */
export const sanitizeExternalHttpUrl = (value?: string): string => {
  const raw = (value || '').trim();
  if (!raw) return '';

  // إضافة البروتوكول إذا كان مفقوداً في روابط واتساب المعروفة
  const normalized = startsWithHttpProtocol(raw)
    ? raw
    : (startsWithWhatsAppHost(raw) ? `https://${raw}` : '');
    
  if (!normalized) return '';

  try {
    const parsed = new URL(normalized);
    // السماح فقط ببروتوكولات الويب القياسية
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString();
  } catch {
    return '';
  }
};
