import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import type { RecentExamPatientOption } from '../types';
import type { PatientSuggestionOption } from '../types';

type ListRecentExamRecordsForSecretaryPayload = {
  secret: string;
  userId: string;
  sessionToken?: string;
  branchId?: string;
};

type ListRecentExamRecordsForSecretaryResult = {
  recentExamPatients: RecentExamPatientOption[];
  patientDirectory: PatientSuggestionOption[];
};

const toOptionalText = (value: unknown): string | undefined => {
  const normalized = String(value || '').trim();
  return normalized || undefined;
};

const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

export const listRecentExamRecordsForSecretary = async (
  payload: ListRecentExamRecordsForSecretaryPayload
): Promise<ListRecentExamRecordsForSecretaryResult> => {
  const callable = httpsCallable(functions, 'listRecentExamRecordsForSecretary');
  const response = await callable(payload);
  const data = (response.data || {}) as {
    recentExamPatients?: unknown;
    patientDirectory?: unknown;
  };

  const parsed = Array.isArray(data.recentExamPatients)
    ? data.recentExamPatients
        .filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === 'object' && !Array.isArray(item)
        )
        .map((item) => ({
          id: String(item.id || '').trim(),
          patientName: String(item.patientName || '').trim() || 'بدون اسم',
          age: toOptionalText(item.age),
          phone: toOptionalText(item.phone),
          examCompletedAt: String(item.examCompletedAt || '').trim(),
          consultationCompletedAt: toOptionalText(item.consultationCompletedAt),
          consultationCompletedDates: Array.isArray(item.consultationCompletedDates)
            ? item.consultationCompletedDates
                .map((value) => String(value || '').trim())
                .filter(Boolean)
            : undefined,
          consultationSourceRecordId: toOptionalText(item.consultationSourceRecordId),
        }))
        .filter((item) => item.id && item.examCompletedAt)
    : [];

  const parsedDirectory = Array.isArray(data.patientDirectory)
    ? (data.patientDirectory as unknown[])
        .filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === 'object' && !Array.isArray(item)
        )
        .map((item) => ({
          id: String(item.id || '').trim(),
          patientName: String(item.patientName || '').trim() || 'بدون اسم',
          age: toOptionalText(item.age),
          phone: toOptionalText(item.phone),
          lastExamDate: toOptionalText(item.lastExamDate),
          lastConsultationDate: toOptionalText(item.lastConsultationDate),
          patientFileNumber: toPositiveFileNumber(item.patientFileNumber),
        }))
        .filter((item) => item.id && item.patientName)
    : [];

  return {
    recentExamPatients: parsed,
    patientDirectory: parsedDirectory,
  };
};
