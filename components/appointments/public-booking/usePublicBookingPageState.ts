/**
 * الملف: usePublicBookingPageState.ts (Hook)
 * الوصف: "مستودع الحالة المركزي". 
 * هذا الملف هو العقل المدبر لبيانات الصفحة، حيث يجمع كافة متغيرات الحالة في مكان واحد: 
 * - بيانات الفورم (الاسم، الهاتف، التاريخ، الخ). 
 * - قوائم المواعيد (Today Appointments) وقوائم المرضى السابقين. 
 * - حالات التحميل (Loading) والرسائل المنبثقة (Toasts). 
 * - مراجع التتبع (Refs) لمنع التكرار وضمان استقرار المزامنة اللحظية. 
 * - العمليات المحسوبة (Computed Values) مثل ترتيب المواعيد زمنياً.
 */
import { BookingQuotaNotice } from '../public-booking-form/types';

import { Config, DoctorEntryResponse, EntryAlert } from './types';
import { PatientSuggestionOption, RecentExamPatientOption } from '../add-appointment-form/types';
import { TodayAppointment } from './types';
import { useMemo, useRef, useState } from 'react';
import { buildCairoDateTime, formatUserDate } from '../../../utils/cairoTime';
import { toLocalDateStr } from '../utils';
import { getDefaultTimeStr } from './helpers';
import {
  buildSecretaryVitalFieldDefinitionsWithDefaults,
  createDefaultSecretaryVitalsVisibilityWithCommonEnabled,
} from '../../../utils/secretaryVitals';
import type {
  AppointmentType,
  PaymentType,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsInput,
  SecretaryVitalsVisibility,
} from '../../../types';
import type { InsuranceCompany } from '../../../services/insuranceService';
import type { DiscountReason } from '../../../services/discountReasonService';

