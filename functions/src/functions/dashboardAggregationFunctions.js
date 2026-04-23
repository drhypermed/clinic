const SUMMARY_COLLECTION = 'settings';
const SUMMARY_DOC_ID = 'adminDashboardStats';
const COUNTER_BASELINE_DOC_ID = 'adminDashboardStatsBaseline';
const DOCTOR_SCAN_BATCH_SIZE = 800;

const toNumber = (value) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const normalizeVerificationStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'approved') return 'approved';
  if (normalized === 'rejected') return 'rejected';
  return 'submitted';
};

const normalizeUsageCounters = (raw) => ({
  smartPrescriptionCount: toNumber(raw?.smartPrescriptionCount),
  printCount: toNumber(raw?.printCount),
});

const getUsageByPlan = (doctorData) => {
  const usageByPlan = doctorData && typeof doctorData.usageStatsByPlan === 'object'
    ? doctorData.usageStatsByPlan
    : {};

  let freeUsage = normalizeUsageCounters(usageByPlan?.free);
  let premiumUsage = normalizeUsageCounters(usageByPlan?.premium);

  const hasUsageByPlan =
    freeUsage.smartPrescriptionCount > 0 ||
    freeUsage.printCount > 0 ||
    premiumUsage.smartPrescriptionCount > 0 ||
    premiumUsage.printCount > 0;

  if (!hasUsageByPlan) {
    const fallbackUsage = normalizeUsageCounters(doctorData?.usageStats || {});
    if (String(doctorData?.accountType || '').trim().toLowerCase() === 'premium') {
      premiumUsage = fallbackUsage;
    } else {
      freeUsage = fallbackUsage;
    }
  }

  return { freeUsage, premiumUsage };
};

const countBannerItems = (raw) => {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const activeItems = items.filter((item) => item?.isActive !== false && String(item?.imageUrl || '').trim());
  if (activeItems.length > 0) return activeItems.length;

  const imageUrls = Array.isArray(raw?.imageUrls)
    ? raw.imageUrls.filter((url) => String(url || '').trim())
    : [];
  if (imageUrls.length > 0) return imageUrls.length;

  return String(raw?.imageUrl || '').trim() ? 1 : 0;
};

const countFooterContacts = (raw) => {
  const contacts = Array.isArray(raw?.contacts) ? raw.contacts : [];
  return contacts.filter(
    (item) => item?.enabled !== false &&
      Boolean(
        String(item?.value || '').trim() ||
        String(item?.label || '').trim() ||
        String(item?.url || '').trim(),
      ),
  ).length;
};

const getCollectionCount = async (queryRef) => {
  const aggregateSnap = await queryRef.count().get();
  return toNumber(aggregateSnap.data()?.count);
};

const loadSubscriptionPricesByMonth = async (db) => {
  const pricesSnap = await db.collection('subscriptionPrices').get();
  const pricesByMonth = {};

  pricesSnap.forEach((docSnap) => {
    pricesByMonth[docSnap.id] = docSnap.data() || {};
  });

  return pricesByMonth;
};

const computeDoctorRevenueForCurrentYear = ({ doctorData, currentYear, pricesByMonth }) => {
  const accountType = String(doctorData?.accountType || '').trim().toLowerCase();
  // برو وبرو ماكس بيدخلوا في الإيرادات (كل فئة بسعرها)
  if (accountType !== 'premium' && accountType !== 'pro_max') {
    return { revenue: 0, planBucket: null };
  }
  if (!doctorData?.premiumStartDate || !doctorData?.premiumExpiryDate) {
    return { revenue: 0, planBucket: null };
  }

  const startDate = new Date(doctorData.premiumStartDate);
  const endDate = new Date(doctorData.premiumExpiryDate);
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) {
    return { revenue: 0, planBucket: null };
  }
  if (startDate.getFullYear() !== currentYear) {
    return { revenue: 0, planBucket: null };
  }

  const yearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  const monthPrices = pricesByMonth[yearMonth] || null;
  if (!monthPrices) return { revenue: 0, planBucket: null };

  const rawMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();
  const diffMonths = endDate.getDate() >= startDate.getDate() ? rawMonths : rawMonths - 1;

  const isProMax = accountType === 'pro_max';
  // pro_max يستخدم أسعاره الخاصة (proMaxYearly, proMaxSixMonths, proMaxMonthly) مع fallback لأسعار برو
  if (diffMonths >= 12) {
    const price = isProMax ? (monthPrices?.proMaxYearly ?? monthPrices?.yearly) : monthPrices?.yearly;
    return { revenue: toNumber(price), planBucket: 'yearly' };
  }
  if (diffMonths >= 6) {
    const price = isProMax ? (monthPrices?.proMaxSixMonths ?? monthPrices?.sixMonths) : monthPrices?.sixMonths;
    return { revenue: toNumber(price), planBucket: 'sixMonths' };
  }
  const price = isProMax ? (monthPrices?.proMaxMonthly ?? monthPrices?.monthly) : monthPrices?.monthly;
  return { revenue: toNumber(price), planBucket: 'monthly' };
};

