/**
 * bookingConfigSync.types:
 * أنواع (interfaces) الـ payload المُرسَل للمشتركين في إعدادات السكرتير.
 * مستخرج من bookingConfigSync.ts لتسهيل القراءة.
 */
import type { PatientDirectoryItem, RecentExamPatient, SecretaryEntryResponse } from './types';
import type {
  BookingConfigTodayAppointment,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
} from '../../../types';

export const DEFAULT_BRANCH_ID = 'main';

/** هيكل البيانات المتوقع عند الاشتراك في تحديثات التكوين */
export interface BookingConfigSubscribePayload {
  /**
   * يُضبط على نوع الخطأ لو `onSnapshot` فشل (permission-denied / offline / unknown).
   * الـ subscriber يستخدمه لإخراج الـ UI من "جاري الانتظار" وعرض شاشة login أو رسالة خطأ.
   */
  __error?: 'permission-denied' | 'unavailable' | 'unauthenticated' | 'unknown';
  userId?: string;
  entryAlert?: {
    caseName: string;
    createdAt: string;
    appointmentId: string;
    branchId?: string;
  };
  /** طلبات الدخول مقسّمة بالفرع (السكرتيرة تقرأ فرعها فقط) */
  entryAlertByBranch?: Record<
    string,
    { caseName: string; createdAt: string; appointmentId: string; branchId?: string }
  >;
  entryAlertResponse?: SecretaryEntryResponse;
  todayAppointments?: BookingConfigTodayAppointment[];
  /** مواعيد اليوم مقسّمة بالفرع — المفتاح 'main' للفرع الرئيسي.
   *  السكرتيرة تقرأ فرعها فقط. الطبيب يكتب لكل الفروع. */
  todayAppointmentsByBranch?: Record<string, BookingConfigTodayAppointment[]>;
  recentExamPatients?: RecentExamPatient[];
  /** آخر المرضى المفحوصين مقسّمين بالفرع */
  recentExamPatientsByBranch?: Record<string, RecentExamPatient[]>;
  patientDirectory?: PatientDirectoryItem[];
  /** دليل المرضى مقسّم بالفرع */
  patientDirectoryByBranch?: Record<string, PatientDirectoryItem[]>;
  doctorEntryResponse?: SecretaryEntryResponse;
  /** ردود الطبيب على طلبات الدخول مقسّمة بالفرع */
  doctorEntryResponseByBranch?: Record<string, SecretaryEntryResponse>;
  approvedEntryAppointmentIds?: string[];
  /** قوائم الموافقات للدخول مقسّمة بالفرع */
  approvedEntryAppointmentIdsByBranch?: Record<string, string[]>;
  passwordHash?: string;
  formTitle?: string;
  doctorDisplayName?: string;
  secretaryAuthRequired?: boolean;
  doctorEmail?: string;
  secretaryVitalsVisibility?: SecretaryVitalsVisibility;
  secretaryVitalFields?: SecretaryVitalFieldDefinition[];
  /** الخرائط per-branch — يستخدمها المشترك لاختيار إعدادات الفرع الصحيح. */
  secretaryVitalsVisibilityByBranch?: Record<string, SecretaryVitalsVisibility>;
  secretaryVitalFieldsByBranch?: Record<string, SecretaryVitalFieldDefinition[]>;
}
