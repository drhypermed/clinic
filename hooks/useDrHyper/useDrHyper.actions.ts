import { createHistoryActions } from './useDrHyper.history';
import { createReadyPrescriptionActions } from './useDrHyper.readyPrescriptions';
import { createRecordActions } from './useDrHyper.records';
import { createSaveRecordAction } from './useDrHyper.saveRecord';
import { createManualItemActions } from './useDrHyper.manualItems';
import { createSmartRxActions } from './useDrHyper.smartActions';
import { createItemEditors } from './useDrHyper.itemEditors';
import { buildRxInstructions } from './useDrHyper.rxInstructions';
import { db } from '../../services/firebaseConfig';
import type { DrHyperPatientState } from './useDrHyper.patientState';
import type { DrHyperNotificationsState } from './useDrHyper.notifications';
import type { DrHyperRealtimeData } from './useDrHyper.realtime';
import type { DrHyperViewAndUsageState } from './useDrHyper.viewAndUsage';
import type { ExtendedUser } from '../useAuth';
import type { Medication } from '../../types';
import type { SmartQuotaLimitErrorDetails } from '../../services/accountTypeControlsService';

interface UseDrHyperActionsArgs {
  user: ExtendedUser | null;
  medications: Medication[];
  patientState: DrHyperPatientState;
  notifications: DrHyperNotificationsState;
  realtimeData: DrHyperRealtimeData;
  setCurrentView: DrHyperViewAndUsageState['setCurrentView'];
  trackMedUsage: DrHyperViewAndUsageState['trackMedUsage'];
  resolveCurrentUserAccountType: () => Promise<'free' | 'premium'>;
  getAccountTypeControls: () => Promise<any>;
  consumeStorageQuota: (feature: 'recordSave' | 'readyPrescriptionSave') => Promise<unknown>;
  consumeSmartPrescriptionQuota: () => Promise<unknown>;
  sanitizeRxItemsForSave: (items: any[]) => any[];
  sanitizeForFirestore: (value: unknown) => unknown;
  uniqTextList: (items: string[]) => string[];
  extractSmartQuotaErrorDetails: (error: unknown) => SmartQuotaLimitErrorDetails | null;
  buildWhatsAppUrlFromNumber: (number: string, message: string) => string;
  getQuotaReachedMessage: (details: SmartQuotaLimitErrorDetails, fallback: string) => string;
  applyLimitPlaceholder: (template: string, limit: number, fallback: string) => string;
  onTrackSmartPrescription?: (complaint: string) => void;
  /** الفرع النشط لحفظه مع السجلات */
  activeBranchId?: string;
}

