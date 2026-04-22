// نقطة الانطلاق الرئيسية.
// الاستيراد static لـ AppBootstrap مهم عشان Vite يقدر يولّد
// modulepreload hints لكل الـ chunks المطلوبة — ده بيحمّلهم بالتوازي
// بدل ما يعمل waterfall متسلسل.

import './services/disablePersistentWebStorage';
import { applyHostAwareMeta } from './utils/hostAwareMeta';
import { mountRootApp } from './components/app/bootstrap/AppBootstrap';

// تطبيق الـmeta tags حسب الدومين الحالي قبل ما React يعمل mount —
// عشان Googlebot والمستخدم يشوفوا الـtitle/description/canonical الصح
// من أول لحظه (بدل الثابته في index.html اللي مكتوبه للـclinic).
applyHostAwareMeta();

const __dhT0 = (window as Window & { __dhSplashT0?: number }).__dhSplashT0 || 0;
console.log('[DH-TIMING] index.tsx-executed: ' + Math.round(performance.now() - __dhT0) + 'ms');

mountRootApp();
console.log('[DH-TIMING] mountRootApp-called: ' + Math.round(performance.now() - __dhT0) + 'ms');

// السبلاش هيختفي من AppCoreMain.tsx لما App الفعلية تعمل mount —
// كده المستخدم ميشوفش spinner وسطاني بين السبلاش والصفحة.

// تهيئات ثانوية تتأجل لحد ما المتصفح يخلص الرسم الأولي.
type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
};

const runDeferredInit = () => {
  void (async () => {
    try {
      const [
        { installConsoleProductionFilter },
        { initMonitoring },
        { initSentry },
        { installUserTextLengthGuard },
      ] = await Promise.all([
        import('./utils/installConsoleProductionFilter'),
        import('./services/monitoringService'),
        import('./services/sentryService'),
        import('./services/security/installUserTextLengthGuard'),
      ]);

      installConsoleProductionFilter();
      initMonitoring();
      void initSentry();
      installUserTextLengthGuard();
    } catch {
      // التهيئات الثانوية ما تمنعش التطبيق لو فشلت.
    }
  })();
};

const idleWindow = window as IdleWindow;
if (typeof idleWindow.requestIdleCallback === 'function') {
  idleWindow.requestIdleCallback(runDeferredInit, { timeout: 3000 });
} else {
  setTimeout(runDeferredInit, 1);
}
