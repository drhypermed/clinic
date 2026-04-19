import { useEffect, useRef, useState } from 'react';
import { disableNetwork, enableNetwork, waitForPendingWrites } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export type SyncState = 'online' | 'offline' | 'syncing';

/**
 * حالة اتصال التطبيق بخادم Firestore:
 * - online: متصل ومتزامن
 * - offline: بدون اتصال — التطبيق يعمل من الكاش المحلي وأي كتابات تُخزّن في طابور
 * - syncing: الاتصال رجع وفي كتابات معلّقة بتترفع حالياً
 *
 * نعتمد على `navigator.onLine` لحالة الشبكة، و `waitForPendingWrites`
 * لاكتشاف ما إذا كانت هناك كتابات محلية لم تُرفع بعد بعد عودة الاتصال.
 */
export const useOnlineStatus = (): SyncState => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const syncTokenRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setIsSyncing(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    const token = ++syncTokenRef.current;
    setIsSyncing(true);
    let cancelled = false;
    waitForPendingWrites(db)
      .catch(() => { /* ignore */ })
      .finally(() => {
        if (cancelled || token !== syncTokenRef.current) return;
        setIsSyncing(false);
      });
    return () => { cancelled = true; };
  }, [isOnline]);

  if (!isOnline) return 'offline';
  if (isSyncing) return 'syncing';
  return 'online';
};

export const goOffline = () => disableNetwork(db).catch(() => {});
export const goOnline = () => enableNetwork(db).catch(() => {});
