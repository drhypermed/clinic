import type React from 'react';
import type { ConsultationData, PatientRecord, PaymentType, PrescriptionItem, VitalSigns } from '../../types';
import { normalizeAdviceList } from '../../utils/rx/rxUtils';
import { getCairoDayKey } from './useDrHyper.helpers';
import type { AppStateSnapshot } from './useDrHyper.types';

type SetString = React.Dispatch<React.SetStateAction<string>>;
type SetBoolean = React.Dispatch<React.SetStateAction<boolean>>;
type SetNullableString = React.Dispatch<React.SetStateAction<string | null>>;
type SetStringArray = React.Dispatch<React.SetStateAction<string[]>>;
type SetVisitType = React.Dispatch<React.SetStateAction<'exam' | 'consultation'>>;

interface PatientDemographicsSetters {
  setPatientName: SetString;
  setPhone: SetString;
  setAgeYears: SetString;
  setAgeMonths: SetString;
  setAgeDays: SetString;
  // setters الهوية الجديدة — اختياريّة لضمان backward compatibility
  setDateOfBirth?: SetString;
  setGender?: React.Dispatch<React.SetStateAction<any>>;
  setPregnant?: React.Dispatch<React.SetStateAction<boolean | null>>;
  // setter لعمر الحمل بالأسابيع — اختياري لـbackward compat
  setGestationalAgeWeeks?: React.Dispatch<React.SetStateAction<number | null>>;
  setBreastfeeding?: React.Dispatch<React.SetStateAction<boolean | null>>;
}

interface ClinicalStateSetters {
  setComplaintEn: SetString;
  setHistoryEn: SetString;
  setExamEn: SetString;
  setInvestigationsEn: SetString;
  setDiagnosisEn: SetString;
  setComplaint: SetString;
  setMedicalHistory: SetString;
  setExamination: SetString;
  setInvestigations: SetString;
  setRxItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
  setGeneralAdvice: SetStringArray;
  setLabInvestigations: SetStringArray;
}

interface RecordPhysicalSetters {
  setWeight: SetString;
  setHeight: SetString;
  setVitals: React.Dispatch<React.SetStateAction<VitalSigns>>;
}

interface ResetPatientFormSetters {
  setPatientName: SetString;
  setPhone: SetString;
  setComplaint: SetString;
  setMedicalHistory: SetString;
  setExamination: SetString;
  setInvestigations: SetString;
  setComplaintEn: SetString;
  setHistoryEn: SetString;
  setExamEn: SetString;
  setInvestigationsEn: SetString;
  setDiagnosisEn: SetString;
  setWeight: SetString;
  setHeight: SetString;
  setAgeYears: SetString;
  setAgeMonths: SetString;
  setAgeDays: SetString;
  // setters الجديدة لحقول الهوية — اختيارية لتفادي كسر أي مستدعٍ قديم
  setDateOfBirth?: SetString;
  setGender?: React.Dispatch<React.SetStateAction<any>>;
  setPregnant?: React.Dispatch<React.SetStateAction<boolean | null>>;
  // setter لعمر الحمل بالأسابيع — اختياري لـbackward compat
  setGestationalAgeWeeks?: React.Dispatch<React.SetStateAction<number | null>>;
  setBreastfeeding?: React.Dispatch<React.SetStateAction<boolean | null>>;
  setVitals: React.Dispatch<React.SetStateAction<VitalSigns>>;
  setRxItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
  setGeneralAdvice: SetStringArray;
  setLabInvestigations: SetStringArray;
  setHistoryStack: React.Dispatch<React.SetStateAction<AppStateSnapshot[]>>;
  setFutureStack: React.Dispatch<React.SetStateAction<AppStateSnapshot[]>>;
  setErrorMsg: SetNullableString;
  setSmartQuotaModalOpen: SetBoolean;
  setLastSavedHash: SetString;
  setActiveRecordId: SetNullableString;
  setIsConsultationMode: SetBoolean;
  setConsultationDate: SetNullableString;
  setConsultationSourceRecordId: SetNullableString;
  setVisitDate: SetString;
  setVisitType: SetVisitType;
  setActiveVisitDateTime: SetNullableString;
  setIsPastConsultationMode: SetBoolean;
  setActivePatientFileId: SetNullableString;
  setActivePatientFileNameKey: SetNullableString;
  setActivePatientFileNumber: React.Dispatch<React.SetStateAction<number | null>>;
  setPaymentType: React.Dispatch<React.SetStateAction<PaymentType>>;
  setInsuranceCompanyId: SetString;
  setInsuranceCompanyName: SetString;
  setInsuranceApprovalCode: SetString;
  setInsuranceMembershipId: SetString;
  setPatientSharePercent: React.Dispatch<React.SetStateAction<number>>;
  setDiscountAmount: React.Dispatch<React.SetStateAction<number>>;
  setDiscountPercent: React.Dispatch<React.SetStateAction<number>>;
  setDiscountReasonId: SetString;
  setDiscountReasonLabel: SetString;
  setSelectedMed: React.Dispatch<React.SetStateAction<any>>;
  setIsDataOnlyMode: SetBoolean;
}

