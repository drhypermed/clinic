/**
 * مساعدات التخزين المحلي المشتركة (Shared LocalStorage Helpers)
 *
 * يوفر هذا الملف واجهة موحّدة وآمنة للتعامل مع `localStorage`:
 *   1. حماية من بيئات SSR حيث `window` غير معرَّف.
 *   2. ابتلاع استثناءات `QuotaExceededError` / التصفح الخاص / الحظر.
 *   3. تسهيل التعامل مع القيم المُسلسلة JSON دون تكرار `try/catch` في كل مستهلك.
 *
 * كل الدوال ترجع `null` / `void` على الفشل (وليس `''` أو throw) — أي مستهلك
 * يحتاج سلوكاً مختلفاً (مثل `readCachedPushToken` الذي يُرجع `''`) عليه
 * تحويل النتيجة محلياً عبر `?? ''`.
 */

/** وصول آمن لكتابة نص خام في التخزين المحلي */
export const safeLsSet = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* تجاهل الأخطاء (التصفح الخاص، امتلاء الذاكرة، ..) */
  }
};

/** قراءة آمنة لنص خام من التخزين المحلي */
export const safeLsGet = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** حذف آمن لمفتاح من التخزين المحلي */
export const safeLsRemove = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* تجاهل */
  }
};

