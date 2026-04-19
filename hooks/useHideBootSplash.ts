import { useEffect } from 'react';

/**
 * Hook لإخفاء شاشة السبلاش الأوّلية (`#dh-splash` في `index.html`) لما الصفحة
 * الحقيقية تعمل mount فعلاً.
 *
 * ليه؟ السبلاش عنصر ثابت في HTML بيظهر قبل ما React يتحمّل بالكامل. لو خبّيناه
 * بدري (مثلاً بمجرد ما auth يجهز)، المستخدم ممكن يشوف شاشة بيضاء أثناء ما
 * Suspense لسه بيحمّل الـ lazy chunk الخاص بالصفحة. لو استنينا لحد ما الصفحة
 * نفسها تعمل mount، بنضمن إن المستخدم يشوف سبلاش → صفحة حقيقية مباشرة.
 *
 * الاستخدام: استدعيه مرة واحدة من أعلى الصفحة الرئيسية (MainApp، LandingPage،
 * LoginSelectionPage، ...). الـ reason بيظهر في الكونسول لأغراض التشخيص.
 */
export const useHideBootSplash = (reason: string = 'page-ready') => {
  useEffect(() => {
    const windowWithSplash = window as Window & {
      __dhHideSplash?: (reason?: string) => void;
      __dhSplashT0?: number;
    };
    const hideSplash = windowWithSplash.__dhHideSplash;
    if (typeof hideSplash !== 'function') return;

    // حد أدنى 1500ms عشان السبلاش ميختفيش بسرعة مفاجئة لو الصفحة جهزت في
    // أقل من الوقت ده — ده بيخلّي التجربة تحس إنها "متعمّدة" مش مختلسة.
    const MIN_SPLASH_MS = 1500;
    const elapsed = performance.now() - (windowWithSplash.__dhSplashT0 || 0);
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

    // نستنى فريم واحد قبل الـ timer عشان نضمن إن أول render للصفحة خلص
    // والـ browser رسم أول frame بالمحتوى.
    let timer: number;
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => hideSplash(reason), remaining);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
    };
  }, [reason]);
};
