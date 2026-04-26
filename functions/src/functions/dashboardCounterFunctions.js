const COUNTER_FIELDS = [
  'totalDoctors',
  'pendingDoctors',
  'approvedDoctors',
  'rejectedDoctors',
  'totalPatients',
  'freeDocsCount',
  'premiumDocsCount',
  'proMaxDocsCount',
  'totalSmartRxFree',
  'totalSmartRxPro',
  'totalSmartRxProMax',
  'totalPrintsFree',
  'totalPrintsPro',
  'totalPrintsProMax',
  'totalRevenue',
  'monthlyPlansCount',
  'sixMonthsPlansCount',
  'yearlyPlansCount',
  'proMaxMonthlyPlansCount',
  'proMaxSixMonthsPlansCount',
  'proMaxYearlyPlansCount',
];

const COUNTER_BASELINE_DOC_ID = 'adminDashboardStatsBaseline';
const SUMMARY_DOC_ID = 'adminDashboardStats';
const SHARDS_COLLECTION = 'adminDashboardStatsShards';
const USER_STATE_COLLECTION = 'adminDashboardUserCounterState';
const DEFAULT_SHARD_COUNT = 256;

const toNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const getShardCount = () => {
  const parsed = Number.parseInt(String(process.env.ADMIN_DASHBOARD_SHARD_COUNT || ''), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_SHARD_COUNT;
  return Math.max(32, Math.min(1024, parsed));
};

const createZeroCounters = () => ({
  totalDoctors: 0,
  pendingDoctors: 0,
  approvedDoctors: 0,
  rejectedDoctors: 0,
  totalPatients: 0,
  freeDocsCount: 0,
  premiumDocsCount: 0,
  proMaxDocsCount: 0,
  totalSmartRxFree: 0,
  totalSmartRxPro: 0,
  totalSmartRxProMax: 0,
  totalPrintsFree: 0,
  totalPrintsPro: 0,
  totalPrintsProMax: 0,
  totalRevenue: 0,
  monthlyPlansCount: 0,
  sixMonthsPlansCount: 0,
  yearlyPlansCount: 0,
  proMaxMonthlyPlansCount: 0,
  proMaxSixMonthsPlansCount: 0,
  proMaxYearlyPlansCount: 0,
});

const normalizeCounterSet = (raw) => {
  const normalized = createZeroCounters();
  COUNTER_FIELDS.forEach((field) => {
    normalized[field] = toNumber(raw?.[field]);
  });
  return normalized;
};

const subtractCounters = (nextCounters, prevCounters) => {
  const delta = createZeroCounters();
  COUNTER_FIELDS.forEach((field) => {
    delta[field] = toNumber(nextCounters?.[field]) - toNumber(prevCounters?.[field]);
  });
  return delta;
};

const sumCounters = (a, b) => {
  const result = createZeroCounters();
  COUNTER_FIELDS.forEach((field) => {
    result[field] = toNumber(a?.[field]) + toNumber(b?.[field]);
  });
  return result;
};

const hasCounterDelta = (delta) => COUNTER_FIELDS.some((field) => Math.abs(toNumber(delta?.[field])) > 0);

const normalizeUsageCounters = (raw) => ({
  smartPrescriptionCount: toNumber(raw?.smartPrescriptionCount),
  printCount: toNumber(raw?.printCount),
});

const getUsageByPlan = (userData) => {
  const usageStatsByPlan = userData && typeof userData.usageStatsByPlan === 'object'
    ? userData.usageStatsByPlan
    : {};

  let freeUsage = normalizeUsageCounters(usageStatsByPlan?.free);
  let premiumUsage = normalizeUsageCounters(usageStatsByPlan?.premium);
  let proMaxUsage = normalizeUsageCounters(usageStatsByPlan?.pro_max);

  const hasPlanUsage =
    freeUsage.smartPrescriptionCount > 0 ||
    freeUsage.printCount > 0 ||
    premiumUsage.smartPrescriptionCount > 0 ||
    premiumUsage.printCount > 0 ||
    proMaxUsage.smartPrescriptionCount > 0 ||
    proMaxUsage.printCount > 0;

  if (!hasPlanUsage) {
    const fallbackUsage = normalizeUsageCounters(userData?.usageStats || {});
    const accountType = String(userData?.accountType || '').trim().toLowerCase();
    // كل فئة لها bucket منفصل: free / premium / pro_max
    if (accountType === 'pro_max') {
      proMaxUsage = fallbackUsage;
    } else if (accountType === 'premium') {
      premiumUsage = fallbackUsage;
    } else {
      freeUsage = fallbackUsage;
    }
  }

  return { freeUsage, premiumUsage, proMaxUsage };
};

const normalizeVerificationStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'approved') return 'approved';
  if (normalized === 'rejected') return 'rejected';
  return 'submitted';
};

