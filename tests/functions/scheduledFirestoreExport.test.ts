import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const backups = require('../../functions/src/functions/scheduledFirestoreExport.js') as {
  CLINICAL_COLLECTION_IDS: readonly string[];
  buildExportRequestBody: (input: {
    bucketName: string;
    exportPath: string;
    collectionIds?: readonly string[] | null;
  }) => { outputUriPrefix: string; collectionIds?: readonly string[] };
};

describe('cost-aware Firestore backups', () => {
  it('exports critical clinical and account collection groups every day', () => {
    expect(backups.CLINICAL_COLLECTION_IDS).toEqual(expect.arrayContaining([
      'users',
      'records',
      'appointments',
      'financialData',
      'usageMonthly',
    ]));
    expect(backups.CLINICAL_COLLECTION_IDS).not.toEqual(expect.arrayContaining([
      'guideline_books',
      'guideline_chunks',
      'guideline_chunk_search',
    ]));
  });

  it('adds collection filters only to the daily clinical export', () => {
    const clinical = backups.buildExportRequestBody({
      bucketName: 'clinic.appspot.com',
      exportPath: 'firestore-backups/clinical-daily/2026-07-18',
      collectionIds: backups.CLINICAL_COLLECTION_IDS,
    });
    expect(clinical.outputUriPrefix).toBe(
      'gs://clinic.appspot.com/firestore-backups/clinical-daily/2026-07-18',
    );
    expect(clinical.collectionIds).toBe(backups.CLINICAL_COLLECTION_IDS);

    const full = backups.buildExportRequestBody({
      bucketName: 'clinic.appspot.com',
      exportPath: 'firestore-backups/full-weekly/2026-07-19',
      collectionIds: null,
    });
    expect(full).not.toHaveProperty('collectionIds');
  });
});
