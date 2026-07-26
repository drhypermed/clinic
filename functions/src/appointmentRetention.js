const PENDING_APPOINTMENT_RETENTION_MS = 24 * 60 * 60 * 1000;

const getPendingAppointmentCutoffMs = (nowMs = Date.now()) =>
  nowMs - PENDING_APPOINTMENT_RETENTION_MS;

const getPendingAppointmentCutoffIso = (nowMs = Date.now()) =>
  new Date(getPendingAppointmentCutoffMs(nowMs)).toISOString();

const isPendingAppointmentExpired = (dateTime, nowMs = Date.now()) => {
  const appointmentMs = Date.parse(String(dateTime || ''));
  return Number.isFinite(appointmentMs)
    && appointmentMs <= getPendingAppointmentCutoffMs(nowMs);
};

module.exports = {
  PENDING_APPOINTMENT_RETENTION_MS,
  getPendingAppointmentCutoffMs,
  getPendingAppointmentCutoffIso,
  isPendingAppointmentExpired,
};
