import { describe, expect, it } from 'vitest';
import {
  mergePatientSuggestions,
  rankPatientSuggestions,
} from '../../services/patientSuggestionSearch';

describe('patient suggestion search', () => {
  it('ranks an exact normalized Arabic name before token and substring matches', () => {
    const result = rankPatientSuggestions([
      { id: 'substring', patientName: 'محمود أحمدي علي' },
      { id: 'token', patientName: 'سارة أحمد' },
      { id: 'exact', patientName: 'أحمد' },
    ], 'احمد', '');

    expect(result.map((item) => item.id)).toEqual(['exact', 'token', 'substring']);
  });

  it('normalizes Egyptian international phone formats for exact ranking', () => {
    const result = rankPatientSuggestions([
      { id: 'partial', patientName: 'A', phone: '01099999999' },
      { id: 'exact', patientName: 'B', phone: '+20 101 234 5678' },
    ], '', '01012345678');

    expect(result.map((item) => item.id)).toEqual(['exact']);
  });

  it('does not merge two same-name patients with different phones', () => {
    const merged = mergePatientSuggestions([
      { id: 'one', patientFileId: 'shared-legacy-file', patientName: 'محمد علي', phone: '01011111111' },
      { id: 'two', patientFileId: 'shared-legacy-file', patientName: 'محمد علي', phone: '01122222222' },
    ], []);

    expect(merged).toHaveLength(2);
  });

  it('keeps primary identity data while enriching missing optional fields from local records', () => {
    const merged = mergePatientSuggestions([
      { id: 'directory', patientName: 'محمد علي', phone: '01011111111' },
    ], [
      {
        id: 'local',
        patientName: 'محمد علي',
        phone: '01011111111',
        address: { governorate: 'القاهرة', cityArea: 'المعادي' },
      },
    ]);

    expect(merged).toEqual([
      {
        id: 'directory',
        patientName: 'محمد علي',
        phone: '01011111111',
        address: { governorate: 'القاهرة', cityArea: 'المعادي' },
      },
    ]);
  });
});
