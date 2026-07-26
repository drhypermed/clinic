/**
 * Branch-scoped, compact patient directory used by the secretary booking form.
 *
 * Path:
 *   users/{doctorId}/secretaryPatientDirectories/{branchId}/patients/{encodedIdentityKey}
 *
 * The directory deliberately stores identity/search metadata only. Full visits stay
 * in records and are loaded only when a doctor opens a patient file.
 */

const {
  normalizePatientNameForFile,
  resolvePatientFileKey,
} = require('./statsCounterHelpers');

const DIRECTORY_SCHEMA_VERSION = 2;
const DEFAULT_BRANCH_ID = 'main';
const MAX_NAME_SEARCH_PREFIXES = 80;
const MAX_BATCH_OPERATIONS = 400;

const normalizeBranchId = (value) => String(value || '').trim() || DEFAULT_BRANCH_ID;
const normalizePhoneDigits = (value) => String(value || '').replace(/\D/g, '');

/** Normalize Egyptian local/international mobile formats to the same search key. */
const normalizePhoneSearchKey = (value) => {
  let digits = normalizePhoneDigits(value);
  if (!digits) return '';
  if (digits.startsWith('0020') && digits.length >= 14) digits = digits.slice(2);
  if (digits.startsWith('20') && digits.length >= 12) return `0${digits.slice(-10)}`;
  if (digits.length === 10 && digits.startsWith('1')) return `0${digits}`;
  if (digits.length > 11) return digits.slice(-11);
  return digits;
};

const toIsoDateString = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? new Date(ms).toISOString() : '';
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value.toDate === 'function') {
    try { return value.toDate().toISOString(); } catch { return ''; }
  }
  if (typeof value.toMillis === 'function') {
    try { return new Date(value.toMillis()).toISOString(); } catch { return ''; }
  }
  return '';
};

const toDateMs = (value) => {
  const iso = toIsoDateString(value);
  const ms = Date.parse(iso || '');
  return Number.isFinite(ms) ? ms : 0;
};

const toPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

const buildAgeText = (value) => {
  if (!value) return '';
  if (typeof value !== 'object' || Array.isArray(value)) return String(value).trim();
  const years = String(value.years || '').trim();
  const months = String(value.months || '').trim();
  const days = String(value.days || '').trim();
  const parts = [];
  if (years && years !== '0') parts.push(`${years} سنة`);
  if (months && months !== '0') parts.push(`${months} شهر`);
  if (days && days !== '0') parts.push(`${days} يوم`);
  return parts.join(' - ');
};

