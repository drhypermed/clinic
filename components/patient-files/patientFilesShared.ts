import type { PatientRecord } from '../../types';
import { formatUserDateTime } from '../../utils/cairoTime';
import { normalizePatientNameForFile } from '../../services/patient-files';

export type PatientVisitType = 'exam' | 'consultation';

export interface PatientVisitEntry {
  visitId: string;
  type: PatientVisitType;
  date: string;
  sourceExamDate?: string;
  linkedConsultationDates?: string[];
  record: PatientRecord;
}

export interface PatientFileData {
  key: string;
  name: string;
  fileNumber?: number;
  fileId?: string;
  phones: string[];
  visits: PatientVisitEntry[];
  examCount: number;
  consultationCount: number;
  latestVisitDate?: string;
  additionalInfo?: string;
}

export interface VisitContent {
  complaintAr: string;
  complaintEn: string;
  historyAr: string;
  historyEn: string;
  examAr: string;
  examEn: string;
  investigationsAr: string;
  investigationsEn: string;
  diagnosisEn: string;
  vitals?: PatientRecord['vitals'];
  rxItems: PatientRecord['rxItems'];
  generalAdvice: string[];
  labInvestigations: string[];
  paymentType?: PatientRecord['paymentType'];
  discountAmount?: PatientRecord['discountAmount'];
  discountPercent?: PatientRecord['discountPercent'];
  discountReasonId?: PatientRecord['discountReasonId'];
  discountReasonLabel?: PatientRecord['discountReasonLabel'];
}

export const PATIENT_FILE_DOC_PREFIX = 'patientFile__';

export const asTimestamp = (date?: string): number => {
  const parsed = Date.parse(String(date || ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const uniqueTrimmed = (values: Array<string | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    const normalized = String(value || '').trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });

  return result;
};

export const decodePatientFileNameKeyFromDocId = (docId: string): string => {
  if (!docId.startsWith(PATIENT_FILE_DOC_PREFIX)) return '';

  const encoded = docId.slice(PATIENT_FILE_DOC_PREFIX.length);
  if (!encoded) return '';

  try {
    return decodeURIComponent(encoded).trim();
  } catch {
    return encoded.trim();
  }
};

const toPhoneText = (value: unknown): string | undefined => {
  const normalized = String(value ?? '').trim();
  return normalized || undefined;
};

export const extractRecordPhoneCandidates = (record: PatientRecord): string[] => {
  const raw = record as unknown as Record<string, unknown>;

  return uniqueTrimmed([
    toPhoneText(record.phone),
    toPhoneText(raw.phoneNumber),
    toPhoneText(raw.patientPhone),
    toPhoneText(raw.mobile),
    toPhoneText(raw.whatsapp),
  ]);
};

export const isPositiveFileNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
};

export const compareByLatestVisitDateDesc = (left: PatientFileData, right: PatientFileData): number => {
  const latestDiff = asTimestamp(right.latestVisitDate) - asTimestamp(left.latestVisitDate);
  if (latestDiff !== 0) return latestDiff;
  return left.name.localeCompare(right.name, 'ar');
};

export const compareByFileNumberOldestToNewest = (left: PatientFileData, right: PatientFileData): number => {
  const leftHasNumber = isPositiveFileNumber(left.fileNumber);
  const rightHasNumber = isPositiveFileNumber(right.fileNumber);

  if (leftHasNumber && rightHasNumber) {
    const leftNumber = Number(left.fileNumber);
    const rightNumber = Number(right.fileNumber);
    if (leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }
  }

  if (leftHasNumber !== rightHasNumber) {
    return leftHasNumber ? -1 : 1;
  }

  return compareByLatestVisitDateDesc(left, right);
};

export const compareByFileNumberNewestToOldest = (left: PatientFileData, right: PatientFileData): number => {
  const leftHasNumber = isPositiveFileNumber(left.fileNumber);
  const rightHasNumber = isPositiveFileNumber(right.fileNumber);

  if (leftHasNumber && rightHasNumber) {
    const leftNumber = Number(left.fileNumber);
    const rightNumber = Number(right.fileNumber);
    if (leftNumber !== rightNumber) {
      return rightNumber - leftNumber;
    }
  }

  if (leftHasNumber !== rightHasNumber) {
    return leftHasNumber ? -1 : 1;
  }

  return compareByLatestVisitDateDesc(left, right);
};

