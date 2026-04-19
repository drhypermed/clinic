/**
 * إدارة إعدادات ورموز الحجز العام (Public Booking Secret & Config)
 * هذا الملف مسؤول عن:
 * 1. توليد "رمز سري" (Secret Key) فريد لكل عيادة لمشاركة رابط الحجز.
 * 2. ربط الرموز السرية ببيانات الطبيب (UserId) في Firestore.
 * 3. تخزين ومزامنة الرمز السري محلياً (LocalStorage) وعالمياً (Firestore).
 * 4. إدارة إعدادات نموذج الحجز (العنوان، معلومات التواصل).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst } from '../cacheFirst';
import {
  createPublicBookingSecret,
  normalizePublicSecret,
  readLocalStorageSafe,
  sanitizeDocSegment,
  toOptionalText,
  writeLocalStorageSafe,
} from './helpers';

/** تحويل القيمة المعطاة إلى طابع زمني بالميلي ثانية */
const toTimestampMs = (value: unknown): number => {
  const t = new Date(String(value || '')).getTime();
  return Number.isFinite(t) ? t : 0;
};

/** تنظيف أكواد أخطاء Firestore لتكون سهلة القراءة في المنطق البرمجي */
const normalizeFirestoreErrorCode = (error: unknown): string =>
  String((error as { code?: unknown })?.code || '')
    .trim()
    .toLowerCase()
    .replace(/^firebase\//, '')
    .replace(/^firestore\//, '');

/** التحقق مما إذا كان الخطأ ناتجاً عن نقص الصلاحيات */
const isPermissionDeniedError = (error: unknown): boolean => {
  const code = normalizeFirestoreErrorCode(error);
  if (code === 'permission-denied' || code === 'insufficient-permission') return true;
  const message = String((error as { message?: unknown })?.message || '').toLowerCase();
  return message.includes('missing or insufficient permissions');
};

/** هيكل بيانات إعدادات الحجز العام */
interface PublicBookingConfigData {
  userId: string;
  title?: string;
  contactInfo?: string;
}

/** 
 * التأكد من وجود ربط بين الـ UserId والـ Secret في Firestore.
 * يقوم أيضاً بحذف أي رموز قديمة (Stale) مرتبطة بنفس المستخدم لضمان وجود رمز فعال واحد فقط.
 */
export const ensurePublicBookingConfig = async (
  userId: string,
  activeSecret: string
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizePublicSecret(activeSecret);
  if (!normalizedUserId || !normalizedSecret) return;

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);
  await setDoc(
    configRef,
    { userId: normalizedUserId, updatedAt: new Date().toISOString() },
    { merge: true }
  );

  try {
    // تنظيف الرموز القديمة لنفس المستخدم
    const configsRef = collection(db, 'publicBookingConfig');
    const q = query(configsRef, where('userId', '==', normalizedUserId));
    const snapshot = await getDocsCacheFirst(q);
    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((item) => {
      if (item.id !== normalizedSecret) {
        deletePromises.push(deleteDoc(item.ref));
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return;
    }
    console.warn('[Firestore] Failed to cleanup stale public configs:', error);
  }
};

/** 
 * جلب الرمز السري الحالي للحجز أو إنشاء واحد جديد إذا لم يكن موجوداً.
 * يتبع استراتيجية (Server -> Cache -> LocalStorage) لضمان عدم ضياع التخصيصات.
 */
export const getOrCreatePublicBookingSecret = async (userId: string): Promise<string> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) {
    throw new Error('invalid-user-id');
  }

  const localKey = `public_booking_secret_${normalizedUserId}`;
  const userRef = doc(db, 'users', normalizedUserId);

  /** وظيفة مساعدة لاستخدام رمز موجود مع مزامنته */
  const useExistingSecret = async (rawSecret: unknown): Promise<string | null> => {
    const normalizedSecret = normalizePublicSecret(rawSecret);
    if (!normalizedSecret) return null;

    writeLocalStorageSafe(localKey, normalizedSecret);
    await ensurePublicBookingConfig(normalizedUserId, normalizedSecret);
    return normalizedSecret;
  };

  // 1. المحاولة من السيرفر مباشرة (الأكثر دقة)
  try {
    const snap = await getDocFromServer(userRef);
    const existing = await useExistingSecret(snap.data()?.publicBookingSecret);
    if (existing) return existing;
  } catch (error) {
    console.warn('[Firestore] Failed to get public secret from server, trying cache/local:', error);
  }

  // 2. المحاولة من الكاش المحلي (في حال عدم وجود اتصال)
  try {
    const snap = await getDocCacheFirst(userRef);
    const existing = await useExistingSecret(snap.data()?.publicBookingSecret);
    if (existing) return existing;
  } catch (error) {
    console.error('[Firestore] Failed to get public secret from cache:', error);
  }

  // 3. المحاولة من LocalStorage (الملاذ الأخير قبل الإنشاء)
  const cached = normalizePublicSecret(readLocalStorageSafe(localKey));
  if (cached) {
    await setDoc(userRef, { publicBookingSecret: cached }, { merge: true }).catch((error) =>
      console.error('[Firestore] Failed to sync local public secret to server:', error)
    );
    await ensurePublicBookingConfig(normalizedUserId, cached);
    return cached;
  }

  // 4. إنشاء رمز جديد كلياً
  const secret = createPublicBookingSecret();

  try {
    await setDoc(userRef, { publicBookingSecret: secret }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save new public secret to server:', error);
  }

  writeLocalStorageSafe(localKey, secret);
  await ensurePublicBookingConfig(normalizedUserId, secret);
  return secret;
};

/** جلب بيانات إعدادات نموذج الحجز باستخدام الرمز السري */
export const getPublicBookingConfig = async (
  secret: string
): Promise<PublicBookingConfigData | null> => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) return null;

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);
  const snap = await getDocCacheFirst(configRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  if (typeof data?.userId !== 'string') return null;

  return {
    userId: data.userId,
    title: toOptionalText(data?.title),
    contactInfo: toOptionalText(data?.contactInfo),
  };
};

