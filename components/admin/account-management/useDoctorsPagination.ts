// ─────────────────────────────────────────────────────────────────────────────
// Hook إدارة تحميل الأطباء بالـ pagination (useDoctorsPagination)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف كل منطق تحميل قائمة الأطباء من Firestore:
//   • تحميل صفحة أولى (150 طبيب) — الأحدث أولاً
//   • تحميل المزيد عند الطلب (load more)
//   • تحميل باقي الصفحات تلقائياً عند تفعيل أي فلتر (عشان البحث client-side
//     يشتغل على القائمة الكاملة بدون ما يفوت طبيب)
//   • تطبيق قواعد سلامة خاصة بحسابات الأدمن (فتح الحساب لو كان معطل + جعله
//     premium مدى الحياة تلقائياً)
//
// سبب الفصل: المنطق كبير ومعقد، وفصله بيخلي Panel خفيف ومقروء.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  DocumentData,
  documentId,
  getDocsFromServer,
  limit,
  orderBy,
  QueryConstraint,
  QueryDocumentSnapshot,
  query,
  setDoc,
  startAfter,
  where,
} from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../../services/firestore/cacheFirst';
import type { ApprovedDoctor, SmartFilter } from './types';
import { normalizeEmail } from '../../../services/auth-service/validation';
import { buildDoctorUserProfilePayload } from '../../../services/firestore/profileRoles';
import { normalizeDoctorVerificationStatus } from '../../../utils/doctorVerificationStatus';
import { normalizeUsageStatsByPlan, normalizeUsageStatsRecord } from '../../../utils/usageStatsByPlan';

const DOCTORS_PAGE_SIZE = 150;
type DoctorDocSnapshot = QueryDocumentSnapshot<DocumentData>;

/**
 * تحويل document snapshot من Firestore لكائن ApprovedDoctor مع إعطاء قيم افتراضية آمنة.
 * الهدف: الـ UI ما يحتاجش يعمل optional-chaining على كل حقل.
 */
const mapDoctorSnapshot = (snapshotDoc: DoctorDocSnapshot): ApprovedDoctor => {
  const userData = snapshotDoc.data() as Record<string, any>;
  return {
    id: snapshotDoc.id,
    uid: snapshotDoc.id,
    doctorName: userData?.doctorName || userData?.displayName || userData?.name || '',
    doctorSpecialty: userData?.doctorSpecialty || '',
    doctorEmail: normalizeEmail(userData?.doctorEmail || userData?.email),
    doctorWhatsApp: userData?.doctorWhatsApp || '',
    accountType: userData?.accountType === 'premium' ? 'premium'
      : userData?.accountType === 'pro_max' ? 'pro_max'
      : 'free',
    premiumExpiryDate: userData?.premiumExpiryDate || '',
    premiumStartDate: userData?.premiumStartDate || '',
    subscriptionHistory: Array.isArray(userData?.subscriptionHistory) ? userData.subscriptionHistory : [],
    verificationStatus: normalizeDoctorVerificationStatus(userData?.verificationStatus),
    rejectionReason: userData?.rejectionReason || '',
    rejectedAt: userData?.rejectedAt || '',
    isAccountDisabled: Boolean(userData?.isAccountDisabled),
    disabledReason: userData?.disabledReason || '',
    disabledAt: userData?.disabledAt || '',
    createdAt: userData?.createdAt || '',
    existsInDoctors: false,
    usageStats: normalizeUsageStatsRecord(userData?.usageStats),
    usageStatsByPlan: normalizeUsageStatsByPlan(userData?.usageStatsByPlan),
  };
};

interface UseDoctorsPaginationParams {
  canManageAccounts: boolean;
  userUid: string | undefined;
  userEmail: string | null | undefined;
  isAdminDoctorEmail: (email?: string) => boolean;
  filters: SmartFilter;
}

