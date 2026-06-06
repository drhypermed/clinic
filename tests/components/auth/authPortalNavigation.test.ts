import { beforeEach, describe, expect, it } from 'vitest';
import {
  resolveDoctorLoginTarget,
  resolvePublicLoginTarget,
} from '../../../components/auth/authPortalNavigation';

describe('auth portal navigation targets', () => {
  beforeEach(() => {
    localStorage.removeItem('__hostMode_override');
  });

  it('sends patient-host users to the clinic doctor login origin', () => {
    localStorage.setItem('__hostMode_override', 'patient');

    expect(resolveDoctorLoginTarget()).toEqual({
      kind: 'external',
      url: 'https://clinic.drhypermed.com/login/doctor',
    });
  });

  it('sends clinic-host users to the public login origin', () => {
    localStorage.setItem('__hostMode_override', 'clinic');

    expect(resolvePublicLoginTarget()).toEqual({
      kind: 'external',
      url: 'https://www.drhypermed.com/login/public',
    });
  });

  it('keeps matching portal navigation inside the current app', () => {
    localStorage.setItem('__hostMode_override', 'clinic');
    expect(resolveDoctorLoginTarget()).toEqual({ kind: 'internal', path: '/login/doctor' });

    localStorage.setItem('__hostMode_override', 'patient');
    expect(resolvePublicLoginTarget()).toEqual({ kind: 'internal', path: '/login/public' });
  });
});
