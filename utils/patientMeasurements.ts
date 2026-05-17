const DEFAULT_WEIGHT_REUSE_MONTHS = 3;

const parseValidDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isWeightFreshForVisit = (
  measuredAtValue?: string | null,
  visitDateValue?: string | null,
  maxAgeMonths = DEFAULT_WEIGHT_REUSE_MONTHS,
): boolean => {
  const measuredAt = parseValidDate(measuredAtValue);
  if (!measuredAt) return false;

  const visitDate = parseValidDate(visitDateValue) || new Date();
  const expiresAt = new Date(measuredAt.getTime());
  expiresAt.setMonth(expiresAt.getMonth() + maxAgeMonths);

  return visitDate.getTime() <= expiresAt.getTime();
};

export const getReusableWeightForVisit = (
  weight: unknown,
  measuredAtValue?: string | null,
  visitDateValue?: string | null,
): string => {
  const cleanWeight = String(weight || '').trim();
  if (!cleanWeight) return '';
  return isWeightFreshForVisit(measuredAtValue, visitDateValue) ? cleanWeight : '';
};
