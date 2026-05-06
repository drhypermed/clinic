/**
 * عدّاد إحصائيات الطبيب (per-doctor stats counter)
 *
 * الهدف: نخلّي الإحصائيات اللي بتظهر في صفحة السجلات (كشوفات النهارده،
 * استشارات النهارده، إجمالي الشهر، عدد المرضى الفريد) محسوبة سلفاً في
 * doc واحد بدل ما الواجهة تعدّها على كل السجلات في كل مرة.
 *
 * المنطق هنا متطابق 100% مع الحساب الفعلي في useRecordsTimeline.ts:
 *   - السجل اللي isConsultationOnly=true بيتعدّ كاستشارة واحدة بتاريخه.
 *   - السجل اللي isConsultationOnly=false بيتعدّ ككشف واحد.
 *   - **لو الكشف معاه consultation.date و مفيش consultationRecordId**،
 *     الاستشارة دي بتتعدّ كزيارة منفصلة بتاريخها (مش بتاريخ الكشف).
 *   - لو فيه consultationRecordId، الاستشارة لها سجل مستقل، فمش بنعدّها هنا
 *     (هتيجي من تشغيل الـ trigger على السجل المنفصل).
 *   - عدد المرضى الفريد بيتعدّ بـ patientFileNameKey (نفس مفتاح
 *     buildPatientFiles في الواجهة).
 *
 * ملاحظة مهمة على اليوم/الشهر:
 *   عداد "اليوم" و"الشهر" بيتخزّن مع المفتاح اللي بينتمي ليه (todayKey/monthKey).
 *   لو الـ trigger اشتغل في يوم جديد، بيصفّر القيم القديمة الأول قبل ما يزيد.
 *   كده الواجهة تشوف قيم اليوم/الشهر الحالي بدون ما تخلط مع يوم/شهر سابق.
 *
 * يتفعّل على: users/{userId}/records/{recordId} (path-scoped — مش wildcard،
 * فآمن من ناحية التكلفة).
 */

const { isUserAllowed } = require('./statsCounterAllowlist');
const { resolvePatientFileKey } = require('./statsCounterHelpers');
const { recomputeStatsForUser } = require('./statsCounterCore');

