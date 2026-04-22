// ─────────────────────────────────────────────────────────────────────────────
// كاش محلّي (sessionStorage) لصفحة دليل الأطباء العامّه (Priority 2)
// ─────────────────────────────────────────────────────────────────────────────
// الفكره: بدل ما كل طلب filter يضرب Firestore مباشره (= 20 قراءه × كل filter change)،
// بنحفظ النتايج لمدّه 5 دقايق في sessionStorage. لو المستخدم غيّر الفلاتر
// ورجع نفس combination قبل 5 دقايق = نتيجه من الكاش = صفر قراءه.
//
// ليه sessionStorage مش localStorage؟
//   - sessionStorage بيمسح بعد ما المستخدم يقفل التاب = مش هيبقى عنده بيانات قديمه
//     اكتر من ما يلزم.
//   - مفيش مخاطر privacy طويله المدى.
//
// ليه 5 دقايق؟
//   - كمستخدم، لو دخلت فتحت أطباء ثم رجعت تشوف نفس القايمه خلال 5 دقايق = نفس النتيجه
//     المعقوله. لو عدّت 5 دقايق = ممكن يكون فيه طبيب اتسجّل حديث.
//   - لو طبيب سجّل حديث، أسوأ حاله يظهر للجمهور بعد 5 دقايق = مقبول جداً.
//
// توفير متوقّع: ~70% من قراءات الصفحه الأولى (الأكتر تكرار).
// ─────────────────────────────────────────────────────────────────────────────

import type { DoctorAdProfile } from '../../../types';

const CACHE_KEY_PREFIX = 'drh:publicDir:v1:';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 دقايق
const MAX_CACHE_ENTRIES = 10;       // حدّ أقصى عشان مفيش overflow (5MB حد sessionStorage)

/** شكل البيانات المخزّنه في الكاش */
interface CachedPage {
  data: DoctorAdProfile[];
  lastVisibleDoc: number | null;
  hasMore: boolean;
  cachedAt: number; // timestamp (ms)
}

/** شكل الفلاتر اللي بيتعمل عليها cache key */
export interface DirectoryCacheFilters {
  specialty?: string;
  governorate?: string;
  city?: string;
  search?: string;
}

/** بناء مفتاح فريد لتركيبة الفلاتر — عشان كل combination مختلف يبقى له entry مستقل */
const buildCacheKey = (filters: DirectoryCacheFilters): string => {
  const normalized = {
    s: (filters.specialty || '').trim(),
    g: (filters.governorate || '').trim(),
    c: (filters.city || '').trim(),
    q: (filters.search || '').trim().toLowerCase(),
  };
  return `${CACHE_KEY_PREFIX}${JSON.stringify(normalized)}`;
};

/** تأمين من فشل الـsessionStorage (مثلاً في incognito mode أو quota exceeded) */
const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(key, value);
  } catch {
    // ignore — ممكن يكون quota exceeded، مش مشكله نفقد entry واحد
  }
};

const safeRemoveItem = (key: string): void => {
  try {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

/** تنظيف الـentries الأقدم لو تخطّينا الحدّ الأقصى */
const evictOldestIfNeeded = (): void => {
  try {
    if (typeof window === 'undefined') return;
    const keys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith(CACHE_KEY_PREFIX)) keys.push(k);
    }
    if (keys.length <= MAX_CACHE_ENTRIES) return;

    // رتّب حسب cachedAt الأقدم (الأقدم أولاً عشان يتشال)
    const entries = keys
      .map((k) => {
        const raw = safeGetItem(k);
        if (!raw) return { key: k, cachedAt: 0 };
        try {
          const parsed = JSON.parse(raw) as CachedPage;
          return { key: k, cachedAt: parsed.cachedAt || 0 };
        } catch {
          return { key: k, cachedAt: 0 };
        }
      })
      .sort((a, b) => a.cachedAt - b.cachedAt);

    const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
    toRemove.forEach(({ key }) => safeRemoveItem(key));
  } catch {
    /* ignore */
  }
};

/**
 * قراءه من الكاش — بترجّع null لو مش موجود أو منتهي الصلاحيه (>5 دقايق).
 * لو انتهت الصلاحيه، بيمسح الـentry عشان مياخدش مساحه.
 */
export const getCachedDirectoryPage = (filters: DirectoryCacheFilters): CachedPage | null => {
  const key = buildCacheKey(filters);
  const raw = safeGetItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedPage;
    const age = Date.now() - (parsed.cachedAt || 0);
    if (age > CACHE_TTL_MS) {
      // entry قديم = نشيله عشان مياخدش مساحه
      safeRemoveItem(key);
      return null;
    }
    return parsed;
  } catch {
    // JSON فاسد = نشيله
    safeRemoveItem(key);
    return null;
  }
};

/**
 * حفظ نتيجه الصفحه الأولى في الكاش — بس الصفحه الأولى (lastVisibleDoc = null)
 * عشان Pagination الصفحات الجاية مش بيتحفظ (كل صفحه cursor مختلف).
 */
export const setCachedDirectoryPage = (
  filters: DirectoryCacheFilters,
  payload: Omit<CachedPage, 'cachedAt'>
): void => {
  const key = buildCacheKey(filters);
  const value: CachedPage = {
    ...payload,
    cachedAt: Date.now(),
  };
  safeSetItem(key, JSON.stringify(value));
  evictOldestIfNeeded();
};
