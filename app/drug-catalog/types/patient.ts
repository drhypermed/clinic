// ─────────────────────────────────────────────────────────────────────────────
// أنواع بيانات المريض والكشف (Patient & Consultation Records)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - VitalSigns: العلامات الحيوية (ضغط، نبض، حرارة ...)
//   - SecretaryVital*: إعدادات السكرتارية لإدخال القياسات قبل الكشف
//   - PaymentType: نوع الدفع (كاش / تأمين / خصم)
//   - PatientRecord: سجل الكشف الكامل (الوصفة الأساسية)
//   - ConsultationData: سجل استشارة بعد الكشف
//   - ReadyPrescription: روشتة جاهزة محفوظة للاستخدام المتكرر
// ─────────────────────────────────────────────────────────────────────────────

import type { PrescriptionItem } from './medication';

/**
 * العلامات الحيوية الأساسية اللي بيقيسها السكرتير قبل دخول المريض للطبيب.
 * كل القيم نصوص (مش أرقام) عشان نحتفظ بوحدات القياس أو ملاحظات السكرتير.
 */
export interface VitalSigns {
  bp: string;     // الضغط Blood Pressure (مثلاً "120/80")
  pulse: string;  // النبض (نبضة/دقيقة)
  temp: string;   // درجة الحرارة (مئوية)
  rbs: string;    // سكر عشوائي Random Blood Sugar
  spo2: string;   // نسبة الأكسجين في الدم
  rr: string;     // معدل التنفس Respiratory Rate
}

/** مفاتيح العلامات الحيوية المسموح بها داخل إعدادات السكرتارية */
export type SecretaryVitalKey =
  | 'weight'
  | 'height'
  | 'bmi'
  | 'bp'
  | 'pulse'
  | 'temp'
  | 'rbs'
  | 'spo2'
  | 'rr';

/** نوع حقل السكرتارية: علامة حيوية قياسية أو مربع مخصص يضيفه الطبيب */
export type SecretaryVitalFieldKind = 'vital' | 'customBox';

/**
 * تعريف حقل واحد في شاشة السكرتارية (سواء علامة حيوية أو مربع مخصص).
 * order يحدد ترتيب ظهور الحقل في الشاشة.
 */
export interface SecretaryVitalFieldDefinition {
  id: string;
  kind: SecretaryVitalFieldKind;
  label: string;
  labelAr?: string;
  unit?: string;
  order: number;
  enabled?: boolean;
  key?: SecretaryVitalKey;
  customBoxId?: string;
}

/** القيم اللي أدخلتها السكرتيرة — المفاتيح مرنة عشان تشمل المربعات المخصصة */
export type SecretaryVitalsInput = Partial<Record<string, string>>;

/** إعداد إظهار/إخفاء كل حقل في شاشة السكرتارية */
export type SecretaryVitalsVisibility = Record<string, boolean>;

/** نوع الدفع للكشف — مستخدم في الإحصائيات المالية */
export type PaymentType = 'cash' | 'insurance' | 'discount';

/**
 * جنس المريض — ثابت مدى الحياة، يُخزَّن في ملف المريض الموحد ويُنقل تلقائياً
 * لكل حجز/استشارة جديدة لنفس المريض (مفتاح البحث: الاسم/الهاتف/patientFileId).
 */
export type PatientGender = 'male' | 'female';

/**
 * سجل كشف كامل لمريض — ده أهم entity في النظام.
 * بيحتوي على كل تفاصيل الزيارة: بيانات المريض، الشكوى، الفحص، الوصفة، الدفع.
 * الحقول الاختيارية (?) منها اللي أضفناه لاحقاً، ومنها اللي ظهر مع التأمين/الفروع.
 */
export interface PatientRecord {
  id: string;
  date: string;
  patientName: string;
  phone?: string;
  /**
   * سن المريض وقت الزيارة (snapshot ثابت) — لا يتغير بعد حفظ السجل.
   * ده أساس حساب السن التلقائي: لما ندور على المريض في زيارة جاية،
   * بنضيف الفرق بين date اللي تحت وتاريخ اليوم على السن ده.
   */
  age: { years: string; months: string; days: string };
  /** جنس المريض — ثابت لكل سجلات/مواعيد نفس المريض الموحد */
  gender?: PatientGender;
  /**
   * حامل أم لا — يُسأل كل زيارة للإناث من 18 إلى 50 سنة.
   * لا يُنقل من سجل سابق (متغير طبيعي يتغير من زيارة لأخرى).
   */
  pregnant?: boolean;
  /**
   * مرضعة أم لا — يُسأل كل زيارة للإناث من 18 إلى 50 سنة.
   * لا يُنقل من سجل سابق (متغير طبيعي يتغير من زيارة لأخرى).
   */
  breastfeeding?: boolean;
  weight: string;
  height?: string;
  bmi?: string;
  vitals: VitalSigns;

