import { httpsCallable } from 'firebase/functions';
import { auth, authPersistenceReady, functions } from './firebaseConfig';

/**
 * بوابة Gemini الآمنة (Secure Gemini Gateway)
 * هذا الملف مسؤول عن التواصل مع خدمة الـ Backend (Cloud Functions)
 * بدلاً من مناداة Gemini مباشرة من المتصفح، مما يحافظ على سرية مفاتيح المشروع
 * ويسمح بتطبيق حدود الاستخدام (Quotas) لكل طبيب بناءً على نوع حسابه.
 */

/**
 * أسماء الميزات المسموحة للـtracking — لازم تطابق `ALLOWED_AI_FEATURES`
 * في `functions/src/functions/adminFunctions.js`. أي قيمة تانية بتتسجل كـ"unknown".
 */
export type AiFeatureName =
  | 'case_analysis'      // تحليل الحالة الكامل
  | 'translation'        // ترجمة بيانات الروشتة (Smart RX)
  | 'drug_interactions'  // فحص التداخلات الدوائية
  | 'pregnancy_safety'   // أمان الحمل والرضاعة
  | 'renal_dose'         // تعديل جرعات الكلى
  | 'medical_report';    // طباعة تقرير طبي بالـAI

interface SecureGeminiParams {
  prompt: string;
  model?: string;
  temperature?: number;
  responseMimeType?: 'application/json' | 'text/plain';
  /**
   * ميزانية التفكير لـ gemini-2.5-flash (Thinking Mode):
   * - `-1` = ديناميكية (الموديل يقرر حسب التعقيد) — الأنسب للتشخيص الطبي.
   * - `0`  = تعطيل التفكير (أسرع، أقل جودة).
   * - `>0` = حد أقصى بعدد tokens.
   * لو مُرسَلش، الـ Cloud Function بيستخدم `-1` كـ default.
   */
  thinkingBudget?: number;
  /**
   * اسم الميزة اللي بتنادي AI — يُسجَّل في users/{id}.usageStatsByPlan.{tier}.aiFeatures
   * عشان تقرير الأدمن يعرض عداد per-feature لكل دكتور.
   */
  feature?: AiFeatureName;
}

interface SecureGeminiResponse {
  text: string;           // النص المولد من الذكاء الاصطناعي
  model: string;          // اسم الموديل الفعلي المستخدم
  responseMimeType: string;
  accountType: 'free' | 'premium' | 'pro_max'; // نوع حساب الطبيب المكتشف
  dayKey: string;         // مفتاح اليوم الحالي (لأغراض الحصص اليومية)
  remaining: number;      // عدد المرات المتبقية للطبيب اليوم
}

const waitForAuthUser = (timeoutMs = 3000): Promise<typeof auth.currentUser> => {
  return new Promise((resolve) => {
    let unsubscribe: (() => void) | null = null;
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe?.();
      resolve(auth.currentUser);
    }, timeoutMs);

    unsubscribe = auth.onAuthStateChanged((user) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      unsubscribe?.();
      resolve(user);
    });
  });
};

const isUnauthenticatedError = (error: unknown): boolean => {
  const typed = (error && typeof error === 'object' ? error as {
    code?: unknown;
    message?: unknown;
  } : {});
  const code = String(typed.code || '').toLowerCase();
  const message = String(typed.message || '').toLowerCase();
  return code.includes('unauthenticated') || message.includes('unauthenticated');
};

const isAppCheckError = (error: unknown): boolean => {
  const typed = (error && typeof error === 'object' ? error as {
    code?: unknown;
    message?: unknown;
  } : {});
  const code = String(typed.code || '').toLowerCase();
  const message = String(typed.message || '').toLowerCase();
  const combined = `${code} ${message}`;

  return combined.includes('appcheck')
    || combined.includes('app check')
    || combined.includes('app attestation')
    || combined.includes('missing appcheck token')
    || combined.includes('missing app check token')
    || (code.includes('failed-precondition') && combined.includes('app'));
};

const ensureAuthenticatedGeminiUser = async (): Promise<void> => {
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
 * استدعاء وظيفة "generateGeminiContent" الموجودة على Firebase Functions
 * تتعامل الوظيفة مع تجديد الهوية (Token Refresh) تلقائياً في حال انتهائها.
 */
export const generateGeminiContentSecure = async (params: SecureGeminiParams): Promise<SecureGeminiResponse> => {
  await ensureAuthenticatedGeminiUser();

  // تعريف الوظيفة السحابية
  const callable = httpsCallable(functions, 'generateGeminiContent');

  const call = async () => callable(params);

  let result: any;
  try {
    result = await call();
  } catch (error: unknown) {
    if (isAppCheckError(error)) {
      throw new Error('تعذر التحقق من App Check. تحقق من إعدادات App Check/RECAPTCHA ثم أعد المحاولة.');
    }

    // محاولة تجديد الـ Token مرة واحدة إذا فشلت العملية بسبب الهوية
    if (isUnauthenticatedError(error)) {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('انتهت جلسة تسجيل الدخول. سجل الدخول مرة أخرى ثم أعد المحاولة.');
      }

      await user.getIdToken(true); // فرض تجديد التوكين

      try {
        result = await call();
      } catch (retryError: unknown) {
        if (isAppCheckError(retryError)) {
          throw new Error('تعذر التحقق من App Check. تحقق من إعدادات App Check/RECAPTCHA ثم أعد المحاولة.');
        }
        if (isUnauthenticatedError(retryError)) {
          throw new Error('فشلت المصادقة. أعد تسجيل الدخول ثم حاول مرة أخرى.');
        }
        throw retryError;
      }
      
      // تم النجاح في إعادة المحاولة
    } else {
      throw error;
    }
  }

  // تحويل وتنسيق النتيجة النهائية
  const data = (result.data || {}) as Record<string, unknown>;
  return {
    text: String(data.text || ''),
    // الـ fallback القديم كان 'gemini-1.5-pro' — تحديث لأحدث موديل نستخدمه.
    model: String(data.model || params.model || 'gemini-2.5-flash'),
    responseMimeType: String(data.responseMimeType || params.responseMimeType || 'application/json'),
    accountType: data.accountType === 'premium' ? 'premium'
      : data.accountType === 'pro_max' ? 'pro_max'
      : 'free',
    dayKey: String(data.dayKey || ''),
    remaining: Number(data.remaining || 0),
  };
};
