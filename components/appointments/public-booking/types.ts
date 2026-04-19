/**
 * الملف: types.ts
 * الوصف: "قاموس البيانات" (Data Dictionary) للسكرتارية. 
 * يحتوي على كافة تعريفات الجداول والكائنات المستخدمة في واجهة السكرتير: 
 * - Config: إعدادات العيادة الأساسية. 
 * - TodayAppointment: هيكل بيانات الموعد اليومي. 
 * - EntryAlert: بيانات طلب دخول مريض من قبل الطبيب. 
 * - SecretaryAuthCredentials: بيانات اعتماد الدخول الخاصة بالفريق المعاون.
 */
import type { AppointmentType, PatientSuggestionOption, RecentExamPatientOption } from '../AddAppointmentForm';
import type {
  PaymentType,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsInput,
  SecretaryVitalsVisibility,
} from '../../../app/drug-catalog/types';

// الإعدادات الأساسية لصفحة الحجز (معرف الطبيب، الاسم المعروض، عنوان الفورم)
export type Config = {
  userId: string;
  doctorDisplayName?: string;
  formTitle?: string;
  secretaryVitalsVisibility?: SecretaryVitalsVisibility;
  secretaryVitalFields?: SecretaryVitalFieldDefinition[];
  /** خرائط per-branch للإعدادات الحيوية (المفتاح 'main' للفرع الرئيسي). */
  secretaryVitalsVisibilityByBranch?: Record<string, SecretaryVitalsVisibility>;
  secretaryVitalFieldsByBranch?: Record<string, SecretaryVitalFieldDefinition[]>;
};

// تفاصيل رسالة "تجاوز الحد اليومي للحجز" وطريقة التواصل مع العيادة
export type BookingQuotaNotice = {
  message: string;
  whatsappUrl: string;
  whatsappNumber: string;
};

// بيانات الاعتماد الخاصة بدخول السكرتارية (كلمة السر، التوكن، إيميل الطبيب)
export type SecretaryAuthCredentials = {
  sessionToken?: string;
  doctorEmail?: string;
};

// هيكل تنبيه طلب الدخول اللحظي القادم من الطبيب للسكرتارية
export type EntryAlert = {
  caseName: string; // اسم الحالة المطلوبة
  createdAt: string; // وقت إرسال الطلب
  appointmentId: string; // معرف الموعد المرتبط
  /** الفرع المنتمي له طلب الدخول — للعزل بين الفروع */
  branchId?: string;
};

// بيانات الموعد الخاص باليوم الحالي كما تظهر في قائمة السكرتارية
export type TodayAppointment = {
  id: string;
  patientName: string;
  age?: string;
  phone?: string;
  visitReason?: string;
  secretaryVitals?: SecretaryVitalsInput;
  dateTime: string;
  source?: 'clinic' | 'secretary' | 'public'; // مصدر الحجز
  appointmentType?: AppointmentType; // نوع الموعد (كشف/استشارة)
  consultationSourceAppointmentId?: string; // في حال الاستشارة، معرف الكشف الأصلي
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;
  paymentType?: PaymentType;
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
  insuranceMembershipId?: string;
  insuranceApprovalCode?: string;
  patientSharePercent?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountReasonId?: string;
  discountReasonLabel?: string;
  /** وقت تنفيذ فتح الكشف — ISO string */
  examCompletedAt?: string;
  /** الفرع المرتبط بالموعد - مهم للفلترة الصحيحة بين الفروع */
  branchId?: string;
};

// هيكل رد الطبيب على طلب السكرتارية بدخول المريض
export type DoctorEntryResponse = {
  status: 'approved' | 'rejected'; // موافقة أو انتظار (المصطلح البرمجي هنا مرفوض يعني انتظر)
  appointmentId: string;
  respondedAt: string;
} | null;

// إعادة تصدير الأنواع المشتركة
export type { AppointmentType, PatientSuggestionOption, RecentExamPatientOption };
