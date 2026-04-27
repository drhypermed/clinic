/**
 * كاش فحص السعة (Capacity Cache)
 *
 * الهدف: السماح بالحفظ offline لو فيه فحص سعة ناجح أُجرِي خلال آخر ساعة.
 *
 * السلوك:
 *   - online + فحص ناجح    → نخزن الـremaining والـtimestamp في localStorage.
 *   - offline / network err → لو الكاش موجود وأقل من ساعة و remaining > 0:
 *                              نرجع نتيجة ناجحة + ننقص الـremaining محلياً.
 *                              يعني الطبيب اللي عنده 10 سجلات متبقية يقدر يحفظ
 *                              10 سجلات offline قبل ما الكاش يخلص.
 *
 * الأمان: الفحص الفعلي للحد بيتم على Firestore rules وقت الكتابة. الكاش هنا
 * مجرد UX للسماح بالاستمرار offline — مش source of truth للحدود.
 */

const CACHE_PREFIX = 'drh_cap_';
const CACHE_TTL_MS = 60 * 60 * 1000; // ساعة واحدة

interface CachedCapacityEntry {
  /** المتبقي من الحد لما اتعمل الفحص */
  remaining: number;
  /** الحد الأقصى وقت الفحص */
  limit: number;
  /** نوع الحساب وقت الفحص (free/premium/pro_max) */
  accountType: string;
  /** متى تم الفحص الناجح (ms epoch) */
  cachedAt: number;
}

const buildKey = (userId: string, feature: string): string =>
  `${CACHE_PREFIX}${userId}_${feature}`;

const safeGetStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/** خزّن نتيجة فحص ناجح للسعة */
export const saveCapacityCache = (
  userId: string,
  feature: string,
  data: { remaining: number; limit: number; accountType: string },
): void => {
  const storage = safeGetStorage();
  if (!storage || !userId) return;
  try {
    const entry: CachedCapacityEntry = {
      remaining: Math.max(0, Math.floor(data.remaining)),
      limit: Math.max(0, Math.floor(data.limit)),
      accountType: data.accountType || 'free',
      cachedAt: Date.now(),
    };
    storage.setItem(buildKey(userId, feature), JSON.stringify(entry));
  } catch {
    // تجاهل أخطاء التخزين (لا تكسر الـsave path)
  }
};

/** اقرأ آخر فحص مخزّن — يرجع null لو مش موجود أو منتهي الصلاحية */
export const readCapacityCache = (userId: string, feature: string): CachedCapacityEntry | null => {
  const storage = safeGetStorage();
  if (!storage || !userId) return null;
  try {
    const raw = storage.getItem(buildKey(userId, feature));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedCapacityEntry;
    if (typeof entry.cachedAt !== 'number') return null;
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
};

/** أنقص remaining في الكاش بعد كل استخدام offline (لمنع التجاوز خلال نفس الساعة) */
export const decrementCapacityCache = (userId: string, feature: string): void => {
  const storage = safeGetStorage();
  if (!storage || !userId) return;
  const entry = readCapacityCache(userId, feature);
  if (!entry) return;
  try {
    const next: CachedCapacityEntry = {
      ...entry,
      remaining: Math.max(0, entry.remaining - 1),
      // مهم: مانعدّلش cachedAt — الـTTL يفضل من وقت آخر فحص ناجح حقيقي
    };
    storage.setItem(buildKey(userId, feature), JSON.stringify(next));
  } catch {
    // تجاهل
  }
};

/** هل الخطأ ده بسبب انقطاع الشبكة؟ */
export const isNetworkOfflineError = (error: unknown): boolean => {
  // أوضح إشارة: navigator.onLine = false لحظة الخطأ
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  // كـfallback نشوف نص الخطأ
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  if (!message) return false;
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('unavailable') ||
    message.includes('deadline-exceeded')
  );
};
