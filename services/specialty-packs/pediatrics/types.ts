/**
 * أنواع بيانات حزمه الأطفال (Pediatrics Pack Types)
 *
 * بيانات كل طفل محفوظه في وثيقه منفصله تحت
 * users/{uid}/settings/pediatricFile__{patientFileNameKey}
 *
 * فيها ٢ قسم رئيسيين:
 *   1. قياسات النمو (Growth Measurements) — وزن/طول/محيط رأس بتاريخ.
 *   2. سجل التطعيمات (Vaccinations) — مرتبط بجدول التطعيمات المصري الرسمي.
 */

/** بادئه معرّف الوثيقه — لتمييزها عن باقي ملفات الـsettings */
export const PEDIATRIC_FILE_DOC_PREFIX = 'pediatricFile__';

/** جنس الطفل — مهم لو هضفنا حساب percentile لاحقاً (الجدول مختلف للولد والبنت) */
export type ChildSex = 'male' | 'female' | '';

/** قياس نمو واحد (زياره) */
export interface GrowthEntry {
    /** معرّف فريد داخل الملف */
    id: string;
    /** تاريخ القياس بصيغه YYYY-MM-DD */
    dateKey: string;
    /** الوزن بالكيلوجرام (نص لإمكانيه الـdecimal) */
    weightKg?: string;
    /** الطول/القامه بالسنتيمتر */
    heightCm?: string;
    /** محيط الرأس بالسنتيمتر — مهم للرضّع تحت سنتين */
    headCircCm?: string;
    /** ملاحظات حره */
    notes?: string;
    /** تاريخ آخر تعديل (ISO) — للتتبع */
    updatedAt?: string;
}

/**
 * حاله تطعيم واحد لطفل معيّن.
 * - 'pending': مش متاخد لسه (الافتراضي).
 * - 'given': اتاخد في التاريخ المسجل.
 * - 'skipped': الدكتور قرر تأجيله/تخطيه (مع سبب).
 */
export type VaccinationStatus = 'pending' | 'given' | 'skipped';

/** سجل تطعيم لطفل واحد */
export interface VaccinationRecord {
    /** معرّف التطعيم من الجدول المركزي (مثلاً 'birth-bcg') */
    scheduleId: string;
    /** الحاله الحاليه */
    status: VaccinationStatus;
    /** تاريخ الإعطاء الفعلي (YYYY-MM-DD) — لو الحاله 'given' */
    givenDate?: string;
    /** رقم تشغيله/lot — اختياري للأمان والتتبع */
    batchNumber?: string;
    /** سبب التخطي أو ملاحظه عامه */
    notes?: string;
    /** آخر تعديل */
    updatedAt?: string;
}

/** ملف الأطفال لمريض واحد */
export interface PediatricFile {
    /** ربط بملف المريض الأساسي */
    patientFileNameKey: string;
    /** تاريخ ميلاد الطفل (YYYY-MM-DD) — أساس حساب العمر */
    dateOfBirth?: string;
    /** الجنس — للقياسات المعتمده على percentile مستقبلاً */
    sex?: ChildSex;
    /** قائمه قياسات النمو (مرتبه من الأحدث للأقدم في الـUI) */
    growthEntries: GrowthEntry[];
    /** سجلات التطعيمات (مفهرسه بالـscheduleId) */
    vaccinations: Record<string, VaccinationRecord>;
    /** ملاحظات عامه عن الطفل */
    generalNotes?: string;
    /** آخر تحديث للوثيقه */
    updatedAt?: string;
}

/** قيمه ابتدائيه فاضيه */
export const createEmptyPediatricFile = (
    patientFileNameKey: string,
): PediatricFile => ({
    patientFileNameKey,
    growthEntries: [],
    vaccinations: {},
});
