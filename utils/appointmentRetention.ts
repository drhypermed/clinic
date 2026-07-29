import type { ClinicAppointment } from '../types';
import { isAppointmentPending } from './appointmentStatus';
import { getClinicDayKey } from './clinicWorkday';

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

/**
 * The secretary's "today" queue also contains a missed pending appointment
 * from a previous day while it is still inside its 24-hour grace period.
 */
export const isPendingAppointmentInSecretaryTodayQueue = (
  appointment: RetentionAppointment,
  currentDayKey: string,
  nowMs: number = Date.now(),
  clinicDayCutoffMinutes: number = 0,
): boolean => {
  if (!isAppointmentPending(appointment) || isPendingAppointmentExpired(appointment, nowMs)) {
    return false;
  }

  const appointmentDayKey = getClinicDayKey(
    appointment.dateTime,
    clinicDayCutoffMinutes,
  );
  return Boolean(appointmentDayKey) && appointmentDayKey <= currentDayKey;
};
