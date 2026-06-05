import { describe, expect, it } from 'vitest';
import {
  GUIDELINE_COLLECTIONS,
  loadGuidelineCollectionSources,
} from '../components/guidelines/guidelinesData';
import { SIDEBAR_TOPICS } from '../components/landing/user-guide/userGuideData.sidebar';

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

  it('keeps the user guide guidelines library section aligned with registered schools', () => {
    const guideTopic = SIDEBAR_TOPICS.find((topic) => topic.id === 'guidelinesLibrary');
    const guideText = guideTopic?.sections
      .flatMap((section) => [
        section.heading,
        section.body,
        section.tip,
        section.warning,
        ...(section.steps ?? []),
      ])
      .filter(Boolean)
      .join('\n');
    const schools = [...new Set(GUIDELINE_COLLECTIONS.map((collection) => collection.school))];

    expect(guideTopic).toBeDefined();
    expect(guideText).toBeTruthy();
    expect(guideText).toContain('2000 لحد 2026');
    expect(guideText).toContain('ADA 2026');
    expect(schools).toEqual(expect.arrayContaining(['AAPM&R', 'ADA Dental', 'ASA', 'ASHA', 'Audiology']));

    for (const school of schools) {
      expect(guideText).toContain(school);
    }
  });
});
