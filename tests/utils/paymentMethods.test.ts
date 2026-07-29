import { describe, expect, it } from 'vitest';
import { computePaymentBreakdownForBasePrice } from '../../utils/paymentDiscount';
import {
  addToDirectPaymentTotals,
  createEmptyDirectPaymentTotals,
  getPaymentMethodLabel,
  normalizePaymentType,
  summarizeDirectRevenueByMethod,
} from '../../utils/paymentMethods';

describe('electronic payment methods', () => {
  it.each(['instapay', 'wallet', 'bank_transfer'] as const)(
    'treats %s exactly like cash in the financial breakdown',
    (paymentType) => {
      expect(computePaymentBreakdownForBasePrice({ basePrice: 350, paymentType })).toEqual({
        billedIncome: 350,
        collectedCash: 350,
        insuranceClaims: 0,
        discountAmount: 0,
      });
    },
  );

  it('keeps a separate direct-payment total for every method', () => {
    const totals = createEmptyDirectPaymentTotals();
    addToDirectPaymentTotals(totals, 'cash', 100);
    addToDirectPaymentTotals(totals, 'instapay', 200);
    addToDirectPaymentTotals(totals, 'wallet', 300);
    addToDirectPaymentTotals(totals, 'bank_transfer', 400);

    expect(totals).toEqual({ cash: 100, instapay: 200, wallet: 300, bank_transfer: 400 });
  });

  it('preserves legacy behavior for missing and unknown values', () => {
    expect(normalizePaymentType(undefined)).toBe('cash');
    expect(normalizePaymentType('unknown')).toBe('cash');
    expect(getPaymentMethodLabel('instapay')).toBe('إنستا باي');
    expect(getPaymentMethodLabel('wallet')).toBe('محفظة إلكترونية');
    expect(getPaymentMethodLabel('bank_transfer')).toBe('حساب بنكي');
  });

  it('attributes legacy unclassified revenue to cash', () => {
    expect(summarizeDirectRevenueByMethod(500, [])).toEqual({
      cash: 500,
      instapay: 0,
      wallet: 0,
      bank_transfer: 0,
    });
  });

  it('never lets stale item rows exceed the accounting total', () => {
    expect(summarizeDirectRevenueByMethod(500, [
      { paymentType: 'wallet', amount: 400 },
      { paymentType: 'instapay', amount: 400 },
    ])).toEqual({
      cash: 0,
      instapay: 100,
      wallet: 400,
      bank_transfer: 0,
    });
  });
});
