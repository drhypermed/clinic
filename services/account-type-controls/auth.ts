/**
 * مساعدات المصادقة للكوتا (Quota Auth Helpers)
 * هذا الملف يوفر أدوات لإدارة عمليات تسجيل الدخول والتحقق عند استهلاك الكوتا:
 * 1. التحقق من وجود مستخدم مسجل الدخول قبل طلب الكوتا.
 * 2. معالجة أخطاء المصادقة (Unauthenticated) وترجمتها لرسائل عربية مفهومة.
 * 3. آلية إعادة المحاولة (Retry) تلقائياً عن طريق تحديث رمز الدخول (Token) في حال انتهاء صلاحيته.
 */

import { auth, authPersistenceReady } from '../firebaseConfig';
import {
  isAppCheckError,
  isUnauthenticatedError,
  normalizeErrorString,
} from '../../utils/errorHelpers';

const waitForAuthUser = (timeoutMs = 2000): Promise<typeof auth.currentUser> => {
  return new Promise((resolve) => {
    let unsubscribe: (() => void) | null = null;
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe?.();
      resolve(auth.currentUser);
    }, timeoutMs);

    unsubscribe = auth.onAuthStateChanged((user) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      unsubscribe?.();
      resolve(user);
    });
  });
};

/** تحويل أخطاء Cloud Functions إلى رسائل خطأ عربية للمستخدم */
export const mapCallableError = (error: unknown): never => {
  const normalized = normalizeErrorString(error);

  if (isAppCheckError(error)) {
    throw new Error('تعذر التحقق من App Check. تأكد من تفعيل مفاتيح App Check/RECAPTCHA في بيئة التشغيل ثم أعد المحاولة.');
  }

  if (normalized.includes('unauthenticated')) {
    if (!auth.currentUser) {
      throw new Error('يجب تسجيل الدخول أولاً ثم إعادة المحاولة.');
    }
    throw new Error('فشلت المصادقة. أعد تسجيل الدخول ثم حاول مرة أخرى.');
  }

  if (normalized.includes('permission-denied')) {
    throw new Error('هذا الإجراء متاح لحساب الأدمن فقط.');
  }

  throw error;
};

/** التأكد من أن المستخدم الحالي مسجل الدخول وله رمز دخول صالح */
export const ensureAuthenticatedUser = async (): Promise<void> => {
  await authPersistenceReady.catch(() => undefined);

  let user = auth.currentUser;
  if (!user) {
    user = await waitForAuthUser();
  }
  if (!user) {
    throw new Error('يجب تسجيل الدخول أولاً ثم إعادة المحاولة.');
  }
  await user.getIdToken();
};

/** 
 * تنفيذ دالة مع إمكانية إعادة المحاولة تلقائياً في حال فشل المصادقة 
 * (مثلاً إذا انتهت صلاحية التوكن أثناء بقاء التطبيق مفتوحاً لفترة طويلة).
 */
export const callWithAuthRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error: unknown) {
    if (isUnauthenticatedError(error) && !isAppCheckError(error) && auth.currentUser) {
      // الرمز قد يكون قديماً؛ نقوم بتحديث الرمز وإعادة المحاولة مرة واحدة.
      await auth.currentUser.getIdToken(true);
      return await fn();
    }
    throw error;
  }
};

