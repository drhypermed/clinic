/**
 * خدمة حسابات الأطباء (Doctor Account Service):
 * هذا الملف مسؤول عن العمليات النهائية بعد تسجيل دخول الطبيب عبر جوجل.
 * المهام الرئيسية:
 * 1. التحقق من وجود حساب للطبيب في Firestore.
 * 2. التأكد من عدم حظر البريد الإلكتروني (Blacklist).
 * 3. التحقق من حالة الموافقة على الحساب (Approved/Pending/Rejected).
 * 4. إدارة دخول المسؤولين (Admins).
 */

import { signOut as firebaseSignOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { ADMIN_EMAIL, ROOT_ADMIN_UID } from '../../app/drug-catalog/admin';
import {
  clearDoctorAuthErrors,
  clearStoredAuthState,
  persistDoctorAuthError,
  safeStorageSetItem,
  setStoredRole,
} from './storage';
import { formatUserDate } from '../../utils/cairoTime';
import { normalizeEmail } from './validation';
import {
  buildDoctorUserProfilePayload,
  getLegacyDoctorProfileDocRef,
  getUserProfileDocRef,
  isDoctorLikeUserData,
  isPublicLikeUserData,
  mergePrimaryProfileData,
  resolveAuthRoleFromProfileData,
} from '../firestore/profileRoles';

/** التحقق مما إذا كان البريد ينتمي لأدمن النظام */
const isAdminEmail = (email?: string) => normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL);

/**
 * تحديد عدد محاولات تسجيل الدخول الفاشلة للأطباء.
 * بعد 5 محاولات فاشلة خلال 15 دقيقة يتم منع الدخول مؤقتاً لمنع المحاولات المتكررة.
 */
const MAX_SIGNIN_ATTEMPTS = 5;
const SIGNIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 دقيقة

const getSignInAttemptKey = (uid: string) => `doctor_signin_attempts_${uid}`;
const getSignInLockoutKey = (uid: string) => `doctor_signin_lockout_${uid}`;

const checkSignInRateLimit = (uid: string): { allowed: boolean; waitMinutes?: number } => {
  try {
    const lockoutRaw = localStorage.getItem(getSignInLockoutKey(uid));
    if (lockoutRaw) {
      const lockoutUntil = parseInt(lockoutRaw, 10);
      if (Number.isFinite(lockoutUntil) && Date.now() < lockoutUntil) {
        const waitMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
        return { allowed: false, waitMinutes };
      }
      // انتهت مدة الحظر — تنظيف
      localStorage.removeItem(getSignInLockoutKey(uid));
      localStorage.removeItem(getSignInAttemptKey(uid));
    }
    return { allowed: true };
  } catch {
    // تخزين محلي غير متاح — نسمح بالمتابعة
    return { allowed: true };
  }
};

const recordFailedSignIn = (uid: string): void => {
  try {
    const key = getSignInAttemptKey(uid);
    const current = parseInt(localStorage.getItem(key) || '0', 10) || 0;
    const next = current + 1;
    localStorage.setItem(key, String(next));
    if (next >= MAX_SIGNIN_ATTEMPTS) {
      localStorage.setItem(getSignInLockoutKey(uid), String(Date.now() + SIGNIN_LOCKOUT_MS));
    }
  } catch {
    // تجاهل إذا التخزين غير متاح
  }
};

const clearSignInAttempts = (uid: string): void => {
  try {
    localStorage.removeItem(getSignInAttemptKey(uid));
    localStorage.removeItem(getSignInLockoutKey(uid));
  } catch {
    // تجاهل
  }
};

/**
 * إنهاء عملية تسجيل دخول الطبيب عبر جوجل (Google Sign-In Finalization).
 * تقوم هذه الدالة بإجراء كافة فحوصات الأمان والحالة قبل السماح للطبيب بدخول لوحة التحكم.
 */
