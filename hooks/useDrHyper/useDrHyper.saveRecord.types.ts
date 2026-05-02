/**
 * أنواع دالة حفظ السجل (Save Record Action Types)
 *
 * يحتوي على:
 *   1. `CreateSaveRecordActionParams` — كل الـ state + setters المطلوبة
 *      لبناء `handleSaveRecord`.
 *   2. `SaveRecordResult` — نتيجة الحفظ (ok + reason + recordId).
 */

import type React from 'react';
import type { PatientGender, PatientRecord, PaymentType, PrescriptionItem, VitalSigns } from '../../types';

export interface CreateSaveRecordActionParams {
    user: { uid: string } | null | undefined;
    patientName: string;
    phone: string;
    ageYears: string;
    ageMonths: string;
    ageDays: string;
    // حقول الهوية الجديدة: الجنس ثابت للمريض، والحمل والرضاعة snapshot للزيارة
    gender: PatientGender | '';
    pregnant: boolean | null;
    // عمر الحمل بالأسابيع — يُحفظ في الـrecord لو الطبيب أدخله
    gestationalAgeWeeks: number | null;
    breastfeeding: boolean | null;
    weight: string;
    height: string;
    bmi: string;
    vitals: VitalSigns;
    complaintEn: string;
    historyEn: string;
    examEn: string;
    investigationsEn: string;
    diagnosisEn: string;
    rxItems: PrescriptionItem[];
    generalAdvice: string[];
    labInvestigations: string[];
    complaint: string;
    medicalHistory: string;
    examination: string;
    investigations: string;
    visitDate: string;
    visitType: 'exam' | 'consultation';
    activeVisitDateTime: string | null;
    lastSavedHash: string;
    activeRecordId: string | null;
    isConsultationMode: boolean;
    consultationSourceRecordId: string | null;
    activePatientFileId: string | null;
    activePatientFileNumber: number | null;
    activePatientFileNameKey: string | null;
    setActiveRecordId: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveVisitDateTime: React.Dispatch<React.SetStateAction<string | null>>;
    setActivePatientFileId: React.Dispatch<React.SetStateAction<string | null>>;
    setActivePatientFileNumber: React.Dispatch<React.SetStateAction<number | null>>;
    setActivePatientFileNameKey: React.Dispatch<React.SetStateAction<string | null>>;
    setIsConsultationMode: React.Dispatch<React.SetStateAction<boolean>>;
    setConsultationSourceRecordId: React.Dispatch<React.SetStateAction<string | null>>;
    setIsPastConsultationMode: React.Dispatch<React.SetStateAction<boolean>>;
    setLastSavedHash: React.Dispatch<React.SetStateAction<string>>;
    sanitizeRxItemsForSave: (items: PrescriptionItem[]) => PrescriptionItem[];
    sanitizeForFirestore: (value: unknown) => unknown;
    // ─ saveRecord مالوش حاجة بكوتا التخزين بعد 2026-04 (السجلات بقت "حد كلي")
    //   لكن سيبنا الـprops هنا كـoptional لو فلو تاني محتاجها — TODO clean up later
    openQuotaNoticeModal: (payload: {
        message: string;
        whatsappNumber?: string;
        whatsappUrl?: string;
        dayKey?: string;
        persist?: boolean;
    }) => void;
    showNotification: (
        message: string,
        type?: 'success' | 'error' | 'info',
        options?: React.MouseEvent<any> | { event?: React.MouseEvent<any>; id?: string; firestoreId?: string }
    ) => void;
    markOfflineSyncPendingIfNeeded: () => boolean;
    paymentType: PaymentType;
    insuranceCompanyId: string;
    insuranceCompanyName: string;
    insuranceApprovalCode: string;
    insuranceMembershipId: string;
    patientSharePercent: number;
    discountAmount: number;
    discountPercent: number;
    discountReasonId: string;
    discountReasonLabel: string;
    /** معرّف الفرع النشط لحفظه مع السجل */
    activeBranchId?: string;
    /** السجلات المحمّلة — تُستخدم لربط الاستشارة بكشفها الأصلي وتحديد sourceExamDate */
    records: PatientRecord[];
}

export interface SaveRecordResult {
    ok: boolean;
    recordId?: string;
    reason?: 'validation' | 'auth' | 'quota' | 'no-changes' | 'error';
}

export interface ResolvedPatientFileReference {
    patientFileId: string;
    patientFileNumber: number;
    patientFileNameKey: string;
}
