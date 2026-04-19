/**
 * استراتيجية "الكاش أولاً مع التحديث في الخلفية" (Stale-While-Revalidate):
 * 1. يرجّع البيانات من الكاش فوراً لسرعة الاستجابة.
 * 2. يطلق طلباً متزامناً في الخلفية لتحديث الكاش من السيرفر بأسرع وقت.
 *    النتيجة: المستخدم يرى البيانات بلا انتظار، وأي تغيير سيصل تلقائياً في
 *    المكالمة التالية أو عبر أي `onSnapshot` مستمع.
 * 3. إذا لم تكن البيانات موجودة في الكاش، يقوم بالجلب المباشر من السيرفر.
 * 4. `subscribe*` تقدم نمط cache-first حقيقي مع `onSnapshot` — الكاش فوراً ثم تحديثات حية.
 */

import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
  Unsubscribe,
  getDoc,
  getDocFromCache,
  getDocs,
  getDocsFromCache,
  onSnapshot,
} from 'firebase/firestore';

/** إطلاق تحديث للكاش من السيرفر في الخلفية (بدون انتظار النتيجة). */
const reviveInBackground = (promise: Promise<unknown>) => {
  promise.catch(() => { /* تجاهل أخطاء التحديث الخلفي */ });
};

/**
 * جلب مستند واحد مع تفضيل الكاش المحلي.
 * إذا كان الكاش موجوداً: يرجّعه فوراً ويطلق طلب تحديث خلفي للسيرفر.
 */
export const getDocCacheFirst = async <T extends DocumentData>(ref: DocumentReference<T>) => {
  try {
    const cached = await getDocFromCache(ref);
    if (cached.exists()) {
      // تحديث الكاش من السيرفر في الخلفية — المكالمة التالية ستحصل على أحدث نسخة
      reviveInBackground(getDoc(ref));
      return cached;
    }
  } catch {
    /* لا توجد نسخة مخزنة، سيتم الجلب من السيرفر */
  }
  return getDoc(ref);
};

/**
 * جلب مجموعة مستندات مع تفضيل الكاش المحلي.
 * إذا كان الكاش موجوداً: يرجّعه فوراً ويطلق طلب تحديث خلفي للسيرفر.
 */
export const getDocsCacheFirst = async <T extends DocumentData>(q: Query<T>): Promise<QuerySnapshot<T>> => {
  try {
    const cached = await getDocsFromCache(q);
    if (!cached.empty) {
      reviveInBackground(getDocs(q));
      return cached;
    }
  } catch {
    /* لا توجد نسخة مخزنة، سيتم الجلب من السيرفر */
  }
  return getDocs(q);
};

interface SubscribeCallbacks<S> {
  next: (snapshot: S) => void;
  error?: (err: Error) => void;
}

/**
 * اشتراك في مستند واحد بنمط cache-first:
 * - ينفذ callback فوراً بالنسخة المحلية المخزنة (إن وُجدت) بدون انتظار السيرفر.
 * - ثم يشترك في التحديثات الحية — كل تغيير من السيرفر يصل تلقائياً.
 * - عند الأوفلاين: يستمر بالعمل من الكاش ولا ينهار.
 */
export const subscribeDocCacheFirst = <T extends DocumentData>(
  ref: DocumentReference<T>,
  callbacks: SubscribeCallbacks<DocumentSnapshot<T>>
): Unsubscribe => {
  let delivered = false;

  getDocFromCache(ref)
    .then((cached) => {
      if (!delivered && cached.exists()) {
        callbacks.next(cached);
      }
    })
    .catch(() => { /* لا توجد نسخة مخزنة */ });

  return onSnapshot(
    ref,
    { includeMetadataChanges: false },
    (snap) => {
      delivered = true;
      callbacks.next(snap);
    },
    (err) => callbacks.error?.(err)
  );
};

/**
 * اشتراك في مجموعة مستندات بنمط cache-first:
 * - ينفذ callback فوراً بالنتائج المخزنة محلياً.
 * - ثم يستمع للتحديثات الحية.
 * - يعمل بسلاسة في وضع عدم الاتصال.
 */
export const subscribeDocsCacheFirst = <T extends DocumentData>(
  q: Query<T>,
  callbacks: SubscribeCallbacks<QuerySnapshot<T>>
): Unsubscribe => {
  let delivered = false;

  getDocsFromCache(q)
    .then((cached) => {
      if (!delivered && !cached.empty) {
        callbacks.next(cached);
      }
    })
    .catch(() => { /* لا توجد نسخة مخزنة */ });

  return onSnapshot(
    q,
    { includeMetadataChanges: false },
    (snap) => {
      delivered = true;
      callbacks.next(snap);
    },
    (err) => callbacks.error?.(err)
  );
};