/**
 * حساب إيراد الاشتراك حسب المدة + الفئة.
 * pro_max بياخد من monthPrices.proMax* (لو موجود)، وإلا fallback لأسعار برو.
 */
const getSubscriptionPlanRevenue = ({ monthPrices, startDate, endDate, tier }) => {
  if (!monthPrices) return 0;

  const rawMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();
  const diffMonths = endDate.getDate() >= startDate.getDate() ? rawMonths : rawMonths - 1;

  const isProMax = tier === 'pro_max';

  if (diffMonths >= 12) {
    return isProMax
      ? toNumber(monthPrices?.proMaxYearly ?? monthPrices?.yearly)
      : toNumber(monthPrices?.yearly);
  }
  if (diffMonths >= 6) {
    return isProMax
      ? toNumber(monthPrices?.proMaxSixMonths ?? monthPrices?.sixMonths)
      : toNumber(monthPrices?.sixMonths);
  }
  return isProMax
    ? toNumber(monthPrices?.proMaxMonthly ?? monthPrices?.monthly)
    : toNumber(monthPrices?.monthly);
};

const getSubscriptionPlanBucket = ({ startDate, endDate }) => {
  const rawMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();
  const diffMonths = endDate.getDate() >= startDate.getDate() ? rawMonths : rawMonths - 1;

  if (diffMonths >= 12) return 'yearly';
  if (diffMonths >= 6) return 'sixMonths';
  return 'monthly';
};

/**
 * حساب مساهمة الإيراد التراكمي لطبيب — يجمع كل entries في subscriptionHistory
 * اللي بتقع في السنة الحالية، مع ترجيح pricePaid المحفوظ في الـ entry لو متاح.
 *
 * المخرج بقى تجميعي (مش entry واحد):
 *   - revenue: مجموع كل اشتراكات السنة
 *   - revenueByBucket: { monthly, sixMonths, yearly } لعدد كل نوع
 *   - planBucket: للـ legacy (آخر اشتراك)
 *
 * بعد إصلاح "السعر التاريخي": كل entry بيحمل سعره الفعلي وقت العملية.
 */
