// ═══════════════════════════════════════════════════════════════════════════
// خدمة كاش نتائج الذكاء الاصطناعي (AI Results Cache)
// ───────────────────────────────────────────────────────────────────────────
// الغرض: توفير مكالمات Gemini المكررة للمدخلات نفسها. الكاش يعيش في
// localStorage — per-browser, per-user. مجاني ومش بيعبي Firestore بـ reads.
//
// مثال: الطبيب يفحص نفس قائمة الأدوية مرتين في نفس الأسبوع → المرة الثانية
// تخرج من الكاش فوراً بدون استهلاك quota ولا أي مكالمة Gemini.
//
// المميزات:
//   • per-user: المفتاح يحتوي userId عشان العيادات المشتركة ما يتداخلوش.
//   • TTL مختلف لكل نوع (التداخلات 30 يوم، الحمل 90 يوم — أكثر استقراراً).
//   • version: لو schema النتيجة اتغير مستقبلاً نرفّع الـ version ونلغي القديم.
//   • eviction: لو localStorage امتلى، بنحذف أقدم 50 entry من نفس النوع.
// ═══════════════════════════════════════════════════════════════════════════

// نسخة الـ schema — لو غيرت بنية النتائج في المستقبل، ارفع الرقم
// عشان الـ entries القديمة تتجاهل تلقائياً وتُستبدل بنتائج جديدة.
const CACHE_VERSION = 'v1';

// MAX entries per (kind + user) قبل ما نبدأ evict
const MAX_ENTRIES_PER_KIND = 200;
// لما نـ evict بنشيل كام أقدم entry
const EVICT_BATCH = 50;

/** بنية كل entry في الكاش */
interface CacheEntry<T> {
  value: T;
  createdAt: number; // epoch ms
}

/** وصول آمن للـ localStorage — يرجع null لو الـ SSR أو blocked */
const safeLS = (): Storage | null => {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

/** بناء مفتاح الكاش — نطبّع userId من أي حرف خطر */
const buildKey = (kind: string, userId: string | null | undefined, subkey: string): string => {
  // نطبّع userId من أي حرف خطر (سلاشات، نقاط) عشان المفتاح يفضل safe
  const safeUser = (userId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '');
  return `drhc_ai_cache:${CACHE_VERSION}:${safeUser}:${kind}:${subkey}`;
};

/** تطبيع اسم دواء للاستخدام كمفتاح — lowercase + تنظيف المسافات */
export const normalizeDrugForKey = (drug: string): string => {
  return (drug || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * hash بسيط (djb2 variant) لمجموعة أدوية.
 * مرتّب (sorted) + مطبّع + مكرّر مدموج → أي ترتيب/حالة حروف لنفس الأدوية يعطي نفس الـ hash.
 * مثال: ["Panadol", "augmentin"] و ["AUGMENTIN", "panadol", "PANADOL"] → نفس الـ hash.
 * مهم: الـ dedup بعد normalize ضروري عشان "Panadol" و "PANADOL" يتعاملوا كدوا واحد.
 */
export const hashDrugList = (drugs: string[]): string => {
  const normalized = Array.from(
    new Set(drugs.map(normalizeDrugForKey).filter((d) => d.length > 0)),
  ).sort();
  const str = normalized.join('|');
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  // toString(36) عشان الـ key يكون قصير (حروف + أرقام بدون رموز)
  return (h >>> 0).toString(36);
};

/** تنظيف أقدم entries لتحرير مساحة — يُستدعى عند QuotaExceeded */
const evictOld = (kind: string, userId: string | null | undefined, count: number): void => {
  const ls = safeLS();
  if (!ls) return;
  const prefix = buildKey(kind, userId, '');
  const matches: Array<{ k: string; t: number }> = [];
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (!k || !k.startsWith(prefix)) continue;
    try {
      const raw = ls.getItem(k);
      if (!raw) continue;
      const entry = JSON.parse(raw) as CacheEntry<unknown>;
      matches.push({ k, t: entry.createdAt || 0 });
    } catch {
      // entry مكسور — نشيله
      matches.push({ k, t: 0 });
    }
  }
  // الأقدم أولاً
  matches.sort((a, b) => a.t - b.t);
  matches.slice(0, count).forEach((m) => {
    try { ls.removeItem(m.k); } catch { /* ignore */ }
  });
};

/**
 * قراءة قيمة من الكاش.
 * يرجع null لو مش موجود أو انتهت صلاحيته (TTL).
 */
export const getCache = <T>(
  kind: string,
  userId: string | null | undefined,
  subkey: string,
  ttlMs: number,
): T | null => {
  const ls = safeLS();
  if (!ls) return null;
  try {
    const key = buildKey(kind, userId, subkey);
    const raw = ls.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.createdAt !== 'number') {
      // بنية مكسورة — نشيلها
      ls.removeItem(key);
      return null;
    }
    // تحقق من TTL
    if (Date.now() - entry.createdAt > ttlMs) {
      ls.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
};

/**
 * حفظ قيمة في الكاش.
 * لو localStorage ممتلي، بنعمل evict لأقدم 50 ثم نحاول مرة تانية.
 */
export const setCache = <T>(
  kind: string,
  userId: string | null | undefined,
  subkey: string,
  value: T,
): void => {
  const ls = safeLS();
  if (!ls) return;
  const key = buildKey(kind, userId, subkey);
  const entry: CacheEntry<T> = { value, createdAt: Date.now() };
  const payload = JSON.stringify(entry);
  try {
    ls.setItem(key, payload);
    // soft-cap: لو تجاوزنا الحد المسموح لنفس الـ kind نعمل evict
    countAndMaybeEvict(kind, userId);
  } catch {
    // QuotaExceededError أو غيره — حاول تنظيف وأعد المحاولة
    try {
      evictOld(kind, userId, EVICT_BATCH);
      ls.setItem(key, payload);
    } catch {
      // فشل نهائي — نتجاهل (الكاش اختياري، الوظيفة الأساسية ما اتأثرتش)
    }
  }
};

/** لو تجاوزنا MAX_ENTRIES_PER_KIND نعمل evict لـ EVICT_BATCH */
const countAndMaybeEvict = (kind: string, userId: string | null | undefined): void => {
  const ls = safeLS();
  if (!ls) return;
  const prefix = buildKey(kind, userId, '');
  let count = 0;
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (k && k.startsWith(prefix)) count++;
  }
  if (count > MAX_ENTRIES_PER_KIND) {
    evictOld(kind, userId, EVICT_BATCH);
  }
};

// ─── ثوابت جاهزة للخدمات ─────────────────────────────────────────────────
/** TTL التداخلات الدوائية — 30 يوم (الأدلة بتتحدّث بانتظام) */
export const TTL_DRUG_INTERACTIONS = 30 * 24 * 60 * 60 * 1000;

/** TTL سلامة الحمل — 90 يوم (تصنيفات FDA نادراً بتتغير) */
export const TTL_PREGNANCY_SAFETY = 90 * 24 * 60 * 60 * 1000;

/** أنواع الكاش — لازم ثوابت عشان ما نكتبهاش strings مختلفة */
export const CACHE_KIND_DRUG_INTERACTIONS = 'intx';
export const CACHE_KIND_PREGNANCY_SAFETY = 'preg';
