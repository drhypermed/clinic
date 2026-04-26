import { useEffect, useRef } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ExtendedUser } from '../../../hooks/useAuth';
import { PUBLIC_AUTH_ERROR_KEY } from '../../../services/auth-service';
import { safeStorageGetItem } from '../../../services/auth-service/storage';
import { isPublicGuestPathname } from './constants';
import type { DoctorOnboardingStatus } from './useDoctorOnboardingStatus';

/**
 * Hook المسؤول عن إعادة التوجيه التلقائي (App Redirect Effect)
 * هذا هو "المحرك" الذي يراقب حالة المستخدم ويقرر أين يجب أن يكون.
 * الحالات التي يعالجها:
 * 1. وجود أخطاء في القائمة السوداء (Blacklist) أو الحظر.
 * 2. محاولة الوصول لصفحات داخلية بدون تسجيل دخول.
 * 3. توجيه الطبيب لصفحة "إكمال البيانات" (Onboarding) إذا لم ينهها.
 * 4. توجيه المستخدم العام (Public) لصفحة دليل الأطباء.
 */

type UseAppRedirectEffectParams = {
  loading: boolean;
  user: ExtendedUser | null;
  isAuthPath: boolean;
  isDoctorOnboardingPath: boolean;
  doctorOnboardingStatus: DoctorOnboardingStatus;
  pathname: string;
  navigate: NavigateFunction;
  signOut: () => Promise<void>;
  hasAuthFlowGuard: boolean; // هل توجد حماية تمنع التوجيه التلقائي حالياً؟
};