export const usePublicBookingPageState = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [dateStr, setDateStr] = useState(() => toLocalDateStr(new Date()));
  const [timeStr, setTimeStr] = useState(() => getDefaultTimeStr());
  const [visitReason, setVisitReason] = useState('');
  const [secretaryVitals, setSecretaryVitals] = useState<SecretaryVitalsInput>({});
  // نبدأ بالإعدادات الافتراضية اللي فيها العلامات الحيوية الشائعة enabled (weight/height/BMI/BP/pulse/temp)
  // عشان السكرتيرة تقدر تكتب فيهم فوراً من غير ما تستنى الطبيب يضبط إعدادات حساب السكرتارية.
  // لو الطبيب ضبط إعدادات مختلفة، الـ realtime sync هيحدثها.
  const [secretaryVitalFields, setSecretaryVitalFields] = useState<SecretaryVitalFieldDefinition[]>(
    buildSecretaryVitalFieldDefinitionsWithDefaults
  );
  const [secretaryVitalsVisibility, setSecretaryVitalsVisibility] = useState<SecretaryVitalsVisibility>(
    createDefaultSecretaryVitalsVisibilityWithCommonEnabled
  );
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [insuranceCompanyId, setInsuranceCompanyId] = useState('');
  const [insuranceCompanyName, setInsuranceCompanyName] = useState('');
  const [insuranceMembershipId, setInsuranceMembershipId] = useState('');
  const [insuranceApprovalCode, setInsuranceApprovalCode] = useState('');
  const [patientSharePercent, setPatientSharePercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountReasonId, setDiscountReasonId] = useState('');
  const [discountReasonLabel, setDiscountReasonLabel] = useState('');
  const [insuranceCompanies, setInsuranceCompanies] = useState<InsuranceCompany[]>([]);
  const [discountReasons, setDiscountReasons] = useState<DiscountReason[]>([]);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('exam');
  const [selectedConsultationCandidateId, setSelectedConsultationCandidateId] = useState<string>('');
  const [consultationCandidatesVisibleCount, setConsultationCandidatesVisibleCount] = useState(10);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [bookingQuotaNotice, setBookingQuotaNotice] = useState<BookingQuotaNotice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [entryAlert, setEntryAlert] = useState<EntryAlert | null>(null);
  const lastEntryAlertCreatedRef = useRef<string | null>(null);
  const entryAlertInitializedRef = useRef(false);
  const [entryResponding, setEntryResponding] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<TodayAppointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<TodayAppointment[]>([]);
  const [recentExamPatients, setRecentExamPatients] = useState<RecentExamPatientOption[]>([]);
  const [patientDirectory, setPatientDirectory] = useState<PatientSuggestionOption[]>([]);
  const [doctorEntryResponse, setDoctorEntryResponse] = useState<DoctorEntryResponse>(null);
  const [approvedEntryAppointmentIds, setApprovedEntryAppointmentIds] = useState<string[]>([]);
  const [secretaryApprovedEntryIds, setSecretaryApprovedEntryIds] = useState<string[]>([]);
  const [pendingEntryAppointmentId, setPendingEntryAppointmentId] = useState<string | null>(null);
  const [doctorResponseToast, setDoctorResponseToast] = useState<'approved' | 'wait' | null>(null);
  const lastDoctorResponseRespondedAtRef = useRef<string | null>(null);
  const doctorResponseInitializedRef = useRef(false);
  const [secretaryActionToast, setSecretaryActionToast] = useState<'approved' | 'rejected' | null>(null);
  const [subscriptionFormTitle, setSubscriptionFormTitle] = useState<string>('');
  const [bookingFormOpen, setBookingFormOpen] = useState(true);
  const [todaySectionOpen, setTodaySectionOpen] = useState(true);
  const [bookingFormLoading, setBookingFormLoading] = useState(false);
  const bookingFormLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentDayStr, setCurrentDayStr] = useState(() => toLocalDateStr(new Date()));
  const previousDayStrRef = useRef(currentDayStr);

  const sortedTodayAppointments = useMemo(
    () => [...todayAppointments].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [todayAppointments]
  );

  const todayDateMeta = useMemo(() => {
    const dateObj = buildCairoDateTime(currentDayStr, '12:00');
    return {
      dayName: formatUserDate(dateObj, { weekday: 'long' }, 'ar-EG'),
      fullDate: formatUserDate(dateObj, { day: 'numeric', month: 'long', year: 'numeric' }, 'ar-EG-u-nu-latn'),
    };
  }, [currentDayStr]);

  const todayStr = currentDayStr;

  return {
    config,
    setConfig,
    configLoading,
    setConfigLoading,
    patientName,
    setPatientName,
    age,
    setAge,
    phone,
    setPhone,
    dateStr,
    setDateStr,
    timeStr,
    setTimeStr,
    visitReason,
    setVisitReason,
    secretaryVitals,
    setSecretaryVitals,
    secretaryVitalFields,
    setSecretaryVitalFields,
    secretaryVitalsVisibility,
    setSecretaryVitalsVisibility,
    paymentType,
    setPaymentType,
    insuranceCompanyId,
    setInsuranceCompanyId,
    insuranceCompanyName,
    setInsuranceCompanyName,
    insuranceMembershipId,
    setInsuranceMembershipId,
    insuranceApprovalCode,
    setInsuranceApprovalCode,
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
    insuranceCompanies,
    setInsuranceCompanies,
    discountReasons,
    setDiscountReasons,
    appointmentType,
    setAppointmentType,
    selectedConsultationCandidateId,
    setSelectedConsultationCandidateId,
    consultationCandidatesVisibleCount,
    setConsultationCandidatesVisibleCount,
    editingAppointmentId,
    setEditingAppointmentId,
    formError,
    setFormError,
    bookingQuotaNotice,
    setBookingQuotaNotice,
    submitting,
    setSubmitting,
    success,
    setSuccess,
    entryAlert,
    setEntryAlert,
    lastEntryAlertCreatedRef,
    entryAlertInitializedRef,
    entryResponding,
    setEntryResponding,
    todayAppointments,
    setTodayAppointments,
    upcomingAppointments,
    setUpcomingAppointments,
    completedAppointments,
    setCompletedAppointments,
    recentExamPatients,
    setRecentExamPatients,
    patientDirectory,
    setPatientDirectory,
    doctorEntryResponse,
    setDoctorEntryResponse,
    approvedEntryAppointmentIds,
    setApprovedEntryAppointmentIds,
    secretaryApprovedEntryIds,
    setSecretaryApprovedEntryIds,
    pendingEntryAppointmentId,
    setPendingEntryAppointmentId,
    doctorResponseToast,
    setDoctorResponseToast,
    lastDoctorResponseRespondedAtRef,
    doctorResponseInitializedRef,
    secretaryActionToast,
    setSecretaryActionToast,
    subscriptionFormTitle,
    setSubscriptionFormTitle,
    bookingFormOpen,
    setBookingFormOpen,
    todaySectionOpen,
    setTodaySectionOpen,
    bookingFormLoading,
    setBookingFormLoading,
    bookingFormLoadingTimerRef,
    currentDayStr,
    setCurrentDayStr,
    previousDayStrRef,
    sortedTodayAppointments,
    todayDateMeta,
    todayStr,
  };
};
