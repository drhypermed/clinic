import { describe, expect, it } from 'vitest';
import {
  consultationCandidateMatchesPatient,
  filterConsultationCandidates,
  findMatchingConsultationCandidateId,
  getVisiblePatientSuggestions,
} from '../../../components/appointments/add-appointment-form/helpers';
import type {
  PatientSuggestionOption,
  RecentExamPatientOption,
} from '../../../components/appointments/add-appointment-form/types';

const buildPatients = (count: number): PatientSuggestionOption[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `patient-${index}`,
    patientName: `Ahmed ${index}`,
    phone: index === 0 ? '+20 101 234 5678' : `010000000${String(index).padStart(2, '0')}`,
  }));

describe('secretary patient suggestions', () => {
  it('matches common Arabic letter variants in the visible dropdown', () => {
    const visible = getVisiblePatientSuggestions(
      [{ id: 'arabic-patient', patientName: 'أميرة مصطفى', phone: '01012345678' }],
      'name',
      'اميره مصطفي',
      '',
    );
    expect(visible.map((item) => item.id)).toEqual(['arabic-patient']);
  });

  it('keeps an international-format phone visible for a local-format search', () => {
    const visible = getVisiblePatientSuggestions(
      buildPatients(1),
      'phone',
      '',
      '01012345678',
    );
    expect(visible.map((item) => item.id)).toEqual(['patient-0']);
  });

  it('does not silently hide server matches after the fifth result', () => {
    const visible = getVisiblePatientSuggestions(buildPatients(20), 'name', 'Ahmed', '');
    expect(visible).toHaveLength(20);
  });
});

describe('consultation candidate search', () => {
  const candidates: RecentExamPatientOption[] = [
    {
      id: 'exam-1',
      patientName: 'أميرة مصطفى',
      phone: '+20 101 234 5678',
      patientFileNumber: 145,
      examCompletedAt: '2026-07-20T10:00:00.000Z',
    },
    {
      id: 'exam-2',
      patientName: 'محمود علي',
      phone: '01111111111',
      patientFileNumber: 982,
      examCompletedAt: '2026-07-18T10:00:00.000Z',
    },
  ];

  it('searches eligible exams by normalized Arabic name, phone, or file number', () => {
    expect(filterConsultationCandidates(candidates, 'اميره').map((item) => item.id))
      .toEqual(['exam-1']);
    expect(filterConsultationCandidates(candidates, '0101234').map((item) => item.id))
      .toEqual(['exam-1']);
    expect(filterConsultationCandidates(candidates, '982').map((item) => item.id))
      .toEqual(['exam-2']);
  });

  it('links a directory suggestion to the exact eligible exam', () => {
    expect(findMatchingConsultationCandidateId(candidates, {
      id: 'directory-entry',
      patientName: 'اسم قديم',
      patientFileNumber: 982,
    })).toBe('exam-2');

    expect(findMatchingConsultationCandidateId(candidates, {
      id: 'directory-entry-2',
      patientName: 'أميره مصطفى',
      phone: '01012345678',
    })).toBe('exam-1');
  });

  it('does not link a patient who has no eligible exam in the 30-day pool', () => {
    expect(findMatchingConsultationCandidateId(candidates, {
      id: 'old-patient',
      patientName: 'مريض قديم',
      phone: '01222222222',
    })).toBe('');
  });

  it('detects when patient fields no longer belong to the selected exam', () => {
    expect(consultationCandidateMatchesPatient(candidates[0], {
      patientName: 'أميره مصطفى',
      phone: '01012345678',
    })).toBe(true);
    expect(consultationCandidateMatchesPatient(candidates[0], {
      patientName: 'مريض آخر',
      phone: '01222222222',
    })).toBe(false);
  });
});
