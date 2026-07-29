import type { PaymentType } from '../types';

export type DirectPaymentType = Extract<
  PaymentType,
  'cash' | 'instapay' | 'wallet' | 'bank_transfer'
>;

export interface DirectPaymentTotals {
  cash: number;
  instapay: number;
  wallet: number;
  bank_transfer: number;
}

export const DIRECT_PAYMENT_TYPES: readonly DirectPaymentType[] = [
  'cash',
  'instapay',
  'wallet',
  'bank_transfer',
];

export const PAYMENT_TYPES: readonly PaymentType[] = [
  ...DIRECT_PAYMENT_TYPES,
  'insurance',
  'discount',
];

export const isPaymentType = (value: unknown): value is PaymentType =>
  typeof value === 'string' && PAYMENT_TYPES.includes(value as PaymentType);

export const isDirectPaymentType = (value: unknown): value is DirectPaymentType =>
  typeof value === 'string' && DIRECT_PAYMENT_TYPES.includes(value as DirectPaymentType);

export const normalizePaymentType = (value: unknown): PaymentType =>
  isPaymentType(value) ? value : 'cash';

export const getPaymentMethodLabel = (value: unknown): string => {
  switch (normalizePaymentType(value)) {
    case 'instapay': return 'إنستا باي';
    case 'wallet': return 'محفظة إلكترونية';
    case 'bank_transfer': return 'حساب بنكي';
    case 'insurance': return 'تأمين';
    case 'discount': return 'خصم';
    default: return 'كاش';
  }
};

export const getPaymentMethodShortLabel = (value: unknown): string => {
  switch (normalizePaymentType(value)) {
    case 'wallet': return 'محفظة';
    case 'bank_transfer': return 'بنكي';
    default: return getPaymentMethodLabel(value);
  }
};

export const createEmptyDirectPaymentTotals = (): DirectPaymentTotals => ({
  cash: 0,
  instapay: 0,
  wallet: 0,
  bank_transfer: 0,
});

/**
 * التأمين والخصم كانا يُعاملان تاريخياً كتحصيل نقدي للمريض، لذلك يظلان
 * داخل خانة الكاش في التفصيل حتى لا تتغير أرقام السجلات القديمة.
 */
export const resolveDirectPaymentBucket = (value: unknown): DirectPaymentType =>
  isDirectPaymentType(value) ? value : 'cash';

export const addToDirectPaymentTotals = (
  totals: DirectPaymentTotals,
  paymentType: unknown,
  amountInput: unknown,
): void => {
  const amount = Number(amountInput);
  if (!Number.isFinite(amount) || amount <= 0) return;
  totals[resolveDirectPaymentBucket(paymentType)] += amount;
};

export const sumDirectPaymentTotals = (totals: DirectPaymentTotals): number =>
  DIRECT_PAYMENT_TYPES.reduce((sum, type) => sum + (Number(totals[type]) || 0), 0);

/**
 * يوزّع إجمالي دخل يدوي (تداخلات/دخل آخر) على طرق الدفع المحفوظة في عناصره.
 *
 * بعض البيانات القديمة تحفظ الإجمالي فقط بدون عناصر تفصيلية؛ المتبقي يُنسب
 * للكاش للحفاظ على التوافق. كما نحدّ التوزيع بالإجمالي نفسه حتى لا تجعل عناصر
 * قديمة أو مكررة مجموع طرق الدفع أكبر من الدخل المحاسبي.
 */
export const summarizeDirectRevenueByMethod = (
  totalAmountInput: unknown,
  rawItems: unknown,
): DirectPaymentTotals => {
  const totals = createEmptyDirectPaymentTotals();
  const parsedTotal = Number(totalAmountInput);
  let remaining = Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : 0;
  const items = Array.isArray(rawItems) ? rawItems : [];

  for (const item of items) {
    if (remaining <= 0) break;
    if (!item || typeof item !== 'object') continue;
    const amount = Number((item as { amount?: unknown }).amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const allocatedAmount = Math.min(amount, remaining);
    addToDirectPaymentTotals(
      totals,
      (item as { paymentType?: unknown }).paymentType,
      allocatedAmount,
    );
    remaining -= allocatedAmount;
  }

  if (remaining > 0) totals.cash += remaining;
  return totals;
};
