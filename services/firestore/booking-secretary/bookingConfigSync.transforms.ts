/**
 * bookingConfigSync.transforms:
 * دوال التحويل (sanitize قبل الكتابة، map بعد القراءة) لـ bookingConfig.
 * - sanitize*: تُنظف بيانات الإدخال قبل حفظها في Firestore.
 * - map*: تُحوّل البيانات الخام من Firestore لنموذج موحد آمن للـ UI.
 */
import type { PatientDirectoryItem, RecentExamPatient, SecretaryEntryResponse } from './types';
import type { BookingConfigTodayAppointment } from '../../../types';
import { resolveAppointmentType } from '../../../utils/appointmentType';
import { omitUndefined, toOptionalText } from './helpers';
import { sanitizeSecretaryVitalsInput } from '../../../utils/secretaryVitals';

// ─── مساعدات رقمية خالصة ─────────────────────────────────────────────
export const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

export const toNonNegativeNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
};

// ─── Sanitizers (قبل الكتابة) ────────────────────────────────────────

/** تنظيف عنصر موعد واحد قبل الحفظ (يحافظ على branchId) */
export const sanitizeTodayAppointment = (item: BookingConfigTodayAppointment) => {
  const resolvedType = resolveAppointmentType(item);
  return omitUndefined({
    id: item.id,
    patientName: toOptionalText(item.patientName) || '',
    age: item.age ? toOptionalText(item.age) : undefined,
    phone: item.phone ? toOptionalText(item.phone) : undefined,
    visitReason: item.visitReason ? toOptionalText(item.visitReason) : undefined,
    secretaryVitals: sanitizeSecretaryVitalsInput(item.secretaryVitals),
    dateTime: item.dateTime,
    source: item.source,
    appointmentType: resolvedType,
    consultationSourceAppointmentId: item.consultationSourceAppointmentId,
    consultationSourceCompletedAt: item.consultationSourceCompletedAt,
    consultationSourceRecordId: item.consultationSourceRecordId,
    paymentType: item.paymentType,
    insuranceCompanyId:
      item.paymentType === 'insurance' ? toOptionalText(item.insuranceCompanyId) : undefined,
    insuranceCompanyName:
      item.paymentType === 'insurance' ? toOptionalText(item.insuranceCompanyName) : undefined,
    insuranceMembershipId:
      item.paymentType === 'insurance' ? toOptionalText(item.insuranceMembershipId) : undefined,
    insuranceApprovalCode:
      item.paymentType === 'insurance' ? toOptionalText(item.insuranceApprovalCode) : undefined,
    patientSharePercent:
      item.paymentType === 'insurance'
        ? toNonNegativeNumber(item.patientSharePercent)
        : undefined,
    discountAmount:
      item.paymentType === 'discount' ? toNonNegativeNumber(item.discountAmount) : undefined,
    discountPercent:
      item.paymentType === 'discount' ? toNonNegativeNumber(item.discountPercent) : undefined,
    discountReasonId:
      item.paymentType === 'discount' ? toOptionalText(item.discountReasonId) : undefined,
    discountReasonLabel:
      item.paymentType === 'discount' ? toOptionalText(item.discountReasonLabel) : undefined,
    examCompletedAt: item.examCompletedAt ? toOptionalText(item.examCompletedAt) : undefined,
    branchId: toOptionalText(item.branchId) || 'main',
  });
};

/** تنظيف عنصر "تم الكشف عليه مؤخراً" قبل الحفظ */
export const sanitizeRecentExamPatient = (item: RecentExamPatient) =>
  omitUndefined({
    id: item.id,
    patientName: toOptionalText(item.patientName) || '',
    age: item.age ? toOptionalText(item.age) : undefined,
    phone: item.phone ? toOptionalText(item.phone) : undefined,
    examCompletedAt: item.examCompletedAt,
    consultationCompletedAt: item.consultationCompletedAt,
    consultationCompletedDates: Array.isArray(item.consultationCompletedDates)
      ? item.consultationCompletedDates
          .map((value) => toOptionalText(value))
          .filter((value): value is string => Boolean(value))
      : undefined,
    consultationSourceRecordId: item.consultationSourceRecordId,
  });

/** تنظيف عنصر دليل المرضى قبل الحفظ */
export const sanitizePatientDirectoryItem = (item: PatientDirectoryItem) =>
  omitUndefined({
    id: item.id,
    patientName: toOptionalText(item.patientName) || '',
    age: item.age ? toOptionalText(item.age) : undefined,
    phone: item.phone ? toOptionalText(item.phone) : undefined,
    lastExamDate: item.lastExamDate,
    lastConsultationDate: item.lastConsultationDate,
    patientFileNumber: toPositiveFileNumber(item.patientFileNumber),
  });

// ─── Mappers (بعد القراءة من Firestore) ──────────────────────────────

