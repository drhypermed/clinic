import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocFromServer,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../services/firebaseConfig';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import { INITIAL_DASHBOARD_STATS } from './constants';
import type { DashboardStats } from './types';

const DASHBOARD_STATS_REFRESH_MS = 6 * 60 * 60 * 1000; // ٦ ساعات — المستخدم لديه زر "تحديث الآن" للتحديث الفوري
const SUMMARY_COLLECTION = 'settings';
const SUMMARY_DOC_ID = 'adminDashboardStats';

/**
 * كاش على مستوى الوحدة لعدادات القوائم السوداء — getCountFromServer
 * تُحتسب كل واحدة كقراءة لحد ١٠٠٠ مستند، فبنخزّن النتيجة لمدة ساعة عشان
 * إعادة فتح الداشبورد من نفس الجلسة لا تعيد الحساب.
 */
const BLACKLIST_COUNT_CACHE_TTL_MS = 60 * 60 * 1000;
let blacklistCountCache: {
  expiresAt: number;
  doctorBlacklisted: number;
  publicBlacklisted: number;
} | null = null;

type RawDoc = Record<string, any>;

const asNumber = (value: unknown): number => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
};

const hasSummaryCounter = (summaryRaw: RawDoc, key: string): boolean =>
  Number.isFinite(Number(summaryRaw?.[key]));

const hasSummaryDoctorCounters = (summaryRaw: RawDoc): boolean =>
  [
    'totalDoctors',
    'pendingDoctors',
    'approvedDoctors',
    'rejectedDoctors',
    'totalPatients',
    'freeDocsCount',
    'premiumDocsCount',
    // proMaxDocsCount لازم يكون موجود في الـ summary عشان نعتبره كافٍ.
    // لو الـ summary قديم (قبل ما تضاف برو ماكس) الحقل ده هيكون ناقص،
    // فنرجع live-counters تلقائياً عشان نجيب القيمة الصحيحة من Firestore.
    'proMaxDocsCount',
  ].every((key) => hasSummaryCounter(summaryRaw, key));

const countBannerItems = (raw: RawDoc): number => {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const activeItems = items.filter(
    (item: RawDoc) => item?.isActive !== false && String(item?.imageUrl || '').trim(),
  );
  if (activeItems.length > 0) return activeItems.length;

  const imageUrls = Array.isArray(raw?.imageUrls)
    ? raw.imageUrls.filter((url: string) => String(url || '').trim())
    : [];
  if (imageUrls.length > 0) return imageUrls.length;

  return String(raw?.imageUrl || '').trim() ? 1 : 0;
};

const countFooterContacts = (raw: RawDoc): number => {
  const contacts = Array.isArray(raw?.contacts) ? raw.contacts : [];
  return contacts.filter(
    (item: RawDoc) =>
      item?.enabled !== false &&
      Boolean(
        String(item?.value || '').trim() ||
        String(item?.label || '').trim() ||
        String(item?.url || '').trim(),
      ),
  ).length;
};

// أسماء ميزات الـAI الـ5 — لازم تطابق الـbackend (dashboardAggregationFunctions.js)
// ✂️ شيلنا 'translation' (2026-05) — بقت بدون حد منفصل، dead counter
const AI_FEATURE_CAMEL_NAMES = [
  'caseAnalysis',
  'drugInteractions',
  'pregnancySafety',
  'renalDose',
  'medicalReport',
] as const;
const TIER_LABELS = ['Free', 'Pro', 'ProMax'] as const;

