import { advancedAgeText } from '../../utils/patientIdentity';
import { formatAgeFromDateOfBirth, parseAgeToYearsMonthsDays } from './utils';

export interface PatientSuggestionAgeSource {
  age?: string;
  ageText?: string;
  dateOfBirth?: string;
  lastExamDate?: string;
  lastConsultationDate?: string;
  examCompletedAt?: string;
  consultationCompletedAt?: string;
}

const buildReferenceDate = (dateKey?: string): Date | undefined => {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return undefined;
  const parsed = new Date(`${dateKey}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const resolvePatientSuggestionAgeText = (
  candidate: PatientSuggestionAgeSource,
  visitDateKey?: string,
): string => {
  const ageFromDateOfBirth = formatAgeFromDateOfBirth(candidate.dateOfBirth, visitDateKey);
  if (ageFromDateOfBirth) return ageFromDateOfBirth;

  const storedAge = String(candidate.age ?? candidate.ageText ?? '').trim();
  if (!storedAge) return '';

  const lastVisitDate =
    candidate.lastExamDate ||
    candidate.examCompletedAt ||
    candidate.lastConsultationDate ||
    candidate.consultationCompletedAt;

  return advancedAgeText(
    parseAgeToYearsMonthsDays(storedAge),
    lastVisitDate,
    buildReferenceDate(visitDateKey),
  ) || storedAge;
};