const buildDoctorRevenueContribution = async ({ userData, currentYear, getMonthPrices }) => {
  const empty = {
    revenue: 0,
    planBucket: null,
    bucketCounts: { monthly: 0, sixMonths: 0, yearly: 0 },
  };
  if (!userData) return empty;

  const accountType = String(userData?.accountType || '').trim().toLowerCase();
  const history = Array.isArray(userData?.subscriptionHistory) ? userData.subscriptionHistory : [];
  const hasHistoricalEntries = history.length > 0;

  // حتى لو رجع free، اشتراكاته القديمة في السنة الحالية تتحسب
  if (
    accountType !== 'premium' &&
    accountType !== 'pro_max' &&
    !hasHistoricalEntries
  ) {
    return empty;
  }

  const doctorTier = accountType === 'pro_max' ? 'pro_max' : 'premium';

  // المسار الجديد: subscriptionHistory مع pricePaid
  if (hasHistoricalEntries) {
    let totalRevenue = 0;
    const bucketCounts = { monthly: 0, sixMonths: 0, yearly: 0 };
    let lastBucket = null;

    for (const entry of history) {
      if (!entry?.startDate) continue;
      const entryStart = new Date(entry.startDate);
      if (!Number.isFinite(entryStart.getTime())) continue;
      if (entryStart.getFullYear() !== currentYear) continue;

      const entryEnd = entry?.endDate ? new Date(entry.endDate) : null;
      const validEnd = entryEnd && Number.isFinite(entryEnd.getTime()) ? entryEnd : entryStart;

      const tier = entry.tier || doctorTier;
      let bucket = entry.planType;
      if (!bucket || !['monthly', 'sixMonths', 'yearly'].includes(bucket)) {
        bucket = getSubscriptionPlanBucket({ startDate: entryStart, endDate: validEnd });
      }

      // أولوية ١: pricePaid محفوظ في الـ entry
      let entryRevenue = 0;
      if (Number.isFinite(Number(entry.pricePaid)) && Number(entry.pricePaid) > 0) {
        entryRevenue = Number(entry.pricePaid);
      } else {
        // أولوية ٢: حساب من جدول الأسعار (للـ entries القديمة قبل الإصلاح)
        const monthId = `${entryStart.getFullYear()}-${String(entryStart.getMonth() + 1).padStart(2, '0')}`;
        const monthPrices = await getMonthPrices(monthId);
        entryRevenue = getSubscriptionPlanRevenue({
          monthPrices,
          startDate: entryStart,
          endDate: validEnd,
          tier,
        });
      }

      if (entryRevenue > 0) {
        totalRevenue += entryRevenue;
        bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
        lastBucket = bucket;
      }
    }

    return {
      revenue: totalRevenue,
      planBucket: lastBucket,
      bucketCounts,
    };
  }

  // المسار القديم (Backward-compat): طبيب بدون subscriptionHistory
  if (!userData?.premiumStartDate || !userData?.premiumExpiryDate) return empty;

  const startDate = new Date(userData.premiumStartDate);
  const endDate = new Date(userData.premiumExpiryDate);
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) return empty;
  if (startDate.getFullYear() !== currentYear) return empty;

  const monthId = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  const monthPrices = await getMonthPrices(monthId);
  const bucket = getSubscriptionPlanBucket({ startDate, endDate });
  const revenue = getSubscriptionPlanRevenue({ monthPrices, startDate, endDate, tier: accountType });
  const bucketCounts = { monthly: 0, sixMonths: 0, yearly: 0 };
  if (revenue > 0) {
    bucketCounts[bucket] = 1;
  }
  return {
    revenue,
    planBucket: bucket,
    bucketCounts,
  };
};

const buildContributionFromUser = async ({ userData, currentYear, getMonthPrices }) => {
  const counters = createZeroCounters();
  if (!userData) return counters;

  const authRole = String(userData?.authRole || '').trim().toLowerCase();
  if (authRole === 'public') {
    counters.totalPatients = 1;
    return counters;
  }
  if (authRole !== 'doctor') return counters;

  counters.totalDoctors = 1;

  // نستخدم الحالة الخام بدلاً من normalize حتى لا نعتبر الحقل المفقود = pending.
  // الوثائق بدون حقل verificationStatus (مثلاً حسابات Load Test أو بيانات تالفة)
  // لن تُحسب ضمن أي فئة (pending/approved/rejected)، لكنها تبقى ضمن totalDoctors.
  const rawVerificationStatus = String(userData?.verificationStatus || '').trim().toLowerCase();
  if (rawVerificationStatus === 'approved') counters.approvedDoctors = 1;
  else if (rawVerificationStatus === 'rejected') counters.rejectedDoctors = 1;
  else if (rawVerificationStatus === 'submitted' || rawVerificationStatus === 'pending') counters.pendingDoctors = 1;

  const accountType = String(userData?.accountType || '').trim().toLowerCase();
  // كل فئة في bucket منفصل
  if (accountType === 'pro_max') {
    counters.proMaxDocsCount = 1;
  } else if (accountType === 'premium') {
    counters.premiumDocsCount = 1;
  } else {
    counters.freeDocsCount = 1;
  }

  const usage = getUsageByPlan(userData);
  counters.totalSmartRxFree = usage.freeUsage.smartPrescriptionCount;
  counters.totalSmartRxPro = usage.premiumUsage.smartPrescriptionCount;
  counters.totalSmartRxProMax = usage.proMaxUsage.smartPrescriptionCount;
  counters.totalPrintsFree = usage.freeUsage.printCount;
  counters.totalPrintsPro = usage.premiumUsage.printCount;
  counters.totalPrintsProMax = usage.proMaxUsage.printCount;
  const revenueContribution = await buildDoctorRevenueContribution({ userData, currentYear, getMonthPrices });
  counters.totalRevenue = revenueContribution.revenue;
  // عدادات الباقات: نستخدم bucketCounts (مجموع عمليات السنة) بدل planBucket واحد.
  // ده يحسب طبيب جدد ٣ مرات في السنة كـ ٣ عمليات، مش واحدة.
  const bc = revenueContribution.bucketCounts || { monthly: 0, sixMonths: 0, yearly: 0 };
  if (accountType === 'pro_max') {
    counters.proMaxYearlyPlansCount = bc.yearly || 0;
    counters.proMaxSixMonthsPlansCount = bc.sixMonths || 0;
    counters.proMaxMonthlyPlansCount = bc.monthly || 0;
  } else {
    counters.yearlyPlansCount = bc.yearly || 0;
    counters.sixMonthsPlansCount = bc.sixMonths || 0;
    counters.monthlyPlansCount = bc.monthly || 0;
  }

  return counters;
};