export const extractVisitContent = (visit: PatientVisitEntry): VisitContent => {
  const record = visit.record;

  if (visit.type === 'exam') {
    return {
      complaintAr: record.complaintAr || '',
      complaintEn: record.complaintEn || '',
      historyAr: record.historyAr || '',
      historyEn: record.historyEn || '',
      examAr: record.examAr || '',
      examEn: record.examEn || '',
      investigationsAr: record.investigationsAr || '',
      investigationsEn: record.investigationsEn || '',
      diagnosisEn: record.diagnosisEn || '',
      vitals: record.vitals,
      rxItems: record.rxItems || [],
      generalAdvice: record.generalAdvice || [],
      labInvestigations: record.labInvestigations || [],
      paymentType: record.paymentType,
      discountAmount: record.discountAmount,
      discountPercent: record.discountPercent,
      discountReasonId: record.discountReasonId,
      discountReasonLabel: record.discountReasonLabel,
    };
  }

  if (record.isConsultationOnly) {
    return {
      complaintAr: record.complaintAr || '',
      complaintEn: record.complaintEn || '',
      historyAr: record.historyAr || '',
      historyEn: record.historyEn || '',
      examAr: record.examAr || '',
      examEn: record.examEn || '',
      investigationsAr: record.investigationsAr || '',
      investigationsEn: record.investigationsEn || '',
      diagnosisEn: record.diagnosisEn || '',
      vitals: record.vitals,
      rxItems: record.rxItems || [],
      generalAdvice: record.generalAdvice || [],
      labInvestigations: record.labInvestigations || [],
      paymentType: record.paymentType,
      discountAmount: record.discountAmount,
      discountPercent: record.discountPercent,
      discountReasonId: record.discountReasonId,
      discountReasonLabel: record.discountReasonLabel,
    };
  }

  return {
    complaintAr: record.consultation?.complaintAr || '',
    complaintEn: record.consultation?.complaintEn || '',
    historyAr: record.consultation?.historyAr || '',
    historyEn: record.consultation?.historyEn || '',
    examAr: record.consultation?.examAr || '',
    examEn: record.consultation?.examEn || '',
    investigationsAr: record.consultation?.investigationsAr || '',
    investigationsEn: record.consultation?.investigationsEn || '',
    diagnosisEn: record.consultation?.diagnosisEn || '',
    vitals: record.vitals,
    rxItems: record.consultation?.rxItems || [],
    generalAdvice: record.consultation?.generalAdvice || [],
    labInvestigations: record.consultation?.labInvestigations || [],
    paymentType: record.paymentType,
    discountAmount: record.discountAmount,
    discountPercent: record.discountPercent,
    discountReasonId: record.discountReasonId,
    discountReasonLabel: record.discountReasonLabel,
  };
};

export const formatPatientFileDateLabel = (date: string): string => {
  return formatUserDateTime(date);
};

export const resolvePatientFileKeyFromRecord = (record: PatientRecord): string => {
  const name = String(record.patientName || '').trim();
  const fallbackKey = normalizePatientNameForFile(name);
  return String(record.patientFileNameKey || fallbackKey).trim();
};

export const buildPatientFiles = (records: PatientRecord[]): PatientFileData[] => {
  const groups = new Map<string, PatientFileData>();
  const seenVisitIds = new Set<string>();

  const ensureGroup = (record: PatientRecord): PatientFileData | null => {
    const name = String(record.patientName || '').trim();
    const key = resolvePatientFileKeyFromRecord(record);
    if (!key) return null;

    const existing = groups.get(key);
    if (existing) {
      if (!existing.fileId && record.patientFileId) existing.fileId = record.patientFileId;
      if (!isPositiveFileNumber(existing.fileNumber) && isPositiveFileNumber(record.patientFileNumber)) {
        existing.fileNumber = record.patientFileNumber;
      }

      const phoneCandidates = extractRecordPhoneCandidates(record);
      if (phoneCandidates.length > 0) {
        existing.phones = uniqueTrimmed([...existing.phones, ...phoneCandidates]);
      }
      return existing;
    }

    const created: PatientFileData = {
      key,
      name,
      fileNumber: isPositiveFileNumber(record.patientFileNumber) ? record.patientFileNumber : undefined,
      fileId: record.patientFileId,
      phones: extractRecordPhoneCandidates(record),
      visits: [],
      examCount: 0,
      consultationCount: 0,
      latestVisitDate: undefined,
    };

    groups.set(key, created);
    return created;
  };

  const pushVisit = (group: PatientFileData, visit: PatientVisitEntry) => {
    if (!visit.date) return;
    if (seenVisitIds.has(visit.visitId)) return;

    seenVisitIds.add(visit.visitId);
    group.visits.push(visit);

    if (visit.type === 'exam') group.examCount += 1;
    else group.consultationCount += 1;

    const visitTs = asTimestamp(visit.date);
    const latestTs = asTimestamp(group.latestVisitDate);
    if (visitTs > latestTs) {
      group.latestVisitDate = visit.date;
    }
  };

  records.forEach((record) => {
    const group = ensureGroup(record);
    if (!group) return;

    if (!record.isConsultationOnly) {
      const linkedConsultationDates = uniqueTrimmed(
        Array.isArray(record.consultationHistoryDates) && record.consultationHistoryDates.length > 0
          ? record.consultationHistoryDates
          : (record.consultation?.date ? [record.consultation.date] : [])
      ).sort((left, right) => asTimestamp(right) - asTimestamp(left));

      pushVisit(group, {
        visitId: `exam:${record.id}`,
        type: 'exam',
        date: record.date,
        record,
        linkedConsultationDates,
      });

      if (record.consultation?.date && !record.consultationRecordId) {
        pushVisit(group, {
          visitId: `consultation-inline:${record.id}:${record.consultation.date}`,
          type: 'consultation',
          date: record.consultation.date,
          sourceExamDate: record.date,
          record,
        });
      }

      return;
    }

    pushVisit(group, {
      visitId: `consultation:${record.id}`,
      type: 'consultation',
      date: record.date,
      sourceExamDate: record.sourceExamDate,
      record,
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    visits: [...group.visits].sort((left, right) => asTimestamp(right.date) - asTimestamp(left.date)),
    phones: uniqueTrimmed(group.phones),
  }));
};
