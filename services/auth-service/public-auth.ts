/**
 * خدمة مصادقة الجمهور (Public Authentication Service):
 * هذا الملف مسؤول عن إدارة دخول المرضى أو المستخدمين العامين للقيام بعمليات مثل "حجز موعد".
 * يدعم عدة طرق للدخول:
 * 1. البريد الإلكتروني وكلمة المرور.
 * 2. كود التحقق (OTP) المرسل للبريد.
 * 3. روابط تسجيل الدخول السحرية (Magic Links).
 * 4. الدخول كمستخدم ضيف (Anonymous).
 */

import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  linkWithCredential,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  type ActionCodeSettings,
  type UserCredential,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebaseConfig';
import { PUBLIC_PENDING_EMAIL_KEY } from './constants';
import {
  safeStorageSetItem,
  setStoredRole,
} from './storage';
import {
  buildSafePublicContinueUrl,
  checkRateLimit,
  normalizeEmail,
  recordAttempt,
  validateEmail,
} from './validation';
import {
  assertPublicEmailNotBlacklisted,
  assertNotDoctorAccountForPublicAuth,
  assertPublicAccountNotBlocked,
  ensurePublicUserFirestoreProfile,
} from './public-account';

/**
 * تسجيل دخول الجمهور باستخدام البريد وكلمة المرور
 */
export const signInPublicWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const normalizedEmail = normalizeEmail(email);
  if (!validateEmail(normalizedEmail)) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }

  // التحقق من عدد المحاولات لمنع الهجمات المتكررة (Brute Force)
  if (!checkRateLimit(normalizedEmail)) {
    throw new Error('تم تجاوز عدد المحاولات. يرجى المحاولة بعد 15 دقيقة');
  }

  try {
    await assertPublicEmailNotBlacklisted(normalizedEmail);
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    
    // التأكد من أن الحساب ليس حساب طبيب (لمنع تداخل الأدوار)
    await assertNotDoctorAccountForPublicAuth(userCredential.user);
    await assertPublicAccountNotBlocked(userCredential.user);
    
    // التأكد من وجود ملف شخصي للمستخدم في Firestore
    await ensurePublicUserFirestoreProfile(userCredential.user);
    
    recordAttempt(normalizedEmail, true);
    setStoredRole('public');
    return userCredential;
  } catch (error: any) {
    recordAttempt(normalizedEmail, false);
    const errorCode = typeof error?.code === 'string' ? error.code : '';
    if (!errorCode && typeof error?.message === 'string' && error.message.trim()) {
      throw new Error(error.message);
    }
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      case 'auth/too-many-requests':
        throw new Error('تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت');
      default:
        throw new Error('حدث خطأ أثناء تسجيل دخول الجمهور');
    }
  }
};

/**
 * إرسال كود تحقق (OTP) رباعي الأرقام إلى بريد المستخدم
 */
export const sendPublicEmailOtpCode = async (email: string): Promise<void> => {
  const normalizedEmail = normalizeEmail(email);
  if (!validateEmail(normalizedEmail)) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }

  try {
    const callable = httpsCallable(functions, 'sendPublicEmailOtpCode');
    await callable({ email: normalizedEmail });
  } catch (error: any) {
    const code = typeof error?.code === 'string' ? error.code : '';
    switch (code) {
      case 'invalid-argument':
      case 'functions/invalid-argument':
        throw new Error('البيانات المرسلة غير صحيحة');
      case 'failed-precondition':
      case 'functions/failed-precondition':
        throw new Error('خدمة إرسال الكود غير مهيأة بعد. راجع إعدادات SMTP في Functions');
      case 'resource-exhausted':
      case 'functions/resource-exhausted':
        throw new Error('تم طلب الأكواد بسرعة كبيرة. حاول بعد دقيقة');
      case 'unavailable':
      case 'functions/unavailable':
        throw new Error('خدمة التحقق غير متاحة الآن');
      default:
        throw new Error(error?.message || 'تعذر إرسال كود التحقق');
    }
  }
};

/**
 * التحقق من صحة الكود الذي أدخله المستخدم
 */
