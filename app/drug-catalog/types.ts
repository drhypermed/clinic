// ─────────────────────────────────────────────────────────────────────────────
// الملف الرئيسي لتصدير كل الأنواع (Barrel File)
// ─────────────────────────────────────────────────────────────────────────────
// الملف ده بعد التقسيم بقى مجرد "بوابة" بتعيد تصدير الأنواع المقسمة على ملفات
// منفصلة داخل فولدر ./types. ده بيحافظ على أي import موجود في الكود (مثل
// `from '../../app/drug-catalog/types'`) من غير ما نعدل حاجة في باقي المشروع.
//
// التقسيم الفعلي:
//   - types/category.ts            — قائمة تصنيفات الأدوية (Enum)
//   - types/medication.ts          — Medication, AlternativeMed, PrescriptionItem, MedicationCustomization
//   - types/patient.ts             — VitalSigns, PatientRecord, ConsultationData, ReadyPrescription, ...
//   - types/appointment.ts         — ClinicAppointment, Branch, PublicBookingSlot, PublicBranchInfo
//   - types/prescription-settings.ts — TextStyle + كل إعدادات شكل الروشتة
//   - types/doctor-profile.ts      — DoctorAdProfile + مراجعات الجمهور
// ─────────────────────────────────────────────────────────────────────────────

export * from './types/category';
export * from './types/medication';
export * from './types/patient';
export * from './types/appointment';
export * from './types/prescription-settings';
export * from './types/doctor-profile';