const computeTotalExpensesForYear = async (db, currentYear) => {
  const expensesSnap = await db.collection('expenses').get();
  let totalExpenses = 0;

  expensesSnap.forEach((docSnap) => {
    if (!String(docSnap.id || '').startsWith(`${currentYear}-`)) return;
    totalExpenses += toNumber(docSnap.data()?.amount);
  });

  return totalExpenses;
};

const scanDoctorsAndAggregate = async ({ db, currentYear, pricesByMonth }) => {
  const aggregate = {
    totalDoctors: 0,
    pendingDoctors: 0,
    approvedDoctors: 0,
    rejectedDoctors: 0,
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
  };

  let lastDoctorId = null;

  while (true) {
    let doctorsQuery = db
      .collection('users')
      .where('authRole', '==', 'doctor')
      .orderBy('__name__')
      .limit(DOCTOR_SCAN_BATCH_SIZE);

    if (lastDoctorId) {
      doctorsQuery = doctorsQuery.startAfter(lastDoctorId);
    }

    const doctorsSnap = await doctorsQuery.get();
    if (doctorsSnap.empty) break;

    doctorsSnap.forEach((docSnap) => {
      const doctorData = docSnap.data() || {};

      aggregate.totalDoctors += 1;

      const verificationStatus = normalizeVerificationStatus(doctorData?.verificationStatus);
      if (verificationStatus === 'approved') aggregate.approvedDoctors += 1;
      else if (verificationStatus === 'rejected') aggregate.rejectedDoctors += 1;
      else aggregate.pendingDoctors += 1;

      // كل فئة في bucket منفصل
      const rawAccountType = String(doctorData?.accountType || '').trim().toLowerCase();
      const isProMax = rawAccountType === 'pro_max';
      const isPremium = rawAccountType === 'premium';

      if (isProMax) {
        aggregate.proMaxDocsCount += 1;
      } else if (isPremium) {
        aggregate.premiumDocsCount += 1;
      } else {
        aggregate.freeDocsCount += 1;
      }

      const usage = getUsageByPlan(doctorData);
      aggregate.totalSmartRxFree += usage.freeUsage.smartPrescriptionCount;
      aggregate.totalSmartRxPro += usage.premiumUsage.smartPrescriptionCount;
      aggregate.totalSmartRxProMax += (usage.proMaxUsage?.smartPrescriptionCount || 0);
      aggregate.totalPrintsFree += usage.freeUsage.printCount;
      aggregate.totalPrintsPro += usage.premiumUsage.printCount;
      aggregate.totalPrintsProMax += (usage.proMaxUsage?.printCount || 0);

      const revenueContribution = computeDoctorRevenueForCurrentYear({
        doctorData,
        currentYear,
        pricesByMonth,
      });
      aggregate.totalRevenue += revenueContribution.revenue;
      // عدادات الباقات مفصولة حسب الفئة
      if (isProMax) {
        if (revenueContribution.planBucket === 'yearly') aggregate.proMaxYearlyPlansCount += 1;
        else if (revenueContribution.planBucket === 'sixMonths') aggregate.proMaxSixMonthsPlansCount += 1;
        else if (revenueContribution.planBucket === 'monthly') aggregate.proMaxMonthlyPlansCount += 1;
      } else {
        if (revenueContribution.planBucket === 'yearly') aggregate.yearlyPlansCount += 1;
        else if (revenueContribution.planBucket === 'sixMonths') aggregate.sixMonthsPlansCount += 1;
        else if (revenueContribution.planBucket === 'monthly') aggregate.monthlyPlansCount += 1;
      }
    });

    lastDoctorId = doctorsSnap.docs[doctorsSnap.docs.length - 1]?.id || null;
    if (!lastDoctorId || doctorsSnap.size < DOCTOR_SCAN_BATCH_SIZE) {
      break;
    }
  }

  return aggregate;
};

