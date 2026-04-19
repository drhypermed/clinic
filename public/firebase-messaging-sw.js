/* eslint-disable no-restricted-globals */
// Firebase Messaging Service Worker for background notifications.
let messaging = null;

try {
  importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: 'AIzaSyAravOjVTZH-uSdvCPlkTv6GksUxjhNnRw',
      authDomain: 'www.drhypermed.com',
      projectId: 'gen-lang-client-0444130146',
      storageBucket: 'gen-lang-client-0444130146.firebasestorage.app',
      messagingSenderId: '244450975164',
      appId: '1:244450975164:web:409a582335e24d0c035fb9',
      measurementId: 'G-B0CEHS0YLV',
    });
  }

  messaging = firebase.messaging();
} catch (error) {
  // Graceful fallback when remote script/CDN response is invalid (e.g., HTML instead of JS).
  console.warn('[SW] Firebase Messaging bootstrap failed; background FCM disabled for this session.', error);
}
const recentNotificationTags = new Map();
const SECRETARY_VITAL_FIELDS = [
  { key: 'weight', label: 'الوزن' },
  { key: 'height', label: 'الطول' },
  { key: 'bmi', label: 'مؤشر الكتلة' },
  { key: 'rbs', label: 'سكر الدم' },
  { key: 'bp', label: 'ضغط الدم' },
  { key: 'pulse', label: 'النبض' },
  { key: 'temp', label: 'الحرارة' },
  { key: 'spo2', label: 'تشبع الاكسجين' },
  { key: 'rr', label: 'معدل التنفس' },
];

function toObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function toString(value) {
  return String(value == null ? '' : value).trim();
}

function extractSecretaryVitals(data) {
  const normalized = {};
  SECRETARY_VITAL_FIELDS.forEach(({ key }) => {
    const value = toString(data[`sv_${key}`]);
    if (!value) return;
    normalized[key] = value;
  });
  return normalized;
}

function buildSecretaryVitalsSummary(data) {
  const secretaryVitals = extractSecretaryVitals(data);
  const parts = SECRETARY_VITAL_FIELDS
    .map(({ key, label }) => {
      const value = toString(secretaryVitals[key]);
      if (!value) return '';
      return `${label}: ${value}`;
    })
    .filter(Boolean);
  return parts.join(' | ');
}

function getAbsoluteUrl(pathOrUrl) {
  try {
    return new URL(String(pathOrUrl || '/'), self.location.origin).href;
  } catch (_) {
    const raw = String(pathOrUrl || '/');
    return self.location.origin + (raw.startsWith('/') ? raw : '/' + raw);
  }
}

function normalizeAppUrlToCurrentOrigin(pathOrUrl) {
  try {
    const parsed = new URL(String(pathOrUrl || '/'), self.location.origin);
    const host = String(parsed.hostname || '').toLowerCase();
    if (host === 'drhypermed.com' || host === 'www.drhypermed.com') {
      parsed.protocol = self.location.protocol;
      parsed.host = self.location.host;
    }
    return parsed.toString();
  } catch (_) {
    return getAbsoluteUrl(pathOrUrl);
  }
}

function extractNotificationData(rawData) {
  const base = toObject(rawData);
  const fcmMsg = toObject(base.FCM_MSG);
  const fcmData = toObject(fcmMsg.data);
  const fcmNotification = toObject(fcmMsg.notification);
  const fcmNotificationData = toObject(fcmNotification.data);
  const nestedData = toObject(base.data);

  return {
    ...fcmData,
    ...fcmNotificationData,
    ...nestedData,
    ...base,
  };
}

function isDuplicateNotificationTag(tag) {
  const normalizedTag = toString(tag);
  if (!normalizedTag) return false;

  const now = Date.now();
  for (const [key, ts] of recentNotificationTags.entries()) {
    if (now - ts > 10000) recentNotificationTags.delete(key);
  }

  const lastShownAt = recentNotificationTags.get(normalizedTag) || 0;
  recentNotificationTags.set(normalizedTag, now);
  return now - lastShownAt < 3000;
}

