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
const tryMapCommonFirebaseError = (error: unknown): string | null => {
  const raw = error instanceof Error ? error.message.toLowerCase() : '';
  // الأخطاء المشتركة بين Firestore و Storage
  if (raw.includes('permission-denied') || raw.includes('storage/unauthorized')) {
    return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
  }
  if (raw.includes('unauthenticated') || raw.includes('storage/unauthenticated')) {
    return 'يجب تسجيل الدخول أولاً.';
  }
  if (raw.includes('unavailable') || raw.includes('storage/retry-limit-exceeded')) {
    return 'الخدمة غير متاحة حالياً، حاول مرة أخرى.';
  }
  // القيم الفاسدة (undefined/NaN) بتسبب invalid-argument — رسالة تساعد الأدمن يفهم السبب
  if (raw.includes('invalid-argument') || raw.includes('invalid data') || raw.includes('in field')) {
    return 'البيانات المُدخلة غير صالحة، تأكد من الحقول المطلوبة.';
  }
  // Storage: تجاوز سعة الحاوية أو ملف كبير
  if (raw.includes('storage/quota-exceeded') || raw.includes('resource-exhausted')) {
    return 'تم تجاوز السعة المتاحة، حاول لاحقاً.';
  }
  // Storage: الملف أكبر من الحد المسموح في قواعد Storage
  if (raw.includes('storage/invalid-format') || raw.includes('storage/invalid-argument')) {
    return 'نوع أو حجم الملف غير مسموح به.';
  }
  // انقطاع الشبكة
  if (raw.includes('failed to fetch') || raw.includes('network') || raw.includes('storage/canceled')) {
    return 'تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مجدداً.';
  }
  return null;
};

/**
 * النسخة المختصرة: تُرجع إحدى الرسائل الثلاث أو `fallback` إن لم تتطابق أي حالة.
 */
export const mapFirebaseActionError = (error: unknown, fallback: string): string =>
  tryMapCommonFirebaseError(error) ?? fallback;
