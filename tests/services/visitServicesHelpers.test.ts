import { describe, expect, it } from 'vitest';
import {
  buildVisitServiceTemplateId,
  filterVisitServiceItems,
  normalizeServiceName,
  normalizeVisitServiceTemplates,
} from '../../services/visit-services/helpers';
import type { VisitServiceCharge } from '../../services/visit-services/types';

describe('visit service helpers', () => {
  it('normalizes Arabic spelling and whitespace so a template is not duplicated', () => {
    expect(normalizeServiceName('  رَسْم   القَلْب  ')).toBe('رسم القلب');
    expect(normalizeServiceName('إستشارة أخرى')).toBe('استشاره اخري');
  });

  it('builds stable ids and separates intervention from other-income templates', () => {
    const normalized = normalizeServiceName('رسم قلب');
    expect(buildVisitServiceTemplateId('interventions', normalized))
      .toBe(buildVisitServiceTemplateId('interventions', normalized));
    expect(buildVisitServiceTemplateId('interventions', normalized))
      .not.toBe(buildVisitServiceTemplateId('other', normalized));
  });

  it('keeps valid templates and sorts frequently used templates first', () => {
    const templates = normalizeVisitServiceTemplates([
      {
        id: 'a',
        name: 'رسم قلب',
        type: 'interventions',
        defaultPrice: 200,
        branchId: 'main',
        active: true,
        usageCount: 2,
        createdAt: 1,
        updatedAt: 2,
        lastUsedAt: 2,
        createdByRole: 'doctor',
      },
      {
        id: 'b',
        name: 'تقرير طبي',
        type: 'other',
        defaultPrice: '100',
        branchId: 'main',
        usageCount: 5,
        createdAt: 1,
        updatedAt: 3,
        lastUsedAt: 3,
        createdByRole: 'secretary',
      },
      { id: '', name: '', type: 'other' },
    ]);

    expect(templates).toHaveLength(2);
    expect(templates[0].id).toBe('b');
    expect(templates[0].defaultPrice).toBe(100);
  });

  it('shows only charges linked to the selected appointment', () => {
    const base: Omit<VisitServiceCharge, 'id' | 'visitId' | 'createdAt'> = {
      patientFileId: 'patient-1',
      patientName: 'أحمد',
      amount: 100,
      type: 'interventions',
      dateKey: '2026-07-29',
    };
    const items: VisitServiceCharge[] = [
      { ...base, id: 'one', visitId: 'appointment-1', createdAt: 10 },
      { ...base, id: 'two', visitId: 'appointment-2', createdAt: 20 },
      { ...base, id: 'three', createdAt: 30 },
    ];

    expect(filterVisitServiceItems(items, 'appointment-1', '2026-07-29').map((item) => item.id))
      .toEqual(['one']);
    expect(filterVisitServiceItems(items, '', '2026-07-29').map((item) => item.id))
      .toEqual(['three']);
  });
});

