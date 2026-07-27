import { describe, expect, it } from 'vitest';
import {
  EGYPT_GOVERNORATES,
  isEgyptGovernorate,
} from '../../utils/egyptGovernorates';

describe('EGYPT_GOVERNORATES', () => {
  it('contains all 27 Egyptian governorates without duplicates', () => {
    expect(EGYPT_GOVERNORATES).toHaveLength(27);
    expect(new Set(EGYPT_GOVERNORATES).size).toBe(27);
    expect(EGYPT_GOVERNORATES).toEqual(expect.arrayContaining([
      'القاهرة',
      'الإسكندرية',
      'شمال سيناء',
      'جنوب سيناء',
      'الوادي الجديد',
      'الأقصر',
    ]));
  });

  it('validates governorates after trimming user input', () => {
    expect(isEgyptGovernorate(' القاهرة ')).toBe(true);
    expect(isEgyptGovernorate('مدينة نصر')).toBe(false);
  });
});
