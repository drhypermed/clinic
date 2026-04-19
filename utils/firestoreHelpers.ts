/**
 * مساعدات Firestore المشتركة (Shared Firestore Helpers)
 *
 * يوفر هذا الملف دوال مساعدة عامة تُستخدم قبل كتابة البيانات على Firestore،
 * لتفادي تكرارها في كل ملف خدمة (Service).
 */

/**
 * حذف الحقول التي قيمتها `undefined` من كائن Payload.
 *
 * Firestore يرفض الكتابة عندما يحتوي الـ payload على قيم `undefined`
 * (على خلاف `null`). هذه الدالة تنظف الكائن قبل إرساله.
 */
export const omitUndefined = <T extends Record<string, unknown>>(payload: T): T => {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as T;
};
