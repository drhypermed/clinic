const {
  normalizeEmail,
  normalizeText,
  normalizeSecret,
  normalizeOptionalText,
  toIsoDateString,
  toPositiveFileNumber,
  readSecretaryAuthData,
  DEFAULT_BRANCH_ID,
  assertBranchBelongsToDoctor,
  assertSecretarySessionForBranch,
} = require('./secretaryLoginHelpers');
const { normalizePatientNameForFile } = require('./statsCounterHelpers');
const directoryModule = require('./secretaryPatientDirectoryFunctions');

const DIRECTORY_SCHEMA_VERSION = directoryModule.DIRECTORY_SCHEMA_VERSION;
const normalizePhoneSearchKey = directoryModule.normalizePhoneSearchKey;
const MAX_DOCUMENTS_PER_FALLBACK_QUERY = 80;
const MAX_PATIENTS_PER_SEARCH = 20;
const MIN_NAME_QUERY_LENGTH = 2;
const MIN_PHONE_QUERY_LENGTH = 7;
const MAX_LEGACY_NAME_VARIANTS = 32;

/**
 * Transitional aliases for records created before patientFileNameKey was
 * normalized consistently. These queries are used only while the compact
 * directory is not marked ready; afterwards every search is a single indexed
 * lookup on normalized prefixes.
 */
const buildLegacyNameQueryVariants = (value) => {
  const raw = String(value || '').normalize('NFKC').trim();
  if (!raw) return [];
  const canonical = normalizePatientNameForFile(raw);
  const initialAlefOptions = ['ا', 'أ', 'إ', 'آ', 'ٱ'];
  const finalHaaOptions = ['ه', 'ة'];
  const finalYaaOptions = ['ي', 'ى', 'ئ'];
  const commonVariants = [];
  initialAlefOptions.forEach((alef) => {
    finalHaaOptions.forEach((haa) => {
      finalYaaOptions.forEach((yaa) => {
        commonVariants.push(
          canonical
            .replace(/(^|\s)[اأإآٱ]/g, `$1${alef}`)
            .replace(/[هة](?=\s|$)/g, haa)
            .replace(/[يىئ](?=\s|$)/g, yaa),
        );
      });
    });
  });

  // The three most common Egyptian-Arabic differences produce at most 30
  // position-aware combinations. Keeping interior yaa intact is important for
  // cases such as "أميرة مصطفى".
  const variants = new Set([raw, ...commonVariants]);
  for (const variant of Array.from(variants)) {
    if (variants.size >= MAX_LEGACY_NAME_VARIANTS) break;
    variants.add(variant.replace(/[وؤ]/g, 'و'));
    if (variants.size < MAX_LEGACY_NAME_VARIANTS) {
      variants.add(variant.replace(/[وؤ]/g, 'ؤ'));
    }
  }
  return Array.from(variants).slice(0, MAX_LEGACY_NAME_VARIANTS);
};

const buildAgeTextFromRecordAge = (age) => {
  if (!age || typeof age !== 'object') return normalizeOptionalText(age);
  const years = normalizeText(age.years);
  const months = normalizeText(age.months);
  const days = normalizeText(age.days);
  const parts = [];
  if (years && years !== '0') parts.push(`${years} سنة`);
  if (months && months !== '0') parts.push(`${months} شهر`);
  if (days && days !== '0') parts.push(`${days} يوم`);
  return parts.join(' - ');
};

const toRecordMs = (value) => {
  const iso = toIsoDateString(value);
  const ms = Date.parse(iso || '');
  return Number.isFinite(ms) ? ms : 0;
};

const pickLatestIso = (currentValue, nextValue) => {
  const currentIso = toIsoDateString(currentValue);
  const nextIso = toIsoDateString(nextValue);
  if (!nextIso) return currentIso || '';
  if (!currentIso || toRecordMs(nextIso) >= toRecordMs(currentIso)) return nextIso;
  return currentIso;
};

