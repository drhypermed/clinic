
import React from 'react';
import { collection, deleteDoc, deleteField, doc, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { getDocsCacheFirst } from '../../services/firestore/cacheFirst';
import { PatientRecord, PaymentType, PrescriptionItem } from '../../types';
import {
    EMPTY_VITALS,
    applyClinicalPayloadToState,
    applyPatientDemographicsFromRecord,
    applyRecordPhysicalFromRecord,
    buildClinicalPayloadFromConsultation,
    buildClinicalPayloadFromRecord,
    getVisitDateDay,
} from './useDrHyper.recordHelpers';
import {
    CONSULTATION_RECORD_PREFIX,
    buildConsultationDataFromRecord,
    buildConsultationRecordId,
    buildGeneratedConsultationRecordId,
    buildSeparatedConsultationRecordPayload,
} from './useDrHyper.consultationRecords';

interface CreateRecordActionsParams {
    user: any;
    db: any;
    showNotification: (
        message: string,
        type?: 'success' | 'error' | 'info',
        options?: React.MouseEvent<any> | { event?: React.MouseEvent<any>; id?: string; firestoreId?: string }
    ) => void;
    setPatientName: React.Dispatch<React.SetStateAction<string>>;
    setPhone: React.Dispatch<React.SetStateAction<string>>;
    setAgeYears: React.Dispatch<React.SetStateAction<string>>;
    setAgeMonths: React.Dispatch<React.SetStateAction<string>>;
    setAgeDays: React.Dispatch<React.SetStateAction<string>>;
    setWeight: React.Dispatch<React.SetStateAction<string>>;
    setHeight: React.Dispatch<React.SetStateAction<string>>;
    setVitals: React.Dispatch<React.SetStateAction<{ bp: string; pulse: string; temp: string; rbs: string; spo2: string; rr: string }>>;
    setComplaintEn: React.Dispatch<React.SetStateAction<string>>;
    setHistoryEn: React.Dispatch<React.SetStateAction<string>>;
    setExamEn: React.Dispatch<React.SetStateAction<string>>;
    setInvestigationsEn: React.Dispatch<React.SetStateAction<string>>;
    setDiagnosisEn: React.Dispatch<React.SetStateAction<string>>;
    setComplaint: React.Dispatch<React.SetStateAction<string>>;
    setMedicalHistory: React.Dispatch<React.SetStateAction<string>>;
    setExamination: React.Dispatch<React.SetStateAction<string>>;
    setInvestigations: React.Dispatch<React.SetStateAction<string>>;
    setRxItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
    setGeneralAdvice: React.Dispatch<React.SetStateAction<string[]>>;
    setLabInvestigations: React.Dispatch<React.SetStateAction<string[]>>;
    setCurrentView: React.Dispatch<React.SetStateAction<'home' | 'prescription' | 'records' | 'patientFiles' | 'appointments' | 'financialReports' | 'drugtools' | 'medicationEdit' | 'settings' | 'advertisement'>>;
    setHistoryStack: React.Dispatch<React.SetStateAction<any[]>>;
    setFutureStack: React.Dispatch<React.SetStateAction<any[]>>;
    setLastSavedHash: React.Dispatch<React.SetStateAction<string>>;
    setActiveRecordId: React.Dispatch<React.SetStateAction<string | null>>;
    setIsConsultationMode: React.Dispatch<React.SetStateAction<boolean>>;
    setConsultationDate: React.Dispatch<React.SetStateAction<string | null>>;
    setConsultationSourceRecordId: React.Dispatch<React.SetStateAction<string | null>>;
    setVisitDate: React.Dispatch<React.SetStateAction<string>>;
    setVisitType: React.Dispatch<React.SetStateAction<'exam' | 'consultation'>>;
    setActiveVisitDateTime: React.Dispatch<React.SetStateAction<string | null>>;
    setActivePatientFileId: React.Dispatch<React.SetStateAction<string | null>>;
    setActivePatientFileNumber: React.Dispatch<React.SetStateAction<number | null>>;
    setActivePatientFileNameKey: React.Dispatch<React.SetStateAction<string | null>>;
    setPaymentType: React.Dispatch<React.SetStateAction<PaymentType>>;
    setInsuranceCompanyId: React.Dispatch<React.SetStateAction<string>>;
    setInsuranceCompanyName: React.Dispatch<React.SetStateAction<string>>;
    setInsuranceApprovalCode: React.Dispatch<React.SetStateAction<string>>;
    setInsuranceMembershipId: React.Dispatch<React.SetStateAction<string>>;
    setPatientSharePercent: React.Dispatch<React.SetStateAction<number>>;
    setDiscountAmount: React.Dispatch<React.SetStateAction<number>>;
    setDiscountPercent: React.Dispatch<React.SetStateAction<number>>;
    setDiscountReasonId: React.Dispatch<React.SetStateAction<string>>;
    setDiscountReasonLabel: React.Dispatch<React.SetStateAction<string>>;
    handleReset: (e?: React.MouseEvent<any>) => void;
}

export const createRecordActions = ({
    user,
    db,
    showNotification,
    setPatientName,
    setPhone,
    setAgeYears,
    setAgeMonths,
    setAgeDays,
    setWeight,
    setHeight,
    setVitals,
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
    setLastSavedHash,
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
    setCurrentView,
    setHistoryStack,
    setFutureStack,
}: CreateRecordActionsParams) => {
    const applyDemographics = (record: PatientRecord) => {
        applyPatientDemographicsFromRecord(record, {
            setPatientName,
            setPhone,
            setAgeYears,
            setAgeMonths,
            setAgeDays,
        });
    };

    const applyPhysical = (record: PatientRecord) => {
        applyRecordPhysicalFromRecord(record, {
            setWeight,
            setHeight,
            setVitals,
        });
    };

    const applyClinicalState = (payload: ReturnType<typeof buildClinicalPayloadFromRecord>) => {
        applyClinicalPayloadToState(payload, {
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
        });
    };

    const applyPatientFileIdentity = (record: PatientRecord) => {
        const fileId = String(record.patientFileId || '').trim();
        const fileNameKey = String(record.patientFileNameKey || '').trim();
        const parsedFileNumber = Number(record.patientFileNumber);
        const fileNumber = Number.isFinite(parsedFileNumber) && parsedFileNumber > 0
            ? Math.floor(parsedFileNumber)
            : null;

        setActivePatientFileId(fileId || null);
        setActivePatientFileNameKey(fileNameKey || null);
        setActivePatientFileNumber(fileNumber);
    };

    const applyPaymentFromRecord = (record: PatientRecord) => {
        setPaymentType(record.paymentType || 'cash');
        setInsuranceCompanyId(record.insuranceCompanyId || '');
        setInsuranceCompanyName(record.insuranceCompanyName || '');
        setInsuranceApprovalCode(record.insuranceApprovalCode || '');
        setInsuranceMembershipId(record.insuranceMembershipId || '');
        setPatientSharePercent(record.patientSharePercent ?? 0);
        setDiscountAmount(Number(record.discountAmount || 0) || 0);
        setDiscountPercent(Number(record.discountPercent || 0) || 0);
        setDiscountReasonId(String(record.discountReasonId || '').trim());
        setDiscountReasonLabel(String(record.discountReasonLabel || '').trim());
    };

    const prepareLoadedPrescription = ({
        hashSource,
        recordId,
        isConsultation,
        consultationDate,
        consultationSourceRecordId,
        visitIsoDate,
        visitType,
    }: {
        hashSource: unknown;
        recordId: string;
        isConsultation: boolean;
        consultationDate: string | null;
        consultationSourceRecordId: string | null;
        visitIsoDate?: string | null;
        visitType: 'exam' | 'consultation';
    }) => {
        setCurrentView('prescription');
        setHistoryStack([]);
        setFutureStack([]);
        setLastSavedHash(JSON.stringify(hashSource));
        setActiveRecordId(recordId);
        setIsConsultationMode(isConsultation);
        setConsultationDate(consultationDate);
        setConsultationSourceRecordId(consultationSourceRecordId);
        setVisitDate(getVisitDateDay(visitIsoDate));
        setVisitType(visitType);
        setActiveVisitDateTime(visitIsoDate || null);
    };

    const handleLoadRecord = (rec: PatientRecord) => {
        applyDemographics(rec);
        applyPhysical(rec);
        applyClinicalState(buildClinicalPayloadFromRecord(rec));
        applyPatientFileIdentity(rec);
        applyPaymentFromRecord(rec);
        
        prepareLoadedPrescription({
            hashSource: { ...rec, id: undefined, date: undefined },
            recordId: rec.id,
            isConsultation: false,
            consultationDate: rec.date,
            consultationSourceRecordId: null,
            visitIsoDate: rec.date,
            visitType: 'exam',
        });
        showNotification('تم تحميل السجل', 'info');
    };

    const handleLoadConsultation = (rec: PatientRecord) => {
        const consultationData = rec.isConsultationOnly
            ? buildConsultationDataFromRecord(rec)
            : rec.consultation;

        if (!consultationData) {
            showNotification('لا يوجد استشارة محفوظة داخل هذا السجل', 'error');
            return;
        }
        applyDemographics(rec);
        applyPhysical(rec);
        applyClinicalState(buildClinicalPayloadFromConsultation(consultationData));
        applyPatientFileIdentity(rec);
        applyPaymentFromRecord(rec);
        
        prepareLoadedPrescription({
            hashSource: consultationData,
            recordId: rec.isConsultationOnly ? rec.id : (rec.consultationRecordId || buildConsultationRecordId(rec.id)),
            isConsultation: true,
            consultationDate: consultationData.date,
            consultationSourceRecordId: rec.isConsultationOnly ? (rec.sourceExamRecordId || null) : rec.id,
            visitIsoDate: consultationData.date,
            visitType: 'consultation',
        });
        showNotification('تم تحميل الاستشارة', 'info');
    };

    const handleDeleteRecord = async (id: string) => {
        if (!user || user.isAnonymous) {
            showNotification('يجب تسجيل الدخول أولاً', 'error');
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'records', id));
            if (!id.startsWith(CONSULTATION_RECORD_PREFIX)) {
                const recordsCollectionRef = collection(db, 'users', user.uid, 'records');
                const linkedConsultationsSnap = await getDocsCacheFirst(
                    query(recordsCollectionRef, where('sourceExamRecordId', '==', id))
                );
                const deleteLinkedPromises = linkedConsultationsSnap.docs.map((docSnap) =>
                    deleteDoc(doc(db, 'users', user.uid, 'records', docSnap.id))
                );

                const legacyConsultationRecordId = buildConsultationRecordId(id);
                deleteLinkedPromises.push(
                    deleteDoc(doc(db, 'users', user.uid, 'records', legacyConsultationRecordId)).catch(() => undefined)
                );

                await Promise.all(deleteLinkedPromises);
            }
            showNotification('تم حذف السجل بنجاح', 'info');
        } catch (error: any) {
            console.error('Error deleting record:', error);
            showNotification('حدث خطأ أثناء الحذف', 'error');
        }
    };

    const handleDeleteConsultation = async (record: PatientRecord) => {
        if (!user || user.isAnonymous) {
            showNotification('يجب تسجيل الدخول أولاً', 'error');
            return;
        }

        let consultationRecordId = record.isConsultationOnly ? record.id : (record.consultationRecordId || undefined);

        if (!consultationRecordId && !record.isConsultationOnly) {
            const linkedConsultationsSnap = await getDocsCacheFirst(
                query(collection(db, 'users', user.uid, 'records'), where('sourceExamRecordId', '==', record.id))
            );

            const linkedConsultations = linkedConsultationsSnap.docs
                .map((docSnap) => ({
                    id: docSnap.id,
                    date: String((docSnap.data() as { date?: unknown }).date || ''),
                }))
                .sort((left, right) => {
                    const leftMs = Date.parse(left.date);
                    const rightMs = Date.parse(right.date);
                    if (!Number.isFinite(leftMs) && !Number.isFinite(rightMs)) return 0;
                    if (!Number.isFinite(leftMs)) return 1;
                    if (!Number.isFinite(rightMs)) return -1;
                    return rightMs - leftMs;
                });

            consultationRecordId = linkedConsultations[0]?.id;
        }

        if (!consultationRecordId && !record.consultation) {
            showNotification('لا توجد استشارة محفوظة لحذفها', 'error');
            return;
        }

        if (!consultationRecordId && record.consultation && !record.isConsultationOnly) {
            consultationRecordId = buildConsultationRecordId(record.id);
        }

        try {
            if (consultationRecordId) {
                await deleteDoc(doc(db, 'users', user.uid, 'records', consultationRecordId));
                // تنظيف مراجع الاستشارة من سجل الكشف الأصلي إن وُجد
                const sourceExamId = record.isConsultationOnly ? record.sourceExamRecordId : record.id;
                if (sourceExamId && !record.isConsultationOnly) {
                    const examRef = doc(db, 'users', user.uid, 'records', sourceExamId);
                    await updateDoc(examRef, {
                        consultationRecordId: deleteField(),
                        consultation: deleteField(),
                        updatedAt: serverTimestamp(),
                    }).catch(() => { /* best-effort cleanup */ });
                }
                showNotification('تم حذف الاستشارة بحذف السجل بنجاح', 'info');
            } else {
                const recordRef = doc(db, 'users', user.uid, 'records', record.id);
                await updateDoc(recordRef, {
                    consultation: deleteField(),
                    updatedAt: serverTimestamp(),
                });
                showNotification('تم حذف الاستشارة بنجاح', 'info');
            }
        } catch (error: any) {
            console.error('Error deleting consultation:', error);
            showNotification('حدث خطأ أثناء حذف الاستشارة', 'error');
        }
    };

    const handleDeleteExam = async (record: PatientRecord) => {
        if (!user || user.isAnonymous) {
            showNotification('يجب تسجيل الدخول أولاً', 'error');
            return;
        }

        if (record.isConsultationOnly) {
            showNotification('لا يوجد كشف محفوظ لحذفه', 'error');
            return;
        }

        try {
            const recordRef = doc(db, 'users', user.uid, 'records', record.id);
            const recordsCollectionRef = collection(db, 'users', user.uid, 'records');

            if (!record.consultation) {
                await deleteDoc(recordRef);
                showNotification('تم حذف الكشف بحذف السجل بنجاح', 'info');
                return;
            }

            const linkedConsultationsSnap = await getDocsCacheFirst(
                query(recordsCollectionRef, where('sourceExamRecordId', '==', record.id))
            );

            if (!linkedConsultationsSnap.empty) {
                await Promise.all(
                    linkedConsultationsSnap.docs.map((docSnap) =>
                        updateDoc(doc(db, 'users', user.uid, 'records', docSnap.id), {
                            sourceExamRecordId: deleteField(),
                            sourceExamDate: deleteField(),
                            updatedAt: serverTimestamp(),
                        })
                    )
                );
            } else {
                const consultationRecordId = record.consultationRecordId
                    || buildGeneratedConsultationRecordId(record.id, record.consultation.date);
                const consultationPayload = buildSeparatedConsultationRecordPayload({
                    baseRecord: record,
                    consultation: record.consultation,
                });
                await setDoc(doc(db, 'users', user.uid, 'records', consultationRecordId), {
                    ...consultationPayload,
                    updatedAt: serverTimestamp(),
                    createdAt: record.consultation.date || record.date || serverTimestamp(),
                }, { merge: true });
            }

            await deleteDoc(recordRef);
            showNotification('تم حذف الكشف والاحتفاظ بالاستشارة', 'info');
        } catch (error: any) {
            console.error('Error deleting exam:', error);
            showNotification('حدث خطأ أثناء حذف الكشف', 'error');
        }
    };

    const handleOpenConsultation = (record: PatientRecord) => {
        handleReset();

        setActiveRecordId(record.id);
        setIsConsultationMode(true);
        setConsultationSourceRecordId(record.isConsultationOnly ? (record.sourceExamRecordId || null) : record.id);
        setVisitType('consultation');
        setActiveVisitDateTime(null);
        applyPatientFileIdentity(record);

        applyDemographics(record);
        setWeight(record.weight);
        setHeight(record.height || '');
        setVitals(EMPTY_VITALS);
        setVisitDate(getVisitDateDay());
        applyPaymentFromRecord(record);

        showNotification('تم فتح الاستشارة لهذا المريض', 'success');
    };

    const handleNewExamFromRecord = (record: PatientRecord) => {
        handleReset();
        applyDemographics(record);
        setVisitType('exam');
        applyPatientFileIdentity(record);
        applyPaymentFromRecord(record);
        showNotification('تم بدء كشف جديد لنفس المريض', 'success');
    };
    return {
        handleLoadRecord,
        handleLoadConsultation,
        handleDeleteRecord,
        handleDeleteConsultation,
        handleDeleteExam,
        handleOpenConsultation,
        handleNewExamFromRecord,
    };
};

