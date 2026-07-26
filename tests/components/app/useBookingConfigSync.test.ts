import { describe, expect, it } from 'vitest';
import type { ClinicAppointment } from '../../../types';
import { isPendingAppointmentInSecretaryTodayQueue } from '../../../utils/appointmentRetention';

const appointment = (overrides: Partial<ClinicAppointment> = {}): ClinicAppointment => ({
  id: 'appointment-1',
  patientName: 'Test Patient',
  phone: '01000000000',
  dateTime: '2026-07-20T23:00:00+03:00',
  appointmentStatus: 'pending',
  ...overrides,
});

describe('secretary today queue retention', () => {
  it('includes a pending appointment from yesterday until its 24-hour deadline', () => {
    expect(isPendingAppointmentInSecretaryTodayQueue(
      appointment(),
      '2026-07-21',
      Date.parse('2026-07-21T12:00:00+03:00'),
    )).toBe(true);
  });

  it('excludes the appointment after 24 hours and completed appointments immediately', () => {
    expect(isPendingAppointmentInSecretaryTodayQueue(
      appointment(),
      '2026-07-21',
      Date.parse('2026-07-21T23:00:00+03:00'),
    )).toBe(false);
    expect(isPendingAppointmentInSecretaryTodayQueue(
      appointment({ appointmentStatus: 'completed' }),
      '2026-07-21',
      Date.parse('2026-07-21T00:30:00+03:00'),
    )).toBe(false);
  });

  it('keeps an in-progress appointment pending, but does not move a future day into today', () => {
    expect(isPendingAppointmentInSecretaryTodayQueue(
      appointment({ appointmentStatus: 'in_progress' }),
      '2026-07-21',
      Date.parse('2026-07-21T00:30:00+03:00'),
    )).toBe(true);
    expect(isPendingAppointmentInSecretaryTodayQueue(
      appointment({ dateTime: '2026-07-22T10:00:00+03:00' }),
      '2026-07-21',
      Date.parse('2026-07-21T12:00:00+03:00'),
    )).toBe(false);
  });

  it('does not put an invalid appointment date in the visible queue', () => {
    expect(isPendingAppointmentInSecretaryTodayQueue(
      appointment({ dateTime: 'invalid-date' }),
      '2026-07-21',
      Date.parse('2026-07-21T12:00:00+03:00'),
    )).toBe(false);
  });
});
