import type { ConsultationData, PatientRecord } from '../../types';

export const CONSULTATION_RECORD_PREFIX = 'consultation__';

const CONSULTATION_RECORD_SOURCE_SEPARATOR = '__';

const sanitizeIdSegment = (value?: string): string => {
  const normalized = String(value || '').trim().replace(/[^A-Za-z0-9_-]/g, '');
  return normalized || 'standalone';
};

/**
 * Legacy deterministic ID (kept for backward compatibility with old records).
 */
export const buildConsultationRecordId = (sourceExamRecordId: string): string =>
  `${CONSULTATION_RECORD_PREFIX}${sourceExamRecordId}`;

/**
 * New generated consultation ID to allow multiple consultations per same exam.
 */
export const buildGeneratedConsultationRecordId = (
  sourceExamRecordId?: string,
  dateIso?: string
): string => {
  const sourcePart = sanitizeIdSegment(sourceExamRecordId);
  const timestamp = Number.isFinite(Date.parse(String(dateIso || '')))
    ? Date.parse(String(dateIso))
    : Date.now();
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${CONSULTATION_RECORD_PREFIX}${sourcePart}${CONSULTATION_RECORD_SOURCE_SEPARATOR}${timestamp}${CONSULTATION_RECORD_SOURCE_SEPARATOR}${randomPart}`;
};

const extractSourceExamRecordIdFromConsultationRecord = (record: {
  id?: string;
  sourceExamRecordId?: string;
}): string | undefined => {
  const explicit = String(record.sourceExamRecordId || '').trim();
  if (explicit) return explicit;

  const id = String(record.id || '').trim();
  if (!id.startsWith(CONSULTATION_RECORD_PREFIX)) return undefined;

  const raw = id.slice(CONSULTATION_RECORD_PREFIX.length);
  if (!raw) return undefined;

  const separatorIndex = raw.indexOf(CONSULTATION_RECORD_SOURCE_SEPARATOR);
  if (separatorIndex === -1) return raw;

  const parsed = raw.slice(0, separatorIndex).trim();
  return parsed || undefined;
};

const normalizeConsultationData = (consultation: ConsultationData): ConsultationData => ({
  date: consultation.date,
  complaintEn: consultation.complaintEn || '',
  historyEn: consultation.historyEn || '',
  examEn: consultation.examEn || '',
  investigationsEn: consultation.investigationsEn || '',
  diagnosisEn: consultation.diagnosisEn || '',
  rxItems: consultation.rxItems || [],
  generalAdvice: consultation.generalAdvice || [],
  labInvestigations: consultation.labInvestigations || [],
  complaintAr: consultation.complaintAr || '',
  historyAr: consultation.historyAr || '',
  examAr: consultation.examAr || '',
  investigationsAr: consultation.investigationsAr || '',
});

export const buildConsultationDataFromRecord = (record: PatientRecord): ConsultationData => {
  if (record.consultation) {
    return normalizeConsultationData(record.consultation);
  }

  return normalizeConsultationData({
    date: record.date,
    complaintEn: record.complaintEn || '',
    historyEn: record.historyEn || '',
    examEn: record.examEn || '',
    investigationsEn: record.investigationsEn || '',
    diagnosisEn: record.diagnosisEn || '',
    rxItems: record.rxItems || [],
    generalAdvice: record.generalAdvice || [],
    labInvestigations: record.labInvestigations || [],
    complaintAr: record.complaintAr || '',
    historyAr: record.historyAr || '',
    examAr: record.examAr || '',
    investigationsAr: record.investigationsAr || '',
  });
};

export const buildSeparatedConsultationRecordPayload = ({
  baseRecord,
  consultation,
  sourceExamRecordId,
  sourceExamDate,
}: {
  baseRecord: PatientRecord;
  consultation: ConsultationData;
  sourceExamRecordId?: string;
  sourceExamDate?: string;
}) => {
  const normalizedConsultation = normalizeConsultationData(consultation);

  return {
    patientName: baseRecord.patientName,
    phone: baseRecord.phone || undefined,
    age: baseRecord.age,
    weight: baseRecord.weight,
    height: baseRecord.height || undefined,
    bmi: baseRecord.bmi || undefined,
    vitals: baseRecord.vitals,
    date: normalizedConsultation.date,
    complaintEn: normalizedConsultation.complaintEn,
    historyEn: normalizedConsultation.historyEn,
    examEn: normalizedConsultation.examEn,
    investigationsEn: normalizedConsultation.investigationsEn || '',
    diagnosisEn: normalizedConsultation.diagnosisEn,
    rxItems: normalizedConsultation.rxItems,
    generalAdvice: normalizedConsultation.generalAdvice,
    labInvestigations: normalizedConsultation.labInvestigations,
    complaintAr: normalizedConsultation.complaintAr || '',
    historyAr: normalizedConsultation.historyAr || '',
    examAr: normalizedConsultation.examAr || '',
    investigationsAr: normalizedConsultation.investigationsAr || '',
    isConsultationOnly: true,
    sourceExamRecordId: sourceExamRecordId || undefined,
    sourceExamDate: sourceExamDate || undefined,
    paymentType: baseRecord.paymentType || 'cash',
    ...(baseRecord.paymentType === 'insurance'
      ? {
          insuranceCompanyId: baseRecord.insuranceCompanyId || undefined,
          insuranceCompanyName: baseRecord.insuranceCompanyName || undefined,
          insuranceApprovalCode: baseRecord.insuranceApprovalCode || undefined,
          insuranceMembershipId: baseRecord.insuranceMembershipId || undefined,
          patientSharePercent: baseRecord.patientSharePercent ?? 0,
        }
      : {}),
    ...(baseRecord.paymentType === 'discount'
      ? {
          discountAmount: Number(baseRecord.discountAmount || 0) || 0,
          discountPercent: Number(baseRecord.discountPercent || 0) || 0,
          discountReasonId: String(baseRecord.discountReasonId || '').trim() || undefined,
          discountReasonLabel: String(baseRecord.discountReasonLabel || '').trim() || undefined,
        }
      : {}),
  };
};

export const attachSeparatedConsultationsToExamRecords = (records: PatientRecord[]): PatientRecord[] => {
  const linkedConsultations = new Map<string, PatientRecord[]>();

  records.forEach((record) => {
    if (!record.isConsultationOnly) return;

    const sourceExamRecordId = extractSourceExamRecordIdFromConsultationRecord(record);
    if (!sourceExamRecordId) return;

    const existing = linkedConsultations.get(sourceExamRecordId) || [];
    existing.push(record);
    linkedConsultations.set(sourceExamRecordId, existing);
  });

  const sortByNewest = (left: PatientRecord, right: PatientRecord): number => {
    const leftMs = Date.parse(String(left.date || ''));
    const rightMs = Date.parse(String(right.date || ''));
    if (!Number.isFinite(leftMs) && !Number.isFinite(rightMs)) return 0;
    if (!Number.isFinite(leftMs)) return 1;
    if (!Number.isFinite(rightMs)) return -1;
    return rightMs - leftMs;
  };

  return records.map((record) => {
    if (record.isConsultationOnly) return record;

    const linkedConsultationList = linkedConsultations.get(record.id);
    if (!linkedConsultationList || linkedConsultationList.length === 0) {
      if (!record.consultation?.date) return record;
      return {
        ...record,
        consultationHistoryDates: [record.consultation.date],
        consultationHistoryRecordIds: record.consultationRecordId ? [record.consultationRecordId] : undefined,
      };
    }

    const sortedConsultations = [...linkedConsultationList].sort(sortByNewest);
    const latestConsultation = sortedConsultations[0];
    const consultationHistoryDates = sortedConsultations
      .map((item) => String(item.date || '').trim())
      .filter(Boolean);
    const consultationHistoryRecordIds = sortedConsultations
      .map((item) => String(item.id || '').trim())
      .filter(Boolean);

    return {
      ...record,
      consultation: buildConsultationDataFromRecord(latestConsultation),
      consultationRecordId: latestConsultation.id,
      consultationHistoryDates,
      consultationHistoryRecordIds,
    };
  });
};