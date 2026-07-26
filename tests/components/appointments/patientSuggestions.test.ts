import { describe, expect, it } from 'vitest';
import { getVisiblePatientSuggestions } from '../../../components/appointments/add-appointment-form/helpers';
import type { PatientSuggestionOption } from '../../../components/appointments/add-appointment-form/types';

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