export const verifyPublicEmailOtpCode = async (email: string, code: string): Promise<void> => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = code.trim();

  if (!validateEmail(normalizedEmail)) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }
  if (!/^\d{4}$/.test(normalizedCode)) {
    throw new Error('كود التحقق يجب أن يكون 4 أرقام');
  }

  try {
    const callable = httpsCallable(functions, 'verifyPublicEmailOtpCode');
    await callable({ email: normalizedEmail, code: normalizedCode });
  } catch (error: any) {
    const codeValue = typeof error?.code === 'string' ? error.code : '';
    switch (codeValue) {
      case 'invalid-argument':
      case 'functions/invalid-argument':
        throw new Error('كود التحقق غير صحيح');
      case 'not-found':
      case 'functions/not-found':
        throw new Error('لا يوجد كود صالح لهذا البريد. أعد إرسال الكود');
      case 'deadline-exceeded':
      case 'functions/deadline-exceeded':
        throw new Error('انتهت صلاحية الكود. أعد إرسال كود جديد');
      case 'permission-denied':
      case 'functions/permission-denied':
        throw new Error('عدد محاولات التحقق تجاوز الحد المسموح');
      default:
        throw new Error(error?.message || 'تعذر التحقق من الكود');
    }
  }
};

/**
 * إنشاء حساب جديد للجمهور وحفظه في Firestore
 */
export const createPublicAccountWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const normalizedEmail = normalizeEmail(email);
  if (!validateEmail(normalizedEmail)) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }
  if (!password || password.length < 8) {
    throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }

  try {
    await assertPublicEmailNotBlacklisted(normalizedEmail);
    let userCredential: UserCredential;
    const currentUser = auth.currentUser;

    // تحويل حساب الضيف إلى حساب دائم إذا كان المستخدم مسجلاً كضيف
    if (currentUser && currentUser.isAnonymous) {
      const credential = EmailAuthProvider.credential(normalizedEmail, password);
      userCredential = await linkWithCredential(currentUser, credential);
    } else {
      userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    }

    await ensurePublicUserFirestoreProfile(userCredential.user);
    setStoredRole('public');
    return userCredential;
  } catch (error: any) {
    const errorCode = typeof error?.code === 'string' ? error.code : '';
    switch (errorCode) {
      case 'auth/email-already-in-use':
      case 'auth/credential-already-in-use':
        throw new Error('هذا البريد مستخدم بالفعل. استخدم تسجيل الدخول.');
      case 'auth/invalid-email':
        throw new Error('البريد الإلكتروني غير صحيح');
      case 'auth/operation-not-allowed':
        throw new Error('إنشاء حساب بالبريد وكلمة المرور غير مفعل في Firebase Authentication');
      case 'auth/weak-password':
        throw new Error('كلمة المرور ضعيفة جداً');
      case 'auth/requires-recent-login':
        throw new Error('يرجى إعادة تسجيل الدخول ثم المحاولة مرة أخرى');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت');
      default:
        throw new Error('حدث خطأ أثناء إنشاء حساب الجمهور');
    }
  }
};

/**
 * تسجيل الدخول كضيف (مجهول) للجمهور
 */
export const signInAsPublicGuest = async (): Promise<UserCredential> => {
  try {
    const userCredential = await signInAnonymously(auth);
    await assertPublicAccountNotBlocked(userCredential.user);
    await ensurePublicUserFirestoreProfile(userCredential.user);
    setStoredRole('public');
    return userCredential;
  } catch (error: any) {
    const errorCode = typeof error?.code === 'string' ? error.code : '';
    if (!errorCode && typeof error?.message === 'string' && error.message.trim()) {
      throw new Error(error.message);
    }
    switch (error.code) {
      case 'auth/operation-not-allowed':
        throw new Error('تسجيل الدخول للجمهور غير مفعل في Firebase Authentication');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت');
      default:
        throw new Error('حدث خطأ أثناء تسجيل دخول الجمهور');
    }
  }
};

/**
 * إرسال رابط تسجيل دخول سحري (Email Link) إلى بريد المستخدم
 */
