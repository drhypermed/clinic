/**
 * منطق حفظ/تحديث موعد من طرف السكرتارية (Submit Appointment Logic)
 *
 * `submitAppointment` هي الدالة الأساسية التي تُستدعى من `handleSubmit`
 * في hook `usePublicBookingAppointmentActions`. تقوم بـ:
 *   1. التحقق من المدخلات وإنشاء payload موحّد.
 *   2. استدعاء Cloud Function المناسبة (`createAppointmentBySecretary`
 *      أو `updateAppointmentBySecretary`) مع retry على الجلسة.
 *   3. دمج النتيجة في قائمة `todayAppointments` المحلية + مزامنتها مع
 *      `bookingConfig` (مرآة السكرتارية).
 *
 * تم فصلها عن الـ hook لتقليل حجمه. كل الـ state تُمرر كـ arguments.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../services/firebaseConfig';
import { firestoreService } from '../../../../services/firestore';
import { sanitizePublicText } from '../securityUtils';
import { sanitizeSecretaryVitalsInput } from '../../../../utils/secretaryVitals';
import type {
    AppointmentType,
    PatientGender,
    PaymentType,
    SecretaryVitalFieldDefinition,
    SecretaryVitalsInput,
    SecretaryVitalsVisibility,
} from '../../../../types';
import type { TodayAppointment } from '../types';
import { callWithSessionRetry } from './sessionHelpers';

/** تحقق هل تاريخ ISO يساوي نفس اليوم المحلي */
export const isSameLocalDay = (dateTime: string, dayStr: string, toLocalDateStr: (date: Date) => string): boolean => {
    const dt = new Date(dateTime);
    if (Number.isNaN(dt.getTime())) return false;
    return toLocalDateStr(dt) === dayStr;
};

/**
 * مزامنة قائمة مواعيد اليوم مع bookingConfig (best-effort).
 *
 * ⚠️ عزل الفروع: نكتب فقط على مفتاح فرع السكرتيرة
 * (`todayAppointmentsByBranch.${sessionBranchId}`) عبر dot-notation — حتى لا
 * ندهس مواعيد فروع أخرى في الحقل flat. الحقل flat `todayAppointments` يُترك
 * للطبيب يديره عبر `setBookingConfigTodayAppointmentsByBranch` اللي يجمع كل الفروع.
 */
export const syncTodayAppointmentsToBookingConfig = async (
    secret: string,
    list: TodayAppointment[],
    sessionBranchId?: string
): Promise<void> => {
    if (!secret) return;
    const normalizedBranch = (sessionBranchId || 'main').trim() || 'main';
    try {
        // نكتب بـ dot-notation: تحديث مفتاح فرع السكرتيرة فقط. `merge: true`
        // يحفظ مفاتيح الفروع الأخرى كما هي.
        await firestoreService.setBookingConfigTodayAppointmentsByBranch(secret, {
            [normalizedBranch]: list,
        });
    } catch (error) {
        console.error('[Secretary] Failed syncing today appointments to bookingConfig:', error);
    }
};

interface SubmitAppointmentInput {
    userId: string;
    secret: string;
    /** الفرع المرتبط بـ session السكرتارية — يُمرَّر للـ Cloud Function لفرض العزل */
    branchId?: string;
    resolveCurrentSessionToken: () => string | undefined;
    editingAppointment: TodayAppointment | null;
    name: string;
    ageVal: string;
    ph: string;
    reasonVal: string;
    dateTime: Date;
    sanitizedSecretaryVitals: SecretaryVitalsInput | undefined;
    resolvedAppointmentType: AppointmentType;
    consultationSourceAppointmentId?: string;
    consultationSourceCompletedAt?: string;
    consultationSourceRecordId?: string;
    paymentType: PaymentType;
    insuranceCompanyId: string;
    insuranceCompanyName: string;
    insuranceMembershipId: string;
    insuranceApprovalCode: string;
    patientSharePercent: number;
    discountAmount: number;
    discountPercent: number;
    normalizedDiscountReasonId: string;
    normalizedDiscountReasonLabel: string;
    // الحقول الجديدة: الجنس (ثابت) + الحمل والرضاعة (snapshot للموعد)
    gender?: PatientGender;
    pregnant?: boolean;
    breastfeeding?: boolean;
}

type AppointmentPayload = {
    patientName: string;
    age: string;
    phone: string;
    dateTime: string;
    visitReason: string;
    secretaryVitals?: SecretaryVitalsInput;
    appointmentType: AppointmentType;
    consultationSourceAppointmentId?: string;
    consultationSourceCompletedAt?: string;
    consultationSourceRecordId?: string;
    paymentType: PaymentType;
    insuranceCompanyId: string;
    insuranceCompanyName: string;
    insuranceMembershipId: string;
    insuranceApprovalCode: string;
    patientSharePercent: number;
    discountAmount: number;
    discountPercent: number;
    discountReasonId?: string;
    discountReasonLabel?: string;
    gender?: PatientGender;
    pregnant?: boolean;
    breastfeeding?: boolean;
};

