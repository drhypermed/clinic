import type { PatientFileData } from '../../patient-files/patientFilesShared';

import { generateClinicalTimelineNarrative } from './generateClinicalTimelineReport';
import { openClinicalAiReportWindow } from './openClinicalAiReportWindow';
import { buildPatientClinicalTimelineSnapshot } from './timelineSnapshot';
import type {
  ClinicalReportLanguage,
  ClinicalReportPageSize,
  OpenClinicalAiReportWindowInput,
} from './types';

export interface CreateAndOpenClinicalAiPatientReportParams {
  patientFile: PatientFileData;
  language: ClinicalReportLanguage;
  pageSize: ClinicalReportPageSize;
  fontSize: number;
  doctorName: string;
  systemRequestSettings?: OpenClinicalAiReportWindowInput['systemRequestSettings'];
}

const clampFontSize = (value: number): number => {
  if (!Number.isFinite(value)) return 13;
  return Math.max(10, Math.min(22, Math.round(value)));
};

export const createAndOpenClinicalAiPatientReport = async (
  params: CreateAndOpenClinicalAiPatientReportParams,
): Promise<{ generatedByAi: boolean }> => {
  const {
    patientFile,
    language,
    pageSize,
    fontSize,
    doctorName,
    systemRequestSettings,
  } = params;

  const snapshot = buildPatientClinicalTimelineSnapshot(patientFile, language);
  if (!snapshot) {
    throw new Error(
      language === 'ar'
        ? 'لا توجد زيارات كافية لتوليد التقرير الطبي.'
        : 'No sufficient visits were found to generate the medical report.'
    );
  }

  const { narrative, generatedByAi } = await generateClinicalTimelineNarrative({
    snapshot,
    language,
  });

  openClinicalAiReportWindow({
    snapshot,
    narrative,
    language,
    pageSize,
    doctorName,
    initialFontSize: clampFontSize(fontSize),
    systemRequestSettings,
  });

  return { generatedByAi };
};