// النمط: module.exports = (context) => ({ handlers })
// الـ context فيه admin و getDb و HttpsError ... إلخ من index.js
module.exports = ({ admin, getDb }) => {
  const FieldValue = admin.firestore.FieldValue;

  /** مفتاح اليوم بصيغة YYYY-MM-DD في توقيت القاهرة */
  const getDayKey = (date) => date.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });

  /** مفتاح الشهر بصيغة YYYY-MM في توقيت القاهرة */
  const getMonthKey = (date) => getDayKey(date).slice(0, 7);

  /** هل السجل ده استشارة مستقلة (مش مرتبطة بكشف)؟ */
  const isStandaloneConsultation = (data) => Boolean(data) && data.isConsultationOnly === true;

  /** هل السجل ده كشف؟ */
  const isExam = (data) => Boolean(data) && data.isConsultationOnly !== true;

  /**
   * هل الكشف ده معاه استشارة مرتبطة (مش بسجل منفصل)؟
   * نفس شرط الواجهة بالظبط: rec.consultation?.date && !rec.consultationRecordId
   */
  const hasInlineConsultation = (data) => {
    if (!data) return false;
    if (!data.consultation || typeof data.consultation !== 'object') return false;
    if (!data.consultation.date) return false;
    if (data.consultationRecordId) return false;
    return true;
  };

  /** parser تواريخ مرن: يدعم string/timestamp/number */
  const parseDateToMs = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string') {
      const parsed = Date.parse(raw);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (raw && typeof raw.toMillis === 'function') {
      try {
        return raw.toMillis();
      } catch {
        return null;
      }
    }
    return null;
  };

  /** تاريخ الكشف من السجل: dateMs له الأولوية، وإلا date */
  const getExamDateMs = (data) => {
    if (!data) return null;
    const fromDateMs = parseDateToMs(data.dateMs);
    if (fromDateMs !== null) return fromDateMs;
    return parseDateToMs(data.date);
  };

  /** تاريخ الاستشارة المرتبطة بالكشف */
  const getInlineConsultationDateMs = (data) => {
    if (!data || !data.consultation) return null;
    return parseDateToMs(data.consultation.date);
  };

  /**
   * يبني التغييرات (delta) اللي لازم تتطبّق على doc الإحصائيات.
   * بنضيف بس على الزيارات اللي تاريخها يطابق todayKey/monthKey الحالي.
   */
  const buildDelta = (action, beforeData, afterData, todayKey, monthKey) => {
    const delta = {
      examsToday: 0,
      consultationsToday: 0,
      examsThisMonth: 0,
      consultationsThisMonth: 0,
      uniquePatientFileNameKeys: {},
    };

    const applyVisit = (visitType, dateMs, sign) => {
      if (!Number.isFinite(dateMs)) return;
      const visitDate = new Date(dateMs);
      const visitDayKey = getDayKey(visitDate);
      const visitMonthKey = getMonthKey(visitDate);

      if (visitDayKey === todayKey) {
        if (visitType === 'exam') delta.examsToday += sign;
        else delta.consultationsToday += sign;
      }
      if (visitMonthKey === monthKey) {
        if (visitType === 'exam') delta.examsThisMonth += sign;
        else delta.consultationsThisMonth += sign;
      }
    };

    const applyRecord = (data, sign) => {
      if (!data) return;

      if (isStandaloneConsultation(data)) {
        applyVisit('consultation', getExamDateMs(data), sign);
      } else if (isExam(data)) {
        applyVisit('exam', getExamDateMs(data), sign);
        if (hasInlineConsultation(data)) {
          applyVisit('consultation', getInlineConsultationDateMs(data), sign);
        }
      }

      // استخدم resolvePatientFileKey بدلاً من patientFileNameKey المباشر
      // عشان نشمل السجلات اللي ما عندهاش الحقل صريح (نولّده من الاسم)
      const fileNameKey = resolvePatientFileKey(data);
      if (fileNameKey) {
        delta.uniquePatientFileNameKeys[fileNameKey] =
          (delta.uniquePatientFileNameKeys[fileNameKey] || 0) + sign;
      }
    };

    if (action === 'create') {
      applyRecord(afterData, +1);
    } else if (action === 'delete') {
      applyRecord(beforeData, -1);
    } else if (action === 'update') {
      applyRecord(beforeData, -1);
      applyRecord(afterData, +1);
    }

    return delta;
  };

  /**
   * Trigger handler: يتنفّذ على كل create/update/delete في سجلات الطبيب.
   */
  const syncDoctorStatsSummary = async (event) => {
    const userId = event.params && event.params.userId;
    if (!userId) return;

    // قائمة السماح: لو محدّدة، الكود يشتغل بس على UIDs معيّنة
    if (!isUserAllowed(userId)) return;

    const before = event.data && event.data.before && event.data.before.exists
      ? event.data.before.data()
      : null;
    const after = event.data && event.data.after && event.data.after.exists
      ? event.data.after.data()
      : null;

    let action = null;
    if (!before && after) action = 'create';
    else if (before && !after) action = 'delete';
    else if (before && after) action = 'update';
    else return;

    const todayKey = getDayKey(new Date());
    const monthKey = getMonthKey(new Date());

    const db = getDb();
    const summaryRef = db.doc(`users/${userId}/stats/summary`);

    // Auto-bootstrap: لو الطبيب ما عندوش summary، نعمل recompute كامل
    // من كل سجلاته (مش delta). ده يضمن إن أول مرة أي طبيب يحفظ سجل بعد
    // الإطلاق، الإحصائيات تتبني صحيحة من الأول، بدون الحاجة لتدخل يدوي.
    const initialSnap = await summaryRef.get();
    if (!initialSnap.exists) {
      await recomputeStatsForUser(db, userId, FieldValue);
      return;
    }

    const delta = buildDelta(action, before, after, todayKey, monthKey);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(summaryRef);
      const current = snap.exists ? snap.data() : {};

      const previousTodayKey = String(current.todayKey || '');
      const previousMonthKey = String(current.monthKey || '');

      // لو اليوم/الشهر اتغيّر، صفّر العدّادات قبل ما نضيف الجديد
      const startExamsToday =
        previousTodayKey === todayKey ? Number(current.examsToday || 0) : 0;
      const startConsultationsToday =
        previousTodayKey === todayKey ? Number(current.consultationsToday || 0) : 0;
      const startExamsThisMonth =
        previousMonthKey === monthKey ? Number(current.examsThisMonth || 0) : 0;
      const startConsultationsThisMonth =
        previousMonthKey === monthKey ? Number(current.consultationsThisMonth || 0) : 0;

      const patientFileCounts = { ...(current.patientFileCounts || {}) };
      Object.entries(delta.uniquePatientFileNameKeys).forEach(([fileNameKey, change]) => {
        const currentCount = Number(patientFileCounts[fileNameKey] || 0);
        const nextCount = currentCount + change;
        if (nextCount <= 0) {
          delete patientFileCounts[fileNameKey];
        } else {
          patientFileCounts[fileNameKey] = nextCount;
        }
      });

      const updates = {
        examsToday: Math.max(0, startExamsToday + delta.examsToday),
        consultationsToday: Math.max(0, startConsultationsToday + delta.consultationsToday),
        examsThisMonth: Math.max(0, startExamsThisMonth + delta.examsThisMonth),
        consultationsThisMonth: Math.max(0, startConsultationsThisMonth + delta.consultationsThisMonth),
        todayKey,
        monthKey,
        patientFileCounts,
        uniquePatients: Object.keys(patientFileCounts).length,
        lastUpdatedAt: FieldValue.serverTimestamp(),
      };

      tx.set(summaryRef, updates, { merge: true });
    });
  };

  return { syncDoctorStatsSummary };
};
