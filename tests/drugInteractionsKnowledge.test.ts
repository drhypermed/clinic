import { describe, expect, it } from 'vitest';
import { getLocalDrugInteractions } from '../services/geminiDrugInteractionsService';

describe('local drug interaction knowledge', () => {
  it('recognizes long brand names and reports a sourced anticoagulant interaction', () => {
    const interactions = getLocalDrugInteractions(['Eliquis 5 mg tablets', 'Brufen 400 mg tab']);

    expect(interactions).toHaveLength(1);
    expect(interactions[0]).toMatchObject({
      drugA: 'Eliquis 5 mg tablets',
      drugB: 'Brufen 400 mg tab',
      severity: 'major',
      source: 'Lexicomp / Stockley',
    });
  });

  it('detects contraindicated nitrate plus PDE5 inhibitor combinations', () => {
    const interactions = getLocalDrugInteractions(['Viagra 50 mg', 'Nitroderm patch']);

    expect(interactions[0]?.severity).toBe('contraindicated');
    expect(interactions[0]?.mechanism).toContain('cGMP');
  });

  it('detects triple-whammy renal risk when the third drug is present', () => {
    const interactions = getLocalDrugInteractions(['Tritace', 'Lasix', 'Voltaren amp']);

    expect(interactions.some((item) => item.mechanism.includes('AKI'))).toBe(true);
  });
});