const mapDirectoryPatient = (doc) => {
  const data = doc.data() || {};
  const patientName = normalizeOptionalText(data.patientName);
  if (!patientName) return null;
    return {
      id: doc.id,
      patientFileId: normalizeOptionalText(data.patientFileId) || doc.id,
      patientName,
    age: normalizeOptionalText(data.age) || undefined,
    phone: Array.isArray(data.phones)
      ? normalizeOptionalText(data.phones.find((value) => normalizeOptionalText(value))) || undefined
      : undefined,
    address: data.address && typeof data.address === 'object' ? data.address : undefined,
    gender: data.gender === 'male' || data.gender === 'female' ? data.gender : undefined,
    dateOfBirth: normalizeOptionalText(data.dateOfBirth) || undefined,
    patientFileNumber: toPositiveFileNumber(data.patientFileNumber) || undefined,
    lastExamDate: toIsoDateString(data.lastExamDate) || undefined,
    lastConsultationDate: toIsoDateString(data.lastConsultationDate) || undefined,
    _latestMs: Number(data.lastVisitAtMs || 0),
  };
};

const mergePatients = (primary, secondary) => {
  const merged = new Map();
  [...secondary, ...primary].forEach((patient) => {
    const key = `${normalizePatientNameForFile(patient.patientName)}|${normalizePhoneSearchKey(patient.phone)}`;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, patient);
      return;
    }
    merged.set(key, {
      ...existing,
      ...patient,
      age: patient.age || existing.age,
      phone: patient.phone || existing.phone,
      address: patient.address || existing.address,
      gender: patient.gender || existing.gender,
      dateOfBirth: patient.dateOfBirth || existing.dateOfBirth,
      patientFileNumber: patient.patientFileNumber || existing.patientFileNumber,
      lastExamDate: pickLatestIso(existing.lastExamDate, patient.lastExamDate) || undefined,
      lastConsultationDate:
        pickLatestIso(existing.lastConsultationDate, patient.lastConsultationDate) || undefined,
      _latestMs: Math.max(Number(existing._latestMs || 0), Number(patient._latestMs || 0)),
    });
  });
  return Array.from(merged.values());
};