const mergeSummaryMetrics = (baseStats: DashboardStats, summaryRaw: RawDoc): DashboardStats => {
  const merged = { ...baseStats };

  merged.totalSmartRxFree = asNumber(summaryRaw?.totalSmartRxFree);
  merged.totalSmartRxPro = asNumber(summaryRaw?.totalSmartRxPro);
  merged.totalSmartRxProMax = asNumber(summaryRaw?.totalSmartRxProMax);
  merged.totalPrintsFree = asNumber(summaryRaw?.totalPrintsFree);
  merged.totalPrintsPro = asNumber(summaryRaw?.totalPrintsPro);
  merged.totalPrintsProMax = asNumber(summaryRaw?.totalPrintsProMax);
  merged.totalRevenue = asNumber(summaryRaw?.totalRevenue);
  merged.totalExpenses = asNumber(summaryRaw?.totalExpenses);
  merged.netProfit = asNumber(summaryRaw?.netProfit || merged.totalRevenue - merged.totalExpenses);

  // ─ قراءة عدادات الـAI per-feature × per-tier (6 ميزات × 3 فئات = 18 حقل)
  AI_FEATURE_CAMEL_NAMES.forEach((feature) => {
    TIER_LABELS.forEach((tier) => {
      const key = `${feature}${tier}Count` as keyof DashboardStats;
      (merged as any)[key] = asNumber(summaryRaw?.[key]);
    });
  });

  // ─ Reports aggregates (موجودين في الـsummary من statsVersion 2 فما فوق).
  //   لو الـsummary قديم، الحقول هتكون undefined و ReportsSection هيعرض رسالة
  //   "اضغط تحديث الآن" بدل ما يقرا كل الأطباء.
  if (Array.isArray(summaryRaw?.monthlySignups)) {
    merged.monthlySignups = summaryRaw.monthlySignups
      .filter((item: any) => item && typeof item.month === 'string')
      .map((item: any) => ({
        month: String(item.month),
        newDoctors: asNumber(item.newDoctors),
      }));
  }
  if (Array.isArray(summaryRaw?.specialtyBreakdown)) {
    merged.specialtyBreakdown = summaryRaw.specialtyBreakdown
      .filter((item: any) => item && typeof item.specialty === 'string')
      .map((item: any) => ({
        specialty: String(item.specialty),
        count: asNumber(item.count),
      }));
  }
  if (Array.isArray(summaryRaw?.topDoctorsByActivity)) {
    merged.topDoctorsByActivity = summaryRaw.topDoctorsByActivity
      .filter((item: any) => item && typeof item.name === 'string')
      .map((item: any) => ({
        name: String(item.name),
        email: String(item.email || ''),
        totalActions: asNumber(item.totalActions),
      }));
  }

  return merged;
};

interface LoadOptions {
  initial?: boolean;
  /** يتجاهل الـ cache ويذهب مباشرة للخادم — يُستعمل عند الضغط على زر "تحديث الآن". */
  skipCache?: boolean;
  /** يتجاهل ملخص settings/adminDashboardStats ويُعيد حساب عدادات الأطباء من استعلامات حية. */
  forceLiveCounters?: boolean;
}

