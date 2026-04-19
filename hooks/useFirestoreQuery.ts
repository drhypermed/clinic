import { useEffect, useRef, useState } from 'react';
import {
  DocumentData,
  DocumentReference,
  Query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  subscribeDocCacheFirst,
  subscribeDocsCacheFirst,
} from '../services/firestore/cacheFirst';

export interface FirestoreQueryState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  fromCache: boolean;
}

/**
 * Hook أوفلاين-فيرست لمستند واحد:
 * - يعرض النسخة المخزنة فوراً (بدون شاشة تحميل) إن وُجدت.
 * - يستمع للتحديثات الحية من السيرفر.
 * - يعمل بالكامل في وضع عدم الاتصال.
 *
 * @param ref مرجع المستند (مرّر null/undefined لإيقاف الاشتراك)
 * @param map دالة تحويل snapshot → الشكل النهائي
 */
export const useFirestoreDoc = <T>(
  ref: DocumentReference<DocumentData> | null | undefined,
  map: (snap: QueryDocumentSnapshot<DocumentData>) => T
): FirestoreQueryState<T | null> => {
  const [state, setState] = useState<FirestoreQueryState<T | null>>({
    data: null,
    loading: true,
    error: null,
    fromCache: false,
  });
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (!ref) {
      setState({ data: null, loading: false, error: null, fromCache: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: prev.data == null }));
    const unsub = subscribeDocCacheFirst(ref, {
      next: (snap) => {
        const data = snap.exists() ? mapRef.current(snap as QueryDocumentSnapshot<DocumentData>) : null;
        setState({ data, loading: false, error: null, fromCache: snap.metadata.fromCache });
      },
      error: (error) => setState((prev) => ({ ...prev, loading: false, error })),
    });
    return () => unsub();
  }, [ref?.path]);

  return state;
};

/**
 * Hook أوفلاين-فيرست لمجموعة مستندات:
 * - يعرض النتائج المخزنة فوراً (بدون شاشة تحميل) إن وُجدت.
 * - يستمع للتحديثات الحية تلقائياً.
 *
 * @param q الـ Query (مرّر null/undefined لإيقاف الاشتراك)
 * @param map دالة تحويل لكل doc
 * @param deps قيم إضافية تُعيد بناء الاشتراك عند تغيرها (مثل فلاتر)
 */
export const useFirestoreCollection = <T>(
  q: Query<DocumentData> | null | undefined,
  map: (doc: QueryDocumentSnapshot<DocumentData>) => T,
  deps: React.DependencyList = []
): FirestoreQueryState<T[]> => {
  const [state, setState] = useState<FirestoreQueryState<T[]>>({
    data: [],
    loading: true,
    error: null,
    fromCache: false,
  });
  const mapRef = useRef(map);
  mapRef.current = map;

  useEffect(() => {
    if (!q) {
      setState({ data: [], loading: false, error: null, fromCache: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: prev.data.length === 0 }));
    const unsub = subscribeDocsCacheFirst(q, {
      next: (snap) => {
        const data = snap.docs.map((d) => mapRef.current(d));
        setState({ data, loading: false, error: null, fromCache: snap.metadata.fromCache });
      },
      error: (error) => setState((prev) => ({ ...prev, loading: false, error })),
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
};
