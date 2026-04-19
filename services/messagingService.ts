import { deleteToken, getMessaging, onMessage, type Messaging } from 'firebase/messaging';
import app, { auth } from './firebaseConfig';
import { firestoreService } from './firestore';
import {
  cachePushToken,
  clearCachedPushToken,
  readCachedPushToken,
} from './messagingTokenCache';
import { getFcmTokenWithRetries } from './messaging-service/fcmTokenResolver';
import {
  saveTokenViaCallable,
  unregisterTokenViaCallable,
} from './messaging-service/pushCallables';
export { closePushNotificationsByContext, showForegroundSystemNotification } from './messagingForegroundUtils';
const APP_SW_PATH = '/sw.js';
const VAPID_ENV_KEYS = ['VITE_VAPID_KEY', 'VITE_FIREBASE_VAPID_KEY', 'VITE_FCM_VAPID_KEY'] as const;
let warnedInvalidVapidEnv = false;
const isIosLikeDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = String(navigator.userAgent || '').toLowerCase();
  const iDevice = /iphone|ipad|ipod/.test(ua);
  const iPadDesktopMode = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1;
  return iDevice || iPadDesktopMode;
};
const isStandaloneDisplayMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const navStandalone = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const mediaStandalone = typeof window.matchMedia === 'function'
    ? window.matchMedia('(display-mode: standalone)').matches
    : false;
  return navStandalone || mediaStandalone;
};
const getViteEnvString = (key: string): string => {
  const env = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
  const value = env?.[key];
  if (typeof value === 'string') return value;
  return String(value ?? '');
};
type PushSetupReason =
  | 'missing-target' // نقص معرف الطبيب أو السكرتارية
  | 'unsupported' // المتصفح لا يدعم الإشعارات
  | 'messaging-unavailable' // فشل تهيئة Firebase Messaging
  | 'sw-registration-failed' // فشل تسجيل Service Worker
  | 'permission-denied' // المستخدم رفض منح إذن الإشعارات
  | 'token-empty' // تعذر الحصول على رمز Firebase
  | 'save-failed' // فشل حفظ الرمز في قاعدة البيانات
  | 'unknown';
interface PushSetupResult {
  ok: boolean;
  reason?: PushSetupReason;
  permission?: NotificationPermission;
  token?: string;
  debugCode?: string;
  debugMessage?: string;
  debugScope?: string;
}
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
function getVapidKey(): string | undefined {
  const normalizeCandidate = (value: string) => value.trim().replace(/^['"]+|['"]+$/g, '');
  const isLikelyVapid = (value: string) =>
    /^[A-Za-z0-9\-_]+(={0,2})?$/.test(value) && value.length >= 20;
  let invalidKeySource = '';
  for (const envKey of VAPID_ENV_KEYS) {
    const candidate = normalizeCandidate(getViteEnvString(envKey));
    if (!candidate) continue;
    if (isLikelyVapid(candidate)) return candidate;
    invalidKeySource = envKey;
    break;
  }
  if (invalidKeySource && !warnedInvalidVapidEnv) {
    warnedInvalidVapidEnv = true;
    console.warn(
      `[FCM] ignoring invalid VAPID key from env (${invalidKeySource}): unexpected key format/length`
    );
  }
  return undefined;
}
let messaging: Messaging | null = null;
// registerPushTokenCallable و unregisterPushTokenCallable مُستخرجان إلى
// `messaging-service/pushCallables.ts`. لا نحتاج إنشاءهما هنا.
const pushSetupInFlight = new Map<string, Promise<PushSetupResult>>();

function getMessagingInstance(): Messaging | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!messaging) messaging = getMessaging(app);
    return messaging;
  } catch {
    return null;
  }
}
function canUsePushMessaging(): boolean {
  return getPushSupportInfo().supported;
}
export function getPushSupportInfo(): { supported: boolean; reason?: string } {
  if (typeof window === 'undefined') return { supported: false, reason: 'not-browser' };
  if (!window.isSecureContext) return { supported: false, reason: 'insecure-context' };
  if (isIosLikeDevice() && !isStandaloneDisplayMode()) {
    return { supported: false, reason: 'ios-install-required' };
  }
  if (!('serviceWorker' in navigator)) return { supported: false, reason: 'service-worker-unsupported' };
  if (!('PushManager' in window)) return { supported: false, reason: 'push-unsupported' };
  if (!('Notification' in window)) return { supported: false, reason: 'notification-unsupported' };
  return { supported: true };
}
async function waitForServiceWorkerActivation(registration: ServiceWorkerRegistration): Promise<void> {
  if (registration.active) return;
  const worker = registration.installing || registration.waiting;
  if (!worker) return;
  await new Promise<void>((resolve) => {
    const onStateChange = () => {
      if (worker.state === 'activated') {
        worker.removeEventListener('statechange', onStateChange);
        resolve();
      }
    };
    worker.addEventListener('statechange', onStateChange);
  });
}
async function ensureMessagingServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!canUsePushMessaging()) return null;
  try {
    let registration = await navigator.serviceWorker.getRegistration('/').catch(() => null);
    if (!registration) {
      registration = await navigator.serviceWorker.getRegistration().catch(() => null);
    }
    if (!registration) {
      registration = await navigator.serviceWorker.register(APP_SW_PATH, { scope: '/' }).catch(() => null);
    }
    if (!registration) {
      registration = await navigator.serviceWorker.ready.catch(() => null);
    }
    if (!registration) {
      console.warn('[FCM] no service worker registration available for messaging');
      return null;
    }
    await waitForServiceWorkerActivation(registration);
    registration.update().catch(() => { });
    return registration;
  } catch (e) {
    console.error('[FCM] ensureMessagingServiceWorkerRegistration:', e);
    return null;
  }
}
async function deleteCurrentBrowserPushToken(): Promise<void> {
  const msg = getMessagingInstance();
  if (!msg) return;
  try {
    await deleteToken(msg);
  } catch (error) {
    console.warn('[FCM] deleteToken failed:', error);
  }
}
/**
 * يقرأ sessionToken المحفوظ للسكرتيرة من localStorage.
 * نستخدمه كـ auth fallback للـ callable عند انتهاء Firebase custom token.
 */
