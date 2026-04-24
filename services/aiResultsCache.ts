// ═══════════════════════════════════════════════════════════════════════════
// خدمة كاش نتائج الذكاء الاصطناعي (AI Results Cache) — IndexedDB
// ───────────────────────────────────────────────────────────────────────────
// الغرض: توفير مكالمات Gemini المكررة للمدخلات نفسها. الكاش يعيش في
// IndexedDB — per-browser, per-user. مجاني ومش بيعبي Firestore بـ reads.
//
// مثال: الطبيب يفحص نفس قائمة الأدوية مرتين في نفس الأسبوع → المرة الثانية
// تخرج من الكاش فوراً بدون استهلاك quota ولا أي مكالمة Gemini.
//
// ليه IndexedDB (مش localStorage)؟
//   localStorage محدود بـ 5-10 MB إجمالاً في كل المتصفحات — بيمتلي بسرعة مع
//   عدد كبير من التحليلات. IndexedDB بيسمح بـ 100s of MB (قد 60% من مساحة
//   القرص في Chrome)، فالكاش فعلياً "مفتوح" وبيوفر استدعاءات Gemini لفترة أطول.
//
// المميزات:
//   • per-user: المفتاح يحتوي userId عشان العيادات المشتركة ما يتداخلوش.
//   • TTL واسع (5 سنوات للنوعين) — التداخلات وتصنيفات FDA مستقرة جداً.
//   • version: لو schema النتيجة اتغير مستقبلاً نرفّع الـ version ونلغي القديم.
//   • حد مزدوج: 50 MB + 10000 entry لكل نوع — أي حد يتعدّى نعمل eviction.
//   • eviction: بنحذف دفعة من أقدم الـ entries لما الحد يتعدّى.
//   • async: الـ API بيرجّع Promises لأن IndexedDB ما يشتغلش sync.
// ═══════════════════════════════════════════════════════════════════════════

// نسخة الـ schema — لو غيرت بنية النتائج في المستقبل، ارفع الرقم
// عشان الـ entries القديمة تتجاهل تلقائياً وتُستبدل بنتائج جديدة.
const CACHE_VERSION = 'v1';

// ─── حدود الكاش (مزدوجة: حد أعلى للإدخالات + حد بالميجا) ───────────────────
// IndexedDB بيسمح بسعة أكبر بكتير من localStorage، فنحط حدود أوسع:
//   • 50 MB لكل نوع = 100 MB إجمالاً (داخل حد IndexedDB الآمن).
//   • 10,000 entry لكل نوع = سنوات من الاستخدام قبل ما يمتلي.
const MAX_BYTES_PER_KIND = 50 * 1024 * 1024; // 50 MB لكل نوع
const MAX_ENTRIES_PER_KIND = 10_000;
// لما نـ evict بنشيل دفعة كبيرة عشان نحرر مساحة كافية مرة واحدة
const EVICT_BATCH = 500;

// ─── إعدادات IndexedDB ─────────────────────────────────────────────────────
const DB_NAME = 'drhc_ai_cache';
const DB_VERSION = 1;
const STORE_NAME = 'entries';

/** بنية كل entry في الكاش */
interface CacheEntry<T = unknown> {
  key: string;        // المفتاح الكامل — primary key
  kind: string;       // نوع الكاش (intx / preg_v2 / ...) — للفلترة والـ eviction
  user: string;       // userId مُطبّع — للفلترة per-user
  value: T;           // القيمة نفسها (serializable)
  createdAt: number;  // epoch ms — للـ TTL والـ LRU eviction
  bytes: number;      // حجم تقريبي للـ value بالبايت — للـ size-based eviction
}

/** فتح DB (أو إنشاؤه أول مرة). يرجع null لو IndexedDB مش مدعوم/مقفول. */
const openDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          // indexes عشان نقدر نفلتر بالنوع والمستخدم بسرعة
          store.createIndex('kind_user', ['kind', 'user']);
          store.createIndex('createdAt', 'createdAt');
        }
      };
      req.onsuccess = () => resolve(req.result);
    } catch {
      resolve(null);
    }
  });
};

/** wrapper لتحويل IDBRequest إلى Promise */
const reqToPromise = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