function resolveEventType(data) {
  const explicitType = toString(data.type);
  if (explicitType) return explicitType;

  const dhAction = toString(data.dh_action);
  if (dhAction === 'secretary_entry_response') return 'doctor_entry_request';
  if (dhAction === 'doctor_entry_response') return 'secretary_entry_request';

  return '';
}

function buildDefaultNavigationLinkFromData(data) {
  const eventType = resolveEventType(data);
  const secret = toString(data.secret);
  const explicitPath = toString(data.path);
  if (explicitPath) return explicitPath;

  if (eventType === 'doctor_entry_request' && secret) return `/book/s/${secret}`;
  if (eventType === 'secretary_entry_request') return '/appointments';
  if (eventType === 'new_appointment') return '/appointments';
  if (eventType === 'doctor_entry_response' && secret) return `/book/s/${secret}`;

  return '/';
}

function buildInternalNotificationLink(data, baseLink, action) {
  const normalizedBaseLink = normalizeAppUrlToCurrentOrigin(baseLink || '/');
  const eventType = resolveEventType(data);
  const normalizedAction = toString(action);
  if (!eventType) return normalizedBaseLink;

  try {
    const url = new URL(normalizedBaseLink);
    url.searchParams.set('dh_open', 'push');
    url.searchParams.set('dh_type', eventType);
    url.searchParams.set('dh_ts', String(Date.now()));
    if (normalizedAction) {
      url.searchParams.set('dh_btn', normalizedAction);
    }

    const appointmentId = toString(data.appointmentId);
    const secret = toString(data.secret);
    const patientName = toString(data.patientName);
    const caseName = toString(data.caseName);
    const age = toString(data.age);
    const visitReason = toString(data.visitReason);
    const appointmentType = toString(data.appointmentType);
    const status = toString(data.status);
    const source = toString(data.source);
    const dateTime = toString(data.dateTime);

    if (appointmentId) url.searchParams.set('appointmentId', appointmentId);
    if (secret) url.searchParams.set('secret', secret);
    if (eventType === 'doctor_entry_request') {
      if (caseName || patientName) url.searchParams.set('caseName', caseName || patientName);
    } else if (eventType === 'secretary_entry_request') {
      if (patientName) url.searchParams.set('patientName', patientName);
      if (age) url.searchParams.set('age', age);
      if (visitReason) url.searchParams.set('visitReason', visitReason);
      if (appointmentType) url.searchParams.set('appointmentType', appointmentType);
    } else if (eventType === 'new_appointment') {
      if (patientName) url.searchParams.set('patientName', patientName);
      if (age) url.searchParams.set('age', age);
      if (visitReason) url.searchParams.set('visitReason', visitReason);
      if (appointmentType) url.searchParams.set('appointmentType', appointmentType);
      if (source) url.searchParams.set('source', source);
      if (dateTime) url.searchParams.set('dateTime', dateTime);
      SECRETARY_VITAL_FIELDS.forEach(({ key }) => {
        const vitalValue = toString(data[`sv_${key}`]);
        if (!vitalValue) return;
        url.searchParams.set(`sv_${key}`, vitalValue);
      });
    } else if (eventType === 'doctor_entry_response') {
      if (status) url.searchParams.set('status', status);
    }

    return url.toString();
  } catch (_) {
    return normalizedBaseLink;
  }
}