type ClinicalPayloadInput = {
  complaintEn: string;
  historyEn: string;
  examEn: string;
  investigationsEn?: string;
  diagnosisEn: string;
  rxItems: PrescriptionItem[];
  generalAdvice: string[];
  labInvestigations: string[];
  complaintAr?: string;
  historyAr?: string;
  examAr?: string;
  investigationsAr?: string;
};

export const EMPTY_VITALS: VitalSigns = {
  bp: '',
  pulse: '',
  temp: '',
  rbs: '',
  spo2: '',
  rr: '',
};

export const buildClinicalPayload = ({
  complaintEn,
  historyEn,
  examEn,
  investigationsEn,
  diagnosisEn,
  rxItems,
  generalAdvice,
  labInvestigations,
  complaintAr,
  historyAr,
  examAr,
  investigationsAr,
}: ClinicalPayloadInput) => ({
  complaintEn,
  historyEn,
  examEn,
  investigationsEn: investigationsEn || '',
  diagnosisEn,
  rxItems,
  generalAdvice,
  labInvestigations,
  complaintAr: complaintAr || '',
  historyAr: historyAr || '',
  examAr: examAr || '',
  investigationsAr: investigationsAr || '',
});

export const applyPatientDemographicsFromRecord = (
  record: PatientRecord,
  {
    setPatientName,
    setPhone,
    setAgeYears,
    setAgeMonths,
    setAgeDays,
    setDateOfBirth,
    setGender,
    setPregnant,
    setGestationalAgeWeeks,
    setBreastfeeding,
  }: PatientDemographicsSetters
) => {
  setPatientName(record.patientName);
  setPhone(record.phone || '');
  setAgeYears(record.age?.years || '');
  setAgeMonths(record.age?.months || '');
  setAgeDays(record.age?.days || '');
  // الجنس ثابت — ينتقل لو السجل القديم محفوظ بيه (السجلات الأقدم قد لا تحتوي)
  if (setGender) setGender(record.gender ?? '');
  // ملاحظة: الحمل/الرضاعة + عمر الحمل يُعاد سؤالهم كل زيارة — بنمسحهم عند تحميل السجل القديم
  // (القيم القديمة ممكن تكون تغيرت)
  if (setPregnant) setPregnant(null);
  if (setGestationalAgeWeeks) setGestationalAgeWeeks(null);
  if (setBreastfeeding) setBreastfeeding(null);
};

export const applyRecordPhysicalFromRecord = (
  record: PatientRecord,
  {
    setWeight,
    setHeight,
    setVitals,
  }: RecordPhysicalSetters
) => {
  setWeight(record.weight);
  setHeight(record.height || '');
  setVitals(record.vitals || EMPTY_VITALS);
};

export const applyClinicalPayloadToState = (
  payload: ReturnType<typeof buildClinicalPayload>,
  {
    setComplaintEn,
    setHistoryEn,
    setExamEn,
    setInvestigationsEn,
    setDiagnosisEn,
    setComplaint,
    setMedicalHistory,
    setExamination,
    setInvestigations,
    setRxItems,
    setGeneralAdvice,
    setLabInvestigations,
  }: ClinicalStateSetters
) => {
  setComplaintEn(payload.complaintEn);
  setHistoryEn(payload.historyEn);
  setExamEn(payload.examEn);
  setInvestigationsEn(payload.investigationsEn);
  setDiagnosisEn(payload.diagnosisEn);
  setComplaint(payload.complaintAr);
  setMedicalHistory(payload.historyAr);
  setExamination(payload.examAr);
  setInvestigations(payload.investigationsAr);
  setRxItems(payload.rxItems);
  setGeneralAdvice(normalizeAdviceList(payload.generalAdvice || []));
  setLabInvestigations(payload.labInvestigations || []);
};