function readSecretarySessionToken(secret: string): string | undefined {
  if (typeof window === 'undefined' || !secret) return undefined;
  try {
    const key = `sec_auth_${secret}`;
    const token = localStorage.getItem(key);
    return token ? token.trim() || undefined : undefined;
  } catch {
    return undefined;
  }
}

async function getAndSaveFcmToken(
  role: 'doctor' | 'secretary' | 'public',
  targetId: string,
  saveFn: (id: string, token: string) => Promise<void>,
  branchId?: string
): Promise<PushSetupResult> {
  if (!targetId) return { ok: false, reason: 'missing-target' };
  // للسكرتيرة: نضيف branchId للـ inFlightKey عشان كل فرع له طلب مستقل
  const inFlightKey = role === 'secretary'
    ? `${role}:${targetId}:${(branchId || 'main').trim() || 'main'}`
    : `${role}:${targetId}`;
  const existingInFlight = pushSetupInFlight.get(inFlightKey);
  if (existingInFlight) {
    return existingInFlight;
  }
  const setupPromise = (async (): Promise<PushSetupResult> => {
    if (!canUsePushMessaging()) {
      console.warn('[FCM] unsupported environment for push');
      return { ok: false, reason: 'unsupported' };
    }
    const msg = getMessagingInstance();
    if (!msg) {
      console.warn('[FCM] messaging instance unavailable');
      return { ok: false, reason: 'messaging-unavailable' };
    }
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        console.warn('[FCM] notification permission denied by user');
        return { ok: false, reason: 'permission-denied', permission };
      }
      const registration = await ensureMessagingServiceWorkerRegistration();
      if (!registration) {
        console.warn('[FCM] service worker registration unavailable');
        return { ok: false, reason: 'sw-registration-failed' };
      }
      const vapidKey = getVapidKey();
      const registrationCandidates: ServiceWorkerRegistration[] = [];
      const seenRegistrationKeys = new Set<string>();
      const pushRegistrationCandidate = (candidate: ServiceWorkerRegistration | null | undefined) => {
        if (!candidate) return;
        const scope = String(candidate.scope || '').trim();
        if (!scope) return;
        const key = `${scope}::${String(candidate.active?.scriptURL || '')}`;
        if (seenRegistrationKeys.has(key)) return;
        seenRegistrationKeys.add(key);
        registrationCandidates.push(candidate);
      };
      if ('serviceWorker' in navigator) {
        try {
          const readyRegistration = await navigator.serviceWorker.ready;
          pushRegistrationCandidate(readyRegistration);
        } catch {
        }
      }
      pushRegistrationCandidate(registration);
      const tokenResult = await getFcmTokenWithRetries(msg, registrationCandidates, vapidKey);
      if (!tokenResult.token) {
        console.warn('[FCM] token extraction failed (empty token):', {
          code: tokenResult.errorCode,
          message: tokenResult.errorMessage,
          scope: tokenResult.errorScope,
        });
        return {
          ok: false,
          reason: 'token-empty',
          permission,
          debugCode: tokenResult.errorCode,
          debugMessage: tokenResult.errorMessage,
          debugScope: tokenResult.errorScope,
        };
      }
      const token = tokenResult.token;
      // للسكرتيرة: نقرأ الـ sessionToken من localStorage كـ auth fallback
      // (مفيد عند انتهاء Firebase custom token — السكرتيرة لا تُعيد login تلقائياً).
      const secretarySessionToken = role === 'secretary' ? readSecretarySessionToken(targetId) : undefined;
      const callableSaved = await saveTokenViaCallable(role, targetId, token, branchId, secretarySessionToken);
      if (!callableSaved) {
        if (role === 'secretary') {
          console.warn('[FCM] Secretary token registration failed via callable', {
            secret: targetId,
            branchId,
            hasSessionToken: Boolean(secretarySessionToken),
            hasFirebaseAuth: Boolean(auth.currentUser),
          });
          return { ok: false, reason: 'save-failed', permission, token };
        }
        let saveSucceeded = false;
        try {
          await saveFn(targetId, token);
          saveSucceeded = true;
        } catch (saveError) {
          console.error('[FCM] save token failed:', saveError);
        }
        if (!saveSucceeded) {
          return { ok: false, reason: 'save-failed', permission, token };
        }
      }
      cachePushToken(role, targetId, token);
      return { ok: true, permission, token };
    } catch (e) {
      console.error('[FCM] getAndSaveFcmToken:', e);
      return { ok: false, reason: 'unknown' };
    }
  })();
  pushSetupInFlight.set(inFlightKey, setupPromise);
  try {
    return await setupPromise;
  } finally {
    pushSetupInFlight.delete(inFlightKey);
  }
}
export async function requestPermissionAndSaveToken(userId: string): Promise<boolean> {
  const result = await getAndSaveFcmToken('doctor', userId, (id, token) => firestoreService.saveFcmToken(id, token));
  return result.ok;
}
export async function requestPermissionAndSaveTokenForPublic(userId: string): Promise<boolean> {
  const result = await getAndSaveFcmToken('public', userId, (id, token) => firestoreService.savePublicFcmToken(id, token));
  return result.ok;
}
export async function requestPermissionAndSaveTokenForSecretary(secret: string, branchId?: string): Promise<boolean> {
  const result = await getAndSaveFcmToken(
    'secretary',
    secret,
    (id, token) => firestoreService.saveSecretaryFcmToken(id, token, branchId),
    branchId,
  );
  return result.ok;
}
export async function requestPermissionAndSaveTokenWithDetails(userId: string): Promise<PushSetupResult> {
  return getAndSaveFcmToken('doctor', userId, (id, token) => firestoreService.saveFcmToken(id, token));
}
export async function requestPermissionAndSaveTokenForPublicWithDetails(userId: string): Promise<PushSetupResult> {
  return getAndSaveFcmToken('public', userId, (id, token) => firestoreService.savePublicFcmToken(id, token));
}
export async function requestPermissionAndSaveTokenForSecretaryWithDetails(secret: string, branchId?: string): Promise<PushSetupResult> {
  return getAndSaveFcmToken(
    'secretary',
    secret,
    (id, token) => firestoreService.saveSecretaryFcmToken(id, token, branchId),
    branchId,
  );
}
export async function unregisterPushTokenForDoctor(userId: string): Promise<void> {
  const targetId = String(userId || '').trim();
  if (!targetId) return;
  const cachedToken = readCachedPushToken('doctor', targetId);
  try {
    if (cachedToken) {
      await unregisterTokenViaCallable('doctor', targetId, cachedToken);
    }
  } finally {
    clearCachedPushToken('doctor', targetId);
    await deleteCurrentBrowserPushToken();
  }
}
export async function unregisterPushTokenForSecretary(secret: string): Promise<void> {
  const targetId = String(secret || '').trim();
  if (!targetId) return;
  const cachedToken = readCachedPushToken('secretary', targetId);
  try {
    if (cachedToken) {
      await unregisterTokenViaCallable('secretary', targetId, cachedToken);
    }
  } finally {
    clearCachedPushToken('secretary', targetId);
    await deleteCurrentBrowserPushToken();
  }
}
export async function unregisterPushTokenForPublic(userId: string): Promise<void> {
  const targetId = String(userId || '').trim();
  if (!targetId) return;
  const cachedToken = readCachedPushToken('public', targetId);
  try {
    if (cachedToken) {
      await unregisterTokenViaCallable('public', targetId, cachedToken);
    }
  } finally {
    clearCachedPushToken('public', targetId);
    await deleteCurrentBrowserPushToken();
  }
}
export function onForegroundMessage(callback: (payload: unknown) => void): (() => void) | null {
  const msg = getMessagingInstance();
  if (!msg) return null;
  try {
    const unsubscribe = onMessage(msg, (payload) => callback(payload));
    return () => unsubscribe();
  } catch {
    return null;
  }
}


