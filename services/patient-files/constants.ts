/**
 * ثوابت نظام ملفات المرضى (Patient Files Constants)
 *
 * ثوابت تُستخدم داخل وحدة `patient-files` لتوحيد أسماء المستندات وإعدادات
 * الفهرس التصاعدي لترقيم ملفات المرضى حسب الأقدمية.
 */

/** البادئة المستخدمة لمعرّف مستند ملف المريض تحت users/{uid}/settings */
export const PATIENT_FILE_DOC_PREFIX = 'patientFile__';

/** معرّف مستند العدّاد المركزي (مفتاح آخر رقم مستخدم + نسخة الترقيم الحالية) */
export const PATIENT_FILES_COUNTER_DOC_ID = 'patientFilesMeta';

/**
 * نسخة خوارزمية الترقيم بالأقدمية (Seniority).
 * كلما زادت الخوارزمية، يُعاد بناء الفهرس تلقائياً للمستخدمين القدامى.
 */
export const PATIENT_FILES_SENIORITY_VERSION = 4;

/** الحد الأقصى للعمليات في batch واحد على Firestore (الحد الرسمي 500) */
export const MAX_BATCH_OPERATIONS = 450;
