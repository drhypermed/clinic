import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const maintenance = require('../../functions/src/functions/maintenanceSchedulerFunctions.js') as {
  getBackupStepForDate: (input: {
    backups: {
      scheduledClinicalFirestoreExport: () => Promise<unknown>;
      scheduledFullFirestoreExport: () => Promise<unknown>;
    };
    date: Date;
  }) => [string, () => Promise<unknown>];
  runMaintenanceSteps: (
    steps: Array<[string, () => Promise<unknown>]>,
    logPrefix: string,
  ) => Promise<{ ok: boolean; completed: number }>;
};

describe('merged maintenance scheduler', () => {
  it('runs steps sequentially', async () => {
    const order: string[] = [];
    const result = await maintenance.runMaintenanceSteps([
      ['first', async () => { order.push('first'); }],
      ['second', async () => { order.push('second'); }],
    ], '[test]');

    expect(order).toEqual(['first', 'second']);
    expect(result).toMatchObject({ ok: true, completed: 2 });
  });

  it('continues after a failed step and reports the aggregate failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const order: string[] = [];

    await expect(maintenance.runMaintenanceSteps([
      ['first', async () => { order.push('first'); }],
      ['broken', async () => { order.push('broken'); throw new Error('boom'); }],
      ['last', async () => { order.push('last'); }],
    ], '[test]')).rejects.toThrow('1/3 step(s) failed: broken');

    expect(order).toEqual(['first', 'broken', 'last']);
    errorSpy.mockRestore();
  });

  it('uses one full export on Cairo Sunday and clinical exports on other days', () => {
    const clinical = async () => undefined;
    const full = async () => undefined;
    const backups = {
      scheduledClinicalFirestoreExport: clinical,
      scheduledFullFirestoreExport: full,
    };

    expect(maintenance.getBackupStepForDate({
      backups,
      date: new Date('2026-07-18T23:30:00.000Z'), // Sunday 02:30 in Cairo
    })).toEqual(['scheduledFullFirestoreExport', full]);
    expect(maintenance.getBackupStepForDate({
      backups,
      date: new Date('2026-07-19T23:30:00.000Z'), // Monday 02:30 in Cairo
    })).toEqual(['scheduledClinicalFirestoreExport', clinical]);
  });
});