export const useAppRedirectEffect = ({
  loading,
  user,
  isAuthPath,
  isDoctorOnboardingPath,
  doctorOnboardingStatus,
  pathname,
  navigate,
  signOut,
  hasAuthFlowGuard,
}: UseAppRedirectEffectParams) => {
  const lastRedirectPathRef = useRef<string>('');
  const redirectCooldownRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. إذا كانت الحماية نشطة (أثناء عملية دخول حساسة)، نوقف التوجيه التلقائي
    if (hasAuthFlowGuard) {
      return;
    }

    // 2. معالجة أخطاء دخول الجمهور (مثلاً: لو حاول مريض الدخول ببيانات خاطئة)
    const hasPublicAuthError = safeStorageGetItem(PUBLIC_AUTH_ERROR_KEY);
    if (hasPublicAuthError) {
      if (pathname === '/signup/doctor') return;
      if (pathname !== '/login/public') {
        navigate('/login/public', { replace: true });
      }
      return;
    }

    // 3. معالجة حالات الحظر والرفض (Blacklist / Rejection)
    const hasBlacklistError = safeStorageGetItem('blacklist_error');
    const hasDuplicateError = safeStorageGetItem('duplicate_account_error');
    const hasRejectionError = safeStorageGetItem('rejection_error');
    const hasNotFoundError = safeStorageGetItem('not_found_error');
    const hasBlacklistMessage = safeStorageGetItem('blacklist_message');

    if (hasBlacklistError || hasDuplicateError || hasRejectionError || hasNotFoundError || hasBlacklistMessage) {
      if (pathname !== '/login/doctor') {
        navigate('/login/doctor', { replace: true });
      }
      return;
    }

    if (loading) return;
    if (redirectCooldownRef.current) return;

    // السماح بالوصول لصفحات الإدارة (Admin) - المعالجة تتم في AppCoreContent
    if (pathname === '/admin' || pathname === '/app/admin') return;

    // 4. حالة المستخدم غير المسجل (توجيهه لصفحة الدخول المناسبة)
    if (!user) {
      const hasLocalBlacklistMessage = safeStorageGetItem('blacklist_message');

      if (isDoctorOnboardingPath) {
        if (lastRedirectPathRef.current !== '/login/doctor') {
          lastRedirectPathRef.current = '/login/doctor';
          navigate('/login/doctor', { replace: true });
        }
        return;
      }

      // المسارات المفتوحة للزائر (دليل الأطباء، الحجز، الـlanding، دليل المستخدم)
      // مصدر حقيقة موحَّد — يضمن إن الزائر يقدر يصفّح ويحجز بدون redirect مفاجئ.
      if (!isAuthPath && !isPublicGuestPathname(pathname)) {
        if (hasLocalBlacklistMessage) {
          if (lastRedirectPathRef.current !== '/login/doctor') {
            lastRedirectPathRef.current = '/login/doctor';
            navigate('/login/doctor', { replace: true });
          }
        } else {
          if (lastRedirectPathRef.current !== '/login') {
            lastRedirectPathRef.current = '/login';
            navigate('/login', { replace: true });
          }
        }
      }
      return;
    }

    // تحديد دور المستخدم (طبيب أم جمهور)
    const userRole = user.authRole === 'doctor' || user.authRole === 'public' ? user.authRole : null;

    if (!userRole) {
      // مستخدم مسجّل دخول لكن بدون دور معروف — حالات ممكنة:
      //   • Google login جديد بدون profile في Firestore
      //   • فشل تحميل البيانات (شبكة أو صلاحيات)
      //   • بروفايل قديم اتمسح من قاعدة البيانات
      // لو هو في صفحة auth (login/signup) أو صفحة عامّه، نخليه يكمل عادي.
      // غير كده، نوجّهه لـ/login عشان ميقعدش على شاشة بيضاء كاملة.
      if (!isAuthPath && !isPublicGuestPathname(pathname)) {
        if (lastRedirectPathRef.current !== '/login') {
          lastRedirectPathRef.current = '/login';
          navigate('/login', { replace: true });
        }
      }
      return;
    }

    // 5. منطق توجيه الطبيب (خلفية الحساب وإكمال البيانات)
    if (userRole === 'doctor') {
      if (doctorOnboardingStatus === 'loading') return;

      if (isDoctorOnboardingPath) {
        lastRedirectPathRef.current = pathname;
        return;
      }

      // إذا لم يكمل الطبيب بياناته، يتم إجباره على الذهاب لصفحة Onboarding
      if (doctorOnboardingStatus === 'incomplete') {
        if (lastRedirectPathRef.current !== '/doctor/onboarding') {
          lastRedirectPathRef.current = '/doctor/onboarding';
          redirectCooldownRef.current = true;
          navigate('/doctor/onboarding', { replace: true });
          setTimeout(() => { redirectCooldownRef.current = false; }, 500);
        }
        return;
      }
    }

    // 6. منع المستخدم المسجل من البقاء في صفحات الدخول (Success Path)
    if (isAuthPath) {
      if (userRole === 'public' && pathname === '/signup/doctor') return;
      
      if (userRole === 'public') {
        // لو المستخدم من الجمهور وحاول يدخل صفحة تسجيل دخول الأطباء، وجّهه لصفحة الجمهور مع رسالة توضيحية
        if (pathname === '/login/doctor') {
          if (typeof window !== 'undefined') {
            localStorage.setItem(PUBLIC_AUTH_ERROR_KEY, '⚠️ أنت مسجل كمستخدم جمهور. هذه البوابة مخصصة للأطباء فقط. يرجى استخدام تسجيل دخول الجمهور.');
          }
          if (lastRedirectPathRef.current !== '/login/public') {
            lastRedirectPathRef.current = '/login/public';
            redirectCooldownRef.current = true;
            navigate('/login/public', { replace: true });
            setTimeout(() => { redirectCooldownRef.current = false; }, 500);
          }
        } else if (lastRedirectPathRef.current !== '/public') {
          lastRedirectPathRef.current = '/public';
          redirectCooldownRef.current = true;
          navigate('/public', { replace: true });
          setTimeout(() => { redirectCooldownRef.current = false; }, 500);
        }
      } else {
        // الأطباء يذهبون للوحة التحكم الرئيسية
        if (lastRedirectPathRef.current !== '/home') {
          lastRedirectPathRef.current = '/home';
          redirectCooldownRef.current = true;
          navigate('/home', { replace: true });
          setTimeout(() => { redirectCooldownRef.current = false; }, 500);
        }
      }
      return;
    }

    // 7. التأكد من بقاء كل فئة في مكانها الصحيح (Public User Safety Check)
    if (userRole === 'public' && pathname !== '/public') {
      if (lastRedirectPathRef.current !== '/public') {
        lastRedirectPathRef.current = '/public';
        redirectCooldownRef.current = true;
        navigate('/public', { replace: true });
        setTimeout(() => { redirectCooldownRef.current = false; }, 500);
      }
      return;
    }

    // 8. منع الأطباء من دخول دليل الجمهور بالخطأ
    if (userRole === 'doctor' && pathname === '/public') {
      if (lastRedirectPathRef.current !== '/home') {
        lastRedirectPathRef.current = '/home';
        redirectCooldownRef.current = true;
        navigate('/home', { replace: true });
        setTimeout(() => { redirectCooldownRef.current = false; }, 500);
      }
    }
  }, [
    loading, user, isAuthPath, isDoctorOnboardingPath, doctorOnboardingStatus, pathname, navigate, signOut, hasAuthFlowGuard,
  ]);
};
