import { describe, expect, it } from 'vitest';
import type { ReadyPrescription } from '../../types';
import { buildReadyPrescriptionTextSuggestions } from '../../utils/readyPrescriptionUtils';

const preset = (
  id: string,
  updatedAt: string,
  values: Partial<Pick<ReadyPrescription, 'generalAdvice' | 'labInvestigations'>>,
): ReadyPrescription => ({
  id,
  name: id,
  rxItems: [],
  generalAdvice: values.generalAdvice || [],
  labInvestigations: values.labInvestigations || [],
  updatedAt,
});

describe('buildReadyPrescriptionTextSuggestions', () => {
  it('returns the latest five unique ready-prescription lines when query is empty', () => {
    const presets = [
      preset('old', '2026-01-01', { generalAdvice: ['old 1', 'old 2'] }),
      preset('new', '2026-03-01', { generalAdvice: ['new 1', 'new 2', 'new 3'] }),
      preset('middle', '2026-02-01', { generalAdvice: ['middle 1', 'middle 2', 'new 1'] }),
    ];

    expect(buildReadyPrescriptionTextSuggestions(presets, 'generalAdvice', '')).toEqual([
      'new 1',
      'new 2',
      'new 3',
      'middle 1',
      'middle 2',
    ]);
  });

  it('searches all ready prescriptions, including matches outside the latest five', () => {
    const presets = [
      preset('new', '2026-03-01', { labInvestigations: ['CBC', 'CRP', 'ESR', 'ALT', 'AST'] }),
      preset('old', '2026-01-01', { labInvestigations: ['HbA1c', 'TSH'] }),
    ];

    expect(buildReadyPrescriptionTextSuggestions(presets, 'labInvestigations', 'hba')).toEqual(['HbA1c']);
  });
});
