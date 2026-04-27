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
  // Firestore: حجم الـdocument أكبر من 1MB (شائع لو في base64 محفوظ في الـdoc بدل URL)
  if (raw.includes('maximum-size') || raw.includes('document is too large') || raw.includes('1048487')) {
    return 'حجم البيانات أكبر من الحد المسموح. تأكد إن الصور اترفعت على Storage مش محفوظة في النص.';
  }
  // Storage: تجاوز سعة الحاوية أو ملف كبير
  if (raw.includes('storage/quota-exceeded') || raw.includes('resource-exhausted')) {
    return 'تم تجاوز السعة المتاحة، حاول لاحقاً.';
  }
  // Storage: الملف أكبر من الحد المسموح في قواعد Storage
  if (raw.includes('storage/invalid-format') || raw.includes('storage/invalid-argument')) {
    return 'نوع أو حجم الملف غير مسموح به.';
  }
  // Storage: الـobject مش موجود (نادر، بس بيحصل لو حذف وإعادة رفع متزامنة)
  if (raw.includes('storage/object-not-found')) {
    return 'الملف المطلوب غير موجود على الخادم.';
  }
  // App Check failure (لو enforcement مفعّل والـtoken مش صالح)
  if (raw.includes('app-check') || raw.includes('appcheck')) {
    return 'فشل التحقق الأمني للتطبيق. حدّث الصفحة وحاول مرة أخرى.';
  }
  // انقطاع الشبكة
  if (raw.includes('failed to fetch') || raw.includes('network') || raw.includes('storage/canceled')) {
    return 'تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مجدداً.';
  }
  return null;
};

/**
 * استخراج تفاصيل الخطأ من Firebase Error بشكل أكثر تفصيلاً للديبج.
 * بيرجع code + message الأصليين عشان الأدمن يقدر يبلّغ تفاصيل دقيقة.
 */
const extractRawErrorDetails = (error: unknown): string => {
  if (!error) return '';
  const errObj = error as { code?: unknown; message?: unknown; name?: unknown };
  const code = String(errObj?.code || '').trim();
  const message = String(errObj?.message || '').trim();
  if (code && message) return `${code}: ${message.slice(0, 200)}`;
  if (code) return code;
  if (message) return message.slice(0, 200);
  if (typeof error === 'string') return error.slice(0, 200);
  return '';
};

/**
 * النسخة المختصرة: تُرجع إحدى الرسائل المعروفة، أو `fallback` مع تفاصيل الخطأ
 * الأصلي للمساعدة في الديبج (بدل ما الأدمن يشوف رسالة عامة بدون تفاصيل).
 */
export const mapFirebaseActionError = (error: unknown, fallback: string): string => {
  const known = tryMapCommonFirebaseError(error);
  if (known) return known;
  // غير معروف → نضم التفاصيل عشان الأدمن يبلّغ بيها لو احتاج
  const details = extractRawErrorDetails(error);
  return details ? `${fallback} (${details})` : fallback;
};
