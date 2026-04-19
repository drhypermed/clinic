/**
 * خريطة موحدة لتحويل أخطاء Firebase/Firestore الشائعة إلى رسائل عربية.
 *
 * الحالات الثلاث الأكثر تكراراً عبر لوحات الإدارة:
 *  - permission-denied  → لا تملك صلاحية تنفيذ هذا الإجراء.
 *  - unauthenticated    → يجب تسجيل الدخول أولاً.
 *  - unavailable        → الخدمة غير متاحة حالياً، حاول مرة أخرى.
 *
 * كانت هذه الدالة مُعرَّفة حرفياً في عدة ملفات `securityUtils.ts`.
 * جُمِعت هنا لتكون المصدر الوحيد؛ تستدعيها الملفات الأصلية وتعيد تصديرها
 * بأسمائها القديمة للحفاظ على توافق كل الاستخدامات.
 */

/**
 * يُرجع الرسالة المطابقة لأحد الحالات المشتركة، أو `null` إن لم تتطابق أي حالة.
 * يُستخدم بواسطة خرائط الأخطاء الموسَّعة التي تضيف حالات خاصة بها.
 */
export const tryMapCommonFirebaseError = (error: unknown): string | null => {
  const raw = error instanceof Error ? error.message.toLowerCase() : '';
  if (raw.includes('permission-denied')) return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
  if (raw.includes('unauthenticated')) return 'يجب تسجيل الدخول أولاً.';
  if (raw.includes('unavailable')) return 'الخدمة غير متاحة حالياً، حاول مرة أخرى.';
  return null;
};

/**
 * النسخة المختصرة: تُرجع إحدى الرسائل الثلاث أو `fallback` إن لم تتطابق أي حالة.
 */
export const mapFirebaseActionError = (error: unknown, fallback: string): string =>
  tryMapCommonFirebaseError(error) ?? fallback;