export const finalizeDoctorGoogleSignIn = async (user: User): Promise<void> => {
  const userEmail = normalizeEmail(user.email);

  // 0. فحص حد المحاولات المتتالية الفاشلة
  const rateLimit = checkSignInRateLimit(user.uid);
  if (!rateLimit.allowed) {
    const waitMsg = `⏸️ تم تجاوز عدد محاولات الدخول المسموحة.\n\nحاول مرة أخرى بعد ${rateLimit.waitMinutes} دقيقة.`;
    persistDoctorAuthError('rate_limit_error', waitMsg);
    await firebaseSignOut(auth);
    clearStoredAuthState();
    throw new Error(waitMsg);
  }

  // 1. التحقق من القائمة السوداء (Blacklist)
  const blacklistDoc = await getDoc(doc(db, 'blacklistedEmails', userEmail));
  if (blacklistDoc.exists()) {
    const blacklistData = blacklistDoc.data();
    const blockMsg = blacklistData.reason
      ? `⛔ تم حظر هذا البريد الإلكتروني من الدخول\n\nسبب الحظر: ${blacklistData.reason}\n\nتاريخ الحظر: ${formatUserDate(blacklistData.blockedAt, undefined, 'ar-EG')}`
      : '⛔ تم حظر هذا البريد الإلكتروني من الدخول للنظام';
    persistDoctorAuthError('blacklist_message', blockMsg);
    recordFailedSignIn(user.uid);
    await firebaseSignOut(auth);
    clearStoredAuthState();
    throw new Error(blockMsg);
  }

  // 2. التحقق من وجود ملف الطبيب في قاعدة البيانات
  const userRef = getUserProfileDocRef(user.uid);
  const legacyDoctorRef = getLegacyDoctorProfileDocRef(user.uid);
  const [userDoc, legacyDoctorDoc] = await Promise.all([
    getDoc(userRef),
    getDoc(legacyDoctorRef),
  ]);

  const userData = userDoc.exists() ? (userDoc.data() as Record<string, any>) : null;
  const legacyDoctorData = legacyDoctorDoc.exists() ? (legacyDoctorDoc.data() as Record<string, any>) : null;
  const doctorData = isDoctorLikeUserData(userData) || legacyDoctorData
    ? mergePrimaryProfileData(userData, legacyDoctorData)
    : null;

  if (!doctorData || resolveAuthRoleFromProfileData(doctorData) !== 'doctor') {
    // التأكد أولاً أنه ليس حساب جمهور يحاول الدخول كطبيب
    const isPublicAccount = isPublicLikeUserData(userData);

    if (isPublicAccount) {
      const publicMsg = `⛔ هذا الحساب مسجل كحساب جمهور بالفعل.\n\nالبريد الإلكتروني: ${userEmail}\n\nلا يمكن الدخول من بوابة الأطباء بهذا الحساب.\nيرجى تسجيل الدخول من بوابة الجمهور.`;
      persistDoctorAuthError('public_role_error', publicMsg);
      recordFailedSignIn(user.uid);
      await firebaseSignOut(auth);
      clearStoredAuthState();
      throw new Error(publicMsg);
    }

    // إذا لم يكن موجوداً أصلاً
    const notFoundMsg = `⚠️ لم يتم العثور على حساب للبريد الإلكتروني:\n\n${userEmail}\n\nيرجى إنشاء حساب جديد أولاً.`;
    persistDoctorAuthError('not_found_error', notFoundMsg);
    safeStorageSetItem('not_found_timestamp', Date.now().toString());
    recordFailedSignIn(user.uid);
    await firebaseSignOut(auth);
    clearStoredAuthState();
    throw new Error(notFoundMsg);
  }

  // 3. التحقق من حالة تعطيل الحساب
  if (doctorData.isAccountDisabled) {
    // استثناء: الأدمن يمكنه تفعيل حسابه تلقائياً عند الدخول (لأغراض الطوارئ)
    if (isAdminEmail(userEmail) || user.uid === ROOT_ADMIN_UID) {
      await setDoc(userRef, buildDoctorUserProfilePayload({
        isAccountDisabled: false,
        disabledReason: '',
        disabledAt: '',
        updatedAt: new Date().toISOString(),
      }), { merge: true });
    } else {
      const disableMsg = doctorData.disabledReason
        ? `⛔ عذراً، تم تعطيل حسابك.\n\nالسبب: ${doctorData.disabledReason}\n\nيرجى التواصل مع الإدارة.`
        : '⛔ عذراً، تم تعطيل حسابك.\n\nيرجى التواصل مع الإدارة للمزيد من التفاصيل.';
      persistDoctorAuthError('blacklist_message', disableMsg);
      recordFailedSignIn(user.uid);
      await firebaseSignOut(auth);
      clearStoredAuthState();
      throw new Error(disableMsg);
    }
  }

  // 4. التحقق من حالة الرفض (Rejected)
  if (doctorData.verificationStatus === 'rejected') {
    const rejectionMsg = doctorData.rejectionReason
      ? `⛔ تم رفض طلب التسجيل.\n\nسبب الرفض: ${doctorData.rejectionReason}`
      : '⛔ تم رفض طلب التسجيل. لا يمكنك الدخول للنظام';
    persistDoctorAuthError('blacklist_message', rejectionMsg);
    recordFailedSignIn(user.uid);
    await firebaseSignOut(auth);
    clearStoredAuthState();
    throw new Error(rejectionMsg);
  }

  // 5. التحقق من حالة الموافقة (Approved) لغير الأدمن
  if (!isAdminEmail(userEmail) && user.uid !== ROOT_ADMIN_UID) {
    const verificationStatus = typeof doctorData.verificationStatus === 'string'
      ? doctorData.verificationStatus
      : '';
    if (verificationStatus !== 'approved') {
      const pendingMsg =
        verificationStatus === 'submitted' || verificationStatus === 'pending'
          ? '⏳ حسابك ما زال قيد المراجعة. يرجى انتظار موافقة الإدارة قبل تسجيل الدخول.'
          : '⚠️ لا يمكن تسجيل الدخول بهذا الحساب الآن. يرجى إكمال إنشاء الحساب أولًا.';
      persistDoctorAuthError('rejection_error', pendingMsg);
      recordFailedSignIn(user.uid);
      await firebaseSignOut(auth);
      clearStoredAuthState();
      throw new Error(pendingMsg);
    }
  }

  // نجاح كافة الفحوصات — تنظيف عداد المحاولات الفاشلة
  clearSignInAttempts(user.uid);
  clearDoctorAuthErrors();
  setStoredRole('doctor');
};

