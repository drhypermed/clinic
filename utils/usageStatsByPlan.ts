// 3 فئات: free = مجاني | premium = برو | pro_max = برو ماكس
export type UsagePlan = 'free' | 'premium' | 'pro_max';

type UsageCounterKey =
  | 'smartPrescriptionCount'
  | 'printCount'
  | 'interactionCheckerCount'
  | 'drugSearchCount'
  | 'contraIndicationsCount'
  | 'patientRecordCount';

type UsageStatsRecord = Partial<Record<UsageCounterKey, number>>;

interface UsageStatsByPlanRecord {
  free?: UsageStatsRecord;
  premium?: UsageStatsRecord;
  pro_max?: UsageStatsRecord;
}

const USAGE_COUNTER_KEYS: readonly UsageCounterKey[] = [
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
    pro_max: normalizeUsageStatsRecord(source.pro_max),
  };
};

const mergeUsageStatsRecords = (
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
    pro_max: normalizeUsageStatsRecord(normalizedByPlan.pro_max),
  };

  // ندمج الاستخدام الحالي في bucket الـ currentPlan قبل التحويل
  const getBucket = (plan: UsagePlan): UsageStatsRecord | undefined => nextByPlan[plan];
  const setBucket = (plan: UsagePlan, value: UsageStatsRecord) => {
    nextByPlan[plan] = value;
  };

  const mergedCurrentBucket = mergeUsageStatsRecords(getBucket(params.currentPlan), currentUsage);
  setBucket(params.currentPlan, mergedCurrentBucket);

  // نتأكد إن bucket الـ targetPlan منظّف
  setBucket(params.targetPlan, normalizeUsageStatsRecord(getBucket(params.targetPlan)));

  return {
    usageStatsByPlan: nextByPlan,
    resetUsageStats: {},
  };
};
