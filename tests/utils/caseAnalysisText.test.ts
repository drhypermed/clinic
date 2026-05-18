import { describe, expect, it } from 'vitest';
import {
  caseAnalysisPrescriptionListTextKey,
  normalizeCaseAnalysisPrescriptionListText,
} from '../../utils/rx/caseAnalysisText';

describe('normalizeCaseAnalysisPrescriptionListText', () => {
  it('removes bullets from Arabic instructions before they enter the prescription list', () => {
    expect(normalizeCaseAnalysisPrescriptionListText('\u200f\u2022 \u0627\u0634\u0631\u0628 \u0633\u0648\u0627\u0626\u0644')).toBe('\u0627\u0634\u0631\u0628 \u0633\u0648\u0627\u0626\u0644');
  });

  it('removes latin and arabic numbered list markers', () => {
    expect(normalizeCaseAnalysisPrescriptionListText('1. CBC')).toBe('CBC');
    expect(normalizeCaseAnalysisPrescriptionListText('\u0661) \u0645\u0631\u0627\u062c\u0639\u0629 \u0628\u0639\u062f \u0627\u0633\u0628\u0648\u0639')).toBe('\u0645\u0631\u0627\u062c\u0639\u0629 \u0628\u0639\u062f \u0627\u0633\u0628\u0648\u0639');
  });

  it('preserves investigation names that legitimately start with numbers', () => {
    expect(normalizeCaseAnalysisPrescriptionListText('25-OH Vitamin D')).toBe('25-OH Vitamin D');
  });

  it('uses normalized keys for added-state comparisons', () => {
    expect(caseAnalysisPrescriptionListTextKey('\u2022 CRP')).toBe(caseAnalysisPrescriptionListTextKey('crp'));
  });
});
