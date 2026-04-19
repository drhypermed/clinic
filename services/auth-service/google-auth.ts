/**
 * خدمة المصادقة عبر جوجل (Google Authentication Service):
 * هذا الملف هو العصب الرئيسي لدخول الأطباء (والجمهور اختيارياً) باستخدام حسابات جوجل.
 * يتعامل مع:
 * 1. الدخول عبر النافذة المنبثقة (Popup).
 * 2. الدخول عبر إعادة التوجيه (Redirect) كحل بديل للهواتف والمتصفحات المقيدة.
 * 3. معالجة مشاكل الـ PWA وفقدان حالة المصادقة (Missing Initial State).
 */

import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from 'firebase/auth';
import { auth, authPersistenceReady, googleProvider } from '../firebaseConfig';
import {
  PENDING_GOOGLE_AUTH_ROLE_KEY,
  PENDING_GOOGLE_REDIRECT_ROLE_KEY,
  PUBLIC_AUTH_ERROR_KEY,
} from './constants';
import {
  clearDoctorAuthErrors,
  clearStoredAuthState,
  safeStorageGetItem,
  safeStorageRemoveItem,
  safeStorageSetItem,
  setStoredRole,
} from './storage';
import { finalizeDoctorGoogleSignIn } from './doctor-account';
import {
  assertNotDoctorAccountForPublicAuth,
  assertPublicAccountNotBlocked,
  ensurePublicUserFirestoreProfile,
} from './public-account';
import { assertAudienceLegalConsentOrThrow } from '../legalConsentService';

/**
 * إكمال عملية تسجيل الدخول بعد العودة من رابط إعادة التوجيه (Redirect).
 * يتم استدعاؤها تلقائياً عند تشغيل التطبيق للتأكد ما إذا كان هناك طلب دخول معلق.
 */
export const completePendingGoogleRedirect = async (): Promise<UserCredential | null> => {
  if (typeof window === 'undefined') return null;

  // جلب الدور المخطط له (طبيب أم جمهور) من الذاكرة المحلية
  const pendingRole = safeStorageGetItem(PENDING_GOOGLE_REDIRECT_ROLE_KEY) as 'doctor' | 'public' | null;
  if (!pendingRole) return null;

  try {
    const credential = await getRedirectResult(auth);
    if (!credential) {
      safeStorageRemoveItem(PENDING_GOOGLE_REDIRECT_ROLE_KEY);
      return null;
    }

    // إتمام إعدادات الملف الشخصي بناءً على الدور
    if (pendingRole === 'public') {
      await assertNotDoctorAccountForPublicAuth(credential.user);
      await assertPublicAccountNotBlocked(credential.user);
      await ensurePublicUserFirestoreProfile(credential.user);
      setStoredRole('public');
    } else {
      await finalizeDoctorGoogleSignIn(credential.user);
    }

    return credential;
  } catch (error: any) {
    const errorCode = typeof error?.code === 'string' ? error.code : '';
    const message = typeof error?.message === 'string' ? error.message : '';

    // معالجة خطأ شهير في تطبيقات الـ PWA على آيفون وسفاري عند المصادقة
    if (errorCode === 'auth/invalid-pending-token' ||
      message.includes('missing-initial-state') ||
      message.includes('missing initial state')) {
      safeStorageRemoveItem(PENDING_GOOGLE_REDIRECT_ROLE_KEY);
      throw new Error('فشل تسجيل الدخول التلقائي بسبب قيود المتصفح (PWA Missing State). يرجى محاولة تسجيل الدخول مرة أخرى أو الفتح في المتصفح العادي.');
    }

    safeStorageRemoveItem(PENDING_GOOGLE_REDIRECT_ROLE_KEY);
    throw error;
  }
};

/**
 * الوظيفة الأساسية لبدء تسجيل الدخول عبر جوجل.
 * تحاول استخدام النافذة المنبثقة (Popup) أولاً، وإذا فشلت (بسبب حظر النوافذ مثلاً) تنتقل لإعادة التوجيه (Redirect).
 */
