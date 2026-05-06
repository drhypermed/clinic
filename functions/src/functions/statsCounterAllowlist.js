/**
 * قائمة السماح للعدّادات (stats counter allowlist).
 *
 * بنستخدمها لتقييد تشغيل الـ Cloud Functions الجديدة (perDoctorStatsCounter،
 * perPatientSummariesCounter) على حسابات معيّنة بس — يعني نقدر نجرّب الكود
 * في الإنتاج بأمان بدون ما نخاطر بحسابات الأطباء التانيين.
 *
 * طريقة الاستخدام:
 *   - في Firebase environment، نحدّد env variable اسمه:
 *     STATS_COUNTER_DOCTOR_UID_ALLOWLIST=uid1,uid2,uid3
 *   - الفنكشن بتقول: "هل الـ userId الحالي ضمن القائمة؟"
 *   - لو القائمة فاضية أو undefined → اشتغل للكل (production-wide).
 *   - لو فيها UIDs محددة → اشتغل بس للـ UIDs دي.
 *
 * الافتراضي عند عدم تحديد env: تشغيل للكل. ده عشان الـ allowlist ميبقاش
 * single point of failure — لو نسي حد يضبطه، الكود يفضل شغّال طبيعي.
 *
 * أمثلة عملية:
 *   - وقت التجربة: STATS_COUNTER_DOCTOR_UID_ALLOWLIST=OrdU20b9pBXfUYrh4z8hNR0F14B2
 *     → الكود يشتغل بس للأدمن.
 *   - وقت الإطلاق: نشيل الـ env variable → الكود يشتغل لكل الأطباء.
 */

/**
 * يقرأ الـ env variable ويرجع Set من الـ UIDs.
 * - undefined أو فاضي → null (يعني مفيش allowlist، اشتغل للكل)
 * - فيه قيم → Set من الـ UIDs بعد trim
 */
const getAllowedUids = () => {
  const raw = String(process.env.STATS_COUNTER_DOCTOR_UID_ALLOWLIST || '').trim();
  if (!raw) return null;
  const list = raw
    .split(',')
    .map((uid) => uid.trim())
    .filter((uid) => uid.length > 0);
  if (list.length === 0) return null;
  return new Set(list);
};

/**
 * هل ينفع نشغّل العدّاد على الـ userId ده؟
 * @param {string} userId
 * @returns {boolean}
 */
const isUserAllowed = (userId) => {
  const allowed = getAllowedUids();
  // مفيش allowlist محدّد → اشتغل للكل
  if (!allowed) return true;
  // فيه allowlist → اشتغل بس لو الـ uid ضمنها
  return allowed.has(String(userId || ''));
};

module.exports = {
  isUserAllowed,
  getAllowedUids,
};
