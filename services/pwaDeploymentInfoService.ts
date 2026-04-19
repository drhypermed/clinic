import { checkPendingPwaUpdate } from './pwaUpdateService';

export interface PwaDeploymentInfo {
  hasWaitingUpdate: boolean;
  deployedAtIso: string;
  deployedAtMs: number;
  etag: string;
  checkedAtIso: string;
}

const parseDateToMs = (value: string): number => {
  if (!value) return 0;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const readSwHeaders = async (): Promise<{ deployedAtIso: string; deployedAtMs: number; etag: string }> => {
  const swUrl = `/sw.js?ts=${Date.now()}`;

  const readHeaders = async (method: 'HEAD' | 'GET') => {
    const response = await fetch(swUrl, {
      method,
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
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
