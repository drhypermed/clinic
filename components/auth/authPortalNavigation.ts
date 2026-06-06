import type { NavigateFunction } from 'react-router-dom';
import { getHostMode } from '../../utils/hostMode';

const DOCTOR_LOGIN_PATH = '/login/doctor';
const PUBLIC_LOGIN_PATH = '/login/public';
const CLINIC_LOGIN_ORIGIN = 'https://clinic.drhypermed.com';
const PUBLIC_LOGIN_ORIGIN = 'https://www.drhypermed.com';

type PortalTarget =
  | { kind: 'internal'; path: string }
  | { kind: 'external'; url: string };

const isLocalDevelopmentHost = (hostname: string): boolean => {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('.local')
  );
};

const resolveLocalSiblingOrigin = (target: 'clinic' | 'public'): string => {
  if (typeof window === 'undefined') return '';

  const { protocol, hostname, port } = window.location;
  if (!isLocalDevelopmentHost(hostname)) return '';

  if (target === 'clinic' && port === '5173') return `${protocol}//${hostname}:5174`;
  if (target === 'public' && port === '5174') return `${protocol}//${hostname}:5173`;

  return '';
};

export const resolveDoctorLoginTarget = (): PortalTarget => {
  if (getHostMode() !== 'patient') return { kind: 'internal', path: DOCTOR_LOGIN_PATH };

  const localOrigin = resolveLocalSiblingOrigin('clinic');
  return {
    kind: 'external',
    url: `${localOrigin || CLINIC_LOGIN_ORIGIN}${DOCTOR_LOGIN_PATH}`,
  };
};

export const resolvePublicLoginTarget = (): PortalTarget => {
  if (getHostMode() !== 'clinic') return { kind: 'internal', path: PUBLIC_LOGIN_PATH };

  const localOrigin = resolveLocalSiblingOrigin('public');
  return {
    kind: 'external',
    url: `${localOrigin || PUBLIC_LOGIN_ORIGIN}${PUBLIC_LOGIN_PATH}`,
  };
};

const goToPortalTarget = (
  target: PortalTarget,
  navigate: NavigateFunction,
  options: { replace?: boolean } = {},
) => {
  if (target.kind === 'external' && typeof window !== 'undefined') {
    window.location.replace(target.url);
    return;
  }

  if (target.kind === 'internal') {
    navigate(target.path, { replace: options.replace ?? true });
  }
};

export const navigateToDoctorLogin = (
  navigate: NavigateFunction,
  options?: { replace?: boolean },
) => {
  goToPortalTarget(resolveDoctorLoginTarget(), navigate, options);
};

export const navigateToPublicLogin = (
  navigate: NavigateFunction,
  options?: { replace?: boolean },
) => {
  goToPortalTarget(resolvePublicLoginTarget(), navigate, options);
};
