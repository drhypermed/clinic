import { describe, expect, it } from 'vitest';
import {
  addPatientAddressTemplateLocally,
  getPatientAddressCityTemplates,
  getPatientAddressDetailsTemplates,
  normalizePatientAddressTemplateLibrary,
} from '../../utils/patientAddressTemplates';

describe('patient address templates', () => {
  it('stores cities under their governorate and removes duplicates', () => {
    const first = addPatientAddressTemplateLocally(
      { version: 1, cities: [], details: [] },
      { kind: 'city', governorate: 'القاهرة', value: ' مدينة نصر ' },
    );
    const second = addPatientAddressTemplateLocally(first, {
      kind: 'city',
      governorate: 'القاهرة',
      value: 'مدينة  نصر',
    });
    const third = addPatientAddressTemplateLocally(second, {
      kind: 'city',
      governorate: 'الجيزة',
      value: 'الدقي',
    });

    expect(getPatientAddressCityTemplates(third, 'القاهرة')).toEqual(['مدينة نصر']);
    expect(getPatientAddressCityTemplates(third, 'الجيزة')).toEqual(['الدقي']);
  });

  it('keeps detailed addresses scoped to the selected governorate and city', () => {
    let library = addPatientAddressTemplateLocally(
      { version: 1, cities: [], details: [] },
      {
        kind: 'details',
        governorate: 'القاهرة',
        cityArea: 'مدينة نصر',
        value: 'شارع الطيران، عمارة 10',
      },
    );
    library = addPatientAddressTemplateLocally(library, {
      kind: 'details',
      governorate: 'القاهرة',
      cityArea: 'التجمع الخامس',
      value: 'شارع التسعين',
    });

    expect(getPatientAddressDetailsTemplates(library, 'القاهرة', 'مدينة نصر'))
      .toEqual(['شارع الطيران، عمارة 10']);
    expect(getPatientAddressDetailsTemplates(library, 'القاهرة', 'التجمع الخامس'))
      .toEqual(['شارع التسعين']);
    expect(getPatientAddressDetailsTemplates(library, 'الجيزة', 'مدينة نصر')).toEqual([]);
  });

  it('normalizes the bookingConfig mirror shape', () => {
    const normalized = normalizePatientAddressTemplateLibrary({
      patientAddressTemplates: {
        version: 1,
        cities: [{ governorate: 'القاهرة', values: ['مدينة نصر'] }],
        details: [],
      },
    });

    expect(normalized.cities[0]).toEqual({
      governorate: 'القاهرة',
      values: ['مدينة نصر'],
    });
  });
});
