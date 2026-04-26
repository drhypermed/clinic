import { checkPendingPwaUpdate } from './pwaUpdateService';

interface PwaDeploymentInfo {
  hasWaitingUpdate: boolean;
  deployedAtIso: string;
  deployedAtMs: number;
  etag: string;
  checkedAtIso: string;
}

// حد أقصى ٨ ثوان لكل طلب — لو الشبكة بطيئة أكثر من كده نعتبر الفحص فشل ونكمل،
// بدل ما المستخدم يفضل شايف "جارٍ الفحص" لدقيقة كاملة.
const FETCH_TIMEOUT_MS = 8000;

const parseDateToMs = (value: string): number => {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const fetchWithTimeout = async (url: string, init: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const readSwHeaders = async (): Promise<{ deployedAtIso: string; deployedAtMs: number; etag: string }> => {
  const swUrl = `/sw.js?ts=${Date.now()}`;

  const readHeaders = async (method: 'HEAD' | 'GET') => {
    const response = await fetchWithTimeout(
      swUrl,
      {
        method,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      },
      FETCH_TIMEOUT_MS,
    );
    if (!response.ok) {
      throw new Error(`SW_HEADERS_${method}_FAILED_${response.status}`);
    }

    const lastModifiedRaw = String(response.headers.get('last-modified') || '').trim();
    const etag = String(response.headers.get('etag') || '').trim();
    const deployedAtMs = parseDateToMs(lastModifiedRaw);

    return {
      deployedAtIso: deployedAtMs > 0 ? new Date(deployedAtMs).toISOString() : '',
      deployedAtMs,
      etag,
    };
  };

  try {
    return await readHeaders('HEAD');
  } catch {
    try {
      return await readHeaders('GET');
    } catch {
      return {
        deployedAtIso: '',
        deployedAtMs: 0,
        etag: '',
      };
    }
  }
};

export const getPwaDeploymentInfo = async (): Promise<PwaDeploymentInfo> => {
  const checkedAt = new Date();

  const [{ deployedAtIso, deployedAtMs, etag }, hasWaitingUpdate] = await Promise.all([
    readSwHeaders(),
    checkPendingPwaUpdate().catch(() => false),
  ]);

  return {
    hasWaitingUpdate,
    deployedAtIso,
    deployedAtMs,
    etag,
    checkedAtIso: checkedAt.toISOString(),
  };
};
