export interface ExpiryStatus {
  expiryMs: number | null;
  hasExpiry: boolean;
  isValid: boolean;
  isExpired: boolean;
  isActive: boolean;
}

export interface RemainingTimePart {
  key: 'years' | 'months' | 'days' | 'hours' | 'minutes';
  value: number;
  label: string;
}

export const parseIsoTimeMs = (value: unknown): number | null => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return null;

  const parsedMs = Date.parse(raw);
  return Number.isFinite(parsedMs) ? parsedMs : null;
};

export const getExpiryStatus = (value: unknown, nowMs: number): ExpiryStatus => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return {
      expiryMs: null,
      hasExpiry: false,
      isValid: false,
      isExpired: false,
      isActive: false,
    };
  }

  const expiryMs = parseIsoTimeMs(raw);
  if (expiryMs === null) {
    return {
      expiryMs: null,
      hasExpiry: true,
      isValid: false,
      isExpired: false,
      isActive: false,
    };
  }

  return {
    expiryMs,
    hasExpiry: true,
    isValid: true,
    isExpired: nowMs >= expiryMs,
    isActive: nowMs < expiryMs,
  };
};

export const getRemainingTimeParts = (targetMs: number | null, nowMs: number): RemainingTimePart[] => {
  if (targetMs === null || targetMs <= nowMs) return [];

  const diffMs = targetMs - nowMs;
  let diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes <= 0) {
    return [{ key: 'minutes', value: 1, label: 'دقيقة' }];
  }

  const minutesPerHour = 60;
  const minutesPerDay = 24 * minutesPerHour;
  const minutesPerMonth = 30 * minutesPerDay;
  const minutesPerYear = 365 * minutesPerDay;

  const years = Math.floor(diffMinutes / minutesPerYear);
  diffMinutes -= years * minutesPerYear;

  const months = Math.floor(diffMinutes / minutesPerMonth);
  diffMinutes -= months * minutesPerMonth;

  const days = Math.floor(diffMinutes / minutesPerDay);
  diffMinutes -= days * minutesPerDay;

  const hours = Math.floor(diffMinutes / minutesPerHour);
  diffMinutes -= hours * minutesPerHour;

  const minutes = diffMinutes;

  const parts: RemainingTimePart[] = [
    { key: 'years', value: years, label: 'سنة' },
    { key: 'months', value: months, label: 'شهر' },
    { key: 'days', value: days, label: 'يوم' },
    { key: 'hours', value: hours, label: 'ساعة' },
    { key: 'minutes', value: minutes, label: 'دقيقة' },
  ];

  return parts.filter((part) => part.value > 0);
};

export const getExpiryInfoText = (value: unknown, nowMs: number): string => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return 'لا يوجد تاريخ انتهاء';

  const status = getExpiryStatus(raw, nowMs);
  if (!status.isValid || status.expiryMs === null) return 'تاريخ انتهاء غير صالح';
  if (status.isExpired) return 'منتهية الآن';

  const diffMs = status.expiryMs - nowMs;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'تنتهي خلال أقل من يوم';

  return `تنتهي بعد ${days} يوم`;
};