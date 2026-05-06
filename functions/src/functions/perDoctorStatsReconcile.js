/**
 * إعادة حساب إحصائيات الطبيب من الصفر (reconciliation).
 * المنطق متطابق 100% مع perDoctorStatsCounter.js و useRecordsTimeline.ts.
 */

const { isUserAllowed } = require('./statsCounterAllowlist');
const { resolvePatientFileKey } = require('./statsCounterHelpers');

module.exports = ({ admin, getDb, HttpsError }) => {
  const FieldValue = admin.firestore.FieldValue;

  const getDayKey = (date) => date.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  const getMonthKey = (date) => getDayKey(date).slice(0, 7);

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

  const recomputeDoctorStats = async (request) => {
    const userId = request && request.auth && request.auth.uid;
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    if (!isUserAllowed(userId)) {
      throw new HttpsError('permission-denied', 'Stats counter not enabled for this account');
    }

    const db = getDb();
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
        const dateMs = parseDateToMs(data.dateMs) || parseDateToMs(data.date);
        applyVisit('consultation', dateMs);
      } else {
        const examDateMs = parseDateToMs(data.dateMs) || parseDateToMs(data.date);
        applyVisit('exam', examDateMs);

        const hasInline = data.consultation
          && typeof data.consultation === 'object'
          && data.consultation.date
          && !data.consultationRecordId;
        if (hasInline) {
          const consultationDateMs = parseDateToMs(data.consultation.date);
          applyVisit('consultation', consultationDateMs);
        }
      }

      // استخدم resolvePatientFileKey للسجلات بدون patientFileNameKey صريح
      const fileNameKey = resolvePatientFileKey(data);
      if (fileNameKey) {
        stats.patientFileCounts[fileNameKey] =
          (stats.patientFileCounts[fileNameKey] || 0) + 1;
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

    return { ok: true, stats };
  };

  return { recomputeDoctorStats };
};
