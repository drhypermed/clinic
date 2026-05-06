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
 *
 * ⚠️ ترتيب الأولويات (مهم جداً للسكرتيرة الرئيسية):
 *   1. `users/{uid}.bookingSecret` (الفرع الرئيسي) — موثوق ولا يتغير.
 *   2. لو فاضي، fallback لـ query أحدث `bookingConfig`.
 *
 * **ليه؟** لما الطبيب يعمل فرع جديد، بيتعمله `bookingConfig/{branchSecret}` بـ
 * `updatedAt` أحدث من mainSecret. لو رتبنا بـ updatedAt أولاً، السكرتيرة الرئيسية
 * اللي بتدخل عبر slug-only URL هتستخدم secret الفرع الفرعي بدل الرئيسي →
 * كلمة سرها مش هتطابق (لأن hash الفرع الرئيسي على mainSecret) → "بيانات الدخول
 * غير صحيحة". الـ root: نضمن mainSecret دايماً للسكرتيرة الرئيسية.
 */
export const getBookingSecretByUserId = async (userId: string): Promise<string | null> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return null;

  try {
    // 1. الأولوية: users/{uid}.bookingSecret — secret الفرع الرئيسي الموثوق.
    //    هذا يضمن إن السكرتيرة الرئيسية بتيجي على mainSecret حتى لو الطبيب
    //    أنشأ فرع جديد بـ bookingConfig/{branchSecret} بـ updatedAt أحدث.
    const userRef = doc(db, 'users', normalizedUserId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const mainSecret = normalizeBookingSecret(userSnap.data()?.bookingSecret);
      if (mainSecret) {
        // نتأكد إن bookingConfig موجود ومربوط بالـ userId — لو ضاع بيتعاد إنشاؤه
        const configRef = doc(db, 'bookingConfig', mainSecret);
        const configSnap = await getDoc(configRef).catch(() => null);
        if (!configSnap?.exists()) {
          await setDoc(
            configRef,
            { userId: normalizedUserId, updatedAt: new Date().toISOString() },
            { merge: true },
          ).catch(() => undefined);
        }
        return mainSecret;
      }
    }

    // 2. fallback: query على bookingConfig (للحالات النادرة اللي users doc مش
    //    عنده bookingSecret لأي سبب، مثلاً bug قديم أو data corruption).
    const configsRef = collection(db, 'bookingConfig');
    const q = query(configsRef, where('userId', '==', normalizedUserId), orderBy('updatedAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const candidate = normalizeBookingSecret(snapshot.docs[0].id);
      if (candidate) return candidate;
    }

    // 3. fallback ثانوي: query بدون orderBy + ترتيب in-memory (لو الـ index ناقص)
    const fallbackQuery = query(configsRef, where('userId', '==', normalizedUserId), limit(10));
    const fallbackSnapshot = await getDocs(fallbackQuery);
    if (!fallbackSnapshot.empty) {
      const docs = fallbackSnapshot.docs
        .map((item) => ({ id: normalizeBookingSecret(item.id), data: item.data() as Record<string, unknown> }))
        .filter((item) => Boolean(item.id))
        .sort((a, b) => toUpdatedAtMs(b.data.updatedAt) - toUpdatedAtMs(a.data.updatedAt));
      if (docs[0]?.id) return docs[0].id;
    }

    return null;
  } catch (error) {
    console.error('[Firestore] Error getting secretary secret by userId:', error);

    // محاولة أخيرة: نقرأ users doc بدون أي queries معقدة
    try {
      const userRef = doc(db, 'users', normalizedUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const mainSecret = normalizeBookingSecret(userSnap.data()?.bookingSecret);
        if (mainSecret) return mainSecret;
      }
    } catch {
      // تجاهل أي أخطاء إضافية
    }

    return null;
  }
};

