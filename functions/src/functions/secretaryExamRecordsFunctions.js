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

module.exports = ({ HttpsError, getDb, admin }) => {
  const normalizePatientAddress = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const address = {};
    const governorate = normalizeText(value.governorate).slice(0, 120);
    const cityArea = normalizeText(value.cityArea).slice(0, 160);
    const details = normalizeText(value.details).slice(0, 300);
    if (governorate) address.governorate = governorate;
    if (cityArea) address.cityArea = cityArea;
    if (details) address.details = details;
    return Object.keys(address).length > 0 ? address : undefined;
  };

  const buildAgeTextFromRecordAge = (age) => {
    if (!age || typeof age !== 'object') return '';

    const years = normalizeText(age.years);
    const months = normalizeText(age.months);
    const days = normalizeText(age.days);
    const parts = [];

    if (years && years !== '0') parts.push(`${years} سنة`);
    if (months && months !== '0') parts.push(`${months} شهر`);
    if (days && days !== '0') parts.push(`${days} يوم`);

    return parts.join(' - ');
  };

  const CONSULTATION_RECORD_PREFIX = 'consultation__';

  const listRecentExamRecordsForSecretary = async (request) => {
    const userId = normalizeText(request?.data?.userId);
    const secret = normalizeSecret(request?.data?.secret);
    const sessionToken = normalizeText(request?.data?.sessionToken);
    const branchId = normalizeText(request?.data?.branchId) || DEFAULT_BRANCH_ID;

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

    const recordsRef = db.collection('users').doc(userId).collection('records');

    // ⚠️ تحسين multi-branch (إصلاح فقدان السجلات + خفض التكلفة):
    //   - للفرع الفرعي (≠ main): نضيف where('branchId') عشان الـ limit(2000) يقطع
    //     من سجلات فرع السكرتيرة فقط. بدون الـ where، لو الفرع الرئيسي عنده
    //     2000+ سجل أحدث، الـ limit يأكل المساحة كلها وسجلات الفرع الفرعي ما تظهرش.
    //   - للفرع الرئيسي (main): نسيب الـ query زي ما هي عشان البيانات القديمة
    //     قبل نظام الفروع (بدون branchId) ما تختفيش — الـ in-memory filter بعدها
    //     يلتقطها لأنه يـ default الـ branchId الفاضي إلى 'main'.
    const isSubBranch = branchId !== DEFAULT_BRANCH_ID;
    const baseQuery = isSubBranch
      ? recordsRef.where('branchId', '==', branchId)
      : recordsRef;

    const cutoffMs = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const cutoffIso = new Date(cutoffMs).toISOString();
    const batchSize = 300;
    const recordsDocs = [];
    let cursor = null;
    let orderedQueryAvailable = true;

    // نُكمل بالـ cursor حتى نهاية آخر 30 يوماً. سجلات الاستشارات
    // وسجلات الفروع الأخرى لا تفرض حداً على عدد الكشوف المؤهلة.
    while (true) {
      let pageQuery = baseQuery.where('date', '>=', cutoffIso);
      if (orderedQueryAvailable) pageQuery = pageQuery.orderBy('date', 'desc');
      if (cursor) pageQuery = pageQuery.startAfter(cursor);
      pageQuery = pageQuery.limit(batchSize);

      let pageSnap;
      try {
        pageSnap = await pageQuery.get();
      } catch (error) {
        if (!orderedQueryAvailable) throw error;
        console.warn('[secretaryFunctions] Falling back to unordered records read:', error?.message || error);
        orderedQueryAvailable = false;
        cursor = null;
        recordsDocs.length = 0;
        continue;
      }

      if (pageSnap.empty) break;
      pageSnap.docs.forEach((recordDoc) => {
        const data = recordDoc.data() || {};
        const recordBranchId = normalizeText(data.branchId) || DEFAULT_BRANCH_ID;
        if (recordBranchId !== branchId) return;

        recordsDocs.push({ id: recordDoc.id, data });
      });

      cursor = pageSnap.docs[pageSnap.docs.length - 1] || null;
      if (pageSnap.size < batchSize || !cursor) break;
    }

    const maxIsoDate = (currentValue, nextValue) => {
      const currentIso = toIsoDateString(currentValue);
      const nextIso = toIsoDateString(nextValue);
      if (!nextIso) return currentIso || '';
      if (!currentIso) return nextIso;
      const currentMs = Date.parse(currentIso);
      const nextMs = Date.parse(nextIso);
      if (!Number.isFinite(nextMs)) return currentIso;
      if (!Number.isFinite(currentMs) || nextMs > currentMs) return nextIso;
      return currentIso;
    };

    const parseSourceRecordIdFromConsultationDocId = (consultationRecordId) => {
      const normalizedId = normalizeOptionalText(consultationRecordId);
      if (!normalizedId || !normalizedId.startsWith(CONSULTATION_RECORD_PREFIX)) return '';

      const raw = normalizedId.slice(CONSULTATION_RECORD_PREFIX.length);
      if (!raw) return '';

      const separatorIndex = raw.indexOf('__');
      if (separatorIndex === -1) return raw;
      return raw.slice(0, separatorIndex);
    };

    const consultationDatesBySourceRecordId = new Map();
    const appendConsultationDateForSourceRecord = (sourceRecordId, consultationDateIso) => {
      const normalizedSourceRecordId = normalizeOptionalText(sourceRecordId);
      const normalizedConsultationDate = toIsoDateString(consultationDateIso);
      if (!normalizedSourceRecordId || !normalizedConsultationDate) return;

      const existing = consultationDatesBySourceRecordId.get(normalizedSourceRecordId) || [];
      if (!existing.includes(normalizedConsultationDate)) {
        existing.push(normalizedConsultationDate);
        consultationDatesBySourceRecordId.set(normalizedSourceRecordId, existing);
      }
    };

    recordsDocs.forEach(({ id, data }) => {
      if (data.isConsultationOnly !== true) return;

      const explicitSourceId = normalizeOptionalText(data.sourceExamRecordId);
      const sourceRecordId = explicitSourceId || parseSourceRecordIdFromConsultationDocId(id);
      if (!sourceRecordId) return;

      const consultationDateIso = toIsoDateString(data.date) || toIsoDateString(data.consultation?.date);
      if (!consultationDateIso) return;

      appendConsultationDateForSourceRecord(sourceRecordId, consultationDateIso);
    });

    const recentExamPatients = recordsDocs
      .map(({ id, data }) => {
        if (data.isConsultationOnly === true) return null;

        const examCompletedAt = toIsoDateString(data.date);
        const examCompletedAtMs = Date.parse(examCompletedAt || '');
        if (!examCompletedAt || !Number.isFinite(examCompletedAtMs) || examCompletedAtMs < cutoffMs) {
          return null;
        }

        const patientName = normalizeOptionalText(data.patientName) || 'بدون اسم';
        const age = buildAgeTextFromRecordAge(data.age);
        const phone = normalizeOptionalText(data.phone);
        const address = normalizePatientAddress(data.address);

        const embeddedConsultationIso = toIsoDateString(data.consultation?.date);
        const separatedConsultationDates = consultationDatesBySourceRecordId.get(id) || [];

        const mergedConsultationDates = Array.from(
          new Set([
            ...separatedConsultationDates,
            ...(embeddedConsultationIso ? [embeddedConsultationIso] : []),
          ])
        )
          .filter((value) => Number.isFinite(Date.parse(value)))
          .sort((left, right) => Date.parse(right) - Date.parse(left));

        const consultationCompletedAt = mergedConsultationDates[0] || '';

        return {
          id,
          patientName,
          patientFileNumber: toPositiveFileNumber(data.patientFileNumber) || undefined,
          age: age || undefined,
          phone: phone || undefined,
          address,
          gender: data.gender === 'male' || data.gender === 'female' ? data.gender : undefined,
          dateOfBirth: normalizeOptionalText(data.dateOfBirth) || undefined,
          examCompletedAt,
          consultationCompletedAt: consultationCompletedAt || undefined,
          consultationCompletedDates: mergedConsultationDates.length > 0
            ? mergedConsultationDates
            : undefined,
          consultationSourceRecordId: id,
          _examCompletedAtMs: examCompletedAtMs,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b._examCompletedAtMs - a._examCompletedAtMs)
      .map(({ _examCompletedAtMs, ...item }) => item);

    const patientDirectoryMap = new Map();
    recordsDocs.forEach(({ id, data }) => {
      const patientName = normalizeOptionalText(data.patientName);
      const phone = normalizeOptionalText(data.phone);
      if (!patientName && !phone) return;

      const recordDateIso = toIsoDateString(data.date);
      const recordDateMs = Date.parse(recordDateIso || '');
      const key = `${patientName}|${phone}`;
      const ageText = buildAgeTextFromRecordAge(data.age);
      const patientFileNumber = toPositiveFileNumber(data.patientFileNumber);

      const current = patientDirectoryMap.get(key) || {
        id,
        patientName: patientName || 'بدون اسم',
        age: ageText || undefined,
        phone: phone || undefined,
        lastExamDate: undefined,
        lastConsultationDate: undefined,
        patientFileNumber,
        _time: Number.isFinite(recordDateMs) ? recordDateMs : 0,
      };

      if (Number.isFinite(recordDateMs) && recordDateMs >= current._time) {
        current.id = id;
        current.patientName = patientName || current.patientName || 'بدون اسم';
        current.age = ageText || current.age;
        current.phone = phone || current.phone;
        if (patientFileNumber) current.patientFileNumber = patientFileNumber;
        current._time = recordDateMs;
      }

      if (!current.patientFileNumber && patientFileNumber) {
        current.patientFileNumber = patientFileNumber;
      }

      if (data.isConsultationOnly === true) {
        current.lastConsultationDate = maxIsoDate(current.lastConsultationDate, data.date);
      } else {
        current.lastExamDate = maxIsoDate(current.lastExamDate, data.date);
        if (data.consultation?.date) {
          current.lastConsultationDate = maxIsoDate(current.lastConsultationDate, data.consultation.date);
        }
      }

      patientDirectoryMap.set(key, current);
    });

    const patientDirectory = Array.from(patientDirectoryMap.values())
      .sort((a, b) => b._time - a._time)
      .slice(0, 300)
      .map(({ _time, ...item }) => item);

    return {
      recentExamPatients,
    };
  };

  return { listRecentExamRecordsForSecretary };
};
