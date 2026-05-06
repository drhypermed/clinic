/**
 * إعادة حساب ملخصات المرضى من الصفر (reconciliation).
 * المنطق متطابق مع perPatientSummariesCounter.js و buildPatientFiles.
 */

const { isUserAllowed } = require('./statsCounterAllowlist');
const { resolvePatientFileKey } = require('./statsCounterHelpers');

module.exports = ({ admin, getDb, HttpsError }) => {
  const FieldValue = admin.firestore.FieldValue;

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

  const recomputePatientSummaries = async (request) => {
    const userId = request && request.auth && request.auth.uid;
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    if (!isUserAllowed(userId)) {
      throw new HttpsError('permission-denied', 'Patient summaries not enabled for this account');
    }

    const db = getDb();

    // 1) جلب كل السجلات
    const recordsSnap = await db.collection(`users/${userId}/records`).get();

    // 2) بناء map لكل مريض
    const summaries = new Map();

    recordsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (!data) return;

      // استخدم resolvePatientFileKey للسجلات بدون patientFileNameKey صريح
      const fileNameKey = resolvePatientFileKey(data);
      if (!fileNameKey) return;

      let summary = summaries.get(fileNameKey);
      if (!summary) {
        summary = {
          patientFileNameKey: fileNameKey,
          patientName: '',
          patientFileNumber: 0,
          patientFileId: '',
          phones: new Set(),
          totalExams: 0,
          totalConsultations: 0,
          lastVisitAtMs: 0,
          lastVisitType: 'exam',
          firstVisitAtMs: 0,
        };
        summaries.set(fileNameKey, summary);
      }

      if (!summary.patientName) {
        summary.patientName = String(data.patientName || '').trim();
      }
      const fileNumber = Number(data.patientFileNumber || 0);
      if (!summary.patientFileNumber && fileNumber > 0) {
        summary.patientFileNumber = fileNumber;
      }
      if (!summary.patientFileId) {
        summary.patientFileId = String(data.patientFileId || '').trim();
      }

      extractPhones(data).forEach((phone) => summary.phones.add(phone));

      const examDateMs = parseDateToMs(data.dateMs) || parseDateToMs(data.date);

      if (data.isConsultationOnly === true) {
        summary.totalConsultations += 1;
        if (Number.isFinite(examDateMs)) {
          if (examDateMs > summary.lastVisitAtMs) {
            summary.lastVisitAtMs = examDateMs;
            summary.lastVisitType = 'consultation';
          }
          if (summary.firstVisitAtMs === 0 || examDateMs < summary.firstVisitAtMs) {
            summary.firstVisitAtMs = examDateMs;
          }
        }
      } else {
        summary.totalExams += 1;
        if (Number.isFinite(examDateMs)) {
          if (examDateMs > summary.lastVisitAtMs) {
            summary.lastVisitAtMs = examDateMs;
            summary.lastVisitType = 'exam';
          }
          if (summary.firstVisitAtMs === 0 || examDateMs < summary.firstVisitAtMs) {
            summary.firstVisitAtMs = examDateMs;
          }
        }

        const hasInline = data.consultation
          && typeof data.consultation === 'object'
          && data.consultation.date
          && !data.consultationRecordId;
        if (hasInline) {
          summary.totalConsultations += 1;
          const consultMs = parseDateToMs(data.consultation.date);
          if (Number.isFinite(consultMs)) {
            if (consultMs > summary.lastVisitAtMs) {
              summary.lastVisitAtMs = consultMs;
              summary.lastVisitType = 'consultation';
            }
            if (summary.firstVisitAtMs === 0 || consultMs < summary.firstVisitAtMs) {
              summary.firstVisitAtMs = consultMs;
            }
          }
        }
      }
    });

    // 3) شيل الملخصات القديمة (المرضى اللي مش في الـ map الجديد)
    const existingSummariesSnap = await db.collection(`users/${userId}/patientSummaries`).get();
    let batch = db.batch();
    let batchOpsCount = 0;
    const MAX_BATCH_OPS = 450;

    for (const doc of existingSummariesSnap.docs) {
      if (!summaries.has(doc.id)) {
        batch.delete(doc.ref);
        batchOpsCount += 1;
        if (batchOpsCount >= MAX_BATCH_OPS) {
          await batch.commit();
          batch = db.batch();
          batchOpsCount = 0;
        }
      }
    }

    // 4) كتابة الملخصات الجديدة
    const reconciledAt = FieldValue.serverTimestamp();
    for (const [fileNameKey, summary] of summaries.entries()) {
      const ref = db.doc(`users/${userId}/patientSummaries/${fileNameKey}`);
      const payload = {
        patientFileNameKey: summary.patientFileNameKey,
        patientName: summary.patientName,
        totalExams: summary.totalExams,
        totalConsultations: summary.totalConsultations,
        phones: Array.from(summary.phones),
        lastReconciledAt: reconciledAt,
        lastUpdatedAt: reconciledAt,
      };
      if (summary.patientFileNumber > 0) payload.patientFileNumber = summary.patientFileNumber;
      if (summary.patientFileId) payload.patientFileId = summary.patientFileId;
      if (summary.lastVisitAtMs > 0) {
        payload.lastVisitAtMs = summary.lastVisitAtMs;
        payload.lastVisitType = summary.lastVisitType;
      }
      if (summary.firstVisitAtMs > 0) {
        payload.firstVisitAtMs = summary.firstVisitAtMs;
      }

      batch.set(ref, payload);
      batchOpsCount += 1;
      if (batchOpsCount >= MAX_BATCH_OPS) {
        await batch.commit();
        batch = db.batch();
        batchOpsCount = 0;
      }
    }

    if (batchOpsCount > 0) {
      await batch.commit();
    }

    return {
      ok: true,
      totalPatients: summaries.size,
      totalRecordsProcessed: recordsSnap.size,
    };
  };

  return { recomputePatientSummaries };
};
