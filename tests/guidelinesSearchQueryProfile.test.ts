import { describe, expect, it } from 'vitest';
import queryProfileModule from '../functions/src/functions/guidelinesSearchQueryProfile.js';

const { getQueryProfile, inferFocusCollections } = queryProfileModule;

describe('guideline search query profile', () => {
  it('does not interpret initial as the TIA abbreviation', () => {
    const profile = getQueryProfile('Initial management of suspected sepsis in adults');

    expect(profile.terms).not.toContain('tia');
    expect(profile.terms).not.toContain('stroke');
    expect(profile.terms).toContain('sepsis');
  });

  it('routes sepsis to current NICE collections', () => {
    const focus = inferFocusCollections(getQueryProfile('Initial management of suspected sepsis in adults'));

    expect(focus).toContain('nice-2025');
    expect(focus).not.toContain('nice-2022');
  });

  it('routes hypertension without requiring a full index scan', () => {
    const focus = inferFocusCollections(getQueryProfile('First line treatment of hypertension in adults'));

    expect(focus).toEqual(expect.arrayContaining(['acc-2025', 'esc-2024']));
  });

  it('routes general osteoporosis away from glucocorticoid-only guidance', () => {
    const focus = inferFocusCollections(getQueryProfile('When should treatment start for osteoporosis?'));

    expect(focus).toEqual(expect.arrayContaining(['acp-2023', 'endocrine-2026']));
    expect(focus).not.toContain('acr-2026');
  });
});
