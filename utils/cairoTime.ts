const DEFAULT_DISPLAY_LOCALE = 'ar-EG-u-nu-latn';
const PARTS_LOCALE = 'en-CA';

const CAIRO_TIME_ZONE = 'Africa/Cairo';

type CairoDateInput = Date | string | number;

interface CairoDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const buildPartsFormatter = (timeZone?: string) => new Intl.DateTimeFormat(PARTS_LOCALE, {
  ...(timeZone ? { timeZone } : {}),
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  hourCycle: 'h23',
});

const cairoPartsFormatter = buildPartsFormatter(CAIRO_TIME_ZONE);
const userPartsFormatter = buildPartsFormatter();

const toDate = (value: CairoDateInput): Date => (value instanceof Date ? new Date(value.getTime()) : new Date(value));

const readPart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number => {
  const value = parts.find((part) => part.type === type)?.value || '0';
  return Number.parseInt(value, 10) || 0;
};

export const getCairoDateParts = (value: CairoDateInput = new Date()): CairoDateParts => {
  const date = toDate(value);
  const parts = cairoPartsFormatter.formatToParts(date);
  return {
    year: readPart(parts, 'year'),
    month: readPart(parts, 'month'),
    day: readPart(parts, 'day'),
    hour: readPart(parts, 'hour'),
    minute: readPart(parts, 'minute'),
    second: readPart(parts, 'second'),
  };
};

const getUserDateParts = (value: CairoDateInput = new Date()): CairoDateParts => {
  const date = toDate(value);
  const parts = userPartsFormatter.formatToParts(date);
  return {
    year: readPart(parts, 'year'),
    month: readPart(parts, 'month'),
    day: readPart(parts, 'day'),
    hour: readPart(parts, 'hour'),
    minute: readPart(parts, 'minute'),
    second: readPart(parts, 'second'),
  };
};

export const getCairoDayKey = (value: CairoDateInput = new Date()): string => {
  const parts = getCairoDateParts(value);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
};

export const getCairoCurrentTimeMin = (value: CairoDateInput = new Date()): string => {
  const parts = getCairoDateParts(value);
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
};

export const getUserHour = (value: CairoDateInput = new Date()): number => getUserDateParts(value).hour;

const formatInTimeZone = (
  value: CairoDateInput,
  options: Intl.DateTimeFormatOptions,
  locale = DEFAULT_DISPLAY_LOCALE,
  timeZone?: string,
): string => {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, timeZone ? { ...options, timeZone } : options);
};

const formatInUserTimeZone = (
  value: CairoDateInput,
  options: Intl.DateTimeFormatOptions,
  locale = DEFAULT_DISPLAY_LOCALE,
): string => formatInTimeZone(value, options, locale);

export const formatUserDate = (
  value: CairoDateInput,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' },
  locale = DEFAULT_DISPLAY_LOCALE,
): string => formatInUserTimeZone(value, options, locale);

export const formatUserTime = (
  value: CairoDateInput,
  options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true },
  locale = DEFAULT_DISPLAY_LOCALE,
): string => formatInUserTimeZone(value, options, locale);

export const formatUserDateTime = (
  value: CairoDateInput,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
  locale = DEFAULT_DISPLAY_LOCALE,
): string => formatInUserTimeZone(value, options, locale);

const parseDateInput = (dateStr: string) => {
  const [year, month, day] = String(dateStr || '').split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) return null;
  return { year, month, day };
};

const parseTimeInput = (timeStr: string) => {
  const [hourRaw, minuteRaw, secondRaw] = String(timeStr || '').split(':');
  const hour = Number(hourRaw || 0);
  const minute = Number(minuteRaw || 0);
  const second = Number(secondRaw || 0);
  if (![hour, minute, second].every(Number.isFinite)) return null;
  return { hour, minute, second };
};

export const buildCairoDateTime = (dateStr: string, timeStr: string): Date => {
  const dateParts = parseDateInput(dateStr);
  const timeParts = parseTimeInput(timeStr);

  if (!dateParts || !timeParts) return new Date(NaN);

  const desiredUtcLike = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hour,
    timeParts.minute,
    timeParts.second,
    0,
  );

  let guessUtc = desiredUtcLike;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actualParts = getCairoDateParts(new Date(guessUtc));
    const actualUtcLike = Date.UTC(
      actualParts.year,
      actualParts.month - 1,
      actualParts.day,
      actualParts.hour,
      actualParts.minute,
      actualParts.second,
      0,
    );
    const diff = desiredUtcLike - actualUtcLike;
    if (diff === 0) break;
    guessUtc += diff;
  }

  return new Date(guessUtc);
};

export const buildCairoDateWithCurrentTime = (dateStr: string, reference: CairoDateInput = new Date()): Date => {
  const parts = getCairoDateParts(reference);
  return buildCairoDateTime(
    dateStr,
    `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}:${String(parts.second).padStart(2, '0')}`,
  );
};