module.exports = ({ HttpsError, getDb, admin }) => {
  const searchCompactDirectory = async ({ db, userId, branchId, normalizedNameQuery, phoneSearchKey }) => {
    const branchRef = db.doc(`users/${userId}/secretaryPatientDirectories/${branchId}`);
    const patientsRef = branchRef.collection('patients');
    const searches = [];
    if (normalizedNameQuery.length >= MIN_NAME_QUERY_LENGTH) {
      searches.push(
        patientsRef
          .where('nameSearchPrefixes', 'array-contains', normalizedNameQuery)
          .orderBy('lastVisitAtMs', 'desc')
          .limit(MAX_PATIENTS_PER_SEARCH)
          .get(),
      );
    }
    if (phoneSearchKey.length >= MIN_PHONE_QUERY_LENGTH) {
      searches.push(
        patientsRef
          .where('phoneSearchKeys', 'array-contains', phoneSearchKey)
          .orderBy('lastVisitAtMs', 'desc')
          .limit(MAX_PATIENTS_PER_SEARCH)
          .get(),
      );
    }

    const [metaResult, searchResults] = await Promise.all([
      branchRef.get().catch(() => null),
      Promise.allSettled(searches),
    ]);
    const metaData = metaResult?.exists ? metaResult.data() || {} : {};
    const ready = metaData.ready === true
      && Number(metaData.schemaVersion || 0) >= DIRECTORY_SCHEMA_VERSION;
    const patients = [];
    searchResults.forEach((result) => {
      if (result.status !== 'fulfilled') return;
      result.value.docs.forEach((doc) => {
        const patient = mapDirectoryPatient(doc);
        if (patient) patients.push(patient);
      });
    });
    const searchesSucceeded = searchResults.every((result) => result.status === 'fulfilled');
    return { ready: ready && searchesSucceeded, patients: mergePatients(patients, []) };
  };

  const searchLegacyRecords = async ({
    db,
    userId,
    branchId,
    rawNameQuery,
    normalizedNameQuery,
    rawPhoneQuery,
    phoneSearchKey,
  }) => {
    const recordsRef = db.collection('users').doc(userId).collection('records');
    const isSubBranch = branchId !== DEFAULT_BRANCH_ID;
    const scopedRecords = isSubBranch
      ? recordsRef.where('branchId', '==', branchId)
      : recordsRef;
    const searches = [];

    if (normalizedNameQuery.length >= MIN_NAME_QUERY_LENGTH) {
      searches.push(
        scopedRecords
          .where('patientFileNameKey', '>=', normalizedNameQuery)
          .where('patientFileNameKey', '<=', `${normalizedNameQuery}\uf8ff`)
          .limit(MAX_DOCUMENTS_PER_FALLBACK_QUERY)
          .get(),
      );
      if (rawNameQuery.length >= MIN_NAME_QUERY_LENGTH) {
        buildLegacyNameQueryVariants(rawNameQuery).forEach((nameVariant) => {
          searches.push(
            scopedRecords
              .where('patientName', '>=', nameVariant)
              .where('patientName', '<=', `${nameVariant}\uf8ff`)
              .limit(MAX_DOCUMENTS_PER_FALLBACK_QUERY)
              .get(),
          );
        });
      }
      // Protect main-branch results from being crowded out by other branches
      // before the legacy in-memory filter is applied.
      if (!isSubBranch) {
        const explicitMainRecords = recordsRef.where('branchId', '==', DEFAULT_BRANCH_ID);
        searches.push(
          explicitMainRecords
            .where('patientFileNameKey', '>=', normalizedNameQuery)
            .where('patientFileNameKey', '<=', `${normalizedNameQuery}\uf8ff`)
            .limit(MAX_DOCUMENTS_PER_FALLBACK_QUERY)
            .get(),
        );
      }
    }

    if (phoneSearchKey.length >= MIN_PHONE_QUERY_LENGTH && rawPhoneQuery) {
      const phoneCandidates = Array.from(new Set([rawPhoneQuery, phoneSearchKey].filter(Boolean)));
      phoneCandidates.forEach((phone) => {
        searches.push(
          scopedRecords
            .where('phone', '==', phone)
            .limit(MAX_DOCUMENTS_PER_FALLBACK_QUERY)
            .get(),
        );
      });
    }

    const settled = await Promise.allSettled(searches);
    const patientMap = new Map();
    settled.forEach((result) => {
      if (result.status !== 'fulfilled') return;
      result.value.docs.forEach((recordDoc) => {
        const data = recordDoc.data() || {};
        const recordBranchId = normalizeText(data.branchId) || DEFAULT_BRANCH_ID;
        if (recordBranchId !== branchId) return;
        const patientName = normalizeOptionalText(data.patientName);
        const patientNameKey = normalizePatientNameForFile(patientName);
        const phone = normalizeOptionalText(data.phone);
        const normalizedPhone = normalizePhoneSearchKey(phone);
        const nameMatches = normalizedNameQuery.length >= MIN_NAME_QUERY_LENGTH
          && patientNameKey.startsWith(normalizedNameQuery);
        const phoneMatches = phoneSearchKey.length >= MIN_PHONE_QUERY_LENGTH
          && normalizedPhone === phoneSearchKey;
        if (!patientName || (!nameMatches && !phoneMatches)) return;

        const key = `${patientNameKey}|${normalizedPhone}`;
        const recordMs = toRecordMs(data.date);
        const current = patientMap.get(key) || {
          id: recordDoc.id,
          patientFileId: normalizeOptionalText(data.patientFileId) || undefined,
          patientName,
          age: undefined,
          phone: phone || undefined,
          address: undefined,
          gender: undefined,
          dateOfBirth: undefined,
          patientFileNumber: undefined,
          lastExamDate: undefined,
          lastConsultationDate: undefined,
          _latestMs: 0,
        };
        if (recordMs >= current._latestMs) {
          current.id = recordDoc.id;
          current.patientFileId = normalizeOptionalText(data.patientFileId) || current.patientFileId;
          current.patientName = patientName;
          current.phone = phone || current.phone;
          current.address = data.address && typeof data.address === 'object'
            ? data.address
            : current.address;
          current._latestMs = recordMs;
        }
        const ageText = buildAgeTextFromRecordAge(data.age);
        const dateOfBirth = normalizeOptionalText(data.dateOfBirth);
        const gender = normalizeOptionalText(data.gender);
        const patientFileNumber = toPositiveFileNumber(data.patientFileNumber);
        if (ageText) current.age = ageText;
        if (dateOfBirth) current.dateOfBirth = dateOfBirth;
        if (gender === 'male' || gender === 'female') current.gender = gender;
        if (patientFileNumber) current.patientFileNumber = patientFileNumber;
        if (data.isConsultationOnly === true) {
          current.lastConsultationDate = pickLatestIso(current.lastConsultationDate, data.date);
        } else {
          current.lastExamDate = pickLatestIso(current.lastExamDate, data.date);
          current.lastConsultationDate = pickLatestIso(
            current.lastConsultationDate,
            data.consultation?.date,
          );
        }
        patientMap.set(key, current);
      });
    });
    return Array.from(patientMap.values());
  };

  const searchPatientsForSecretary = async (request) => {
    const userId = normalizeText(request?.data?.userId);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = normalizeText(request?.data?.sessionToken);
    const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;
    const rawNameQuery = normalizeText(request?.data?.nameQuery);
    const normalizedNameQuery = normalizePatientNameForFile(rawNameQuery);
    const rawPhoneQuery = normalizeText(request?.data?.phoneQuery);
    const phoneSearchKey = normalizePhoneSearchKey(rawPhoneQuery);
    const requesterUid = normalizeText(request?.auth?.uid);
    const requesterRole = normalizeText(request?.auth?.token?.role);
    const isDoctorRequest = requesterUid === userId && requesterRole !== 'secretary';

    if (!userId || (!secret && !isDoctorRequest)) {
      throw new HttpsError('invalid-argument', 'MISSING_PARAMETERS');
    }
    if (
      normalizedNameQuery.length < MIN_NAME_QUERY_LENGTH
      && phoneSearchKey.length < MIN_PHONE_QUERY_LENGTH
    ) return { patients: [] };

    const db = getDb();
    if (!isDoctorRequest) {
      const configSnap = await db.collection('bookingConfig').doc(secret).get();
      if (!configSnap.exists) throw new HttpsError('not-found', 'INVALID_CLINIC_SECRET');
      const configData = configSnap.data() || {};
      if (configData.userId !== userId) {
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
    }
    await assertBranchBelongsToDoctor({ db, userId, branchId, HttpsError });

    const directoryResult = await searchCompactDirectory({
      db,
      userId,
      branchId,
      normalizedNameQuery,
      phoneSearchKey,
    });
    let patients = directoryResult.patients;
    if (!directoryResult.ready) {
      const legacyPatients = await searchLegacyRecords({
        db,
        userId,
        branchId,
        rawNameQuery,
        normalizedNameQuery,
        rawPhoneQuery,
        phoneSearchKey,
      });
      patients = mergePatients(directoryResult.patients, legacyPatients);
    }

    return {
      patients: patients
        .sort((left, right) => Number(right._latestMs || 0) - Number(left._latestMs || 0))
        .slice(0, MAX_PATIENTS_PER_SEARCH)
        .map(({ _latestMs, ...patient }) => ({
          ...patient,
          patientFileId: patient.patientFileId || patient.id,
        })),
      directoryReady: directoryResult.ready,
    };
  };

  return { searchPatientsForSecretary };
};

module.exports.buildLegacyNameQueryVariants = buildLegacyNameQueryVariants;