/** استدعاء Cloud Function لإنشاء/تحديث موعد وإرجاع الـ appointmentId */
export const submitAppointment = async (input: SubmitAppointmentInput): Promise<string> => {
    const appointmentPayload: AppointmentPayload = {
        patientName: input.name,
        age: input.ageVal,
        phone: input.ph,
        dateTime: input.dateTime.toISOString(),
        visitReason: input.reasonVal,
        secretaryVitals: input.sanitizedSecretaryVitals,
        appointmentType: input.resolvedAppointmentType,
        consultationSourceAppointmentId: input.consultationSourceAppointmentId,
        consultationSourceCompletedAt: input.consultationSourceCompletedAt,
        consultationSourceRecordId: input.consultationSourceRecordId,
        paymentType: input.paymentType,
        insuranceCompanyId: input.insuranceCompanyId,
        insuranceCompanyName: input.insuranceCompanyName,
        insuranceMembershipId: input.insuranceMembershipId,
        insuranceApprovalCode: input.insuranceApprovalCode,
        patientSharePercent: input.patientSharePercent,
        discountAmount: input.discountAmount,
        discountPercent: input.discountPercent,
        discountReasonId: input.paymentType === 'discount' ? input.normalizedDiscountReasonId : '',
        discountReasonLabel: input.paymentType === 'discount' ? input.normalizedDiscountReasonLabel : '',
        gender: input.gender,
        pregnant: input.pregnant,
        breastfeeding: input.breastfeeding,
    };

    if (input.editingAppointment) {
        const updateBySecretaryFn = httpsCallable<{
            userId: string;
            appointmentId: string;
            secret: string;
            sessionToken?: string;
            branchId?: string;
            appointment: AppointmentPayload;
        }>(functions, 'updateAppointmentBySecretary');

        await callWithSessionRetry(
            (currentSessionToken) =>
                updateBySecretaryFn({
                    userId: input.userId,
                    appointmentId: input.editingAppointment!.id,
                    secret: input.secret,
                    sessionToken: currentSessionToken,
                    branchId: input.branchId,
                    appointment: appointmentPayload,
                }),
            input.resolveCurrentSessionToken
        );

        return input.editingAppointment.id;
    }

    const createBySecretaryFn = httpsCallable<{
        userId: string;
        secret: string;
        sessionToken?: string;
        branchId?: string;
        appointment: AppointmentPayload;
    }>(functions, 'createAppointmentBySecretary');

    const result = await callWithSessionRetry(
        (currentSessionToken) =>
            createBySecretaryFn({
                userId: input.userId,
                secret: input.secret,
                sessionToken: currentSessionToken,
                branchId: input.branchId,
                appointment: appointmentPayload,
            }),
        input.resolveCurrentSessionToken
    );

    return (result.data as { appointmentId?: string }).appointmentId || '';
};

interface BuildMergedAppointmentInput {
    savedAppointmentId: string;
    /** الفرع اللي الموعد مرتبط به (من session السكرتارية) */
    branchId?: string;
    name: string;
    ageVal: string;
    ph: string;
    reasonVal: string;
    sanitizedSecretaryVitals: SecretaryVitalsInput | undefined;
    dateTime: Date;
    editingAppointment: TodayAppointment | null;
    resolvedAppointmentType: AppointmentType;
    consultationSourceAppointmentId?: string;
    consultationSourceCompletedAt?: string;
    consultationSourceRecordId?: string;
    paymentType: PaymentType;
    insuranceCompanyId: string;
    insuranceCompanyName: string;
    insuranceMembershipId: string;
    insuranceApprovalCode: string;
    patientSharePercent: number;
    discountAmount: number;
    discountPercent: number;
    normalizedDiscountReasonId: string;
    normalizedDiscountReasonLabel: string;
    gender?: PatientGender;
    pregnant?: boolean;
    breastfeeding?: boolean;
}

/** بناء TodayAppointment من نتيجة الحفظ لضمه إلى قائمة اليوم محلياً */
export const buildMergedTodayAppointment = (
    input: BuildMergedAppointmentInput
): TodayAppointment => ({
    id: input.savedAppointmentId,
    patientName: input.name,
    age: input.ageVal || undefined,
    phone: input.ph || undefined,
    visitReason: input.reasonVal || undefined,
    secretaryVitals: input.sanitizedSecretaryVitals,
    dateTime: input.dateTime.toISOString(),
    source: input.editingAppointment?.source || 'secretary',
    appointmentType: input.resolvedAppointmentType,
    consultationSourceAppointmentId: input.consultationSourceAppointmentId,
    consultationSourceCompletedAt: input.consultationSourceCompletedAt,
    consultationSourceRecordId: input.consultationSourceRecordId,
    paymentType: input.paymentType,
    insuranceCompanyId: input.insuranceCompanyId,
    insuranceCompanyName: input.insuranceCompanyName,
    insuranceMembershipId: input.insuranceMembershipId,
    insuranceApprovalCode: input.insuranceApprovalCode,
    patientSharePercent: input.patientSharePercent,
    discountAmount: input.discountAmount,
    discountPercent: input.discountPercent,
    discountReasonId:
        input.paymentType === 'discount' ? String(input.normalizedDiscountReasonId || '').trim() || undefined : undefined,
    discountReasonLabel:
        input.paymentType === 'discount'
            ? sanitizePublicText(input.normalizedDiscountReasonLabel) || undefined
            : undefined,
    // الفرع: نستخدم الـ branchId الجديد، أو نحتفظ بـ branchId القديم من الـ editing appointment
    branchId: input.branchId || input.editingAppointment?.branchId || 'main',
    // الحقول الجديدة — تُعرض للطبيب في قائمة مواعيد اليوم وتصل معه للكشف
    gender: input.gender,
    pregnant: input.pregnant,
    breastfeeding: input.breastfeeding,
});

