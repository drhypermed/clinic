import { buildCairoDateTime, getCairoDateParts, getCairoDayKey } from './cairoTime';

export const DEFAULT_CLINIC_DAY_CUTOFF_MINUTES = 6 * 60;
export const MIN_CLINIC_DAY_CUTOFF_MINUTES = 0;
export const MAX_CLINIC_DAY_CUTOFF_MINUTES = (24 * 60) - 1;

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeClinicDayCutoffMinutes = (
  value: unknown,
  fallback = DEFAULT_CLINIC_DAY_CUTOFF_MINUTES,
): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(
    MAX_CLINIC_DAY_CUTOFF_MINUTES,
    Math.max(MIN_CLINIC_DAY_CUTOFF_MINUTES, Math.round(parsed)),
  );
};

export const isClinicDayKey = (value: unknown): value is string =>
  DAY_KEY_PATTERN.test(String(value || '').trim());

const previousCalendarDayKey = (dayKey: string): string => {
  const [year, month, day] = dayKey.split('-').map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day) - 86_400_000);
  return [
    previous.getUTCFullYear(),
    String(previous.getUTCMonth() + 1).padStart(2, '0'),
    String(previous.getUTCDate()).padStart(2, '0'),
  ].join('-');
};

/**
 * Returns the operational clinic day in Cairo.
 * Example with a 06:00 cutoff: 2026-07-29 02:30 belongs to 2026-07-28.
 */
export const getClinicDayKey = (
  value: Date | string | number = new Date(),
  cutoffMinutes: unknown = DEFAULT_CLINIC_DAY_CUTOFF_MINUTES,
): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const normalizedCutoff = normalizeClinicDayCutoffMinutes(cutoffMinutes);
  const parts = getCairoDateParts(date);
  const calendarDayKey = getCairoDayKey(date);
  const cairoMinuteOfDay = (parts.hour * 60) + parts.minute;
  return cairoMinuteOfDay < normalizedCutoff
    ? previousCalendarDayKey(calendarDayKey)
    : calendarDayKey;
};

/**
 * Stored keys win so changing the branch cutoff affects future records only.
 * Legacy records intentionally keep their old calendar-day grouping.
 */
export const resolveStoredClinicDayKey = (
  storedKey: unknown,
  occurredAt: Date | string | number,
): string => (
  isClinicDayKey(storedKey)
    ? String(storedKey).trim()
    : getCairoDayKey(occurredAt)
);

export const clinicDayKeyToDate = (dayKey: string): Date =>
  buildCairoDateTime(dayKey, '12:00:00');

export const clinicCutoffMinutesToTimeInput = (value: unknown): string => {
  const minutes = normalizeClinicDayCutoffMinutes(value);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};

export const clinicTimeInputToCutoffMinutes = (
  value: string,
  fallback = DEFAULT_CLINIC_DAY_CUTOFF_MINUTES,
): number => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim());
  if (!match) return fallback;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return fallback;
  return (hour * 60) + minute;
};

export const formatClinicCutoffArabic = (value: unknown): string => {
  const minutes = normalizeClinicDayCutoffMinutes(value);
  const date = buildCairoDateTime('2026-01-15', clinicCutoffMinutesToTimeInput(minutes));
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    timeZone: 'Africa/Cairo',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const getMillisecondsUntilClinicDayChange = (
  now: Date | number = new Date(),
  cutoffMinutes: unknown = DEFAULT_CLINIC_DAY_CUTOFF_MINUTES,
): number => {
  const date = now instanceof Date ? now : new Date(now);
  const parts = getCairoDateParts(date);
  const normalizedCutoff = normalizeClinicDayCutoffMinutes(cutoffMinutes);
  const cutoffHour = Math.floor(normalizedCutoff / 60);
  const cutoffMinute = normalizedCutoff % 60;
  const todayKey = getCairoDayKey(date);
  let boundary = buildCairoDateTime(
    todayKey,
    `${String(cutoffHour).padStart(2, '0')}:${String(cutoffMinute).padStart(2, '0')}:00`,
  );
  if (
    parts.hour > cutoffHour
    || (parts.hour === cutoffHour && parts.minute >= cutoffMinute)
  ) {
    const [year, month, day] = todayKey.split('-').map(Number);
    const tomorrow = new Date(Date.UTC(year, month - 1, day) + 86_400_000);
    const tomorrowKey = [
      tomorrow.getUTCFullYear(),
      String(tomorrow.getUTCMonth() + 1).padStart(2, '0'),
      String(tomorrow.getUTCDate()).padStart(2, '0'),
    ].join('-');
    boundary = buildCairoDateTime(
      tomorrowKey,
      `${String(cutoffHour).padStart(2, '0')}:${String(cutoffMinute).padStart(2, '0')}:00`,
    );
  }
  return Math.max(1_000, boundary.getTime() - date.getTime() + 250);
};
