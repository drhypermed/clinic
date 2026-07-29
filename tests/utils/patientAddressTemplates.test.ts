import { describe, expect, it } from 'vitest';
import {
  deletePatientAddressTemplateLocally,
  findPatientAddressTemplate,
  normalizePatientAddressTemplateLibrary,
  upsertPatientAddressTemplateLocally,
} from '../../utils/patientAddressTemplates';

describe('patient address templates', () => {
  it('stores a full address with an editable template name', () => {
    const library = upsertPatientAddressTemplateLocally(
      { version: 2, addresses: [] },
      { id: 'home', name: 'المنزل', address: 'بنها' },
    );
    const updated = upsertPatientAddressTemplateLocally(library, {
      id: 'home',
      name: 'بيت المريض',
      address: 'بنها، شارع فريد ندا',
    });

    expect(updated.addresses).toEqual([{
      id: 'home',
      name: 'بيت المريض',
      address: 'بنها، شارع فريد ندا',
    }]);
  });

  it('removes a template without touching other saved templates', () => {
    const library = normalizePatientAddressTemplateLibrary({
      version: 2,
      addresses: [
        { id: 'home', name: 'المنزل', address: 'بنها' },
        { id: 'work', name: 'العمل', address: 'القاهرة' },
      ],
    });
    const updated = deletePatientAddressTemplateLocally(library, 'home');

    expect(updated.addresses).toHaveLength(1);
    expect(updated.addresses[0].id).toBe('work');
  });

  it('migrates the previous governorate, city and details templates to full addresses', () => {
    const normalized = normalizePatientAddressTemplateLibrary({
      patientAddressTemplates: {
        version: 1,
        cities: [{ governorate: 'القليوبية', values: ['بنها'] }],
        details: [{
          governorate: 'القليوبية',
          cityArea: 'بنها',
          values: ['شارع فريد ندا'],
        }],
      },
    });

    expect(findPatientAddressTemplate(normalized, 'القليوبية، بنها')).toBeDefined();
    expect(findPatientAddressTemplate(
      normalized,
      'القليوبية، بنها، شارع فريد ندا',
    )).toBeDefined();
  });
});
