/**
 * عدّاد ملخصات المرضى (per-patient summaries counter).
 * يحدّث doc لكل مريض في users/{userId}/patientSummaries/{patientFileNameKey}.
 * المنطق متطابق 100% مع buildPatientFiles في patientFilesShared.ts.
 */

const { isUserAllowed } = require('./statsCounterAllowlist');
const { resolvePatientFileKey } = require('./statsCounterHelpers');
const { recomputeSummariesForUser } = require('./statsCounterCore');

module.exports = ({ admin, getDb }) => {
  const FieldValue = admin.firestore.FieldValue;

  const isStandaloneConsultation = (data) => Boolean(data) && data.isConsultationOnly === true;
  const isExam = (data) => Boolean(data) && data.isConsultationOnly !== true;

  const hasInlineConsultation = (data) => {
    if (!data) return false;
    if (!data.consultation || typeof data.consultation !== 'object') return false;
    if (!data.consultation.date) return false;
    if (data.consultationRecordId) return false;
    return true;
  };

  const parseDateToMs = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string') {
      const parsed = Date.parse(raw);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (raw && typeof raw.toMillis === 'function') {
      try { return raw.toMillis(); } catch { return null; }
    }
    return null;
  };

  const getExamDateMs = (data) => {
    if (!data) return null;
    const fromDateMs = parseDateToMs(data.dateMs);
    if (fromDateMs !== null) return fromDateMs;
    return parseDateToMs(data.date);
  };

  const getInlineConsultationDateMs = (data) => {
    if (!data || !data.consultation) return null;
    return parseDateToMs(data.consultation.date);
  };

  const computeRecordVisits = (data) => {
    let exams = 0;
    let consultations = 0;
    let latestVisitMs = null;

    if (isStandaloneConsultation(data)) {
      consultations = 1;
      latestVisitMs = getExamDateMs(data);
    } else if (isExam(data)) {
      exams = 1;
      const examMs = getExamDateMs(data);
      latestVisitMs = examMs;

      if (hasInlineConsultation(data)) {
        consultations = 1;
        const consultMs = getInlineConsultationDateMs(data);
        if (consultMs && (!latestVisitMs || consultMs > latestVisitMs)) {
          latestVisitMs = consultMs;
        }
      }
    }

    return { exams, consultations, latestVisitMs };
  };

  const extractPhones = (data) => {
    if (!data) return [];
    const sources = [data.phone, data.patientPhone, data.guardianPhone];
    const result = [];
    sources.forEach((value) => {
      const trimmed = String(value || '').trim();
      if (trimmed && !result.includes(trimmed)) {
        result.push(trimmed);
      }
    });
    return result;
  };

  const updateSummary = async (db, userId, fileNameKey, sign, data) => {
    if (!fileNameKey) return;

    const summaryRef = db.doc(`users/${userId}/patientSummaries/${fileNameKey}`);
    const visits = computeRecordVisits(data);
    const phones = extractPhones(data);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(summaryRef);
      const current = snap.exists ? snap.data() : {};

      if (sign === 0 && !snap.exists) return;

      const currentExams = Number(current.totalExams || 0);
      const currentConsultations = Number(current.totalConsultations || 0);
      const nextExams = Math.max(0, currentExams + sign * visits.exams);
      const nextConsultations = Math.max(0, currentConsultations + sign * visits.consultations);
      const nextTotal = nextExams + nextConsultations;

      if (sign < 0 && nextTotal <= 0) {
        tx.delete(summaryRef);
        return;
      }

      const updates = {
        patientFileNameKey: fileNameKey,
        patientName: String(data.patientName || current.patientName || '').trim(),
        totalExams: nextExams,
        totalConsultations: nextConsultations,
        lastUpdatedAt: FieldValue.serverTimestamp(),
      };

      const fileNumber = Number(data.patientFileNumber || current.patientFileNumber || 0);
      if (fileNumber > 0) updates.patientFileNumber = fileNumber;

      const fileId = String(data.patientFileId || current.patientFileId || '').trim();
      if (fileId) updates.patientFileId = fileId;

      if (sign >= 0 && phones.length > 0) {
        updates.phones = FieldValue.arrayUnion(...phones);
      }

      if (sign > 0 && Number.isFinite(visits.latestVisitMs)) {
        const currentLast = Number(current.lastVisitAtMs || 0);
        if (visits.latestVisitMs > currentLast) {
          updates.lastVisitAtMs = visits.latestVisitMs;
          updates.lastVisitType = visits.consultations > 0 && visits.exams === 0 ? 'consultation' : 'exam';
        }
        const currentFirst = Number(current.firstVisitAtMs || 0);
        if (currentFirst === 0 || visits.latestVisitMs < currentFirst) {
          updates.firstVisitAtMs = visits.latestVisitMs;
        }
      }

      tx.set(summaryRef, updates, { merge: true });
    });
  };

  const syncPatientSummary = async (event) => {
    const userId = event.params && event.params.userId;
    if (!userId) return;
    if (!isUserAllowed(userId)) return;

    const before = event.data && event.data.before && event.data.before.exists
      ? event.data.before.data()
      : null;
    const after = event.data && event.data.after && event.data.after.exists
      ? event.data.after.data()
      : null;

    const db = getDb();

    // Auto-bootstrap: لو الطبيب ما عندوش أي ملخصات، نعمل recompute كامل
    // لكل المرضى من السجلات. مرة واحدة بس عند أول write لأي طبيب جديد.
    const checkSnap = await db.collection(`users/${userId}/patientSummaries`).limit(1).get();
    if (checkSnap.empty) {
      await recomputeSummariesForUser(db, userId, FieldValue);
      return;
    }

    // استخدم resolvePatientFileKey للسجلات بدون patientFileNameKey صريح
    const beforeKey = before ? resolvePatientFileKey(before) : '';
    const afterKey = after ? resolvePatientFileKey(after) : '';

    if (before && !after) {
      if (beforeKey) await updateSummary(db, userId, beforeKey, -1, before);
      return;
    }

    if (!before && after) {
      if (afterKey) await updateSummary(db, userId, afterKey, +1, after);
      return;
    }

    if (before && after) {
      if (beforeKey === afterKey) {
        if (afterKey) await updateSummary(db, userId, afterKey, 0, after);
      } else {
        if (beforeKey) await updateSummary(db, userId, beforeKey, -1, before);
        if (afterKey) await updateSummary(db, userId, afterKey, +1, after);
      }
    }
  };

  return { syncPatientSummary };
};
