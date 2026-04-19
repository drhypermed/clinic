/**
 * إدارة الروابط المخصصة (URL Slugs Management)
 * هذا الملف مسؤول عن تحويل المعرفات الطويلة (UID) إلى روابط قصيرة وسهلة القراءة:
 * 1. توليد روابط فريدة مثل (drhyper.link/b/xyz) للحجز.
 * 2. إدارة مجموعة 'slugLookup' التي تسمح للجمهور بالوصول لبيانات العيادة دون الحاجة لتسجيل دخول.
 * 3. حل التعارضات (Conflicts) عند تشابه الروابط المقترحة.
 */

import { collection, doc, getDoc, getDocs, limit, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { createRandomSlug, normalizeSlug, sanitizeDocSegment } from './helpers';

/** 
 * وظيفة داخلية لضمان توليد رابط فريد غير مستخدم من قبل طبيب آخر.
 * تحاول التوليد العشوائي عدة مرات، وفي حال التعارض المستمر تستخدم طابعاً زمنياً.
 */
const resolveUniqueSlug = async (
  field: 'bookingUrlSlug' | 'publicUrlSlug',
  prefix: string,
  maxAttempts = 12
): Promise<string> => {
  const usersRef = collection(db, 'users');

  for (let i = 0; i < maxAttempts; i += 1) {
    const candidate = createRandomSlug(prefix, 6);
    const q = query(usersRef, where(field, '==', candidate), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return candidate;
  }

  // خطة بديلة في حال تكرار التعارض: استخدام الوقت الحالي لضمان التفرد
  return `${prefix}${Date.now().toString(36).slice(-8)}`;
};

/** 
 * حفظ الربط بين (الرابط القصي -> معرف الطبيب) في مجموعة 'slugLookup'.
 * هذه المجموعة "عامة" (Public) للسماح للمرضى بالوصول للعيادة عبر الرابط.
 */
const persistSlugLookup = async (slug: string, userId: string): Promise<void> => {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return;
  try {
    await setDoc(doc(db, 'slugLookup', normalizedSlug), { userId, slug: normalizedSlug }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Error persisting slug lookup:', error);
  }
};

/** جلب الرابط الحالي للعيادة أو إنشاء واحد جديد (خاص برابط السكرتارية) */
export const getOrCreateBookingUrlSlug = async (userId: string): Promise<string> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) throw new Error('invalid-user-id');

  const userRef = doc(db, 'users', normalizedUserId);

  try {
    const snap = await getDoc(userRef);
    const current = normalizeSlug(snap.exists() ? snap.data().bookingUrlSlug : '');
    if (current) {
      // التأكد من وجود المدخل في الفهرس العام
      await persistSlugLookup(current, normalizedUserId);
      return current;
    }
  } catch (error) {
    console.error('[Firestore] Error checking booking slug:', error);
  }

  const slug = await resolveUniqueSlug('bookingUrlSlug', 'b');

  try {
    await setDoc(userRef, { bookingUrlSlug: slug }, { merge: true });
    await persistSlugLookup(slug, normalizedUserId);
  } catch (error) {
    console.error('[Firestore] Error saving booking slug:', error);
  }

  return slug;
};

/** جلب الرابط الحالي للعيادة أو إنشاء واحد جديد (خاص برابط الحجز العام للمرضى) */
export const getOrCreatePublicUrlSlug = async (userId: string): Promise<string> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) throw new Error('invalid-user-id');

  const userRef = doc(db, 'users', normalizedUserId);

  try {
    const snap = await getDoc(userRef);
    const current = normalizeSlug(snap.exists() ? snap.data().publicUrlSlug : '');
    if (current) {
      await persistSlugLookup(current, normalizedUserId);
      return current;
    }
  } catch (error) {
    console.error('[Firestore] Error checking public slug:', error);
  }

  const slug = await resolveUniqueSlug('publicUrlSlug', 'd');

  try {
    await setDoc(userRef, { publicUrlSlug: slug }, { merge: true });
    await persistSlugLookup(slug, normalizedUserId);
  } catch (error) {
    console.error('[Firestore] Error saving public slug:', error);
  }

  return slug;
};

export const generateBookingUrlSlug = async (userId: string): Promise<string> =>
  getOrCreateBookingUrlSlug(userId);

export const generatePublicUrlSlug = async (userId: string): Promise<string> =>
  getOrCreatePublicUrlSlug(userId);

/** 
 * تحويل رابط السكرتارية القصير إلى معرّف الطبيب (UserId).
 * يحاول أولاً من الفهرس العام (سريع ولا يحتاج صلاحيات)، ثم من مجموعة المستخدمين كخطة بديلة.
 */
export const getUserIdByBookingSlug = async (slug: string): Promise<string | null> => {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  try {
    const lookupSnap = await getDoc(doc(db, 'slugLookup', normalizedSlug));
    if (lookupSnap.exists()) {
      const data = lookupSnap.data();
      if (typeof data?.userId === 'string' && data.userId.trim()) {
        return data.userId.trim();
      }
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('bookingUrlSlug', '==', normalizedSlug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].id;
    return null;
  } catch (error) {
    console.error('[Firestore] Error getting userId by booking slug:', error);
    return null;
  }
};

/** تحويل رابط الحجز العام القصير إلى معرّف الطبيب (UserId) بنفس آلية البحث السابقة */
export const getUserIdByPublicSlug = async (slug: string): Promise<string | null> => {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;

  try {
    const lookupSnap = await getDoc(doc(db, 'slugLookup', normalizedSlug));
    if (lookupSnap.exists()) {
      const data = lookupSnap.data();
      if (typeof data?.userId === 'string' && data.userId.trim()) {
        return data.userId.trim();
      }
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('publicUrlSlug', '==', normalizedSlug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].id;
    return null;
  } catch (error) {
    console.error('[Firestore] Error getting userId by public slug:', error);
    return null;
  }
};
