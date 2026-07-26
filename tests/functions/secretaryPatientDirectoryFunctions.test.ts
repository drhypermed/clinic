import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const directory = require(
  '../../functions/src/functions/secretaryPatientDirectoryFunctions.js',
) as {
  normalizePhoneSearchKey: (value: unknown) => string;
  buildNameSearchPrefixes: (value: unknown) => string[];
  buildDirectoryPatientDocId: (value: unknown) => string;
  buildDirectoryIdentityKey: (name: unknown, phoneKeys?: unknown[]) => string;
  buildRecordContribution: (value: Record<string, unknown>) => Record<string, any> | null;
  buildAllSummaries: (records: Array<Record<string, unknown>>) => Map<string, Record<string, any>>;
  serializeSummary: (summary: Record<string, any>, timestamp: unknown) => Record<string, any>;
};

describe('secretary patient directory normalization', () => {
  it('maps Egyptian local and international phone formats to one key', () => {
    expect(directory.normalizePhoneSearchKey('0101 234 5678')).toBe('01012345678');
    expect(directory.normalizePhoneSearchKey('+20 101 234 5678')).toBe('01012345678');
    expect(directory.normalizePhoneSearchKey('0020-101-234-5678')).toBe('01012345678');
    expect(directory.normalizePhoneSearchKey('1012345678')).toBe('01012345678');
  });

  it('indexes prefixes from the full name and every name token', () => {
    const prefixes = directory.buildNameSearchPrefixes('Ahmed Mohamed Ali');
    expect(prefixes).toEqual(expect.arrayContaining(['ah', 'ahmed', 'mo', 'moh', 'ali']));
  });

  it('indexes Arabic spelling variants under the same normalized prefixes', () => {
    const prefixes = directory.buildNameSearchPrefixes('أميرة مصطفى');
    expect(prefixes).toEqual(expect.arrayContaining(['ام', 'اميره', 'مصطفي']));
  });

  it('encodes unsafe document-id characters', () => {
    expect(directory.buildDirectoryPatientDocId('patient/name')).toBe('patient%2Fname');
  });
});

describe('secretary patient directory aggregation', () => {
  it('keeps branches isolated and aggregates exam/consultation metadata', () => {
    const summaries = directory.buildAllSummaries([
      {
        patientFileNameKey: 'ahmed ali',
        patientName: 'Ahmed Ali',
        branchId: 'main',
        phone: '+20 101 234 5678',
        date: '2026-07-01T10:00:00.000Z',
        patientFileNumber: 12,
      },
      {
        patientFileNameKey: 'ahmed ali',
        patientName: 'Ahmed Ali',
        branchId: 'main',
        phone: '01012345678',
        date: '2026-07-05T10:00:00.000Z',
        isConsultationOnly: true,
      },
      {
        patientFileNameKey: 'ahmed ali',
        patientName: 'Ahmed Ali',
        branchId: 'branch-b',
        phone: '01012345678',
        date: '2026-07-07T10:00:00.000Z',
      },
    ]);

    expect(summaries.size).toBe(2);
    const identityKey = directory.buildDirectoryIdentityKey('ahmed ali', ['01012345678']);
    const main = summaries.get(`main|${identityKey}`);
    const branchB = summaries.get(`branch-b|${identityKey}`);
    expect(main).toMatchObject({
      branchId: 'main',
      totalExams: 1,
      totalConsultations: 1,
      patientFileNumber: 12,
      lastExamDate: '2026-07-01T10:00:00.000Z',
      lastConsultationDate: '2026-07-05T10:00:00.000Z',
    });
    expect(Array.from(main?.phoneSearchKeys || [])).toEqual(['01012345678']);
    expect(branchB).toMatchObject({
      branchId: 'branch-b',
      totalExams: 1,
      totalConsultations: 0,
    });
  });

  it('keeps patients with the same normalized name separated by phone identity', () => {
    const summaries = directory.buildAllSummaries([
      {
        patientFileNameKey: 'mohamed ali',
        patientName: 'Mohamed Ali',
        branchId: 'main',
        phone: '01011111111',
        date: '2026-07-01T10:00:00.000Z',
      },
      {
        patientFileNameKey: 'mohamed ali',
        patientName: 'Mohamed Ali',
        branchId: 'main',
        phone: '01122222222',
        date: '2026-07-02T10:00:00.000Z',
      },
    ]);

    expect(summaries.size).toBe(2);
  });

  it('serializes only compact searchable identity data', () => {
    const contribution = directory.buildRecordContribution({
      patientFileNameKey: 'sara hassan',
      patientName: 'Sara Hassan',
      branchId: 'main',
      phone: '01111111111',
      date: '2026-07-10T09:00:00.000Z',
      age: { years: 30, months: 0, days: 0 },
      dateOfBirth: '1996-01-01',
      gender: 'female',
    });
    const summaries = directory.buildAllSummaries([{
      patientFileNameKey: 'sara hassan',
      patientName: 'Sara Hassan',
      branchId: 'main',
      phone: '01111111111',
      date: '2026-07-10T09:00:00.000Z',
      age: { years: 30 },
      dateOfBirth: '1996-01-01',
      gender: 'female',
    }]);
    expect(contribution).not.toBeNull();
    const identityKey = directory.buildDirectoryIdentityKey('sara hassan', ['01111111111']);
    const serialized = directory.serializeSummary(summaries.get(`main|${identityKey}`)!, 'timestamp');
    expect(serialized).toMatchObject({
      patientName: 'Sara Hassan',
      branchId: 'main',
      age: '30 سنة',
      dateOfBirth: '1996-01-01',
      gender: 'female',
      phoneSearchKeys: ['01111111111'],
      updatedAt: 'timestamp',
    });
    expect(serialized).not.toHaveProperty('visits');
  });
});