const getShardId = (userId, shardCount) => {
  let hash = 0;
  const normalized = String(userId || '');
  for (let i = 0; i < normalized.length; i += 1) {
    hash = ((hash * 31) + normalized.charCodeAt(i)) >>> 0;
  }
  return hash % shardCount;
};

const formatShardId = (shardId) => String(shardId).padStart(4, '0');

const parseEventTimeMs = (event) => {
  const parsed = Date.parse(String(event?.time || ''));
  return Number.isFinite(parsed) ? parsed : Date.now();
};

const computeCurrentYearExpenses = async (db, currentYear) => {
  const expensesSnap = await db.collection('expenses').get();
  let totalExpenses = 0;

  expensesSnap.forEach((docSnap) => {
    if (!String(docSnap.id || '').startsWith(`${currentYear}-`)) return;
    totalExpenses += toNumber(docSnap.data()?.amount);
  });

  return totalExpenses;
};

const buildShardIncrementPayload = ({ admin, delta, currentYear }) => {
  const increment = admin.firestore.FieldValue.increment;
  const payload = {
    currentYear,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  COUNTER_FIELDS.forEach((field) => {
    const fieldDelta = toNumber(delta?.[field]);
    if (fieldDelta !== 0) {
      payload[field] = increment(fieldDelta);
    }
  });

  return payload;
};

const deleteCollectionDocs = async (db, collectionName, batchSize = 400) => {
  const ref = db.collection(collectionName);
  let deleted = 0;

  while (true) {
    const snap = await ref.limit(batchSize).get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();

    deleted += snap.size;
    if (snap.size < batchSize) break;
  }

  return deleted;
};

const ensureBaselineExists = async ({ db, baselineRef, summaryRef, currentYear }) => {
  let baselineSnap = await baselineRef.get();
  if (baselineSnap.exists) {
    const baselineData = baselineSnap.data() || {};
    const missingFields = COUNTER_FIELDS.filter((field) => !Number.isFinite(Number(baselineData?.[field])));
    if (missingFields.length > 0) {
      const summarySnap = await summaryRef.get();
      const summaryData = summarySnap.exists ? (summarySnap.data() || {}) : {};

      const patch = {
        migratedAt: new Date().toISOString(),
        baselineVersion: 2,
      };

      missingFields.forEach((field) => {
        patch[field] = toNumber(summaryData?.[field]);
      });

      await baselineRef.set(patch, { merge: true });
      baselineSnap = await baselineRef.get();
    }

    return {
      baselineSnap,
      bootstrapped: false,
      deletedShards: 0,
      migratedBaselineFields: missingFields.length,
    };
  }

  const summarySnap = await summaryRef.get();
  if (!summarySnap.exists) {
    return {
      baselineSnap,
      bootstrapped: false,
      deletedShards: 0,
      reason: 'summary_missing',
    };
  }

  const baselineCounters = normalizeCounterSet(summarySnap.data() || {});
  const nowIso = new Date().toISOString();

  await baselineRef.set({
    ...baselineCounters,
    currentYear,
    initializedAt: nowIso,
    initializedBy: 'auto-bootstrap',
    sourceSummaryDocId: SUMMARY_DOC_ID,
    baselineVersion: 1,
    autoBootstrapped: true,
  }, { merge: true });

  const deletedShards = await deleteCollectionDocs(db, SHARDS_COLLECTION);
  baselineSnap = await baselineRef.get();

  return {
    baselineSnap,
    bootstrapped: true,
    deletedShards,
  };
};

module.exports = ({ HttpsError, admin, assertAdminRequest, getDb }) => {
  const syncAdminDashboardUserCounter = async (event) => {
    try {
      const db = getDb();
      const userId = String(event?.params?.userId || '').trim();
      if (!userId) return;

      const beforeSnap = event?.data?.before || null;
      const afterSnap = event?.data?.after || null;
      const beforeData = beforeSnap && beforeSnap.exists ? (beforeSnap.data() || {}) : null;
      const afterData = afterSnap && afterSnap.exists ? (afterSnap.data() || {}) : null;

      const currentYear = new Date().getFullYear();
      const priceCache = new Map();
      const getMonthPrices = async (monthId) => {
        if (!monthId) return null;
        if (priceCache.has(monthId)) return priceCache.get(monthId);

        const priceSnap = await db.collection('subscriptionPrices').doc(monthId).get();
        const value = priceSnap.exists ? (priceSnap.data() || {}) : null;
        priceCache.set(monthId, value);
        return value;
      };

      const [beforeContribution, afterContribution] = await Promise.all([
        buildContributionFromUser({ userData: beforeData, currentYear, getMonthPrices }),
        buildContributionFromUser({ userData: afterData, currentYear, getMonthPrices }),
      ]);

      const eventTimeMs = parseEventTimeMs(event);
      const eventId = String(event?.id || '');
      const shardCount = getShardCount();
      const shardId = getShardId(userId, shardCount);
      const shardRef = db.collection(SHARDS_COLLECTION).doc(formatShardId(shardId));
      const stateRef = db.collection(USER_STATE_COLLECTION).doc(userId);

      await db.runTransaction(async (tx) => {
        const stateSnap = await tx.get(stateRef);
        const stateData = stateSnap.exists ? (stateSnap.data() || {}) : {};

        const lastEventId = String(stateData?.lastEventId || '');
        const lastEventTimeMs = toNumber(stateData?.lastEventTimeMs);

        if (stateSnap.exists) {
          if (eventId && lastEventId && eventId === lastEventId) {
            return;
          }
          if (eventTimeMs <= lastEventTimeMs) {
            return;
          }
        }

        const previousContribution = stateSnap.exists
          ? normalizeCounterSet(stateData?.contribution || {})
          : normalizeCounterSet(beforeContribution);

        const nextContribution = normalizeCounterSet(afterContribution);
        const delta = subtractCounters(nextContribution, previousContribution);

        const shouldSkipStateWrite =
          !stateSnap.exists &&
          !hasCounterDelta(previousContribution) &&
          !hasCounterDelta(nextContribution);

        if (hasCounterDelta(delta)) {
          const incrementPayload = buildShardIncrementPayload({
            admin,
            delta,
            currentYear,
          });
          tx.set(shardRef, incrementPayload, { merge: true });
        }

        if (!shouldSkipStateWrite) {
          tx.set(stateRef, {
            contribution: nextContribution,
            shardId,
            lastEventTimeMs: eventTimeMs,
            lastEventId: eventId || null,
            currentYear,
            userDocExists: Boolean(afterSnap && afterSnap.exists),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      });
    } catch (error) {
      console.error('[syncAdminDashboardUserCounter] Error:', error);
      throw error;
    }
  };

  const buildSummaryFromBaselineAndDeltas = async ({ source, generatedBy }) => {
    const db = getDb();
    const now = new Date();
    const currentYear = now.getFullYear();

    const baselineRef = db.collection('settings').doc(COUNTER_BASELINE_DOC_ID);
    const summaryRef = db.collection('settings').doc(SUMMARY_DOC_ID);
    const baselineState = await ensureBaselineExists({
      db,
      baselineRef,
      summaryRef,
      currentYear,
    });
    const baselineSnap = baselineState.baselineSnap;

    const [shardsSnap, totalExpenses] = await Promise.all([
      db.collection(SHARDS_COLLECTION).get(),
      computeCurrentYearExpenses(db, currentYear),
    ]);

    if (!baselineSnap.exists) {
      return {
        success: false,
        skipped: true,
        reason: baselineState.reason || 'baseline_missing',
      };
    }

    const baselineCounters = normalizeCounterSet(baselineSnap.data() || {});
    const deltaCounters = createZeroCounters();

    shardsSnap.forEach((docSnap) => {
      const shardData = docSnap.data() || {};
      COUNTER_FIELDS.forEach((field) => {
        deltaCounters[field] += toNumber(shardData?.[field]);
      });
    });

    const mergedCounters = sumCounters(baselineCounters, deltaCounters);
    const netProfit = mergedCounters.totalRevenue - totalExpenses;

    await summaryRef.set({
      ...mergedCounters,
      activeSubscriptions: mergedCounters.premiumDocsCount,
      totalExpenses,
      netProfit,
      countersGeneratedAt: now.toISOString(),
      countersGeneratedBy: String(generatedBy || 'system'),
      countersSource: String(source || 'scheduled'),
      countersCurrentYear: currentYear,
      countersShardsCount: shardsSnap.size,
      countersBaselineDocId: COUNTER_BASELINE_DOC_ID,
      countersVersion: 1,
    }, { merge: true });

    return {
      success: true,
      skipped: false,
      generatedAt: now.toISOString(),
      totalRevenue: mergedCounters.totalRevenue,
      totalExpenses,
      netProfit,
      shardsCount: shardsSnap.size,
      bootstrapped: baselineState.bootstrapped,
      bootstrapDeletedShards: baselineState.deletedShards,
    };
  };

  const materializeAdminDashboardSummary = async () => {
    try {
      const result = await buildSummaryFromBaselineAndDeltas({
        source: 'scheduled',
        generatedBy: 'system',
      });

      if (result.skipped) {
        console.warn('[materializeAdminDashboardSummary] Skipped: baseline is missing.');
      } else {
        if (result.bootstrapped) {
          console.log(`[materializeAdminDashboardSummary] Auto-bootstrap completed; cleared shards=${result.bootstrapDeletedShards}.`);
        }
        console.log(
          `[materializeAdminDashboardSummary] Updated summary. ` +
          `revenue=${result.totalRevenue}, expenses=${result.totalExpenses}, net=${result.netProfit}`,
        );
      }

      return result;
    } catch (error) {
      console.error('[materializeAdminDashboardSummary] Error:', error);
      throw error;
    }
  };

  const materializeAdminDashboardSummaryNow = async (request) => {
    try {
      const adminEmail = await assertAdminRequest(request);
      return await buildSummaryFromBaselineAndDeltas({
        source: 'manual',
        generatedBy: adminEmail,
      });
    } catch (error) {
      console.error('[materializeAdminDashboardSummaryNow] Error:', error);
      throw new HttpsError('internal', `Failed to materialize dashboard summary: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  };

  const initializeAdminDashboardCounterBaseline = async (request) => {
    try {
      const adminEmail = await assertAdminRequest(request);
      const db = getDb();
      const now = new Date();
      const currentYear = now.getFullYear();

      const summaryRef = db.collection('settings').doc(SUMMARY_DOC_ID);
      const baselineRef = db.collection('settings').doc(COUNTER_BASELINE_DOC_ID);

      const summarySnap = await summaryRef.get();
      if (!summarySnap.exists) {
        throw new HttpsError('failed-precondition', 'Dashboard summary doc does not exist. Run full aggregation first.');
      }

      const summaryData = summarySnap.data() || {};
      const baselineCounters = normalizeCounterSet(summaryData);

      await baselineRef.set({
        ...baselineCounters,
        currentYear,
        initializedAt: now.toISOString(),
        initializedBy: adminEmail,
        sourceSummaryDocId: SUMMARY_DOC_ID,
        baselineVersion: 1,
      }, { merge: true });

      const deletedShards = await deleteCollectionDocs(db, SHARDS_COLLECTION);

      return {
        success: true,
        initializedAt: now.toISOString(),
        currentYear,
        deletedShards,
      };
    } catch (error) {
      console.error('[initializeAdminDashboardCounterBaseline] Error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', `Failed to initialize dashboard counters baseline: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  };

  return {
    syncAdminDashboardUserCounter,
    materializeAdminDashboardSummary,
    materializeAdminDashboardSummaryNow,
    initializeAdminDashboardCounterBaseline,
  };
};
