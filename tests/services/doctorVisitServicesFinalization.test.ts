import { beforeEach, describe, expect, it, vi } from 'vitest';

type StoredDocument = Record<string, unknown>;

const firestoreState = vi.hoisted(() => ({
  documents: new Map<string, StoredDocument>(),
}));

const serviceMocks = vi.hoisted(() => ({
  loadCostsFromFirestore: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, ...segments: string[]) => ({
    path: segments.join('/'),
  }),
  onSnapshot: vi.fn(),
  runTransaction: async (
    _db: unknown,
    callback: (transaction: {
      get: (ref: { path: string }) => Promise<{
        exists: () => boolean;
        data: () => StoredDocument;
      }>;
      set: (
        ref: { path: string },
        data: StoredDocument,
        options?: { merge?: boolean },
      ) => void;
    }) => Promise<number>,
  ) => callback({
    get: async (ref) => ({
      exists: () => firestoreState.documents.has(ref.path),
      data: () => firestoreState.documents.get(ref.path) || {},
    }),
    set: (ref, data, options) => {
      const previous = firestoreState.documents.get(ref.path) || {};
      firestoreState.documents.set(
        ref.path,
        options?.merge ? { ...previous, ...data } : data,
      );
    },
  }),
}));

vi.mock('../../services/firebaseConfig', () => ({ db: {} }));

vi.mock('../../services/patientCostService', () => ({
  loadCostsFromFirestore: serviceMocks.loadCostsFromFirestore,
}));

vi.mock('../../services/patient-files/patientFileReference', () => ({
  ensurePatientFileReference: vi.fn(),
}));

import { finalizePendingVisitServices } from '../../services/visit-services/doctorVisitServicesService';

describe('finalize pending visit services', () => {
  beforeEach(() => {
    firestoreState.documents.clear();
    serviceMocks.loadCostsFromFirestore.mockReset();
  });

  it('posts a pending service once and removes it from the pending list', async () => {
    const patientPath = 'users/doctor-1/patientFileData/patient-1';
    const dailyPath = 'users/doctor-1/financialData/daily/entries/2026-07-29';
    const appointmentPath = 'users/doctor-1/appointments/apt-1';
    const pendingItem = {
      id: 'service-1',
      patientFileId: 'patient-1',
      patientName: 'أحمد',
      amount: 250,
      type: 'interventions',
      dateKey: '2026-07-29',
      visitId: 'apt-1',
      branchId: 'main',
      financialStatus: 'pending',
      createdAt: 1,
    };

    firestoreState.documents.set(patientPath, {
      pendingCostItems: [pendingItem],
      costItems: [],
    });
    firestoreState.documents.set(dailyPath, { cashCostItems: [] });
    firestoreState.documents.set(appointmentPath, { patientName: 'أحمد' });

    const input = {
      userId: 'doctor-1',
      patientFileId: 'patient-1',
      visitId: 'apt-1',
      appointmentId: 'apt-1',
      branchId: 'main',
      recordId: 'record-1',
    };

    await expect(finalizePendingVisitServices(input)).resolves.toBe(1);
    await expect(finalizePendingVisitServices(input)).resolves.toBe(0);

    expect(firestoreState.documents.get(patientPath)).toEqual(expect.objectContaining({
      pendingCostItems: [],
      costItems: [
        expect.objectContaining({
          id: 'service-1',
          financialStatus: 'posted',
          recordId: 'record-1',
          postedAt: expect.any(Number),
        }),
      ],
    }));
    expect(firestoreState.documents.get(dailyPath)).toEqual(expect.objectContaining({
      interventionsRevenue: 250,
      otherRevenue: 0,
      cashCostItems: [expect.objectContaining({ id: 'service-1' })],
    }));
    expect(firestoreState.documents.get(appointmentPath)).toEqual(expect.objectContaining({
      serviceChargesCount: 1,
      serviceChargesTotal: 250,
      serviceChargesStatus: 'posted',
      recordId: 'record-1',
    }));
    expect(serviceMocks.loadCostsFromFirestore).toHaveBeenCalledTimes(1);
  });
});
