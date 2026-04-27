import { useEffect, useRef, useState } from 'react';
import { waitForPendingWrites } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export type SyncState = 'online' | 'offline' | 'unstable' | 'syncing';

/**
 * حالة اتصال التطبيق بخادم Firestore:
 * - online:   متصل ومتزامن
 * - offline:  بدون اتصال نهائياً — التطبيق يعمل من الكاش المحلي
 * - unstable: متصل لكن الشبكة بطيئة/ضعيفة (2G أو RTT عالي) — أكتر عرضة لفشل الطلبات
 * - syncing:  الاتصال رجع وفي كتابات معلّقة بتترفع حالياً
 *
 * كشف "unstable":
 *   نقرأ Network Information API لو متاح (Chrome/Edge/Samsung).
 *   على Safari/Firefox مفيش API مكافئ، فبنعتبر الاتصال "online" عادي.
 *   المعيار: effectiveType=2g/slow-2g أو RTT > 1000ms.
 */

// النوع الجزئي اللي نحتاجه من Network Information API (مش معرّف في TS lib افتراضياً)
interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  rtt?: number;
  downlink?: number;
  saveData?: boolean;
}

// قراءة الـ connection object من navigator مع دعم البادئات القديمة
const getConnection = (): NetworkInformation | null => {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  };
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
};

// قرار: هل الشبكة ضعيفة دلوقتي؟
const computeIsUnstable = (conn: NetworkInformation | null): boolean => {
  if (!conn) return false;
  const t = conn.effectiveType;
  if (t === 'slow-2g' || t === '2g') return true;
  // RTT > 1 ثانية = اتصال ضعيف حتى لو 4G (مثلاً واي‌فاي ضعيف)
  if (typeof conn.rtt === 'number' && conn.rtt > 1000) return true;
  return false;
};

export const useOnlineStatus = (): SyncState => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isUnstable, setIsUnstable] = useState<boolean>(() => computeIsUnstable(getConnection()));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const syncTokenRef = useRef(0);

  // مراقبة navigator.onLine (online/offline events)
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

  // مراقبة Network Information API لتحديث حالة "unstable" لما الشبكة تتغير
  useEffect(() => {
    const conn = getConnection();
    if (!conn) return;
    const update = () => setIsUnstable(computeIsUnstable(conn));
    update();
    conn.addEventListener('change', update);
    return () => conn.removeEventListener('change', update);
  }, []);

  // مراقبة الـ pending writes بعد عودة الاتصال (حالة syncing)
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

  // الأولوية: offline > syncing > unstable > online
  // (offline أكبر مشكلة، syncing مهم للأدمن يعرف إن في كتابات معلقة، unstable تحذير عام)
  if (!isOnline) return 'offline';
  if (isSyncing) return 'syncing';
  if (isUnstable) return 'unstable';
  return 'online';
};
