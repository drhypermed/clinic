import { describe, expect, it } from 'vitest';
import {
  formatPatientAddress,
  normalizePatientAddress,
  patientAddressSearchText,
} from '../../utils/patientAddress';

describe('patient address helpers', () => {
  it('normalizes the structured optional address and removes extra spaces', () => {
    expect(normalizePatientAddress({
      governorate: '  القاهرة ',
      cityArea: ' مدينة   نصر ',
      details: ' شارع الطيران  ',
    })).toEqual({
      governorate: 'القاهرة',
      cityArea: 'مدينة نصر',
      details: 'شارع الطيران',
    });
  });

  it('supports legacy plain-text addresses and compact list display', () => {
    expect(normalizePatientAddress(' 12 شارع التحرير ')).toEqual({
      details: '12 شارع التحرير',
    });
    expect(formatPatientAddress({
      governorate: 'الجيزة',
      cityArea: 'الدقي',
      details: 'شارع محيي الدين',
    }, 'summary')).toBe('الجيزة، الدقي');
  });

  it('returns searchable full address text and ignores an empty address', () => {
    expect(patientAddressSearchText({
      governorate: 'القاهرة',
      cityArea: 'المعادي',
    })).toBe('القاهرة، المعادي');
    expect(normalizePatientAddress({})).toBeUndefined();
  });
});
