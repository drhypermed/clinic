/**
 * خدمة جلب المواعيد للسكرتيرة (Secretary Appointments Service)
 *
 * تستدعي Cloud Function `listAppointmentsForSecretary` لقراءة مواعيد
 * الطبيب مباشرةً (مع filter بالفرع) وتُرجع:
 *   - today    : مواعيد اليوم (غير منفذة)
 *   - upcoming : مواعيد الأيام القادمة (غير منفذة)
 *   - completed: مواعيد منفذة خلال آخر 30 يوم
 *
 * الفائدة: السكرتيرة تشوف البيانات فوراً بدون الاعتماد على الطبيب يكون online
 * لمزامنة `bookingConfig.todayAppointmentsByBranch` وأخواتها. هذا حل جذري
 * لمشكلة "مواعيد اليوم فاضية دايماً" و"بحجز ميعاد ومش بلاقيه".
 */
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import type { TodayAppointment } from '../components/appointments/public-booking/types';

type ListAppointmentsPayload = {
  secret: string;
  userId: string;
  sessionToken?: string;
  branchId?: string;
  /** اليوم حسب التوقيت المحلي للسكرتيرة (YYYY-MM-DD) — لتفادي فروق المناطق. */
  todayStr?: string;
};

type RawAppointment = Record<string, unknown>;

type ListAppointmentsResult = {
  today: TodayAppointment[];
  upcoming: TodayAppointment[];
  completed: TodayAppointment[];
};

const toOptionalText = (value: unknown): string | undefined => {
  const normalized = String(value || '').trim();
  return normalized || undefined;
};

const toFiniteNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseAppointment = (raw: unknown): TodayAppointment | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const item = raw as RawAppointment;
  const id = String(item.id || '').trim();
  const dateTime = String(item.dateTime || '').trim();
  const patientName = String(item.patientName || '').trim() || 'بدون اسم';
  if (!id || !dateTime) return null;

  const branchId = toOptionalText(item.branchId) || 'main';
  const appointmentType =
    item.appointmentType === 'consultation' ? 'consultation' : 'exam';
  const source =
    item.source === 'public'
      ? 'public'
      : item.source === 'secretary'
      ? 'secretary'
      : undefined;

  const result: TodayAppointment = {
    id,
    patientName,
    dateTime,
    branchId,
    appointmentType,
    source: source as TodayAppointment['source'],
  };

  const age = toOptionalText(item.age);
  if (age) result.age = age;
  const phone = toOptionalText(item.phone);
  if (phone) result.phone = phone;
  const visitReason = toOptionalText(item.visitReason);
  if (visitReason) result.visitReason = visitReason;
  if (typeof item.isFirstVisit === 'boolean') result.isFirstVisit = item.isFirstVisit;

  if (item.secretaryVitals && typeof item.secretaryVitals === 'object') {
    result.secretaryVitals = item.secretaryVitals as TodayAppointment['secretaryVitals'];
  }

  const examCompletedAt = toOptionalText(item.examCompletedAt);
  if (examCompletedAt) result.examCompletedAt = examCompletedAt;

  const consultationSourceAppointmentId = toOptionalText(item.consultationSourceAppointmentId);
  if (consultationSourceAppointmentId) {
    result.consultationSourceAppointmentId = consultationSourceAppointmentId;
  }
  const consultationSourceCompletedAt = toOptionalText(item.consultationSourceCompletedAt);
  if (consultationSourceCompletedAt) {
    result.consultationSourceCompletedAt = consultationSourceCompletedAt;
  }
  const consultationSourceRecordId = toOptionalText(item.consultationSourceRecordId);
  if (consultationSourceRecordId) {
    result.consultationSourceRecordId = consultationSourceRecordId;
  }

  const paymentType = toOptionalText(item.paymentType);
  if (paymentType === 'insurance' || paymentType === 'discount' || paymentType === 'cash') {
    result.paymentType = paymentType;
  }
  const insuranceCompanyId = toOptionalText(item.insuranceCompanyId);
  if (insuranceCompanyId) result.insuranceCompanyId = insuranceCompanyId;
  const insuranceCompanyName = toOptionalText(item.insuranceCompanyName);
  if (insuranceCompanyName) result.insuranceCompanyName = insuranceCompanyName;
  const insuranceMembershipId = toOptionalText(item.insuranceMembershipId);
  if (insuranceMembershipId) result.insuranceMembershipId = insuranceMembershipId;
  const insuranceApprovalCode = toOptionalText(item.insuranceApprovalCode);
  if (insuranceApprovalCode) result.insuranceApprovalCode = insuranceApprovalCode;

  const patientSharePercent = toFiniteNumber(item.patientSharePercent);
  if (patientSharePercent !== undefined) result.patientSharePercent = patientSharePercent;
  const discountAmount = toFiniteNumber(item.discountAmount);
  if (discountAmount !== undefined) result.discountAmount = discountAmount;
  const discountPercent = toFiniteNumber(item.discountPercent);
  if (discountPercent !== undefined) result.discountPercent = discountPercent;

  const discountReasonId = toOptionalText(item.discountReasonId);
  if (discountReasonId) result.discountReasonId = discountReasonId;
  const discountReasonLabel = toOptionalText(item.discountReasonLabel);
  if (discountReasonLabel) result.discountReasonLabel = discountReasonLabel;

  return result;
};

const parseList = (value: unknown): TodayAppointment[] => {
  if (!Array.isArray(value)) return [];
  const parsed: TodayAppointment[] = [];
  for (const item of value) {
    const entry = parseAppointment(item);
    if (entry) parsed.push(entry);
  }
  return parsed;
};

/**
 * جلب كل مواعيد الفرع المنظَّمة (اليوم / قادمة / منفذة) عبر Cloud Function.
 * يرمي خطأ لو الجلسة غير صالحة أو الصلاحيات مرفوضة — العميل يتعامل معه.
 */
export const listAppointmentsForSecretary = async (
  payload: ListAppointmentsPayload
): Promise<ListAppointmentsResult> => {
  const callable = httpsCallable(functions, 'listAppointmentsForSecretary');
  const response = await callable(payload);
  const data = (response.data || {}) as {
    today?: unknown;
    upcoming?: unknown;
    completed?: unknown;
  };

  return {
    today: parseList(data.today),
    upcoming: parseList(data.upcoming),
    completed: parseList(data.completed),
  };
};
