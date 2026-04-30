const {
  normalizeEmail,
  normalizeText,
  normalizeSecret,
  SECRET_PATTERN,
  timestampToMs,
  buildRateLimitKey,
  SECRETARY_LOGIN_RATE_LIMIT_COLLECTION,
  SECRETARY_LOGIN_WINDOW_MS,
  SECRETARY_LOGIN_BLOCK_MS,
  SECRETARY_LOGIN_MAX_FAILED_ATTEMPTS,
  assertDoctorAccountIsActiveForSecretaryLogin,
  readSecretaryAuthData,
  hashSecretaryPassword,
  verifySecretaryPassword,
  generateSessionToken,
  DEFAULT_BRANCH_ID,
  tryMatchSecretaryPasswordAcrossBranches,
  hasAnySecretaryPassword,
  assertBranchBelongsToDoctor,
  assertSecretarySessionForBranch,
  normalizeOptionalText,
} = require('./secretaryLoginHelpers');

module.exports = ({ HttpsError, getDb, admin, getCairoDateKey }) => {
  const secretaryLoginWithDoctorEmail = async (request) => {
    const doctorEmail = normalizeEmail(request?.data?.doctorEmail);
    const requestedSecret = normalizeSecret(request?.data?.secret);
    const secretaryPassword = normalizeText(request?.data?.secretaryPassword);
    if (!doctorEmail && !requestedSecret) {
      throw new HttpsError('invalid-argument', 'MISSING_LOGIN_IDENTIFIER');
    }
    if (doctorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorEmail)) {
      throw new HttpsError('invalid-argument', 'INVALID_DOCTOR_EMAIL');
    }
    if (requestedSecret && !SECRET_PATTERN.test(requestedSecret)) {
      throw new HttpsError('invalid-argument', 'INVALID_SECRET');
    }
    if (!secretaryPassword) {
      throw new HttpsError('invalid-argument', 'MISSING_SECRETARY_PASSWORD');
    }
    const db = getDb();
    const nowMs = Date.now();
    const nowTs = admin.firestore.Timestamp.fromMillis(nowMs);
    const rateLimitKey = buildRateLimitKey(doctorEmail, requestedSecret);
    const rateLimitRef = db.collection(SECRETARY_LOGIN_RATE_LIMIT_COLLECTION).doc(rateLimitKey);
    const registerFailedAttempt = async () => {
      try {
        const snap = await rateLimitRef.get();
        const data = snap.exists ? (snap.data() || {}) : {};
        const windowStartedAtMs = timestampToMs(data.windowStartedAt);
        const withinWindow =
          windowStartedAtMs > 0 && (nowMs - windowStartedAtMs) <= SECRETARY_LOGIN_WINDOW_MS;
        const currentFailed = withinWindow ? Number(data.failedAttempts || 0) : 0;
        const nextFailed = currentFailed + 1;
        const shouldBlock = nextFailed >= SECRETARY_LOGIN_MAX_FAILED_ATTEMPTS;

        await rateLimitRef.set(
          {
            key: rateLimitKey,
            failedAttempts: nextFailed,
            windowStartedAt: withinWindow ? (data.windowStartedAt || nowTs) : nowTs,
            lastFailedAt: nowTs,
            blockedUntil: shouldBlock
              ? admin.firestore.Timestamp.fromMillis(nowMs + SECRETARY_LOGIN_BLOCK_MS)
              : admin.firestore.FieldValue.delete(),
            updatedAt: nowTs,
          },
          { merge: true }
        );
      } catch (error) {
        console.warn('[secretaryLogin] Failed to update login rate limit state:', error?.message || error);
      }
    };

    const failWithRateLimit = async (code, message) => {
      await registerFailedAttempt();
      throw new HttpsError(code, message);
    };

    const rateLimitSnap = await rateLimitRef.get();
    if (rateLimitSnap.exists) {
      const rateData = rateLimitSnap.data() || {};
      const blockedUntilMs = timestampToMs(rateData.blockedUntil);
      if (blockedUntilMs > nowMs) {
        throw new HttpsError('resource-exhausted', 'TOO_MANY_SECRETARY_LOGIN_ATTEMPTS');
      }
    }

    const findSecretByUserId = async (uid) => {
      const normalizedUserId = normalizeText(uid);
      if (!normalizedUserId) return '';
      const cfgByUser = await db.collection('bookingConfig').where('userId', '==', normalizedUserId).limit(1).get();
      if (cfgByUser.empty) return '';
      return normalizeSecret(cfgByUser.docs[0].id);
    };

    let userId = '';
    let secret = '';
    let resolvedDoctorEmail = doctorEmail;
    let configData = {};

    if (requestedSecret) {
      secret = requestedSecret;
      const configSnap = await db.collection('bookingConfig').doc(secret).get();
      if (!configSnap.exists) {
        await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
      }

      configData = configSnap.data() || {};
      userId = normalizeText(configData.userId);
      if (!userId) {
        await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
      }

      const configDoctorEmail = normalizeEmail(configData.doctorEmail);
      resolvedDoctorEmail = configDoctorEmail || resolvedDoctorEmail;
      if (doctorEmail && configDoctorEmail && doctorEmail !== configDoctorEmail) {
        await failWithRateLimit('permission-denied', 'DOCTOR_EMAIL_SECRET_MISMATCH');
      }
    } else {
      const indexSnap = await db.collection('secretaryLoginIndex').doc(doctorEmail).get();
      if (indexSnap.exists) {
        const indexData = indexSnap.data() || {};
        userId = normalizeText(indexData.userId);
        secret = await findSecretByUserId(userId);
      }

      if (!userId || !secret) {
        const usersRef = db.collection('users');
        const [byDoctorEmail, byEmail] = await Promise.all([
          usersRef.where('doctorEmail', '==', doctorEmail).limit(1).get(),
          usersRef.where('email', '==', doctorEmail).limit(1).get(),
        ]);

        const matchedUser = byDoctorEmail.docs[0] || byEmail.docs[0];
        if (!matchedUser) {
          await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
        }

        userId = matchedUser.id;
        const userData = matchedUser.data() || {};
        secret = normalizeSecret(userData.bookingSecret);
        resolvedDoctorEmail = normalizeEmail(userData.doctorEmail) || doctorEmail;
        if (!secret) {
          secret = await findSecretByUserId(userId);
        }
      }

      if (!userId || !secret) {
        await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
      }

      const configSnap = await db.collection('bookingConfig').doc(secret).get();
      configData = configSnap.exists ? (configSnap.data() || {}) : {};
      if (!resolvedDoctorEmail) {
        resolvedDoctorEmail = normalizeEmail(configData.doctorEmail) || doctorEmail;
      }
    }

    await assertDoctorAccountIsActiveForSecretaryLogin({
      db,
      userId,
      doctorEmail: resolvedDoctorEmail || configData.doctorEmail,
      HttpsError,
    });

    const auth = await readSecretaryAuthData({
      db,
      admin,
      secret,
      userId,
      doctorEmail: resolvedDoctorEmail,
      configData,
    });

    const preferredBranchId = String(request?.data?.preferredBranchId || '').trim();
    const matchResult = await tryMatchSecretaryPasswordAcrossBranches({
      db, admin, auth, secret, userId, secretaryPassword, resolvedDoctorEmail,
      verifyPassword: verifySecretaryPassword,
      hashPassword: hashSecretaryPassword,
      generateSessionToken,
      nowMs,
      nowTs,
      HttpsError,
      preferredBranchId: preferredBranchId || undefined,
    });

    const matchedBranchId = matchResult?.matchedBranchId || null;
    const matchedSessionToken = matchResult?.sessionToken || null;
    const usedMainPath = matchResult?.usedMainPath || false;

    if (!matchedBranchId && !(await hasAnySecretaryPassword({ db, auth, secret, userId }))) {
      throw new HttpsError('failed-precondition', 'SECRETARY_PASSWORD_NOT_SET', {
        status: 'SECRETARY_PASSWORD_NOT_SET',
      });
    }

    if (!matchedBranchId) {
      await failWithRateLimit('permission-denied', 'INVALID_SECRETARY_PASSWORD');
    }

    await rateLimitRef.set(
      {
        failedAttempts: 0,
        blockedUntil: admin.firestore.FieldValue.delete(),
        windowStartedAt: nowTs,
        lastSuccessAt: nowTs,
        updatedAt: nowTs,
      },
      { merge: true }
    );

    if (resolvedDoctorEmail && usedMainPath) {
      await db.collection('secretaryLoginIndex').doc(resolvedDoctorEmail).set(
        {
          doctorEmail: resolvedDoctorEmail,
          userId,
          secret: admin.firestore.FieldValue.delete(),
          hasPasswordHash: true,
          updatedAt: nowTs,
        },
        { merge: true }
      );
    }

    let customAuthToken = '';
    try {
      const customAuthUid = `secretary:${secret}:${matchedBranchId || DEFAULT_BRANCH_ID}`;
      customAuthToken = await admin.auth().createCustomToken(customAuthUid, {
        role: 'secretary',
        secret,
        branchId: matchedBranchId || DEFAULT_BRANCH_ID,
        doctorUserId: userId,
      });
    } catch (tokenError) {
      console.warn('[secretaryLogin] Failed to mint custom auth token:', tokenError?.message || tokenError);
    }

    return {
      secret,
      userId,
      sessionToken: matchedSessionToken,
      branchId: matchedBranchId,
      customAuthToken, // Firebase Custom Token للاستخدام مع signInWithCustomToken
    };
  };

  const deleteAppointmentBySecretary = async (request) => {
    const userId = normalizeText(request?.data?.userId);
    const appointmentId = normalizeText(request?.data?.appointmentId);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = normalizeText(request?.data?.sessionToken);
    const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;

    if (!userId || !appointmentId || !secret) {
      throw new HttpsError('invalid-argument', 'MISSING_PARAMETERS');
    }

    const db = getDb();
    const configSnap = await db.collection('bookingConfig').doc(secret).get();
    if (!configSnap.exists) {
      throw new HttpsError('not-found', 'INVALID_CLINIC_SECRET');
    }

    const configData = configSnap.data() || {};
    if (configData.userId !== userId) {
      throw new HttpsError('permission-denied', 'SECRET_USER_MISMATCH');
    }

    const storedDoctorEmail = normalizeEmail(configData.doctorEmail);
    const auth = await readSecretaryAuthData({
      db,
      admin,
      secret,
      userId,
      doctorEmail: storedDoctorEmail,
      configData,
    });

    await assertSecretarySessionForBranch({ db, secret, mainAuth: auth, branchId, sessionToken, HttpsError });
    await assertBranchBelongsToDoctor({ db, userId, branchId, HttpsError });

    try {
      const aptRef = db.collection('users').doc(userId).collection('appointments').doc(appointmentId);
      const aptSnap = await aptRef.get();
      if (aptSnap.exists) {
        const aptBranchId = normalizeText(aptSnap.data()?.branchId) || DEFAULT_BRANCH_ID;
        if (aptBranchId !== branchId) {
          throw new HttpsError('permission-denied', 'APPOINTMENT_BRANCH_MISMATCH');
        }
      }
      await aptRef.delete();
      return { success: true };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error('[secretaryFunctions] Failed to delete appointment:', appointmentId, error);
      throw new HttpsError('internal', 'FAILED_TO_DELETE_APPOINTMENT');
    }
  };

  const normalizeAppointmentType = (value) => {
    const normalized = normalizeText(value).toLowerCase();
    return normalized === 'consultation' ? 'consultation' : 'exam';
  };

  const normalizePaymentType = (value) => {
    const normalized = normalizeText(value).toLowerCase();
    if (normalized === 'insurance') return 'insurance';
    if (normalized === 'discount') return 'discount';
    return 'cash';
  };

  const normalizeDiscountNumber = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.round(parsed * 100) / 100;
  };

  // تطبيع الجنس: نقبل بس 'male' أو 'female' — أي قيمه تانيه بترجع null
  // الهدف: السكرتاريه تختار الجنس وينحفظ مع الموعد، فيظهر للطبيب لما يفتح الكشف.
  const normalizeGenderValue = (value) => {
    const normalized = normalizeText(value).toLowerCase();
    if (normalized === 'male' || normalized === 'female') return normalized;
    return null;
  };

  // تطبيع الحقول المنطقيه (حامل/مرضعه): نقبل true/false فقط، أي حاجه تانيه null
  const normalizeOptionalBoolean = (value) => {
    if (value === true) return true;
    if (value === false) return false;
    return null;
  };

  const SECRETARY_VITAL_KEYS = ['weight', 'height', 'bmi', 'rbs', 'bp', 'pulse', 'temp', 'spo2', 'rr'];
  const SECRETARY_VITAL_KEY_SET = new Set(SECRETARY_VITAL_KEYS);
  const SECRETARY_VITAL_DYNAMIC_KEY_PATTERN = /^[a-zA-Z0-9:_-]{1,96}$/;

  const normalizeSecretaryVitalsKey = (value) => {
    const normalized = normalizeOptionalText(value);
    if (!normalized) return '';
    if (!SECRETARY_VITAL_DYNAMIC_KEY_PATTERN.test(normalized)) return '';
    return normalized;
  };

  const normalizeSecretaryVitals = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const source = value;
    const normalized = {};

    SECRETARY_VITAL_KEYS.forEach((key) => {
      const nextValue = normalizeOptionalText(source[key]);
      if (!nextValue) return;
      normalized[key] = nextValue.slice(0, 24);
    });

    Object.keys(source).forEach((rawKey) => {
      const key = normalizeSecretaryVitalsKey(rawKey);
      if (!key) return;
      if (SECRETARY_VITAL_KEY_SET.has(key)) return;
      if (key.startsWith('vital:')) return;

      const nextValue = normalizeOptionalText(source[rawKey]);
      if (!nextValue) return;
      normalized[key] = nextValue.slice(0, 24);
    });

    return Object.keys(normalized).length > 0 ? normalized : null;
  };

  const updateAppointmentBySecretary = async (request) => {
    const userId = normalizeText(request?.data?.userId);
    const appointmentId = normalizeText(request?.data?.appointmentId);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = normalizeText(request?.data?.sessionToken);
    const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;
    const appointmentInput = request?.data?.appointment;

    if (!userId || !appointmentId || !secret) {
      throw new HttpsError('invalid-argument', 'MISSING_PARAMETERS');
    }
    if (!appointmentInput || typeof appointmentInput !== 'object' || Array.isArray(appointmentInput)) {
      throw new HttpsError('invalid-argument', 'INVALID_APPOINTMENT_PAYLOAD');
    }

    const db = getDb();
    const configSnap = await db.collection('bookingConfig').doc(secret).get();
    if (!configSnap.exists) {
      throw new HttpsError('not-found', 'INVALID_CLINIC_SECRET');
    }

    const configData = configSnap.data() || {};
    if (configData.userId !== userId) {
      throw new HttpsError('permission-denied', 'SECRET_USER_MISMATCH');
    }

    const storedDoctorEmail = normalizeEmail(configData.doctorEmail);
    const auth = await readSecretaryAuthData({
      db,
      admin,
      secret,
      userId,
      doctorEmail: storedDoctorEmail,
      configData,
    });

    await assertSecretarySessionForBranch({ db, secret, mainAuth: auth, branchId, sessionToken, HttpsError });
    await assertBranchBelongsToDoctor({ db, userId, branchId, HttpsError });

    const aptRef = db.collection('users').doc(userId).collection('appointments').doc(appointmentId);
    const aptSnap = await aptRef.get();
    if (aptSnap.exists) {
      const aptBranchId = normalizeText(aptSnap.data()?.branchId) || DEFAULT_BRANCH_ID;
      if (aptBranchId !== branchId) {
        throw new HttpsError('permission-denied', 'APPOINTMENT_BRANCH_MISMATCH');
      }
    }

    const patientName = normalizeText(appointmentInput.patientName);
    const age = normalizeOptionalText(appointmentInput.age);
    const phone = normalizeText(appointmentInput.phone);
    const dateTime = normalizeText(appointmentInput.dateTime);
    const visitReason = normalizeOptionalText(appointmentInput.visitReason);
    const secretaryVitals = normalizeSecretaryVitals(appointmentInput.secretaryVitals);
    const appointmentType = normalizeAppointmentType(appointmentInput.appointmentType);
    const paymentType = normalizePaymentType(appointmentInput.paymentType);

    // التليفون اختياري — الاسم والتاريخ فقط إلزاميان
    if (!patientName || !dateTime) {
      throw new HttpsError('invalid-argument', 'INVALID_APPOINTMENT_FIELDS');
    }

    const dateMs = new Date(dateTime).getTime();
    if (!Number.isFinite(dateMs)) {
      throw new HttpsError('invalid-argument', 'INVALID_APPOINTMENT_DATE');
    }

    const patientSharePercentRaw = Number(appointmentInput.patientSharePercent);
    const patientSharePercent = Number.isFinite(patientSharePercentRaw)
      ? Math.max(0, Math.min(100, patientSharePercentRaw))
      : 0;
    const discountAmount = normalizeDiscountNumber(appointmentInput.discountAmount);
    const discountPercent = Math.max(
      0,
      Math.min(100, normalizeDiscountNumber(appointmentInput.discountPercent))
    );
    const discountReasonId = normalizeOptionalText(appointmentInput.discountReasonId);
    const discountReasonLabel = normalizeOptionalText(appointmentInput.discountReasonLabel);

    // تطبيع حقول الهويه: الجنس + الحمل + الرضاعه
    // الهدف: السكرتاريه تختار وتظهر للطبيب لما يفتح الكشف
    const genderForUpdate = normalizeGenderValue(appointmentInput.gender);
    const pregnantForUpdate = normalizeOptionalBoolean(appointmentInput.pregnant);
    const breastfeedingForUpdate = normalizeOptionalBoolean(appointmentInput.breastfeeding);

    const appointmentRef = db.collection('users').doc(userId).collection('appointments').doc(appointmentId);
    const appointmentSnap = await appointmentRef.get();
    if (!appointmentSnap.exists) {
      throw new HttpsError('not-found', 'APPOINTMENT_NOT_FOUND');
    }

    const updateData = {
      patientName,
      age: age || admin.firestore.FieldValue.delete(),
      // التليفون اختياري — نحذف الحقل لو فاضي بدل تخزين سلسلة فارغة
      phone: phone || admin.firestore.FieldValue.delete(),
      dateTime,
      visitReason: visitReason || admin.firestore.FieldValue.delete(),
      secretaryVitals: secretaryVitals || admin.firestore.FieldValue.delete(),
      appointmentType,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // الجنس: يتحفظ لو متختار، ويتمسح لو السكرتاريه شالت الاختيار
      gender: genderForUpdate || admin.firestore.FieldValue.delete(),
      // الحمل والرضاعه: snapshot للموعد ده فقط
      pregnant: pregnantForUpdate === null ? admin.firestore.FieldValue.delete() : pregnantForUpdate,
      breastfeeding: breastfeedingForUpdate === null ? admin.firestore.FieldValue.delete() : breastfeedingForUpdate,
      paymentType,
      insuranceCompanyId:
        paymentType === 'insurance' ? normalizeOptionalText(appointmentInput.insuranceCompanyId) : admin.firestore.FieldValue.delete(),
      insuranceCompanyName:
        paymentType === 'insurance' ? normalizeOptionalText(appointmentInput.insuranceCompanyName) : admin.firestore.FieldValue.delete(),
      insuranceMembershipId:
        paymentType === 'insurance' ? normalizeOptionalText(appointmentInput.insuranceMembershipId) : admin.firestore.FieldValue.delete(),
      insuranceApprovalCode:
        paymentType === 'insurance' ? normalizeOptionalText(appointmentInput.insuranceApprovalCode) : admin.firestore.FieldValue.delete(),
      patientSharePercent: paymentType === 'insurance' ? patientSharePercent : 0,
      discountAmount:
        paymentType === 'discount' ? discountAmount : admin.firestore.FieldValue.delete(),
      discountPercent:
        paymentType === 'discount' ? discountPercent : admin.firestore.FieldValue.delete(),
      discountReasonId:
        paymentType === 'discount'
          ? (discountReasonId || admin.firestore.FieldValue.delete())
          : admin.firestore.FieldValue.delete(),
      discountReasonLabel:
        paymentType === 'discount'
          ? (discountReasonLabel || admin.firestore.FieldValue.delete())
          : admin.firestore.FieldValue.delete(),
      consultationSourceAppointmentId:
        appointmentType === 'consultation'
          ? (normalizeOptionalText(appointmentInput.consultationSourceAppointmentId) || admin.firestore.FieldValue.delete())
          : admin.firestore.FieldValue.delete(),
      consultationSourceCompletedAt:
        appointmentType === 'consultation'
          ? (normalizeOptionalText(appointmentInput.consultationSourceCompletedAt) || admin.firestore.FieldValue.delete())
          : admin.firestore.FieldValue.delete(),
      consultationSourceRecordId:
        appointmentType === 'consultation'
          ? (normalizeOptionalText(appointmentInput.consultationSourceRecordId) || admin.firestore.FieldValue.delete())
          : admin.firestore.FieldValue.delete(),
    };

    try {
      await appointmentRef.set(updateData, { merge: true });
      return { success: true, appointmentId };
    } catch (error) {
      console.error('[secretaryFunctions] Failed to update appointment:', appointmentId, error);
      throw new HttpsError('internal', 'FAILED_TO_UPDATE_APPOINTMENT');
    }
  };

  const createAppointmentBySecretary = async (request) => {
    const userId = normalizeText(request?.data?.userId);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = normalizeText(request?.data?.sessionToken);
    const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;
    const appointmentInput = request?.data?.appointment;

    if (!userId || !secret) {
      throw new HttpsError('invalid-argument', 'MISSING_PARAMETERS');
    }
    if (!appointmentInput || typeof appointmentInput !== 'object' || Array.isArray(appointmentInput)) {
      throw new HttpsError('invalid-argument', 'INVALID_APPOINTMENT_PAYLOAD');
    }

    const db = getDb();

    const configSnap = await db.collection('bookingConfig').doc(secret).get();
    if (!configSnap.exists) {
      throw new HttpsError('not-found', 'INVALID_CLINIC_SECRET');
    }
    const configData = configSnap.data() || {};
    if (configData.userId !== userId) {
      throw new HttpsError('permission-denied', 'SECRET_USER_MISMATCH');
    }

    const storedDoctorEmail = normalizeEmail(configData.doctorEmail);
    const auth = await readSecretaryAuthData({
      db,
      admin,
      secret,
      userId,
      doctorEmail: storedDoctorEmail,
      configData,
    });
    await assertSecretarySessionForBranch({ db, secret, mainAuth: auth, branchId, sessionToken, HttpsError });
    await assertBranchBelongsToDoctor({ db, userId, branchId, HttpsError });

    const patientName = normalizeText(appointmentInput.patientName);
    const phone = normalizeText(appointmentInput.phone);
    const dateTime = normalizeText(appointmentInput.dateTime);

    // الاسم والتاريخ فقط إلزامي — التليفون وسبب الزيارة اختياريان (متناسق مع UI).
    if (!patientName || !dateTime) {
      throw new HttpsError('invalid-argument', 'INVALID_APPOINTMENT_FIELDS');
    }
    const dateMs = new Date(dateTime).getTime();
    if (!Number.isFinite(dateMs)) {
      throw new HttpsError('invalid-argument', 'INVALID_APPOINTMENT_DATE');
    }

    const age = normalizeOptionalText(appointmentInput.age);
    const visitReason = normalizeOptionalText(appointmentInput.visitReason);
    const secretaryVitals = normalizeSecretaryVitals(appointmentInput.secretaryVitals);
    const appointmentType = normalizeAppointmentType(appointmentInput.appointmentType);
    const paymentType = normalizePaymentType(appointmentInput.paymentType);
    const patientSharePercentRaw = Number(appointmentInput.patientSharePercent);
    const patientSharePercent = Number.isFinite(patientSharePercentRaw)
      ? Math.max(0, Math.min(100, patientSharePercentRaw))
      : 0;
    const discountAmount = normalizeDiscountNumber(appointmentInput.discountAmount);
    const discountPercent = Math.max(
      0,
      Math.min(100, normalizeDiscountNumber(appointmentInput.discountPercent))
    );
    const discountReasonId = normalizeOptionalText(appointmentInput.discountReasonId);
    const discountReasonLabel = normalizeOptionalText(appointmentInput.discountReasonLabel);

    const isConsultation =
      appointmentType === 'consultation' ||
      !!normalizeText(appointmentInput.consultationSourceAppointmentId);

    const appointmentData = {
      patientName,
      dateTime,
      createdAt: new Date().toISOString(),
      source: 'secretary',
      appointmentType: isConsultation ? 'consultation' : 'exam',
      bookingSecret: secret,
      branchId, // ربط الموعد بفرع السكرتارية
      paymentType,
      patientSharePercent: paymentType === 'insurance' ? patientSharePercent : 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (phone) appointmentData.phone = phone;
    if (age) appointmentData.age = age;
    if (visitReason) appointmentData.visitReason = visitReason;
    if (secretaryVitals) appointmentData.secretaryVitals = secretaryVitals;

    // حقول الهويه (الجنس + الحمل + الرضاعه) — السكرتاريه بتختارها وبتتنقل للطبيب
    // الجنس ثابت مدى الحياة، أما الحمل والرضاعه snapshot للموعد فقط
    const genderForCreate = normalizeGenderValue(appointmentInput.gender);
    if (genderForCreate) appointmentData.gender = genderForCreate;
    const pregnantForCreate = normalizeOptionalBoolean(appointmentInput.pregnant);
    if (pregnantForCreate !== null) appointmentData.pregnant = pregnantForCreate;
    const breastfeedingForCreate = normalizeOptionalBoolean(appointmentInput.breastfeeding);
    if (breastfeedingForCreate !== null) appointmentData.breastfeeding = breastfeedingForCreate;
    if (paymentType === 'insurance') {
      const insuranceCompanyId = normalizeOptionalText(appointmentInput.insuranceCompanyId);
      const insuranceCompanyName = normalizeOptionalText(appointmentInput.insuranceCompanyName);
      const insuranceMembershipId = normalizeOptionalText(appointmentInput.insuranceMembershipId);
      const insuranceApprovalCode = normalizeOptionalText(appointmentInput.insuranceApprovalCode);
      if (insuranceCompanyId) appointmentData.insuranceCompanyId = insuranceCompanyId;
      if (insuranceCompanyName) appointmentData.insuranceCompanyName = insuranceCompanyName;
      if (insuranceMembershipId) appointmentData.insuranceMembershipId = insuranceMembershipId;
      if (insuranceApprovalCode) appointmentData.insuranceApprovalCode = insuranceApprovalCode;
    }
    if (paymentType === 'discount') {
      appointmentData.discountAmount = discountAmount;
      appointmentData.discountPercent = discountPercent;
      if (discountReasonId) appointmentData.discountReasonId = discountReasonId;
      if (discountReasonLabel) appointmentData.discountReasonLabel = discountReasonLabel;
    }
    if (isConsultation) {
      const consultationSourceAppointmentId = normalizeOptionalText(appointmentInput.consultationSourceAppointmentId);
      const consultationSourceCompletedAt = normalizeOptionalText(appointmentInput.consultationSourceCompletedAt);
      const consultationSourceRecordId = normalizeOptionalText(appointmentInput.consultationSourceRecordId);
      if (consultationSourceAppointmentId) appointmentData.consultationSourceAppointmentId = consultationSourceAppointmentId;
      if (consultationSourceCompletedAt) appointmentData.consultationSourceCompletedAt = consultationSourceCompletedAt;
      if (consultationSourceRecordId) appointmentData.consultationSourceRecordId = consultationSourceRecordId;
    }

    try {
      const appointmentsRef = db.collection('users').doc(userId).collection('appointments');
      const createdRef = await appointmentsRef.add(appointmentData);
      return { success: true, appointmentId: createdRef.id };
    } catch (error) {
      console.error('[secretaryFunctions] Failed to create appointment:', error);
      throw new HttpsError('internal', 'FAILED_TO_CREATE_APPOINTMENT');
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // listAppointmentsForSecretary
  // ---------------------------------------------------------------------------
  // يرجع للسكرتيرة مواعيد اليوم + القادمة + المنفذة لفرعها مباشرةً من Firestore
  // بصلاحيات admin (بيتخطى rules). الهدف: السكرتيرة تشوف البيانات فوراً حتى لو
  // الطبيب مش online (الطبيب هو اللي بيزامن bookingConfig، لو مش متصل البيانات
  // بتبقى فاضية أو قديمة).
  //
  // ده الحل لمشكلة "مواعيد اليوم فاضية دايماً" + "بحجز ميعاد ومش بلاقيه":
  //   - على الـ login بنستدعي هذه الدالة → نعرض الـ lists فوراً
  //   - بعد كل create/update/delete بنستدعيها مرة أخرى للتحديث
  // ───────────────────────────────────────────────────────────────────────────
  const toLocalIsoDayString = (isoString) => {
    const normalized = String(isoString || '').trim();
    if (!normalized) return '';
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) return normalized.slice(0, 10);
      return '';
    }
    try {
      return getCairoDateKey(parsed);
    } catch (_) {
      return parsed.toISOString().slice(0, 10);
    }
  };

  const compactAppointmentForSecretary = (doc) => {
    const data = doc.data() || {};
    const out = {
      id: doc.id,
      patientName: String(data.patientName || '').slice(0, 120),
      dateTime: normalizeText(data.dateTime),
      branchId: normalizeText(data.branchId) || DEFAULT_BRANCH_ID,
    };
    if (data.age) out.age = String(data.age).slice(0, 32);
    if (data.phone) out.phone = String(data.phone).slice(0, 20);
    if (data.visitReason) out.visitReason = String(data.visitReason).slice(0, 400);
    if (typeof data.isFirstVisit === 'boolean') out.isFirstVisit = data.isFirstVisit;
    if (data.secretaryVitals) out.secretaryVitals = data.secretaryVitals;
    if (data.source) out.source = data.source;
    if (data.appointmentType) out.appointmentType = data.appointmentType;
    if (data.examCompletedAt) out.examCompletedAt = data.examCompletedAt;
    if (data.consultationSourceAppointmentId) out.consultationSourceAppointmentId = data.consultationSourceAppointmentId;
    if (data.consultationSourceCompletedAt) out.consultationSourceCompletedAt = data.consultationSourceCompletedAt;
    if (data.consultationSourceRecordId) out.consultationSourceRecordId = data.consultationSourceRecordId;
    if (data.paymentType) out.paymentType = data.paymentType;
    if (data.insuranceCompanyId) out.insuranceCompanyId = data.insuranceCompanyId;
    if (data.insuranceCompanyName) out.insuranceCompanyName = data.insuranceCompanyName;
    if (data.insuranceMembershipId) out.insuranceMembershipId = data.insuranceMembershipId;
    if (data.insuranceApprovalCode) out.insuranceApprovalCode = data.insuranceApprovalCode;
    if (typeof data.patientSharePercent === 'number') out.patientSharePercent = data.patientSharePercent;
    if (typeof data.discountAmount === 'number') out.discountAmount = data.discountAmount;
    if (typeof data.discountPercent === 'number') out.discountPercent = data.discountPercent;
    if (data.discountReasonId) out.discountReasonId = data.discountReasonId;
    if (data.discountReasonLabel) out.discountReasonLabel = data.discountReasonLabel;
    // إرجاع حقول الهويه للسكرتاريه عشان تشوفها في القائمه
    // ولما تعدل الموعد ميرجعوش فاضيين في الفورم.
    if (data.gender === 'male' || data.gender === 'female') out.gender = data.gender;
    if (typeof data.pregnant === 'boolean') out.pregnant = data.pregnant;
    if (typeof data.breastfeeding === 'boolean') out.breastfeeding = data.breastfeeding;
    return out;
  };

  const listAppointmentsForSecretary = async (request) => {
    const userId = normalizeText(request?.data?.userId);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = normalizeText(request?.data?.sessionToken);
    const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;
    // اليوم حسب التوقيت المحلي للعميل (السكرتيرة) — يرسله العميل لتجنب فروق المنطقة الزمنية
    const todayStrInput = normalizeText(request?.data?.todayStr);
    const todayStr = /^\d{4}-\d{2}-\d{2}$/.test(todayStrInput)
      ? todayStrInput
      : getCairoDateKey(new Date());

    if (!userId || !secret) {
      throw new HttpsError('invalid-argument', 'MISSING_PARAMETERS');
    }

    const db = getDb();
    const configSnap = await db.collection('bookingConfig').doc(secret).get();
    if (!configSnap.exists) {
      throw new HttpsError('not-found', 'INVALID_CLINIC_SECRET');
    }
    const configData = configSnap.data() || {};
    if (configData.userId !== userId) {
      throw new HttpsError('permission-denied', 'SECRET_USER_MISMATCH');
    }

    const storedDoctorEmail = normalizeEmail(configData.doctorEmail);
    const auth = await readSecretaryAuthData({
      db,
      admin,
      secret,
      userId,
      doctorEmail: storedDoctorEmail,
      configData,
    });
    await assertSecretarySessionForBranch({ db, secret, mainAuth: auth, branchId, sessionToken, HttpsError });
    await assertBranchBelongsToDoctor({ db, userId, branchId, HttpsError });

    // جلب كل المواعيد لهذا الطبيب (نفلترها بالفرع هنا بدل where عشان لا نفتقد للـ index)
    const appointmentsRef = db.collection('users').doc(userId).collection('appointments');
    const snap = await appointmentsRef.get().catch((err) => {
      console.error('[listAppointmentsForSecretary] Failed to read appointments:', err);
      throw new HttpsError('internal', 'FAILED_TO_LIST_APPOINTMENTS');
    });

    const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const today = [];
    const upcoming = [];
    const completed = [];

    snap.docs.forEach((doc) => {
      const data = doc.data() || {};
      const aptBranchId = normalizeText(data.branchId) || DEFAULT_BRANCH_ID;
      if (aptBranchId !== branchId) return;
      const dateTime = normalizeText(data.dateTime);
      if (!dateTime) return;

      const aptDayStr = toLocalIsoDayString(dateTime);
      if (!aptDayStr) return;

      const compact = compactAppointmentForSecretary(doc);
      const isCompleted = Boolean(data.examCompletedAt);

      if (isCompleted) {
        const completedMs = Date.parse(String(data.examCompletedAt || ''));
        if (Number.isFinite(completedMs) && completedMs < thirtyDaysAgoMs) return;
        completed.push(compact);
      } else if (aptDayStr === todayStr) {
        today.push(compact);
      } else if (aptDayStr > todayStr) {
        upcoming.push(compact);
      }
      // لو aptDayStr < todayStr وغير مكتمل: نتجاهل (مواعيد قديمة لم تنفذ)
    });

    today.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    upcoming.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    // المنفذة: الفرز بـ examCompletedAt تنازلي عشان نظهر الأحدث تنفيذاً أولاً.
    // لو examCompletedAt مش متاح (حالة نادرة) نرجع لـ dateTime.
    completed.sort((a, b) => {
      const aMs = Date.parse(String(a.examCompletedAt || a.dateTime)) || 0;
      const bMs = Date.parse(String(b.examCompletedAt || b.dateTime)) || 0;
      return bMs - aMs;
    });

    return {
      success: true,
      today,
      upcoming,
      completed: completed.slice(0, 50),
    };
  };

  return {
    secretaryLoginWithDoctorEmail,
    deleteAppointmentBySecretary,
    updateAppointmentBySecretary,
    createAppointmentBySecretary,
    listAppointmentsForSecretary,
  };
};
