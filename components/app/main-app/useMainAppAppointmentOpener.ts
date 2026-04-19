// ─────────────────────────────────────────────────────────────────────────────
// Hook فتح الموعد في الروشتة (useMainAppAppointmentOpener)
// ─────────────────────────────────────────────────────────────────────────────
// يوفر callback-ين رئيسيين للتعامل مع فتح مواعيد المرضى:
//
//   • openExam(apt): يفتح الموعد كـ "كشف جديد" أو "استشارة جديدة"
//     - يعيد ضبط الفورم
//     - يملأ بيانات المريض (اسم، تليفون، عمر)
//     - يملأ بيانات الدفع والتأمين والخصم
//     - يطبق العلامات الحيوية اللي أدخلتها السكرتارية
//     - ينتقل لتبويب الروشتة
//
//   • openConsultation(apt): يفتح استشارة لكشف سابق
//     - يحل سجل الكشف المرتبط بالموعد (resolveConsultationRecordForAppointment)
//     - لو مفيش سجل: يرجع false وينبّه Console
//     - بخلاف openExam، ما بيفرغش بيانات المريض (لأنها بتتحمل من السجل)
//
// فصلناها في hook منفصل لأنها كانت inline داخل JSX وتجعل MainApp ضخم.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import type {
  ClinicAppointment,
  PatientRecord,
  PaymentType,
  SecretaryVitalFieldDefinition,
  VitalSigns,
} from '../../../types';
import { isConsultationAppointment } from '../../../utils/appointmentType';
import { parseAgeToYearsMonthsDays } from '../../appointments/utils';
import { sanitizeSecretaryVitalsInput } from '../../../utils/secretaryVitals';
import { resolveConsultationRecordForAppointment } from '../utils';
import type { AppView } from '../utils';
import { resolveAppointmentVisitDate } from './helpers';

interface UseMainAppAppointmentOpenerParams {
  appointments: ClinicAppointment[];
  records: PatientRecord[];
  prescriptionSecretaryFieldDefinitions: SecretaryVitalFieldDefinition[];
  mapAppointmentSecretaryCustomValues: (
    secretaryVitals: ClinicAppointment['secretaryVitals'] | undefined
  ) => Record<string, string>;
  setAppointmentSecretaryCustomValues: (values: Record<string, string>) => void;
  setOpenedAppointmentContext: (apt: ClinicAppointment | null) => void;
  handleResetAndClearOpenedAppointment: () => void;
  handleOpenConsultation: (record: PatientRecord) => void;
  navigateToView: (view: AppView) => void;

  // setters من useDrHyper — بيانات المريض الأساسية
  setPatientName: (v: string) => void;
  setPhone: (v: string) => void;
  setAgeYears: (v: string) => void;
  setAgeMonths: (v: string) => void;
  setAgeDays: (v: string) => void;
  setVisitDate: (v: string) => void;
  setVisitType: (v: 'exam' | 'consultation') => void;
  setIsPastConsultationMode: (v: boolean) => void;

  // ملف المريض الموحد
  setActivePatientFileId: (v: string | null) => void;
  setActivePatientFileNumber: (v: number | null) => void;
  setActivePatientFileNameKey: (v: string | null) => void;

  // الدفع والتأمين والخصم
  setPaymentType: (v: PaymentType) => void;
  setInsuranceCompanyId: (v: string) => void;
  setInsuranceCompanyName: (v: string) => void;
  setInsuranceApprovalCode: (v: string) => void;
  setInsuranceMembershipId: (v: string) => void;
  setPatientSharePercent: (v: number) => void;
  setDiscountAmount: (v: number) => void;
  setDiscountPercent: (v: number) => void;
  setDiscountReasonId: (v: string) => void;
  setDiscountReasonLabel: (v: string) => void;

  // العلامات الحيوية
  setWeight: (v: string) => void;
  setHeight: (v: string) => void;
  setVitals: (updater: (prev: VitalSigns) => VitalSigns) => void;
}

