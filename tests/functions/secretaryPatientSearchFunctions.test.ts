import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const searchModule = require(
  '../../functions/src/functions/secretaryPatientSearchFunctions.js',
) as {
  buildLegacyNameQueryVariants: (value: unknown) => string[];
};

describe('secretary legacy patient-name aliases', () => {
  it('covers combined alef, taa marbuta, and yaa spelling differences', () => {
    const variants = searchModule.buildLegacyNameQueryVariants('اميره مصطفي');
    expect(variants).toContain('أميرة مصطفى');
  });

  it('covers both directions of haa/taa marbuta and yaa/alef maqsura', () => {
    expect(searchModule.buildLegacyNameQueryVariants('فاطمة علي')).toEqual(
      expect.arrayContaining(['فاطمه على']),
    );
  });
});
