/**
 * المنطق الأساسي المشترك لعدّادات الإحصائيات وملخصات المرضى.
 *
 * يحتوي على دوال recompute الكاملة (يقرأ كل السجلات ويبني الـ docs من الصفر).
 * هذه الدوال يستعملها:
 *   1. perDoctorStatsReconcile / perPatientSummariesReconcile: عند طلب الأدمن
 *      إعادة الحساب اليدوي.
 *   2. perDoctorStatsCounter / perPatientSummariesCounter: عند أول write لطبيب
 *      ما عندوش summary بعد (auto-bootstrap).
 *
 * أهمية المركزية: تضمن إن منطق الحساب متطابق 100% بين الـ reconcile والـ
 * counter، فما فيش انحراف بين الأرقام في الحالتين.
 */

const { resolvePatientFileKey } = require('./statsCounterHelpers');

/** مفتاح اليوم بصيغة YYYY-MM-DD في توقيت القاهرة */
const getDayKey = (date) => date.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });

/** مفتاح الشهر بصيغة YYYY-MM في توقيت القاهرة */
const getMonthKey = (date) => getDayKey(date).slice(0, 7);

/** parser تواريخ مرن */
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

/** يستخرج تليفونات السجل بنفس مصادر الواجهة */
const extractPhones = (data) => {
  if (!data) return [];
  const sources = [data.phone, data.patientPhone, data.guardianPhone];
  const result = [];
  sources.forEach((value) => {
    const trimmed = String(value || '').trim();
    if (trimmed && !result.includes(trimmed)) result.push(trimmed);
  });
  return result;
};

/**
 * يحسب إحصائيات الطبيب من كل سجلاته ويكتبها في users/{userId}/stats/summary.
 * يستعمل في حالتين: reconcile يدوي، أو auto-bootstrap عند أول write.
 */
const recomputeStatsForUser = async (db, userId, FieldValue) => {
  const todayKey = getDayKey(new Date());
  const monthKey = getMonthKey(new Date());

  const recordsSnap = await db.collection(`users/${userId}/records`).get();

  const stats = {
    examsToday: 0,
    consultationsToday: 0,
    examsThisMonth: 0,
    consultationsThisMonth: 0,
    patientFileCounts: {},
    uniquePatients: 0,
  };

  // helper: يطبّق زيارة واحدة على الإحصائيات
  const applyVisit = (visitType, dateMs) => {
    if (!Number.isFinite(dateMs)) return;
    const visitDate = new Date(dateMs);
    const visitDayKey = getDayKey(visitDate);
    const visitMonthKey = getMonthKey(visitDate);

    if (visitDayKey === todayKey) {
      if (visitType === 'exam') stats.examsToday += 1;
      else stats.consultationsToday += 1;
    }
    if (visitMonthKey === monthKey) {
      if (visitType === 'exam') stats.examsThisMonth += 1;
      else stats.consultationsThisMonth += 1;
    }
  };

  recordsSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (!data) return;

    if (data.isConsultationOnly === true) {
      // استشارة مستقلة
      const dateMs = parseDateToMs(data.dateMs) || parseDateToMs(data.date);
      applyVisit('consultation', dateMs);
    } else {
      // كشف
      const examDateMs = parseDateToMs(data.dateMs) || parseDateToMs(data.date);
      applyVisit('exam', examDateMs);

      // استشارة مرتبطة بكشف (بدون consultationRecordId)
      const hasInline = data.consultation
        && typeof data.consultation === 'object'
        && data.consultation.date
        && !data.consultationRecordId;
      if (hasInline) {
        const consultDateMs = parseDateToMs(data.consultation.date);
        applyVisit('consultation', consultDateMs);
      }
    }

    // عدّ المرضى الفريد بمفتاح موحد (مع fallback من اسم المريض)
    const fileNameKey = resolvePatientFileKey(data);
    if (fileNameKey) {
      stats.patientFileCounts[fileNameKey] = (stats.patientFileCounts[fileNameKey] || 0) + 1;
    }
  });

  stats.uniquePatients = Object.keys(stats.patientFileCounts).length;

  await db.doc(`users/${userId}/stats/summary`).set({
    ...stats,
    todayKey,
    monthKey,
    lastReconciledAt: FieldValue.serverTimestamp(),
    lastUpdatedAt: FieldValue.serverTimestamp(),
  });

  return { ...stats, todayKey, monthKey };
};

/**
 * يحسب ملخصات المرضى من كل سجلات الطبيب ويكتبها في
 * users/{userId}/patientSummaries/{fileNameKey}.
 */
const recomputeSummariesForUser = async (db, userId, FieldValue) => {
  const recordsSnap = await db.collection(`users/${userId}/records`).get();

  const summaries = new Map();

  recordsSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (!data) return;

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

    if (!summary.patientName) summary.patientName = String(data.patientName || '').trim();
    const fileNumber = Number(data.patientFileNumber || 0);
    if (!summary.patientFileNumber && fileNumber > 0) summary.patientFileNumber = fileNumber;
    if (!summary.patientFileId) summary.patientFileId = String(data.patientFileId || '').trim();

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

  // كتابة الـ docs الجديدة + شيل القديمة (المرضى المحذوفين)
  const existingSummariesSnap = await db.collection(`users/${userId}/patientSummaries`).get();
  let batch = db.batch();
  let batchOps = 0;
  const MAX_OPS = 450;

  const flushIfNeeded = async () => {
    if (batchOps >= MAX_OPS) {
      await batch.commit();
      batch = db.batch();
      batchOps = 0;
    }
  };

  for (const doc of existingSummariesSnap.docs) {
    if (!summaries.has(doc.id)) {
      batch.delete(doc.ref);
      batchOps += 1;
      await flushIfNeeded();
    }
  }

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
    if (summary.firstVisitAtMs > 0) payload.firstVisitAtMs = summary.firstVisitAtMs;

    batch.set(ref, payload);
    batchOps += 1;
    await flushIfNeeded();
  }

  if (batchOps > 0) await batch.commit();

  return {
    totalPatients: summaries.size,
    totalRecordsProcessed: recordsSnap.size,
  };
};

module.exports = {
  recomputeStatsForUser,
  recomputeSummariesForUser,
};