/** دالة مساعدة — تطبق بيانات الدفع والتأمين والخصم من الموعد على الفورم. */
const applyPaymentFieldsFromAppointment = (
  apt: ClinicAppointment,
  setters: Pick<
    UseMainAppAppointmentOpenerParams,
    'setPaymentType' | 'setInsuranceCompanyId' | 'setInsuranceCompanyName'
    | 'setInsuranceApprovalCode' | 'setInsuranceMembershipId' | 'setPatientSharePercent'
    | 'setDiscountAmount' | 'setDiscountPercent' | 'setDiscountReasonId' | 'setDiscountReasonLabel'
  >,
) => {
  setters.setPaymentType(apt.paymentType || 'cash');
  setters.setInsuranceCompanyId(apt.insuranceCompanyId || '');
  setters.setInsuranceCompanyName(apt.insuranceCompanyName || '');
  setters.setInsuranceApprovalCode(apt.insuranceApprovalCode || '');
  setters.setInsuranceMembershipId(apt.insuranceMembershipId || '');
  setters.setPatientSharePercent(apt.patientSharePercent !== undefined ? apt.patientSharePercent : 0);
  setters.setDiscountAmount(Number(apt.discountAmount || 0) || 0);
  setters.setDiscountPercent(Number(apt.discountPercent || 0) || 0);
  setters.setDiscountReasonId(String(apt.discountReasonId || '').trim());
  setters.setDiscountReasonLabel(String(apt.discountReasonLabel || '').trim());
};

/** دالة مساعدة — تطبق العلامات الحيوية والوزن والطول من سكرتارية الموعد. */
const applySecretaryVitalsFromAppointment = (
  secretaryVitals: ReturnType<typeof sanitizeSecretaryVitalsInput>,
  setters: Pick<UseMainAppAppointmentOpenerParams, 'setWeight' | 'setHeight' | 'setVitals'>,
) => {
  if (!secretaryVitals) return;
  if (secretaryVitals.weight) setters.setWeight(secretaryVitals.weight);
  if (secretaryVitals.height) setters.setHeight(secretaryVitals.height);
  setters.setVitals((prev) => ({
    ...prev,
    bp: secretaryVitals.bp || prev.bp,
    pulse: secretaryVitals.pulse || prev.pulse,
    temp: secretaryVitals.temp || prev.temp,
    rbs: secretaryVitals.rbs || prev.rbs,
    spo2: secretaryVitals.spo2 || prev.spo2,
    rr: secretaryVitals.rr || prev.rr,
  }));
};

