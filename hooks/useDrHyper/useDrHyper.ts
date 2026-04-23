
import { useMedications } from '../medications';
import { useAuth } from '../useAuth';
import { usageTrackingService } from '../../services/usageTrackingService';
import { consumeSmartPrescriptionQuota, consumeStorageQuota, getAccountTypeControls } from '../../services/accountTypeControlsService';
import {
    SMART_QUOTA_NOTICE_STORAGE_KEY,
    getCairoDayKey,
    sanitizeForFirestore,
    sanitizeRxItemsForSave,
    uniqTextList,
} from './useDrHyper.helpers';
import { deleteDoc } from 'firebase/firestore';
import { useDrHyperNotifications } from './useDrHyper.notifications';
import { useDrHyperViewAndUsage } from './useDrHyper.viewAndUsage';
import { resolveCurrentUserAccountType } from './useDrHyper.accountType';
import { useDrHyperPatientState } from './useDrHyper.patientState';
import {
    extractSmartQuotaErrorDetails,
    buildWhatsAppUrlFromNumber,
    getQuotaReachedMessage,
    applyLimitPlaceholder,
    sanitizeExternalHttpUrl,
} from './useDrHyper.quota';
import { useDrHyperRealtimeData } from './useDrHyper.realtime';
import { useDrHyperActions } from './useDrHyper.actions';
import { useDrHyperDraft } from './useDrHyper.draft';
import { getDoctorNotificationDocRef } from '../../services/firestore/profileRoles';
import { branchesService } from '../../services/firestore/branches';
export type { NotificationState } from './useDrHyper.types';

