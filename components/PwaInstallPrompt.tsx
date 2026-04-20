/**
 * مكون التنبيه لتثبيت التطبيق (PwaInstallPrompt):
 * هذا المكون مسؤول عن إظهار رسائل تشجع المستخدم على تثبيت التطبيق على جهازه (PWA).
 * يدعم المكون سيناريوهات مختلفة:
 * 1. التثبيت العادي للمتصفحات التي تدعم BeforeInstallPrompt (مثل Chrome على Android/PC).
 * 2. تعليمات يدوية لمستخدمي iOS (Safari) لأنهم يحتاجون لخطوات يدوية.
 * 3. تخصيص تجربة التثبيت بناءً على المسار (سواء كان الطبيب في لوحة التحكم أو السكرتارية في صفحة الحجز).
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type AppInstallOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: AppInstallOutcome; platform: string }>;
}

// ملاحظة: ما بنخزّنش أي flags في localStorage عشان "التطبيق اتثبت قبل كده".
// المصدر الوحيد للحقيقة هو display-mode: standalone — لو المستخدم شال التطبيق
// ورجع للمتصفح، لازم رسالة التثبيت تظهر تاني بدون أي ذاكرة سابقة.
// كمان بنمسح flags قديمة لو موجودة من نُسخ سابقة (legacy cleanup).
const LEGACY_INSTALL_FLAG_KEYS = ['dh_pwa_installed', 'dh_pwa_installed_main', 'dh_pwa_installed_secretary'] as const;
const DEFAULT_MANIFEST_PATH = '/manifest.webmanifest';
// متغير عالمي لحفظ الحدث (Event) لضمان عدم ضياعه عند التنقل بين الصفحات
let cachedBeforeInstallPromptEvent: BeforeInstallPromptEvent | null = null;

const isStandaloneMode = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIosSafari = (): boolean => {
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
  return isIOS && isSafari;
};

const isMobileDevice = (): boolean => {
  const ua = window.navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|mobile/.test(ua);
};

const isSecretaryPath = (pathname: string): boolean => /^\/book(\/|$)/.test(pathname);

const toAbsoluteUrl = (path: string, origin: string): string => {
  try {
    return new URL(path, origin).toString();
  } catch {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${normalizedPath}`;
  }
};

const buildSecretaryManifest = (startUrl: string, origin: string) => ({
  id: toAbsoluteUrl('/secretary-app', origin),
  name: 'سكرتارية العيادة',
  short_name: 'سكرتارية العيادة',
  description: 'إدارة حجوزات السكرتارية وقائمة الانتظار.',
  lang: 'ar',
  dir: 'rtl',
  start_url: toAbsoluteUrl(startUrl || '/', origin),
  scope: toAbsoluteUrl('/', origin),
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#16a34a',
  background_color: '#ffffff',
  categories: ['medical', 'health', 'productivity'],
  icons: [
    {
      src: toAbsoluteUrl('/pwa-192x192.png', origin),
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: toAbsoluteUrl('/pwa-512x512.png', origin),
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: toAbsoluteUrl('/pwa-maskable-512x512.png', origin),
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
});

export const PwaInstallPrompt: React.FC = () => {
  const location = useLocation();
  const isSecretaryRoute = isSecretaryPath(location.pathname);
  const installTargetLabel = isSecretaryRoute ? 'سكرتارية العيادة' : 'التطبيق';

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => cachedBeforeInstallPromptEvent
  );
  // الكارت بيظهر طالما التطبيق مش متثبت (مش متوقف على beforeinstallprompt event)،
  // عشان لو Chrome قرر ميفجرش الحدث (سبق الدسمس مثلاً) المستخدم لسه يقدر يثبت يدوياً.
  const [showInstallCard, setShowInstallCard] = useState(false);
  const [showIosCard, setShowIosCard] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // تنظيف أي flags قديمة من نُسخ سابقة — المصدر الوحيد للحقيقة هو standalone mode.
    LEGACY_INSTALL_FLAG_KEYS.forEach((key) => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });

    const standalone = isStandaloneMode();
    setIsInstalled(standalone);

    if (standalone) {
      setDeferredPrompt(null);
      setShowInstallCard(false);
      setShowIosCard(false);
      cachedBeforeInstallPromptEvent = null;
      return;
    }

    // التطبيق مش متثبت → نظهر الكارت دايماً (حتى لو beforeinstallprompt معملش fire).
    setShowInstallCard(true);
    if (isIosSafari()) {
      setShowIosCard(true);
    }
    if (cachedBeforeInstallPromptEvent) {
      setDeferredPrompt(cachedBeforeInstallPromptEvent);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      cachedBeforeInstallPromptEvent = installEvent;
      setDeferredPrompt(installEvent);
    };

    const handleInstalled = () => {
      cachedBeforeInstallPromptEvent = null;
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallCard(false);
      setShowIosCard(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [isSecretaryRoute]);

  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifestLink) return;

    if (!isSecretaryRoute) {
      manifestLink.href = DEFAULT_MANIFEST_PATH;
      return;
    }

    const origin = window.location.origin;
    const startUrl = `${location.pathname}${location.search}${location.hash}` || '/';
    const manifest = buildSecretaryManifest(startUrl, origin);
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
    const objectUrl = URL.createObjectURL(blob);
    manifestLink.href = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
      manifestLink.href = DEFAULT_MANIFEST_PATH;
    };
  }, [isSecretaryRoute, location.pathname, location.search, location.hash]);

  const dismissAll = () => {
    setShowInstallCard(false);
    setShowIosCard(false);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      cachedBeforeInstallPromptEvent = null;
      setIsInstalled(true);
      setShowInstallCard(false);
    }
    setDeferredPrompt(null);
  };

  const canTriggerInstall = Boolean(deferredPrompt);
  const mobileDevice = isMobileDevice();

  if (isInstalled) return null;
  if (!showInstallCard && !showIosCard) return null;

  return (
    <>
      {showInstallCard && canTriggerInstall && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="no-print fixed top-20 md:top-4 left-3 md:left-4 z-[10000] rounded-xl bg-emerald-600 text-white px-3 py-2 shadow-lg font-black text-xs md:text-sm hover:bg-emerald-700 transition-colors"
        >
          {isSecretaryRoute ? 'تثبيت سكرتارية العيادة' : 'تثبيت التطبيق'}
        </button>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(92vw, 420px)',
          zIndex: 9999,
          background: '#ffffff',
          border: '1px solid #bbf7d0',
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.12)',
          borderRadius: '14px',
          padding: '12px',
          direction: 'rtl',
        }}
      >
        {showInstallCard && (
          <>
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
              {mobileDevice ? `ثبت ${installTargetLabel} على الموبايل` : `ثبت ${installTargetLabel} على اللابتوب أو الكمبيوتر`}
            </div>
            <div style={{ fontSize: '13px', color: '#334155', marginBottom: '10px' }}>
              التطبيق هيسهّل الوصول من الشاشة الرئيسية ويشتغل كتطبيق مستقل.
            </div>

            {!canTriggerInstall && (
              <div style={{ fontSize: '12px', color: '#0f766e', marginBottom: '10px' }}>
                {mobileDevice
                  ? 'لو زر التثبيت مش ظاهر، افتح قائمة المتصفح واختر إضافة إلى الشاشة الرئيسية (Add to Home Screen).'
                  : 'لو زر التثبيت مش ظاهر، افتح قائمة المتصفح واختر Install app أو Create shortcut.'}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={dismissAll}
                style={{
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#0f172a',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                إخفاء الآن
              </button>
              {canTriggerInstall && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  style={{
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  تثبيت الآن
                </button>
              )}
            </div>
          </>
        )}

        {!showInstallCard && showIosCard && (
          <>
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: '6px' }}>تثبيت على iPhone</div>
            <div style={{ fontSize: '13px', color: '#334155', marginBottom: '10px' }}>
              من Safari اضغط زر المشاركة ثم اختر Add to Home Screen.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={dismissAll}
                style={{
                  border: 'none',
                  background: '#16a34a',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                تمام
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
