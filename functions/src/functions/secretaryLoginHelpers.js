const nodeCrypto = require('crypto');
const { loadUnifiedDoctorProfile } = require('../profileStore');
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizeText = (value) => String(value || '').trim();
const SECRET_PATTERN = /^b_[a-z0-9]{10,120}$/i;
const normalizeSecret = (value) => {
  const normalized = normalizeText(value);
  if (!normalized || normalized.includes('/')) return '';
  return SECRET_PATTERN.test(normalized) ? normalized : '';
};
const timingSafeHexEqual = (a, b) => {
  const aa = String(a || '');
  const bb = String(b || '');
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) {
    diff |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  }
  return diff === 0;
};
const simpleHash = (password) => {
  let hash = 5381;
  const str = String(password || '') + '_drh_booking_2024';
  for (let i = 0; i < str.length; i += 1) {
    hash = (((hash << 5) + hash) + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  let result = Math.abs(hash >>> 0).toString(16).padStart(8, '0');
  for (let round = 0; round < 3; round += 1) {
    hash = 5381;
    const roundStr = `${result}_r${round}_drh`;
    for (let i = 0; i < roundStr.length; i += 1) {
      hash = (((hash << 5) + hash) + roundStr.charCodeAt(i)) & 0xFFFFFFFF;
    }
    result += Math.abs(hash >>> 0).toString(16).padStart(8, '0');
  }
  return `dh_${result}`;
};
const parsePbkdf2Hash = (storedHash) => {
  const parts = String(storedHash || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'dh2') return null;
  const iterations = Number.parseInt(parts[1], 10);
  const saltHex = parts[2];
  const hashHex = parts[3];
  if (!Number.isFinite(iterations) || iterations < 10000) return null;
  if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) return null;
  return {
    iterations,
    saltHex: saltHex.toLowerCase(),
    hashHex: hashHex.toLowerCase(),
  };
};
const hashSecretaryPassword = (plainPassword) => {
  const password = String(plainPassword || '');
  const iterations = 150000;
  const saltHex = nodeCrypto.randomBytes(16).toString('hex');
  const hashHex = nodeCrypto
    .pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), iterations, 32, 'sha256')
    .toString('hex');
  return `dh2$${iterations}$${saltHex}$${hashHex}`;
};
const verifySecretaryPassword = (plainPassword, storedHash) => {
  const password = String(plainPassword || '');
  const normalizedStored = String(storedHash || '').trim();
  if (!normalizedStored) return false;
  const parsed = parsePbkdf2Hash(normalizedStored);
  if (parsed) {
    const derived = nodeCrypto.pbkdf2Sync(
      password,
      Buffer.from(parsed.saltHex, 'hex'),
      parsed.iterations,
      32,
      'sha256'
    ).toString('hex');
    return timingSafeHexEqual(derived, parsed.hashHex);
  }
  return simpleHash(password) === normalizedStored;
};
const generateSessionToken = () => {
  const randomHex = nodeCrypto.randomBytes(32).toString('hex');
  return `st:${randomHex}`;
};
const SECRETARY_LOGIN_RATE_LIMIT_COLLECTION = 'secretaryLoginRateLimit';
// نافذة عدّ المحاولات الفاشلة (لو عدّت من غير ما تتجاوز الحد، العداد بيتصفّر)
const SECRETARY_LOGIN_WINDOW_MS = 15 * 60 * 1000;
// مدة الحظر بعد تجاوز عدد المحاولات: ربع ساعة
const SECRETARY_LOGIN_BLOCK_MS = 15 * 60 * 1000;
// أقصى عدد محاولات فاشلة قبل الحظر
const SECRETARY_LOGIN_MAX_FAILED_ATTEMPTS = 10;
const SECRETARY_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const timestampToMs = (value) =>
  value && typeof value.toMillis === 'function' ? value.toMillis() : 0;
const buildRateLimitKey = (doctorEmail, secret) =>
  doctorEmail ? `email_${doctorEmail}` : `secret_${secret}`;
