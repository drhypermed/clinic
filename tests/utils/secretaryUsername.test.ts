import { describe, expect, it } from 'vitest';
import {
  getSecretaryUsernameValidationMessage,
  isValidSecretaryUsername,
  normalizeSecretaryUsername,
} from '../../utils/secretaryUsername';

describe('secretary username', () => {
  it('normalizes spaces and case consistently', () => {
    expect(normalizeSecretaryUsername('  Clinic.Nasr-1  ')).toBe('clinic.nasr-1');
  });

  it.each(['clinic1', 'clinic.nasr', 'branch_02', 'alex-branch'])(
    'accepts a valid username: %s',
    (username) => {
      expect(isValidSecretaryUsername(username)).toBe(true);
      expect(getSecretaryUsernameValidationMessage(username)).toBe('');
    }
  );

  it.each(['abc', '.clinic', 'clinic.', 'clinic name', 'عيادة', 'admin', 'doctor@mail.com'])(
    'rejects an invalid or reserved username: %s',
    (username) => {
      expect(isValidSecretaryUsername(username)).toBe(false);
      expect(getSecretaryUsernameValidationMessage(username)).not.toBe('');
    }
  );
});
