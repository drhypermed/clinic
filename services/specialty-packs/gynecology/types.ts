/**
 * أنواع بيانات حزمه النساء والتوليد (Gynecology Pack Types)
 *
 * بيانات الحمل مخزّنه لكل مريضه في وثيقه منفصله تحت
 * users/{uid}/settings/pregnancyFile__{patientFileNameKey}
 *
 * فايده الوثيقه المنفصله:
 *   - الأطباء اللي مش نسا ما يقروهاش أبداً (توفير في التكلفه).
 *   - الباكدج ينقفل من الأدمن من غير لمس بيانات الزيارات الأصليه.
 */

/** بادئه معرّف الوثيقه لتمييز ملفات الحمل عن باقي الإعدادات */
export const PREGNANCY_FILE_DOC_PREFIX = 'pregnancyFile__';

/**
 * زياره حمل واحده — كل زياره الدكتوره بتسجّل فيها بيانات الجنين والأم.
 */
export interface PregnancyVisit {
    /** معرّف فريد للزياره داخل الملف */
    id: string;
    /** تاريخ الزياره بصيغه YYYY-MM-DD */
    dateKey: string;
    /** أسبوع الحمل وقت الزياره (محسوب من LMP) — لو فاضي يتحسب وقت العرض */
    gestationalWeek?: number;
    /** وزن الجنين بالجرام (نص عشان نقبل decimal) */
    fetalWeight?: string;
    /** نبض الجنين بالدقيقه (BPM) */
    fetalHeartRate?: string;
    /** ملاحظات السونار */
    ultrasoundNotes?: string;
    /** حركه الجنين: 'normal' = طبيعيه، 'decreased' = قليله، 'absent' = غايبه، '' = مش مذكوره */
    fetalMovement?: 'normal' | 'decreased' | 'absent' | '';
    /** وزن الأم بالكيلوجرام — مهم لمتابعه زياده الوزن خلال الحمل (الزياده الطبيعيه 10-12 كجم) */
    maternalWeight?: string;
    /** ملاحظات حره من الدكتوره */
    notes?: string;
    /** وقت إنشاء/تعديل السجل (ISO) — للتتبع فقط */
    updatedAt?: string;
}

/** سبب إغلاق ملف الحمل */
export type PregnancyClosureType = 'delivery' | 'miscarriage' | 'other';

/** ملف الحمل لمريضه واحده */
export interface PregnancyFile {
    /** ربط بملف المريضه الأساسي (نفس nameKey) */
    patientFileNameKey: string;
    /** تاريخ آخر دوره شهريه بصيغه YYYY-MM-DD — أساس كل الحسابات */
    lastMenstrualPeriod?: string;
    /** ميعاد الولاده المتوقع (محسوب، بنخزنه عشان نتجنّب إعاده الحساب) */
    estimatedDueDate?: string;
    /** قائمه زيارات الحمل (مرتبه من الأحدث للأقدم في الـUI) */
    visits: PregnancyVisit[];
    /** لو الحمل خلص (ولاده/إجهاض/...) — يقفل التتبع */
    closedAt?: string;
    closureType?: PregnancyClosureType;
    /** ملاحظات عامه عن الحمل */
    generalNotes?: string;
    /** وقت آخر تحديث للوثيقه ككل */
    updatedAt?: string;
}

/** قيمه ابتدائيه فاضيه للملف لو مش موجود */
export const createEmptyPregnancyFile = (
    patientFileNameKey: string,
): PregnancyFile => ({
    patientFileNameKey,
    visits: [],
});
