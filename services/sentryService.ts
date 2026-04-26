/**
 * Sentry Service — طبقة مراقبة أخطاء اختيارية (تُفعَّل فقط إذا كان VITE_SENTRY_DSN موجوداً).
 *
 * يعمل جنباً إلى جنب مع monitoringService الحالي:
 *   - monitoringService: يسجّل في Firestore (للتاريخ والتحليل)
 *   - Sentry: يُنبّه فوراً عبر email/slack (للاستجابة السريعة)
 *
 * للتفعيل:
 *   1. سجّل في sentry.io (مجاني: 5k event/شهر)
 *   2. أنشئ مشروع React → انسخ DSN
 *   3. ضع في .env.local: VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
 *   4. أعد البناء والنشر
 */

let sentryInitialized = false;

/**
 * تهيئة Sentry ديناميكياً. لو DSN غير موجود، الدالة تعود فوراً دون تحميل أي كود.
 */
export async function initSentry(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (sentryInitialized) return;

  const dsn = String(import.meta.env.VITE_SENTRY_DSN || '').trim();
  if (!dsn) return; // لا DSN → لا تحميل لحزمة Sentry إطلاقاً

  try {
    // Lazy import — يتحمّل فقط لو الـ DSN مضبوط
    const Sentry = await import('@sentry/react');

    Sentry.init({
      dsn,
      environment: import.meta.env.PROD ? 'production' : 'development',
      // 10% sampling في الإنتاج — يوفّر quota
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      // أخطاء المتصفح الشائعة المزعجة — نتجاهلها
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'Network request failed',
      ],
      // Breadcrumbs لآخر أحداث قبل الخطأ (helpful)
      maxBreadcrumbs: 50,
    });

    sentryInitialized = true;
  } catch (err) {
    // Sentry نفسه فشل — نتجاهل بصمت، monitoringService يغطّي
    console.warn('[Sentry] Init failed:', err);
  }
}

