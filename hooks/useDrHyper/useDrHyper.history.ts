
import React from 'react';
import { PrescriptionItem } from '../../types';
import { AppStateSnapshot } from './useDrHyper.types';
import { resetPatientFormState } from './useDrHyper.recordHelpers';

type SetString = React.Dispatch<React.SetStateAction<string>>;
type SetNullableString = React.Dispatch<React.SetStateAction<string | null>>;
type SetStringArray = React.Dispatch<React.SetStateAction<string[]>>;
type SetRxItems = React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
type SetAppStateSnapshotArray = React.Dispatch<React.SetStateAction<AppStateSnapshot[]>>;

interface CreateHistoryActionsParams {
    setHistoryStack: SetAppStateSnapshotArray;
    setFutureStack: SetAppStateSnapshotArray;
    setLastSavedHash: SetString;
    rxItems: PrescriptionItem[];
    generalAdvice: string[];
    labInvestigations: string[];
    historyStack: AppStateSnapshot[];
    futureStack: AppStateSnapshot[];
    setRxItems: SetRxItems;
    setGeneralAdvice: SetStringArray;
    setLabInvestigations: SetStringArray;
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
    // setters الجديدة للهوية (اختياريّة لضمان backward compatibility)
    setDateOfBirth?: SetString;
    setGender?: React.Dispatch<React.SetStateAction<any>>;
    setPregnant?: React.Dispatch<React.SetStateAction<boolean | null>>;
    // setter لعمر الحمل بالأسابيع
    setGestationalAgeWeeks?: React.Dispatch<React.SetStateAction<number | null>>;
    setBreastfeeding?: React.Dispatch<React.SetStateAction<boolean | null>>;
    setVitals: React.Dispatch<React.SetStateAction<{ bp: string; pulse: string; temp: string; rbs: string; spo2: string; rr: string }>>;
    setErrorMsg: SetNullableString;
    setSmartQuotaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveRecordId: SetNullableString;
    setIsConsultationMode: React.Dispatch<React.SetStateAction<boolean>>;
    setConsultationDate: SetNullableString;
    setConsultationSourceRecordId: SetNullableString;
    setVisitDate: SetString;
    setVisitType: React.Dispatch<React.SetStateAction<'exam' | 'consultation'>>;
    setActiveVisitDateTime: SetNullableString;
    setIsPastConsultationMode: React.Dispatch<React.SetStateAction<boolean>>;
    setActivePatientFileId: SetNullableString;
    setActivePatientFileNameKey: SetNullableString;
    setActivePatientFileNumber: React.Dispatch<React.SetStateAction<number | null>>;
    setPaymentType: React.Dispatch<React.SetStateAction<'cash' | 'insurance' | 'discount'>>;
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
    setIsDataOnlyMode: React.Dispatch<React.SetStateAction<boolean>>;
    showNotification: (
        message: string,
        type?: 'success' | 'error' | 'info',
        options?: React.MouseEvent<any> | { event?: React.MouseEvent<any>; id?: string; firestoreId?: string }
    ) => void;
}

export const createHistoryActions = ({
    setHistoryStack,
    setFutureStack,
    setLastSavedHash,
    rxItems,
    generalAdvice,
    labInvestigations,
    historyStack,
    futureStack,
    setRxItems,
    setGeneralAdvice,
    setLabInvestigations,
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
    setErrorMsg,
    setSmartQuotaModalOpen,
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
    showNotification,
}: CreateHistoryActionsParams) => {
    
    const saveHistory = () => {
        setHistoryStack(prev => [...prev, { rxItems: [...rxItems], generalAdvice: [...generalAdvice], labInvestigations: [...labInvestigations] }]);
        setFutureStack([]); // مسح خطوات "الإعادة" عند بدء تعديل جديد
        setLastSavedHash('');
    };

    const handleUndo = () => {
        if (historyStack.length === 0) return;
        const lastState = historyStack[historyStack.length - 1];
        setFutureStack(prev => [...prev, { rxItems, generalAdvice, labInvestigations }]);
        setRxItems(lastState.rxItems);
        setGeneralAdvice(lastState.generalAdvice);
        setLabInvestigations(lastState.labInvestigations);
        setHistoryStack(prev => prev.slice(0, -1));
        setLastSavedHash('');
    };

    const handleRedo = () => {
        if (futureStack.length === 0) return;
        const nextState = futureStack[futureStack.length - 1];
        setHistoryStack(prev => [...prev, { rxItems, generalAdvice, labInvestigations }]);
        setRxItems(nextState.rxItems);
        setGeneralAdvice(nextState.generalAdvice);
        setLabInvestigations(nextState.labInvestigations);
        setFutureStack(prev => prev.slice(0, -1));
        setLastSavedHash('');
    };

    const handleReset = (e?: React.MouseEvent<any>) => {
        resetPatientFormState({
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
        });
        if (e) showNotification('تم تهيئة النموذج لمريض جديد', 'info', { id: 'reset-patient' });
    };

    return {
        saveHistory,
        handleUndo,
        handleRedo,
        handleReset,
    };
};

