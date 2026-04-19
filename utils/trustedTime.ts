const TRUSTED_TIME_SYNC_TTL_MS = 5 * 60 * 1000;
const TRUSTED_TIME_SYNC_TIMEOUT_MS = 8000;

let trustedBaseNowMs = Date.now();
let trustedBasePerfMs = typeof performance !== 'undefined' ? performance.now() : 0;
let trustedTimeSynchronized = false;
let lastSyncWallClockMs = 0;
let syncPromise: Promise<number> | null = null;

const listeners = new Set<() => void>();

const emitTrustedTimeChange = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('[TrustedTime] Listener error:', error);
    }
  });
};

const updateTrustedClock = (serverNowMs: number, perfNowMs: number) => {
  trustedBaseNowMs = serverNowMs;
  trustedBasePerfMs = perfNowMs;
  trustedTimeSynchronized = true;
  lastSyncWallClockMs = Date.now();
  emitTrustedTimeChange();
};

const parseServerDateHeader = (headerValue: string | null): number | null => {
  if (!headerValue) return null;
  const parsedMs = Date.parse(headerValue);
  return Number.isFinite(parsedMs) ? parsedMs : null;
};

const resolveTrustedTimeUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL(window.location.pathname || '/', window.location.origin);
    url.searchParams.set('_trustedTime', '1');
    return url.toString();
  } catch {
    return window.location.origin || null;
  }
};

export const getTrustedNowMs = (): number => {
  if (typeof performance === 'undefined') return trustedBaseNowMs;
  const elapsedMs = Math.max(0, performance.now() - trustedBasePerfMs);
  return trustedBaseNowMs + elapsedMs;
};

export const getTrustedNowDate = (): Date => new Date(getTrustedNowMs());

export const isTrustedTimeSynchronized = (): boolean => trustedTimeSynchronized;

export const subscribeTrustedTime = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const syncTrustedTime = async (force = false): Promise<number> => {
  if (syncPromise) return syncPromise;

  if (!force && trustedTimeSynchronized && Date.now() - lastSyncWallClockMs < TRUSTED_TIME_SYNC_TTL_MS) {
    return getTrustedNowMs();
  }

  if (typeof window === 'undefined' || typeof fetch === 'undefined' || typeof performance === 'undefined') {
    return getTrustedNowMs();
  }

  const requestUrl = resolveTrustedTimeUrl();
  if (!requestUrl) return getTrustedNowMs();

  syncPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), TRUSTED_TIME_SYNC_TIMEOUT_MS);
    const startedPerfMs = performance.now();

    try {
      const response = await fetch(requestUrl, {
        method: 'HEAD',
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });
      const endedPerfMs = performance.now();
      const serverNowMs = parseServerDateHeader(response.headers.get('date'));

      if (serverNowMs === null) {
        throw new Error('missing-date-header');
      }

      const midpointPerfMs = startedPerfMs + ((endedPerfMs - startedPerfMs) / 2);
      updateTrustedClock(serverNowMs, midpointPerfMs);
      return getTrustedNowMs();
    } catch (error) {
      console.warn('[TrustedTime] Falling back to unsynchronized local clock:', error);
      emitTrustedTimeChange();
      return getTrustedNowMs();
    } finally {
      window.clearTimeout(timeoutId);
      syncPromise = null;
    }
  })();

  return syncPromise;
};