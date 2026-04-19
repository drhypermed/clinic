export type EffectiveAccountType = 'free' | 'premium';

import { parseIsoTimeMs } from './expiryTime';

type PremiumTimingLike = {
  accountType?: unknown;
  premiumStartDate?: unknown;
  premiumExpiryDate?: unknown;
  lastPremiumExpiryDate?: unknown;
};

export const resolveEffectiveAccountTypeFromData = (
  data: PremiumTimingLike | null | undefined,
  nowMs: number,
): EffectiveAccountType => {
  const rawType = data?.accountType === 'premium' ? 'premium' : 'free';
  if (rawType !== 'premium') return 'free';

  const expiryMs = parseIsoTimeMs(data?.premiumExpiryDate);
  if (expiryMs !== null && nowMs >= expiryMs) {
    return 'free';
  }

  return 'premium';
};

export const getKnownPremiumExpiryMs = (data: PremiumTimingLike | null | undefined): number | null => {
  return parseIsoTimeMs(data?.premiumExpiryDate) ?? parseIsoTimeMs(data?.lastPremiumExpiryDate);
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