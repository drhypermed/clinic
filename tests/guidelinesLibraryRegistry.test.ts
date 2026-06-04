import { describe, expect, it } from 'vitest';
import {
  GUIDELINE_COLLECTIONS,
  loadGuidelineCollectionSources,
} from '../components/guidelines/guidelinesData';

describe('guidelines library registry', () => {
  it('keeps generated guideline schools visible in the index', () => {
    const schools = [...new Set(GUIDELINE_COLLECTIONS.map((collection) => collection.school))];

    expect(schools).toEqual(
      expect.arrayContaining([
        'ACC',
        'NICE',
        'AAP',
        'ACG',
        'ACP',
        'CDC ACIP',
        'Endocrine',
        'ESPEN',
      ]),
    );
  });

  it('loads source-only collections on demand', async () => {
    const aapSources = await loadGuidelineCollectionSources('aap-2026');
    const accSources = await loadGuidelineCollectionSources('acc-2026');

    expect(aapSources.length).toBeGreaterThan(0);
    expect(accSources.length).toBeGreaterThan(0);
  });
});
