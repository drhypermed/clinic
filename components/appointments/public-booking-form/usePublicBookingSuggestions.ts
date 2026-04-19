/**
 * الملف: usePublicBookingSuggestions.ts (Hook)
 * الوصف: "محرك الاقتراحات الذكية" للمرضى. 
 * يساعد هذا الـ Hook المريض على إكمال بياناته بسرعة؛ فبمجرد كتابة رقم هاتفه 
 * أو اسمه، يقوم المحرك بـ: 
 * 1. البحث في سجلات العيادة السابقة.
 * 2. تجهيز كشوفات آخر 30 يوم للاختيار عند نوع الموعد "استشارة".
 * 3. تقديم قائمة بالاختيارات المطابقة لتجنب إعادة كتابة البيانات يدوياً.
 */
import { useMemo } from 'react';

import type { AppointmentType, PatientSuggestionOption, RecentExamPatientOption } from '../AddAppointmentForm';

type UsePublicBookingSuggestionsParams = {
  appointmentType: AppointmentType;
  phone: string;
  patientName: string;
  recentExamPatients: RecentExamPatientOption[];
  patientDirectory: PatientSuggestionOption[];
};

export const usePublicBookingSuggestions = ({
  appointmentType,
  phone,
  patientName,
  recentExamPatients,
  patientDirectory,
}: UsePublicBookingSuggestionsParams) => {
  const normalize = (value?: string) => (value || '').trim().toLocaleLowerCase();
  const normalizePhone = (value?: string) => (value || '').replace(/\D/g, '');

  const oneMonthAgoMs = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.getTime();
  }, []);

  const noConsultationDirectory = useMemo(() => {
    return patientDirectory.filter((item) => !String(item.lastConsultationDate || '').trim());
  }, [patientDirectory]);

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

  const consultationSuggestionDirectory = useMemo(() => {
    const unique = new Map<string, PatientSuggestionOption>();

    consultationCandidatesPool.forEach((candidate) => {
      const keyPhone = normalizePhone(candidate.phone);
      const keyName = normalize(candidate.patientName);
      const key = keyPhone ? `p:${keyPhone}` : `n:${keyName}:${candidate.id}`;

      const fallback = patientDirectory.find((entry) => {
        const sameName = normalize(entry.patientName) === keyName;
        const samePhone = normalizePhone(entry.phone) && normalizePhone(entry.phone) === keyPhone;
        return Boolean(samePhone || (sameName && !entry.phone && !candidate.phone));
      });

      const nextItem: PatientSuggestionOption = {
        id: candidate.id,
        patientName: candidate.patientName,
        age: candidate.age || fallback?.age,
        phone: candidate.phone || fallback?.phone,
        lastExamDate: candidate.examCompletedAt,
      };

      const existing = unique.get(key);
      const existingMs = new Date(existing?.lastExamDate || 0).getTime();
      const nextMs = new Date(nextItem.lastExamDate || 0).getTime();
      if (!existing || nextMs > existingMs) {
        unique.set(key, nextItem);
      }
    });

    return Array.from(unique.values());
  }, [consultationCandidatesPool, patientDirectory]);

  const latestPhoneForName = useMemo(() => {
    const name = normalize(patientName);
    if (!name) return null;
    const matches = (appointmentType === 'consultation' ? consultationSuggestionDirectory : noConsultationDirectory)
      .filter((item) => normalize(item.patientName) === name && normalizePhone(item.phone))
      .sort((a, b) => new Date(b.lastExamDate || 0).getTime() - new Date(a.lastExamDate || 0).getTime());
    return matches[0] || null;
  }, [patientName, appointmentType, consultationSuggestionDirectory, noConsultationDirectory]);

  const phoneBasePool = appointmentType === 'consultation' ? consultationSuggestionDirectory : noConsultationDirectory;

  const phoneSuggestionOptions = useMemo(() => {
    const query = normalizePhone(phone);
    if (!query) return [] as PatientSuggestionOption[];
    if (query.length < 5) return [] as PatientSuggestionOption[];

    const unique = new Map<string, PatientSuggestionOption>();
    phoneBasePool
      .filter((item) => normalizePhone(item.phone).includes(query))
      .sort((a, b) => new Date(b.lastExamDate || 0).getTime() - new Date(a.lastExamDate || 0).getTime())
      .forEach((item) => {
        const key = `${normalize(item.patientName)}|${normalizePhone(item.phone)}`;
        if (!unique.has(key)) unique.set(key, item);
      });

    return Array.from(unique.values()).slice(0, 8);
  }, [phone, phoneBasePool]);

  const exactPhoneMatches = useMemo(() => {
    const query = normalizePhone(phone);
    if (query.length < 11) return [] as PatientSuggestionOption[];
    return phoneBasePool
      .filter((item) => normalizePhone(item.phone) === query)
      .sort((a, b) => new Date(b.lastExamDate || 0).getTime() - new Date(a.lastExamDate || 0).getTime());
  }, [phone, phoneBasePool]);

  return {
    normalize,
    normalizePhone,
    noConsultationDirectory,
    consultationCandidatesPool,
    phoneSuggestionOptions,
    exactPhoneMatches,
    latestPhoneForName,
  };
};
