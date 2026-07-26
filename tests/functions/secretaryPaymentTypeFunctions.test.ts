import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

const registerSecretaryLoginFunctions = require(
  '../../functions/src/functions/secretaryLoginFunctions.js'
) as {
  normalizePaymentType: (value: unknown) => string;
};

describe('secretary appointment payment type normalization', () => {
  it.each([
    'cash',
    'instapay',
    'wallet',
    'bank_transfer',
    'insurance',
    'discount',
  ])('preserves the supported payment type %s', (paymentType) => {
    expect(registerSecretaryLoginFunctions.normalizePaymentType(paymentType)).toBe(paymentType);
  });

  it('falls back to cash only for an unsupported value', () => {
    expect(registerSecretaryLoginFunctions.normalizePaymentType('unsupported')).toBe('cash');
  });
});
