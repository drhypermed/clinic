/**
 * الملف: internalToastStorage.ts
 * الوصف: نظام "التخزين المؤقت للإشعارات" (Toast Persistence). 
 * صُمم هذا النظام لإيجاد حل لمشكلة ضياع التنبيهات عند تحديث الصفحة (Refresh)؛ 
 * فعندما يتلقى الطبيب طلباً من السكرتارية، يُخزن هذا الطلب في LocalStorage 
 * مع "وقت انتهاء" (Expiration) محدد، لضمان استمراره حتى لو أغلقت النافذة 
 * وفتحتها مرة أخرى، طالما لم تنتهي المدة المحددة للظهور.
 */
export const INTERNAL_TOAST_MIN_VISIBLE_MS = 10 * 1000; // 10 seconds instead of 30


type TimedPayload<T> = {
  value: T;
  expiresAt: number;
};

type SecretaryHandledEntryAlertMarker = {
  appointmentId: string;
  createdAt: string;
  status: 'approved' | 'rejected';
  handledAt: string;
};

const canUseStorage = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const persistTimedPayload = <T>(
  storageKey: string,
  value: T,
  durationMs = INTERNAL_TOAST_MIN_VISIBLE_MS
): number => {
  const expiresAt = Date.now() + Math.max(0, durationMs);
  if (!canUseStorage()) return expiresAt;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ value, expiresAt }));
  } catch {
    // ignore storage failures
  }
  return expiresAt;
};

export const readTimedPayload = <T>(
  storageKey: string,
  validator: (value: unknown) => value is T
): TimedPayload<T> | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TimedPayload<unknown>>;
    const expiresAt = Number(parsed?.expiresAt || 0);
    const value = parsed?.value;
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !validator(value)) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return { value, expiresAt };
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export const clearTimedPayload = (storageKey: string): void => {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore storage failures
  }
};

export const buildSecretaryActionToastKey = (secret: string): string =>
  `dh_secretary_action_toast_${secret}`;

export const buildDoctorSecretaryResponseToastKey = (bookingSecret: string): string =>
  `dh_doctor_secretary_response_toast_${bookingSecret}`;

export const buildDoctorNewAppointmentToastKey = (userId: string): string =>
  `dh_doctor_new_appointment_toast_${userId}`;

const buildSecretaryHandledEntryAlertKey = (secret: string): string =>
  `dh_secretary_handled_entry_alert_${secret}`;

const isSecretaryHandledEntryAlertMarker = (
  value: unknown
): value is SecretaryHandledEntryAlertMarker => {
  if (!value || typeof value !== 'object') return false;
  const marker = value as Partial<SecretaryHandledEntryAlertMarker>;
  return (
    typeof marker.appointmentId === 'string' &&
    typeof marker.createdAt === 'string' &&
    (marker.status === 'approved' || marker.status === 'rejected') &&
    typeof marker.handledAt === 'string'
  );
};

export const persistSecretaryHandledEntryAlert = (
  secret: string,
  marker: SecretaryHandledEntryAlertMarker
): void => {
  if (!canUseStorage()) return;
  const storageKey = buildSecretaryHandledEntryAlertKey(secret);
  try {
    localStorage.setItem(storageKey, JSON.stringify(marker));
  } catch {
    // ignore storage failures
  }
};

export const readSecretaryHandledEntryAlert = (
  secret: string
): SecretaryHandledEntryAlertMarker | null => {
  if (!canUseStorage()) return null;
  const storageKey = buildSecretaryHandledEntryAlertKey(secret);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isSecretaryHandledEntryAlertMarker(parsed)) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export const clearSecretaryHandledEntryAlert = (secret: string): void => {
  if (!canUseStorage()) return;
  const storageKey = buildSecretaryHandledEntryAlertKey(secret);
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore storage failures
  }
};

/**
 * نظام علامات "تم عرض الإشعار" (Seen Markers)
 * ─────────────────────────────────────────────────────
 * الهدف: لو الإشعار جه واختفى من الشاشة (سواء بأكشن أو بدون)، نمنع ظهوره تاني
 * في الجلسات اللاحقة طالما هو نفس الإشعار (نفس appointmentId + createdAt).
 *
 * الخزن محلي بـ TTL طويلة (7 أيام) حتى نمسك حالات reopen المتكررة.
 * لو الطبيب/السكرتارية عايزة ترد على إشعار قديم، السكرتيرة تضغط "إدخال الآن"
 * مرة أخرى (يُنشئ createdAt جديد → الإشعار الجديد ما بيتأثرش).
 */
const SEEN_NOTIFICATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const buildSeenNotificationKey = (
  scope: string,
  secret: string,
  appointmentId: string,
  createdAt: string
): string => `dh_seen_${scope}_${secret}_${appointmentId}_${createdAt}`;

/** تعليم إشعار كأنه ظهر مرة واحدة على الأقل (يمنع إعادة عرضه). */
export const markNotificationSeen = (
  scope: 'secretary_entry_req' | 'doctor_entry_alert',
  secret: string,
  appointmentId: string,
  createdAt: string
): void => {
  if (!secret || !appointmentId || !createdAt) return;
  persistTimedPayload(
    buildSeenNotificationKey(scope, secret, appointmentId, createdAt),
    true,
    SEEN_NOTIFICATION_TTL_MS
  );
};

/** فحص إذا كان الإشعار ظهر مسبقاً (استخدمه قبل استدعاء setState). */
export const wasNotificationSeen = (
  scope: 'secretary_entry_req' | 'doctor_entry_alert',
  secret: string,
  appointmentId: string,
  createdAt: string
): boolean => {
  if (!secret || !appointmentId || !createdAt) return false;
  const payload = readTimedPayload(
    buildSeenNotificationKey(scope, secret, appointmentId, createdAt),
    (v): v is true => v === true
  );
  return payload !== null;
};
