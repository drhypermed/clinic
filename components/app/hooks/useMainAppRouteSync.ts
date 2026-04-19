import { useCallback, useEffect, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { AppView, VIEW_TO_PATH, resolveViewFromPath } from '../utils';

/**
 * Hook مزامنة المسارات (Route Sync Hook)
 *
 * يضمن أن حالة الواجهة الداخلية للتطبيق (currentView) متزامنة دائماً مع رابط الصفحة (URL).
 *
 * آلية "الانتقال المؤجّل" (Deferred Navigation):
 * عند الضغط على زر في الـ Sidebar، بدلاً من تحديث currentView مباشرة (اللي بيسبب تجمد):
 * 1. بنحدد pendingView → يظهر spinner فوري
 * 2. بنستنى المتصفح يرسم الـ spinner (عبر requestAnimationFrame مزدوج)
 * 3. بعدها بنحدث currentView الفعلي → الـ render الثقيل يحصل والـ spinner ظاهر
 */

interface UseMainAppRouteSyncParams {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  pathname: string;
  navigate: NavigateFunction;
  syncKey?: string;
}

export const useMainAppRouteSync = ({
  currentView,
  setCurrentView,
  pathname,
  navigate,
  syncKey,
}: UseMainAppRouteSyncParams) => {
  const prevPathRef = useRef<string>('');
  const rafRef = useRef(0);
  const [pendingView, setPendingView] = useState<AppView | null>(null);

  // وظيفة الانتقال: تعرض spinner فوراً ثم تؤجل الـ render الثقيل
  const navigateToView = useCallback((view: AppView, replace = false) => {
    const targetPath = VIEW_TO_PATH[view];
    if (currentView === view && pathname === targetPath) return;

    // 1. عرض الـ spinner فوراً
    setPendingView(view);

    // 2. تحديث الرابط (خفيف - مش بيسبب render ثقيل)
    if (pathname !== targetPath) {
      navigate(targetPath, { replace });
    }
  }, [currentView, navigate, pathname]);

  // 3. بعد ما المتصفح يرسم الـ spinner، ننفذ التغيير الثقيل
  useEffect(() => {
    if (pendingView === null) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCurrentView(pendingView);
        setPendingView(null);
      });
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [pendingView, setCurrentView]);

  // مزامنة الرابط → الحالة (أزرار العودة/الأمام في المتصفح)
  useEffect(() => {
    const pathChanged = prevPathRef.current !== pathname;

    if (pathChanged) {
      prevPathRef.current = pathname;
      const resolvedView = resolveViewFromPath(pathname);

      if (resolvedView) {
        // لو فيه pendingView شغال بالفعل، ما نعملش حاجة تانية
        if (resolvedView !== currentView && pendingView === null) {
          setPendingView(resolvedView);
        }
        return;
      }

      if (pathname.startsWith('/book') || pathname.startsWith('/p') || pathname.startsWith('/book-public')) {
        return;
      }

      if (pathname === '/' || pathname === '/app') {
        navigate(VIEW_TO_PATH.home, { replace: true });
        return;
      }

      return;
    }

    // تصحيح الرابط ليطابق الحالة (مع الحفاظ على search params)
    if (pendingView === null) {
      const targetPath = VIEW_TO_PATH[currentView];
      if (pathname !== targetPath) {
        navigate(
          { pathname: targetPath, search: window.location.search },
          { replace: true },
        );
      }
    }
  }, [currentView, navigate, pathname, pendingView, setCurrentView, syncKey]);

  // التمرير لأعلى عند تغيير الصفحة
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  return { navigateToView, pendingView };
};