const toIsoDateString = (value) => {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
    return value;
  }
  if (typeof value?.toDate === 'function') {
    const asDate = value.toDate();
    if (asDate instanceof Date && !Number.isNaN(asDate.getTime())) {
      return asDate.toISOString();
    }
  }
  const millis = timestampToMs(value);
  if (millis > 0) return new Date(millis).toISOString();
  return '';
};
const toPositiveFileNumber = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};
const assertDoctorAccountIsActiveForSecretaryLogin = async ({
  db,
  userId,
  doctorEmail,
  HttpsError,
}) => {
  const normalizedUserId = normalizeText(userId);
  const normalizedDoctorEmail = normalizeEmail(doctorEmail);
  let doctorData = {};
  if (normalizedUserId) {
    const doctorProfile = await loadUnifiedDoctorProfile({ db, userId: normalizedUserId });
    if (doctorProfile.exists) {
      doctorData = doctorProfile.mergedData || {};
    }
  }
  const effectiveDoctorEmail =
    normalizedDoctorEmail || normalizeEmail(doctorData.doctorEmail);
  if (effectiveDoctorEmail) {
    const blacklistSnap = await db.collection('blacklistedEmails').doc(effectiveDoctorEmail).get();
    if (blacklistSnap.exists) {
      const blacklistData = blacklistSnap.data() || {};
      throw new HttpsError('permission-denied', 'DOCTOR_ACCOUNT_BLACKLISTED', {
        status: 'DOCTOR_ACCOUNT_BLACKLISTED',
        doctorEmail: effectiveDoctorEmail,
        reason: normalizeText(blacklistData.reason),
        blockedAt: toIsoDateString(blacklistData.blockedAt),
      });
    }
  }
  if (doctorData.isAccountDisabled === true) {
    throw new HttpsError('permission-denied', 'DOCTOR_ACCOUNT_DISABLED', {
      status: 'DOCTOR_ACCOUNT_DISABLED',
      userId: normalizedUserId,
      doctorEmail: effectiveDoctorEmail,
      disabledReason: normalizeText(doctorData.disabledReason),
    });
  }
};
const readLegacyAuthFromBookingConfig = (configData) => {
  const legacyHash = typeof configData?.secretaryPasswordHash === 'string' ? normalizeText(configData.secretaryPasswordHash) : '';
  const legacyPlain = typeof configData?.secretaryPassword === 'string' ? normalizeText(configData.secretaryPassword) : '';
  const legacySession = typeof configData?.secretarySessionToken === 'string' ? normalizeText(configData.secretarySessionToken) : '';
  const legacySessionUpdatedAt = timestampToMs(configData?.secretarySessionTokenUpdatedAt);
  return { legacyHash, legacyPlain, legacySession, legacySessionUpdatedAt };
};
const readSecretaryAuthData = async ({
  db,
  admin,
  secret,
  userId,
  doctorEmail,
  configData,
}) => {
  const authRef = db.collection('secretaryAuth').doc(secret);
  const authSnap = await authRef.get();
  const authData = authSnap.exists ? (authSnap.data() || {}) : {};
  let secretaryPasswordHash =
    typeof authData.secretaryPasswordHash === 'string'
      ? normalizeText(authData.secretaryPasswordHash)
      : '';
  let secretarySessionToken =
    typeof authData.secretarySessionToken === 'string'
      ? normalizeText(authData.secretarySessionToken)
      : '';
  let secretarySessionTokenUpdatedAtMs = timestampToMs(authData.secretarySessionTokenUpdatedAt);
  if (!secretaryPasswordHash && !secretarySessionToken) {
    const legacy = readLegacyAuthFromBookingConfig(configData || {});
    if (legacy.legacyHash) secretaryPasswordHash = legacy.legacyHash;
    if (!secretaryPasswordHash && legacy.legacyPlain) {
      secretaryPasswordHash = hashSecretaryPassword(legacy.legacyPlain);
    }
    if (legacy.legacySession) {
      secretarySessionToken = legacy.legacySession;
      secretarySessionTokenUpdatedAtMs = legacy.legacySessionUpdatedAt;
    }
    if (secretaryPasswordHash || secretarySessionToken) {
      const authWrite = {
        userId,
        doctorEmail: doctorEmail || admin.firestore.FieldValue.delete(),
        secretaryPasswordHash: secretaryPasswordHash || admin.firestore.FieldValue.delete(),
        secretarySessionToken: secretarySessionToken || admin.firestore.FieldValue.delete(),
        secretarySessionTokenUpdatedAt:
          secretarySessionTokenUpdatedAtMs > 0
            ? admin.firestore.Timestamp.fromMillis(secretarySessionTokenUpdatedAtMs)
            : admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await authRef.set(authWrite, { merge: true });
      await db.collection('bookingConfig').doc(secret).set(
        {
          secretaryAuthRequired: Boolean(secretaryPasswordHash),
          secretaryPasswordHash: admin.firestore.FieldValue.delete(),
          secretarySessionToken: admin.firestore.FieldValue.delete(),
          secretarySessionTokenUpdatedAt: admin.firestore.FieldValue.delete(),
          secretaryPassword: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
  return {
    authRef,
    secretaryPasswordHash,
    secretarySessionToken,
    secretarySessionTokenUpdatedAtMs,
  };
};
const assertSecretarySessionIfRequired = ({
  auth,
  sessionToken,
  HttpsError,
}) => {
  if (!auth.secretaryPasswordHash) return;
  if (!sessionToken || !auth.secretarySessionToken || auth.secretarySessionToken !== sessionToken) {
    throw new HttpsError('unauthenticated', 'INVALID_SESSION_TOKEN');
  }
  if (
    !auth.secretarySessionTokenUpdatedAtMs ||
    (Date.now() - auth.secretarySessionTokenUpdatedAtMs) > SECRETARY_SESSION_MAX_AGE_MS
  ) {
    throw new HttpsError('unauthenticated', 'SECRETARY_SESSION_EXPIRED');
  }
};
const {
  DEFAULT_BRANCH_ID,
  assertSecretarySessionForBranch: assertBranchSessionBase,
  tryMatchSecretaryPasswordAcrossBranches,
  hasAnySecretaryPassword,
  assertBranchBelongsToDoctor,
} = require('./secretaryBranchAuth');
const assertSecretarySessionForBranch = (args) =>
  assertBranchSessionBase({ ...args, legacyAssertFn: assertSecretarySessionIfRequired });

const normalizeOptionalText = (value) => {
  const normalized = normalizeText(value);
  return normalized || '';
};

module.exports = {
  normalizeEmail,
  normalizeText,
  normalizeSecret,
  SECRET_PATTERN,
  timingSafeHexEqual,
  simpleHash,
  parsePbkdf2Hash,
  hashSecretaryPassword,
  verifySecretaryPassword,
  generateSessionToken,
  SECRETARY_LOGIN_RATE_LIMIT_COLLECTION,
  SECRETARY_LOGIN_WINDOW_MS,
  SECRETARY_LOGIN_BLOCK_MS,
  SECRETARY_LOGIN_MAX_FAILED_ATTEMPTS,
  SECRETARY_SESSION_MAX_AGE_MS,
  timestampToMs,
  buildRateLimitKey,
  toIsoDateString,
  toPositiveFileNumber,
  assertDoctorAccountIsActiveForSecretaryLogin,
  readLegacyAuthFromBookingConfig,
  readSecretaryAuthData,
  assertSecretarySessionIfRequired,
  DEFAULT_BRANCH_ID,
  tryMatchSecretaryPasswordAcrossBranches,
  hasAnySecretaryPassword,
  assertBranchBelongsToDoctor,
  assertSecretarySessionForBranch,
  normalizeOptionalText,
};