export const useDashboardStats = (isAdminUser: boolean, user: User) => {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_DASHBOARD_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const loadStatsRef = useRef<(opts?: LoadOptions) => Promise<void>>(async () => {});

  useEffect(() => {
    if (!isAdminUser) {
      setStats(INITIAL_DASHBOARD_STATS);
      setLoading(false);
      hasLoadedOnceRef.current = false;
      loadStatsRef.current = async () => {};
      return;
    }

    const loadStats = async (opts: LoadOptions = {}) => {
      const { initial = false, skipCache = false, forceLiveCounters = false } = opts;
      try {
        if (initial && !hasLoadedOnceRef.current) {
          setLoading(true);
        }

        const summaryRef = doc(db, SUMMARY_COLLECTION, SUMMARY_DOC_ID);
        const readSummary = skipCache ? getDocFromServer(summaryRef) : getDocCacheFirst(summaryRef);

        const now = Date.now();
        const canUseBlacklistCache =
          !skipCache && blacklistCountCache != null && blacklistCountCache.expiresAt > now;
        const blacklistReads = canUseBlacklistCache
          ? Promise.resolve({
              doctorCount: blacklistCountCache!.doctorBlacklisted,
              publicCount: blacklistCountCache!.publicBlacklisted,
            })
          : Promise.all([
              getCountFromServer(collection(db, 'blacklistedEmails')),
              getCountFromServer(collection(db, 'publicBlacklistedEmails')),
            ]).then(([doctorSnap, publicSnap]) => {
              const doctorCount = asNumber(doctorSnap.data().count);
              const publicCount = asNumber(publicSnap.data().count);
              blacklistCountCache = {
                expiresAt: Date.now() + BLACKLIST_COUNT_CACHE_TTL_MS,
                doctorBlacklisted: doctorCount,
                publicBlacklisted: publicCount,
              };
              return { doctorCount, publicCount };
            });

        const [
          blacklistCounts,
          doctorHomeBannerSnap,
          publicHomeBannerSnap,
          footerLineSnap,
          summarySnap,
        ] = await Promise.all([
          blacklistReads,
          skipCache
            ? getDoc(doc(db, 'settings', 'homepageBanner'))
            : getDocCacheFirst(doc(db, 'settings', 'homepageBanner')),
          skipCache
            ? getDoc(doc(db, 'settings', 'homepageBannerPublic'))
            : getDocCacheFirst(doc(db, 'settings', 'homepageBannerPublic')),
          skipCache
            ? getDoc(doc(db, 'settings', 'prescriptionFooterLine'))
            : getDocCacheFirst(doc(db, 'settings', 'prescriptionFooterLine')),
          readSummary,
        ]);

        const usersRef = collection(db, 'users');
        const summaryRaw = summarySnap.exists() ? (summarySnap.data() as RawDoc) : {};
        const canUseSummaryCounters = !forceLiveCounters && hasSummaryDoctorCounters(summaryRaw);

        let totalDoctors = asNumber(summaryRaw.totalDoctors);
        let pendingDoctors = asNumber(summaryRaw.pendingDoctors);
        let approvedDoctors = asNumber(summaryRaw.approvedDoctors);
        let rejectedDoctors = asNumber(summaryRaw.rejectedDoctors);
        let premiumDocsCount = asNumber(summaryRaw.premiumDocsCount);
        let proMaxDocsCount = asNumber(summaryRaw.proMaxDocsCount);
        let freeDocsCount = asNumber(summaryRaw.freeDocsCount);
        let totalPatients = asNumber(summaryRaw.totalPatients);

        if (!canUseSummaryCounters) {
          const [
            totalDoctorsSnap,
            pendingSubmittedSnap,
            pendingLegacySnap,
            approvedDoctorsSnap,
            premiumDoctorsSnap,
            proMaxDoctorsSnap,
            totalPatientsSnap,
          ] = await Promise.all([
            getCountFromServer(query(usersRef, where('authRole', '==', 'doctor'))),
            getCountFromServer(query(usersRef, where('authRole', '==', 'doctor'), where('verificationStatus', '==', 'submitted'))),
            getCountFromServer(query(usersRef, where('authRole', '==', 'doctor'), where('verificationStatus', '==', 'pending'))),
            getCountFromServer(query(usersRef, where('authRole', '==', 'doctor'), where('verificationStatus', '==', 'approved'))),
            getCountFromServer(query(usersRef, where('authRole', '==', 'doctor'), where('accountType', '==', 'premium'))),
            getCountFromServer(query(usersRef, where('authRole', '==', 'doctor'), where('accountType', '==', 'pro_max'))),
            getCountFromServer(query(usersRef, where('authRole', '==', 'public'))),
          ]);

          totalDoctors = asNumber(totalDoctorsSnap.data().count);
          pendingDoctors = asNumber(pendingSubmittedSnap.data().count) + asNumber(pendingLegacySnap.data().count);
          approvedDoctors = asNumber(approvedDoctorsSnap.data().count);
          premiumDocsCount = asNumber(premiumDoctorsSnap.data().count);
          proMaxDocsCount = asNumber(proMaxDoctorsSnap.data().count);
          totalPatients = asNumber(totalPatientsSnap.data().count);
          rejectedDoctors = Math.max(0, totalDoctors - approvedDoctors - pendingDoctors);
          freeDocsCount = Math.max(0, totalDoctors - premiumDocsCount - proMaxDocsCount);
        }

        const doctorBlacklisted = blacklistCounts.doctorCount;
        const publicBlacklisted = blacklistCounts.publicCount;
        const totalBlacklisted = doctorBlacklisted + publicBlacklisted;

        const homeBannerItems =
          countBannerItems(doctorHomeBannerSnap.exists() ? (doctorHomeBannerSnap.data() as RawDoc) : {}) +
          countBannerItems(publicHomeBannerSnap.exists() ? (publicHomeBannerSnap.data() as RawDoc) : {});

        const footerContacts = countFooterContacts(
          footerLineSnap.exists() ? (footerLineSnap.data() as RawDoc) : {},
        );

        // الـbase بيبدأ من INITIAL_DASHBOARD_STATS (كل الحقول = 0) ثم نحدّث الـlive
        // counters. الـAI features + smartRx + الإيرادات بتدخل من mergeSummaryMetrics.
        const baseStats: DashboardStats = {
          ...INITIAL_DASHBOARD_STATS,
          totalDoctors,
          pendingDoctors,
          approvedDoctors,
          rejectedDoctors,
          totalPatients,
          doctorBlacklisted,
          publicBlacklisted,
          totalBlacklisted,
          // الاشتراكات النشطة = برو + برو ماكس (كلاهما مدفوع)
          activeSubscriptions: premiumDocsCount + proMaxDocsCount,
          freeDocsCount,
          premiumDocsCount,
          proMaxDocsCount,
          totalSmartRxFree: 0,
          totalSmartRxPro: 0,
          totalSmartRxProMax: 0,
          totalPrintsFree: 0,
          totalPrintsPro: 0,
          totalPrintsProMax: 0,
          homeBannerItems,
          footerContacts,
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
        };

        setStats(mergeSummaryMetrics(baseStats, summaryRaw));
      } catch (err) {
        console.error('[useDashboardStats] Error loading dashboard stats:', err);
      } finally {
        if (!hasLoadedOnceRef.current) {
          hasLoadedOnceRef.current = true;
          setLoading(false);
        }
      }
    };

    loadStatsRef.current = loadStats;

    void loadStats({ initial: true });
    const interval = setInterval(() => {
      void loadStats();
    }, DASHBOARD_STATS_REFRESH_MS);

    return () => clearInterval(interval);
  }, [isAdminUser, user.email]);

  // زر "تحديث الآن" للأدمن: يُجبر إعادة حساب العدّاد على الخادم ثم يقرأه بلا كاش + استعلامات حية.
  const refresh = useCallback(async () => {
    if (!isAdminUser) return;
    setRefreshing(true);
    try {
      // ─ نشغّل الـmaterialize السريع (sharded counters) + الـfull aggregate scan معاً.
      //   الـfull scan هو اللي بيحدّث الـreports (شهور/تخصصات/نشاط)، فبدونه
      //   الضغط على "تحديث الآن" كان بيحدّث الأرقام بس مش التقارير.
      try {
        const materialize = httpsCallable(functions, 'materializeAdminDashboardSummaryNow');
        await materialize({});
      } catch (callableErr) {
        console.warn('[useDashboardStats] materializeAdminDashboardSummaryNow failed:', callableErr);
      }
      try {
        const refreshAggregates = httpsCallable(functions, 'refreshAdminDashboardAggregatesNow');
        await refreshAggregates({});
      } catch (callableErr) {
        // الـfull scan ممكن ياخد ثواني — لو فشل، الـsharded counters لسه تحدثت
        console.warn('[useDashboardStats] refreshAdminDashboardAggregatesNow failed:', callableErr);
      }
      await loadStatsRef.current({ skipCache: true, forceLiveCounters: true });
    } finally {
      setRefreshing(false);
    }
  }, [isAdminUser]);

  return { stats, loading, refreshing, refresh };
};
