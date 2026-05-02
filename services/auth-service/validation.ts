/**
 * خدمة التحقق (Validation Service):
 * هذا الملف يحتوي على وظائف مساعدة للتحقق من المدخلات (مثل البريد).
 */

/** توحيد تنسيق البريد الإلكتروني (إزالة المسافات وتحويل للأحرف الصغيرة) */
export const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();

/** التحقق من صحة هيكل البريد الإلكتروني باستخدام التعبيرات النمطية (Regex) */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
