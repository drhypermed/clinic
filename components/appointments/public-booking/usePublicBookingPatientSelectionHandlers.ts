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
import { normalizeGender } from '../../../utils/patientIdentity';
import { resolvePatientSuggestionAgeText } from '../patientSuggestionSelection';

type UsePublicBookingPatientSelectionHandlersParams = {
  appointmentType: AppointmentType;
  setAppointmentType: Dispatch<SetStateAction<AppointmentType>>;
  setSelectedConsultationCandidateId: Dispatch<SetStateAction<string>>;
  setConsultationCandidatesVisibleCount: Dispatch<SetStateAction<number>>;
  setPatientName: Dispatch<SetStateAction<string>>;
  setAge: Dispatch<SetStateAction<string>>;
  setDateOfBirth: Dispatch<SetStateAction<string>>;
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
  setDateOfBirth,
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
  // عند اختيار مريض قديم: ننقل الجنس (ثابت) + نحسب السن الحالي تلقائياً
  const applyPatientIdentity = (candidate: { gender?: PatientGender; age?: string; dateOfBirth?: string; lastExamDate?: string; lastConsultationDate?: string; examCompletedAt?: string }) => {
    setGender(normalizeGender(candidate.gender) ?? '');
    setDateOfBirth(candidate.dateOfBirth || '');
    setAge(resolvePatientSuggestionAgeText(candidate));
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