export const buildClinicalPayloadFromRecord = (record: PatientRecord) =>
  buildClinicalPayload({
    complaintEn: record.complaintEn,
    historyEn: record.historyEn,
    examEn: record.examEn,
    investigationsEn: record.investigationsEn,
    diagnosisEn: record.diagnosisEn,
    rxItems: record.rxItems,
    generalAdvice: record.generalAdvice,
    labInvestigations: record.labInvestigations,
    complaintAr: record.complaintAr,
    historyAr: record.historyAr,
    examAr: record.examAr,
    investigationsAr: record.investigationsAr,
  });

export const buildClinicalPayloadFromConsultation = (consultation: ConsultationData) =>
  buildClinicalPayload({
    complaintEn: consultation.complaintEn,
    historyEn: consultation.historyEn,
    examEn: consultation.examEn,
    investigationsEn: consultation.investigationsEn,
    diagnosisEn: consultation.diagnosisEn,
    rxItems: consultation.rxItems,
    generalAdvice: consultation.generalAdvice,
    labInvestigations: consultation.labInvestigations,
    complaintAr: consultation.complaintAr,
    historyAr: consultation.historyAr,
    examAr: consultation.examAr,
    investigationsAr: consultation.investigationsAr,
  });

export const getVisitDateDay = (isoDate?: string | null): string => {
  if (!isoDate) return getCairoDayKey();
  const day = isoDate.split('T')[0];
  return day || getCairoDayKey();
};

export const resetPatientFormState = ({
  setPatientName,
  setPhone,
  setComplaint,
  setMedicalHistory,
  setExamination,
  setInvestigations,
  setComplaintEn,
  setHistoryEn,
  setExamEn,
  setInvestigationsEn,
  setDiagnosisEn,
  setWeight,
  setHeight,
  setAgeYears,
  setAgeMonths,
  setAgeDays,
  setDateOfBirth,
  setGender,
  setPregnant,
  setGestationalAgeWeeks,
  setBreastfeeding,
  setVitals,
  setRxItems,
  setGeneralAdvice,
  setLabInvestigations,
  setHistoryStack,
  setFutureStack,
  setErrorMsg,
  setSmartQuotaModalOpen,
  setLastSavedHash,
  setActiveRecordId,
  setIsConsultationMode,
  setConsultationDate,
  setConsultationSourceRecordId,
  setVisitDate,
  setVisitType,
  setActiveVisitDateTime,
  setIsPastConsultationMode,
  setActivePatientFileId,
  setActivePatientFileNameKey,
  setActivePatientFileNumber,
  setPaymentType,
  setInsuranceCompanyId,
  setInsuranceCompanyName,
  setInsuranceApprovalCode,
  setInsuranceMembershipId,
  setPatientSharePercent,
  setDiscountAmount,
  setDiscountPercent,
  setDiscountReasonId,
  setDiscountReasonLabel,
  setSelectedMed,
  setIsDataOnlyMode,
}: ResetPatientFormSetters): void => {
  setPatientName('');
  setPhone('');
  setComplaint('');
  setMedicalHistory('');
  setExamination('');
  setInvestigations('');
  setComplaintEn('');
  setHistoryEn('');
  setExamEn('');
  setInvestigationsEn('');
  setDiagnosisEn('');
  setWeight('');
  setHeight('');
  setAgeYears('');
  setAgeMonths('');
  setAgeDays('');
  // تصفير الهوية الجديدة — "مريض جديد" يعني كله من الصفر
  if (setDateOfBirth) setDateOfBirth('');
  if (setGender) setGender('');
  if (setPregnant) setPregnant(null);
  if (setGestationalAgeWeeks) setGestationalAgeWeeks(null);
  if (setBreastfeeding) setBreastfeeding(null);
  setVitals(EMPTY_VITALS);
  setRxItems([]);
  setGeneralAdvice([]);
  setLabInvestigations([]);
  setHistoryStack([]);
  setFutureStack([]);
  setErrorMsg(null);
  setSmartQuotaModalOpen(false);
  setLastSavedHash('');
  setActiveRecordId(null);
  setIsConsultationMode(false);
  setConsultationDate(null);
  setConsultationSourceRecordId(null);
  setVisitDate(getCairoDayKey());
  setVisitType('exam');
  setActiveVisitDateTime(null);
  setIsPastConsultationMode(false);
  setActivePatientFileId(null);
  setActivePatientFileNameKey(null);
  setActivePatientFileNumber(null);
  setPaymentType('cash');
  setInsuranceCompanyId('');
  setInsuranceCompanyName('');
  setInsuranceApprovalCode('');
  setInsuranceMembershipId('');
  setPatientSharePercent(0);
  setDiscountAmount(0);
  setDiscountPercent(0);
  setDiscountReasonId('');
  setDiscountReasonLabel('');
  setSelectedMed(null);
  setIsDataOnlyMode(false);
};
