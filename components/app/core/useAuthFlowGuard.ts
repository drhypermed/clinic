import { useEffect, useState } from 'react';
import { AUTH_FLOW_GUARD_EVENT, AUTH_FLOW_GUARD_KEY } from './constants';

/**
 * Hook حماية تدفق تسجيل الدخول (Auth Flow Guard Hook)
 * يستخدم هذا الـ Hook لمنع "التوجيه العشوائي" أثناء قيام المستخدم بعملية حساسة (مثل تسجيل دخول جوجل).
 * يقوم بتخزين مسار الحماية في sessionStorage ومزامنته عبر كافة التبويبات المفتوحة.
 * إذا كان هناك "Guard" نشط على مسار معين، لن يقوم التطبيق بإعادة التوجيه التلقائي حتى ينتهي المستخدم أو يغلق الصفحة.
 */

const safeSessionStorageGetItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export const useAuthFlowGuard = (pathname: string) => {
  const [authFlowGuardPath, setAuthFlowGuardPath] = useState<string | null>(
    () => safeSessionStorageGetItem(AUTH_FLOW_GUARD_KEY)
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // وظيفة لمزامنة الحالة الحالية مع التخزين المؤقت
    const syncAuthFlowGuard = () => {
      setAuthFlowGuardPath(safeSessionStorageGetItem(AUTH_FLOW_GUARD_KEY));
    };

    syncAuthFlowGuard();
    
    // الاستماع للتغييرات اليدوية في المتصفح أو عند العودة للتبويب (Focus)
    window.addEventListener(AUTH_FLOW_GUARD_EVENT, syncAuthFlowGuard as EventListener);
    window.addEventListener('focus', syncAuthFlowGuard);
    document.addEventListener('visibilitychange', syncAuthFlowGuard);

    return () => {
      window.removeEventListener(AUTH_FLOW_GUARD_EVENT, syncAuthFlowGuard as EventListener);
      window.removeEventListener('focus', syncAuthFlowGuard);
      document.removeEventListener('visibilitychange', syncAuthFlowGuard);
    };
  }, []);

  // تحديث الحالة عند تغيير المسار لضمان دقة الحماية
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAuthFlowGuardPath(safeSessionStorageGetItem(AUTH_FLOW_GUARD_KEY));
  }, [pathname]);

  return authFlowGuardPath; // يعيد المسار المحمي حالياً (أو null إذا كان التدفق حراً)
};
