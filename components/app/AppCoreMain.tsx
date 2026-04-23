import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAccountStatusMonitor } from '../../hooks/useAccountStatusMonitor';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { AppCoreContent } from './core/AppCoreContent';
import { isAuthPathname, isDoctorOnboardingPathname } from './core/constants';
import { useAuthFlowGuard } from './core/useAuthFlowGuard';
import { usePageTitle } from './core/usePageTitle';
import { useHostAwareMeta } from './core/useHostAwareMeta';
import { useDoctorOnboardingStatus } from './core/useDoctorOnboardingStatus';
import { usePremiumSubscriptionWatcher } from './core/usePremiumSubscriptionWatcher';
import { useAppRedirectEffect } from './core/useAppRedirectEffect';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { OfflineIndicator } from '../common/OfflineIndicator';

/**
 * المكون الجذري للتطبيق (Root App Component)
 * هذا هو المكون الأساسي الذي يتم تحميله عند تشغيل النظام. 
 * وظيفته الأساسية هي "الحراسة" (Guarding) والتوجيه:
 * 1. مراقبة حالة تسجيل الدخول (Authentication).
 * 2. التحقق من صلاحيات المستخدم (Admin vs Doctor).
 * 3. متابعة حالة "إعداد الحساب" (Onboarding) للطبيب الجديد.
 * 4. إعادة التوجيه التلقائية (Redirects) بناءً على حالة الحساب (مثلاً: لو لم يكمل الطبيب بياناته، يتم توجيهه لصفحة الإكمال).
 * 5. مراقبة اشتراك العضوية الممتازة (Pro Subscription).
 */

export const App: React.FC = () => {
  // 1. جلب بيانات الهوية والحالة من نظام Firebase Authentication
  const { user, loading, error, signOut } = useAuth();

  // ملاحظة: إخفاء السبلاش منفصل دلوقتي — بيحصل من داخل الصفحة الحقيقية (MainApp،
  // LandingPage، ...) عن طريق useHideBootSplash، عشان المستخدم ميشوفش شاشة
  // بيضاء بين السبلاش والمحتوى الفعلي.

  // 2. مراقبة حالة الحساب (هل هو مفعل؟ هل تم حظره؟) والتسجيل الخروج التلقائي عند الضرورة
  useAccountStatusMonitor(user, signOut);

  const isAdminUser = useIsAdmin(user);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // 3. تحديد نوع المسار الحالي (هل نحن في صفحات الدخول أم في صفحات إعداد الحساب؟)
  const isAuthPath = isAuthPathname(pathname);
  const isDoctorOnboardingPath = isDoctorOnboardingPathname(pathname);

  // 4. حماية مسار تسجيل الدخول (منع المسجلين فعلياً من العودة لصفحة الدخول)
  const authFlowGuardPath = useAuthFlowGuard(pathname);
  const hasAuthFlowGuard = isAuthPath && authFlowGuardPath === pathname;

  // 5. تحديث عنوان الصفحة (Page Title) في المتصفح ديناميكياً
  usePageTitle(pathname);

  // 5.1 تحديث الـmeta tags حسب الدومين (patient vs clinic) — بيحصل مره واحده عند التحميل
  // drhypermed.com     → meta + title خاصّين بالمرضى (index في جوجل)
  // clinic.drhypermed.com → robots noindex (مش بيظهر في جوجل)
  useHostAwareMeta();

  // 6. التحقق من حالة إكمال الملف الشخصي للطبيب ورفع الوثائق المطلوبة
  const doctorOnboardingStatus = useDoctorOnboardingStatus({
    user,
    isAdminUser,
  });

  // 7. مراقبة حالة الاشتراك الممتاز وتحديث الميزات المتاحة للطبيب
  usePremiumSubscriptionWatcher({ user });

  // 8. المحرك المسؤول عن إعادة التوجيه الذكي (مثلاً: التوجيه للوحة التحكم بعد الدخول بنجاح)
  useAppRedirectEffect({
    loading,
    user,
    isAuthPath,
    isDoctorOnboardingPath,
    doctorOnboardingStatus,
    pathname,
    navigate,
    signOut,
    hasAuthFlowGuard,
  });

  // 9. تمرير كافة الحالات لمكون AppCoreContent الذي يتولى عرض الواجهة المناسبة (Loading أو Content)
  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <AppCoreContent
        loading={loading}
        user={user}
        error={error}
        doctorOnboardingStatus={doctorOnboardingStatus}
        pathname={pathname}
        isAuthPath={isAuthPath}
        hasAuthFlowGuard={hasAuthFlowGuard}
        isAdminUser={isAdminUser}
        navigate={navigate}
        signOut={signOut}
      />
    </ErrorBoundary>
  );
};
