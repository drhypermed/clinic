import { extractVisitContent, formatPatientFileDateLabel } from '../../patient-files/patientFilesShared';
import type { PatientFileData } from '../../patient-files/patientFilesShared';

import type {
  ClinicalReportLanguage,
  ClinicalVisitSnapshot,
  PatientAgeSnapshot,
  PatientClinicalTimelineSnapshot,
} from './types';

const toText = (value: unknown): string => String(value ?? '').trim();

const toTimestamp = (value?: string): number => {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const uniqueNonEmpty = (values: string[]): string[] => {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const normalized = toText(value);
    if (!normalized) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    output.push(normalized);
  });

  return output;
};

const pickLocalizedText = (
  language: ClinicalReportLanguage,
  arabicValue?: string,
  englishValue?: string,
): string => {
  const ar = toText(arabicValue);
  const en = toText(englishValue);

  if (language === 'ar') {
    return ar || en;
  }

  return en || ar;
};

const normalizeAge = (age?: { years?: unknown; months?: unknown; days?: unknown }): PatientAgeSnapshot => {
  return {
    years: toText(age?.years) || '0',
    months: toText(age?.months) || '0',
    days: toText(age?.days) || '0',
  };
};

const buildMedicationLines = (rxItems: Array<{ type?: string; medication?: { name?: string }; instructions?: string }>): string[] => {
  const lines: string[] = [];

  rxItems
    .filter((item) => item.type === 'medication')
    .forEach((item) => {
      const medName = toText(item.medication?.name);
      const instructions = toText(item.instructions);
      if (!medName && !instructions) return;
      if (medName && instructions) {
        lines.push(`${medName}: ${instructions}`);
        return;
      }
      lines.push(medName || instructions);
    });

  return uniqueNonEmpty(lines);
};

const buildLabsAndNotes = (
  rxItems: Array<{ type?: string; instructions?: string }>,
  labInvestigations: string[]
): string[] => {
  const notes = rxItems
    .filter((item) => item.type === 'note')
    .map((item) => toText(item.instructions));

  return uniqueNonEmpty([
    ...labInvestigations.map((item) => toText(item)),
    ...notes,
  ]);
};

const buildVisitSnapshot = (
  visit: PatientFileData['visits'][number],
  language: ClinicalReportLanguage,
): ClinicalVisitSnapshot => {
  const visitContent = extractVisitContent(visit);

  const localizedDiagnosis = pickLocalizedText(
    language,
    visitContent.diagnosisEn,
    visitContent.diagnosisEn,
  );

  const normalizedVitals = {
    bp: toText(visitContent.vitals?.bp) || undefined,
    pulse: toText(visitContent.vitals?.pulse) || undefined,
    temp: toText(visitContent.vitals?.temp) || undefined,
    rbs: toText(visitContent.vitals?.rbs) || undefined,
    spo2: toText(visitContent.vitals?.spo2) || undefined,
    rr: toText(visitContent.vitals?.rr) || undefined,
  };
  const hasVitals = Object.values(normalizedVitals).some(Boolean);

  return {
    id: visit.visitId,
    visitType: visit.type,
    visitDateIso: visit.date,
    visitDateLabel: formatPatientFileDateLabel(visit.date),
    sourceExamDateIso: toText(visit.sourceExamDate) || undefined,
    sourceExamDateLabel: visit.sourceExamDate ? formatPatientFileDateLabel(visit.sourceExamDate) : undefined,
    complaint: pickLocalizedText(language, visitContent.complaintAr, visitContent.complaintEn),
    history: pickLocalizedText(language, visitContent.historyAr, visitContent.historyEn),
    examination: pickLocalizedText(language, visitContent.examAr, visitContent.examEn),
    investigations: pickLocalizedText(language, visitContent.investigationsAr, visitContent.investigationsEn),
    diagnosis: toText(localizedDiagnosis),
    medications: buildMedicationLines(visitContent.rxItems || []),
    advice: uniqueNonEmpty((visitContent.generalAdvice || []).map((item) => toText(item))),
    labsAndNotes: buildLabsAndNotes(visitContent.rxItems || [], visitContent.labInvestigations || []),
    vitals: hasVitals ? normalizedVitals : undefined,
    weight: toText(visit.record.weight) || undefined,
    height: toText(visit.record.height) || undefined,
    bmi: toText(visit.record.bmi) || undefined,
    attachments: [],
    paymentType: visitContent.paymentType,
  };
};

export const buildPatientClinicalTimelineSnapshot = (
  patientFile: PatientFileData,
  language: ClinicalReportLanguage,
): PatientClinicalTimelineSnapshot | null => {
  if (!patientFile) return null;

  const orderedVisits = [...(patientFile.visits || [])]
    .filter((visit) => toText(visit.date))
    .sort((left, right) => toTimestamp(left.date) - toTimestamp(right.date));

  if (orderedVisits.length === 0) return null;

  const latestVisitRecord = orderedVisits[orderedVisits.length - 1]?.record;
  const age = normalizeAge(latestVisitRecord?.age);

  const phoneCandidates = uniqueNonEmpty([
    ...(patientFile.phones || []),
    toText(latestVisitRecord?.phone),
  ]);

  return {
    patientName: toText(patientFile.name) || 'مريض بدون اسم',
    patientFileNumber: patientFile.fileNumber,
    patientPhone: phoneCandidates[0],
    patientAge: age,
    patientAgeTextAr: `${age.years} سنة - ${age.months} شهر - ${age.days} يوم`,
    patientAgeTextEn: `${age.years}y ${age.months}m ${age.days}d`,
    visitCount: orderedVisits.length,
    examCount: Number(patientFile.examCount || 0),
    consultationCount: Number(patientFile.consultationCount || 0),
    visits: orderedVisits.map((visit) => buildVisitSnapshot(visit, language)),
  };
};