function resolveTypeSpecificCopy(data, fallbackTitle, fallbackBody) {
  const type = resolveEventType(data);
  const status = toString(data.status);
  const caseName = toString(data.caseName || data.patientName);

  if (type === 'doctor_entry_request') {
    return {
      title: caseName ? `الطبيب يطلب دخول حالة: ${caseName}` : 'طلب دخول حالة من الطبيب',
      body: 'افتح التطبيق الآن للرد بالموافقة أو الانتظار.',
    };
  }

  if (type === 'secretary_entry_request') {
    const patientName = caseName || 'مريض';
    const visitReason = toString(data.visitReason);
    const age = toString(data.age);
    const pieces = [patientName];
    if (age) pieces.push(`السن ${age}`);
    if (visitReason) pieces.push(visitReason);
    return {
      title: 'السكرتارية تطلب دخول حالة',
      body: pieces.join(' • '),
    };
  }

  if (type === 'doctor_entry_response') {
    if (status === 'approved') {
      return { title: 'تمت الموافقة على الدخول', body: 'يمكن إدخال الحالة الآن.' };
    }
    if (status === 'rejected') {
      return { title: 'الرجاء الانتظار قليلًا', body: 'الطبيب لم يسمح بالدخول الآن.' };
    }
  }

  if (type === 'new_appointment') {
    const rawSource = toString(data.source);
    const sourceLabel = rawSource === 'secretary' ? 'من السكرتارية' : 'من الفورم العام';
    const patientName = toString(data.patientName) || 'مريض';
    const age = toString(data.age);
    const visitReason = toString(data.visitReason);
    const secretaryVitalsSummary = buildSecretaryVitalsSummary(data);
    const dateTime = toString(data.dateTime);
    let dateTimeLabel = dateTime;
    if (dateTime) {
      try {
        const parsed = new Date(dateTime);
        if (!Number.isNaN(parsed.getTime())) {
          dateTimeLabel = parsed.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
        }
      } catch (_) {
        // ignore
      }
    }

    const parts = [patientName, sourceLabel];
  if (age) parts.push(`السن ${age}`);
  if (visitReason) parts.push(`السبب ${visitReason}`);
  if (secretaryVitalsSummary) parts.push(`القياسات والعلامات الحيوية: ${secretaryVitalsSummary}`);
    if (dateTimeLabel) parts.push(dateTimeLabel);

    return {
      title: 'موعد جديد',
      body: parts.join(' • '),
    };
  }

  return {
    title: fallbackTitle,
    body: fallbackBody,
  };
}

function showBackgroundNotification(payload) {
  const payloadObj = toObject(payload);
  const data = extractNotificationData(payloadObj.data || payloadObj);
  const eventType = resolveEventType(data);

  const fallbackTitle =
    toString(data.title) ||
    toString(payloadObj.notification && payloadObj.notification.title) ||
    'إشعار';
  const fallbackBody =
    toString(data.body) ||
    toString(payloadObj.notification && payloadObj.notification.body) ||
    'إشعار جديد';

  const normalizedCopy = resolveTypeSpecificCopy(data, fallbackTitle, fallbackBody);
  const title = normalizedCopy.title;
  const body = normalizedCopy.body;

  const defaultOpenLink = buildDefaultNavigationLinkFromData(data);
  const link =
    toString(data.url) ||
    toString(data.link) ||
    toString(payloadObj.fcmOptions && payloadObj.fcmOptions.link) ||
    defaultOpenLink ||
    '/';

  const icon = getAbsoluteUrl(toString(data.icon) || '/pwa-192x192.png');
  const badge = getAbsoluteUrl(toString(data.badge) || '/logo.png');
  const tag = toString(data.tag || data.type) || `n_${Date.now()}`;
  if (isDuplicateNotificationTag(tag)) return Promise.resolve();

  const actions = [{ action: 'dh_open_app', title: 'للمزيد ادخل التطبيق' }];

  const requireInteraction =
    eventType === 'doctor_entry_request' ||
    eventType === 'secretary_entry_request' ||
    eventType === 'new_appointment';

  const notificationOptions = {
    body,
    icon,
    badge,
    tag,
    renotify: true,
    requireInteraction,
    silent: false,
    vibrate: [200, 80, 200],
    lang: 'ar',
    dir: 'rtl',
    data: {
      url: link,
      link,
      type: eventType || '',
      secret: toString(data.secret),
      appointmentId: toString(data.appointmentId),
      caseName: toString(data.caseName),
      patientName: toString(data.patientName),
      age: toString(data.age),
      visitReason: toString(data.visitReason),
      appointmentType: toString(data.appointmentType),
      source: toString(data.source),
      dateTime: toString(data.dateTime),
      sv_weight: toString(data.sv_weight),
      sv_height: toString(data.sv_height),
      sv_bmi: toString(data.sv_bmi),
      sv_bp: toString(data.sv_bp),
      sv_pulse: toString(data.sv_pulse),
      sv_temp: toString(data.sv_temp),
      sv_rbs: toString(data.sv_rbs),
      sv_spo2: toString(data.sv_spo2),
      sv_rr: toString(data.sv_rr),
      status: toString(data.status),
      broadcastId: toString(data.broadcastId),
      defaultOpenLink: defaultOpenLink || '',
    },
    actions,
  };

  return self.registration.showNotification(title, notificationOptions);
}