/**
 * التحقق سريعاً من حالة الموافقة على الطبيب (لأغراض الواجهات والموجهات).
 */
export const checkDoctorApprovalStatus = async (
  uid: string
): Promise<{ status: 'approved' | 'pending' | 'rejected' | 'not_found'; rejectionReason?: string }> => {
  try {
    // قراءة مباشرة من السيرفر — حالة الموافقة على الطبيب جزء من مسار تسجيل الدخول
    // ولا يجوز الاعتماد على الكاش فيها (قد تكون تغيرت من جهة الإدارة).
    const [userDoc, legacyDoctorDoc, pendingDoc] = await Promise.all([
      getDoc(getUserProfileDocRef(uid)),
      getDoc(getLegacyDoctorProfileDocRef(uid)),
      getDoc(doc(db, 'pending_doctors', uid)),
    ]);

    const userData = userDoc.exists() ? (userDoc.data() as Record<string, any>) : null;
    const legacyDoctorData = legacyDoctorDoc.exists() ? (legacyDoctorDoc.data() as Record<string, any>) : null;
    const mergedDoctorData = isDoctorLikeUserData(userData) || legacyDoctorData
      ? mergePrimaryProfileData(userData, legacyDoctorData)
      : null;

    if (mergedDoctorData && resolveAuthRoleFromProfileData(mergedDoctorData) === 'doctor') {
      const status = String(mergedDoctorData.verificationStatus || '').trim().toLowerCase();

      if (status === 'rejected') {
        return {
          status: 'rejected',
          rejectionReason: String(mergedDoctorData.rejectionReason || ''),
        };
      }

      if (status === 'submitted' || status === 'pending') {
        return {
          status: 'pending',
          rejectionReason: String(mergedDoctorData.rejectionReason || ''),
        };
      }

      return { status: 'approved' };
    }

    // التحقق من الطلبات المعلقة (Pending Request)
    if (pendingDoc.exists()) {
      const pendingData = pendingDoc.data();
      const status = pendingData?.status || 'pending';
      return {
        status: status as 'pending' | 'rejected',
        rejectionReason: pendingData?.rejectionReason || '',
      };
    }

    return { status: 'not_found' };
  } catch (error) {
    console.error('Error checking doctor approval status:', error);
    throw new Error('تعذر التحقق من حالة الموافقة');
  }
};
