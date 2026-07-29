import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import type { RecentExamPatientOption } from '../types';
import { normalizePatientAddress } from '../utils/patientAddress';

type ListRecentExamRecordsForSecretaryPayload = {
  secret: string;
  userId: string;
  sessionToken?: string;
  branchId?: string;
};

type ListRecentExamRecordsForSecretaryResult = {
  recentExamPatients: RecentExamPatientOption[];
};

const toOptionalText = (value: unknown): string | undefined => {
  const normalized = String(value || '').trim();
  return normalized || undefined;
};

const toPatientGender = (value: unknown): RecentExamPatientOption['gender'] =>
  value === 'male' || value === 'female' ? value : undefined;

export const listRecentExamRecordsForSecretary = async (
  payload: ListRecentExamRecordsForSecretaryPayload
): Promise<ListRecentExamRecordsForSecretaryResult> => {
  const callable = httpsCallable(functions, 'listRecentExamRecordsForSecretary');
  const response = await callable(payload);
  const data = (response.data || {}) as {
    recentExamPatients?: unknown;
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
          patientFileNumber: Number.isFinite(Number(item.patientFileNumber))
            && Number(item.patientFileNumber) > 0
            ? Math.floor(Number(item.patientFileNumber))
            : undefined,
          age: toOptionalText(item.age),
          phone: toOptionalText(item.phone),
          address: normalizePatientAddress(item.address as RecentExamPatientOption['address']),
          gender: toPatientGender(item.gender),
          dateOfBirth: toOptionalText(item.dateOfBirth),
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

  return {
    recentExamPatients: parsed,
  };
};
