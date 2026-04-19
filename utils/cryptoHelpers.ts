/**
 * مساعدات التوليد العشوائي الآمن (Secure Random Helpers)
 *
 * يُستخدم أساساً لتوليد الرموز السرية للحجز (public/secretary booking secrets)
 * ومفاتيح عشوائية أخرى. يعتمد على Web Crypto API حين تكون متاحة،
 * مع Fallback يعتمد على `Math.random` في البيئات التي لا تدعمها.
 */

/**
 * توليد نص Hex عشوائي آمن بطول `size * 2` حرف (أي `size` بايت).
 *
 * @param size عدد البايتات المطلوبة (افتراضي 16 = 32 حرف Hex)
 */
export const getSecureRandomHex = (size = 16): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  // Fallback في حال عدم توفر Web Crypto API
  return Array.from({ length: size * 2 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};
