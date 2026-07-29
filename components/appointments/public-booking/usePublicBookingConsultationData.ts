/**
 * الملف: usePublicBookingConsultationData.ts (Hook)
 * الوصف: "فلتر الاستشارات الذكي". 
 * يقوم هذا الملف بمهمة فنية دقيقة لفرز المرضى المؤهلين للاختيار السريع: 
 * - يبحث في قاعدة البيانات عن المرضى الذين قاموا بالكشف (Exam) خلال آخر 30 يوماً. 
 * - لا يطبق شرط استبعاد على أساس وجود استشارة سابقة. 
 * - يطابق البيانات باستخدام الاسم ورقم الهاتف (مع مراعاة أخطاء كتابة الأرقام). 
 * - يزويد السكرتير بقائمة جاهزة للاختيار السريع لضمان تطبيق سياسة العيادة في الاستشارات.
 */
import { RecentExamPatientOption } from './types';

import { useMemo } from 'react';
import type { PatientSuggestionOption } from '../../../types';
import { findMatchingConsultationCandidateId } from '../add-appointment-form/helpers';

type UsePublicBookingConsultationDataParams = {
  recentExamPatients: RecentExamPatientOption[];
};

export const usePublicBookingConsultationData = ({
  recentExamPatients,
}: UsePublicBookingConsultationDataParams) => {
  const consultationCandidatesPool = useMemo(() => {
    return [...recentExamPatients]
      .filter((candidate) => {
      const candidateMs = new Date(candidate.examCompletedAt).getTime();
      return Number.isFinite(candidateMs);
      })
      .sort((a, b) => {
        const aMs = new Date(a.examCompletedAt || 0).getTime();
        const bMs = new Date(b.examCompletedAt || 0).getTime();
        return bMs - aMs;
      });
  }, [recentExamPatients]);

  const findMatchedConsultationCandidateId = (candidate: PatientSuggestionOption): string => {
    return findMatchingConsultationCandidateId(consultationCandidatesPool, candidate);
  };

  return {
    visibleConsultationCandidates: consultationCandidatesPool,
    findMatchedConsultationCandidateId,
  };
};
