import { describe, expect, it } from 'vitest';

type NormalizedDraftService = {
  name: string;
  normalizedName: string;
  amount: number;
  type: 'interventions' | 'other';
  paymentType: 'cash' | 'instapay' | 'wallet' | 'bank_transfer';
  saveAsTemplate: boolean;
};

const { createAppointmentWithVisitServices, normalizeDraftServices } = require(
  '../../functions/src/functions/secretaryBookingVisitServices',
) as {
  createAppointmentWithVisitServices: (input: Record<string, unknown>) => Promise<string>;
  normalizeDraftServices: (
    value: unknown,
    ErrorType: typeof FakeHttpsError,
  ) => NormalizedDraftService[];
};

class FakeHttpsError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

describe('secretary booking visit services', () => {
  it('normalizes only the allowed service fields before saving the appointment', () => {
    const result = normalizeDraftServices([
      {
        id: 'client-only-id',
        name: '  رسم   قلب  ',
        amount: '250',
        type: 'interventions',
        paymentType: 'instapay',
        saveAsTemplate: true,
        visitId: 'forged-visit',
        addedByRole: 'doctor',
      },
    ], FakeHttpsError);

    expect(result).toEqual([
      {
        name: 'رسم قلب',
        normalizedName: 'رسم قلب',
        amount: 250,
        type: 'interventions',
        paymentType: 'instapay',
        saveAsTemplate: true,
      },
    ]);
  });

  it('rejects invalid prices and more than 20 services', () => {
    expect(() => normalizeDraftServices(
      [{ name: 'خدمة', amount: 0 }],
      FakeHttpsError,
    )).toThrow('INVALID_VISIT_SERVICE');

    expect(() => normalizeDraftServices(
      Array.from({ length: 21 }, () => ({ name: 'خدمة', amount: 10 })),
      FakeHttpsError,
    )).toThrow('INVALID_VISIT_SERVICES');
  });

  it('keeps booking services pending and does not write a financial daily report', async () => {
    const writes: Array<{
      path: string;
      data: Record<string, unknown>;
      options?: Record<string, unknown>;
    }> = [];

    const makeRef = (path: string) => ({
      path,
      id: path.split('/').at(-1) || '',
      collection(name: string) {
        return makeRef(`${path}/${name}`);
      },
      doc(id = 'appointment-1') {
        return makeRef(`${path}/${id}`);
      },
      async set(data: Record<string, unknown>) {
        writes.push({ path, data });
      },
    });

    const db = {
      collection: (name: string) => makeRef(name),
      runTransaction: async (
        callback: (transaction: {
          get: (ref: { path: string }) => Promise<{
            exists: boolean;
            data: () => Record<string, unknown>;
          }>;
          set: (
            ref: { path: string },
            data: Record<string, unknown>,
            options?: Record<string, unknown>,
          ) => void;
        }) => Promise<void>,
      ) => callback({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: (ref, data, options) => writes.push({ path: ref.path, data, options }),
      }),
    };

    const appointmentId = await createAppointmentWithVisitServices({
      db,
      HttpsError: FakeHttpsError,
      getCairoDateKey: () => '2026-07-29',
      userId: 'doctor-1',
      branchId: 'main',
      appointmentData: { patientName: 'أحمد علي', date: '2026-07-29' },
      appointmentDate: new Date('2026-07-29T10:00:00Z'),
      patientName: 'أحمد علي',
      secretaryName: 'منى',
      draftServices: [{
        name: 'رسم قلب',
        amount: 250,
        type: 'interventions',
        paymentType: 'cash',
      }],
    });

    expect(appointmentId).toBe('appointment-1');
    expect(writes.some((write) => write.path.includes('/daily'))).toBe(false);

    const patientWrite = writes.find((write) => write.path.includes('/patientFileData/'));
    expect(patientWrite?.data).not.toHaveProperty('costItems');
    expect(patientWrite?.data.pendingCostItems).toEqual([
      expect.objectContaining({
        visitId: 'appointment-1',
        serviceName: 'رسم قلب',
        amount: 250,
        financialStatus: 'pending',
      }),
    ]);

    const appointmentWrite = writes.find((write) =>
      write.path.endsWith('/appointments/appointment-1'));
    expect(appointmentWrite?.data).toEqual(expect.objectContaining({
      serviceChargesCount: 1,
      serviceChargesTotal: 250,
      serviceChargesStatus: 'pending',
    }));
  });
});
