// ─────────────────────────────────────────────────────────────────────────────
// حارس تدفق تسجيل الدخول (Auth Flow Guard)
// ─────────────────────────────────────────────────────────────────────────────
// نظام بسيط بيمنع "التوجيه العشوائي" وقت ما يكون المستخدم في وسط عملية حساسة
// زي Google signInPopup. المشكلة بدونه: الـ app router بيشوف أن المستخدم مش
// مسجل دخول ومش عند حساب → يوجهه لصفحة اللوجين → يكسر الـ popup.
//
// الحل: قبل ما نفتح popup، نحط "guard" في sessionStorage يقول "أنا في الطريق
// لتسجيل دخول على المسار ده". الـ router يشوف الـ guard ويتجاهل إعادة التوجيه
// لحد ما العملية تخلص.
//
// المكونات الأساسية (في app/core/):
//   - constants.ts: مفتاح sessionStorage + اسم الحدث
//   - useAuthFlowGuard: hook بيراقب الـ guard في الـ Dashboard Router
//
// هذا الملف بيوفر helpers للـ 3 صفحات auth (Doctor Login/Signup + Public Login)
// اللي كانت بتكرر نفس المنطق يدوياً.
// ─────────────────────────────────────────────────────────────────────────────

import { AUTH_FLOW_GUARD_EVENT, AUTH_FLOW_GUARD_KEY } from '../app/core/constants';

/**
 * إطلاق حدث "تغير الحارس" — بيخلي useAuthFlowGuard في الـ App Router
 * يعيد قراءة الحالة فوراً بدل ما يستنى focus/visibilitychange.
 */
const notifyAuthFlowGuardChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_FLOW_GUARD_EVENT));
};

/** تفعيل الحارس على مسار معين (مثلاً "/login/doctor" قبل فتح Google popup). */
export const setAuthFlowGuard = (path: string) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(AUTH_FLOW_GUARD_KEY, path);
  notifyAuthFlowGuardChanged();
};

/**
 * إلغاء الحارس — لو تم تحديد expectedPath، نلغي فقط إذا كان المسار الحالي
 * مطابق له. ده بيحمي من race condition بين صفحتين مفتوحتين في تابين.
 */
export const clearAuthFlowGuard = (expectedPath?: string) => {
  if (typeof window === 'undefined') return;
  if (expectedPath && sessionStorage.getItem(AUTH_FLOW_GUARD_KEY) !== expectedPath) return;
  sessionStorage.removeItem(AUTH_FLOW_GUARD_KEY);
  notifyAuthFlowGuardChanged();
};

/**
 * إلغاء الحارس بعد تأخير (بعد محاولة login مثلاً).
 * السبب في التأخير: العملية أحياناً تنهي بعد navigate، فنسيب وقت صغير قبل
 * الإلغاء عشان ما نكسرش التدفق المتبقي.
 */
export const clearAuthFlowGuardSoon = (expectedPath: string, delayMs = 0) => {
  if (typeof window === 'undefined') return;
  window.setTimeout(() => clearAuthFlowGuard(expectedPath), delayMs);
};
