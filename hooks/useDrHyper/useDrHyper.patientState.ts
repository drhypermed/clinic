
import { useMemo, useRef, useState } from 'react';
import type { Medication, PaymentType, PrescriptionItem } from '../../types';
import type { AppStateSnapshot } from './useDrHyper.types';
import { getCairoDayKey } from '../../utils/cairoTime';

export type VisitType = 'exam' | 'consultation';

export const useDrHyperPatientState = () => {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [ageDays, setAgeDays] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  
  const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', rbs: '', spo2: '', rr: '' });
  
  const [consultationDate, setConsultationDate] = useState<string | null>(null);
  const [visitDate, setVisitDate] = useState<string>(() => getCairoDayKey());
  const [visitType, setVisitType] = useState<VisitType>('exam');
  const [activeVisitDateTime, setActiveVisitDateTime] = useState<string | null>(null);
  const [isPastConsultationMode, setIsPastConsultationMode] = useState(false);
  const [consultationSourceRecordId, setConsultationSourceRecordId] = useState<string | null>(null);
  const [activePatientFileId, setActivePatientFileId] = useState<string | null>(null);
  const [activePatientFileNumber, setActivePatientFileNumber] = useState<number | null>(null);
  const [activePatientFileNameKey, setActivePatientFileNameKey] = useState<string | null>(null);

  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [insuranceCompanyId, setInsuranceCompanyId] = useState('');
  const [insuranceCompanyName, setInsuranceCompanyName] = useState('');
  const [insuranceApprovalCode, setInsuranceApprovalCode] = useState('');
  const [insuranceMembershipId, setInsuranceMembershipId] = useState('');
  const [patientSharePercent, setPatientSharePercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountReasonId, setDiscountReasonId] = useState('');
  const [discountReasonLabel, setDiscountReasonLabel] = useState('');

  const bmi = useMemo(() => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (weightNum > 0 && heightNum > 0) {
      const heightInMeters = heightNum / 100;
      const bmiValue = weightNum / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    }
    return '';
  }, [weight, height]);

  const updateVital = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const [complaint, setComplaint] = useState(''); // الشكوى الحالية
  const [medicalHistory, setMedicalHistory] = useState(''); // التاريخ المرضي
  const [examination, setExamination] = useState(''); // نتائج الفحص
  const [investigations, setInvestigations] = useState(''); // الفحوصات والتشخيص
  
  const [complaintEn, setComplaintEn] = useState('');
  const [historyEn, setHistoryEn] = useState('');
  const [examEn, setExamEn] = useState('');
  const [investigationsEn, setInvestigationsEn] = useState('');
  const [diagnosisEn, setDiagnosisEn] = useState('');

  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([]); // قائمة الأدوية المضافة
  const [generalAdvice, setGeneralAdvice] = useState<string[]>([]); // النصائح العامة
  const [labInvestigations, setLabInvestigations] = useState<string[]>([]); // التحاليل المطلوبة

  const [historyStack, setHistoryStack] = useState<AppStateSnapshot[]>([]); // الحالات السابقة
  const [futureStack, setFutureStack] = useState<AppStateSnapshot[]>([]); // الحالات الملغاة (Redo)

  const [analyzing, setAnalyzing] = useState(false); // هل الذكاء الاصطناعي يقوم بالتحليل الآن؟
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // رسالة الخطأ الحالية
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null); // الدواء المختار حالياً للتعديل
  const [isDataOnlyMode, setIsDataOnlyMode] = useState(false); // وضع "البيانات فقط" (بدون واجهة اختيار)
  const [lastSavedHash, setLastSavedHash] = useState<string>(''); // بصمة آخر حفظ لمقارنة التغييرات
  
  const prescriptionRef = useRef<HTMLDivElement>(null); // مرجع منطقة الطباعة
  const lastAddedItemIdRef = useRef<string | null>(null); // مرجع لآخر دواء أضيف (للانتقال إليه)
  
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null); // معرف السجل المفتوح حالياً من قاعدة البيانات
  const [isConsultationMode, setIsConsultationMode] = useState(false); // هل نحن في وضع "استشارة" (Re-consultation)؟

  const totalAgeInMonths = useMemo(() => {
    return (parseInt(ageYears) || 0) * 12 + (parseInt(ageMonths) || 0) + (parseInt(ageDays) || 0) / 30;
  }, [ageYears, ageMonths, ageDays]);

  const demographicsState = {
    patientName,
    setPatientName,
    phone,
    setPhone,
    ageYears,
    setAgeYears,
    ageMonths,
    setAgeMonths,
    ageDays,
    setAgeDays,
    weight,
    setWeight,
    height,
    setHeight,
    vitals,
    setVitals,
    consultationDate,
    setConsultationDate,
    visitDate,
    setVisitDate,
    visitType,
    setVisitType,
    activeVisitDateTime,
    setActiveVisitDateTime,
    isPastConsultationMode,
    setIsPastConsultationMode,
    consultationSourceRecordId,
    setConsultationSourceRecordId,
    activePatientFileId,
    setActivePatientFileId,
    activePatientFileNumber,
    setActivePatientFileNumber,
    activePatientFileNameKey,
    setActivePatientFileNameKey,
    bmi,
    updateVital,
  };

  const clinicalState = {
    complaint,
    setComplaint,
    medicalHistory,
    setMedicalHistory,
    examination,
    setExamination,
    investigations,
    setInvestigations,
    complaintEn,
    setComplaintEn,
    historyEn,
    setHistoryEn,
    examEn,
    setExamEn,
    investigationsEn,
    setInvestigationsEn,
    diagnosisEn,
    setDiagnosisEn,
  };

  const prescriptionState = {
    rxItems,
    setRxItems,
    generalAdvice,
    setGeneralAdvice,
    labInvestigations,
    setLabInvestigations,
    historyStack,
    setHistoryStack,
    futureStack,
    setFutureStack,
  };

  const uiState = {
    analyzing,
    setAnalyzing,
    errorMsg,
    setErrorMsg,
    selectedMed,
    setSelectedMed,
    isDataOnlyMode,
    setIsDataOnlyMode,
    lastSavedHash,
    setLastSavedHash,
    prescriptionRef,
    lastAddedItemIdRef,
    activeRecordId,
    setActiveRecordId,
    isConsultationMode,
    setIsConsultationMode,
    totalAgeInMonths,
  };

  const insuranceState = {
    paymentType,
    setPaymentType,
    insuranceCompanyId,
    setInsuranceCompanyId,
    insuranceCompanyName,
    setInsuranceCompanyName,
    insuranceApprovalCode,
    setInsuranceApprovalCode,
    insuranceMembershipId,
    setInsuranceMembershipId,
    patientSharePercent,
    setPatientSharePercent,
    discountAmount,
    setDiscountAmount,
    discountPercent,
    setDiscountPercent,
    discountReasonId,
    setDiscountReasonId,
    discountReasonLabel,
    setDiscountReasonLabel,
  };

  return {
    ...demographicsState,
    ...clinicalState,
    ...prescriptionState,
    ...uiState,
    ...insuranceState,
  };
};

export type DrHyperPatientState = ReturnType<typeof useDrHyperPatientState>;

