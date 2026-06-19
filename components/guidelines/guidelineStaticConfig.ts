type ViteEnv = {
  VITE_GUIDELINE_STATIC_BASE_URL?: string;
  VITE_GUIDELINE_STATIC_VERSION?: string;
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const getViteEnv = () => (import.meta as unknown as { env?: ViteEnv }).env || {};

export const getGuidelineStaticVersion = () => {
  const version = String(getViteEnv().VITE_GUIDELINE_STATIC_VERSION || 'v1').trim();
  return version || 'v1';
};

export const getGuidelineStaticBaseUrl = () =>
  String(getViteEnv().VITE_GUIDELINE_STATIC_BASE_URL || '').trim();

const appendStaticVersion = (url: string) => {
  const version = getGuidelineStaticVersion();
  if (!version || /[?&]v=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`;
};

export const buildGuidelineStaticUrl = (baseUrl: string, relativePath: string) => {
  const path = relativePath.replace(/^\/+/, '');
  const url = baseUrl.includes('{path}')
    ? baseUrl.replace('{path}', encodeURIComponent(path))
    : `${normalizeBaseUrl(baseUrl)}/${path}`;
  return appendStaticVersion(url);
};

export const fetchGuidelineStaticJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      credentials: 'omit',
      cache: 'force-cache',
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
};
