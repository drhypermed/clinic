/**
 * إدارة الرموز السرية للسكرتارية (Secretary Secret Management)
 * هذا الملف مسؤول عن "مفتاح الدخول" الخاص بالسكرتارية:
 * 1. توليد رمز سري فريد (Secret Key) للطبيب ليعطيه للسكرتير.
 * 2. الحفاظ على مزامنة الرمز بين السيرفر، الكاش المحلي، والـ LocalStorage.
 * 3. استرجاع الرمز عند الحاجة للدخول أو المزامنة.
 */

import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {
  createBookingSecret,
  normalizeBookingSecret,
  readLocalStorageSafe,
  sanitizeDocSegment,
  writeLocalStorageSafe,
} from './helpers';
import { ensureBookingConfigUserId } from './secretConfig.ensure';
import { toUpdatedAtMs } from './secretConfig.shared';

/** 
 * جلب الرمز السري الحالي للحجز أو إنشاء واحد جديد.
 * استراتيجية المزامنة:
 * أ. المحاولة من السيرفر (Firestore Server) لضمان أحدث بيانات.
 * ب. في حال فشل الاتصال، المحاولة من الكاش (Firestore Cache).
 * ج. في حال عدم وجود كاش، المحاولة من التخزين المحلي للمتصفح (LocalStorage).
 * د. إذا لم يوجد أي رمز، يتم إنشاء رمز جديد وحفظه في كل مكان.
 */
export const getOrCreateBookingSecret = async (userId: string): Promise<string> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) throw new Error('invalid-user-id');

  const localKey = `booking_secret_${normalizedUserId}`;
  const userRef = doc(db, 'users', normalizedUserId);

  /** وظيفة مساعدة لاستخدام رمز موجود مع تفعيله محلياً */
  const useExistingSecret = async (rawSecret: unknown): Promise<string | null> => {
    const normalizedSecret = normalizeBookingSecret(rawSecret);
    if (!normalizedSecret) return null;

    writeLocalStorageSafe(localKey, normalizedSecret);
    await ensureBookingConfigUserId(normalizedSecret, normalizedUserId);
    return normalizedSecret;
  };

  // 1. من السيرفر
  try {
    const snap = await getDocFromServer(userRef);
    const existing = await useExistingSecret(snap.data()?.bookingSecret);
    if (existing) {
      return existing;
    }
  } catch (error) {
    console.warn('[Firestore] Failed to get booking secret from server (offline?), trying cache/local:', error);
  }

  // 2. من الكاش
  try {
    const snap = await getDoc(userRef);
    const existing = await useExistingSecret(snap.data()?.bookingSecret);
    if (existing) {
      console.log('[Firestore] Booking secret found in cache');
      return existing;
    }
  } catch (error) {
    console.error('[Firestore] Failed to get booking secret from cache:', error);
  }

  // 3. من الـ LocalStorage (مع إعادة مزامنته للسيرفر لضمان الاتساق)
  const cached = normalizeBookingSecret(readLocalStorageSafe(localKey));
  if (cached) {
    console.log('[Firestore] Booking secret found in localStorage, syncing to server');
    await setDoc(userRef, { bookingSecret: cached }, { merge: true }).catch((error) =>
      console.error('[Firestore] Failed to sync local secret to server:', error)
    );
    await ensureBookingConfigUserId(cached, normalizedUserId);
    return cached;
  }

  // 4. إنشاء رمز جديد كلياً
  const secret = createBookingSecret();
  console.log('[Firestore] Generating new booking secret');

  try {
    await setDoc(userRef, { bookingSecret: secret }, { merge: true });
    console.log('[Firestore] New booking secret saved to server.');
  } catch (error) {
    console.error('[Firestore] FATAL: Failed to save new booking secret to server:', error);
  }

  writeLocalStorageSafe(localKey, secret);
  await ensureBookingConfigUserId(secret, normalizedUserId);
  return secret;
};

/** 
 * البحث عن الرمز السري الفعال للطبيب باستخدام الـ UserId.
 * يستخدم هذا عند محاولة ربط سكرتارية موجودة من جهاز جديد أو إصلاح الاتصال.
 */
export const getBookingSecretByUserId = async (userId: string): Promise<string | null> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return null;

  try {
    const configsRef = collection(db, 'bookingConfig');
    
    // محاولة جلب أحدث إعداد مسجل في قاعدة بيانات السكرتارية
    const q = query(configsRef, where('userId', '==', normalizedUserId), orderBy('updatedAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const candidate = normalizeBookingSecret(snapshot.docs[0].id);
      if (candidate) return candidate;
    }

    // بديل: جلب كافة الإعدادات وترتيبها برمجياً (في حال فشل الـ Query بسبب غياب الـ Index)
    const fallbackQuery = query(configsRef, where('userId', '==', normalizedUserId), limit(10));
    const fallbackSnapshot = await getDocs(fallbackQuery);

    if (!fallbackSnapshot.empty) {
      const docs = fallbackSnapshot.docs
        .map((item) => ({ id: normalizeBookingSecret(item.id), data: item.data() as Record<string, unknown> }))
        .filter((item) => Boolean(item.id))
        .sort((a, b) => toUpdatedAtMs(b.data.updatedAt) - toUpdatedAtMs(a.data.updatedAt));

      if (docs[0]?.id) {
        console.log(
          '[Firestore] Fallback secretary secret resolution (in-memory sort). Found:',
          docs.length,
          'Best:',
          docs[0].id
        );
        return docs[0].id;
      }
    }

    // المحاولة الأخيرة: جلب الرمز مباشرة من حقل 'bookingSecret' في وثيقة الطبيب الرئيسية
    const userRef = doc(db, 'users', normalizedUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const secret = normalizeBookingSecret(userSnap.data()?.bookingSecret);
      if (secret) {
        const configRef = doc(db, 'bookingConfig', secret);
        await setDoc(configRef, { userId: normalizedUserId, updatedAt: new Date().toISOString() }, { merge: true });
        console.log('[Firestore] Created bookingConfig from user document (fallback)');
        return secret;
      }
    }

    return null;
  } catch (error) {
    console.error('[Firestore] Error getting secretary secret by userId:', error);

    // محاولة أخيرة بسيطة جداً بدون ترتيب أو تعقيد
    try {
      const configsRef = collection(db, 'bookingConfig');
      const q = query(configsRef, where('userId', '==', normalizedUserId), limit(10));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docs = snapshot.docs
          .map((item) => ({ id: normalizeBookingSecret(item.id), data: item.data() as Record<string, unknown> }))
          .filter((item) => Boolean(item.id))
          .sort((a, b) => toUpdatedAtMs(b.data.updatedAt) - toUpdatedAtMs(a.data.updatedAt));
        if (docs[0]?.id) return docs[0].id;
      }
    } catch {
      // تجاهل أي أخطاء إضافية
    }

    return null;
  }
};

