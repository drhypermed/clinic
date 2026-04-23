// ─────────────────────────────────────────────────────────────────────────────
// أنواع الحجوزات والمواعيد والفروع (Appointments & Branches)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - ClinicAppointment: موعد كشف أو استشارة في العيادة
//   - Branch: فرع من فروع العيادة
//   - PublicBookingSlot: ميعاد متاح يحدده الطبيب للحجز العام
//   - PublicBranchInfo: بيانات فرع منشورة للعرض في فورم الحجز العام
// ─────────────────────────────────────────────────────────────────────────────

import type { PatientGender, SecretaryVitalsInput, PaymentType } from './patient';

/**
 * موعد حجز في العيادة.
 * الحقول الاختيارية بيزداد عددها حسب نوع الموعد (كشف/استشارة) ومصدره
 * (سكرتير/عيادة/الجمهور عبر الفورم العام).
 */
export interface ClinicAppointment {
  id: string;
  patientName: string;
  phone: string;
  dateTime: string; // ISO string — تاريخ ووقت الموعد
  createdAt?: string; // ISO — وقت إنشاء الحجز
  /** وقت تنفيذ فتح الكشف (تم الكشف) - ISO */
  examCompletedAt?: string;
  /** السن (مثلاً: ٣٠ سنة أو ٥ سنوات) */
  age?: string;
  /** سبب الزيارة */
  visitReason?: string;
  /** أول زيارة؟ (يملأها المريض في فورم الجمهور ليدل الطبيب/السكرتارية هل له ملف سابق) */
  isFirstVisit?: boolean;
  /** مصدر الحجز: من السكرتارية، من الفورم العام للجمهور، أو من العيادة */
  source?: 'secretary' | 'clinic' | 'public';
  /** مستخدم الجمهور صاحب الحجز (لو الحجز من الفورم العام) */
  publicUserId?: string;
  /** نوع الموعد */
  appointmentType?: 'exam' | 'consultation';
  /** قياسات السكرتارية قبل دخول الطبيب */
  secretaryVitals?: SecretaryVitalsInput;

  // ─── بيانات الهوية الثابتة + الحالة المؤقتة ───
  /** جنس المريض (ثابت مدى الحياة) — يظهر للطبيب في شاشة الكشف */
  gender?: PatientGender;
  /** تاريخ الميلاد (YYYY-MM-DD) — ثابت، يُستخدم لحساب السن تلقائياً في الزيارات القادمة */
  dateOfBirth?: string;
  /** حامل؟ snapshot لهذا الموعد فقط (يُسأل كل مرة) */
  pregnant?: boolean;
  /** مرضعة؟ snapshot لهذا الموعد فقط */
  breastfeeding?: boolean;

  // ─── ربط الموعد بملف المريض الموحد ───
  /** معرّف ملف المريض المرتبط بالموعد */
  patientFileId?: string;
  /** رقم ملف المريض المرتبط بالموعد */
  patientFileNumber?: number;
  /** مفتاح اسم ملف المريض المرتبط بالموعد */
  patientFileNameKey?: string;

  // ─── خاص بالاستشارة اللي بتحصل بعد كشف سابق ───
  /** مرجع موعد الكشف السابق (عند اختيار نوع استشارة) */
  consultationSourceAppointmentId?: string;
  /** تاريخ تنفيذ الكشف السابق (ISO) */
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;

  // ─── بيانات الدفع وقت الحجز (لتأمين الأسعار تاريخياً) ───
  /** الدفع (يُدخله السكرتير وقت الحجز) */
  paymentType?: PaymentType;
  /** معرف شركة التأمين */
  insuranceCompanyId?: string;
  /** اسم شركة التأمين (للعرض السريع) */
  insuranceCompanyName?: string;
  /** كود الموافقة */
  insuranceApprovalCode?: string;
  /** رقم كارنيه المريض */
  insuranceMembershipId?: string;
  /** نسبة تحمل المريض (%) */
  patientSharePercent?: number;
  /** قيمة الخصم المحسوبة وقت الحجز */
  discountAmount?: number;
  /** نسبة الخصم (%) وقت الحجز */
  discountPercent?: number;
  /** معرف سبب الخصم المختار */
  discountReasonId?: string;
  /** نص سبب الخصم المختار */
  discountReasonLabel?: string;

  /** معرّف الفرع الذي ينتمي إليه الموعد */
  branchId?: string;
}

/** فرع من فروع العيادة (لو الطبيب عنده أكتر من عيادة أو فرع) */
export interface Branch {
  id: string;
  /** اسم الفرع (مثلاً: فرع المعادي) */
  name: string;
  /** عنوان الفرع */
  address?: string;
  /** تليفون الفرع */
  phone?: string;
  /** كود السكرتارية الخاص بالفرع */
  secretarySecret?: string;
  /** ترتيب العرض */
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * ميعاد متاح في الفورم العام للجمهور — الطبيب بيحدد مواعيده المتاحة،
 * والمريض من الجمهور بيختار منها وقت الحجز.
 */
export interface PublicBookingSlot {
  id: string;
  dateTime: string; // ISO
  /** معرّف الفرع. slots قديمة بدون هذا الحقل تظهر في كل الفروع. */
  branchId?: string;
}

/** بيانات فرع منشورة في publicBookingConfig لعرضها للمرضى عند الحجز */
export interface PublicBranchInfo {
  id: string;
  name: string;
  address?: string;
  isActive?: boolean;
}