/** البحث عن الرمز السري الفعال للطبيب باستخدام الـ UserId (مفيد للإدارة أو الإعدادات) */
export const getPublicSecretByUserId = async (userId: string): Promise<string | null> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return null;

  try {
    const configsRef = collection(db, 'publicBookingConfig');

    // محاولة جلب أحدث رمز مسجل
    try {
      const q = query(
        configsRef,
        where('userId', '==', normalizedUserId),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocsCacheFirst(q);
      if (!snapshot.empty) {
        const candidate = normalizePublicSecret(snapshot.docs[0].id);
        if (candidate) return candidate;
      }
    } catch {
      // الرجوع للمحاولة البسيطة في حال فشل الترتيب (نقص الـ Index)
    }

    const fallbackQuery = query(configsRef, where('userId', '==', normalizedUserId));
    const fallbackSnapshot = await getDocsCacheFirst(fallbackQuery);

    if (!fallbackSnapshot.empty) {
      const docs = fallbackSnapshot.docs
        .map((item) => ({ id: normalizePublicSecret(item.id), data: item.data() as Record<string, unknown> }))
        .filter((item) => Boolean(item.id));

      docs.sort((a, b) => toTimestampMs(b.data.updatedAt) - toTimestampMs(a.data.updatedAt));
      if (docs[0]?.id) return docs[0].id;
    }

    // المحاولة الأخيرة: جلب الرمز المباشر من وثيقة المستخدم
    try {
      const userRef = doc(db, 'users', normalizedUserId);
      const userSnap = await getDocCacheFirst(userRef);
      if (userSnap.exists()) {
        const secret = normalizePublicSecret(userSnap.data()?.publicBookingSecret);
        if (secret) {
          const configRef = doc(db, 'publicBookingConfig', secret);
          await setDoc(
            configRef,
            { userId: normalizedUserId, updatedAt: new Date().toISOString() },
            { merge: true }
          );
          return secret;
        }
      }
    } catch {
      return null;
    }

    return null;
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return null;
    }
    console.error('[Firestore] Unexpected error getting secret by userId:', error);
    return null;
  }
};

/** حفظ إعدادات شكل نموذج الحجز (العنوان ومعلومات العيادة) */
export const savePublicFormSettings = async (
  userId: string,
  secret: string,
  title: string,
  contactInfo: string
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedUserId || !normalizedSecret) return;

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);
  await setDoc(
    configRef,
    {
      userId: normalizedUserId,
      title: toOptionalText(title) || '',
      contactInfo: toOptionalText(contactInfo) || '',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

/** الاشتراك اللحظي في إعدادات الحجز لمراقبة أي تغييرات من الطبيب */
export const subscribeToPublicConfig = (
  secret: string,
  onUpdate: (config: { userId?: string; title?: string; contactInfo?: string }) => void
) => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) {
    onUpdate({});
    return () => undefined;
  }

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);

  /** معالجة وتحديث الحالة بالبيانات المجلوبة */
  const handleSnap = (snap: any) => {
    if (!snap.exists()) {
      onUpdate({});
      return;
    }

    const data = snap.data();
    onUpdate({
      userId: typeof data.userId === 'string' ? data.userId : undefined,
      title: toOptionalText(data.title),
      contactInfo: toOptionalText(data.contactInfo),
    });
  };

  // 1. المحاولة الأولى: جلب الإعدادات من الكاش للتحميل اللحظي (0ms) للمريض
  getDocCacheFirst(configRef).then(snap => {
    if (snap.exists()) handleSnap(snap);
  }).catch(() => {});

  // 2. المحاولة الثانية: الاشتراك في التحديثات الحية من السيرفر
  return onSnapshot(configRef, handleSnap);
};

