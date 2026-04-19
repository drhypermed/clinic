import { getExpiryInfoText, getExpiryStatus } from './expiryTime';

type BannerTimingLike = {
  imageUrl?: string;
  isActive?: boolean;
  expiresAt?: string;
};

export const toDateTimeLocalInputValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '';

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

export const toStoredBannerExpiryValue = (value: unknown): string => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';

  const parsedDate = new Date(raw);
  return Number.isFinite(parsedDate.getTime()) ? parsedDate.toISOString() : '';
};

export const isBannerItemCurrentlyActive = (
  item: BannerTimingLike | null | undefined,
  nowMs: number,
): boolean => {
  if (!item?.imageUrl || item.isActive === false) return false;

  const expiryStatus = getExpiryStatus(item.expiresAt, nowMs);
  return !expiryStatus.hasExpiry || !expiryStatus.isValid || !expiryStatus.isExpired;
};

export const filterActiveBannerItems = <T extends BannerTimingLike>(items: T[], nowMs: number): T[] => {
  return items.filter((item) => isBannerItemCurrentlyActive(item, nowMs));
};

export const getBannerExpiryInfoText = (expiresAt: unknown, nowMs: number): string => {
  return getExpiryInfoText(expiresAt, nowMs);
};