export const useDrHyper = (options?: { activeBranchId?: string }) => {
    const OFFLINE_SYNC_PENDING_KEY = 'dh_offline_sync_pending';

    const { user } = useAuth();
    // الفرع النشط: يُقرأ من localStorage مباشرة أو يُمرر من الخارج
    const activeBranchId = options?.activeBranchId
        ?? (user?.uid ? branchesService.getActiveBranchId(user.uid) : undefined);
    
    const { currentView, setCurrentView, usageStats, trackMedUsage } = useDrHyperViewAndUsage();
    const shouldPrioritizeMedicationsLoad =
        currentView === 'prescription' || currentView === 'drugtools' || currentView === 'medicationEdit';
    const medications = useMedications({ enabled: shouldPrioritizeMedicationsLoad }); // تحميل الكتالوج عند الحاجة أولاً مع preload مؤجل

    const patientState = useDrHyperPatientState();

    const {
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
        // حقول الهوية الجديدة: الجنس ثابت + الحمل/الرضاعه snapshot للزيارة
        gender,
        setGender,
        pregnant,
        setPregnant,
        breastfeeding,
        setBreastfeeding,
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
        activePatientFileId,
        setActivePatientFileId,
        activePatientFileNumber,
        setActivePatientFileNumber,
        activePatientFileNameKey,
        setActivePatientFileNameKey,
        bmi,
        updateVital,
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
        rxItems,
        generalAdvice,
        labInvestigations,
        historyStack,
        futureStack,
        analyzing,
        setAnalyzing,
        errorMsg,
        setErrorMsg,
        selectedMed,
        setSelectedMed,
        isDataOnlyMode,
        setIsDataOnlyMode,
        prescriptionRef,
        totalAgeInMonths,
    } = patientState;

    const notificationsState = useDrHyperNotifications({
        smartQuotaStorageKey: SMART_QUOTA_NOTICE_STORAGE_KEY,
        offlineSyncPendingKey: OFFLINE_SYNC_PENDING_KEY,
        getCairoDayKey,
        setErrorMsg,
        buildWhatsAppUrlFromNumber,
        sanitizeExternalHttpUrl,
        onDismissFirestore: (firestoreId) => {
            if (!user?.uid) return;
            deleteDoc(getDoctorNotificationDocRef(user.uid, firestoreId))
                .catch((err) => console.error('Failed to delete notification:', err));
        },
    });

    const {
        notifications,
        smartQuotaNotice,
        smartQuotaModalOpen,
        showNotification,
        dismissNotification,
        dismissSmartQuotaNotice,
    } = notificationsState;

    const realtimeData = useDrHyperRealtimeData({
        user,
        showNotification,
        activeBranchId,
    });
    const {
        records,
        readyPrescriptions,
        refreshRecords,
    } = realtimeData;

    const draftPersistence = useDrHyperDraft({
        userId: user?.uid,
        patientState,
        showNotification,
    });

    const {
        handleUndo,
        handleRedo,
        handleReset: handleResetRaw,
        handleSaveRecord: handleSaveRecordRaw,
        handleSaveReadyPrescription,
        handleRenameReadyPrescription,
        handleUpdateReadyPrescription,
        handleCreateReadyPrescription,
        handleDeleteReadyPrescription,
        handleApplyReadyPrescription,
        handleLoadRecord,
        handleLoadConsultation,
        handleDeleteRecord: handleDeleteRecordRaw,
        handleDeleteConsultation: handleDeleteConsultationRaw,
        handleDeleteExam: handleDeleteExamRaw,
        handleOpenConsultation,
        handleNewExamFromRecord,
        handleFullAutomatedRX,
        handleDeepAnalyzeWithPopup,
        handleQuickAddToRx,
        handleAddManualMedication,
        handleAddEmptyMedication,
        handleAddCustomItem,
        handleAddManualLab,
        handleAddManualAdvice,
        updateItemInstruction,
        selectMedicationForItem,
        updateItemName,
        removeItem,
        updateItemFontSize,
        handleSwapItem,
        updateAdvice,
        removeAdvice,
        updateLab,
        removeLab,
    } = useDrHyperActions({
        user,
        medications,
        patientState,
        notifications: notificationsState,
        realtimeData,
        setCurrentView,
        trackMedUsage,
        resolveCurrentUserAccountType: () => resolveCurrentUserAccountType(user?.uid),
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
        onTrackSmartPrescription: (complaintText) => {
            if (!user?.uid) return;
            usageTrackingService.trackEvent({
                doctorId: user.uid,
                eventType: 'smartPrescription',
                metadata: {
                    complaint: complaintText.substring(0, 100),
                },
            }).catch((err) => console.error('Failed to track case analysis:', err));
        },
        activeBranchId,
    });

    // أغلفة تربط حفظ/إعادة الضبط بنظام الـ draft: عند النجاح نضع بصمة محفوظة ونمسح الـ draft،
    // وعند إعادة الضبط نمسح الـ draft ونعيد تتبع التغييرات من الصفر.
    // كمان: بعد أي حفظ/حذف ناجح نعيد قراءة السجلات من الكاش المحلي (0 قراءات سيرفر)
    // لأن Firestore SDK يحدّث الكاش تلقائياً بعد الكتابة الناجحة.
    const handleSaveRecord: typeof handleSaveRecordRaw = async (e) => {
        const result = await handleSaveRecordRaw(e);
        if (result && result.ok) {
            draftPersistence.markDraftSaved();
            void refreshRecords();
        }
        return result;
    };

    const handleDeleteRecord: typeof handleDeleteRecordRaw = async (id) => {
        const result = await handleDeleteRecordRaw(id);
        void refreshRecords();
        return result;
    };

    const handleDeleteConsultation: typeof handleDeleteConsultationRaw = async (record) => {
        const result = await handleDeleteConsultationRaw(record);
        void refreshRecords();
        return result;
    };

    const handleDeleteExam: typeof handleDeleteExamRaw = async (record) => {
        const result = await handleDeleteExamRaw(record);
        void refreshRecords();
        return result;
    };

    const handleReset: typeof handleResetRaw = (e) => {
        handleResetRaw(e);
        draftPersistence.clearDraft();
    };

    const patientIdentityBindings = {
        patientName, setPatientName,
        phone, setPhone,
        ageYears, setAgeYears,
        ageMonths, setAgeMonths,
        ageDays, setAgeDays,
        // حقول الهوية الجديدة — الجنس ثابت، الحمل والرضاعه snapshot للزيارة
        gender, setGender,
        pregnant, setPregnant,
        breastfeeding, setBreastfeeding,
        weight, setWeight,
        height, setHeight,
        bmi,
        vitals, setVitals,
        updateVital,
    };

    const patientClinicalBindings = {
        complaint, setComplaint,
        medicalHistory, setMedicalHistory,
        examination, setExamination,
        investigations, setInvestigations,
        complaintEn, setComplaintEn,
        historyEn, setHistoryEn,
        examEn, setExamEn,
        investigationsEn, setInvestigationsEn,
        diagnosisEn, setDiagnosisEn,
    };

    const prescriptionBindings = {
        rxItems,
        generalAdvice,
        labInvestigations,
        // نمرّر الـ setters المباشرة لنستخدمهم من مودال تحليل الحالة (إضافة فحوصات/نصائح)
        setGeneralAdvice: patientState.setGeneralAdvice,
        setLabInvestigations: patientState.setLabInvestigations,
        historyStack,
        futureStack,
        analyzing,
        setAnalyzing,
        errorMsg,
        smartQuotaNotice,
        smartQuotaModalOpen,
        selectedMed, setSelectedMed,
        isDataOnlyMode, setIsDataOnlyMode,
        prescriptionRef,
        // state نافذة تحليل الحالة الغنية — نمرّرها للـ router عشان يوصّلها للمكون
        caseAnalysisOpen: patientState.caseAnalysisOpen,
        setCaseAnalysisOpen: patientState.setCaseAnalysisOpen,
        caseAnalysisResult: patientState.caseAnalysisResult,
        caseAnalysisLoading: patientState.caseAnalysisLoading,
        addedDiagnosesFromModal: patientState.addedDiagnosesFromModal,
        setAddedDiagnosesFromModal: patientState.setAddedDiagnosesFromModal,
        addedInvestigationsFromModal: patientState.addedInvestigationsFromModal,
        setAddedInvestigationsFromModal: patientState.setAddedInvestigationsFromModal,
        addedInstructionsFromModal: patientState.addedInstructionsFromModal,
        setAddedInstructionsFromModal: patientState.setAddedInstructionsFromModal,
        needsManualDxHint: patientState.needsManualDxHint,
    };

    const recordsAndUsageBindings = {
        records,
        totalAgeInMonths,
        usageStats,
        readyPrescriptions,
    };

    const actionBindings = {
        handleUndo, handleRedo, handleReset, handleSaveRecord,
        handleLoadRecord, handleLoadConsultation, handleOpenConsultation, handleNewExamFromRecord,
        handleDeleteRecord, handleDeleteConsultation, handleDeleteExam,
        handleSaveReadyPrescription, handleRenameReadyPrescription, handleUpdateReadyPrescription, handleCreateReadyPrescription, handleDeleteReadyPrescription, handleApplyReadyPrescription,
        handleFullAutomatedRX, handleDeepAnalyzeWithPopup, handleQuickAddToRx, handleAddManualMedication, handleAddEmptyMedication, handleAddCustomItem, handleAddManualLab, handleAddManualAdvice,
        removeItem, updateItemName, updateItemInstruction, updateItemFontSize, handleSwapItem, selectMedicationForItem,
        updateAdvice, removeAdvice, updateLab, removeLab,
    };

    const insuranceBindings = {
        paymentType: patientState.paymentType, setPaymentType: patientState.setPaymentType,
        insuranceCompanyId: patientState.insuranceCompanyId, setInsuranceCompanyId: patientState.setInsuranceCompanyId,
        insuranceCompanyName: patientState.insuranceCompanyName, setInsuranceCompanyName: patientState.setInsuranceCompanyName,
        insuranceApprovalCode: patientState.insuranceApprovalCode, setInsuranceApprovalCode: patientState.setInsuranceApprovalCode,
        insuranceMembershipId: patientState.insuranceMembershipId, setInsuranceMembershipId: patientState.setInsuranceMembershipId,
        patientSharePercent: patientState.patientSharePercent, setPatientSharePercent: patientState.setPatientSharePercent,
        discountAmount: patientState.discountAmount, setDiscountAmount: patientState.setDiscountAmount,
        discountPercent: patientState.discountPercent, setDiscountPercent: patientState.setDiscountPercent,
        discountReasonId: patientState.discountReasonId, setDiscountReasonId: patientState.setDiscountReasonId,
        discountReasonLabel: patientState.discountReasonLabel, setDiscountReasonLabel: patientState.setDiscountReasonLabel,
    };

    return {
        currentView, setCurrentView,
        notifications,
        ...patientIdentityBindings,
        ...patientClinicalBindings,
        ...prescriptionBindings,
        ...recordsAndUsageBindings,
        ...actionBindings,
        showNotification,
        dismissNotification,
        dismissSmartQuotaNotice,
        consultationDate, setConsultationDate,
        visitDate, setVisitDate,
        visitType, setVisitType,
        activePatientFileId, setActivePatientFileId,
        activePatientFileNumber, setActivePatientFileNumber,
        activePatientFileNameKey, setActivePatientFileNameKey,
        setIsPastConsultationMode: patientState.setIsPastConsultationMode,
        ...insuranceBindings,
        hasUnsavedChanges: draftPersistence.hasUnsavedChanges,
    };
};

