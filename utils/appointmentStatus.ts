import type { ClinicAppointment } from '../types';

export const isAppointmentCompleted = (
  appointment: Pick<ClinicAppointment, 'appointmentStatus' | 'examCompletedAt'>,
): boolean =>
  appointment.appointmentStatus === 'completed' || Boolean(appointment.examCompletedAt);

export const isAppointmentPending = (
  appointment: Pick<ClinicAppointment, 'appointmentStatus' | 'examCompletedAt'>,
): boolean => !isAppointmentCompleted(appointment);

