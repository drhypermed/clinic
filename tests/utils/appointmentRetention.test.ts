import { describe, expect, it } from 'vitest';
import {
  PENDING_APPOINTMENT_RETENTION_MS,
  getPendingAppointmentExpiryMs,
  isPendingAppointmentExpired,
  isPendingAppointmentInSecretaryTodayQueue,
} from '../../utils/appointmentRetention';

const pendingAppointment = {
  dateTime: '2026-07-20T23:00:00+03:00',
  appointmentStatus: 'pending' as const,
};

describe('pending appointment 24-hour retention', () => {
  it('keeps an 11 PM appointment visible after midnight', () => {
    const afterMidnight = Date.parse('2026-07-21T00:30:00+03:00');
    expect(isPendingAppointmentExpired(pendingAppointment, afterMidnight)).toBe(false);
  });

  it('expires only after a full 24 hours from the scheduled time', () => {
    const appointmentMs = Date.parse(pendingAppointment.dateTime);
    expect(getPendingAppointmentExpiryMs(pendingAppointment)).toBe(
      appointmentMs + PENDING_APPOINTMENT_RETENTION_MS,
    );
    expect(isPendingAppointmentExpired(
      pendingAppointment,
      appointmentMs + PENDING_APPOINTMENT_RETENTION_MS - 1,
    )).toBe(false);
    expect(isPendingAppointmentExpired(
      pendingAppointment,
      appointmentMs + PENDING_APPOINTMENT_RETENTION_MS,
    )).toBe(true);
  });

  it('never expires a completed appointment through the pending cleanup rule', () => {
    expect(isPendingAppointmentExpired({
      ...pendingAppointment,
      appointmentStatus: 'completed',
      examCompletedAt: '2026-07-20T23:30:00+03:00',
    }, Date.parse('2026-08-01T00:00:00+03:00'))).toBe(false);
  });

  it('retains malformed dates instead of deleting data destructively', () => {
    expect(isPendingAppointmentExpired({
      ...pendingAppointment,
      dateTime: 'invalid-date',
    }, Date.now())).toBe(false);
  });

  it('uses the same configured workday in the secretary queue', () => {
    const afterMidnightAppointment = {
      ...pendingAppointment,
      dateTime: '2026-07-29T02:00:00+03:00',
    };
    expect(isPendingAppointmentInSecretaryTodayQueue(
      afterMidnightAppointment,
      '2026-07-28',
      Date.parse('2026-07-29T02:30:00+03:00'),
      360,
    )).toBe(true);
  });
});
