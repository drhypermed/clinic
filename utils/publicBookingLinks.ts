import type { PublicBookingBranchLinkInput } from './publicBookingBranchResolution';

export {
  resolvePublicBookingBranchForLink,
  type PublicBookingBranchLinkInput,
} from './publicBookingBranchResolution';

const PUBLIC_BOOKING_PRODUCTION_ORIGIN = 'https://www.drhypermed.com';

const isLocalDevelopmentHost = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.endsWith('.local')
  );
};

export const getPublicBookingOrigin = (currentLocation?: Pick<Location, 'origin' | 'hostname'>): string => {
  const locationLike =
    currentLocation || (typeof window !== 'undefined' ? window.location : undefined);

  if (!locationLike) return PUBLIC_BOOKING_PRODUCTION_ORIGIN;

  const hostname = String(locationLike.hostname || '').toLowerCase();
  if (isLocalDevelopmentHost(hostname)) return locationLike.origin;

  return PUBLIC_BOOKING_PRODUCTION_ORIGIN;
};

export const buildPublicBookingUrl = (
  slugOrUserId: string,
  currentLocation?: Pick<Location, 'origin' | 'hostname'>,
): string => {
  const origin = getPublicBookingOrigin(currentLocation);
  const encodedValue = encodeURIComponent(String(slugOrUserId || '').trim());
  return `${origin}/p/${encodedValue}`;
};

export const appendBranchToPublicBookingUrl = (
  baseLink: string,
  branch: PublicBookingBranchLinkInput,
  currentLocation?: Pick<Location, 'origin' | 'hostname'>,
): string => {
  const branchId = String(branch.id || '').trim();
  if (!branchId) return baseLink;

  try {
    const fallbackOrigin =
      currentLocation?.origin ||
      (typeof window !== 'undefined' ? window.location.origin : PUBLIC_BOOKING_PRODUCTION_ORIGIN);
    const url = new URL(baseLink, fallbackOrigin);
    url.searchParams.set('branch', branchId);
    url.searchParams.delete('branchName');
    url.searchParams.delete('entry');
    url.searchParams.delete('source');

    const isRelativeInput = /^\/(?!\/)/.test(baseLink);
    return isRelativeInput ? `${url.pathname}${url.search}${url.hash}` : url.toString();
  } catch {
    const params = new URLSearchParams();
    params.set('branch', branchId);
    return `${baseLink}${baseLink.includes('?') ? '&' : '?'}${params.toString()}`;
  }
};