export const useDoctorsPagination = ({
  canManageAccounts,
  userUid,
  userEmail,
  isAdminDoctorEmail,
  filters,
}: UseDoctorsPaginationParams) => {
  const [approvedDoctors, setApprovedDoctors] = useState<ApprovedDoctor[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingMoreDoctors, setLoadingMoreDoctors] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [hasMoreDoctors, setHasMoreDoctors] = useState(false);
  const [lastDoctorDoc, setLastDoctorDoc] = useState<DoctorDocSnapshot | null>(null);
  const [autoLoadingAll, setAutoLoadingAll] = useState(false);

  // لا نشغّل قواعد الأمان إلا مرة واحدة لكل جلسة لتفادي كتابات متكررة بلا فائدة
  // (الكتابات idempotent لكن البحث في المصفوفة كان يتكرر مع كل load more).
  const safetyRulesAppliedRef = useRef(false);
  const autoLoadInFlightRef = useRef(false);

  /**
   * قواعد سلامة حسابات الأدمن:
   *   1) لو في حساب أدمن معطل، نعيد تفعيله تلقائياً (حماية من القفل بالخطأ).
   *   2) لو في حساب أدمن مش premium أو premium بتاريخ انتهاء غير 9999، نحوله
   *      لـ premium مدى الحياة (تاريخ انتهاء 9999-12-31).
   */
  const applyAdminSafetyRules = async (doctors: ApprovedDoctor[]): Promise<ApprovedDoctor[]> => {
    if (safetyRulesAppliedRef.current) return doctors;
    safetyRulesAppliedRef.current = true;

    let nextDoctors = [...doctors];

    // 1) إعادة تفعيل أي حساب أدمن معطل
    const disabledAdminDoctor = nextDoctors.find(
      (doctor) => isAdminDoctorEmail(doctor.doctorEmail) && doctor.isAccountDisabled,
    );
    if (disabledAdminDoctor) {
      try {
        await setDoc(
          doc(db, 'users', disabledAdminDoctor.id),
          buildDoctorUserProfilePayload({
            isAccountDisabled: false, disabledReason: '', disabledAt: '',
          }),
          { merge: true },
        );
        nextDoctors = nextDoctors.map((doctor) =>
          doctor.id === disabledAdminDoctor.id
            ? { ...doctor, isAccountDisabled: false, disabledReason: '', disabledAt: '' }
            : doctor,
        );
      } catch (unlockErr) {
        console.error('Error auto-unlocking admin account:', unlockErr);
      }
    }

    // 2) تحويل حساب الأدمن لـ برو ماكس مدى الحياة (أعلى فئة)
    const PERMANENT_EXPIRY = '9999-12-31T23:59:59.000Z';
    const adminDoctor = nextDoctors.find((doctor) => isAdminDoctorEmail(doctor.doctorEmail));
    // نغير الأدمن لبرو ماكس لو مش عنده الفئة دي أو انتهائه مش دائم
    if (adminDoctor && (adminDoctor.accountType !== 'pro_max' || !adminDoctor.premiumExpiryDate?.startsWith('9999'))) {
      try {
        await setDoc(
          doc(db, 'users', adminDoctor.id),
          buildDoctorUserProfilePayload({
            accountType: 'pro_max',
            premiumStartDate: adminDoctor.premiumStartDate || new Date().toISOString(),
            premiumExpiryDate: PERMANENT_EXPIRY,
          }),
          { merge: true },
        );
        nextDoctors = nextDoctors.map((doctor) =>
          doctor.id === adminDoctor.id
            ? {
              ...doctor,
              accountType: 'pro_max',
              premiumExpiryDate: PERMANENT_EXPIRY,
              premiumStartDate: doctor.premiumStartDate || new Date().toISOString(),
            }
            : doctor,
        );
      } catch (adminProErr) {
        console.error('Error setting admin permanent pro_max:', adminProErr);
      }
    }

    return nextDoctors;
  };

  /** بناء الـ query: كل أطباء في users + ترتيب بالـ id + paging. */
  const buildDoctorsQuery = (cursor: DoctorDocSnapshot | null) => {
    const constraints: QueryConstraint[] = [
      where('authRole', '==', 'doctor'),
      orderBy(documentId()),
      limit(DOCTORS_PAGE_SIZE),
    ];
    if (cursor) constraints.splice(2, 0, startAfter(cursor));
    return query(collection(db, 'users'), ...constraints);
  };

  /** Fallback: نجيب من السيرفر أولاً، ولو فشل نرجع للكاش عشان ما نكسرش الواجهة. */
  const fetchDoctorsPage = async (cursor: DoctorDocSnapshot | null) => {
    const doctorsQuery = buildDoctorsQuery(cursor);
    try {
      return await getDocsFromServer(doctorsQuery);
    } catch {
      return getDocsCacheFirst(doctorsQuery);
    }
  };

  // ── تحميل الصفحة الأولى عند فتح الشاشة أو تغير المستخدم ──
  useEffect(() => {
    const loadFirstDoctorsPage = async () => {
      if (!canManageAccounts) {
        setApprovedDoctors([]);
        setHasMoreDoctors(false);
        setLastDoctorDoc(null);
        return;
      }

      setLoadingAccounts(true);
      setLoadError('');
      try {
        const usersSnap = await fetchDoctorsPage(null);
        const doctors = usersSnap.docs.map((snapshotDoc) => mapDoctorSnapshot(snapshotDoc as DoctorDocSnapshot));
        const safeDoctors = await applyAdminSafetyRules(doctors);
        setApprovedDoctors(safeDoctors);
        setLastDoctorDoc((usersSnap.docs[usersSnap.docs.length - 1] as DoctorDocSnapshot | undefined) || null);
        setHasMoreDoctors(usersSnap.docs.length === DOCTORS_PAGE_SIZE);
      } catch (err: any) {
        console.error('Critical error loading doctors:', err);
        setLoadError(err?.message || 'تعذر تحميل بيانات الأطباء. حاول تحديث الصفحة.');
      } finally {
        setLoadingAccounts(false);
      }
    };

    void loadFirstDoctorsPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageAccounts, userUid, userEmail]);

  /** تحميل صفحة إضافية عند الضغط على زر "تحميل مزيد". */
  const loadMoreDoctors = async () => {
    if (!canManageAccounts || loadingAccounts || loadingMoreDoctors || !hasMoreDoctors || !lastDoctorDoc) return;

    setLoadingMoreDoctors(true);
    setLoadError('');
    try {
      const usersSnap = await fetchDoctorsPage(lastDoctorDoc);
      const doctors = usersSnap.docs.map((snapshotDoc) => mapDoctorSnapshot(snapshotDoc as DoctorDocSnapshot));
      const safeDoctors = await applyAdminSafetyRules(doctors);

      // دمج البيانات الجديدة مع الموجودة — الـ id هو المفتاح (ما نعيدش طبيب مرتين)
      setApprovedDoctors((prev) => {
        const merged = new Map<string, ApprovedDoctor>(prev.map((doctor) => [doctor.id, doctor]));
        safeDoctors.forEach((doctor) => merged.set(doctor.id, doctor));
        return Array.from(merged.values());
      });

      setLastDoctorDoc((usersSnap.docs[usersSnap.docs.length - 1] as DoctorDocSnapshot | undefined) || null);
      setHasMoreDoctors(usersSnap.docs.length === DOCTORS_PAGE_SIZE);
    } catch (err: any) {
      console.error('Error loading more doctors:', err);
      setLoadError(err?.message || 'تعذر تحميل المزيد من الأطباء.');
    } finally {
      setLoadingMoreDoctors(false);
    }
  };

  /**
   * Auto-load كل الصفحات عند تفعيل أي فلتر:
   *   البحث والفلترة تعمل client-side على approvedDoctors فقط. لو فيه صفحات لم
   *   تُحمّل بعد، قد لا يجد الأدمن طبيباً موجوداً فعلاً. لذلك نحمّل كل الصفحات
   *   المتبقية تلقائياً بمجرد أن يبدأ المستخدم في الفلترة.
   */
  useEffect(() => {
    if (!canManageAccounts) return;
    if (loadingAccounts || loadingMoreDoctors) return;
    if (!hasMoreDoctors || !lastDoctorDoc) return;
    if (autoLoadInFlightRef.current) return;

    const hasActiveFilter = Boolean(
      filters.searchTerm.trim() ||
      filters.verificationStatus !== 'all' ||
      filters.specialty !== 'all' ||
      filters.subscriptionType !== 'all',
    );
    if (!hasActiveFilter) return;

    autoLoadInFlightRef.current = true;
    setAutoLoadingAll(true);
    let cancelled = false;

    const loadRemaining = async () => {
      try {
        let cursor: DoctorDocSnapshot | null = lastDoctorDoc;
        while (cursor && !cancelled) {
          const snap = await fetchDoctorsPage(cursor);
          if (cancelled) return;
          const doctors = snap.docs.map((sd) => mapDoctorSnapshot(sd as DoctorDocSnapshot));
          setApprovedDoctors((prev) => {
            const merged = new Map<string, ApprovedDoctor>(prev.map((d) => [d.id, d]));
            doctors.forEach((d) => merged.set(d.id, d));
            return Array.from(merged.values());
          });
          if (snap.docs.length < DOCTORS_PAGE_SIZE) {
            cursor = null;
          } else {
            cursor = snap.docs[snap.docs.length - 1] as DoctorDocSnapshot;
          }
        }
        if (!cancelled) {
          setLastDoctorDoc(null);
          setHasMoreDoctors(false);
        }
      } catch (err) {
        if (!cancelled) console.warn('[useDoctorsPagination] Auto-load remaining pages failed:', err);
      } finally {
        if (!cancelled) setAutoLoadingAll(false);
        autoLoadInFlightRef.current = false;
      }
    };

    void loadRemaining();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageAccounts, filters.searchTerm, filters.verificationStatus, filters.specialty, filters.subscriptionType, hasMoreDoctors]);

  return {
    approvedDoctors,
    setApprovedDoctors,
    loadingAccounts,
    loadingMoreDoctors,
    loadError,
    hasMoreDoctors,
    autoLoadingAll,
    loadMoreDoctors,
  };
};
