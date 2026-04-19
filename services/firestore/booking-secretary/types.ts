/**
 * أنواع البيانات لنظام السكرتارية (Secretary Module Types)
 * هذا الملف يحدد الهياكل البرمجية (Interfaces) المستخدمة لتبادل البيانات:
 * 1. إعدادات الحجز وملفات السكرتارية.
 * 2. المواعيد (اليومية، السابقة، والدليل العام).
 * 3. طلبات الدخول والردود عليها.
 * 4. بيانات تسجيل الدخول.
 */

import type {
  PaymentType,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsInput,
  SecretaryVitalsVisibility,
} from '../../../app/drug-catalog/types';

export interface BookingConfigView {
  userId: string;
  username?: string;
  passwordHash?: string;
  doctorDisplayName?: string;
  formTitle?: string;
  secretaryPasswordHash?: string;
  secretaryAuthRequired?: boolean;
  doctorEmail?: string;
  secretaryVitalsVisibility?: SecretaryVitalsVisibility;
  secretaryVitalFields?: SecretaryVitalFieldDefinition[];
  /** خرائط per-branch لإعدادات رؤية العلامات الحيوية وحقولها. المفتاح 'main' للفرع الرئيسي. */
  secretaryVitalsVisibilityByBranch?: Record<string, SecretaryVitalsVisibility>;
  secretaryVitalFieldsByBranch?: Record<string, SecretaryVitalFieldDefinition[]>;
}

export interface SecretaryProfile {
  name?: string;
}

/** الرد على طلب دخول السكرتير لبيانات المريض */
export interface SecretaryEntryResponse {
  status: 'approved' | 'rejected';
  appointmentId: string;
  respondedAt: string;
}

/** هيكل بيانات موعد اليوم المعروض للسكرتير */
export interface BookingConfigTodayAppointment {
  id: string;
  patientName: string;
  age?: string;
  phone?: string;
  visitReason?: string;
  secretaryVitals?: SecretaryVitalsInput;
  dateTime: string;
  source?: 'clinic' | 'secretary' | 'public';
  appointmentType?: 'exam' | 'consultation';
  consultationSourceAppointmentId?: string;
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
  /** وقت تنفيذ فتح الكشف — ISO string (للمواعيد المنفذة) */
  examCompletedAt?: string;
  /** معرف الفرع الذي ينتمي إليه الموعد (للعزل بين الفروع). المفتاح 'main' للفرع الرئيسي. */
  branchId?: string;
}

/** بيانات المريض الذي أتم الكشف مؤخراً */
export interface RecentExamPatient {
  id: string;
  patientName: string;
  age?: string;
  phone?: string;
  examCompletedAt: string;
  consultationCompletedAt?: string;
  consultationCompletedDates?: string[];
  consultationSourceRecordId?: string;
}

/** عنصر في دليل المرضى للبحث السريع */
export interface PatientDirectoryItem {
  id: string;
  patientName: string;
  age?: string;
  phone?: string;
  lastExamDate?: string;
  lastConsultationDate?: string;
  patientFileNumber?: number;
}

/** هيكل طلب الدخول المرسل من السكرتير للطبيب */
export interface SecretaryEntryRequest {
  appointmentId: string;
  patientName: string;
  age?: string;
  visitReason?: string;
  appointmentType?: 'exam' | 'consultation';
  consultationSourceAppointmentId?: string;
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;
  createdAt: string;
  /** معرّف الفرع الذي أرسلت منه السكرتيرة الطلب — للعزل بين الفروع. */
  branchId?: string;
}

/** بيانات جلسة تسجيل دخول السكرتير */
export interface SecretaryLoginTarget {
  secret: string;
  userId: string;
  secretaryPasswordHash?: string;
  formTitle?: string;
}
