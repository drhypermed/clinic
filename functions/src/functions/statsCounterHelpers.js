/**
 * Helpers مشتركة لعدّادات الإحصائيات وملخصات المرضى.
 *
 * بنحط الكود المشترك هنا عشان يكون متطابق 100% بين perDoctorStatsCounter،
 * perDoctorStatsReconcile، perPatientSummariesCounter، perPatientSummariesReconcile.
 * أي تغيير في منطق التجميع لازم يحصل في مكان واحد فقط.
 */

/**
 * نسخة مرآة من normalizePatientNameForFile الموجودة في
 * services/patient-files/normalizers.ts.
 *
 * مهم: لازم تطابق الواجهة 100% — أي اختلاف يخلي الـ counter يجمع المرضى
 * بطريقة مختلفة عن الواجهة، فالأعداد تطلع غلط.
 *
 * يعالج:
 *   - شيل التشكيل العربي
 *   - توحيد الألف بكل أشكالها (أ، إ، آ، ٱ → ا)
 *   - توحيد الياء والألف المقصورة (ى → ي)
 *   - توحيد التاء المربوطة إلى هاء (ة → ه)
 *   - توحيد الهمزات (ؤ → و، ئ → ي، ء → شيلها)
 *   - توحيد المسافات
 *   - lowercase
 */
const normalizePatientNameForFile = (name) => {
  const raw = String(name || '');
  if (!raw) return '';

  return raw
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ء/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
};

/**
 * يحدد مفتاح المريض من السجل — يطابق المنطق في
 * resolvePatientFileKeyFromRecord في patientFilesShared.ts.
 *
 * الأولوية:
 *   1. data.patientFileNameKey (لو موجود)
 *   2. fallback: normalizePatientNameForFile(data.patientName)
 */
const resolvePatientFileKey = (data) => {
  if (!data) return '';
  const explicit = String(data.patientFileNameKey || '').trim();
  if (explicit) return explicit;
  return normalizePatientNameForFile(data.patientName);
};

module.exports = {
  normalizePatientNameForFile,
  resolvePatientFileKey,
};