if (messaging && typeof messaging.onBackgroundMessage === 'function') {
  messaging.onBackgroundMessage((payload) => showBackgroundNotification(payload));
}

self.addEventListener('push', (event) => {
  // Fallback path only. If Firebase messaging background handler is active,
  // handling both would display the same notification twice.
  if (messaging && typeof messaging.onBackgroundMessage === 'function') {
    return;
  }

  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (_) {
    payload = {};
  }

  event.waitUntil(showBackgroundNotification(payload));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawData = event.notification.data || {};
  const data = extractNotificationData(rawData);
  const eventType = resolveEventType(data);
  const action = toString(event.action);

  const defaultUrl =
    toString(data.url) ||
    toString(data.link) ||
    toString(data.defaultOpenLink) ||
    buildDefaultNavigationLinkFromData(data) ||
    '/';

  // Treat click on notification body and actions consistently, while preserving action intent.
  const targetUrl = buildInternalNotificationLink(data, defaultUrl, action);

  const absoluteTargetUrl = normalizeAppUrlToCurrentOrigin(targetUrl);

  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    let targetUrlObj;
    try {
      targetUrlObj = new URL(absoluteTargetUrl);
      if (targetUrlObj.origin !== self.location.origin) {
        console.warn('[SW] Blocked external URL from push notification:', absoluteTargetUrl);
        return;
      }
    } catch (_) {
      targetUrlObj = null;
    }

    if (targetUrlObj) {
      for (let i = 0; i < clientList.length; i += 1) {
        const client = clientList[i];
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === targetUrlObj.origin && clientUrl.pathname === targetUrlObj.pathname) {
            if (client.navigate) {
              const navigatedClient = await client.navigate(absoluteTargetUrl);
              if (navigatedClient && navigatedClient.focus) return navigatedClient.focus();
              if (navigatedClient) return navigatedClient;
            }
            return client.focus ? client.focus() : client;
          }
        } catch (_) {
          // ignore
        }
      }
    }

    for (let i = 0; i < clientList.length; i += 1) {
      const client = clientList[i];
      try {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin !== self.location.origin) continue;

        if (client.navigate) {
          try {
            const navigatedClient = await client.navigate(absoluteTargetUrl);
            if (navigatedClient && navigatedClient.focus) return navigatedClient.focus();
            if (navigatedClient) return navigatedClient;
            return client.focus ? client.focus() : client;
          } catch (_) {
            // ignore and keep searching
          }
        }

        return client.focus ? client.focus() : client;
      } catch (_) {
        // ignore
      }
    }

    if (self.clients.openWindow) {
      return self.clients.openWindow(absoluteTargetUrl);
    }

    return undefined;
  })());
});

// Keep lifecycle controlled by the primary app service worker (/sw.js).
