import { useEffect, useState } from 'react';
import {
  getTrustedNowDate,
  getTrustedNowMs,
  isTrustedTimeSynchronized,
  subscribeTrustedTime,
  syncTrustedTime,
} from '../utils/trustedTime';

interface UseTrustedNowOptions {
  tickMs?: number;
  syncIntervalMs?: number;
  syncOnMount?: boolean;
}

export const useTrustedNow = ({
  tickMs = 30 * 1000,
  syncIntervalMs = 5 * 60 * 1000,
  syncOnMount = true,
}: UseTrustedNowOptions = {}) => {
  const [state, setState] = useState(() => ({
    nowMs: getTrustedNowMs(),
    nowDate: getTrustedNowDate(),
    isSynchronized: isTrustedTimeSynchronized(),
  }));

  useEffect(() => {
    let disposed = false;

    const updateState = () => {
      if (disposed) return;
      setState({
        nowMs: getTrustedNowMs(),
        nowDate: getTrustedNowDate(),
        isSynchronized: isTrustedTimeSynchronized(),
      });
    };

    const unsubscribe = subscribeTrustedTime(updateState);
    updateState();

    if (syncOnMount) {
      void syncTrustedTime().finally(updateState);
    }

    const tickId = window.setInterval(updateState, Math.max(1000, tickMs));
    const syncId = window.setInterval(() => {
      void syncTrustedTime().finally(updateState);
    }, Math.max(30 * 1000, syncIntervalMs));

    return () => {
      disposed = true;
      unsubscribe();
      window.clearInterval(tickId);
      window.clearInterval(syncId);
    };
  }, [syncIntervalMs, syncOnMount, tickMs]);

  return state;
};