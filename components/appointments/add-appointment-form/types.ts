import type React from 'react';
import type {
  PatientGender,
  PaymentType,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsInput,
  SecretaryVitalsVisibility,
} from '../../../app/drug-catalog/types';
import type { InsuranceCompany } from '../../../services/insuranceService';
import type { DiscountReason } from '../../../services/discountReasonService';

/**
 * تعريف الهياكل البيانية لنموذج إضافة المواعيد (Appointment Form Types)
 */

/** مريض مرشح للاستشارة (كشف مؤخراً ولم يحجز استشارة بعد) */
export interface RecentExamPatientOption {
  id: string;
  patientName: string;
  age?: string;
  phone?: string;
  examCompletedAt: string;         // تاريخ اكتمال الكشف الأساسي
  consultationCompletedAt?: string; // تاريخ ووقت تنفيذ الاستشارة (إن وجدت)
  consultationCompletedDates?: string[]; // كل تواريخ الاستشارات المنفذة (أحدث أولا)
  consultationSourceRecordId?: string; // معرّف الكشف الذي تبنى عليه الاستشارة
  /** جنس المريض (ثابت) — ينتقل تلقائياً لفورم الاستشارة */
  gender?: PatientGender;
}

/** مريض مقترح (عند البحث في قاعدة البيانات الحالية) */
export interface PatientSuggestionOption {
  id: string;
  patientName: string;
  age?: string;
  phone?: string;
  lastExamDate?: string;
  lastConsultationDate?: string;
  patientFileNumber?: number;
  /** جنس المريض — ثابت، يُنقل لفورم الحجز تلقائياً عند اختيار هذا المريض */
  gender?: PatientGender;
  /** تاريخ الميلاد (YYYY-MM-DD) — ثابت، يُستخدم لحساب السن تلقائياً */
  dateOfBirth?: string;
}

/** أنواع الحجوزات المتاحة */
export type AppointmentType = 'exam' | 'consultation'; // 'كشف' أو 'استشارة'

/** معلومات تنبيه كوتا (حصص) الحجز */
export interface BookingQuotaNoticeInfo {
  message: string;        // نص التنبيه
  whatsappUrl: string;    // رابط التواصل لحل المشكلة
  whatsappNumber: string;
}

/** خصائص مكون نموذج إضافة موعد */
export interface AddAppointmentFormProps {
  patientName: string;
  onPatientNameChange: (value: string) => void;
  age: string;
  onAgeChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  /** جنس المريض — ثابت لكل زياراته (يُحفظ في ملف المريض الموحد) */
  gender?: PatientGender | '';
  onGenderChange?: (value: PatientGender | '') => void;
  /** تاريخ الميلاد (YYYY-MM-DD) — ثابت، يُستخدم لحساب السن تلقائياً */
  dateOfBirth?: string;
  onDateOfBirthChange?: (value: string) => void;
  /** حامل؟ — يظهر بس لو أنثى وسنها 18-50، ويُسأل كل زيارة */
  pregnant?: boolean | null;
  onPregnantChange?: (value: boolean | null) => void;
  /** مرضعة؟ — يظهر بس لو أنثى وسنها 18-50، ويُسأل كل زيارة */
  breastfeeding?: boolean | null;
  onBreastfeedingChange?: (value: boolean | null) => void;
  dateStr: string;
  onDateStrChange: (value: string) => void;
  timeStr: string;
  onTimeStrChange: (value: string) => void;
  visitReason: string;
  onVisitReasonChange: (value: string) => void;
  secretaryVitals?: SecretaryVitalsInput;
  secretaryVitalFields?: SecretaryVitalFieldDefinition[];
  secretaryVitalsVisibility?: SecretaryVitalsVisibility;
  onSecretaryVitalsChange?: (value: SecretaryVitalsInput) => void;
  todayStr: string;
  timeMin: string | undefined;
  saving: boolean;                       // حالة الحفظ (لعرض لودر)
  formError: string | null;              // رسالة خطأ التحقق
  bookingQuotaNotice?: BookingQuotaNoticeInfo | null;
  onSubmit: (e: React.FormEvent) => void;
  appointmentType?: AppointmentType;
  onAppointmentTypeChange?: (value: AppointmentType) => void;
  consultationCandidates?: RecentExamPatientOption[]; // قائمة مرضى الاستشارات المتاحين
  selectedConsultationCandidateId?: string;
  onSelectConsultationCandidate?: (candidate: RecentExamPatientOption) => void;
  patientSuggestions?: PatientSuggestionOption[];     // اقتراحات الأسماء الحية
  onSelectPatientSuggestion?: (candidate: PatientSuggestionOption) => void;
  canLoadMoreConsultationCandidates?: boolean;
  onLoadMoreConsultationCandidates?: () => void;
  submitLabel?: string;                  // نص زر الحفظ (اختياري)
  hideTopHeader?: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  // حقول التأمين (اختيارية - تظهر للسكرتير)
  userId?: string;
  bookingSecret?: string;
  /** الفرع النشط — يستخدم لاختيار override نسبة تحمل المريض من شركة التأمين (لو موجود). */
  activeBranchId?: string;
  paymentType?: PaymentType;
  onPaymentTypeChange?: (v: PaymentType) => void;
  insuranceCompanyId?: string;
  onInsuranceCompanyIdChange?: (v: string) => void;
  insuranceCompanyName?: string;
  onInsuranceCompanyNameChange?: (v: string) => void;
  insuranceApprovalCode?: string;
  onInsuranceApprovalCodeChange?: (v: string) => void;
  insuranceMembershipId?: string;
  onInsuranceMembershipIdChange?: (v: string) => void;
  patientSharePercent?: number;
  onPatientSharePercentChange?: (v: number) => void;
  discountAmount?: number;
  onDiscountAmountChange?: (v: number) => void;
  discountPercent?: number;
  onDiscountPercentChange?: (v: number) => void;
  discountReasonId?: string;
  onDiscountReasonIdChange?: (v: string) => void;
  discountReasonLabel?: string;
  onDiscountReasonLabelChange?: (v: string) => void;
  discountReasons?: DiscountReason[];
  insuranceCompanies?: InsuranceCompany[];
}
