const {
  buildDoctorUserProfilePayload,
  loadUnifiedDoctorProfile,
  loadUnifiedUsageDoc,
} = require('../../profileStore');

module.exports = (context) => {
  const {
    HttpsError,
    getSmartRxConfig,
    getDb,
    admin,
    assertAdminRequest,
    getCairoDateKey,
    resolveDoctorAccountType,
    buildWhatsAppUrl,
  } = context;
  const BOOKING_QUOTA_RATE_LIMIT_COLLECTION = 'bookingQuotaRateLimit';
  const BOOKING_QUOTA_RATE_LIMIT_WINDOW_MS = 60 * 1000;
  const BOOKING_QUOTA_RATE_LIMIT_MAX_ATTEMPTS = 30;

  const normalizeRateLimitKeyPart = (value) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._:-]+/g, '_')
      .slice(0, 120);
    return normalized || 'na';
  };

  const buildBookingQuotaRateLimitDocId = ({ doctorId, secret, feature, ip }) => (
    [
      normalizeRateLimitKeyPart(feature),
      normalizeRateLimitKeyPart(doctorId),
      normalizeRateLimitKeyPart(secret),
      normalizeRateLimitKeyPart(ip),
    ].join('__')
  );

  const enforceUnauthBookingQuotaRateLimit = async ({ db, doctorId, secret, feature, request }) => {
    const rawForwardedFor = String(request?.rawRequest?.headers?.['x-forwarded-for'] || '');
    const forwardedIp = rawForwardedFor.split(',')[0]?.trim() || '';
    const directIp = String(request?.rawRequest?.ip || '').trim();
    const ip = forwardedIp || directIp || 'unknown';

    const nowMs = Date.now();
    const nowTs = admin.firestore.Timestamp.fromMillis(nowMs);
    const docId = buildBookingQuotaRateLimitDocId({ doctorId, secret, feature, ip });
    const rateRef = db.collection(BOOKING_QUOTA_RATE_LIMIT_COLLECTION).doc(docId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(rateRef);
      const data = snap.exists ? (snap.data() || {}) : {};
      const windowStartedAtMs =
        data.windowStartedAt && typeof data.windowStartedAt.toMillis === 'function'
          ? data.windowStartedAt.toMillis()
          : 0;
      const withinWindow = windowStartedAtMs > 0 && (nowMs - windowStartedAtMs) <= BOOKING_QUOTA_RATE_LIMIT_WINDOW_MS;
      const currentAttempts = withinWindow ? Number(data.attempts || 0) : 0;

      if (currentAttempts >= BOOKING_QUOTA_RATE_LIMIT_MAX_ATTEMPTS) {
        const retryAfterMs = Math.max(
          BOOKING_QUOTA_RATE_LIMIT_WINDOW_MS - (nowMs - windowStartedAtMs),
          0
        );
        throw new HttpsError('resource-exhausted', 'BOOKING_QUOTA_RATE_LIMITED', {
          retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        });
      }

      tx.set(rateRef, {
        doctorId,
        feature,
        ip,
        attempts: currentAttempts + 1,
        windowStartedAt: withinWindow ? (data.windowStartedAt || nowTs) : nowTs,
        lastAttemptAt: nowTs,
        // Optional TTL anchor if Firestore TTL policy is enabled for this collection.
        expiresAt: admin.firestore.Timestamp.fromMillis(nowMs + BOOKING_QUOTA_RATE_LIMIT_WINDOW_MS + 60 * 1000),
      }, { merge: true });
    });
  };

  

  const consumeBookingQuota = async (request) => {
    const feature = String(request?.data?.feature || '');
    if (feature !== 'publicBooking' && feature !== 'publicFormBooking' && feature !== 'secretaryEntryRequest') {
      throw new HttpsError('invalid-argument', 'Invalid feature');
    }

    const doctorId = String(request?.data?.doctorId || '').trim();
    const secret = String(request?.data?.secret || '').trim();
    if (!doctorId) {
      throw new HttpsError('invalid-argument', 'doctorId is required');
    }
    const authUid = String(request?.auth?.uid || '').trim();
    const isPublicUnauthFeature = feature === 'publicFormBooking' || feature === 'secretaryEntryRequest';

    // Hardening: unauthenticated calls are allowed only for explicitly public flows
    // and must prove ownership by passing a valid secret linked to the same doctorId.
    if (!authUid) {
      if (!isPublicUnauthFeature) {
        throw new HttpsError('unauthenticated', 'Authentication required');
      }
      if (!secret) {
        throw new HttpsError('invalid-argument', 'secret is required for unauthenticated booking quota');
      }
    }

    // If authenticated, check if it's the same doctor or an admin
    if (authUid && authUid !== doctorId) {
      try {
        await assertAdminRequest(request);
      } catch {
        throw new HttpsError('permission-denied', 'Not allowed to consume quota for another doctor');
      }
    }

    const db = getDb();
    if (!authUid && isPublicUnauthFeature) {
      const configCollection = feature === 'publicFormBooking' ? 'publicBookingConfig' : 'bookingConfig';
      const secretSnap = await db.collection(configCollection).doc(secret).get();
      const secretOwnerId = secretSnap.exists ? String(secretSnap.data()?.userId || '').trim() : '';
      if (!secretOwnerId || secretOwnerId !== doctorId) {
        throw new HttpsError('permission-denied', 'secret does not match doctorId');
      }

      // Throttle anonymous quota-consumption attempts per secret+doctor+feature+IP.
      await enforceUnauthBookingQuotaRateLimit({ db, doctorId, secret, feature, request });
    }

    const config = await getSmartRxConfig();
    const dayKey = getCairoDateKey(new Date());
    const usageDocId = `${feature}-${dayKey}`;

    const result = await db.runTransaction(async (tx) => {
      const doctorProfile = await loadUnifiedDoctorProfile({ db, userId: doctorId, tx });
      if (!doctorProfile.exists) {
        throw new HttpsError('not-found', 'Doctor account not found');
      }

      const accountType = resolveDoctorAccountType(doctorProfile.mergedData);

      if (!doctorProfile.userSnap.exists) {
        tx.set(doctorProfile.userRef, buildDoctorUserProfilePayload({
          uid: doctorId,
          accountType,
          premiumStartDate: typeof doctorProfile.mergedData?.premiumStartDate === 'string' ? doctorProfile.mergedData.premiumStartDate : null,
          premiumExpiryDate: typeof doctorProfile.mergedData?.premiumExpiryDate === 'string' ? doctorProfile.mergedData.premiumExpiryDate : null,
          doctorName: typeof doctorProfile.mergedData?.doctorName === 'string' ? doctorProfile.mergedData.doctorName : '',
          doctorEmail: typeof doctorProfile.mergedData?.doctorEmail === 'string'
            ? doctorProfile.mergedData.doctorEmail
            : (typeof doctorProfile.mergedData?.email === 'string' ? doctorProfile.mergedData.email : ''),
          syncedFromLegacyDoctorAt: admin.firestore.FieldValue.serverTimestamp(),
        }), { merge: true });
      }
      const limitReachedMessage = accountType === 'premium'
        ? (feature === 'publicBooking'
          ? config.premiumPublicBookingLimitMessage
          : feature === 'publicFormBooking'
            ? config.premiumPublicFormBookingLimitMessage
            : config.premiumSecretaryEntryRequestLimitMessage)
        : (feature === 'publicBooking'
          ? config.freePublicBookingLimitMessage
          : feature === 'publicFormBooking'
            ? config.freePublicFormBookingLimitMessage
            : config.freeSecretaryEntryRequestLimitMessage);
      const whatsappMessage = accountType === 'premium'
        ? (feature === 'publicBooking'
          ? config.premiumPublicBookingWhatsappMessage
          : feature === 'publicFormBooking'
            ? config.premiumPublicFormBookingWhatsappMessage
            : config.premiumSecretaryEntryRequestWhatsappMessage)
        : (feature === 'publicBooking'
          ? config.freePublicBookingWhatsappMessage
          : feature === 'publicFormBooking'
            ? config.freePublicFormBookingWhatsappMessage
            : config.freeSecretaryEntryRequestWhatsappMessage);
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

      const limit = feature === 'publicBooking'
        ? (accountType === 'premium' ? config.premiumPublicBookingDailyLimit : config.freePublicBookingDailyLimit)
        : feature === 'publicFormBooking'
          ? (accountType === 'premium' ? config.premiumPublicFormBookingDailyLimit : config.freePublicFormBookingDailyLimit)
          : (accountType === 'premium' ? config.premiumSecretaryEntryRequestDailyLimit : config.freeSecretaryEntryRequestDailyLimit);

      const fieldName = feature === 'publicBooking'
        ? 'publicBookingCount'
        : feature === 'publicFormBooking'
          ? 'publicFormBookingCount'
          : 'secretaryEntryRequestCount';
      const usageDoc = await loadUnifiedUsageDoc({ db, userId: doctorId, usageDocId, tx });
      const used = Number(usageDoc.mergedUsageData?.[fieldName] || 0);

      if (used >= limit) {
        throw new HttpsError('resource-exhausted', 'BOOKING_DAILY_LIMIT_REACHED', {
          accountType,
          feature,
          limit,
          used,
          remaining: 0,
          dayKey,
          whatsappNumber: config.whatsappNumber,
          whatsappUrl,
          limitReachedMessage,
          whatsappMessage,
        });
      }

      const nextUsed = used + 1;
      tx.set(usageDoc.userUsageRef, {
        doctorId,
        dayKey,
        accountType,
        feature,
        [fieldName]: nextUsed,
        limitApplied: limit,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: usageDoc.userUsageSnap.exists
          ? usageDoc.userUsageSnap.data()?.createdAt || admin.firestore.FieldValue.serverTimestamp()
          : usageDoc.mergedUsageData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      return {
        accountType,
        feature,
        limit,
        used: nextUsed,
        remaining: Math.max(limit - nextUsed, 0),
        dayKey,
        whatsappNumber: config.whatsappNumber,
        whatsappUrl,
        limitReachedMessage,
        whatsappMessage,
      };
    });

    return result;
  };

  
  return consumeBookingQuota;
};
