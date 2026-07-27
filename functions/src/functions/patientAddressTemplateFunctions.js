const {
  normalizeEmail,
  normalizeText,
  normalizeSecret,
  readSecretaryAuthData,
  DEFAULT_BRANCH_ID,
  assertBranchBelongsToDoctor,
  assertSecretarySessionForBranch,
} = require('./secretaryLoginHelpers');

const EGYPT_GOVERNORATES = new Set([
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
]);

const cleanText = (value, maxLength) =>
  normalizeText(value).replace(/\s+/g, ' ').trim().slice(0, maxLength);

const uniqueSorted = (values, maxLength, maxItems) => {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.map((value) => cleanText(value, maxLength)).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right, 'ar'))
    .slice(0, maxItems);
};

const normalizeLibrary = (value) => {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const cityMap = new Map();
  (Array.isArray(source.cities) ? source.cities : []).forEach((rawGroup) => {
    if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
    const governorate = cleanText(rawGroup.governorate, 100);
    if (!EGYPT_GOVERNORATES.has(governorate)) return;
    const values = uniqueSorted(rawGroup.values, 150, 100);
    if (values.length === 0) return;
    const current = cityMap.get(governorate) || [];
    cityMap.set(governorate, uniqueSorted([...current, ...values], 150, 100));
  });

  const detailsMap = new Map();
  (Array.isArray(source.details) ? source.details : []).forEach((rawGroup) => {
    if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
    const governorate = cleanText(rawGroup.governorate, 100);
    const cityArea = cleanText(rawGroup.cityArea, 150);
    if (!EGYPT_GOVERNORATES.has(governorate)) return;
    const values = uniqueSorted(rawGroup.values, 400, 150);
    if (values.length === 0) return;
    const key = `${governorate}\u0000${cityArea}`;
    const current = detailsMap.get(key) || { governorate, cityArea, values: [] };
    current.values = uniqueSorted([...current.values, ...values], 400, 150);
    detailsMap.set(key, current);
  });

  return {
    version: 1,
    cities: Array.from(cityMap.entries())
      .map(([governorate, values]) => ({ governorate, values }))
      .sort((left, right) => left.governorate.localeCompare(right.governorate, 'ar'))
      .slice(0, 27),
    details: Array.from(detailsMap.values())
      .sort((left, right) =>
        left.governorate.localeCompare(right.governorate, 'ar')
        || left.cityArea.localeCompare(right.cityArea, 'ar'))
      .slice(0, 500),
  };
};

const addTemplate = (library, input) => {
  const next = normalizeLibrary(library);
  if (input.kind === 'city') {
    const group = next.cities.find((item) => item.governorate === input.governorate);
    if (group) {
      group.values = uniqueSorted([...group.values, input.value], 150, 100);
    } else {
      next.cities.push({ governorate: input.governorate, values: [input.value] });
    }
  } else {
    const group = next.details.find(
      (item) => item.governorate === input.governorate && item.cityArea === input.cityArea,
    );
    if (group) {
      group.values = uniqueSorted([...group.values, input.value], 400, 150);
    } else {
      next.details.push({
        governorate: input.governorate,
        cityArea: input.cityArea,
        values: [input.value],
      });
    }
  }
  return normalizeLibrary(next);
};

module.exports = ({ HttpsError, getDb, admin }) => {
  const upsertPatientAddressTemplate = async (request) => {
    const requestedUserId = cleanText(request?.data?.userId, 160);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = cleanText(request?.data?.sessionToken, 300);
    const branchId = cleanText(request?.data?.branchId, 160) || DEFAULT_BRANCH_ID;
    const kind = request?.data?.kind === 'details' ? 'details' : 'city';
    const governorate = cleanText(request?.data?.governorate, 100);
    const cityArea = cleanText(request?.data?.cityArea, 150);
    const value = cleanText(request?.data?.value, kind === 'city' ? 150 : 400);

    if (!EGYPT_GOVERNORATES.has(governorate) || !value) {
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
      templates = addTemplate(snapshot.exists ? snapshot.data() : {}, {
        kind,
        governorate,
        cityArea,
        value,
      });
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
