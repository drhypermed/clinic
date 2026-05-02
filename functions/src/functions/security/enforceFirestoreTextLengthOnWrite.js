const DEFAULT_MAX_TEXT_LENGTH = 1000;
const MAX_TRAVERSAL_DEPTH = 12;

const DEFAULT_SKIPPED_COLLECTIONS = Object.freeze([
  'admins',
  'blacklistedEmails',
  'publicBlacklistedEmails',
  'subscriptionPrices',
  'expenses',
  'settings',
  'appUpdateBroadcasts',
  'appUpdateRollouts',
]);

// subcollections يستحيل تحتوي على نصوص للمستخدم — تخطيها بيوفر آلاف الـ
// invocations يومياً (الحقول كلها appointmentId/branchId/tag/timestamp قصيرة).
const DEFAULT_SKIPPED_SUB_COLLECTIONS = Object.freeze([
  'dismissedBroadcasts',
  'dismissedAppointmentNotifications',
]);

const parsePositiveInt = (rawValue, fallback) => {
  const parsed = Number.parseInt(String(rawValue || ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const getTextMaxLength = () =>
  parsePositiveInt(process.env.USER_TEXT_MAX_LENGTH, DEFAULT_MAX_TEXT_LENGTH);

const getSkippedCollections = () => {
  const fromEnv = String(process.env.TEXT_LENGTH_SKIP_COLLECTIONS || '')
    .split(',')
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return new Set([...DEFAULT_SKIPPED_COLLECTIONS, ...fromEnv]);
};

const getSkippedSubCollections = () => {
  const fromEnv = String(process.env.TEXT_LENGTH_SKIP_SUB_COLLECTIONS || '')
    .split(',')
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return new Set([...DEFAULT_SKIPPED_SUB_COLLECTIONS, ...fromEnv]);
};

const isPlainObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const sanitizeValue = (value, maxLength, depth) => {
  if (depth > MAX_TRAVERSAL_DEPTH) {
    return {
      changed: false,
      sanitized: value,
      patch: undefined,
    };
  }

  if (typeof value === 'string') {
    if (value.length <= maxLength) {
      return {
        changed: false,
        sanitized: value,
        patch: undefined,
      };
    }

    const truncated = value.slice(0, maxLength);
    return {
      changed: true,
      sanitized: truncated,
      patch: truncated,
    };
  }

  if (Array.isArray(value)) {
    let changed = false;
    const sanitizedArray = value.map((item) => {
      const nested = sanitizeValue(item, maxLength, depth + 1);
      if (nested.changed) changed = true;
      return nested.sanitized;
    });

    return {
      changed,
      sanitized: changed ? sanitizedArray : value,
      patch: changed ? sanitizedArray : undefined,
    };
  }

  if (!isPlainObject(value)) {
    return {
      changed: false,
      sanitized: value,
      patch: undefined,
    };
  }

  let changed = false;
  const sanitizedObject = {};
  const patchObject = {};

  Object.entries(value).forEach(([key, item]) => {
    const nested = sanitizeValue(item, maxLength, depth + 1);
    sanitizedObject[key] = nested.sanitized;

    if (nested.changed) {
      changed = true;
      patchObject[key] = nested.patch;
    }
  });

  return {
    changed,
    sanitized: changed ? sanitizedObject : value,
    patch: changed ? patchObject : undefined,
  };
};

module.exports = () => {
  return async (event) => {
    const snapshot = event?.data?.after;
    if (!snapshot || !snapshot.exists) return;

    const topCollection = String(event?.params?.collectionId || '').trim();
    const skippedCollections = getSkippedCollections();
    if (topCollection && skippedCollections.has(topCollection)) return;

    // تخطي subcollections التشغيلية (مفيش نصوص مستخدم فيها) — توفير invocations.
    const subCollection = String(event?.params?.subCollectionId || '').trim();
    if (subCollection) {
      const skippedSubCollections = getSkippedSubCollections();
      if (skippedSubCollections.has(subCollection)) return;
    }

    const currentData = snapshot.data();
    if (!isPlainObject(currentData)) return;

    const maxLength = getTextMaxLength();
    const result = sanitizeValue(currentData, maxLength, 0);

    if (!result.changed || !isPlainObject(result.patch) || Object.keys(result.patch).length === 0) {
      return;
    }

    await snapshot.ref.set(result.patch, { merge: true });
  };
};