const normalizePatientAddress = (value) => {
  if (typeof value === 'string') {
    const details = value.replace(/\s+/g, ' ').trim();
    return details ? { details } : null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const governorate = String(value.governorate || '').replace(/\s+/g, ' ').trim();
  const cityArea = String(value.cityArea || '').replace(/\s+/g, ' ').trim();
  const details = String(value.details || '').replace(/\s+/g, ' ').trim();
  if (!governorate && !cityArea && !details) return null;
  return {
    ...(governorate ? { governorate } : {}),
    ...(cityArea ? { cityArea } : {}),
    ...(details ? { details } : {}),
  };
};

/** Supports prefix search from the full name and from any individual name token. */
const buildNameSearchPrefixes = (value) => {
  const normalized = normalizePatientNameForFile(value);
  if (!normalized) return [];
  const prefixes = new Set();
  const appendPrefixes = (text) => {
    for (let length = 2; length <= text.length; length += 1) {
      prefixes.add(text.slice(0, length));
      if (prefixes.size >= MAX_NAME_SEARCH_PREFIXES) return;
    }
  };
  appendPrefixes(normalized);
  for (const token of normalized.split(' ').filter(Boolean)) {
    if (prefixes.size >= MAX_NAME_SEARCH_PREFIXES) break;
    appendPrefixes(token);
  }
  return Array.from(prefixes);
};

const buildDirectoryPatientDocId = (directoryIdentityKey) =>
  encodeURIComponent(String(directoryIdentityKey || '').trim());

const buildDirectoryIdentityKey = (patientFileNameKey, phoneSearchKeys = []) => {
  const nameKey = String(patientFileNameKey || '').trim();
  const primaryPhoneKey = Array.from(phoneSearchKeys).map(String).find(Boolean) || 'no-phone';
  return `${nameKey}|${primaryPhoneKey}`;
};

const maxIso = (currentValue, nextValue) => {
  const currentIso = toIsoDateString(currentValue);
  const nextIso = toIsoDateString(nextValue);
  if (!nextIso) return currentIso;
  if (!currentIso) return nextIso;
  return Date.parse(nextIso) >= Date.parse(currentIso) ? nextIso : currentIso;
};

const extractPhoneValues = (data) => {
  const rawPhones = [data?.phone, data?.patientPhone, data?.guardianPhone]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  const phones = Array.from(new Set(rawPhones));
  const phoneSearchKeys = Array.from(new Set(phones.map(normalizePhoneSearchKey).filter(Boolean)));
  return { phones, phoneSearchKeys };
};

const buildRecordContribution = (data) => {
  if (!data || typeof data !== 'object') return null;
  const patientFileNameKey = resolvePatientFileKey(data);
  const patientName = String(data.patientName || '').trim();
  if (!patientFileNameKey || !patientName) return null;

  const branchId = normalizeBranchId(data.branchId);
  const recordDate = toIsoDateString(data.dateMs) || toIsoDateString(data.date);
  const recordDateMs = toDateMs(recordDate);
  const isConsultationOnly = data.isConsultationOnly === true;
  const hasInlineConsultation = !isConsultationOnly
    && data.consultation
    && typeof data.consultation === 'object'
    && data.consultation.date
    && !data.consultationRecordId;
  const inlineConsultationDate = hasInlineConsultation
    ? toIsoDateString(data.consultation.date)
    : '';
  const { phones, phoneSearchKeys } = extractPhoneValues(data);
  const directoryIdentityKey = buildDirectoryIdentityKey(patientFileNameKey, phoneSearchKeys);

  return {
    branchId,
    directoryIdentityKey,
    patientFileNameKey,
    patientName,
    patientFileNumber: toPositiveInteger(data.patientFileNumber),
    patientFileId: String(data.patientFileId || '').trim(),
    phones,
    phoneSearchKeys,
    age: buildAgeText(data.age),
    address: normalizePatientAddress(data.address),
    address: normalizePatientAddress(data.address),
    dateOfBirth: String(data.dateOfBirth || '').trim(),
    gender: data.gender === 'male' || data.gender === 'female' ? data.gender : '',
    identityUpdatedAtMs: recordDateMs,
    totalExams: isConsultationOnly ? 0 : 1,
    totalConsultations: isConsultationOnly || hasInlineConsultation ? 1 : 0,
    lastExamDate: isConsultationOnly ? '' : recordDate,
    lastConsultationDate: isConsultationOnly ? recordDate : inlineConsultationDate,
    lastVisitAtMs: Math.max(recordDateMs, toDateMs(inlineConsultationDate)),
  };
};

const createEmptySummary = (contribution) => ({
  branchId: contribution.branchId,
  directoryIdentityKey: contribution.directoryIdentityKey,
  patientFileNameKey: contribution.patientFileNameKey,
  patientName: '',
  patientFileNumber: 0,
  patientFileId: '',
  phones: new Set(),
  phoneSearchKeys: new Set(),
  age: '',
  address: null,
  address: null,
  dateOfBirth: '',
  gender: '',
  identityUpdatedAtMs: 0,
  totalExams: 0,
  totalConsultations: 0,
  lastExamDate: '',
  lastConsultationDate: '',
  lastVisitAtMs: 0,
});

const hydrateSummary = (data, contribution) => {
  const summary = createEmptySummary(contribution);
  if (!data || typeof data !== 'object') return summary;
  summary.patientName = String(data.patientName || '');
  summary.directoryIdentityKey = String(data.directoryIdentityKey || contribution.directoryIdentityKey);
  summary.patientFileNumber = toPositiveInteger(data.patientFileNumber);
  summary.patientFileId = String(data.patientFileId || '');
  summary.phones = new Set(Array.isArray(data.phones) ? data.phones.map(String) : []);
  summary.phoneSearchKeys = new Set(
    Array.isArray(data.phoneSearchKeys) ? data.phoneSearchKeys.map(String) : [],
  );
  summary.age = String(data.age || '');
  summary.address = normalizePatientAddress(data.address);
  summary.address = normalizePatientAddress(data.address);
  summary.dateOfBirth = String(data.dateOfBirth || '');
  summary.gender = data.gender === 'male' || data.gender === 'female' ? data.gender : '';
  summary.identityUpdatedAtMs = Number(data.identityUpdatedAtMs || 0);
  summary.totalExams = Math.max(0, Number(data.totalExams || 0));
  summary.totalConsultations = Math.max(0, Number(data.totalConsultations || 0));
  summary.lastExamDate = toIsoDateString(data.lastExamDate);
  summary.lastConsultationDate = toIsoDateString(data.lastConsultationDate);
  summary.lastVisitAtMs = Math.max(0, Number(data.lastVisitAtMs || 0));
  return summary;
};

const mergeContribution = (summary, contribution) => {
  if (!summary) summary = createEmptySummary(contribution);
  contribution.phones.forEach((phone) => summary.phones.add(phone));
  contribution.phoneSearchKeys.forEach((phone) => summary.phoneSearchKeys.add(phone));
  summary.totalExams += contribution.totalExams;
  summary.totalConsultations += contribution.totalConsultations;
  summary.lastExamDate = maxIso(summary.lastExamDate, contribution.lastExamDate);
  summary.lastConsultationDate = maxIso(
    summary.lastConsultationDate,
    contribution.lastConsultationDate,
  );
  summary.lastVisitAtMs = Math.max(summary.lastVisitAtMs, contribution.lastVisitAtMs);

  if (!summary.patientName || contribution.identityUpdatedAtMs >= summary.identityUpdatedAtMs) {
    summary.patientName = contribution.patientName || summary.patientName;
    summary.age = contribution.age || summary.age;
    summary.address = contribution.address || summary.address;
    summary.address = contribution.address || summary.address;
    summary.dateOfBirth = contribution.dateOfBirth || summary.dateOfBirth;
    summary.gender = contribution.gender || summary.gender;
    summary.identityUpdatedAtMs = contribution.identityUpdatedAtMs;
  }
  if (!summary.patientFileNumber && contribution.patientFileNumber) {
    summary.patientFileNumber = contribution.patientFileNumber;
  }
  if (!summary.patientFileId && contribution.patientFileId) {
    summary.patientFileId = contribution.patientFileId;
  }
  return summary;
};

const serializeSummary = (summary, timestampValue) => {
  const payload = {
    schemaVersion: DIRECTORY_SCHEMA_VERSION,
    branchId: summary.branchId,
    directoryIdentityKey: summary.directoryIdentityKey,
    patientFileNameKey: summary.patientFileNameKey,
    patientName: summary.patientName,
    nameSearchPrefixes: buildNameSearchPrefixes(summary.patientName || summary.patientFileNameKey),
    phones: Array.from(summary.phones),
    phoneSearchKeys: Array.from(summary.phoneSearchKeys),
    identityUpdatedAtMs: summary.identityUpdatedAtMs,
    lastVisitAtMs: summary.lastVisitAtMs,
    updatedAt: timestampValue,
  };
  if (summary.patientFileNumber > 0) payload.patientFileNumber = summary.patientFileNumber;
  if (summary.patientFileId) payload.patientFileId = summary.patientFileId;
  if (summary.age) payload.age = summary.age;
  if (summary.address) payload.address = summary.address;
  if (summary.address) payload.address = summary.address;
  if (summary.dateOfBirth) payload.dateOfBirth = summary.dateOfBirth;
  if (summary.gender) payload.gender = summary.gender;
  if (summary.lastExamDate) payload.lastExamDate = summary.lastExamDate;
  if (summary.lastConsultationDate) payload.lastConsultationDate = summary.lastConsultationDate;
  return payload;
};

const relevantContributionSignature = (contribution) => {
  if (!contribution) return '';
  return JSON.stringify({
    ...contribution,
    phones: [...contribution.phones].sort(),
    phoneSearchKeys: [...contribution.phoneSearchKeys].sort(),
  });
};

const buildAllSummaries = (recordDocs) => {
  const summaries = new Map();
  for (const recordDoc of recordDocs || []) {
    const data = typeof recordDoc?.data === 'function' ? recordDoc.data() : recordDoc;
    const contribution = buildRecordContribution(data);
    if (!contribution) continue;
    const key = `${contribution.branchId}|${contribution.directoryIdentityKey}`;
    summaries.set(key, mergeContribution(summaries.get(key), contribution));
  }
  return summaries;
};

module.exports = ({ HttpsError, getDb, admin }) => {
  const FieldValue = admin.firestore.FieldValue;

  const branchRefFor = (db, userId, branchId) =>
    db.doc(`users/${userId}/secretaryPatientDirectories/${branchId}`);
  const patientRefFor = (db, userId, contribution) =>
    branchRefFor(db, userId, contribution.branchId)
      .collection('patients')
      .doc(buildDirectoryPatientDocId(contribution.directoryIdentityKey));

  const writeIncrementalContribution = async (db, userId, contribution) => {
    const patientRef = patientRefFor(db, userId, contribution);
    const branchRef = branchRefFor(db, userId, contribution.branchId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(patientRef);
      const summary = mergeContribution(
        hydrateSummary(snap.exists ? snap.data() : null, contribution),
        contribution,
      );
      tx.set(patientRef, serializeSummary(summary, FieldValue.serverTimestamp()), { merge: false });
      tx.set(branchRef, {
        branchId: contribution.branchId,
        lastIncrementalAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    });
  };

  const rebuildOnePatient = async (db, userId, contribution, rawNames = []) => {
    if (!contribution) return;
    const recordsRef = db.collection(`users/${userId}/records`);
    const queries = [recordsRef.where('patientFileNameKey', '==', contribution.patientFileNameKey).get()];
    Array.from(new Set(rawNames.map((value) => String(value || '').trim()).filter(Boolean)))
      .forEach((name) => queries.push(recordsRef.where('patientName', '==', name).get()));
    const settled = await Promise.allSettled(queries);
    const docsById = new Map();
    settled.forEach((result) => {
      if (result.status !== 'fulfilled') return;
      result.value.docs.forEach((doc) => docsById.set(doc.id, doc));
    });
    const matchingDocs = Array.from(docsById.values()).filter((doc) => {
      const data = doc.data() || {};
      return normalizeBranchId(data.branchId) === contribution.branchId
        && resolvePatientFileKey(data) === contribution.patientFileNameKey;
    });
    const summaries = buildAllSummaries(matchingDocs);
    const patientsRef = branchRefFor(db, userId, contribution.branchId).collection('patients');
    const existing = await patientsRef
      .where('patientFileNameKey', '==', contribution.patientFileNameKey)
      .get();
    const batch = db.batch();
    existing.docs.forEach((doc) => batch.delete(doc.ref));
    for (const summary of summaries.values()) {
      const patientRef = patientsRef.doc(buildDirectoryPatientDocId(summary.directoryIdentityKey));
      batch.set(
        patientRef,
        serializeSummary(summary, FieldValue.serverTimestamp()),
        { merge: false },
      );
    }
    await batch.commit();
  };

  const syncSecretaryPatientDirectory = async (event) => {
    const userId = String(event?.params?.userId || '').trim();
    if (!userId) return;
    const before = event?.data?.before?.exists ? event.data.before.data() : null;
    const after = event?.data?.after?.exists ? event.data.after.data() : null;
    const beforeContribution = buildRecordContribution(before);
    const afterContribution = buildRecordContribution(after);
    if (!beforeContribution && !afterContribution) return;
    const db = getDb();

    if (!beforeContribution && afterContribution) {
      await writeIncrementalContribution(db, userId, afterContribution);
      return;
    }

    if (
      beforeContribution
      && afterContribution
      && relevantContributionSignature(beforeContribution) === relevantContributionSignature(afterContribution)
    ) {
      return;
    }

    const affected = new Map();
    if (beforeContribution) {
      affected.set(`${beforeContribution.branchId}|${beforeContribution.patientFileNameKey}`, {
        contribution: beforeContribution,
        names: [before?.patientName, after?.patientName],
      });
    }
    if (afterContribution) {
      affected.set(`${afterContribution.branchId}|${afterContribution.patientFileNameKey}`, {
        contribution: afterContribution,
        names: [before?.patientName, after?.patientName],
      });
    }
    for (const item of affected.values()) {
      await rebuildOnePatient(db, userId, item.contribution, item.names);
    }
  };

  const recomputeDirectoryForUser = async (db, userId) => {
    const recordsSnap = await db.collection(`users/${userId}/records`).get();
    const summaries = buildAllSummaries(recordsSnap.docs);
    const rootRef = db.collection(`users/${userId}/secretaryPatientDirectories`);
    const existingBranchSnap = await rootRef.get();
    const expectedPatientIdsByBranch = new Map();
    for (const summary of summaries.values()) {
      const ids = expectedPatientIdsByBranch.get(summary.branchId) || new Set();
      ids.add(buildDirectoryPatientDocId(summary.directoryIdentityKey));
      expectedPatientIdsByBranch.set(summary.branchId, ids);
    }
    let batch = db.batch();
    let batchOperations = 0;
    const flush = async () => {
      if (batchOperations === 0) return;
      await batch.commit();
      batch = db.batch();
      batchOperations = 0;
    };
    const enqueue = async (operation) => {
      operation(batch);
      batchOperations += 1;
      if (batchOperations >= MAX_BATCH_OPERATIONS) await flush();
    };

    for (const branchDoc of existingBranchSnap.docs) {
      const existingPatients = await branchDoc.ref.collection('patients').get();
      for (const patientDoc of existingPatients.docs) {
        const stillExpected = expectedPatientIdsByBranch.get(branchDoc.id)?.has(patientDoc.id) === true;
        if (!stillExpected) await enqueue((activeBatch) => activeBatch.delete(patientDoc.ref));
      }
    }

    const patientCountByBranch = new Map();
    for (const summary of summaries.values()) {
      const branchRef = rootRef.doc(summary.branchId);
      const patientRef = branchRef.collection('patients')
        .doc(buildDirectoryPatientDocId(summary.directoryIdentityKey));
      patientCountByBranch.set(summary.branchId, (patientCountByBranch.get(summary.branchId) || 0) + 1);
      await enqueue((activeBatch) => activeBatch.set(
        patientRef,
        serializeSummary(summary, FieldValue.serverTimestamp()),
        { merge: false },
      ));
    }

    const allBranchIds = new Set([
      ...existingBranchSnap.docs.map((doc) => doc.id),
      ...patientCountByBranch.keys(),
    ]);
    for (const branchId of allBranchIds) {
      await enqueue((activeBatch) => activeBatch.set(rootRef.doc(branchId), {
        schemaVersion: DIRECTORY_SCHEMA_VERSION,
        branchId,
        ready: true,
        patientCount: patientCountByBranch.get(branchId) || 0,
        lastReconciledAt: FieldValue.serverTimestamp(),
      }, { merge: true }));
    }
    await flush();
    return {
      totalPatients: summaries.size,
      totalRecordsProcessed: recordsSnap.size,
      branches: patientCountByBranch.size,
    };
  };

  const recomputeSecretaryPatientDirectory = async (request) => {
    const userId = String(request?.auth?.uid || '').trim();
    if (!userId || String(request?.auth?.token?.role || '') === 'secretary') {
      throw new HttpsError('unauthenticated', 'DOCTOR_AUTH_REQUIRED');
    }
    const result = await recomputeDirectoryForUser(getDb(), userId);
    return { ok: true, ...result, schemaVersion: DIRECTORY_SCHEMA_VERSION };
  };

  return {
    syncSecretaryPatientDirectory,
    recomputeSecretaryPatientDirectory,
    recomputeDirectoryForUser,
  };
};

module.exports.DIRECTORY_SCHEMA_VERSION = DIRECTORY_SCHEMA_VERSION;
module.exports.normalizePhoneSearchKey = normalizePhoneSearchKey;
module.exports.buildNameSearchPrefixes = buildNameSearchPrefixes;
module.exports.buildDirectoryPatientDocId = buildDirectoryPatientDocId;
module.exports.buildDirectoryIdentityKey = buildDirectoryIdentityKey;
module.exports.buildRecordContribution = buildRecordContribution;
module.exports.buildAllSummaries = buildAllSummaries;
module.exports.serializeSummary = serializeSummary;