export const useDrHyperActions = ({
  user,
  medications,
  patientState,
  notifications,
  realtimeData,
  setCurrentView,
  trackMedUsage,
  resolveCurrentUserAccountType,
  getAccountTypeControls,
  consumeStorageQuota,
  consumeSmartPrescriptionQuota,
  sanitizeRxItemsForSave,
  sanitizeForFirestore,
  uniqTextList,
  extractSmartQuotaErrorDetails,
  buildWhatsAppUrlFromNumber,
  getQuotaReachedMessage,
  applyLimitPlaceholder,
  onTrackSmartPrescription,
  activeBranchId,
}: UseDrHyperActionsArgs) => {
  const {
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
    setVitals,
    setErrorMsg,
    setSelectedMed,
    setIsDataOnlyMode,
    setActiveRecordId,
    setIsConsultationMode,
    setConsultationDate,
    setConsultationSourceRecordId,
    setVisitDate,
    setVisitType,
    setActiveVisitDateTime,
    setIsPastConsultationMode,
    setActivePatientFileId,
    setActivePatientFileNumber,
    setActivePatientFileNameKey,
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
    patientName,
    phone,
    ageYears,
    ageMonths,
    ageDays,
    weight,
    height,
    bmi,
    vitals,
    complaintEn,
    historyEn,
    examEn,
    investigationsEn,
    diagnosisEn,
    complaint,
    medicalHistory,
    examination,
    investigations,
    visitDate,
    visitType,
    activeVisitDateTime,
    lastSavedHash,
    activeRecordId,
    isConsultationMode,
    consultationSourceRecordId,
    activePatientFileId,
    activePatientFileNumber,
    activePatientFileNameKey,
    paymentType,
    insuranceCompanyId,
    insuranceCompanyName,
    insuranceApprovalCode,
    insuranceMembershipId,
    patientSharePercent,
    discountAmount,
    discountPercent,
    discountReasonId,
    discountReasonLabel,
    totalAgeInMonths,
    setAnalyzing,
    prescriptionRef,
    lastAddedItemIdRef,
  } = patientState;

  const {
    setSmartQuotaNotice,
    setSmartQuotaModalOpen,
    showNotification,
    openQuotaNoticeModal,
    dismissNotification,
    markOfflineSyncPendingIfNeeded,
  } = notifications;

  const { readyPrescriptions } = realtimeData;

  const prescriptionStateBindings = {
    rxItems,
    generalAdvice,
    labInvestigations,
    setRxItems,
    setGeneralAdvice,
    setLabInvestigations,
  };

  const patientDemographicsSetterBindings = {
    setPatientName,
    setPhone,
    setAgeYears,
    setAgeMonths,
    setAgeDays,
  };

  const patientClinicalSetterBindings = {
    setComplaint,
    setMedicalHistory,
    setExamination,
    setInvestigations,
    setComplaintEn,
    setHistoryEn,
    setExamEn,
    setInvestigationsEn,
    setDiagnosisEn,
  };

  const patientPhysicalSetterBindings = {
    setWeight,
    setHeight,
    setVitals,
  };

  const patientRecordModeSetterBindings = {
    setActiveRecordId,
    setIsConsultationMode,
    setConsultationDate,
    setConsultationSourceRecordId,
    setVisitDate,
    setVisitType,
    setActiveVisitDateTime,
    setActivePatientFileId,
    setActivePatientFileNumber,
    setActivePatientFileNameKey,
  };

  const historyActions = createHistoryActions({
    setHistoryStack,
    setFutureStack,
    setLastSavedHash,
    ...prescriptionStateBindings,
    historyStack,
    futureStack,
    ...patientDemographicsSetterBindings,
    ...patientClinicalSetterBindings,
    ...patientPhysicalSetterBindings,
    setErrorMsg,
    setSmartQuotaModalOpen,
    ...patientRecordModeSetterBindings,
    setIsPastConsultationMode,
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
  });
  const { saveHistory, handleReset } = historyActions;

  const { handleSaveRecord } = createSaveRecordAction({
    user: user ? { uid: user.uid } : null,
    patientName,
    phone,
    ageYears,
    ageMonths,
    ageDays,
    weight,
    height,
    bmi,
    vitals,
    complaintEn,
    historyEn,
    examEn,
    investigationsEn,
    diagnosisEn,
    rxItems,
    generalAdvice,
    labInvestigations,
    complaint,
    medicalHistory,
    examination,
    investigations,
    visitDate,
    visitType,
    activeVisitDateTime,
    lastSavedHash,
    activeRecordId,
    isConsultationMode,
    consultationSourceRecordId,
    activePatientFileId,
    activePatientFileNumber,
    activePatientFileNameKey,
    setActiveRecordId,
    setActiveVisitDateTime,
    setActivePatientFileId,
    setActivePatientFileNumber,
    setActivePatientFileNameKey,
    setIsConsultationMode,
    setConsultationSourceRecordId,
    setIsPastConsultationMode,
    setLastSavedHash,
    sanitizeRxItemsForSave,
    sanitizeForFirestore,
    consumeStorageQuota,
    extractSmartQuotaErrorDetails,
    getQuotaReachedMessage,
    openQuotaNoticeModal,
    showNotification,
    markOfflineSyncPendingIfNeeded,
    paymentType,
    insuranceCompanyId,
    insuranceCompanyName,
    insuranceApprovalCode,
    insuranceMembershipId,
    patientSharePercent,
    discountAmount,
    discountPercent,
    discountReasonId,
    discountReasonLabel,
    activeBranchId,
  });

  const readyPrescriptionActions = createReadyPrescriptionActions({
    user,
    db,
    ...prescriptionStateBindings,
    readyPrescriptions,
    sanitizeRxItemsForSave,
    sanitizeForFirestore,
    showNotification,
    getAccountTypeControls,
    resolveCurrentUserAccountType,
    applyLimitPlaceholder,
    dismissNotification,
    openQuotaNoticeModal,
    buildWhatsAppUrlFromNumber,
    consumeStorageQuota,
    extractSmartQuotaErrorDetails,
    getQuotaReachedMessage,
    saveHistory,
    setLastSavedHash,
    uniqTextList,
    activeBranchId,
  });

  const recordActions = createRecordActions({
    user,
    db,
    showNotification,
    ...patientDemographicsSetterBindings,
    ...patientPhysicalSetterBindings,
    ...patientClinicalSetterBindings,
    ...prescriptionStateBindings,
    setCurrentView,
    setHistoryStack,
    setFutureStack,
    setLastSavedHash,
    ...patientRecordModeSetterBindings,
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
    handleReset,
  });

  const smartRxActions = createSmartRxActions({
    complaint,
    medicalHistory,
    examination,
    investigations,
    complaintEn,
    historyEn,
    examEn,
    investigationsEn,
    diagnosisEn,
    ageYears,
    ageMonths,
    ageDays,
    weight,
    totalAgeInMonths,
    vitals,
    userId: user?.uid,
    consumeSmartPrescriptionQuota,
    extractSmartQuotaErrorDetails,
    openQuotaNoticeModal,
    saveHistory,
    showNotification,
    setAnalyzing,
    setErrorMsg,
    setSmartQuotaNotice,
    setSmartQuotaModalOpen,
    setComplaintEn,
    setHistoryEn,
    setExamEn,
    setInvestigationsEn,
    setDiagnosisEn,
    setRxItems,
    prescriptionRef,
    lastAddedItemIdRef,
    onTrackSmartPrescription,
    trackMedUsage,
    rxItems,
    buildRxInstructions,
    medications,
  });

  const manualItemActions = createManualItemActions({
    saveHistory,
    lastAddedItemIdRef,
    setRxItems,
    prescriptionRef,
  });

  const itemEditorActions = createItemEditors({
    saveHistory,
    setLabInvestigations,
    setGeneralAdvice,
    prescriptionRef,
    setRxItems,
    trackMedUsage,
    rxItems,
    weight,
    totalAgeInMonths,
    buildRxInstructions,
    medications,
    generalAdvice,
    labInvestigations,
  });

  return {
    ...historyActions,
    handleSaveRecord,
    ...readyPrescriptionActions,
    ...recordActions,
    ...smartRxActions,
    ...manualItemActions,
    ...itemEditorActions,
  };
};
