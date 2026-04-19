export type UsagePlan = 'free' | 'premium';

export type UsageCounterKey =
  | 'smartPrescriptionCount'
  | 'printCount'
  | 'interactionCheckerCount'
  | 'drugSearchCount'
  | 'contraIndicationsCount'
  | 'patientRecordCount';

export type UsageStatsRecord = Partial<Record<UsageCounterKey, number>>;

export interface UsageStatsByPlanRecord {
  free?: UsageStatsRecord;
  premium?: UsageStatsRecord;
}

export const USAGE_COUNTER_KEYS: readonly UsageCounterKey[] = [
  'smartPrescriptionCount',
  'printCount',
  'interactionCheckerCount',
  'drugSearchCount',
  'contraIndicationsCount',
  'patientRecordCount',
] as const;

const toNonNegativeInt = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.floor(parsed);
};

export const normalizeUsageStatsRecord = (raw: unknown): UsageStatsRecord => {
  if (!raw || typeof raw !== 'object') return {};

  const source = raw as Record<string, unknown>;
  const result: UsageStatsRecord = {};
  USAGE_COUNTER_KEYS.forEach((key) => {
    const value = toNonNegativeInt(source[key]);
    if (value > 0) {
      result[key] = value;
    }
  });

  return result;
};

export const normalizeUsageStatsByPlan = (raw: unknown): UsageStatsByPlanRecord => {
  if (!raw || typeof raw !== 'object') return {};

  const source = raw as Record<string, unknown>;
  return {
    free: normalizeUsageStatsRecord(source.free),
    premium: normalizeUsageStatsRecord(source.premium),
  };
};

export const mergeUsageStatsRecords = (
  base: UsageStatsRecord | undefined,
  addition: UsageStatsRecord | undefined,
): UsageStatsRecord => {
  const normalizedBase = normalizeUsageStatsRecord(base);
  const normalizedAddition = normalizeUsageStatsRecord(addition);

  const merged: UsageStatsRecord = { ...normalizedBase };
  USAGE_COUNTER_KEYS.forEach((key) => {
    const next = toNonNegativeInt(normalizedBase[key]) + toNonNegativeInt(normalizedAddition[key]);
    if (next > 0) {
      merged[key] = next;
    } else {
      delete merged[key];
    }
  });

  return merged;
};

export const sumUsageCounter = (record: UsageStatsRecord | undefined, key: UsageCounterKey): number =>
  toNonNegativeInt(record?.[key]);

export const splitUsageStatsByPlan = (params: {
  accountType?: unknown;
  usageStats?: unknown;
  usageStatsByPlan?: unknown;
}): { free: UsageStatsRecord; premium: UsageStatsRecord } => {
  const currentPlan: UsagePlan = params.accountType === 'premium' ? 'premium' : 'free';
  const usageStats = normalizeUsageStatsRecord(params.usageStats);
  const byPlan = normalizeUsageStatsByPlan(params.usageStatsByPlan);

  const free = normalizeUsageStatsRecord(byPlan.free);
  const premium = normalizeUsageStatsRecord(byPlan.premium);

  USAGE_COUNTER_KEYS.forEach((key) => {
    const accounted = toNonNegativeInt(free[key]) + toNonNegativeInt(premium[key]);
    const currentTotal = toNonNegativeInt(usageStats[key]);

    if (accounted === 0 && currentTotal > 0) {
      if (currentPlan === 'premium') premium[key] = currentTotal;
      else free[key] = currentTotal;
      return;
    }

    if (currentTotal > accounted) {
      const delta = currentTotal - accounted;
      if (currentPlan === 'premium') {
        premium[key] = toNonNegativeInt(premium[key]) + delta;
      } else {
        free[key] = toNonNegativeInt(free[key]) + delta;
      }
    }
  });

  return {
    free,
    premium,
  };
};

export const buildUsageStatsForPlanSwitch = (params: {
  currentPlan: UsagePlan;
  targetPlan: UsagePlan;
  usageStats?: unknown;
  usageStatsByPlan?: unknown;
}): {
  usageStatsByPlan: UsageStatsByPlanRecord;
  resetUsageStats: UsageStatsRecord;
} => {
  const currentUsage = normalizeUsageStatsRecord(params.usageStats);
  const normalizedByPlan = normalizeUsageStatsByPlan(params.usageStatsByPlan);

  if (params.currentPlan === params.targetPlan) {
    return {
      usageStatsByPlan: normalizedByPlan,
      resetUsageStats: currentUsage,
    };
  }

  const nextByPlan: UsageStatsByPlanRecord = {
    free: normalizeUsageStatsRecord(normalizedByPlan.free),
    premium: normalizeUsageStatsRecord(normalizedByPlan.premium),
  };

  const currentBucket = params.currentPlan === 'premium' ? nextByPlan.premium : nextByPlan.free;
  const mergedCurrentBucket = mergeUsageStatsRecords(currentBucket, currentUsage);

  if (params.currentPlan === 'premium') {
    nextByPlan.premium = mergedCurrentBucket;
  } else {
    nextByPlan.free = mergedCurrentBucket;
  }

  if (params.targetPlan === 'premium') {
    nextByPlan.premium = normalizeUsageStatsRecord(nextByPlan.premium);
  } else {
    nextByPlan.free = normalizeUsageStatsRecord(nextByPlan.free);
  }

  return {
    usageStatsByPlan: nextByPlan,
    resetUsageStats: {},
  };
};
