import type { PatientFileData } from '../../patient-files/patientFilesShared';

import { generateClinicalTimelineNarrative } from './generateClinicalTimelineReport';
import { openClinicalAiReportWindow } from './openClinicalAiReportWindow';
import { buildPatientClinicalTimelineSnapshot } from './timelineSnapshot';
import type {
  ClinicalReportLanguage,
  ClinicalReportPageSize,
  OpenClinicalAiReportWindowInput,
  ReportPediatricTracking,
  ReportPregnancyTracking,
} from './types';

interface CreateAndOpenClinicalAiPatientReportParams {
  patientFile: PatientFileData;
  language: ClinicalReportLanguage;
  pageSize: ClinicalReportPageSize;
  fontSize: number;
  doctorName: string;
  systemRequestSettings?: OpenClinicalAiReportWindowInput['systemRequestSettings'];
  // ─ بيانات حزم التخصصات (اختياريه) — تظهر كملحق في نهايه التقرير لو موجوده
  pregnancyTracking?: ReportPregnancyTracking;
  pediatricTracking?: ReportPediatricTracking;
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
    pregnancyTracking,
    pediatricTracking,
  } = params;

  const baseSnapshot = buildPatientClinicalTimelineSnapshot(patientFile, language);
  if (!baseSnapshot) {
    throw new Error(
      language === 'ar'
        ? 'لا توجد زيارات كافية لتوليد التقرير الطبي.'
        : 'No sufficient visits were found to generate the medical report.'
    );
  }
  // نضيف بيانات حزم التخصصات للـsnapshot قبل ما نولّد الـnarrative + التقرير
  const snapshot = { ...baseSnapshot, pregnancyTracking, pediatricTracking };

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
