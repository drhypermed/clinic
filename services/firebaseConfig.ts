import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentSingleTabManager,
  setLogLevel,
} from "firebase/firestore";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  setPersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// Analytics و Performance معطلين لتوفير التكلفة — الاستيراد محذوف لتقليل حجم التطبيق
// import { getAnalytics } from "firebase/analytics";
// import { getPerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyAravOjVTZH-uSdvCPlkTv6GksUxjhNnRw",
  authDomain: "www.drhypermed.com",
  projectId: "gen-lang-client-0444130146",
  storageBucket: "gen-lang-client-0444130146.firebasestorage.app",
  messagingSenderId: "244450975164",
  appId: "1:244450975164:web:409a582335e24d0c035fb9",
  measurementId: "G-B0CEHS0YLV",
};

const app = initializeApp(firebaseConfig);

const FIRESTORE_SAFE_MODE_KEY = "drh_firestore_safe_mode_until";
const FIRESTORE_SAFE_MODE_WINDOW_MS = 6 * 60 * 60 * 1000;

const getLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readSafeModeUntil = (): number => {
  const storage = getLocalStorage();
  if (!storage) return 0;
  const raw = storage.getItem(FIRESTORE_SAFE_MODE_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const setFirestoreSafeMode = (durationMs = FIRESTORE_SAFE_MODE_WINDOW_MS): void => {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.setItem(FIRESTORE_SAFE_MODE_KEY, String(Date.now() + durationMs));
};

const clearFirestoreSafeMode = (): void => {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.removeItem(FIRESTORE_SAFE_MODE_KEY);
};

const isFirestoreSafeModeEnabled = (): boolean => readSafeModeUntil() > Date.now();

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "";
};

const isFirestoreInternalAssertion = (value: unknown): boolean => {
  const message = toErrorMessage(value);
  return message.includes("FIRESTORE") && message.includes("INTERNAL ASSERTION FAILED");
};

if (typeof window !== "undefined") {
  const markFirestoreSafeModeIfNeeded = (reason: unknown) => {
    if (isFirestoreInternalAssertion(reason)) {
      setFirestoreSafeMode();
    }
  };

  window.addEventListener(
    "error",
    (event) => {
      markFirestoreSafeModeIfNeeded(event.error ?? event.message);
    },
    { capture: true }
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      markFirestoreSafeModeIfNeeded(event.reason);
    },
    { capture: true }
  );
}

try {
  setLogLevel("error");
} catch {
  // Keep Firebase defaults if log level update fails.
}

// Firebase Analytics و Performance Monitoring معطلين لتوفير التكلفة وتسريع التطبيق.
// لو احتجتهم بعدين، فعّلهم بإزالة التعليق.
// if (typeof window !== "undefined") {
//   try { getAnalytics(app); } catch { }
//   try { getPerformance(app); } catch { }
// }

const getDb = () => {
  if (isFirestoreSafeModeEnabled()) {
    return initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
  }

  try {
    const firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({}),
        cacheSizeBytes: 100 * 1024 * 1024,
      }),
    });
    clearFirestoreSafeMode();
    return firestore;
  } catch (error) {
    setFirestoreSafeMode();
    console.warn("Firestore persistent cache failed. Falling back to memory cache.", error);
    try {
      return initializeFirestore(app, {
        localCache: memoryLocalCache(),
      });
    } catch {
      return initializeFirestore(app, {});
    }
  }
};

export const db = getDb();

const auth = getAuth(app);

export const authPersistenceReady =
  typeof window !== "undefined"
    ? setPersistence(auth, browserLocalPersistence)
        .catch((err) => {
          console.warn("Auth: Local persistence failed. Falling back to Session persistence.", err);
          return setPersistence(auth, browserSessionPersistence);
        })
        .catch((err) => {
          console.warn("Auth: Session persistence failed. Falling back to in-memory persistence.", err);
          return setPersistence(auth, inMemoryPersistence);
        })
        .catch((err) => {
          console.error("Auth: All persistence modes failed.", err);
        })
    : Promise.resolve();

export { auth };
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const functions = getFunctions(app, "us-central1");

try {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
  const siteKey = String(viteEnv?.VITE_RECAPTCHA_SITE_KEY ?? "").trim();
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]");

  if (siteKey && typeof window !== "undefined") {
    const fixedDebugToken = String(viteEnv?.VITE_APPCHECK_DEBUG_TOKEN ?? "").trim();

    // على localhost: لو مفيش VITE_APPCHECK_DEBUG_TOKEN مسجّل في Firebase Console،
    // نتجنّب تهيئة App Check بالكامل عشان مانعملش 403 spam اللي بيبطّأ كل كولات
    // Firestore و Auth — كل كول كان بيستنى فشل التوكن الأول.
    const shouldSkipAppCheck = isLocalhost && !fixedDebugToken;

    if (shouldSkipAppCheck) {
      console.info(
        "[App Check] متعطّل على localhost — مفيش VITE_APPCHECK_DEBUG_TOKEN. " +
        "ده بيسرّع كولات Firebase في الديف. لتفعيل App Check محلياً: زوّد debug token في Firebase Console → App Check، وحطّه في .env.local."
      );
    } else {
      if (isLocalhost) {
        (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
          fixedDebugToken;
      }
      void import("firebase/app-check")
        .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
          initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(siteKey),
            isTokenAutoRefreshEnabled: true,
          });
        })
        .catch(() => {
          // App Check is optional for local/dev-like unsupported environments.
        });
    }
  }
} catch {
  // App Check is optional in environments where initialization fails.
}

export default app;
