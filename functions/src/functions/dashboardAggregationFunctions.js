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

// أسماء ميزات الـAI الـ5 — لازم تطابق `ALLOWED_AI_FEATURES` في adminFunctions.js
// ✂️ شيلنا 'translation' (2026-05) — بقت بدون حد منفصل، dead counter
const AI_FEATURE_NAMES = [
  'case_analysis',
  'drug_interactions',
  'pregnancy_safety',
  'renal_dose',
  'medical_report',
];

// تحويل الـsnake_case إلى camelCase لأسماء الحقول في الـpayload
const FEATURE_CAMEL_MAP = {
  case_analysis: 'caseAnalysis',
  drug_interactions: 'drugInteractions',
  pregnancy_safety: 'pregnancySafety',
  renal_dose: 'renalDose',
  medical_report: 'medicalReport',
};

// يبني خريطة per-feature counters من tier object — لو ميزة مش موجودة بترجع 0
const buildAiFeaturesMap = (tierData) => {
  const aiFeaturesRaw = tierData && typeof tierData.aiFeatures === 'object' ? tierData.aiFeatures : {};
  const result = {};
  AI_FEATURE_NAMES.forEach((featureName) => {
    result[featureName] = toNumber(aiFeaturesRaw?.[featureName]?.count);
  });
  return result;
};

const normalizeUsageCounters = (raw) => ({
  smartPrescriptionCount: toNumber(raw?.smartPrescriptionCount),
  printCount: toNumber(raw?.printCount),
  // عداد منفصل لكل ميزة AI (6 ميزات)
  aiFeatures: buildAiFeaturesMap(raw),
});