export const signInWithGoogle = async (role: 'doctor' | 'public' = 'doctor'): Promise<UserCredential> => {
  if (typeof window !== 'undefined') {
    assertAudienceLegalConsentOrThrow(role);
  }

  /** وظيفة داخلية لإنهاء عملية الدخول وإعداد الملف الشخصي */
  const finalizeGoogleAuth = async (userCredential: UserCredential): Promise<UserCredential> => {
    try {
      if (role === 'public') {
        await assertNotDoctorAccountForPublicAuth(userCredential.user);
        await assertPublicAccountNotBlocked(userCredential.user);
        await ensurePublicUserFirestoreProfile(userCredential.user);
      } else {
        await finalizeDoctorGoogleSignIn(userCredential.user);
      }
      setStoredRole(role);
      return userCredential;
    } catch (finalizeError) {
      // في حال فشل إعداد الملف الشخصي، نقوم بتسجيل الخروج لضمان عدم وجود جلسة معلقة غير مكتملة
      try {
        await auth.signOut();
      } catch {
        // محاولة أفضل قدر الإمكان
      }
      clearStoredAuthState();
      throw finalizeError;
    }
  };

  if (typeof window !== 'undefined') {
    safeStorageRemoveItem(PUBLIC_AUTH_ERROR_KEY);
    clearDoctorAuthErrors();
  }

  // إجبار جوجل على إظهار قائمة الحسابات للمستخدم ليختار منها
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  // التأكد من استقرار تهيئة الـ Auth (مهم لتقنيات الـ LocalStorage/IndexedDB)
  await authPersistenceReady;

  safeStorageSetItem(PENDING_GOOGLE_AUTH_ROLE_KEY, role);

  try {
    // المحاولة الأولى: النافذة المنبثقة
    const userCredential = await signInWithPopup(auth, googleProvider);
    return await finalizeGoogleAuth(userCredential);
  } catch (error: any) {
    const errorCode = typeof error?.code === 'string' ? error.code : '';
    const rawMessage = typeof error?.message === 'string' ? error.message.trim() : '';
    const messageLower = rawMessage.toLowerCase();

    // بعض المتصفحات تعتبر طلب النافذة المنبثقة غير صالح إذا لم يتم تشغيله بواسطة نقرة مباشرة
    const popupInvalidActionMessage =
      !errorCode &&
      (messageLower.includes('requested action is invalid') ||
        messageLower.includes('the requested action is invalid') ||
        messageLower.includes('invalid action'));

    if (!errorCode && rawMessage && !popupInvalidActionMessage) {
      throw new Error(rawMessage);
    }

    // هل يجب الانتقال لطريقة الـ Redirect؟ (بسبب حظر النوافذ أو بيئات معينة)
    const shouldFallbackToRedirect =
      errorCode === 'auth/popup-blocked' ||
      errorCode === 'auth/operation-not-supported-in-this-environment' ||
      popupInvalidActionMessage;

    if (shouldFallbackToRedirect) {
      if (typeof window !== 'undefined') {
        safeStorageRemoveItem(PENDING_GOOGLE_AUTH_ROLE_KEY);
        safeStorageSetItem(PENDING_GOOGLE_REDIRECT_ROLE_KEY, role);
      }
      try {
        // الانتقال للـ Redirect كحل بديل
        await signInWithRedirect(auth, googleProvider);
        return new Promise<UserCredential>(() => { }); // وعد لا ينتهي لأن الصفحة سيعاد تحميلها
      } catch (redirectError: any) {
        safeStorageRemoveItem(PENDING_GOOGLE_REDIRECT_ROLE_KEY);
        safeStorageRemoveItem(PENDING_GOOGLE_AUTH_ROLE_KEY);
        throw redirectError;
      }
    }

    // معالجة باقي أخطاء الدخول برسائل عربية
    switch (errorCode) {
      case 'auth/popup-closed-by-user':
        throw new Error('تم إلغاء تسجيل الدخول');
      case 'auth/cancelled-popup-request':
        throw new Error('تم إلغاء الطلب');
      case 'auth/unauthorized-domain':
        throw new Error('الدومين الحالي غير مضاف داخل Authorized domains في Firebase Authentication');
      case 'auth/operation-not-allowed':
        throw new Error('تسجيل الدخول عبر Google غير مفعّل في Firebase Authentication');
      case 'auth/app-not-authorized':
        throw new Error('التطبيق غير مصرح له في Google OAuth. تحقق من OAuth consent screen وبيانات Web client');
      case 'auth/invalid-api-key':
        throw new Error('Firebase API Key غير صحيحة أو لا تخص نفس المشروع');
      case 'auth/network-request-failed':
        throw new Error('خطأ في الاتصال بالإنترنت. يرجى التحقق من الشبكة والمحاولة مرة أخرى.');
      default:
        throw new Error(`حدث خطأ أثناء تسجيل الدخول بـ Google (${errorCode || 'unknown'})`);
    }
  } finally {
    safeStorageRemoveItem(PENDING_GOOGLE_AUTH_ROLE_KEY);
  }
};

