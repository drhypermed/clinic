/**
 * ثوابت نواة التطبيق (App Core Constants)
 * يحتوي هذا الملف على المفاتيح والأسماء الثابتة المستخدمة في إدارة جلسات المستخدم،
 * عناوين الصفحات، ووظائف التحقق من المسارات.
 */

// مفتاح التخزين المستخدم لحماية تدفق عملية تسجيل الدخول
export const AUTH_FLOW_GUARD_KEY = 'dh_auth_flow_guard';
// اسم الحدث (Event) الذي يتم إطلاقه عند تغير حالة الحماية
export const AUTH_FLOW_GUARD_EVENT = 'dh-auth-flow-guard-changed';

// العناوين الثابتة التي تظهر في شريط عنوان المتصفح بناءً على نوع المستخدم
export const DOCTOR_PAGE_TITLE = 'إدارة العيادة الذكية';
export const PUBLIC_PAGE_TITLE = 'دليل العيادات والأطباء';

/**
 * وظيفة للتحقق مما إذا كان المسار الحالي يخص عمليات تسجيل الدخول أو الاختيار الأولي.
 * @param pathname المسار الحالي (مثلاً: /login/doctor)
 * @returns true إذا كان المسار يخص تسجيل الدخول
 */
export const isAuthPathname = (pathname: string): boolean => {
  return (
    pathname === '/login' ||             // شاشة اختيار نوع الدخول
    pathname === '/signup/doctor' ||    // صفحة إنشاء حساب طبيب جديد
    pathname === '/login/doctor' ||     // صفحة دخول الطبيب (جوجل)
    pathname === '/login/public' ||     // صفحة دخول الجمهور
    pathname === '/login/secretary'     // صفحة دخول السكرتارية
  );
};

/**
 * وظيفة للتحقق مما إذا كان الطبيب حالياً في مرحلة "إكمال البيانات".
 * @param pathname المسار الحالي
 * @returns true إذا كان الطبيب في صفحة الـ Onboarding
 */
export const isDoctorOnboardingPathname = (pathname: string): boolean => {
  return pathname === '/doctor/onboarding';
};
