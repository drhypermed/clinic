import { describe, expect, it } from 'vitest';
import { getLocalRenalDoseAdjustment } from '../services/renalDosingKnowledgeBase';

describe('local renal dosing knowledge base', () => {
  it('matches long brand names with strengths and returns a sourced adjustment', () => {
    const result = getLocalRenalDoseAdjustment('Augmentin 1 gm tablets', 24);

    expect(result?.status).toBe('adjust');
    expect(result?.resolvedDrugName).toBe('Amoxicillin/clavulanate');
    expect(result?.reference).toBe('FDA Label');
    expect(result?.recommendation).toContain('875/125');
  });

  it('does not depend on Gemini for common severe renal impairment rules', () => {
    const result = getLocalRenalDoseAdjustment('Glucophage XR 1000 mg', 22);

    expect(result?.status).toBe('avoid');
    expect(result?.resolvedDrugName).toBe('Metformin');
    expect(result?.criticalNote?.toLowerCase()).toContain('lactic acidosis');
  });

  it('returns null for unknown drugs instead of inventing dosing', () => {
    expect(getLocalRenalDoseAdjustment('unknown experimental product', 35)).toBeNull();
  });
});

