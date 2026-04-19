/**
 * خدمة حسابات الجمهور (Public Account Service):
 * هذا الملف مسؤول عن إدارة البيانات والحالة الخاصة بملفات المستخدمين العامين والجمهور في Firestore.
 * المهام الرئيسية:
 * 1. التحقق من القائمة السوداء (Blacklist) لبريد الجمهور.
 * 2. التأكد من عدم تداخل حسابات الأطباء مع بوابة الجمهور.
 * 3. إنشاء وتحديث الملف الشخصي للمستخدم في مجموعة 'users' بـ Firestore.
 * 4. إدارة حالة تعطيل أو حذف الحسابات من قبل الإدارة.
 */

import {
  deleteField,
  doc,
  getDoc,
  setDoc,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import { signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { getDocCacheFirst } from '../firestore/cacheFirst';
import { PUBLIC_AUTH_ERROR_KEY } from './constants';
import { clearStoredAuthState, safeStorageSetItem } from './storage';
import { normalizeEmail } from './validation';
import {
  buildPublicUserProfilePayload,
  getUserProfileDocRef,
  isDoctorLikeUserData,
  isPublicLikeUserData,
} from '../firestore/profileRoles';

const PUBLIC_BLACKLIST_COLLECTION = 'publicBlacklistedEmails';

/** وظيفة مساعدة لمحاولة القراءة من السيرفر أولاً (لحداثة البيانات) ثم الكاش */
const getDocServerFirst = async <T extends DocumentData>(ref: DocumentReference<T>) => {
  try {
    return await getDoc(ref);
  } catch {
    return getDocCacheFirst(ref);
  }
};

/** بناء رسالة الحظر بناءً على السبب المخزن */
const buildPublicBlacklistMessage = (data: Record<string, any> | null) => {
  const reason = String(data?.reason || data?.blockedReason || '').trim();
  if (reason) {
    return `⛔ تم حظر حساب الجمهور الخاص بك.\n\nالسبب: ${reason}`;
  }
  return '⛔ تم حظر حساب الجمهور الخاص بك بواسطة الإدارة.';
};

/** التأكد من أن بريد المستخدم ليس في القائمة السوداء للجمهور */
export const assertPublicEmailNotBlacklisted = async (email: string): Promise<void> => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return;

  const blacklistDoc = await getDocServerFirst(doc(db, PUBLIC_BLACKLIST_COLLECTION, normalizedEmail));
  if (!blacklistDoc.exists()) return;

  const data = blacklistDoc.data() as Record<string, any>;
  if (data?.isBlocked === false) return; // تم فك الحظر

  const message = buildPublicBlacklistMessage(data);
  // تخزين الخطأ لعرضه في واجهة الدخول
  safeStorageSetItem(PUBLIC_AUTH_ERROR_KEY, message);
  throw new Error(message);
};

/** منع الأطباء من تسجيل الدخول عبر بوابة الجمهور (لحماية تداخل البيانات) */
export const assertNotDoctorAccountForPublicAuth = async (user: User): Promise<void> => {
  const userRef = getUserProfileDocRef(user.uid);
  const userSnap = await getDocServerFirst(userRef);
  const userData = userSnap.exists() ? (userSnap.data() as Record<string, any>) : null;

  if (!isDoctorLikeUserData(userData)) return;

  // إذا وجدنا أن الطبيب لديه "بقايا" بيانات دور الجمهور، نقوم بتنظيفها
  if (userSnap.exists()) {
    const hasPublicRoleMarkers = isPublicLikeUserData(userData);
    if (hasPublicRoleMarkers) {
      await setDoc(
        userRef,
        {
          authRole: deleteField(),
          userRole: deleteField(),
          lastLoginAt: deleteField(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  }

  const message =
    'هذا الحساب مسجل كطبيب بالفعل. لا يمكن تسجيل الدخول من بوابة الجمهور. يرجى استخدام تسجيل دخول الأطباء.';
  safeStorageSetItem(PUBLIC_AUTH_ERROR_KEY, message);

  await firebaseSignOut(auth);
  clearStoredAuthState();
  throw new Error(message);
};

/** التحقق من أن حساب الجمهور لم يتم تعطيله أو حذفه من قبل الإدارة */
export const assertPublicAccountNotBlocked = async (user: User): Promise<void> => {
  try {
    await assertPublicEmailNotBlacklisted(user.email || '');
  } catch (error) {
    await firebaseSignOut(auth);
    clearStoredAuthState();
    throw error;
  }

  const usersDoc = await getDocServerFirst(doc(db, 'users', user.uid));

  const matchedDoc = [usersDoc].find((snap) => {
    if (!snap.exists()) return false;
    const data = snap.data() as Record<string, any>;
    return data.isAccountDisabled === true || data.verificationStatus === 'deleted';
  });

  if (!matchedDoc) return;

  const data = matchedDoc.data() as Record<string, any>;
  const message =
    data.verificationStatus === 'deleted'
      ? '⛔ تم حذف حساب الجمهور الخاص بك بواسطة الإدارة. لا يمكنك تسجيل الدخول.'
      : data.disabledReason
        ? `⛔ تم تعطيل حساب الجمهور الخاص بك.\n\nالسبب: ${data.disabledReason}`
        : '⛔ تم تعطيل حساب الجمهور الخاص بك بواسطة الإدارة.';

  safeStorageSetItem(PUBLIC_AUTH_ERROR_KEY, message);

  await firebaseSignOut(auth);
  clearStoredAuthState();
  throw new Error(message);
};

/** التأكد من وجود وتحديث ملف المستخدم في Firestore بمجرد نجاح تسجيل الدخول */
export const ensurePublicUserFirestoreProfile = async (user: User): Promise<void> => {
  const nowIso = new Date().toISOString();
  const email = normalizeEmail(user.email);
  const displayName = user.displayName?.trim() || 'مستخدم جمهور';

  // قراءة مباشرة من السيرفر — ضمن مسار تسجيل دخول الجمهور، نحتاج الحالة الحقيقية للوثيقة
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const profilePayload: Record<string, any> = {
    uid: user.uid,
    displayName,
    name: displayName,
    email,
    emailVerified: Boolean(user.emailVerified),
    lastLoginAt: nowIso,
    updatedAt: nowIso,
  };

  // إضافة تاريخ الإنشاء إذا كان المستخدم جديداً تماماً
  if (!userSnap.exists()) {
    profilePayload.createdAt = nowIso;
  }

  // استخدام merge: true للحفاظ على الحقول الأخرى (مثل رقم الهاتف أو الإعدادات)
  await setDoc(userRef, buildPublicUserProfilePayload(profilePayload), { merge: true });
};
