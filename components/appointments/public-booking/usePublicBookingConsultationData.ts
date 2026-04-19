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

type UsePublicBookingConsultationDataParams = {
  recentExamPatients: RecentExamPatientOption[];
  consultationCandidatesVisibleCount: number;
};

export const usePublicBookingConsultationData = ({
  recentExamPatients,
  consultationCandidatesVisibleCount,
}: UsePublicBookingConsultationDataParams) => {
  const normalize = (value?: string) => (value || '').trim().toLocaleLowerCase();
  const normalizePhone = (value?: string) => {
    const digits = (value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('20') && digits.length >= 12) return `0${digits.slice(-10)}`;
    if (digits.length === 10 && digits.startsWith('1')) return `0${digits}`;
    if (digits.length > 11) return digits.slice(-11);
    return digits;
  };
  const phoneMatches = (a?: string, b?: string) => {
    const pa = normalizePhone(a);
    const pb = normalizePhone(b);
    if (!pa || !pb) return false;
    return pa === pb || pa.endsWith(pb) || pb.endsWith(pa);
  };

  const oneMonthAgoMs = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.getTime();
  }, []);

  const consultationCandidatesPool = useMemo(() => {
    return [...recentExamPatients]
      .filter((candidate) => {
      const candidateMs = new Date(candidate.examCompletedAt).getTime();
      if (!Number.isFinite(candidateMs) || candidateMs < oneMonthAgoMs) return false;
      return true;
      })
      .sort((a, b) => {
        const aMs = new Date(a.examCompletedAt || 0).getTime();
        const bMs = new Date(b.examCompletedAt || 0).getTime();
        return bMs - aMs;
      });
  }, [recentExamPatients, oneMonthAgoMs]);

  const visibleConsultationCandidates = useMemo(
    () => consultationCandidatesPool.slice(0, Math.max(0, consultationCandidatesVisibleCount)),
    [consultationCandidatesPool, consultationCandidatesVisibleCount]
  );

  const canLoadMoreConsultationCandidates =
    consultationCandidatesPool.length > visibleConsultationCandidates.length;

  const findMatchedConsultationCandidateId = (candidate: PatientSuggestionOption): string => {
    const matched = consultationCandidatesPool.find((item) => {
      const sameName = normalize(item.patientName) === normalize(candidate.patientName);
      const samePhone = phoneMatches(item.phone, candidate.phone);
      return (sameName && samePhone) || samePhone;
    });
    return matched?.id || '';
  };

  return {
    visibleConsultationCandidates,
    canLoadMoreConsultationCandidates,
    findMatchedConsultationCandidateId,
  };
};
