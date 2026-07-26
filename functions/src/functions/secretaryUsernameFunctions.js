const {
  DEFAULT_BRANCH_ID,
  isValidSecretaryUsername,
  normalizeEmail,
  normalizeSecret,
  normalizeSecretaryUsername,
  normalizeText,
} = require('./secretaryLoginHelpers');

const createSetSecretaryUsername = ({ HttpsError, getDb, admin }) => async (request) => {
  const doctorUserId = normalizeText(request?.auth?.uid);
  const username = normalizeSecretaryUsername(request?.data?.username);
  const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;
  const requestedSecret = normalizeSecret(request?.data?.secret);

  if (!doctorUserId || String(request?.auth?.token?.role || '') === 'secretary') {
    throw new HttpsError('unauthenticated', 'DOCTOR_AUTH_REQUIRED');
  }
  if (!isValidSecretaryUsername(username)) {
    throw new HttpsError('invalid-argument', 'INVALID_SECRETARY_USERNAME');
  }
  if (!branchId || branchId.includes('/') || branchId.length > 120) {
    throw new HttpsError('invalid-argument', 'INVALID_BRANCH_ID');
  }

  const db = getDb();
  const userRef = db.collection('users').doc(doctorUserId);
  const usernameRef = db.collection('secretaryUsernameIndex').doc(username);
  const nowTs = admin.firestore.Timestamp.now();

  await db.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'DOCTOR_ACCOUNT_NOT_FOUND');
    }

    const userData = userSnap.data() || {};
    const usernameMap = userData.secretaryUsernameByBranch || {};
    const oldUsername = normalizeSecretaryUsername(usernameMap?.[branchId]);
    const mainSecret = normalizeSecret(userData.bookingSecret);
    const branchSecrets = userData.bookingSecretByBranch || {};
    const doctorEmail = normalizeEmail(userData.doctorEmail) || normalizeEmail(userData.email);
    let targetSecret = branchId === DEFAULT_BRANCH_ID
      ? mainSecret
      : normalizeSecret(branchSecrets?.[branchId]);

    if (branchId !== DEFAULT_BRANCH_ID) {
      const branchSnap = await transaction.get(userRef.collection('branches').doc(branchId));
      if (!branchSnap.exists) {
        throw new HttpsError('not-found', 'BRANCH_NOT_FOUND');
      }
      targetSecret = targetSecret || normalizeSecret(branchSnap.data()?.secretarySecret);
    }

    if (!targetSecret || (requestedSecret && requestedSecret !== targetSecret)) {
      throw new HttpsError('failed-precondition', 'SECRETARY_BRANCH_SECRET_MISMATCH');
    }

    const usernameSnap = await transaction.get(usernameRef);
    if (usernameSnap.exists) {
      const indexed = usernameSnap.data() || {};
      const indexedUserId = normalizeText(indexed.userId);
      const indexedBranchId = normalizeText(indexed.branchId) || DEFAULT_BRANCH_ID;
      const sameOwner = indexedUserId === doctorUserId && indexedBranchId === branchId;

      if (!sameOwner) {
        const indexedOwnerRef = db.collection('users').doc(indexedUserId || '_missing_');
        const indexedOwnerSnap = await transaction.get(indexedOwnerRef);
        const indexedOwnerMap = indexedOwnerSnap.exists
          ? (indexedOwnerSnap.data()?.secretaryUsernameByBranch || {})
          : {};
        if (normalizeSecretaryUsername(indexedOwnerMap?.[indexedBranchId]) === username) {
          throw new HttpsError('already-exists', 'SECRETARY_USERNAME_TAKEN');
        }
      }
    }

    let oldUsernameRef = null;
    let oldUsernameSnap = null;
    if (oldUsername && oldUsername !== username) {
      oldUsernameRef = db.collection('secretaryUsernameIndex').doc(oldUsername);
      oldUsernameSnap = await transaction.get(oldUsernameRef);
    }

    transaction.set(usernameRef, {
      username,
      userId: doctorUserId,
      branchId,
      createdAt: usernameSnap.exists ? (usernameSnap.data()?.createdAt || nowTs) : nowTs,
      updatedAt: nowTs,
    });
    transaction.set(userRef, {
      secretaryUsernameByBranch: { [branchId]: username },
      ...(branchId === DEFAULT_BRANCH_ID
        ? {}
        : { bookingSecretByBranch: { [branchId]: targetSecret } }),
      updatedAt: nowTs,
    }, { merge: true });
    transaction.set(db.collection('bookingConfig').doc(targetSecret), {
      secretaryUsername: username,
      updatedAt: nowTs,
    }, { merge: true });

    if (oldUsernameRef && oldUsernameSnap?.exists) {
      const oldIndex = oldUsernameSnap.data() || {};
      if (
        normalizeText(oldIndex.userId) === doctorUserId &&
        (normalizeText(oldIndex.branchId) || DEFAULT_BRANCH_ID) === branchId
      ) {
        transaction.delete(oldUsernameRef);
      }
    }

    if (doctorEmail) {
      transaction.delete(db.collection('secretaryLoginIndex').doc(doctorEmail));
    }
  });

  return { username, branchId };
};

const resolveSecretaryUsernameLoginTarget = async ({
  db,
  secretaryUsername,
  requestedSecret,
  failWithRateLimit,
}) => {
  const usernameSnap = await db.collection('secretaryUsernameIndex').doc(secretaryUsername).get();
  if (!usernameSnap.exists) {
    await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
  }

  const usernameData = usernameSnap.data() || {};
  const userId = normalizeText(usernameData.userId);
  const branchId = normalizeText(usernameData.branchId) || DEFAULT_BRANCH_ID;
  const userSnap = userId ? await db.collection('users').doc(userId).get() : null;
  if (!userSnap?.exists) {
    await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
  }

  const userData = userSnap.data() || {};
  const currentUsername = normalizeSecretaryUsername(
    (userData.secretaryUsernameByBranch || {})?.[branchId]
  );
  const mainSecret = normalizeSecret(userData.bookingSecret);
  const secret = branchId === DEFAULT_BRANCH_ID
    ? mainSecret
    : normalizeSecret((userData.bookingSecretByBranch || {})?.[branchId]);

  if (
    currentUsername !== secretaryUsername ||
    !userId ||
    !secret ||
    (requestedSecret && requestedSecret !== secret)
  ) {
    await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
  }

  const configSnap = await db.collection('bookingConfig').doc(secret).get();
  if (!configSnap.exists || normalizeText(configSnap.data()?.userId) !== userId) {
    await failWithRateLimit('permission-denied', 'INVALID_CREDENTIALS');
  }

  return {
    userId,
    branchId,
    secret,
    authSecret: mainSecret || secret,
    userData,
    configData: configSnap.data() || {},
  };
};

const parseSecretaryLoginIdentifier = (data) => {
  const secretaryUsername = normalizeSecretaryUsername(
    data?.secretaryUsername || data?.loginIdentifier
  );
  return {
    loginIdentifier: secretaryUsername,
    secretaryUsername,
  };
};

const registerSecretaryUsernameFunctions = (context) => ({
  setSecretaryUsername: createSetSecretaryUsername(context),
});

Object.assign(registerSecretaryUsernameFunctions, {
  parseSecretaryLoginIdentifier,
  resolveSecretaryUsernameLoginTarget,
});

module.exports = registerSecretaryUsernameFunctions;