/** بناء مفتاح الكاش — نطبّع userId من أي حرف خطر */
const buildKey = (kind: string, userId: string | null | undefined, subkey: string): string => {
  const safeUser = (userId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${CACHE_VERSION}:${safeUser}:${kind}:${subkey}`;
};

/** userId مُطبّع للفلترة */
const normalizeUser = (userId: string | null | undefined): string =>
  (userId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '');

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
  return (h >>> 0).toString(36);
};

/**
 * قراءة قيمة من الكاش.
 * يرجع null لو مش موجود أو انتهت صلاحيته (TTL).
 */
export const getCache = async <T>(
  kind: string,
  userId: string | null | undefined,
  subkey: string,
  ttlMs: number,
): Promise<T | null> => {
  const db = await openDB();
  if (!db) return null;
  try {
    const key = buildKey(kind, userId, subkey);
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const entry = await reqToPromise(store.get(key)) as CacheEntry<T> | undefined;
    db.close();
    if (!entry || typeof entry.createdAt !== 'number') return null;
    // تحقق من TTL — لو انتهى، نمسحه (في transaction منفصل عشان الـ readonly)
    if (Date.now() - entry.createdAt > ttlMs) {
      void deleteEntry(key);
      return null;
    }
    return entry.value;
  } catch {
    try { db.close(); } catch { /* ignore */ }
    return null;
  }
};

/** مسح entry واحد (internal) */
const deleteEntry = async (key: string): Promise<void> => {
  const db = await openDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await reqToPromise(tx.objectStore(STORE_NAME).delete(key));
    db.close();
  } catch { try { db.close(); } catch { /* ignore */ } }
};

/**
 * حفظ قيمة في الكاش.
 * لو IndexedDB امتلى، بنعمل evict لأقدم EVICT_BATCH ثم نحاول مرة تانية.
 */
export const setCache = async <T>(
  kind: string,
  userId: string | null | undefined,
  subkey: string,
  value: T,
): Promise<void> => {
  const db = await openDB();
  if (!db) return;
  const key = buildKey(kind, userId, subkey);
  const user = normalizeUser(userId);
  // تقدير حجم الـ value بعد serialization
  let bytes = 0;
  try { bytes = JSON.stringify(value).length; } catch { bytes = 0; }
  const entry: CacheEntry<T> = { key, kind, user, value, createdAt: Date.now(), bytes };
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await reqToPromise(tx.objectStore(STORE_NAME).put(entry));
    db.close();
    // بعد الإضافة الناجحة، نفحص لو تجاوزنا أي حد
    void countAndMaybeEvict(kind, user);
  } catch {
    try { db.close(); } catch { /* ignore */ }
    // QuotaExceededError أو غيره — حاول تنظيف وأعد المحاولة
    try {
      await evictOld(kind, user, EVICT_BATCH);
      const retry = await openDB();
      if (!retry) return;
      const tx2 = retry.transaction(STORE_NAME, 'readwrite');
      await reqToPromise(tx2.objectStore(STORE_NAME).put(entry));
      retry.close();
    } catch {
      // فشل نهائي — نتجاهل (الكاش اختياري، الوظيفة الأساسية ما اتأثرتش)
    }
  }
};

/** جلب كل entries لنوع + مستخدم معين (للعدّ والـ eviction) */
const getEntriesForKind = async (
  kind: string,
  user: string,
): Promise<Array<Pick<CacheEntry, 'key' | 'createdAt' | 'bytes'>>> => {
  const db = await openDB();
  if (!db) return [];
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('kind_user');
    const entries = await reqToPromise(index.getAll([kind, user])) as CacheEntry[];
    db.close();
    return entries.map((e) => ({ key: e.key, createdAt: e.createdAt || 0, bytes: e.bytes || 0 }));
  } catch {
    try { db.close(); } catch { /* ignore */ }
    return [];
  }
};

/** تنظيف أقدم entries لتحرير مساحة — يُستدعى عند تجاوز الحد أو QuotaExceeded */
const evictOld = async (kind: string, user: string, count: number): Promise<void> => {
  const entries = await getEntriesForKind(kind, user);
  if (entries.length === 0) return;
  // الأقدم أولاً
  entries.sort((a, b) => a.createdAt - b.createdAt);
  const toDelete = entries.slice(0, count);
  const db = await openDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const e of toDelete) {
      store.delete(e.key);
    }
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
    db.close();
  } catch { try { db.close(); } catch { /* ignore */ } }
};

/**
 * فحص مزدوج: لو تعدّينا حد الإدخالات أو حد البايتات نعمل evict.
 */
const countAndMaybeEvict = async (kind: string, user: string): Promise<void> => {
  const entries = await getEntriesForKind(kind, user);
  if (entries.length === 0) return;
  const totalBytes = entries.reduce((sum, e) => sum + (e.bytes || 0), 0);
  if (entries.length > MAX_ENTRIES_PER_KIND || totalBytes > MAX_BYTES_PER_KIND) {
    await evictOld(kind, user, EVICT_BATCH);
  }
};

// ─── ثوابت جاهزة للخدمات ─────────────────────────────────────────────────
/**
 * TTL التداخلات الدوائية — 5 سنوات.
 * التداخلات للأدوية الشائعة ثابتة علمياً لسنوات، والطبيب يقدر يعيد الفحص
 * يدوياً لو شك. التركيز على توفير استدعاءات Gemini لمئات الأطباء.
 */
export const TTL_DRUG_INTERACTIONS = 5 * 365 * 24 * 60 * 60 * 1000;

/**
 * TTL سلامة الحمل — 5 سنوات.
 * تصنيفات FDA (A/B/C/D/X) ثابتة عملياً — التحديثات نادرة جداً.
 */
export const TTL_PREGNANCY_SAFETY = 5 * 365 * 24 * 60 * 60 * 1000;

/** أنواع الكاش — لازم ثوابت عشان ما نكتبهاش strings مختلفة */
export const CACHE_KIND_DRUG_INTERACTIONS = 'intx';
// v2: أضاف lactationCategory + اختصر النص — مطلوب تغيير المفتاح لتفادي نتائج ناقصة من الكاش القديم
export const CACHE_KIND_PREGNANCY_SAFETY = 'preg_v2';
// كاش الترجمة السريرية per-field — الطبيب بيعدّل حقل واحد بس غالباً
// فنخزّن كل حقل منفصل ونعيد استدعاء Gemini للحقول المتغيّرة فقط.
export const CACHE_KIND_TRANSLATION = 'trans_v1';

/**
 * TTL الترجمة السريرية — 5 سنوات.
 * نفس النص العربي → نفس الترجمة الإنجليزية دايماً (temperature=0 في Gemini).
 * فالكاش آمن لمدة طويلة جداً.
 */
export const TTL_TRANSLATION = 5 * 365 * 24 * 60 * 60 * 1000;

/**
 * hash لنص مفرد (لاستخدامه كـ subkey في الكاش).
 * بنطبّع المسافات والأسطر عشان "كحه\nوصداع" و "كحه وصداع" يطلعوا نفس الـ hash.
 */
export const hashText = (text: string): string => {
  const normalized = (text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  let h = 5381;
  for (let i = 0; i < normalized.length; i++) {
    h = (h * 33) ^ normalized.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
};
