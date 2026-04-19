/**
 * خدمة التحقق والتحجيم (Validation & Throttling Service):
 * هذا الملف يحتوي على وظائف مساعدة للتحقق من المدخلات (مثل البريد وكلمة المرور)
 * بالإضافة إلى منطق لتقليل عدد محاولات الدخول الفاشلة (Throttling) على مستوى العميل.
 */

import { LOCKOUT_TIME, MAX_ATTEMPTS } from './constants';

// تخزين محاولات الدخول في الذاكرة (سيبقى مفعلاً ما دامت الصفحة مفتوحة)
// ملاحظة: يجب أن يكون هناك تحديد للمعدل (Rate Limiting) في الخادم (Server-side) أيضاً للأمان الكامل.
const loginAttempts: { [email: string]: { count: number; timestamp: number } } = {};

/** توحيد تنسيق البريد الإلكتروني (إزالة المسافات وتحويل للأحرف الصغيرة) */
export const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();

/** مفتاح فريد لكل مستخدم بناءً على بريده الإلكتروني للتحجيم */
const toRateLimitKey = (email: string) => normalizeEmail(email);

/**
 * التحقق مما إذا كان المستخدم قد تجاوز عدد محاولات الدخول المسموح بها.
 */
export const checkRateLimit = (email: string): boolean => {
  const key = toRateLimitKey(email);
  const now = Date.now();
  const attempt = loginAttempts[key];

  if (!attempt) return true;

  // إذا مر وقت كافٍ (LOCKOUT_TIME)، نقوم بتصفير العداد والسماح بالمحاولة
  if (now - attempt.timestamp > LOCKOUT_TIME) {
    delete loginAttempts[key];
    return true;
  }

  return attempt.count < MAX_ATTEMPTS;
};

/**
 * تسجيل نتيجة محاولة الدخول.
 * في حال النجاح: يتم تصفير العداد.
 * في حال الفشل: يتم زيادة العداد وتحديث وقت آخر محاولة.
 */
export const recordAttempt = (email: string, success: boolean) => {
  const key = toRateLimitKey(email);
  const now = Date.now();

  if (!loginAttempts[key]) {
    loginAttempts[key] = { count: 0, timestamp: now };
  }

  if (success) {
    delete loginAttempts[key];
  } else {
    loginAttempts[key].count++;
    loginAttempts[key].timestamp = now;
  }
};

/** التحقق من صحة هيكل البريد الإلكتروني باستخدام التعبيرات النمطية (Regex) */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * التحقق من قوة كلمة المرور.
 * تشترط القواعد: 8 أحرف، حرف كبير، رقم، ورمز خاص.
 */
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل' };
  }
  return { valid: true, message: 'كلمة مرور قوية' };
};

/**
 * بناء رابط "المتابعة" (Continue URL) المستخدم في روابط تسجيل الدخول عبر البريد (Magic Links).
 * يضمن بقاء المستخدم داخل نطاق الموقع (Origin) لأسباب أمنية.
 */
export const buildSafePublicContinueUrl = (
  continuePath: string,
  origin: string,
  fallbackPath = '/login/public?mode=verify'
): string => {
  const fallbackUrl = new URL(fallbackPath, origin).toString();

  try {
    const resolved = new URL(continuePath, origin);
    // حماية من هجمات إعادة التوجيه المفتوحة (Open Redirect Attacks)
    if (resolved.origin !== origin) return fallbackUrl;
    return resolved.toString();
  } catch {
    return fallbackUrl;
  }
};