export const sendPublicLoginLink = async (
  email: string,
  continuePath = '/login/public?mode=verify'
): Promise<void> => {
  if (!validateEmail(email)) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }

  if (typeof window === 'undefined') {
    throw new Error('تعذر إنشاء رابط التحقق في هذا السياق');
  }

  // بناء رابط العودة الآمن للتطبيق بعد الضغط على الرابط في الإيميل
  const continueUrl = buildSafePublicContinueUrl(continuePath, window.location.origin);

  const actionCodeSettings: ActionCodeSettings = {
    url: continueUrl,
    handleCodeInApp: true,
  };

  try {
    await assertPublicEmailNotBlacklisted(email);
    await sendSignInLinkToEmail(auth, normalizeEmail(email), actionCodeSettings);
    // حفظ الإيميل مؤقتاً في المتصفح لمقارنته عند العودة من الرابط
    safeStorageSetItem(PUBLIC_PENDING_EMAIL_KEY, normalizeEmail(email));
  } catch (error: any) {
    const errorCode = typeof error?.code === 'string' ? error.code : '';
    const errorMessage = typeof error?.message === 'string' ? error.message : '';
    console.error('Failed to send public sign-in link:', {
      code: errorCode,
      message: errorMessage,
      continueUrl,
      origin: window.location.origin,
    });

    switch (error.code) {
      case 'auth/operation-not-allowed':
        throw new Error('تسجيل الدخول برابط البريد غير مفعل في Firebase Authentication');
      case 'auth/invalid-email':
        throw new Error('البريد الإلكتروني غير صحيح');
      case 'auth/unauthorized-domain':
        throw new Error('الدومين الحالي غير مضاف في Authorized Domains داخل Firebase');
      case 'auth/unauthorized-continue-uri':
        throw new Error('رابط التحقق غير مسموح. أضف الدومين الحالي داخل Authorized Domains في Firebase Authentication');
      case 'auth/invalid-continue-uri':
        throw new Error('رابط المتابعة غير صالح. تحقق من إعدادات رابط التحقق');
      case 'auth/missing-continue-uri':
        throw new Error('تعذر إنشاء رابط المتابعة. راجع إعدادات تسجيل الدخول عبر البريد');
      case 'auth/too-many-requests':
        throw new Error('تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى بعد قليل');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت');
      default:
        throw new Error(`تعذر إرسال رابط التحقق للبريد الإلكتروني (${errorCode || 'خطأ غير معروف'})`);
    }
  }
};

/**
 * التحقق مما إذا كان الرابط الحالي هو رابط تسجيل دخول سحري
 */
export const isPublicLoginEmailLink = (emailLink?: string): boolean => {
  const link = emailLink || (typeof window !== 'undefined' ? window.location.href : '');
  if (!link) return false;
  return isSignInWithEmailLink(auth, link);
};

/**
 * إكمال عملية تسجيل الدخول بعد الضغط على الرابط السحري في البريد
 */
export const completePublicLoginWithEmailLink = async (
  email: string,
  emailLink?: string
): Promise<UserCredential> => {
  if (!validateEmail(email)) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }

  const link = emailLink || (typeof window !== 'undefined' ? window.location.href : '');
  if (!link || !isSignInWithEmailLink(auth, link)) {
    throw new Error('رابط التحقق غير صالح أو منتهي');
  }

  try {
    await assertPublicEmailNotBlacklisted(email);
    const credential = await signInWithEmailLink(auth, normalizeEmail(email), link);
    await assertNotDoctorAccountForPublicAuth(credential.user);
    await assertPublicAccountNotBlocked(credential.user);
    await ensurePublicUserFirestoreProfile(credential.user);
    setStoredRole('public');
    return credential;
  } catch (error: any) {
    const errorCode = typeof error?.code === 'string' ? error.code : '';
    if (!errorCode && typeof error?.message === 'string' && error.message.trim()) {
      throw new Error(error.message);
    }
    switch (error.code) {
      case 'auth/invalid-action-code':
        throw new Error('رابط التحقق غير صالح أو تم استخدامه من قبل');
      case 'auth/expired-action-code':
        throw new Error('رابط التحقق منتهي الصلاحية');
      case 'auth/user-disabled':
        throw new Error('هذا الحساب معطل');
      case 'auth/invalid-email':
        throw new Error('البريد الإلكتروني غير صحيح');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت');
      default:
        throw new Error('تعذر إكمال تسجيل الدخول عبر رابط البريد');
    }
  }
};
