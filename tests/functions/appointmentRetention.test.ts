import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const retention = require('../../functions/src/appointmentRetention.js') as {
  PENDING_APPOINTMENT_RETENTION_MS: number;
  getPendingAppointmentCutoffIso: (nowMs: number) => string;
  isPendingAppointmentExpired: (dateTime: unknown, nowMs: number) => boolean;
};

describe('Cloud Functions pending appointment retention', () => {
  const appointmentDateTime = '2026-07-20T23:00:00+03:00';
  const appointmentMs = Date.parse(appointmentDateTime);

  it('uses the same 24-hour boundary as the client', () => {
    expect(retention.PENDING_APPOINTMENT_RETENTION_MS).toBe(24 * 60 * 60 * 1000);
    expect(retention.isPendingAppointmentExpired(
      appointmentDateTime,
      appointmentMs + retention.PENDING_APPOINTMENT_RETENTION_MS - 1,
    )).toBe(false);
    expect(retention.isPendingAppointmentExpired(
      appointmentDateTime,
      appointmentMs + retention.PENDING_APPOINTMENT_RETENTION_MS,
    )).toBe(true);
  });

  it('builds the cleanup cutoff from exactly 24 hours ago', () => {
    const nowMs = Date.parse('2026-07-21T23:00:00+03:00');
    expect(retention.getPendingAppointmentCutoffIso(nowMs)).toBe(
      new Date(nowMs - retention.PENDING_APPOINTMENT_RETENTION_MS).toISOString(),
    );
  });

  it('does not expire malformed dates', () => {
    expect(retention.isPendingAppointmentExpired('invalid', Date.now())).toBe(false);
  });
});
