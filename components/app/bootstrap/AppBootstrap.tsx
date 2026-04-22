import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { registerSW } from 'virtual:pwa-register';
import { auth } from '../../../services/firebaseConfig';
import { applyPendingPwaUpdateNow } from '../../../services/pwaUpdateService';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { initNotificationSoundUnlockListeners } from '../../../utils/notificationSound';
import { LoadingStateScreen } from '../LoadingStateScreen';

const App = React.lazy(() => import('../AppCoreMain').then(m => ({ default: m.App })));
const PwaInstallPrompt = React.lazy(() => import('../../PwaInstallPrompt').then(m => ({ default: m.PwaInstallPrompt })));
const NotificationTogglePrompt = React.lazy(() => import('../../NotificationTogglePrompt').then(m => ({ default: m.NotificationTogglePrompt })));
const PublicBookingPage = React.lazy(() => import('../../appointments/public-booking/PublicBookingPage').then(m => ({ default: m.PublicBookingPage })));
const PublicBookingFormPage = React.lazy(() => import('../../appointments/public-booking-form/PublicBookingFormPage').then(m => ({ default: m.PublicBookingFormPage })));
// صفحه الطبيب المستقلّه (SEO-first) — URL: /dr/:slug
// مسار منفصل عن App عشان الـbot يشوف المحتوى بدون الـauth gates.
const DoctorPublicPage = React.lazy(() => import('../../advertisement/public-directory/DoctorPublicPage').then(m => ({ default: m.DoctorPublicPage })));

/**
 * يعمل تمرير للأعلى تلقائياً مع كل تغيير في المسار،
 * حتى يبدأ المستخدم دائماً من أعلى الصفحة بعد التنقل.
 */
const ScrollToTopOnNavigate: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

let hasPendingPwaUpdate = false;
const pwaUpdateListeners = new Set<() => void>();
let suppressPwaUpdateNoticeUntil = 0;
const observedRegistrations = new WeakSet<ServiceWorkerRegistration>();

const setPendingPwaUpdate = (pending: boolean) => {
  hasPendingPwaUpdate = pending;
  pwaUpdateListeners.forEach((listener) => listener());
};

const emitPwaUpdateAvailable = () => {
  if (Date.now() < suppressPwaUpdateNoticeUntil) return;
  setPendingPwaUpdate(true);
};

const subscribePwaUpdateAvailable = (listener: () => void) => {
  pwaUpdateListeners.add(listener);
  return () => {
    pwaUpdateListeners.delete(listener);
  };
};

const hasRealWaitingUpdate = (registration: ServiceWorkerRegistration): boolean => {
  if (!registration.waiting) return false;
  if (!navigator.serviceWorker.controller) return false;
  // With Workbox/VitePWA the active and waiting workers often share `/sw.js`.
  // URL equality does not mean "no update", so presence of waiting worker is enough.
  return true;
};

const syncPendingPwaUpdateFromRegistration = (registration: ServiceWorkerRegistration) => {
  if (hasRealWaitingUpdate(registration)) {
    emitPwaUpdateAvailable();
    return;
  }
  if (Date.now() >= suppressPwaUpdateNoticeUntil) {
    setPendingPwaUpdate(false);
  }
};

const observeRegistrationForUpdate = (registration: ServiceWorkerRegistration) => {
  syncPendingPwaUpdateFromRegistration(registration);
  if (observedRegistrations.has(registration)) return;
  observedRegistrations.add(registration);

  registration.addEventListener('updatefound', () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      syncPendingPwaUpdateFromRegistration(registration);
    });
  });
};

registerSW({
  immediate: false,
  onNeedRefresh() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      emitPwaUpdateAvailable();
      return;
    }
    navigator.serviceWorker.getRegistration('/').then((registration) => {
      if (!registration) return;
      observeRegistrationForUpdate(registration);
      syncPendingPwaUpdateFromRegistration(registration);
    }).catch(() => {
      // Fallback: keep pending update flag for admin auto-apply flow.
      emitPwaUpdateAvailable();
    });
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    observeRegistrationForUpdate(registration);
    syncPendingPwaUpdateFromRegistration(registration);
  },
});

