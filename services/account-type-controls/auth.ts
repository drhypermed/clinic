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

/**
 * على localhost، أي خطأ `unauthenticated` من Cloud Function عليها
 * `enforceAppCheck: true` يكون في الغالب بسبب App Check مش شغال:
 *   - إما `VITE_APPCHECK_DEBUG_TOKEN` مش موجود في `.env.local` (فالـ App Check
 *     مش بيتهيأ أصلاً — firebaseConfig.ts:186).
 *   - أو التوكن موجود لكن مش مسجّل في Firebase Console → App Check → Debug tokens
 *     (فالـ exchangeDebugToken بيرجع 403).
 * في الحالتين تحديث ID token مش هيساعد، والـ retry بيضيع 3 كولات.
 */
const isLocalhostDev = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
};

const LOCALHOST_APP_CHECK_ERROR_MESSAGE =
  'مشكلة App Check على localhost. خطوات الحل:\n' +
  '1) Firebase Console ← App Check ← Apps ← اختر الـ web app ← Manage debug tokens.\n' +
  '2) Add debug token → انسخ التوكن (UUID) بالكامل.\n' +
  '3) احطه في .env.local بالشكل: VITE_APPCHECK_DEBUG_TOKEN=<التوكن>\n' +
  '4) أوقف Vite (Ctrl+C) وشغّله تاني (npm run dev).\n' +
  'لو شايف 403 على exchangeDebugToken في الكونسول = التوكن مش متطابق مع المسجّل.';

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
    if (isLocalhostDev()) {
      throw new Error(LOCALHOST_APP_CHECK_ERROR_MESSAGE);
    }
    throw new Error('فشلت المصادقة. أعد تسجيل الدخول ثم حاول مرة أخرى.');
  }

  // ملحوظة: permission-denied مش بالضرورة معناه "admin only" — دي رسالة عامة
  // من الـCloud Functions ممكن تيجي من فشل App Check (reCAPTCHA) أو أي مشكلة
  // صلاحية تانية. نخليها رسالة مفهومة بدل الرسالة المضلّلة القديمة.
  // الـcaller (لو quota function) بيعدّي الخطأ ده وبيسمح بالعمل. لو admin
  // function، الرسالة دي بتظهر للأدمن.
  if (normalized.includes('permission-denied')) {
    throw new Error('تعذّر إكمال الطلب. جرّب تحديث الصفحة وحاول مرة أخرى.');
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
  // نحدِّث الرمز بالقوة قبل الاستدعاء لمنع حالات الفشل المتقطع للمستخدمين المميزين
  // حيث كان الرمز المخزن مؤقتاً يمر الفحص المحلي لكنه يُرفض من الـ Cloud Function.
  await user.getIdToken();
};

/**
 * تنفيذ دالة مع إمكانية إعادة المحاولة تلقائياً عند فشل المصادقة.
 * يعمل حتى 3 محاولات: الأولى مباشرة، والمحاولتان التاليتان بعد تحديث
 * الرمز بالقوة مع فاصل زمني قصير يسمح لانتشار التوكن في الخدمة الخلفية.
 */
export const callWithAuthRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  const MAX_ATTEMPTS = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const canRetry =
        attempt < MAX_ATTEMPTS &&
        isUnauthenticatedError(error) &&
        !isAppCheckError(error) &&
        !isLocalhostDev() &&
        !!auth.currentUser;

      if (!canRetry) throw error;

      try {
        await auth.currentUser!.getIdToken(true);
      } catch {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }
  throw lastError;
};