export const mapTodayAppointments = (
  raw: unknown,
): BookingConfigTodayAppointment[] | undefined => {
  if (!Array.isArray(raw)) return undefined;

  return raw
    .filter(
      (item: { id?: string; patientName?: string; dateTime?: string }) =>
        typeof item?.id === 'string' &&
        typeof item?.patientName === 'string' &&
        typeof item?.dateTime === 'string',
    )
    .map((item: BookingConfigTodayAppointment) => {
      const resolvedType = resolveAppointmentType(item);
      return {
        id: item.id,
        patientName: toOptionalText(item.patientName) || '',
        age: toOptionalText(item.age),
        phone: toOptionalText(item.phone),
        visitReason: toOptionalText(item.visitReason),
        secretaryVitals: sanitizeSecretaryVitalsInput(item.secretaryVitals),
        dateTime: item.dateTime,
        source:
          item.source === 'public' || item.source === 'secretary' || item.source === 'clinic'
            ? item.source
            : undefined,
        appointmentType: resolvedType,
        consultationSourceAppointmentId:
          typeof item.consultationSourceAppointmentId === 'string'
            ? item.consultationSourceAppointmentId
            : undefined,
        consultationSourceCompletedAt:
          typeof item.consultationSourceCompletedAt === 'string'
            ? item.consultationSourceCompletedAt
            : undefined,
        consultationSourceRecordId:
          typeof item.consultationSourceRecordId === 'string'
            ? item.consultationSourceRecordId
            : undefined,
        paymentType:
          item.paymentType === 'insurance' ||
          item.paymentType === 'discount' ||
          item.paymentType === 'cash'
            ? item.paymentType
            : undefined,
        insuranceCompanyId:
          item.paymentType === 'insurance' ? toOptionalText(item.insuranceCompanyId) : undefined,
        insuranceCompanyName:
          item.paymentType === 'insurance' ? toOptionalText(item.insuranceCompanyName) : undefined,
        insuranceMembershipId:
          item.paymentType === 'insurance'
            ? toOptionalText(item.insuranceMembershipId)
            : undefined,
        insuranceApprovalCode:
          item.paymentType === 'insurance' ? toOptionalText(item.insuranceApprovalCode) : undefined,
        patientSharePercent:
          item.paymentType === 'insurance'
            ? toNonNegativeNumber(item.patientSharePercent)
            : undefined,
        discountAmount:
          item.paymentType === 'discount' ? toNonNegativeNumber(item.discountAmount) : undefined,
        discountPercent:
          item.paymentType === 'discount' ? toNonNegativeNumber(item.discountPercent) : undefined,
        discountReasonId:
          item.paymentType === 'discount' ? toOptionalText(item.discountReasonId) : undefined,
        discountReasonLabel:
          item.paymentType === 'discount' ? toOptionalText(item.discountReasonLabel) : undefined,
      };
    });
};

export const mapRecentExamPatients = (raw: unknown): RecentExamPatient[] | undefined => {
  if (!Array.isArray(raw)) return undefined;

  return raw
    .filter(
      (item: { id?: string; examCompletedAt?: string }) =>
        typeof item?.id === 'string' && typeof item?.examCompletedAt === 'string',
    )
    .map(
      (item: {
        id: string;
        patientName?: string;
        age?: string;
        phone?: string;
        examCompletedAt: string;
        consultationCompletedAt?: string;
        consultationCompletedDates?: string[];
        consultationSourceRecordId?: string;
      }) => ({
        id: item.id,
        patientName: toOptionalText(item.patientName) || 'بدون اسم',
        age: toOptionalText(item.age),
        phone: toOptionalText(item.phone),
        examCompletedAt: item.examCompletedAt,
        consultationCompletedAt:
          typeof item.consultationCompletedAt === 'string'
            ? item.consultationCompletedAt
            : undefined,
        consultationCompletedDates: Array.isArray(item.consultationCompletedDates)
          ? item.consultationCompletedDates
              .map((value) => toOptionalText(value))
              .filter((value): value is string => Boolean(value))
          : undefined,
        consultationSourceRecordId:
          typeof item.consultationSourceRecordId === 'string'
            ? item.consultationSourceRecordId
            : undefined,
      }),
    );
};

export const mapPatientDirectory = (raw: unknown): PatientDirectoryItem[] | undefined => {
  if (!Array.isArray(raw)) return undefined;

  return raw
    .filter(
      (item: { id?: string; patientName?: string }) =>
        typeof item?.id === 'string' && typeof item?.patientName === 'string',
    )
    .map(
      (item: {
        id: string;
        patientName: string;
        age?: string;
        phone?: string;
        lastExamDate?: string;
        lastConsultationDate?: string;
        patientFileNumber?: number;
      }) => ({
        id: item.id,
        patientName: toOptionalText(item.patientName) || '',
        age: toOptionalText(item.age),
        phone: toOptionalText(item.phone),
        lastExamDate: typeof item.lastExamDate === 'string' ? item.lastExamDate : undefined,
        lastConsultationDate:
          typeof item.lastConsultationDate === 'string' ? item.lastConsultationDate : undefined,
        patientFileNumber: toPositiveFileNumber(item.patientFileNumber),
      }),
    );
};

export const mapEntryResponse = (raw: unknown): SecretaryEntryResponse | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const item = raw as { status?: unknown; appointmentId?: unknown; respondedAt?: unknown };

  if (
    (item.status !== 'approved' && item.status !== 'rejected') ||
    typeof item.appointmentId !== 'string' ||
    typeof item.respondedAt !== 'string'
  ) {
    return undefined;
  }

  return {
    status: item.status,
    appointmentId: item.appointmentId,
    respondedAt: item.respondedAt,
  };
};
