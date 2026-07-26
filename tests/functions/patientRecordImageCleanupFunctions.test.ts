import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const cleanupModule = require(
  '../../functions/src/functions/patientRecordImageCleanupFunctions.js',
) as ((context: Record<string, unknown>) => {
  cleanupPatientImagesOnRecordDelete: (event: unknown) => Promise<{ deleted: number; skipped: number }>;
}) & {
  extractRecordImageIds: (recordData: unknown) => string[];
};

describe('patient record image cleanup', () => {
  it('collects and deduplicates exam and embedded-consultation image ids', () => {
    expect(cleanupModule.extractRecordImageIds({
      investigationImageIds: ['exam-1', 'shared', '', null],
      consultation: {
        investigationImageIds: ['consult-1', 'shared', 'bad/path'],
      },
    })).toEqual(['exam-1', 'shared', 'consult-1']);
  });

  it('ignores malformed record image fields', () => {
    expect(cleanupModule.extractRecordImageIds({
      investigationImageIds: 'not-an-array',
      consultation: { investigationImageIds: 12 },
    })).toEqual([]);
  });

  it('requests permanent cloud deletion for every image on a deleted record', async () => {
    const deletePatientImageById = vi.fn()
      .mockResolvedValueOnce({ deleted: true })
      .mockResolvedValueOnce({ deleted: false, reason: 'still-referenced' });
    const handler = cleanupModule({
      admin: { storage: vi.fn() },
      getDb: () => ({ name: 'db' }),
      deletePatientImageById,
    }).cleanupPatientImagesOnRecordDelete;

    const result = await handler({
      params: { userId: 'doctor-1', recordId: 'record-1' },
      data: { data: () => ({ investigationImageIds: ['image-1', 'image-2'] }) },
    });

    expect(result).toEqual({ deleted: 1, skipped: 1 });
    expect(deletePatientImageById).toHaveBeenCalledTimes(2);
    expect(deletePatientImageById).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'doctor-1',
      imageId: 'image-1',
      onlyIfUnreferenced: true,
      requireInvestigationSource: true,
    }));
  });
});