const getUsageByPlan = (doctorData) => {
  const usageByPlan = doctorData && typeof doctorData.usageStatsByPlan === 'object'
    ? doctorData.usageStatsByPlan
    : {};

  let freeUsage = normalizeUsageCounters(usageByPlan?.free);
  let premiumUsage = normalizeUsageCounters(usageByPlan?.premium);
  let proMaxUsage = normalizeUsageCounters(usageByPlan?.pro_max);

  // ─ نتحقق من أي عداد (روشتات/طباعات/AI) عشان نعرف لو الدكتور عنده usageStatsByPlan فعلاً.
  //   كان فيه bug: لو الدكتور استخدم AI features بس بدون ما يطبع روشتة، الفحص القديم
  //   كان بيرجع false ويدخل في fallback اللي بيمسح عدّادات الـ AI.
  const hasAnyAiUsage = AI_FEATURE_NAMES.some((feature) =>
    (freeUsage.aiFeatures?.[feature] || 0) > 0 ||
    (premiumUsage.aiFeatures?.[feature] || 0) > 0 ||
    (proMaxUsage.aiFeatures?.[feature] || 0) > 0
  );
  const hasUsageByPlan =
    freeUsage.smartPrescriptionCount > 0 ||
    freeUsage.printCount > 0 ||
    premiumUsage.smartPrescriptionCount > 0 ||
    premiumUsage.printCount > 0 ||
    proMaxUsage.smartPrescriptionCount > 0 ||
    proMaxUsage.printCount > 0 ||
    hasAnyAiUsage;

  if (!hasUsageByPlan) {
    const fallbackUsage = normalizeUsageCounters(doctorData?.usageStats || {});
    const accType = String(doctorData?.accountType || '').trim().toLowerCase();
    if (accType === 'pro_max') {
      proMaxUsage = fallbackUsage;
    } else if (accType === 'premium') {
      premiumUsage = fallbackUsage;
    } else {
      freeUsage = fallbackUsage;
    }
  }

  return { freeUsage, premiumUsage, proMaxUsage };
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

// يبني bucket فاضي لـper-feature counters: 6 ميزات × 3 tiers = 18 حقل
const buildEmptyAiFeaturesBucket = () => {
  const bucket = {};
  AI_FEATURE_NAMES.forEach((feature) => {
    const camel = FEATURE_CAMEL_MAP[feature];
    ['Free', 'Pro', 'ProMax'].forEach((tierLabel) => {
      bucket[`${camel}${tierLabel}Count`] = 0;
    });
  });
  return bucket;
};

// ─ يحوّل أي صيغة لـcreatedAt إلى مفتاح "YYYY-MM" — أو null لو فاشل.
//   بيدعم 3 صيغ: ISO string، Firestore Timestamp، Number millis.
//   ضروري عشان أطباء قدامى ممكن يكون عندهم Timestamp بدل ISO، والكود
//   القديم في ReportsSection كان بيرجع 0 للشهور كلها لو الحقل مش string.
const extractMonthKeyFromCreatedAt = (rawCreatedAt) => {
  if (!rawCreatedAt) return null;
  let date = null;
  if (typeof rawCreatedAt === 'string') {
    // ISO أو "YYYY-MM-DD..." — ناخد أول 7 حروف لو الصيغة سليمة
    const isoMatch = /^(\d{4}-\d{2})/.exec(rawCreatedAt.trim());
    if (isoMatch) return isoMatch[1];
    // fallback: نحاول نـparseها كـDate
    const parsed = new Date(rawCreatedAt);
    if (Number.isFinite(parsed.getTime())) date = parsed;
  } else if (typeof rawCreatedAt === 'number' && Number.isFinite(rawCreatedAt)) {
    date = new Date(rawCreatedAt);
  } else if (rawCreatedAt && typeof rawCreatedAt.toDate === 'function') {
    // Firestore Timestamp object — يستخدم .toDate()
    try { date = rawCreatedAt.toDate(); } catch (_) { date = null; }
  } else if (rawCreatedAt && typeof rawCreatedAt.seconds === 'number') {
    // Plain Timestamp shape (يحدث لو الوثيقة جاية من cache)
    date = new Date(rawCreatedAt.seconds * 1000);
  }
  if (!date || !Number.isFinite(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// ─ مجموع كل عدادات الاستخدام للطبيب (لإيجاد أعلى 10 نشاطاً).
//   نقرا usageStats الفلات (legacy) + نضيف usageStatsByPlan لو موجود.
const sumUsageForRanking = (doctorData) => {
  let total = 0;
  const flatStats = doctorData?.usageStats;
  if (flatStats && typeof flatStats === 'object') {
    for (const value of Object.values(flatStats)) {
      const n = Number(value);
      if (Number.isFinite(n)) total += n;
    }
  }
  return total;
};

// ─ يبني آخر 12 شهر كـMap بقيم 0 — نملأها أثناء الـscan.
const buildLast12MonthsMap = () => {
  const map = new Map();
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, 0);
  }
  return map;
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
    // per-feature counters (6 ميزات × 3 فئات = 18 حقل)
    ...buildEmptyAiFeaturesBucket(),
  };

  // ─ Reports aggregation (نقلناها من ReportsSection للـserver لتوفير
  //   آلاف الـreads لكل فتحة لصفحة التقارير من الأدمن).
  const monthlySignups = buildLast12MonthsMap();   // YYYY-MM → عدد التسجيلات
  const specialtyMap = new Map();                  // تخصص → عدد الأطباء
  const topDoctorsList = [];                       // كل الأطباء بـ totalActions، نختار الـ10 الأعلى لاحقاً

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

      // ─ تجميع per-feature counts (6 ميزات × 3 فئات)
      const tierMappings = [
        { tierLabel: 'Free',   tierUsage: usage.freeUsage },
        { tierLabel: 'Pro',    tierUsage: usage.premiumUsage },
        { tierLabel: 'ProMax', tierUsage: usage.proMaxUsage },
      ];
      tierMappings.forEach(({ tierLabel, tierUsage }) => {
        AI_FEATURE_NAMES.forEach((feature) => {
          const camel = FEATURE_CAMEL_MAP[feature];
          aggregate[`${camel}${tierLabel}Count`] += (tierUsage.aiFeatures?.[feature] || 0);
        });
      });

      // ─ Reports aggregation (شهور التسجيل + التخصصات + أعلى نشاطاً)
      const monthKey = extractMonthKeyFromCreatedAt(doctorData?.createdAt);
      if (monthKey && monthlySignups.has(monthKey)) {
        monthlySignups.set(monthKey, monthlySignups.get(monthKey) + 1);
      }

      const specialty = String(doctorData?.doctorSpecialty || '').trim() || 'بدون تخصص';
      specialtyMap.set(specialty, (specialtyMap.get(specialty) || 0) + 1);

      const totalActions = sumUsageForRanking(doctorData);
      if (totalActions > 0) {
        topDoctorsList.push({
          name: String(doctorData?.doctorName || doctorData?.displayName || 'طبيب'),
          email: String(doctorData?.doctorEmail || doctorData?.email || ''),
          totalActions,
        });
      }

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

  // ─ تجهيز نتائج الـreports النهائية في الشكل اللي الـclient محتاجه
  aggregate.monthlySignups = Array.from(monthlySignups.entries())
    .map(([month, newDoctors]) => ({ month, newDoctors }));

  aggregate.specialtyBreakdown = Array.from(specialtyMap.entries())
    .map(([specialty, count]) => ({ specialty, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  aggregate.topDoctorsByActivity = topDoctorsList
    .sort((a, b) => b.totalActions - a.totalActions)
    .slice(0, 10);

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

    // ─ نستخرج كل حقول الـAI features من الـaggregate (18 حقل) ونضمّها في الـpayload
    const aiFeaturesPayload = {};
    AI_FEATURE_NAMES.forEach((feature) => {
      const camel = FEATURE_CAMEL_MAP[feature];
      ['Free', 'Pro', 'ProMax'].forEach((tierLabel) => {
        aiFeaturesPayload[`${camel}${tierLabel}Count`] = doctorAggregate[`${camel}${tierLabel}Count`];
      });
    });

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
      // عدادات per-feature لكل tier (6 ميزات × 3 فئات = 18 حقل)
      ...aiFeaturesPayload,
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
      // Reports aggregates — يقراهم ReportsSection مباشرة بدل ما يـscan كل الأطباء
      monthlySignups: doctorAggregate.monthlySignups,
      specialtyBreakdown: doctorAggregate.specialtyBreakdown,
      topDoctorsByActivity: doctorAggregate.topDoctorsByActivity,
      generatedAt: now.toISOString(),
      generatedBy: String(generatedBy || 'system'),
      source: String(source || 'scheduled'),
      currentYear,
      processingMs: Date.now() - startedAt,
      statsVersion: 2, // ⚠️ زدنا الإصدار لأن الـschema تغيّر (ضفنا reports aggregates)
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