const RootApp: React.FC = () => {
  const [showOptionalPrompts, setShowOptionalPrompts] = React.useState(false);
  const [authUser, setAuthUser] = React.useState<User | null>(() => auth.currentUser);
  const [authReady, setAuthReady] = React.useState(Boolean(auth.currentUser));
  const isApplyingPwaUpdateRef = React.useRef(false);
  const adminAutoApplyCooldownRef = React.useRef(false);
  const isAdminUser = useIsAdmin(authUser ? { email: authUser.email, uid: authUser.uid } : null);
  const canAutoUpdateForAdmin = authReady && isAdminUser;

  const handleApplyPwaUpdate = React.useCallback(async () => {
    if (isApplyingPwaUpdateRef.current) return;

    isApplyingPwaUpdateRef.current = true;
    suppressPwaUpdateNoticeUntil = Date.now() + 30 * 1000;
    setPendingPwaUpdate(false);

    try {
      await applyPendingPwaUpdateNow();
    } finally {
      setTimeout(() => {
        isApplyingPwaUpdateRef.current = false;
      }, 3000);
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setAuthUser(nextUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    return subscribePwaUpdateAvailable(() => {
      if (!canAutoUpdateForAdmin) return;
      if (!hasPendingPwaUpdate) return;
      if (isApplyingPwaUpdateRef.current || adminAutoApplyCooldownRef.current) return;

      adminAutoApplyCooldownRef.current = true;
      void handleApplyPwaUpdate().finally(() => {
        setTimeout(() => {
          adminAutoApplyCooldownRef.current = false;
        }, 4000);
      });
    });
  }, [canAutoUpdateForAdmin, handleApplyPwaUpdate]);

  React.useEffect(() => {
    if (!canAutoUpdateForAdmin) return;
    if (!hasPendingPwaUpdate) return;
    if (isApplyingPwaUpdateRef.current || adminAutoApplyCooldownRef.current) return;

    adminAutoApplyCooldownRef.current = true;
    void handleApplyPwaUpdate().finally(() => {
      setTimeout(() => {
        adminAutoApplyCooldownRef.current = false;
      }, 4000);
    });
  }, [canAutoUpdateForAdmin, handleApplyPwaUpdate]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration('/').then((registration) => {
      if (!registration) {
        return;
      }
      syncPendingPwaUpdateFromRegistration(registration);
      observeRegistrationForUpdate(registration);
    }).catch(() => { });
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const browserWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;
    const showPrompts = () => setShowOptionalPrompts(true);

    if (browserWindow.requestIdleCallback) {
      idleId = browserWindow.requestIdleCallback(() => showPrompts(), { timeout: 4500 });
    } else {
      timeoutId = setTimeout(showPrompts, 2200);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (idleId !== null && browserWindow.cancelIdleCallback) {
        browserWindow.cancelIdleCallback(idleId);
      }
    };
  }, []);

  React.useEffect(() => {
    initNotificationSoundUnlockListeners();
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTopOnNavigate />
      {showOptionalPrompts && (
        <React.Suspense fallback={null}>
          <PwaInstallPrompt />
          <NotificationTogglePrompt />
        </React.Suspense>
      )}
      <React.Suspense fallback={<LoadingStateScreen />}>
        <Routes>
          {/* Short public booking URL - uses slug instead of userId */}
          <Route path="/p/:slug" element={<PublicBookingFormPage />} />
          {/* Secretary booking URL - uses slug instead of userId */}
          <Route path="/book/:slug" element={<PublicBookingPage />} />
          <Route path="/book/s/:secret" element={<PublicBookingPage />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/book/:userId/:secret" element={<PublicBookingPage />} />
          <Route path="/book-public/s/:secret" element={<PublicBookingFormPage />} />
          <Route path="/book-public/:userId/:secret" element={<PublicBookingFormPage />} />
          <Route path="/book-public/:userId" element={<PublicBookingFormPage />} />
          {/* صفحه الطبيب المستقلّه — URL صديق لمحركات البحث (/dr/slug) */}
          <Route path="/dr/:slug" element={<DoctorPublicPage />} />
          <Route path="*" element={<App />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

const rootElement = document.getElementById('root');

export const mountRootApp = () => {
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RootApp />
    </React.StrictMode>
  );
};
