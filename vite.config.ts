import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// قراءة الإصدار من package.json لعرضه في لوحة الإدارة (S1).
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8'));
const APP_VERSION = pkg.version || '0.0.0';
// تاريخ الـ build الفعلي — يُضبط مرة واحدة عند بدء Vite (S2).
const BUILD_DATE = new Date().toISOString();

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
  },
  resolve: {
    alias: {
      '@/types': resolve(__dirname, 'types.ts'),
      '@/constants': resolve(__dirname, 'app/drug-catalog/constants.ts'),
      '@/categoryIndicationKeywords': resolve(__dirname, 'app/drug-catalog/categoryIndicationKeywords.ts'),
      '@': resolve(__dirname, '.'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      // ─ تحديث تلقائي عشان سفاري آيفون ما يفضّلش ماسك بنسخه قديمه.
      //   على iOS التبويب بيفضل صاحي في الخلفيّه لمّا التطبيق متثبّت على الشاشه،
      //   فالموظّف القديم (Service Worker) ما يتنحّاش أبداً مع 'prompt'.
      //   autoUpdate + skipWaiting + clientsClaim بيخلّوا الموظّف الجديد ياخد
      //   الدفّه فوراً من غير انتظار قفل التبويبات.
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png', 'firebase-messaging-sw.js'],
      workbox: {
        // الموظّف الجديد ينشّط نفسه فوراً بدل ما يدخل في حالة "waiting"
        skipWaiting: true,
        // ياخد دفّة كل التبويبات المفتوحه من غير ما تتقفل وتتفتح من تاني
        clientsClaim: true,
        inlineWorkboxRuntime: true,
        importScripts: ['/firebase-messaging-sw.js'],
        globPatterns: ['**/*.{css,html,ico,png,svg,webmanifest,woff2,woff,ttf}', 'assets/!(drug-*)*.js'],
        // استثناء الـlogo الضخم (1.1MB) من الـoffline cache — بيتحمّل مرة واحدة عبر الشبكة، مش محتاج يتخزن في الـSW.
        globIgnores: ['**/logo.png'],
        navigateFallback: 'index.html',
        // ─ نمنع navigateFallback من أن يرجع HTML بدل ملفات الصور/الأيقونات.
        //   كان iOS أحياناً يستلم index.html لما يطلب apple-touch-icon → فيـfallback
        //   لحرف اسم التطبيق ("D"). إضافة الـregexes دي بتضمن إن طلبات الأيقونات
        //   والصور والـmanifest تروح للـnetwork مباشرة بدون تدخل من workbox.
        navigateFallbackDenylist: [
          /^\/__\//, /firebase-messaging-sw\.js$/, /sw\.js$/, /workbox-.*\.js$/,
          /\.(?:png|jpg|jpeg|svg|gif|webp|ico|webmanifest)$/i,
          /^\/apple-touch-icon/i,
          /^\/manifest/i,
        ],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/?.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ext-tailwind-cdn',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // ملاحظة: قواعد Google Fonts (fonts.googleapis.com / fonts.gstatic.com) اتشالت
          // لأن خط Cairo بقى محلي 100% في /fonts/cairo/ — بيتـprecache مع باقي
          // الأصول عبر globPatterns (woff2 + css) فمفيش طلب خارجي محتاج caching.
          {
            urlPattern: /\/assets\/.*\.js$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-scripts',
              networkTimeoutSeconds: 4,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/assets\/.*\.(?:css|woff|woff2|ttf)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-static-assets',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        // الـmanifest الافتراضي للـbuild — بيستخدم فقط على localhost/staging.
        // على الإنتاج (drhypermed.com / clinic.drhypermed.com) الـindex.html بيبدّله
        // ديناميكياً لـmanifest-patient.webmanifest (DrHyperPublic) أو
        // manifest-clinic.webmanifest (DrHyperMed) حسب الدومين.
        id: '/',
        name: 'DrHyperMed',
        short_name: 'DrHyperMed',
        description: 'Smart clinic management, prescriptions, and pediatric dose support.',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        categories: ['medical', 'health', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  envDir: '.',
  server: {
    // ─ إيقاف التحديث التلقائي (HMR) في وضع التطوير.
    //   السبب: كل reload تلقائي بيعيد تشغيل Firebase listeners → قراءات إضافية
    //   من Firestore + استهلاك انترنت. لما HMR = false، أي تعديل في الكود
    //   ما يعملش reload لوحده — لازم المستخدم يضغط F5 / Ctrl+R بنفسه.
    //   ملاحظة: ده بيأثر بس على dev server، مش على الـbuild الإنتاجي.
    hmr: false,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  // ─ esbuild يستخدم في:
  //   1) source transformation (TS/JSX/etc) أثناء dev و build
  //   2) minification في الـbuild (لو minify: 'esbuild')
  //   pure: ['console.log', ...] يخلي esbuild يعتبرهم side-effect-free،
  //   فالـtree-shaker بيشيلهم من الـproduction bundle لو الناتج مش مستخدم.
  //   النتيجة: bundle أصغر + JS execution أسرع (مفيش log overhead في hot loops).
  //   سيبنا console.warn و console.error عشان الـmonitoring يلتقطهم في الإنتاج.
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.info'],
  },
  build: {
    target: 'safari13',
    cssTarget: 'safari13',
    emptyOutDir: true,
    chunkSizeWarningLimit: 6000,
    // إيقاف حساب gzip size لعرضه فقط في الـoutput — بيوفر 10-15 ثانية في كل build.
    reportCompressedSize: false,
    modulePreload: {
      resolveDependencies: (filename, deps, context) => {
        return deps.filter((dep) => {
          const normalized = dep.replace(/\\/g, '/');
          // استثناء الموديولز اللي لا تحتاج التحميل الأولي:
          //   - مجموعات الأدوية (lazy per group)
          //   - messaging / app-check / analytics (تُحمَّل عند الحاجة)
          //   - مكتبات PDF/chart/crop (lazy — بتتحمّل لما المستخدم يفتح الميزة)
          // ملاحظة: vendor-firebase-core لازم يتحمّل أولاً لأن كل التطبيق بيعتمد عليه،
          // فما نستثنيهش من preload عشان يتحمّل بالتوازي مع index بدل ما يعمل waterfall.
          if (normalized.includes('drug-')) return false;
          if (normalized.includes('drug-catalog-core-')) return false;
          if (normalized.includes('vendor-firebase-messaging-')) return false;
          if (normalized.includes('vendor-firebase-appcheck-')) return false;
          if (normalized.includes('vendor-firebase-analytics-')) return false;
          // المكتبات التقيلة اللي ما تتستخدم إلا في ميزات متأخرة (طباعة/رسوم/قص صور):
          if (normalized.includes('vendor-html2canvas-')) return false;
          if (normalized.includes('vendor-recharts-')) return false;
          if (normalized.includes('vendor-easy-crop-')) return false;
          return true;
        });
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('/drugs/')) {
            const group = normalizedId.split('/drugs/')[1]?.split('/')[0] || 'misc';
            const safeGroup = group.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
            return `drug-${safeGroup || 'misc'}`;
          }

          if (normalizedId.includes('/app/drug-catalog/constants.ts')) return 'drug-catalog-core';

          if (normalizedId.includes('/node_modules/')) {
            if (normalizedId.includes('/node_modules/firebase/') || normalizedId.includes('/node_modules/@firebase/')) {
              if (normalizedId.includes('/firebase/messaging/') || normalizedId.includes('/@firebase/messaging/')) {
                return 'vendor-firebase-messaging';
              }
              if (normalizedId.includes('/firebase/analytics/') || normalizedId.includes('/@firebase/analytics/')) {
                return 'vendor-firebase-analytics';
              }
              if (normalizedId.includes('/firebase/app-check/') || normalizedId.includes('/@firebase/app-check/')) {
                return 'vendor-firebase-appcheck';
              }
              return 'vendor-firebase-core';
            }
            if (
              normalizedId.includes('/node_modules/react/') ||
              normalizedId.includes('/node_modules/react-dom/') ||
              normalizedId.includes('/node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (normalizedId.includes('/node_modules/@google/genai/')) return 'vendor-genai';
            // فصل المكتبات التقيلة (كانت كلها مدمجة في vendor = 1.1MB):
            //   - html2canvas: تحويل DOM لصورة (lazy، في BookingSuccessCard)
            //   - recharts: الـdashboard charts (lazy)
            //   - react-easy-crop: قص الصور (lazy)
            //   - react-router: راوتينج (startup)
            //   - react-icons: أيقونات (startup)
            //   - dompurify: تنظيف HTML (startup)
            // ملاحظة: @sentry/react مش منفصل — بيعمل circular dependency مع vendor العام
            // (بعض utilities الـsentry مشتركة مع حاجات تانية)، فسايبينه داخل vendor.
            if (normalizedId.includes('/node_modules/html2canvas/')) return 'vendor-html2canvas';
            if (normalizedId.includes('/node_modules/recharts/')) return 'vendor-recharts';
            if (normalizedId.includes('/node_modules/react-easy-crop/')) return 'vendor-easy-crop';
            if (
              normalizedId.includes('/node_modules/react-router/') ||
              normalizedId.includes('/node_modules/react-router-dom/') ||
              normalizedId.includes('/node_modules/@remix-run/router/')
            ) {
              return 'vendor-react-router';
            }
            if (normalizedId.includes('/node_modules/react-icons/')) return 'vendor-react-icons';
            if (normalizedId.includes('/node_modules/dompurify/')) return 'vendor-dompurify';
            return 'vendor';
          }
        },
      },
    },
  },
});
