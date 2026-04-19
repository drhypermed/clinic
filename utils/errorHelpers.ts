/**
 * مساعدات فحص الأخطاء (Error Inspection Helpers)
 *
 * يوفر هذا الملف أدوات مشتركة لاستخراج الخصائص الشائعة من كائنات الخطأ
 * (code, message) وترجمتها لنصوص موحدة، حتى لا يتكرر هذا المنطق
 * في كل خدمة تستخدم `httpsCallable` أو Firestore.
 */

/**
 * استخراج `error.code` كنص منخفض الأحرف مع إزالة البادئة "functions/" إن وُجدت.
 * يُرجع نصاً فارغاً إن لم يكن الخطأ كائناً أو لم يكن له `code`.
 */
export const getErrorCode = (error: unknown): string => {
  if (!error || typeof error !== 'object') return '';
  const code = (error as { code?: unknown }).code;
  return String(code || '')
    .replace(/^functions\//, '')
    .toLowerCase();
};

/**
 * استخراج `error.message` كنص منخفض الأحرف.
 * يُرجع نصاً فارغاً إن لم يكن الخطأ كائناً أو لم يكن له `message`.
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return '';
  const message = (error as { message?: unknown }).message;
  return String(message || '').toLowerCase();
};

/**
 * دمج `code + message` في سلسلة واحدة منخفضة الأحرف مفصولة بمسافة،
 * مفيد للفحوص التي تبحث عن كلمة واحدة قد تظهر في أيٍ منهما.
 */
export const normalizeErrorString = (error: unknown): string =>
  `${getErrorCode(error)} ${getErrorMessage(error)}`.trim();

/** هل الخطأ ناتج عن انتهاء/عدم وجود جلسة المستخدم؟ */
export const isUnauthenticatedError = (error: unknown): boolean => {
  const combined = normalizeErrorString(error);
  return combined.includes('unauthenticated');
};

/** هل الخطأ مرتبط بـ Firebase App Check (وليس جلسة المستخدم)؟ */
export const isAppCheckError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  const combined = normalizeErrorString(error);

  return (
    combined.includes('appcheck') ||
    combined.includes('app check') ||
    combined.includes('app attestation') ||
    combined.includes('missing appcheck token') ||
    combined.includes('missing app check token') ||
    (code.includes('failed-precondition') && combined.includes('app'))
  );
};

/**
 * هل الخطأ ناتج عن تجاوز حد الحجوزات اليومي للطبيب؟
 * يُستخدم في Public Booking Flow لعرض رسالة ودّية للمريض.
 */
export const isBookingLimitExceededError = (error: unknown): boolean => {
  const code = getErrorCode(error);
  const rawMessage = String((error as { message?: unknown })?.message || '');
  return code === 'resource-exhausted' || rawMessage.includes('BOOKING_DAILY_LIMIT_REACHED');
};
