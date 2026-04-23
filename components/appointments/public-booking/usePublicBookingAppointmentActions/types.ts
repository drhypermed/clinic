/**
 * أنواع hook إجراءات مواعيد السكرتارية (Public Booking Appointment Actions Types)
 *
 * يحتوي على:
 *   1. `EntryRequestAppointment` : شكل بيانات طلب دخول مريض على الطبيب.
 *   2. `UsePublicBookingAppointmentActionsParams` : كل الـ props المطلوبة
 *      للـ hook (state + setters + meta).
 */

import type { BookingQuotaNotice } from '../../public-booking-form/types';
import type { RecentExamPatientOption } from '../../add-appointment-form/types';
import type { TodayAppointment } from '../types';
import type { Dispatch, SetStateAction } from 'react';
import type {
    AppointmentType,
    PatientGender,
    PaymentType,
    SecretaryVitalFieldDefinition,
    SecretaryVitalsInput,
    SecretaryVitalsVisibility,
} from '../../../../types';

/** شكل بيانات الموعد المطلوب الدخول إليه من السكرتارية */
export type EntryRequestAppointment = {
    id: string;
    patientName: string;
    age?: string;
    visitReason?: string;
    appointmentType?: 'exam' | 'consultation';
    consultationSourceAppointmentId?: string;
    consultationSourceCompletedAt?: string;
    consultationSourceRecordId?: string;
};

/** كل الـ props التي يحتاجها hook الإجراءات */
export type UsePublicBookingAppointmentActionsParams = {
    secret: string; // الكود السري الخاص بالفورم
    userId: string; // معرف الطبيب
    getSessionToken?: () => string | undefined;
    /** الفرع المرتبط بـ session السكرتارية الحالية */
    sessionBranchId?: string;
    onSessionInvalid?: (message?: string) => void;
    success: boolean;
    patientName: string;
    age: string;
    phone: string;
    gender: PatientGender | '';
    pregnant: boolean | null;
    breastfeeding: boolean | null;
    dateStr: string;
    timeStr: string;
    visitReason: string;
    secretaryVitals: SecretaryVitalsInput;
    secretaryVitalFields: SecretaryVitalFieldDefinition[];
    secretaryVitalsVisibility: SecretaryVitalsVisibility;
    appointmentType: AppointmentType;
    selectedConsultationCandidateId: string;
    editingAppointmentId: string | null;
    todayAppointments: TodayAppointment[];
    recentExamPatients: RecentExamPatientOption[];
    paymentType: PaymentType;
    insuranceCompanyId: string;
    insuranceCompanyName: string;
    insuranceMembershipId: string;
    insuranceApprovalCode: string;
    patientSharePercent: number;
    discountAmount: number;
    discountPercent: number;
    discountReasonId: string;
    discountReasonLabel: string;
    setPaymentType: Dispatch<SetStateAction<PaymentType>>;
    setInsuranceCompanyId: Dispatch<SetStateAction<string>>;
    setInsuranceCompanyName: Dispatch<SetStateAction<string>>;
    setInsuranceMembershipId: Dispatch<SetStateAction<string>>;
    setInsuranceApprovalCode: Dispatch<SetStateAction<string>>;
    setPatientSharePercent: Dispatch<SetStateAction<number>>;
    setDiscountAmount: Dispatch<SetStateAction<number>>;
    setDiscountPercent: Dispatch<SetStateAction<number>>;
    setDiscountReasonId: Dispatch<SetStateAction<string>>;
    setDiscountReasonLabel: Dispatch<SetStateAction<string>>;
    setPendingEntryAppointmentId: Dispatch<SetStateAction<string | null>>;
    setBookingQuotaNotice: Dispatch<SetStateAction<BookingQuotaNotice | null>>;
    setFormError: Dispatch<SetStateAction<string | null>>;
    setEditingAppointmentId: Dispatch<SetStateAction<string | null>>;
    setPatientName: Dispatch<SetStateAction<string>>;
    setAge: Dispatch<SetStateAction<string>>;
    setPhone: Dispatch<SetStateAction<string>>;
    setGender: Dispatch<SetStateAction<PatientGender | ''>>;
    setPregnant: Dispatch<SetStateAction<boolean | null>>;
    setBreastfeeding: Dispatch<SetStateAction<boolean | null>>;
    setDateStr: Dispatch<SetStateAction<string>>;
    setTimeStr: Dispatch<SetStateAction<string>>;
    setVisitReason: Dispatch<SetStateAction<string>>;
    setSecretaryVitals: Dispatch<SetStateAction<SecretaryVitalsInput>>;
    setAppointmentType: Dispatch<SetStateAction<AppointmentType>>;
    setSelectedConsultationCandidateId: Dispatch<SetStateAction<string>>;
    setSuccess: Dispatch<SetStateAction<boolean>>;
    setSubmitting: Dispatch<SetStateAction<boolean>>;
    setBookingFormOpen: Dispatch<SetStateAction<boolean>>;
    setTodayAppointments: Dispatch<SetStateAction<TodayAppointment[]>>;
};
