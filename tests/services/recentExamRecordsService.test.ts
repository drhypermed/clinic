import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreMocks = vi.hoisted(() => ({
  collection: vi.fn(() => ({ path: 'records' })),
  getDocs: vi.fn(),
  limit: vi.fn((value: number) => ({ type: 'limit', value })),
  orderBy: vi.fn((field: string, direction: string) => ({ type: 'orderBy', field, direction })),
  query: vi.fn((...constraints: unknown[]) => ({ constraints })),
  startAfter: vi.fn((cursor: unknown) => ({ type: 'startAfter', cursor })),
  where: vi.fn((field: string, operator: string, value: unknown) => ({
    type: 'where',
    field,
    operator,
    value,
  })),
}));

vi.mock('firebase/firestore', () => firestoreMocks);

import { listRecentExamRecordsForDoctor } from '../../services/recentExamRecordsService';

const buildSnapshot = (start: number, count: number) => {
  const docs = Array.from({ length: count }, (_, index) => {
    const recordNumber = start + index;
    return {
      id: `record-${recordNumber}`,
      data: () => ({
        patientName: `Patient ${recordNumber}`,
        branchId: 'main',
        date: '2026-07-20T10:00:00.000Z',
        isConsultationOnly: false,
      }),
    };
  });
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
  };
};

describe('listRecentExamRecordsForDoctor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('continues after the first 300 records and returns every recent record', async () => {
    firestoreMocks.getDocs
      .mockResolvedValueOnce(buildSnapshot(1, 300))
      .mockResolvedValueOnce(buildSnapshot(301, 2));

    const result = await listRecentExamRecordsForDoctor('doctor-1', 'main');

    expect(result).toHaveLength(302);
    expect(result.at(-1)?.id).toBe('record-302');
    expect(firestoreMocks.getDocs).toHaveBeenCalledTimes(2);
    expect(firestoreMocks.startAfter).toHaveBeenCalledTimes(1);
  });
});
