import type { PaymentType } from '../types';

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const toNonNegativeNumber = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return roundMoney(parsed);
};

const clampPercent = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return roundMoney(Math.max(0, Math.min(100, value)));
};

export interface NormalizedDiscountResult {
  basePrice: number;
  discountAmount: number;
  discountPercent: number;
  finalPrice: number;
}

export const normalizeDiscountForBasePrice = (
  basePriceInput: unknown,
  discountAmountInput?: unknown,
  discountPercentInput?: unknown,
): NormalizedDiscountResult => {
  const basePrice = toNonNegativeNumber(basePriceInput);
  if (basePrice <= 0) {
    return {
      basePrice: 0,
      discountAmount: 0,
      discountPercent: 0,
      finalPrice: 0,
    };
  }

  let discountAmount = toNonNegativeNumber(discountAmountInput);
  let discountPercent = clampPercent(Number(discountPercentInput));

  if (discountAmount > 0) {
    discountAmount = Math.min(basePrice, discountAmount);
    discountPercent = clampPercent((discountAmount / basePrice) * 100);
  } else if (discountPercent > 0) {
    discountAmount = roundMoney((basePrice * discountPercent) / 100);
    if (discountAmount > basePrice) discountAmount = basePrice;
    discountPercent = clampPercent((discountAmount / basePrice) * 100);
  } else {
    discountAmount = 0;
    discountPercent = 0;
  }

  return {
    basePrice,
    discountAmount: roundMoney(discountAmount),
    discountPercent,
    finalPrice: roundMoney(Math.max(0, basePrice - discountAmount)),
  };
};

export interface PaymentBreakdownResult {
  billedIncome: number;
  collectedCash: number;
  insuranceClaims: number;
  discountAmount: number;
}

export const computePaymentBreakdownForBasePrice = ({
  basePrice,
  paymentType,
  patientSharePercent,
  discountAmount,
  discountPercent,
}: {
  basePrice: number;
  paymentType?: PaymentType;
  patientSharePercent?: number;
  discountAmount?: number;
  discountPercent?: number;
}): PaymentBreakdownResult => {
  const normalizedBasePrice = toNonNegativeNumber(basePrice);

  if (paymentType === 'insurance') {
    const normalizedSharePercent = clampPercent(Number(patientSharePercent));
    const patientShare = roundMoney((normalizedBasePrice * normalizedSharePercent) / 100);
    const companyShare = roundMoney(Math.max(0, normalizedBasePrice - patientShare));

    return {
      billedIncome: normalizedBasePrice,
      collectedCash: roundMoney(patientShare),
      insuranceClaims: companyShare,
      discountAmount: 0,
    };
  }

  if (paymentType === 'discount') {
    const normalizedDiscount = normalizeDiscountForBasePrice(
      normalizedBasePrice,
      discountAmount,
      discountPercent,
    );

    return {
      billedIncome: normalizedDiscount.finalPrice,
      collectedCash: normalizedDiscount.finalPrice,
      insuranceClaims: 0,
      discountAmount: normalizedDiscount.discountAmount,
    };
  }

  return {
    billedIncome: normalizedBasePrice,
    collectedCash: normalizedBasePrice,
    insuranceClaims: 0,
    discountAmount: 0,
  };
};
