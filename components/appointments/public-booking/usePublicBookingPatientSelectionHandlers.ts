/**
 * الملف: usePublicBookingPatientSelectionHandlers.ts (Hook)
 * الوصف: "محلل اختيارات المرضى". 
 * يتحكم هذا الملف في كيفية تعامل النموذج (Form) مع اختيار المرضى: 
 * - عند اختيار مريض من "الاقتراحات الذكية"، يقوم بملء حقول الاسم والهاتف والسن تلقائياً. 
 * - عند اختيار "استشارة" لمريض سابق، يربط الموعد الجديد بسجل الكشف القديم. 
 * - يدير التبديل بين أنواع المواعيد (كشف/استشارة) وتصفير الحقول المرتبطة عند التغيير.
 */
import type { PatientSuggestionOption } from '../add-appointment-form/types';

import type { RecentExamPatientOption } from './types';
import type { Dispatch, SetStateAction } from 'react';
import type {
  AppointmentType, PatientGender } from '../../../types';
// دوال الهوية: تطبيع الجنس + حساب السن من فرق الوقت
import {
  advanceAgeByElapsedTime,
  normalizeGender,
} from '../../../utils/patientIdentity';
import { formatAgeForStorage } from '../utils';

type UsePublicBookingPatientSelectionHandlersParams = {
  appointmentType: AppointmentType;
  setAppointmentType: Dispatch<SetStateAction<AppointmentType>>;
  setSelectedConsultationCandidateId: Dispatch<SetStateAction<string>>;
  setConsultationCandidatesVisibleCount: Dispatch<SetStateAction<number>>;
  setPatientName: Dispatch<SetStateAction<string>>;
  setAge: Dispatch<SetStateAction<string>>;
  setPhone: Dispatch<SetStateAction<string>>;
  setGender: Dispatch<SetStateAction<PatientGender | ''>>;
  setPregnant: Dispatch<SetStateAction<boolean | null>>;
  setBreastfeeding: Dispatch<SetStateAction<boolean | null>>;
  findMatchedConsultationCandidateId: (candidate: PatientSuggestionOption) => string;
};

export const usePublicBookingPatientSelectionHandlers = ({
  appointmentType,
  setAppointmentType,
  setSelectedConsultationCandidateId,
  setConsultationCandidatesVisibleCount,
  setPatientName,
  setAge,
  setPhone,
  setGender,
  setPregnant,
  setBreastfeeding,
  findMatchedConsultationCandidateId,
}: UsePublicBookingPatientSelectionHandlersParams) => {
  const handleAppointmentTypeChange = (value: AppointmentType) => {
    setAppointmentType(value);
    if (value !== 'consultation') {
      setSelectedConsultationCandidateId('');
      setConsultationCandidatesVisibleCount(10);
    }
  };

  /** نحسب السن الجديد من السن القديم + فرق الوقت بين آخر زيارة واليوم */
  const resolveAdvancedAgeText = (candidate: { age?: string; lastExamDate?: string; lastConsultationDate?: string; examCompletedAt?: string }): string => {
    const lastVisit = candidate.lastExamDate || candidate.lastConsultationDate || candidate.examCompletedAt;
    if (!lastVisit || !candidate.age) return candidate.age ?? '';
    const text = candidate.age;
    const isMonth = /شهر/.test(text);
    const isDay = /يوم/.test(text);
    const match = text.replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).match(/(\d+)/);
    const num = match ? String(parseInt(match[1] || '0', 10) || 0) : '';
    const oldAge = isDay
      ? { years: '', months: '', days: num }
      : isMonth
        ? { years: '', months: num, days: '' }
        : { years: num, months: '', days: '' };
    const advanced = advanceAgeByElapsedTime(oldAge, lastVisit);
    const y = parseInt(advanced.years || '0', 10);
    const m = parseInt(advanced.months || '0', 10);
    const d = parseInt(advanced.days || '0', 10);
    if (y > 0) return formatAgeForStorage(String(y), 'year');
    if (m > 0) return formatAgeForStorage(String(m), 'month');
    if (d > 0) return formatAgeForStorage(String(d), 'day');
    return candidate.age ?? '';
  };

  // عند اختيار مريض قديم: ننقل الجنس (ثابت) + نحسب السن الحالي تلقائياً
  const applyPatientIdentity = (candidate: { gender?: PatientGender; age?: string; lastExamDate?: string; lastConsultationDate?: string; examCompletedAt?: string }) => {
    setGender(normalizeGender(candidate.gender) ?? '');
    setAge(resolveAdvancedAgeText(candidate));
    // الحمل/الرضاعة لا يُنقلا — بنسأل كل زيارة من الصفر
    setPregnant(null);
    setBreastfeeding(null);
  };

  const handleSelectConsultationCandidate = (candidate: RecentExamPatientOption) => {
    setAppointmentType('consultation');
    setSelectedConsultationCandidateId(candidate.id);
    setPatientName(candidate.patientName || '');
    setPhone(candidate.phone || '');
    applyPatientIdentity(candidate);
  };

  const handleSelectPatientSuggestion = (candidate: PatientSuggestionOption) => {
    setPatientName(candidate.patientName || '');
    setPhone(candidate.phone || '');
    applyPatientIdentity(candidate);
    if (appointmentType === 'consultation') {
      setSelectedConsultationCandidateId(findMatchedConsultationCandidateId(candidate));
    }
  };

  return {
    handleAppointmentTypeChange,
    handleSelectConsultationCandidate,
    handleSelectPatientSuggestion,
  };
};
