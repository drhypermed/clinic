type EffectiveAccountType = 'free' | 'premium' | 'pro_max';

import { parseIsoTimeMs } from './expiryTime';

type PremiumTimingLike = {
  accountType?: unknown;
  premiumStartDate?: unknown;
  premiumExpiryDate?: unknown;
  lastProExpiryDate?: unknown;
};

export const resolveEffectiveAccountTypeFromData = (
  data: PremiumTimingLike | null | undefined,
  nowMs: number,
): EffectiveAccountType => {
  // نقبل premium (= برو) و pro_max كفئات مدفوعة، أي قيمة أخرى = free.
  // Expiry بيطبق على الاتنين بنفس الطريقة — لسه ما فيش حقل expiry منفصل لبرو ماكس.
  const raw = data?.accountType;
  const paidType: 'premium' | 'pro_max' | null =
    raw === 'premium' ? 'premium' : raw === 'pro_max' ? 'pro_max' : null;
  if (!paidType) return 'free';

  const expiryMs = parseIsoTimeMs(data?.premiumExpiryDate);
  if (expiryMs !== null && nowMs >= expiryMs) {
    return 'free';
  }

  return paidType;
};

const getKnownPremiumExpiryMs = (data: PremiumTimingLike | null | undefined): number | null => {
  return parseIsoTimeMs(data?.premiumExpiryDate) ?? parseIsoTimeMs(data?.lastProExpiryDate);
};

export const getPremiumTimingSnapshot = (
  data: PremiumTimingLike | null | undefined,
  nowMs: number,
) => {
  const premiumStartMs = parseIsoTimeMs(data?.premiumStartDate);
  const premiumExpiryMs = parseIsoTimeMs(data?.premiumExpiryDate);
  const knownExpiryMs = getKnownPremiumExpiryMs(data);
  const effectiveAccountType = resolveEffectiveAccountTypeFromData(data, nowMs);
  const isExpired = knownExpiryMs !== null && nowMs >= knownExpiryMs;

  return {
    premiumStartMs,
    premiumExpiryMs,
    knownExpiryMs,
    effectiveAccountType,
    isExpired,
  };
};