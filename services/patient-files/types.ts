/**
 * أنواع نظام ملفات المرضى (Patient Files Types)
 *
 * يحتوي هذا الملف على جميع الواجهات (Interfaces) المستخدمة في وحدة
 * `patient-files` — المرجع الموحد لتعريف بيانات المريض في كل الـ modules.
 */

/** مرجع ملف مريض (المعرّف + الرقم التسلسلي + مفتاح الاسم) */
export interface PatientFileReference {
    patientFileId: string;
    patientFileNumber: number;
    patientFileNameKey: string;
}

/** سجل مريض قادم من قاعدة البيانات (مدخل لعملية إعادة بناء الفهرس) */
export interface PatientFileSeedRecord {
    id: string;
    patientName?: string;
    phone?: string;
    date?: string;
    createdAt?: unknown;
    patientFileId?: string;
    patientFileNumber?: number;
    patientFileNameKey?: string;
}

/** مدخل عمر المريض (سنوات/أشهر/أيام) كنصوص */
export interface PatientIdentityAgeInput {
    years?: string;
    months?: string;
    days?: string;
}

/** مدخلات عملية مزامنة هوية المريض عبر كل السجلات والمواعيد */
export interface SyncPatientIdentityByFileInput {
    userId: string;
    patientName: string;
    phone?: string;
    age?: PatientIdentityAgeInput;
    patientFileId?: string;
    patientFileNumber?: number;
    patientFileNameKey?: string;
    /** جنس المريض — يُنشر على كل سجلات/مواعيد ملف المريض لو تم إدخاله */
    gender?: 'male' | 'female';
}

/** نتيجة عملية مزامنة الهوية (عدد ما تم تحديثه) */
export interface SyncPatientIdentityByFileResult {
    patientFileId: string;
    patientFileNumber: number;
    patientFileNameKey: string;
    updatedRecordsCount: number;
    updatedAppointmentsCount: number;
}

/** مجموعة ملفات مريض مؤقتة تُستخدم أثناء إعادة بناء فهرس الأقدمية */
export interface PatientFileSeniorityGroup {
    nameKey: string;
    patientName: string;
    phone?: string;
    oldestVisitMs: number;
    existingNumber?: number;
}

/** مدخلات عملية تحديث مرآة هوية المريض في إعدادات الحجز (booking config) */
export interface SyncBookingConfigIdentityInput {
    userId: string;
    patientName: string;
    phone: string;
    ageText: string;
    patientFileNumber: number;
    knownNames: Set<string>;
    knownPhones: Set<string>;
    knownPhoneDigits: Set<string>;
    updatedRecordIds: Set<string>;
    updatedAppointmentIds: Set<string>;
}
