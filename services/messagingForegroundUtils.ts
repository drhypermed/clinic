import { playNotificationCue } from '../utils/notificationSound';

const toObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const toStringSafe = (value: unknown): string => String(value == null ? '' : value).trim();

interface PushNotificationCloseContext {
  type?: string;
  appointmentId?: string;
  secret?: string;
}

const normalizeLower = (value: unknown): string => toStringSafe(value).toLowerCase();

const resolveForegroundEventType = (data: Record<string, unknown>): string => {
  const explicitType = normalizeLower(data.type);
  if (explicitType) return explicitType;
  const dhAction = normalizeLower(data.dh_action);
  if (dhAction === 'secretary_entry_response') return 'doctor_entry_request';
  if (dhAction === 'doctor_entry_response') return 'secretary_entry_request';
  return '';
};

const resolveForegroundSoundCue = (data: Record<string, unknown>) => {
  const eventType = resolveForegroundEventType(data);
  const status = normalizeLower(data.status);

  if (eventType === 'new_appointment') return 'new_appointment' as const;
  if (eventType === 'doctor_entry_request' || eventType === 'secretary_entry_request') {
    return 'entry_request' as const;
  }
  if (eventType === 'doctor_entry_response') {
    return status === 'rejected' ? ('entry_response_wait' as const) : ('entry_response_approved' as const);
  }
  return 'info' as const;
};

const getNotificationDataString = (notification: Notification, key: string): string => {
  const data = toObject((notification as Notification & { data?: unknown }).data);
  return toStringSafe(data[key]);
};

const notificationMatchesContext = (
  notification: Notification,
  context: Required<PushNotificationCloseContext>
): boolean => {
  const type = getNotificationDataString(notification, 'type');
  const appointmentId = getNotificationDataString(notification, 'appointmentId');
  const secret = getNotificationDataString(notification, 'secret');

  if (context.type && normalizeLower(type) !== normalizeLower(context.type)) return false;
  if (context.appointmentId && appointmentId !== context.appointmentId) return false;
  if (context.secret && normalizeLower(secret) !== normalizeLower(context.secret)) return false;
  return true;
};

/**
 * إغلاق الإشعارات الخارجية (System Notifications) المطابقة لسياق حدث محدد.
 * تُستخدم بعد تنفيذ إجراء (موافقة/رفض) حتى لا يبقى إشعار قديم ظاهرًا.
 */
export async function closePushNotificationsByContext(
  context: PushNotificationCloseContext
): Promise<number> {
  const normalizedContext: Required<PushNotificationCloseContext> = {
    type: toStringSafe(context.type),
    appointmentId: toStringSafe(context.appointmentId),
    secret: toStringSafe(context.secret),
  };

  if (!normalizedContext.type && !normalizedContext.appointmentId && !normalizedContext.secret) {
    return 0;
  }

  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return 0;

  try {
    let registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
    if (!registrations.length) {
      const fallback = await navigator.serviceWorker.getRegistration('/').catch(() => null);
      if (fallback) registrations = [fallback];
    }

    let closedCount = 0;
    for (const registration of registrations) {
      if (!registration || typeof registration.getNotifications !== 'function') continue;
      const notifications = await registration.getNotifications().catch(() => []);
      for (const notification of notifications) {
        if (!notificationMatchesContext(notification, normalizedContext)) continue;
        notification.close();
        closedCount += 1;
      }
    }
    return closedCount;
  } catch {
    return 0;
  }
}

/**
 * استخراج بيانات الإشعار من الهيكل المعقد لـ FCM
 */
const extractForegroundNotificationData = (payload: unknown): Record<string, unknown> => {
  const base = toObject(payload);
  const data = toObject(base.data);
  const notification = toObject(base.notification);
  const notificationData = toObject(notification.data);
  return {
    ...notificationData,
    ...data,
    ...base,
  };
};

/**
 * إظهار إشعار نظام حقيقي عندما يكون التطبيق مفتوحاً.
 * (إشعارات FCM تظهر تلقائياً فقط إذا كان التطبيق مغلقاً أو في الخلفية)
 */
export async function showForegroundSystemNotification(payload: unknown): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  const data = extractForegroundNotificationData(payload);
  const base = toObject(payload);
  const notification = toObject(base.notification);

  // تحديد العنوان والمحتوى
  const title =
    toStringSafe(data.title) ||
    toStringSafe(notification.title) ||
    'إشعار جديد';
  const body =
    toStringSafe(data.body) ||
    toStringSafe(notification.body) ||
    '';

  const url = toStringSafe(data.url) || toStringSafe(data.link) || '/';
  const icon = toStringSafe(data.icon) || '/pwa-192x192.png';
  const badge = toStringSafe(data.badge) || '/pwa-192x192.png';
  const tag = toStringSafe(data.tag) || `fg_${Date.now()}`;

  const options: NotificationOptions = {
    body,
    icon,
    badge,
    tag,
    data: { url, link: url, ...data },
    silent: false,
  };

  try {
    // محاولة إظهار الإشعار عبر Service Worker (أفضل للأداء والتوافق)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, options);
        void playNotificationCue(resolveForegroundSoundCue(data));
        return true;
      }
    }
  } catch {
    // تجاهل الفشل والمحاولة بالطريقة التقليدية
  }

  try {
    // الطريقة التقليدية (Fallback) لإنشاء إشعار نظام
    const notificationInstance = new Notification(title, options);
    void playNotificationCue(resolveForegroundSoundCue(data));
    notificationInstance.onclick = () => {
      try {
        window.focus();
        const rawUrl = toStringSafe((options.data as Record<string, unknown> | undefined)?.url) || '/';
        // حماية من إعادة التوجيه لمواقع خارجية — نقبل المسارات الداخلية فقط
        const targetUrl = rawUrl.startsWith('/') ? rawUrl : '/';
        window.location.assign(targetUrl);
      } catch {
        // ignore
      }
    };
    return true;
  } catch {
    return false;
  }
}

