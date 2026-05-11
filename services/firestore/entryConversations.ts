/**
 * ─────────────────────────────────────────────────────────────────────────────
 * نظام التواصل الموحّد بين الطبيب والسكرتارية (Entry Conversations)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * طبقة موحَّدة فوق الـ implementations الأقدم في `booking-secretary/`:
 *   - D2S (Doctor → Secretary): الطبيب يطلب من السكرتيرة تأكيد دخول حالة
 *     (delegates to entryAlerts).
 *   - S2D (Secretary → Doctor): السكرتيرة تطلب إذن من الطبيب لفتح ملف
 *     (delegates to entryRequests).
 *
 * الـ4 عمليات: `request`, `respond`, `subscribeToApprovedAppointments`,
 *   `subscribeToSecretaryResponses`, `clearSecretaryResponse`.
 */

import {
  setEntryAlert,
  addSecretaryApprovedEntryId,
  respondToDoctorEntryAlert,
} from './booking-secretary/entryAlerts';
import {
  subscribeToSecretaryEntryAlertResponse,
  subscribeToSecretaryApprovedEntryIds,
  clearSecretaryEntryAlertResponse,
} from './booking-secretary/entryAlerts.subscribers';
import {
  setSecretaryEntryRequest,
  subscribeToSecretaryEntryRequest,
  respondToSecretaryEntryRequest,
} from './booking-secretary/entryRequests';
import type { SecretaryEntryAlertResponse, SecretaryEntryRequest } from '../../types';

/** اتجاه التواصل — مين بيبعت لمين. */
type EntryDirection = 'D2S' | 'S2D';

/** حالة الطلب. */
type EntryStatus = 'approved' | 'rejected';

/** معلومات المريض اللي بتظهر في الإشعار (اختياري). */
interface EntryPatientInfo {
  age?: string;
  visitReason?: string;
  gender?: 'male' | 'female';
  pregnant?: boolean;
  breastfeeding?: boolean;
}

/** Payload لإرسال طلب جديد. */
interface RequestEntryArgs {
  secret: string;
  direction: EntryDirection;
  appointmentId: string;
  patientName: string;
  branchId?: string;
  /** اختياري لـ S2D فقط: نوع الموعد + بيانات المريض + مصدر الاستشارة. */
  appointmentType?: 'exam' | 'consultation';
  patientInfo?: EntryPatientInfo;
  consultationSource?: {
    appointmentId?: string;
    completedAt?: string;
    recordId?: string;
  };
  /** اختياري لـ S2D: doctorId لو متوفر بدل ما يتقرا من config. */
  doctorId?: string;
}

/** Payload للرد على طلب موجود. */
interface RespondEntryArgs {
  secret: string;
  direction: EntryDirection;
  appointmentId: string;
  status: EntryStatus;
  branchId?: string;
}

/** Payload للاشتراك بالردود (الطبيب يستمع لرد السكرتيرة). */
interface SubscribeResponsesArgs {
  secret: string;
  onChange: (response: SecretaryEntryAlertResponse | null) => void;
  branchId?: string;
}

/** Payload للاشتراك بالـappointmentIds اللي السكرتيرة وافقت عليها. */
interface SubscribeApprovedArgs {
  secret: string;
  onChange: (ids: string[]) => void;
  branchId?: string;
}

/** Payload للاشتراك العام في طلبات الجهة المقابلة (الطبيب يستمع لطلبات السكرتيرة S2D). */
interface SubscribeArgs {
  secret: string;
  role: 'doctor' | 'secretary';
  onChange: (data: SecretaryEntryRequest | null) => void;
  branchId?: string;
}

/** Payload لتعليم أن الطبيب فتح الكشف مباشرة بدون طلب مسبق. */
interface MarkExamOpenedArgs {
  secret: string;
  appointmentId: string;
  branchId?: string;
}

/**
 * الواجهة الموحدة — يستخدمها الـUI بدلاً من استدعاء الـ implementations
 * الأقدم مباشرةً.
 */
export const entryConversations = {
  /** إرسال طلب جديد (يحدد الاتجاه D2S أو S2D). */
  request: async (args: RequestEntryArgs): Promise<void> => {
    if (args.direction === 'D2S') {
      // الطبيب يبعت alert للسكرتيرة — caseName = اسم المريض.
      await setEntryAlert(args.secret, args.patientName, args.appointmentId, args.branchId);
      return;
    }
    // S2D: السكرتيرة تبعت طلب للطبيب — بنمرر باقي البيانات لو موجودة.
    await setSecretaryEntryRequest(
      args.secret,
      {
        appointmentId: args.appointmentId,
        patientName: args.patientName,
        branchId: args.branchId,
        appointmentType: args.appointmentType,
        age: args.patientInfo?.age,
        visitReason: args.patientInfo?.visitReason,
        gender: args.patientInfo?.gender,
        pregnant: args.patientInfo?.pregnant,
        breastfeeding: args.patientInfo?.breastfeeding,
        consultationSourceAppointmentId: args.consultationSource?.appointmentId,
        consultationSourceCompletedAt: args.consultationSource?.completedAt,
        consultationSourceRecordId: args.consultationSource?.recordId,
      },
      args.doctorId,
    );
  },

  /** الرد على طلب (الجهة الثانية ترد بـapproved/rejected). */
  respond: async (args: RespondEntryArgs): Promise<void> => {
    if (args.direction === 'D2S') {
      // طلب الطبيب — السكرتيرة بترد عليه.
      await respondToDoctorEntryAlert(args.secret, args.appointmentId, args.status, args.branchId);
      return;
    }
    // S2D: طلب السكرتيرة — الطبيب بيرد.
    await respondToSecretaryEntryRequest(args.secret, args.appointmentId, args.status, args.branchId);
  },

  /** الاشتراك في طلبات الجهة المقابلة (حالياً الطبيب يستمع لـS2D من السكرتيرة). */
  subscribe: (args: SubscribeArgs) => {
    // مبدئياً، الطبيب فقط هو من يستمع — السكرتيرة عندها مسار مختلف عبر
    // subscribeToApprovedAppointments / subscribeToSecretaryResponses أعلاه.
    if (args.role === 'doctor') {
      return subscribeToSecretaryEntryRequest(args.secret, args.onChange, args.branchId);
    }
    // role='secretary' غير مستخدم حالياً — نرجع unsubscribe فارغ.
    return () => undefined;
  },

  /** الاشتراك في الـappointmentIds اللي السكرتيرة وافقت عليها (للطبيب). */
  subscribeToApprovedAppointments: (args: SubscribeApprovedArgs) =>
    subscribeToSecretaryApprovedEntryIds(args.secret, args.onChange, args.branchId),

  /** الاشتراك في ردود السكرتيرة على alerts الطبيب. */
  subscribeToSecretaryResponses: (args: SubscribeResponsesArgs) =>
    subscribeToSecretaryEntryAlertResponse(args.secret, args.onChange, args.branchId),

  /** مسح آخر رد للسكرتيرة (بعد ما الطبيب شافه). */
  clearSecretaryResponse: (secret: string): Promise<void> =>
    clearSecretaryEntryAlertResponse(secret),

  /**
   * الطبيب فتح الكشف مباشرة بدون طلب مسبق — نضيف الـappointmentId
   * لقائمة المعتمد ليرى السكرتيرة فوراً أن الحالة دخلت كشف.
   */
  markExamOpened: (args: MarkExamOpenedArgs): Promise<void> =>
    addSecretaryApprovedEntryId(args.secret, args.appointmentId, args.branchId),
};