module.exports = ({ HttpsError, assertAdminRequest, getDb }) => {
  const recomputeAndPersistDashboardStats = async ({ source, generatedBy }) => {
    const db = getDb();
    const startedAt = Date.now();
    const now = new Date();
    const currentYear = now.getFullYear();

    const [
      pricesByMonth,
      totalPatients,
      doctorBlacklisted,
      publicBlacklisted,
      doctorHomeBannerSnap,
      publicHomeBannerSnap,
      footerLineSnap,
    ] = await Promise.all([
      loadSubscriptionPricesByMonth(db),
      getCollectionCount(db.collection('users').where('authRole', '==', 'public')),
      getCollectionCount(db.collection('blacklistedEmails')),
      getCollectionCount(db.collection('publicBlacklistedEmails')),
      db.collection('settings').doc('homepageBanner').get(),
      db.collection('settings').doc('homepageBannerPublic').get(),
      db.collection('settings').doc('prescriptionFooterLine').get(),
    ]);

    const doctorAggregate = await scanDoctorsAndAggregate({
      db,
      currentYear,
      pricesByMonth,
    });

    const totalExpenses = await computeTotalExpensesForYear(db, currentYear);
    const netProfit = doctorAggregate.totalRevenue - totalExpenses;

    const homeBannerItems =
      countBannerItems(doctorHomeBannerSnap.exists ? doctorHomeBannerSnap.data() : {}) +
      countBannerItems(publicHomeBannerSnap.exists ? publicHomeBannerSnap.data() : {});

    const footerContacts = countFooterContacts(footerLineSnap.exists ? footerLineSnap.data() : {});

    const payload = {
      totalDoctors: doctorAggregate.totalDoctors,
      pendingDoctors: doctorAggregate.pendingDoctors,
      approvedDoctors: doctorAggregate.approvedDoctors,
      rejectedDoctors: doctorAggregate.rejectedDoctors,
      totalPatients,
      doctorBlacklisted,
      publicBlacklisted,
      totalBlacklisted: doctorBlacklisted + publicBlacklisted,
      // الاشتراكات النشطة = برو + برو ماكس
      activeSubscriptions: doctorAggregate.premiumDocsCount + doctorAggregate.proMaxDocsCount,
      freeDocsCount: doctorAggregate.freeDocsCount,
      premiumDocsCount: doctorAggregate.premiumDocsCount,
      proMaxDocsCount: doctorAggregate.proMaxDocsCount,
      totalSmartRxFree: doctorAggregate.totalSmartRxFree,
      totalSmartRxPro: doctorAggregate.totalSmartRxPro,
      totalSmartRxProMax: doctorAggregate.totalSmartRxProMax,
      totalPrintsFree: doctorAggregate.totalPrintsFree,
      totalPrintsPro: doctorAggregate.totalPrintsPro,
      totalPrintsProMax: doctorAggregate.totalPrintsProMax,
      monthlyPlansCount: doctorAggregate.monthlyPlansCount,
      sixMonthsPlansCount: doctorAggregate.sixMonthsPlansCount,
      yearlyPlansCount: doctorAggregate.yearlyPlansCount,
      proMaxMonthlyPlansCount: doctorAggregate.proMaxMonthlyPlansCount,
      proMaxSixMonthsPlansCount: doctorAggregate.proMaxSixMonthsPlansCount,
      proMaxYearlyPlansCount: doctorAggregate.proMaxYearlyPlansCount,
      homeBannerItems,
      footerContacts,
      totalRevenue: doctorAggregate.totalRevenue,
      totalExpenses,
      netProfit,
      generatedAt: now.toISOString(),
      generatedBy: String(generatedBy || 'system'),
      source: String(source || 'scheduled'),
      currentYear,
      processingMs: Date.now() - startedAt,
      statsVersion: 1,
    };

    await db.collection(SUMMARY_COLLECTION).doc(SUMMARY_DOC_ID).set(payload, { merge: true });
    return payload;
  };

  const refreshAdminDashboardAggregates = async () => {
    try {
      const db = getDb();
      const baselineSnap = await db.collection(SUMMARY_COLLECTION).doc(COUNTER_BASELINE_DOC_ID).get();
      if (baselineSnap.exists) {
        console.log('[refreshAdminDashboardAggregates] Skipped: counters baseline already exists.');
        return {
          success: true,
          skipped: true,
          reason: 'baseline_exists',
        };
      }

      const payload = await recomputeAndPersistDashboardStats({
        source: 'scheduled',
        generatedBy: 'system',
      });

      console.log(
        `[refreshAdminDashboardAggregates] Done in ${payload.processingMs}ms. ` +
        `doctors=${payload.totalDoctors}, patients=${payload.totalPatients}`,
      );

      return {
        success: true,
        generatedAt: payload.generatedAt,
        processingMs: payload.processingMs,
      };
    } catch (error) {
      console.error('[refreshAdminDashboardAggregates] Error:', error);
      throw error;
    }
  };

  const refreshAdminDashboardAggregatesNow = async (request) => {
    try {
      const adminEmail = await assertAdminRequest(request);
      const payload = await recomputeAndPersistDashboardStats({
        source: 'manual',
        generatedBy: adminEmail,
      });

      return {
        success: true,
        generatedAt: payload.generatedAt,
        processingMs: payload.processingMs,
        totalDoctors: payload.totalDoctors,
        totalPatients: payload.totalPatients,
      };
    } catch (error) {
      console.error('[refreshAdminDashboardAggregatesNow] Error:', error);
      throw new HttpsError('internal', `Failed to refresh admin dashboard aggregates: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  };

  return {
    refreshAdminDashboardAggregates,
    refreshAdminDashboardAggregatesNow,
  };
};
