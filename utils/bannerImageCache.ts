const imageWarmCache = new Map<string, Promise<void>>();

const normalizeImageUrl = (url: string) => String(url || '').trim();

export const warmBannerImage = (url: string): Promise<void> => {
  const normalized = normalizeImageUrl(url);
  if (!normalized || typeof window === 'undefined') return Promise.resolve();

  const cached = imageWarmCache.get(normalized);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const decode = typeof img.decode === 'function' ? img.decode() : Promise.resolve();
      decode.then(() => resolve()).catch(() => resolve());
    };
    img.onerror = () => reject(new Error('banner-image-load-failed'));
    img.src = normalized;
  }).catch((error) => {
    imageWarmCache.delete(normalized);
    throw error;
  });

  imageWarmCache.set(normalized, promise);
  return promise;
};

export const warmBannerImages = (urls: string[]): void => {
  const uniqueUrls = Array.from(new Set(urls.map(normalizeImageUrl).filter(Boolean)));
  uniqueUrls.forEach((url) => {
    void warmBannerImage(url).catch(() => undefined);
  });
};
