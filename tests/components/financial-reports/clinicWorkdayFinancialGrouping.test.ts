import { describe, expect, it } from 'vitest';
import type { PatientRecord } from '../../../types';
import { buildVisitFinancialByDate } from '../../../components/financial-reports/hooks/useFinancialStats/buildVisitFinancialByDate';

describe('financial grouping by clinic workday', () => {
  it('groups a saved after-midnight exam by its immutable clinic day key', () => {
    const record = {
      id: 'record-1',
      patientName: 'Patient',
      date: '2026-08-01T02:00:00+03:00',
      clinicDayKey: '2026-07-31',
      clinicDayCutoffMinutes: 360,
      serviceBasePrice: 200,
      paymentType: 'cash',
    } as PatientRecord;

    const july = buildVisitFinancialByDate({
      records: [record],
      consultationVisits: [],
      selectedMonthKey: '2026-07',
      resolveBasePriceByDate: {
        exam: () => 0,
        consultation: () => 0,
      },
    });
    const august = buildVisitFinancialByDate({
      records: [record],
      consultationVisits: [],
      selectedMonthKey: '2026-08',
      resolveBasePriceByDate: {
        exam: () => 0,
        consultation: () => 0,
      },
    });

    expect(july['2026-07-31']).toEqual(expect.objectContaining({
      examsIncome: 200,
      collectedCash: 200,
    }));
    expect(august).toEqual({});
  });
});
