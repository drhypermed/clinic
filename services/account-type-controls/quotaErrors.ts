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
  'translation_daily_limit_reached',
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
  // ─ فشل App Check (reCAPTCHA) — أسباب ممكنة عند الطبيب: ─
  //   • Ad-blocker أو extension أمان بيمنع reCAPTCHA من التحميل
  //   • ISP بيفلتر دومين Google reCAPTCHA لحظياً
  //   • ساعة الجهاز مش مظبوطة (token signature بيـfail)
  //   • Domain مش مسجّل في إعدادات reCAPTCHA
  // كلها أسباب ما المفروض توقّف الطبيب عن الشغل، فبنعتبرها transient.
  // ─ permission-denied من Cloud Function callable: ─
  //   لما App Check بيفشل، Firebase SDK بيرمي functions/permission-denied.
  //   المستخدم مسجّل دخول فعلاً (auth شغّال)، فالخطأ ده تقني مش حقيقي.
  //   لو المستخدم فعلاً مش معاه صلاحية، Firestore rules هتمنعه في مكان تاني.
  // ─ unauthenticated من callable لما App Check token مش موجود: ─
  //   نفس الفكرة — المستخدم في الواقع مسجّل دخول، الخطأ بسبب App Check.
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

export const getQuotaVerificationFailureMessage = (
  fallback = 'تعذر التحقق من الحد اليومي الآن. تأكد من الاتصال وحاول مرة أخرى.',
): string => fallback;

/**
 * helper: ينفّذ دالة async مع إعادة محاولة لو فشلت بخطأ عابر (شبكة/timeout).
 * - لو الخطأ غير عابر (auth/quota/validation) — يرمي فوراً من غير retry.
 * - delays متزايدة: 350ms قبل المحاولة الثانية فقط (إجمالي ~700ms لو فشلت كلها).
 *
 * الفايده: 80% من مشاكل النت العابرة بتتحل في retry واحد، فالطبيب
 * مش هيشوف رسالة خطأ أصلاً. الـ~1 ثانية ده worst case.
 *
 * @param fn الدالة اللي هنحاول نشغلها
 * @param maxAttempts أقصى عدد محاولات (default: 2)
 * @param baseDelayMs الـdelay الأساسي بالـms (default: 350). الـattempt n هياخد baseDelayMs * n
 */
export async function retryOnTransientError<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2,
  baseDelayMs: number = 350,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // خطأ غير عابر (مش شبكة) → ارمي فوراً، مفيش فايده من retry
      if (!isQuotaTransientError(err)) throw err;
      // لسه فيه محاولات → استنى ثم retry
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
      }
    }
  }
  throw lastError;
}
