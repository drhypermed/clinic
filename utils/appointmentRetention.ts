import type { ClinicAppointment } from '../types';
import { isAppointmentPending } from './appointmentStatus';

/** Keep an uncompleted appointment for a full day after its scheduled time. */
export const PENDING_APPOINTMENT_RETENTION_MS = 24 * 60 * 60 * 1000;

type RetentionAppointment = Pick<
  ClinicAppointment,
  'dateTime' | 'appointmentStatus' | 'examCompletedAt'
>;

export const getPendingAppointmentExpiryMs = (
  appointment: RetentionAppointment,
): number | null => {
  if (!isAppointmentPending(appointment)) return null;
  const appointmentMs = Date.parse(appointment.dateTime);
  if (!Number.isFinite(appointmentMs)) return null;
  return appointmentMs + PENDING_APPOINTMENT_RETENTION_MS;
};

/** Invalid dates are retained so a malformed value can never trigger destructive cleanup. */
export const isPendingAppointmentExpired = (
  appointment: RetentionAppointment,
  nowMs: number = Date.now(),
): boolean => {
  const expiryMs = getPendingAppointmentExpiryMs(appointment);
  return expiryMs !== null && expiryMs <= nowMs;
};

const toLocalDayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * The secretary's "today" queue also contains a missed pending appointment
 * from a previous day while it is still inside its 24-hour grace period.
 */
export const isPendingAppointmentInSecretaryTodayQueue = (
  appointment: RetentionAppointment,
  currentDayKey: string,
  nowMs: number = Date.now(),
): boolean => {
  if (!isAppointmentPending(appointment) || isPendingAppointmentExpired(appointment, nowMs)) {
    return false;
  }

  const appointmentDate = new Date(appointment.dateTime);
  if (Number.isNaN(appointmentDate.getTime())) return false;
  return toLocalDayKey(appointmentDate) <= currentDayKey;
};