export const useMainAppAppointmentOpener = (params: UseMainAppAppointmentOpenerParams) => {
  const {
    appointments, records,
    prescriptionSecretaryFieldDefinitions,
    mapAppointmentSecretaryCustomValues,
    setAppointmentSecretaryCustomValues,
    setOpenedAppointmentContext,
    handleResetAndClearOpenedAppointment,
    handleOpenConsultation,
    navigateToView,
    setPatientName, setPhone, setAgeYears, setAgeMonths, setAgeDays,
    setVisitDate, setVisitType, setIsPastConsultationMode,
    setActivePatientFileId, setActivePatientFileNumber, setActivePatientFileNameKey,
    setWeight, setHeight, setVitals,
  } = params;

  /**
   * فتح موعد ككشف جديد (أو استشارة جديدة لو الموعد من نوع استشارة).
   * يملأ الفورم بكل بيانات المريض والدفع والسكرتارية ثم ينقل للروشتة.
   */
  const openExam = useCallback((apt: ClinicAppointment) => {
    const openAsConsultation = isConsultationAppointment(apt);

    // استخراج metadata للموعد مع تأمين الأنواع
    const appointmentMeta = apt as unknown as {
      patientFileId?: unknown;
      patientFileNameKey?: unknown;
      patientFileNumber?: unknown;
      secretaryVitals?: unknown;
    };
    const rawPatientFileId = String(appointmentMeta.patientFileId || '').trim();
    const rawPatientFileNameKey = String(appointmentMeta.patientFileNameKey || '').trim();
    const rawPatientFileNumber = Number(appointmentMeta.patientFileNumber);
    const normalizedPatientFileNumber = Number.isFinite(rawPatientFileNumber) && rawPatientFileNumber > 0
      ? Math.floor(rawPatientFileNumber)
      : null;

    // تطهير العلامات الحيوية اللي أدخلتها السكرتارية
    const appointmentSecretaryVitals = sanitizeSecretaryVitalsInput(
      appointmentMeta.secretaryVitals,
      { fieldDefinitions: prescriptionSecretaryFieldDefinitions },
    );
    const appointmentCustomValues = mapAppointmentSecretaryCustomValues(appointmentSecretaryVitals);

    // إعادة ضبط الفورم قبل تحميل البيانات الجديدة (مع حماية من فقدان بيانات غير محفوظة)
    handleResetAndClearOpenedAppointment();
    setOpenedAppointmentContext(apt);

    // بيانات المريض الأساسية
    setPatientName(apt.patientName || '');
    setPhone(apt.phone || '');
    const { years, months, days } = parseAgeToYearsMonthsDays(apt.age || '');
    setAgeYears(years);
    setAgeMonths(months);
    setAgeDays(days);

    const appointmentVisitDate = resolveAppointmentVisitDate(apt.dateTime);
    if (appointmentVisitDate) setVisitDate(appointmentVisitDate);

    // ملف المريض الموحد
    setActivePatientFileId(rawPatientFileId || null);
    setActivePatientFileNumber(normalizedPatientFileNumber);
    setActivePatientFileNameKey(rawPatientFileNameKey || (apt.patientName || '').trim() || null);

    setVisitType(openAsConsultation ? 'consultation' : 'exam');
    setIsPastConsultationMode(openAsConsultation);

    // الدفع + التأمين + الخصم
    applyPaymentFieldsFromAppointment(apt, params);

    // العلامات الحيوية من السكرتارية
    applySecretaryVitalsFromAppointment(appointmentSecretaryVitals, { setWeight, setHeight, setVitals });
    setAppointmentSecretaryCustomValues(appointmentCustomValues);

    navigateToView('prescription');
  }, [
    appointments, records, prescriptionSecretaryFieldDefinitions,
    mapAppointmentSecretaryCustomValues, setAppointmentSecretaryCustomValues,
    setOpenedAppointmentContext, handleResetAndClearOpenedAppointment,
    setPatientName, setPhone, setAgeYears, setAgeMonths, setAgeDays,
    setVisitDate, setVisitType, setIsPastConsultationMode,
    setActivePatientFileId, setActivePatientFileNumber, setActivePatientFileNameKey,
    setWeight, setHeight, setVitals,
    navigateToView,
    // applyPaymentFieldsFromAppointment تستخدم setters من params (مرتبطة بـ params reference)
    params,
  ]);

  /**
   * فتح موعد كاستشارة لكشف سابق — يحل السجل المرتبط أولاً.
   * يرجع true لو نجح، false لو مش لاقي السجل.
   */
  const openConsultation = useCallback((apt: ClinicAppointment): boolean => {
    const recordToOpen = resolveConsultationRecordForAppointment(apt, appointments, records);
    if (!recordToOpen) {
      console.warn('Unable to resolve consultation record for appointment', apt);
      return false;
    }

    setOpenedAppointmentContext(apt);
    handleOpenConsultation(recordToOpen);

    const appointmentVisitDate = resolveAppointmentVisitDate(apt.dateTime);
    if (appointmentVisitDate) setVisitDate(appointmentVisitDate);

    // الدفع + التأمين + الخصم
    applyPaymentFieldsFromAppointment(apt, params);

    // العلامات الحيوية من السكرتارية
    const appointmentSecretaryVitals = sanitizeSecretaryVitalsInput(
      (apt as { secretaryVitals?: unknown }).secretaryVitals,
      { fieldDefinitions: prescriptionSecretaryFieldDefinitions },
    );
    const appointmentCustomValues = mapAppointmentSecretaryCustomValues(appointmentSecretaryVitals);

    applySecretaryVitalsFromAppointment(appointmentSecretaryVitals, { setWeight, setHeight, setVitals });
    setAppointmentSecretaryCustomValues(appointmentCustomValues);

    navigateToView('prescription');
    return true;
  }, [
    appointments, records,
    prescriptionSecretaryFieldDefinitions,
    mapAppointmentSecretaryCustomValues, setAppointmentSecretaryCustomValues,
    setOpenedAppointmentContext, handleOpenConsultation,
    setVisitDate,
    setWeight, setHeight, setVitals,
    navigateToView,
    params,
  ]);

  return { openExam, openConsultation };
};
