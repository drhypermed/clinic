/**
 * useAppointmentSyncOnSave — مزامنة الموعد مع السجل بعد الحفظ
 *
 * يُستخرج هذا الـ hook من `MainApp` ليعالج مهمتين مترابطتين:
 *
 *   1. `syncOpenedAppointmentAfterRecordSave`
 *      عند حفظ سجل مريض أثناء فتح موعد قادم من لوحة المواعيد، يجب أن
 *      يُحدَّث مستند الموعد بحالة "اكتمل" + العلامات الحيوية + بيانات الدفع
 *      + بيانات ملف المريض. إن كان الموعد قادم من الحجز العام، يُعلَّم
 *      أيضاً كـ "تمت المتابعة".
 *
 *   2. `handleSaveRecordWithAppointmentSync`
 *      يغلف `handleSaveRecord` الأصلي ويستدعي المزامنة بعد نجاحه. إذا
 *      فشلت المزامنة، يُعرض toast خطأ لكن لا يُلغى الحفظ.
 *
 * الـ hook يأخذ جميع dependencies كـ object واحد لتسهيل الاستدعاء من
 * `MainApp` دون قائمة arguments طويلة.
 */

import React from 'react';
import { firestoreService } from '../../../services/firestore';
import type {
    ClinicAppointment,
    PaymentType,
    SecretaryVitalFieldDefinition,
    VitalSigns,
} from '../../../types';
import {
    sanitizeSecretaryVitalsInput,
    toSecretaryCustomFieldId,
} from '../../../utils/secretaryVitals';
import { buildAgeTextFromParts } from './helpers';

interface UseAppointmentSyncOnSaveArgs {
    userId: string;
    openedAppointmentContext: ClinicAppointment | null;
    setOpenedAppointmentContext: React.Dispatch<React.SetStateAction<ClinicAppointment | null>>;
    // Patient state
    patientName: string;
    phone: string;
    ageYears: string;
    ageMonths: string;
    ageDays: string;
    weight: string;
    height: string;
    vitals: VitalSigns;
    // Active patient file
    activePatientFileId: string | null;
    activePatientFileNumber: number | null;
    activePatientFileNameKey: string | null;
    // Payment + insurance
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
    // Secretary custom boxes
    appointmentSecretaryCustomValues: Record<string, string>;
    prescriptionSecretaryFieldDefinitions: SecretaryVitalFieldDefinition[];
    // Save handler
    handleSaveRecord: (e?: React.MouseEvent<any>) => Promise<{ ok: boolean } | undefined | void> | any;
    showNotification: (msg: string, type?: 'success' | 'error' | 'info', opts?: any) => void;
}

