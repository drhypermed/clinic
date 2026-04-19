/**
 * تعريف أخطاء الكوتا (Quota Error Definitions)
 * هذا الملف يساعد في التعرف على أنواع الأخطاء المتعلقة بحدود الاستخدام:
 * 1. التعرف على خطأ "تجاوز الحد" (Daily Limit Reached).
 * 2. التعرف على الأخطاء "العابرة" (Transient Errors) مثل مشاكل الشبكة.
 * 3. توفير معايير موحدة لفحص نصوص الأخطاء القادمة من Cloud Functions.
 */

const normalizeErrorCode = (error: unknown): string =>
  String((error as { code?: unknown })?.code || '')
    .replace(/^functions\//, '')
    .trim()
    .toLowerCase();

const normalizeErrorText = (error: unknown): string =>
  `${normalizeErrorCode(error)} ${String((error as { message?: unknown })?.message || '')}`.toLowerCase();

/** العلامات التي تدل على تجاوز الحد اليومي */
const LIMIT_MARKERS = [
  'booking_daily_limit_reached',
  'storage_daily_limit_reached',
  'smart_rx_daily_limit_reached',
  'drug_tool_daily_limit_reached',
];

/** العلامات التي تدل على مشكلة في الاتصال أو السيرفر (غير متعلقة بالرصيد) */
const TRANSIENT_MARKERS = [
  'unavailable',
  'deadline-exceeded',
  'network-request-failed',
  'failed to fetch',
  'network error',
  'networkerror',
  'offline',
  'timeout',
  'load failed',
];

/** هل الخطأ هو تخطي للحد المسموح به؟ */
export const isQuotaLimitExceededError = (error: unknown): boolean => {
  const code = normalizeErrorCode(error);
  if (code === 'resource-exhausted') return true;

  const text = normalizeErrorText(error);
  return LIMIT_MARKERS.some((marker) => text.includes(marker));
};

/** هل الخطأ عابر ومؤقت (مثل انقطاع الإنترنت)؟ */
export const isQuotaTransientError = (error: unknown): boolean => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true;
  }

  const text = normalizeErrorText(error);
  return TRANSIENT_MARKERS.some((marker) => text.includes(marker));
};
