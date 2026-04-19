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
  AppointmentType } from '../../../types';

type UsePublicBookingPatientSelectionHandlersParams = {
  appointmentType: AppointmentType;
  setAppointmentType: Dispatch<SetStateAction<AppointmentType>>;
  setSelectedConsultationCandidateId: Dispatch<SetStateAction<string>>;
  setConsultationCandidatesVisibleCount: Dispatch<SetStateAction<number>>;
  setPatientName: Dispatch<SetStateAction<string>>;
  setAge: Dispatch<SetStateAction<string>>;
  setPhone: Dispatch<SetStateAction<string>>;
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
  findMatchedConsultationCandidateId,
}: UsePublicBookingPatientSelectionHandlersParams) => {
  const handleAppointmentTypeChange = (value: AppointmentType) => {
    setAppointmentType(value);
    if (value !== 'consultation') {
      setSelectedConsultationCandidateId('');
      setConsultationCandidatesVisibleCount(10);
    }
  };

  const handleSelectConsultationCandidate = (candidate: RecentExamPatientOption) => {
    setAppointmentType('consultation');
    setSelectedConsultationCandidateId(candidate.id);
    setPatientName(candidate.patientName || '');
    setAge(candidate.age || '');
    setPhone(candidate.phone || '');
  };

  const handleSelectPatientSuggestion = (candidate: PatientSuggestionOption) => {
    setPatientName(candidate.patientName || '');
    setAge(candidate.age || '');
    setPhone(candidate.phone || '');
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