export const useAppointmentSyncOnSave = (args: UseAppointmentSyncOnSaveArgs) => {
    const {
        userId,
        openedAppointmentContext,
        setOpenedAppointmentContext,
        patientName,
        phone,
        ageYears,
        ageMonths,
        ageDays,
        weight,
        height,
        vitals,
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
        appointmentSecretaryCustomValues,
        prescriptionSecretaryFieldDefinitions,
        handleSaveRecord,
        showNotification,
    } = args;

    const syncOpenedAppointmentAfterRecordSave = React.useCallback(async () => {
        if (!userId || !openedAppointmentContext) return;

        const completedAt = new Date().toISOString();
        const normalizedPaymentType = paymentType || 'cash';
        const normalizedPatientName = String(patientName || '').trim() || openedAppointmentContext.patientName;
        const normalizedPhone = String(phone || '').trim() || openedAppointmentContext.phone;
        const normalizedAge =
            buildAgeTextFromParts(ageYears, ageMonths, ageDays)
            || String(openedAppointmentContext.age || '').trim()
            || undefined;

        const secretaryVitalsPayload: Record<string, string | undefined> = {
            weight: String(weight || '').trim() || undefined,
            height: String(height || '').trim() || undefined,
            bp: String(vitals.bp || '').trim() || undefined,
            pulse: String(vitals.pulse || '').trim() || undefined,
            temp: String(vitals.temp || '').trim() || undefined,
            rbs: String(vitals.rbs || '').trim() || undefined,
            spo2: String(vitals.spo2 || '').trim() || undefined,
            rr: String(vitals.rr || '').trim() || undefined,
        };

        Object.entries(appointmentSecretaryCustomValues).forEach(([boxId, rawValue]) => {
            const normalizedBoxId = String(boxId || '').trim();
            const normalizedValue = String(rawValue || '').trim();
            if (!normalizedBoxId || !normalizedValue) return;
            const fieldId = toSecretaryCustomFieldId(normalizedBoxId);
            if (!fieldId) return;
            secretaryVitalsPayload[fieldId] = normalizedValue;
        });

        const sanitizedVitals = sanitizeSecretaryVitalsInput(secretaryVitalsPayload, {
            fieldDefinitions: prescriptionSecretaryFieldDefinitions,
        });

        const normalizedDiscountAmount = Number.isFinite(discountAmount) ? Math.max(0, discountAmount) : 0;
        const normalizedDiscountPercent = Number.isFinite(discountPercent)
            ? Math.max(0, Math.min(100, discountPercent))
            : 0;

        const updatedAppointment: ClinicAppointment = {
            ...openedAppointmentContext,
            patientName: normalizedPatientName,
            phone: normalizedPhone,
            age: normalizedAge,
            examCompletedAt: completedAt,
            secretaryVitals: sanitizedVitals,
            ...(activePatientFileId ? { patientFileId: activePatientFileId } : {}),
            ...(Number.isFinite(Number(activePatientFileNumber)) && Number(activePatientFileNumber) > 0
                ? { patientFileNumber: Math.floor(Number(activePatientFileNumber)) }
                : {}),
            ...(String(activePatientFileNameKey || '').trim() ? { patientFileNameKey: String(activePatientFileNameKey).trim() } : {}),
            paymentType: normalizedPaymentType,
            insuranceCompanyId: normalizedPaymentType === 'insurance' ? (insuranceCompanyId || undefined) : undefined,
            insuranceCompanyName: normalizedPaymentType === 'insurance' ? (insuranceCompanyName || undefined) : undefined,
            insuranceApprovalCode: normalizedPaymentType === 'insurance' ? (insuranceApprovalCode || undefined) : undefined,
            insuranceMembershipId: normalizedPaymentType === 'insurance' ? (insuranceMembershipId || undefined) : undefined,
            patientSharePercent: normalizedPaymentType === 'insurance' ? patientSharePercent : undefined,
            discountAmount: normalizedPaymentType === 'discount' ? normalizedDiscountAmount : undefined,
            discountPercent: normalizedPaymentType === 'discount' ? normalizedDiscountPercent : undefined,
            discountReasonId: normalizedPaymentType === 'discount' ? (discountReasonId || undefined) : undefined,
            discountReasonLabel: normalizedPaymentType === 'discount' ? (discountReasonLabel || undefined) : undefined,
        };

        await firestoreService.saveAppointment(userId, updatedAppointment);

        if (openedAppointmentContext.source === 'public' && openedAppointmentContext.publicUserId) {
            await firestoreService.markPublicUserBookingCompleted(
                openedAppointmentContext.publicUserId,
                openedAppointmentContext.id,
                completedAt
            );
        }

        setOpenedAppointmentContext(null);
    }, [
        userId,
        openedAppointmentContext,
        paymentType,
        patientName,
        phone,
        ageYears,
        ageMonths,
        ageDays,
        weight,
        height,
        vitals,
        activePatientFileId,
        activePatientFileNumber,
        activePatientFileNameKey,
        insuranceCompanyId,
        insuranceCompanyName,
        insuranceApprovalCode,
        insuranceMembershipId,
        patientSharePercent,
        discountAmount,
        discountPercent,
        discountReasonId,
        discountReasonLabel,
        appointmentSecretaryCustomValues,
        prescriptionSecretaryFieldDefinitions,
        setOpenedAppointmentContext,
    ]);

    const handleSaveRecordWithAppointmentSync = React.useCallback(async (e?: React.MouseEvent<any>) => {
        const saveResult = await handleSaveRecord(e);
        if (!saveResult?.ok || !openedAppointmentContext) return;

        try {
            await syncOpenedAppointmentAfterRecordSave();
        } catch (error) {
            console.error('Record saved but appointment sync failed:', error);
            showNotification('تم حفظ السجل لكن تعذر مزامنة بيانات الموعد المنفذ.', 'error', { id: 'appointment-sync-after-save' });
        }
    }, [handleSaveRecord, openedAppointmentContext, showNotification, syncOpenedAppointmentAfterRecordSave]);

    return {
        syncOpenedAppointmentAfterRecordSave,
        handleSaveRecordWithAppointmentSync,
    };
};