  // بيانات الكشف الطبية (بالإنجليزي للطباعة في الوصفة)
  complaintEn: string;
  historyEn: string;
  examEn: string;
  investigationsEn: string;
  diagnosisEn: string;
  rxItems: PrescriptionItem[];
  generalAdvice: string[];
  labInvestigations: string[];

  // نفس البيانات بالعربي (اختياري — للعرض في الواجهة)
  complaintAr?: string;
  historyAr?: string;
  examAr?: string;
  investigationsAr?: string;

  // ─── خاص بالاستشارات ───
  isConsultationOnly?: boolean;
  consultation?: ConsultationData;
  /** معرّف الكشف المصدر عند فصل الاستشارة كسجل مستقل */
  sourceExamRecordId?: string;
  /** تاريخ ووقت الكشف المصدر لاستخدامه في العرض المرجعي */
  sourceExamDate?: string;
  /** معرّف سجل الاستشارة المنفصل المرتبط بالكشف */
  consultationRecordId?: string;
  /** جميع تواريخ الاستشارات المرتبطة بالكشف (أحدث أولا) */
  consultationHistoryDates?: string[];
  /** جميع معرّفات سجلات الاستشارات المرتبطة بالكشف (بنفس ترتيب التواريخ) */
  consultationHistoryRecordIds?: string[];

  // ─── ملف المريض الموحد (نفس المريض قد يكون له زيارات متعددة) ───
  /** معرّف ملف المريض الموحد (مشتق من الاسم المتطابق) */
  patientFileId?: string;
  /** رقم ملف المريض التسلسلي الثابت */
  patientFileNumber?: number;
  /** مفتاح المطابقة الدقيق لملف المريض */
  patientFileNameKey?: string;

  // ─── بيانات الدفع ───
  /** الدفع: كاش أو تأمين أو خصم */
  paymentType?: PaymentType;
  /** معرف شركة التأمين (مرجع لجدول insuranceCompanies) */
  insuranceCompanyId?: string;
  /** اسم شركة التأمين (نسخة محلية للعرض السريع) */
  insuranceCompanyName?: string;
  /** كود الموافقة من شركة التأمين */
  insuranceApprovalCode?: string;
  /** رقم كارنيه التأمين الخاص بالمريض */
  insuranceMembershipId?: string;
  /** نسبة تحمل المريض وقت الكشف (لحفظ السجل التاريخي) */
  patientSharePercent?: number;
  /** قيمة الخصم المحسوبة وقت الحفظ */
  discountAmount?: number;
  /** نسبة الخصم (%) المحسوبة وقت الحفظ */
  discountPercent?: number;
  /** معرف سبب الخصم من القائمة الرئيسية */
  discountReasonId?: string;
  /** نص سبب الخصم (نسخة تاريخية للعرض حتى بعد تعديل القائمة) */
  discountReasonLabel?: string;
  /** سعر الخدمة الأساسي المستخدم وقت حفظ هذا السجل (لتثبيت الإحصائيات تاريخياً) */
  serviceBasePrice?: number;
  /** سعر الاستشارة الأساسي للسجل القديم الذي يحتوي consultation inline */
  consultationServiceBasePrice?: number;
  /** أسعار الاستشارات الأساسية لكل عنصر داخل consultationHistoryDates */
  consultationHistoryServiceBasePrices?: number[];
  /** معرّف الفرع الذي تم فيه الكشف */
  branchId?: string;
}

/**
 * سجل استشارة بعد الكشف — أخف من PatientRecord لأن بيانات المريض الأساسية
 * بتكون محفوظة بالفعل في الكشف المصدر (sourceExamRecordId).
 */
export interface ConsultationData {
  date: string;
  complaintEn: string;
  historyEn: string;
  examEn: string;
  investigationsEn?: string;
  diagnosisEn: string;
  rxItems: PrescriptionItem[];
  generalAdvice: string[];
  labInvestigations: string[];
  complaintAr?: string;
  historyAr?: string;
  examAr?: string;
  investigationsAr?: string;
  /**
   * سن المريض وقت الاستشارة (snapshot). لا يتغير بعد الحفظ حتى لو زاد العمر لاحقاً.
   * الهدف: ثبات السجلات التاريخية بالسن اللي كان وقت الاستشارة فعلياً.
   */
  ageAtVisit?: { years: string; months: string; days: string };
  /** حالة الحمل وقت هذه الاستشارة (snapshot) */
  pregnant?: boolean;
  /** حالة الرضاعة وقت هذه الاستشارة (snapshot) */
  breastfeeding?: boolean;
}

/**
 * روشتة جاهزة محفوظة — الطبيب بيحفظ باترن وصفة علاج شائع (مثلاً: نزلة برد بسيطة)
 * ويستخدمها مباشرة في أي كشف لاحق من غير ما يكتبها تاني.
 */
export interface ReadyPrescription {
  id: string;
  name: string;
  rxItems: PrescriptionItem[];
  generalAdvice: string[];
  labInvestigations: string[];
  createdAt?: string;
  updatedAt?: string;
}
