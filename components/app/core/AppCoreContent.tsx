import React, { Suspense } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ExtendedUser } from '../../../hooks/useAuth';
import { safeStorageGetItem } from '../../../services/auth-service/storage';
import { LoadingStateScreen } from '../LoadingStateScreen';

import type { DoctorOnboardingStatus } from './useDoctorOnboardingStatus';

// تحميل الصفحات بشكل كسول (Lazy Loading) لتحسين الأداء وتقليل الحجم الابتدائي للملفات
const LoginSelectionPage = React.lazy(() => import('../../auth/LoginSelectionPage').then(m => ({ default: m.LoginSelectionPage })));
const DoctorGoogleLoginPage = React.lazy(() => import('../../auth/DoctorGoogleLoginPage').then(m => ({ default: m.DoctorGoogleLoginPage })));
const DoctorSignupPage = React.lazy(() => import('../../auth/DoctorSignupPage').then(m => ({ default: m.DoctorSignupPage })));
const DoctorOnboardingPage = React.lazy(() => import('../../auth/DoctorOnboardingPage').then(m => ({ default: m.DoctorOnboardingPage })));
const PublicLoginPage = React.lazy(() => import('../../auth/PublicLoginPage').then(m => ({ default: m.PublicLoginPage })));
const SecretaryLoginPage = React.lazy(() => import('../../auth/SecretaryLoginPage').then(m => ({ default: m.SecretaryLoginPage })));
const PublicDoctorsDirectoryPage = React.lazy(() => import('../../advertisement/public-directory/PublicDoctorsDirectoryPage').then(m => ({ default: m.PublicDoctorsDirectoryPage })));
const ComprehensiveAdminDashboard = React.lazy(() => import('../../admin/comprehensive-dashboard/ComprehensiveAdminDashboard').then(m => ({ default: m.ComprehensiveAdminDashboard })));
const MainApp = React.lazy(() => import('../MainApp').then(m => ({ default: m.MainApp })));
const LandingPage = React.lazy(() => import('../../landing/LandingPage').then(m => ({ default: m.LandingPage })));

/**
 * مكون محتوى التطبيق الأساسي (App Core Content Component)
 * هذا المكون هو "الشرطي" الذي يقرر أي صفحة يجب عرضها للمستخدم بناءً على:
 * 1. هل المستخدم مسجل دخول؟
 * 2. ما هو دوره (طبيب، مستخدم عام، سكرتير، أدمن)؟
 * 3. هل أكمل الطبيب عملية التسجيل والأوراق المطلوبة (Onboarding)؟
 * 4. ما هو المسار (Pathname) الذي يحاول الوصول إليه؟
 */

type AppCoreContentProps = {
  loading: boolean;
  user: ExtendedUser | null;
  error: string | null;
  doctorOnboardingStatus: DoctorOnboardingStatus; // حالة إعداد حساب الطبيب
  pathname: string;
  isAuthPath: boolean;           // هل المسار الحالي هو صفحة دخول/تسجيل؟
  hasAuthFlowGuard: boolean;     // هل المسار محمي ضد العودة العكسية؟
  isAdminUser: boolean;          // هل المستخدم أدمن للنظام؟
  navigate: NavigateFunction;
  signOut: () => Promise<void>;
};

export const AppCoreContent: React.FC<AppCoreContentProps> = (props) => {
  return (
    // توفير شاشة تحميل مرئية أثناء تحميل الأكواد "الكسولة" (Suspense) — مهم
    // للحالات اللي السبلاش اتخفي فيها بـ safety-timeout قبل ما الصفحة تجهز.
    <Suspense fallback={<LoadingStateScreen />}>
      <AppCoreContentInner {...props} />
    </Suspense>
  );
};

const AppCoreContentInner: React.FC<AppCoreContentProps> = ({
  loading,
  user,
  error,
  doctorOnboardingStatus,
  pathname,
  isAuthPath,
  hasAuthFlowGuard,
  isAdminUser,
  navigate,
  signOut,
}) => {
  const hasBlacklistMessage = safeStorageGetItem('blacklist_message');
  const userRole = user?.authRole === 'doctor' || user?.authRole === 'public' ? user.authRole : null;

  // حساب هدف التوجيه أثناء الرندر — بدون استدعاء navigate مباشرةً داخل الرندر
  // (استدعاء navigate أثناء الرندر يُسبّب تحذير React "setState in render")
  const redirectTarget = React.useMemo((): string | null => {
    if (hasBlacklistMessage && pathname !== '/login/doctor') return '/login/doctor';
    if (pathname === '/' && user) return userRole === 'public' ? '/public' : '/home';
    if (isAuthPath && user && !hasAuthFlowGuard && userRole) {
      if (userRole === 'public') return '/public';
      if (userRole === 'doctor') return '/home';
    }
    if ((pathname === '/admin' || pathname === '/app/admin') && !isAdminUser && user) return '/home';
    return null;
  }, [hasAuthFlowGuard, hasBlacklistMessage, isAdminUser, isAuthPath, pathname, user, userRole]);

  // تنفيذ التوجيه بعد اكتمال الرندر لتجنّب تحديث BrowserRouter أثناء الرسم
  React.useEffect(() => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
    }
  }, [navigate, redirectTarget]);

  // 1. شاشة تحميل أثناء انتظار بيانات المستخدم أو حالة الطبيب
  if ((loading || (user && doctorOnboardingStatus === 'loading')) && !(isAuthPath && hasAuthFlowGuard)) {
    return <LoadingStateScreen />;
  }

  if (!user && error) {
    console.error('Auth Initialization Error (Silent Fallback):', error);
  }

  // 2. انتظار تنفيذ التوجيه (يحدث في useEffect بعد هذا الرندر)
  if (redirectTarget) return null;

  // 3. القائمة السوداء — عرض صفحة الدخول مباشرةً (التوجيه تمّ أعلاه إن لزم)
  if (hasBlacklistMessage) {
    return <DoctorGoogleLoginPage />;
  }

  // 4. الصفحة الرئيسية — للزوار غير المسجلين فقط (المسجلون وُجِّهوا أعلاه)
  if (pathname === '/') {
    return <LandingPage />;
  }

  // 5. مسارات المصادقة والتسجيل
  if (isAuthPath) {
    if (!user || hasAuthFlowGuard || !userRole) {
      if (pathname === '/login/doctor') return <DoctorGoogleLoginPage />;
      if (pathname === '/signup/doctor') return <DoctorSignupPage />;
      if (pathname === '/login/public') return <PublicLoginPage />;
      if (pathname === '/login/secretary') return <SecretaryLoginPage />;
      return <LoginSelectionPage />;
    }
    return <LoginSelectionPage />;
  }

  if (!user) return <LoginSelectionPage />;

  // 6. إعداد حساب الطبيب (Onboarding)
  if (userRole === 'doctor' && pathname === '/doctor/onboarding') {
    return <DoctorOnboardingPage />;
  }

  // 7. لوحة تحكم الأدمن (التوجيه لغير الأدمن تمّ أعلاه)
  if (pathname === '/admin' || pathname === '/app/admin') {
    return <ComprehensiveAdminDashboard user={user} onLogout={signOut} />;
  }

  // 8. صفحة الجمهور
  if (userRole === 'public' && pathname === '/public') {
    return <PublicDoctorsDirectoryPage user={user as any} profile={null} onLogout={() => signOut()} />;
  }

  if (!userRole) return null;

  // 9. التطبيق الرئيسي للطبيب أو السكرتير
  return <MainApp />;
};
