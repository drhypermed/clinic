/**
 * Hook مراقب بنرات الصفحة الرئيسية (useHomepageBanner):
 * يقوم هذا الـ Hook بجلب وإدارة البنرات الإعلانية أو التنبيهات التي تظهر في الواجهة:
 * 1. دعم جمهورين مختلفين (الأطباء والجمهور العام).
 * 2. تدوير تلقائي للصور (Rotation) بناءً على إعدادات المؤقت.
 * 3. فحص صلاحية انتهاء البنرات (Expiry Check).
 * 4. معالجة الروابط (CTA) والعناوين الفرعية.
 */

import { useEffect, useMemo, useState } from 'react';
import { doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';
import { useTrustedNow } from './useTrustedNow';
import { filterActiveBannerItems } from '../utils/homepageBannerTime';
import { warmBannerImages } from '../utils/bannerImageCache';

/** الفئات المستهدفة للبنرات */
type HomepageBannerAudience = 'doctors' | 'public';

/** هيكل بيانات العنصر الواحد في البنر */
interface HomepageBannerItem {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  targetUrl?: string;
  isActive?: boolean;
  displaySeconds?: number;
  expiresAt?: string;
}

/** هيكل البيانات الكامل للإعدادات القادمة من Firestore */
interface HomepageBannerData {
  imageUrl?: string;
  imageUrls?: string[];
  items?: HomepageBannerItem[];
  title?: string;
  subtitle?: string;
  ctaText?: string;
  targetUrl?: string;
  isActive?: boolean;
  bannerHeight?: number;
  rotationSeconds?: number;
}

/** أسماء الوثائق في Firestore حسب الجمهور المستهدف */
const BANNER_SETTINGS_DOC_BY_AUDIENCE: Record<HomepageBannerAudience, string> = {
  doctors: 'homepageBanner',
  public: 'homepageBannerPublic',
};

const BANNER_CACHE_PREFIX = 'dh_homepage_banner_v2_';
const bannerMemoryCache = new Map<HomepageBannerAudience, HomepageBannerData>();

const readStoredBanner = (audience: HomepageBannerAudience): HomepageBannerData | null => {
  if (typeof window === 'undefined') return null;

  const memoryValue = bannerMemoryCache.get(audience);
  if (memoryValue) return memoryValue;

  try {
    const raw = window.localStorage.getItem(`${BANNER_CACHE_PREFIX}${audience}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HomepageBannerData;
    if (!parsed || typeof parsed !== 'object') return null;
    bannerMemoryCache.set(audience, parsed);
    return parsed;
  } catch {
    return null;
  }
};

const storeBanner = (audience: HomepageBannerAudience, data: HomepageBannerData | null) => {
  if (typeof window === 'undefined') return;

  try {
    const key = `${BANNER_CACHE_PREFIX}${audience}`;
    if (!data) {
      bannerMemoryCache.delete(audience);
      window.localStorage.removeItem(key);
      return;
    }
    bannerMemoryCache.set(audience, data);
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable in private mode; Firestore cache still works.
  }
};

/**
 * وظيفة توحيد البيانات (Normalization) لضمان العمل مع الإصدارات القديمة والجديدة للهيكل
 */
const normalizeBannerData = (data: HomepageBannerData, nowMs: number): HomepageBannerData => {
  const normalizedUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter(Boolean)
    : data.imageUrl
      ? [data.imageUrl]
      : [];

  const normalizedItems: HomepageBannerItem[] = Array.isArray(data.items)
    ? data.items
      .filter((item) => !!item?.imageUrl)
      .map((item) => ({
        ...item,
        displaySeconds: Math.max(1, Number(item.displaySeconds) || Math.max(1, Number(data.rotationSeconds) || 5)),
        expiresAt: item.expiresAt || '',
      }))
    : normalizedUrls.map((url, index) => ({
      imageUrl: url,
      title: index === 0 ? data.title : '',
      subtitle: index === 0 ? data.subtitle : '',
      ctaText: index === 0 ? data.ctaText : '',
      targetUrl: index === 0 ? data.targetUrl : '',
      isActive: true,
      displaySeconds: Math.max(1, Number(data.rotationSeconds) || 5),
      expiresAt: '',
    }));

  // فلترة العناصر الفعالة وغير منتهية الصلاحية
  const activeItems = filterActiveBannerItems(normalizedItems, nowMs);

  return {
    ...data,
    items: activeItems,
    imageUrls: activeItems.map((item) => item.imageUrl),
    imageUrl: activeItems[0]?.imageUrl || '',
    title: activeItems[0]?.title || data.title,
    subtitle: activeItems[0]?.subtitle || data.subtitle,
    ctaText: activeItems[0]?.ctaText || data.ctaText,
    targetUrl: activeItems[0]?.targetUrl || data.targetUrl,
    bannerHeight: data.bannerHeight || 500,
    rotationSeconds: Math.max(1, Number(data.rotationSeconds) || 5),
  };
};

/**
 * Hook لجلب البنر الفعال حالياً.
 * @param audience الجمهور المستهدف (doctors افتراضياً).
 */
export const useHomepageBanner = (audience: HomepageBannerAudience = 'doctors') => {
  const [rawBanner, setRawBanner] = useState<HomepageBannerData | null>(() => readStoredBanner(audience));
  const [loading, setLoading] = useState(() => !readStoredBanner(audience));
  // البنرات تنتهي صلاحيتها بالأيام وليس الثواني، 5 دقائق كافية لإعادة الحساب
  const { nowMs } = useTrustedNow({ tickMs: 5 * 60 * 1000, syncIntervalMs: 30 * 60 * 1000 });

  const banner = useMemo(() => {
    return rawBanner ? normalizeBannerData(rawBanner, nowMs) : null;
  }, [rawBanner, nowMs]);

  useEffect(() => {
    const cached = readStoredBanner(audience);
    setRawBanner(cached);
    setLoading(!cached);
  }, [audience]);

  useEffect(() => {
    const urls = [
      ...(banner?.imageUrls || []),
      ...(banner?.items || []).map((item) => item.imageUrl),
      banner?.imageUrl || '',
    ].filter(Boolean);
    warmBannerImages(urls);
  }, [banner?.imageUrl, banner?.imageUrls, banner?.items]);

  useEffect(() => {
    const docId = BANNER_SETTINGS_DOC_BY_AUDIENCE[audience] || 'homepageBannerDoctors';
    const docRef = doc(db, 'settings', docId);

    let isCancelled = false;

    // 1. استرجاع سريع من الكاش (Cache-First)
    const loadFromCache = async () => {
      try {
        const snap = await getDocCacheFirst(docRef);
        if (isCancelled) return;
        if (!snap.exists()) {
          storeBanner(audience, null);
          setRawBanner(null);
          setLoading(false);
          return;
        }
        const data = snap.data() as HomepageBannerData;
        storeBanner(audience, data);
        setRawBanner(data);
        setLoading(false);
      } catch (err) {
        if (!isCancelled) setLoading(false);
        console.warn('Banner cache load failed:', err);
      }
    };
    
    // البنرات بتتغير كل شهر — كاش يكفي بدل مراقبة مستمرة
    void loadFromCache();

    return () => {
      isCancelled = true;
    };
  }, [audience]);

  return {
    banner,
    loading,
    isVisible: !!(
      banner?.isActive &&
      ((banner?.items && banner.items.length > 0) ||
        (banner?.imageUrls && banner.imageUrls.length > 0) ||
        banner?.imageUrl)
    ),
  };
};
