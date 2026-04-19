import type { PaymentType, SystemRequestLineSettings } from '../../../types';

export type ClinicalReportLanguage = 'ar' | 'en';
export type ClinicalReportPageSize = 'A4' | 'A5';

export interface PatientAgeSnapshot {
  years: string;
  months: string;
  days: string;
}

export interface ClinicalAttachmentSnapshot {
  kind: 'image' | 'pdf' | 'document';
  title: string;
  url: string;
  sourceLabel?: string;
}

export interface ClinicalVisitSnapshot {
  id: string;
  visitType: 'exam' | 'consultation';
  visitDateIso: string;
  visitDateLabel: string;
  sourceExamDateIso?: string;
  sourceExamDateLabel?: string;
  complaint: string;
  history: string;
  examination: string;
  investigations: string;
  diagnosis: string;
  medications: string[];
  advice: string[];
  labsAndNotes: string[];
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    rbs?: string;
    spo2?: string;
    rr?: string;
  };
  weight?: string;
  height?: string;
  bmi?: string;
  attachments?: ClinicalAttachmentSnapshot[];
  paymentType?: PaymentType;
}

export interface PatientClinicalTimelineSnapshot {
  patientName: string;
  patientFileNumber?: number;
  patientPhone?: string;
  patientAge: PatientAgeSnapshot;
  patientAgeTextAr: string;
  patientAgeTextEn: string;
  visitCount: number;
  examCount: number;
  consultationCount: number;
  visits: ClinicalVisitSnapshot[];
}

export interface ClinicalTimelinePoint {
  dateLabel: string;
  title: string;
  summary: string;
  changeNotes: string[];
}

export interface ClinicalLocalizedVisitRegistryItem {
  id: string;
  visitTypeLabel: string;
  dateLabel: string;
  sourceExamLabel?: string;
  diagnosis: string;
  medications: string[];
  advice: string[];
  labsAndNotes: string[];
  keyClinicalDetails: string[];
}

export interface ClinicalAiNarrative {
  reportTitle: string;
  executiveSummary: string[];
  temporalEvolution: string[];
  timeline: ClinicalTimelinePoint[];
  localizedVisitRegistry: ClinicalLocalizedVisitRegistryItem[];
  currentClinicalPicture: string[];
  recommendations: string[];
  warningFlags: string[];
  confidenceStatement: string;
}

export interface OpenClinicalAiReportWindowInput {
  snapshot: PatientClinicalTimelineSnapshot;
  narrative: ClinicalAiNarrative;
  generatedByAi?: boolean;
  language: ClinicalReportLanguage;
  pageSize: ClinicalReportPageSize;
  doctorName: string;
  initialFontSize: number;
  systemRequestSettings?: SystemRequestLineSettings;
}

export interface GenerateClinicalAiNarrativeInput {
  snapshot: PatientClinicalTimelineSnapshot;
  language: ClinicalReportLanguage;
}

export interface GenerateClinicalAiNarrativeResult {
  narrative: ClinicalAiNarrative;
  generatedByAi: boolean;
}
