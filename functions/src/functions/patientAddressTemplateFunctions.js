const {
  normalizeEmail,
  normalizeText,
  normalizeSecret,
  readSecretaryAuthData,
  DEFAULT_BRANCH_ID,
  assertBranchBelongsToDoctor,
  assertSecretarySessionForBranch,
} = require('./secretaryLoginHelpers');

const cleanText = (value, maxLength) =>
  normalizeText(value).replace(/\s+/g, ' ').trim().slice(0, maxLength);

const cleanId = (value) =>
  cleanText(value, 120).replace(/[^a-zA-Z0-9_-]/g, '');

const makeLegacyId = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `legacy_${(hash >>> 0).toString(36)}`;
};

const normalizeTemplate = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const address = cleanText(value.address ?? value.value, 500);
  if (!address) return null;
  return {
    id: cleanId(value.id) || makeLegacyId(address),
    name: cleanText(value.name, 100) || address.slice(0, 100),
    address,
  };
};

const readLegacyTemplates = (source) => {
  const addresses = [];
  (Array.isArray(source.details) ? source.details : []).forEach((rawGroup) => {
    if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
    const prefix = [
      cleanText(rawGroup.governorate, 100),
      cleanText(rawGroup.cityArea, 150),
    ].filter(Boolean);
    (Array.isArray(rawGroup.values) ? rawGroup.values : []).forEach((rawValue) => {
      const address = [...prefix, cleanText(rawValue, 400)].filter(Boolean).join('، ');
      if (address) addresses.push({ id: makeLegacyId(address), name: address, address });
    });
  });
  (Array.isArray(source.cities) ? source.cities : []).forEach((rawGroup) => {
    if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
    const governorate = cleanText(rawGroup.governorate, 100);
    (Array.isArray(rawGroup.values) ? rawGroup.values : []).forEach((rawValue) => {
      const address = [governorate, cleanText(rawValue, 150)].filter(Boolean).join('، ');
      if (address) addresses.push({ id: makeLegacyId(address), name: address, address });
    });
  });
  return addresses;
};

const normalizeLibrary = (value) => {
  const initial = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const source = initial.patientAddressTemplates
    && initial.patientAddressTemplates !== value
    ? initial.patientAddressTemplates
    : initial;
  const candidates = [
    ...(Array.isArray(source.addresses) ? source.addresses : []),
    ...readLegacyTemplates(source),
  ];
  const byId = new Map();
  const addressIds = new Map();

  candidates.forEach((candidate) => {
    const template = normalizeTemplate(candidate);
    if (!template) return;
    const addressKey = template.address.toLocaleLowerCase('ar');
    const duplicateId = addressIds.get(addressKey);
    if (duplicateId && duplicateId !== template.id) return;
    byId.set(template.id, template);
    addressIds.set(addressKey, template.id);
  });

  return {
    version: 2,
    addresses: Array.from(byId.values())
      .sort((left, right) => left.name.localeCompare(right.name, 'ar'))
      .slice(0, 300),
  };
};

const upsertTemplate = (library, input) => {
  const next = normalizeLibrary(library);
  const template = normalizeTemplate(input);
  if (!template) return next;
  next.addresses = next.addresses
    .filter((item) =>
      item.id !== template.id
      && item.address.toLocaleLowerCase('ar') !== template.address.toLocaleLowerCase('ar'))
    .concat(template);
  return normalizeLibrary(next);
};

const removeTemplate = (library, templateId) => {
  const next = normalizeLibrary(library);
  next.addresses = next.addresses.filter((item) => item.id !== templateId);
  return normalizeLibrary(next);
};

const readLegacyRequestTemplate = (data) => {
  const kind = data?.kind === 'details' ? 'details' : 'city';
  const governorate = cleanText(data?.governorate, 100);
  const cityArea = kind === 'details' ? cleanText(data?.cityArea, 150) : '';
  const value = cleanText(data?.value, kind === 'details' ? 400 : 150);
  const address = [governorate, cityArea, value].filter(Boolean).join('، ');
  return address
    ? { id: makeLegacyId(address), name: address.slice(0, 100), address }
    : null;
};

module.exports = ({ HttpsError, getDb, admin }) => {
  const upsertPatientAddressTemplate = async (request) => {
    const requestedUserId = cleanText(request?.data?.userId, 160);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = cleanText(request?.data?.sessionToken, 300);
    const branchId = cleanText(request?.data?.branchId, 160) || DEFAULT_BRANCH_ID;
    const action = request?.data?.action === 'delete' ? 'delete' : 'upsert';
    const templateId = cleanId(request?.data?.templateId);
    const template = normalizeTemplate(request?.data?.template)
      || readLegacyRequestTemplate(request?.data);

    if ((action === 'delete' && !templateId) || (action === 'upsert' && !template)) {
      throw new HttpsError('invalid-argument', 'INVALID_ADDRESS_TEMPLATE');
    }

    const db = getDb();
    let userId = requestedUserId;
    const isDoctor = Boolean(request.auth?.uid && request.auth.uid === requestedUserId);

    if (!isDoctor) {
      if (!secret) throw new HttpsError('unauthenticated', 'SECRETARY_SESSION_REQUIRED');
      const configSnap = await db.collection('bookingConfig').doc(secret).get();
      if (!configSnap.exists) throw new HttpsError('not-found', 'INVALID_CLINIC_SECRET');
      const configData = configSnap.data() || {};
      userId = cleanText(configData.userId, 160);
      if (!userId || (requestedUserId && requestedUserId !== userId)) {
        throw new HttpsError('permission-denied', 'SECRET_USER_MISMATCH');
      }
      const auth = await readSecretaryAuthData({
        db,
        admin,
        secret,
        userId,
        doctorEmail: normalizeEmail(configData.doctorEmail),
        configData,
      });
      await assertSecretarySessionForBranch({
        db,
        secret,
        mainAuth: auth,
        branchId,
        sessionToken,
        HttpsError,
      });
      await assertBranchBelongsToDoctor({ db, userId, branchId, HttpsError });
    }

    if (!userId) throw new HttpsError('invalid-argument', 'MISSING_USER_ID');

    const settingsRef = db
      .collection('users')
      .doc(userId)
      .collection('settings')
      .doc('patientAddressTemplates');
    let templates;
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(settingsRef);
      const current = snapshot.exists ? snapshot.data() : {};
      templates = action === 'delete'
        ? removeTemplate(current, templateId)
        : upsertTemplate(current, template);
      transaction.set(settingsRef, {
        ...templates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    const bookingConfigs = await db.collection('bookingConfig').where('userId', '==', userId).get();
    const batch = db.batch();
    bookingConfigs.docs.forEach((snapshot) => {
      batch.set(snapshot.ref, {
        patientAddressTemplates: templates,
        patientAddressTemplatesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();

    return { templates };
  };

  return { upsertPatientAddressTemplate };
};
