import React, { Suspense } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ExtendedUser } from '../../../hooks/useAuth';
import { safeStorageGetItem } from '../../../services/auth-service/storage';
import { LoadingStateScreen } from '../LoadingStateScreen';
// تحديد وضع الدومين الحالي (مريض / عياده / both في الـdev) — عشان نمنع المرضى من الوصول
// لصفحات الأطباء والعكس، وده بيخلّي كل دومين يبان كـ"تطبيق مستقل".
import { getHostMode } from '../../../utils/hostMode';

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
// صفحه تعريف المريض — بتظهر فقط على drhypermed.com (الـlanding الأصلي يفضل على clinic.drhypermed.com)
const PatientLandingPage = React.lazy(() => import('../../landing/PatientLandingPage').then(m => ({ default: m.PatientLandingPage })));
// دليل المستخدم — صفحه عامّه (بدون تسجيل دخول) على دومين العياده فقط
const UserGuidePage = React.lazy(() => import('../../landing/user-guide/UserGuidePage').then(m => ({ default: m.UserGuidePage })));
// باقات الدعاية والتسويق — صفحه عامّه على دومين العياده فقط
const MarketingPackagesPage = React.lazy(() => import('../../landing/marketing-packages/MarketingPackagesPage').then(m => ({ default: m.MarketingPackagesPage })));

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
  const hostMode = getHostMode();

  // ── كشف تضارب الدومين مع الدور (cross-role conflict) ──
  // لو مستخدم مسجّل دخول على الدومين الغلط:
  //   • طبيب على drhypermed.com    → لازم يتحوّل لـclinic.drhypermed.com
  //   • مريض على clinic.drhypermed.com → لازم يتحوّل لـdrhypermed.com
  // بنحسب ده مرّه واحده ونستخدمه في:
  //   1) الـuseEffect اللي بيعمل redirect خارجي عبر window.location.replace
  //   2) الـredirectTarget useMemo — يرجّع null عشان ميحصلش navigate داخلي
  //      في نفس اللحظه (كان بيعمل flicker قبل ما الـpage تعيد التحميل).
  //   3) الرندر — نرجّع LoadingStateScreen لحد ما الـredirect الخارجي يشتغل.
  const isCrossRoleConflict = React.useMemo((): boolean => {
    if (hostMode === 'both') return false;        // dev مفتوح للاتنين
    if (loading) return false;                    // استنى الـauth يكمّل
    if (!user || !userRole) return false;         // مفيش مستخدم = مفيش تضارب
    if (hasBlacklistMessage) return false;        // blacklist له مسار خاص
    if (hostMode === 'patient' && userRole === 'doctor') return true;
    if (hostMode === 'clinic' && userRole === 'public') return true;
    return false;
  }, [hasBlacklistMessage, hostMode, loading, user, userRole]);

  // 🐛 إصلاح bug دوّامة التوجيه (cross-role redirect loop):
  // لمّا نلاحظ التضارب، نعمل redirect خارجي لدومينه الصح. ده بيوقف الدوّامه
  // فوراً لأن الصفحه كلها بتتعاد تحميل على الدومين التاني.
  //
  // بنحاول نحافظ على نيّه المستخدم: لو admin فتح drhypermed.com/admin
  // بالغلط، نوّدّيه على clinic.drhypermed.com/admin (مش /home فقط).
  React.useEffect(() => {
    if (!isCrossRoleConflict) return;
    if (hostMode === 'patient' && userRole === 'doctor') {
      // طبيب على دومين المرضى = حوّله لبوّابه العياده.
      // لو المسار الأصلي /admin أو /app/* بيخص clinic — نحفظه.
      const preservedPath = (
        pathname === '/admin' ||
        pathname === '/app/admin' ||
        pathname.startsWith('/app/') ||
        pathname === '/home' ||
        pathname.startsWith('/home/')
      ) ? pathname : '/home';
      window.location.replace(`https://clinic.drhypermed.com${preservedPath}`);
    } else if (hostMode === 'clinic' && userRole === 'public') {
      // مريض على دومين العياده = حوّله لدومين المرضى.
      // مسارات المريض محدوده (/public، /book-public/...) — نحفظها لو طابقت.
      const preservedPath = (
        pathname === '/public' ||
        pathname.startsWith('/book-public/')
      ) ? pathname : '/public';
      // بنحوّل للدومين الرسمي (www) لأن الدومين بدون www لسه DNS مش مظبوط
      window.location.replace(`https://www.drhypermed.com${preservedPath}`);
    }
  }, [hostMode, isCrossRoleConflict, pathname, userRole]);

  // ── تقسيم المسارات حسب الجمهور ──
  // كل مسار ينتمي لـ"public" (للمرضى) أو "clinic" (للأطباء/السكرتاريه/الأدمن) أو "any" (للكلّ).
  // لما الدومين الحالي = patient → المسارات الـclinic بتتحوّل تلقائياً لـlogin المريض
  // لما الدومين الحالي = clinic → المسارات الـpublic بتتحوّل تلقائياً لـlogin الطاقم الطبّي
  const isClinicOnlyPath = (
    pathname === '/login/doctor' ||
    pathname === '/signup/doctor' ||
    pathname === '/login/secretary' ||
    pathname === '/doctor/onboarding' ||
    pathname === '/home' ||
    pathname.startsWith('/home/') ||
    pathname === '/admin' ||
    pathname === '/app/admin' ||
    pathname.startsWith('/app/') ||
    pathname === '/user-guide' ||   // دليل المستخدم مخصوص للدكاتره — مش هيظهر على دومين المرضى
    pathname === '/marketing-packages' // باقات الدعاية مخصوصة للدكاتره — مش هتظهر على دومين المرضى
  );
  const isPublicOnlyPath = (
    pathname === '/login/public' ||
    pathname === '/public' ||
    pathname.startsWith('/book-public/')
  );

  // حساب هدف التوجيه أثناء الرندر — بدون استدعاء navigate مباشرةً داخل الرندر
  // (استدعاء navigate أثناء الرندر يُسبّب تحذير React "setState in render")
  const redirectTarget = React.useMemo((): string | null => {
    // لو في تضارب cross-role، الـredirect الخارجي (window.location.replace) هيتولّى
    // الموضوع — مفيش داعي للـnavigate الداخلي (كان بيعمل flicker).
    if (isCrossRoleConflict) return null;

    // أولاً: قيود الدومين (host mode) — أعلى أولويه بعد الـblacklist
    if (hostMode === 'patient' && isClinicOnlyPath) {
      // المريض دخل على مسار طبّي بالغلط = نوّجهه لـlogin المريض
      return '/login/public';
    }
    if (hostMode === 'clinic' && isPublicOnlyPath) {
      // طبيب دخل على مسار مريض بالغلط = نوّجهه لـlogin الطاقم الطبّي
      return '/login';
    }
    // على دومين المرضى، /login (شاشه الاختيار) مالهاش معنى لأن في خيار واحد بس.
    // نوّجه مباشره لـ/login/public عشان المستخدم ميشوفش قائمه خيار واحد فقط.
    if (hostMode === 'patient' && pathname === '/login') {
      return '/login/public';
    }

    if (hasBlacklistMessage && pathname !== '/login/doctor') return '/login/doctor';
    if (pathname === '/' && user) return userRole === 'public' ? '/public' : '/home';
    if (isAuthPath && user && !hasAuthFlowGuard && userRole) {
      if (userRole === 'public') return '/public';
      if (userRole === 'doctor') return '/home';
    }
    if ((pathname === '/admin' || pathname === '/app/admin') && !isAdminUser && user) return '/home';
    return null;
  }, [hasAuthFlowGuard, hasBlacklistMessage, hostMode, isAdminUser, isAuthPath, isClinicOnlyPath, isCrossRoleConflict, isPublicOnlyPath, pathname, user, userRole]);

  // تنفيذ التوجيه بعد اكتمال الرندر لتجنّب تحديث BrowserRouter أثناء الرسم
  React.useEffect(() => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
    }
  }, [navigate, redirectTarget]);

  // 0. تضارب cross-role — الـpage هتتعاد تحميل خارجياً، نعرض loading لحد ما يحصل
  if (isCrossRoleConflict) {
    return <LoadingStateScreen />;
  }

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

  // 4. الصفحه الرئيسيّه — للزوار غير المسجّلين فقط (المسجّلون وُجِّهوا أعلاه)
  // بنختار الـlanding المناسبه حسب الدومين:
  //   - drhypermed.com         → PatientLandingPage (للمرضى)
  //   - clinic.drhypermed.com  → LandingPage الأصليّه (للأطباء)
  //   - في الـdev (both)        → LandingPage الأصليّه عشان نقدر نشوفها كمان، والـpatient
  //                               تتشاف بـ?hostMode=patient
  if (pathname === '/') {
    if (hostMode === 'patient') {
      return <PatientLandingPage />;
    }
    return <LandingPage />;
  }

  // 4.1 دليل المستخدم — صفحه عامّه (بدون تسجيل دخول مطلوب).
  // بتظهر على clinic.drhypermed.com أو في الـdev فقط (مش على دومين المرضى — اتحجبت
  // فوق في isClinicOnlyPath). لمّا دكتور يزورها قبل ما يسجّل، يقرا ويفهم التطبيق.
  if (pathname === '/user-guide') {
    return <UserGuidePage />;
  }

  // 4.2 باقات الدعاية — صفحه عامّه (بدون تسجيل دخول مطلوب) على دومين العياده فقط
  if (pathname === '/marketing-packages') {
    return <MarketingPackagesPage />;
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

  // 6. دليل الأطباء العام (/public) — مفتوح للضيف والمسجّل.
  // ضروري لـSEO: جوجل لازم يقدر يفهرس صفحه الدليل بدون ما يعمل تسجيل دخول.
  // الـcomponent بيتعامل مع user = null (بيعرض زر "سجّل دخول" لمّا يحاول يحجز).
  // clinic host مبيوصلش هنا أصلاً (cross-role redirect في الـuseMemo فوق).
  if (pathname === '/public') {
    return <PublicDoctorsDirectoryPage user={user} profile={null} onLogout={() => signOut()} />;
  }

  if (!user) return <LoginSelectionPage />;

  // 7. إعداد حساب الطبيب (Onboarding)
  if (userRole === 'doctor' && pathname === '/doctor/onboarding') {
    return <DoctorOnboardingPage />;
  }

  // 8. لوحة تحكم الأدمن (التوجيه لغير الأدمن تمّ أعلاه)
  if (pathname === '/admin' || pathname === '/app/admin') {
    return <ComprehensiveAdminDashboard user={user} onLogout={signOut} />;
  }

  // مستخدم مسجَّل بدون دور — useAppRedirectEffect هيوجّهه لـ/login في useEffect
  // التالي. نعرض شاشة تحميل بدل الـnull عشان نتجنّب وميض أبيض لحظي.
  if (!userRole) return <LoadingStateScreen />;

  // 9. التطبيق الرئيسي للطبيب أو السكرتير
  return <MainApp />;
};
