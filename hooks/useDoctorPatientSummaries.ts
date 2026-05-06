/**
 * useDoctorPatientSummaries:
 * Hook بيقرا ملخصات مرضى الطبيب من Firestore بنظام pagination (50 ملف لكل صفحة)
 * بدلاً من تحميل كل الملخصات دفعة واحدة (5000 قراءة/فتحة في النسخة القديمة).
 *
 * الفلسفة (مفتاح أمان):
 *   - لو الـ feature flag مقفول → بيرجع `null` (الواجهة تستخدم `records` المحلية).
 *   - لو الـ flag مفتوح → بيقرا users/{uid}/patientSummaries بصفحات.
 *   - أول قراءة: 50 ملخص (الأحدث زيارة) — قراءة واحدة لكل ملف بدل 5000.
 *   - "تحميل المزيد" = 50 إضافية بـcursor (startAfter) — توفير ضخم.
 *   - البحث: 3 queries مفلترة (اسم/رقم ملف/هاتف) بـ30 نتيجة لكل واحد.
 *   - أي خطأ → يرجع null والواجهة تكمل بـ records.
 *
 * الفرق عن النسخة القديمة:
 *   - قبل: `onSnapshot(limit 5000)` = 5000 قراءة كل فتحة + subscription لحظية.
 *   - بعد: `getDocs(limit 51)` = 50 قراءة، load-more حسب الطلب، بحث منفصل.
 *   - فقدنا الـrealtime، لكن ملفات المرضى مش بيلزمها تحديث لحظي (الطبيب
 *     بيعمل refresh لما يحتاج).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  DocumentSnapshot,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getDocsCacheFirst } from '../services/firestore/cacheFirst';
import { buildPatientFileNameKey } from '../services/patient-files';

/** الشكل الموحّد لملخص مريض جاي من السيرفر */
export interface DoctorPatientSummary {
  patientFileNameKey: string;
  patientName: string;
  patientFileNumber?: number;
  patientFileId?: string;
  phones: string[];
  totalExams: number;
  totalConsultations: number;
  lastVisitAtMs?: number;
  lastVisitType?: 'exam' | 'consultation';
  firstVisitAtMs?: number;
}

/** عدد الملخصات في كل صفحة — متوافق مع pagination السجلات (50). */
const PAGE_SIZE = 50;

/** هل الـ feature flag مفعّل؟ */
const isSummariesEnabled = (): boolean => {
  const envFlag = String(import.meta.env.VITE_PATIENT_SUMMARIES_ENABLED || '').trim().toLowerCase();
  if (envFlag === 'true' || envFlag === '1' || envFlag === 'on') return true;
  try {
    const localFlag = String(localStorage.getItem('dh_patient_summaries_enabled') || '').trim().toLowerCase();
    return localFlag === 'true' || localFlag === '1' || localFlag === 'on';
  } catch {
    return false;
  }
};

/** تحويل DocumentSnapshot لـ DoctorPatientSummary (بنفس الـmapping القديم). */
const mapDocToSummary = (doc: DocumentSnapshot): DoctorPatientSummary => {
  const data = doc.data() || {};
  return {
    patientFileNameKey: String(data.patientFileNameKey || doc.id),
    patientName: String(data.patientName || ''),
    patientFileNumber: Number.isFinite(Number(data.patientFileNumber))
      ? Number(data.patientFileNumber)
      : undefined,
    patientFileId: data.patientFileId ? String(data.patientFileId) : undefined,
    phones: Array.isArray(data.phones) ? data.phones.map(String) : [],
    totalExams: Number(data.totalExams || 0),
    totalConsultations: Number(data.totalConsultations || 0),
    lastVisitAtMs: Number.isFinite(Number(data.lastVisitAtMs))
      ? Number(data.lastVisitAtMs)
      : undefined,
    lastVisitType: data.lastVisitType === 'consultation' ? 'consultation' : 'exam',
    firstVisitAtMs: Number.isFinite(Number(data.firstVisitAtMs))
      ? Number(data.firstVisitAtMs)
      : undefined,
  };
};

/** نتيجة الهوك المُصدّرة للواجهة. */
export interface UseDoctorPatientSummariesResult {
  /** القائمة المحملة (browse mode) أو نتائج البحث (search mode). null = الـflag مقفول. */
  items: DoctorPatientSummary[] | null;
  /** Loading أول صفحة (initial fetch). */
  loading: boolean;
  /** Loading لـloadMore أو أي بحث جديد. */
  fetchingMore: boolean;
  /** فيه صفحات قدام في الـbrowse mode؟ */
  hasMore: boolean;
  /** هل دلوقتي بنعرض نتائج بحث (مش browse)؟ */
  isInSearchMode: boolean;
  /** تحميل الصفحة التالية (50 إضافية). */
  loadMore: () => Promise<void>;
  /** تشغيل بحث سيرفر-سايد بالاسم/رقم الملف/الهاتف. بـ debounce على مستوى الـcaller. */
  searchOnServer: (term: string) => Promise<void>;
  /** الخروج من وضع البحث والرجوع لقائمة الـbrowse الأصلية. */
  clearSearch: () => Promise<void>;
}

/**
 * @param userId معرّف الطبيب (null = مفيش login)
 * @returns النتيجة الكاملة، أو `items=null` لو الـ flag مقفول.
 */
export const useDoctorPatientSummaries = (
  userId: string | null | undefined,
): UseDoctorPatientSummariesResult => {
  // الحالة الكاملة (null للـitems = الـflag مقفول، الواجهة تكمل بـ records)
  const [items, setItems] = useState<DoctorPatientSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isInSearchMode, setIsInSearchMode] = useState(false);

  // الـcursor للـbrowse mode (آخر document في الصفحة الحالية).
  // لما المستخدم يطلب "تحميل المزيد"، بنعمل startAfter بـcursor ده.
  const cursorRef = useRef<DocumentSnapshot | null>(null);
  // مفتاح الجلسة عشان نلغي fetches قديمة لو الـuserId اتغيّر
  const sessionKeyRef = useRef<string>('');

  const enabled = isSummariesEnabled();

  // ─── تحميل الصفحة الأولى (Initial Page) ──────────────────────────
  // بيشتغل أول ما الـuserId يتغيّر أو الـflag يتفعّل.
  // التكلفة: 51 قراءة (50 معروضة + 1 لاكتشاف "فيه بعدهم").
  useEffect(() => {
    if (!enabled || !userId) {
      setItems(null);
      setHasMore(false);
      cursorRef.current = null;
      return;
    }

    const sessionKey = `${userId}-${Date.now()}`;
    sessionKeyRef.current = sessionKey;

    const summariesRef = collection(db, 'users', userId, 'patientSummaries');
    // الترتيب الافتراضي: آخر زيارة (الأنشط ظهور أول). بيستثني الملخصات بدون
    // lastVisitAtMs، لكن دي حالة نادرة جداً (الـCloud Function بتكتبه دايماً).
    const initialQuery = query(
      summariesRef,
      orderBy('lastVisitAtMs', 'desc'),
      limit(PAGE_SIZE + 1),
    );

    setLoading(true);
    setIsInSearchMode(false);

    // (1) من الكاش فوراً — 0 قراءات سيرفر
    getDocsCacheFirst(initialQuery).then((snap) => {
      if (sessionKeyRef.current !== sessionKey || snap.empty) return;
      const docs = snap.docs;
      const visible = docs.length > PAGE_SIZE ? docs.slice(0, PAGE_SIZE) : docs;
      setItems(visible.map(mapDocToSummary));
      setHasMore(docs.length > PAGE_SIZE);
      cursorRef.current = visible.length > 0 ? visible[visible.length - 1] : null;
    }).catch(() => {});

    // (2) قراءة سيرفر لضمان أحدث نسخة
    getDocs(initialQuery).then((snap) => {
      if (sessionKeyRef.current !== sessionKey) return;
      const docs = snap.docs;
      const visible = docs.length > PAGE_SIZE ? docs.slice(0, PAGE_SIZE) : docs;
      setItems(visible.map(mapDocToSummary));
      setHasMore(docs.length > PAGE_SIZE);
      cursorRef.current = visible.length > 0 ? visible[visible.length - 1] : null;
    }).catch((error) => {
      if (sessionKeyRef.current !== sessionKey) return;
      console.warn('[useDoctorPatientSummaries] initial fetch failed, falling back to local calc:', error);
      setItems(null);
    }).finally(() => {
      if (sessionKeyRef.current === sessionKey) setLoading(false);
    });

    return () => {
      // أي fetch لاحق سيتجاهل النتيجة لأن sessionKey اتغيّر
      sessionKeyRef.current = '';
    };
  }, [userId, enabled]);

  // ─── تحميل الصفحة التالية (Load More) ────────────────────────────
  // التكلفة: 51 قراءة (50 إضافية + 1 لاكتشاف "فيه بعدهم").
  const loadMore = useCallback(async () => {
    if (!enabled || !userId) return;
    if (fetchingMore || !hasMore || isInSearchMode) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    const sessionKey = sessionKeyRef.current;
    setFetchingMore(true);
    try {
      const summariesRef = collection(db, 'users', userId, 'patientSummaries');
      const nextQuery = query(
        summariesRef,
        orderBy('lastVisitAtMs', 'desc'),
        startAfter(cursor),
        limit(PAGE_SIZE + 1),
      );
      const snap = await getDocs(nextQuery);
      if (sessionKeyRef.current !== sessionKey) return;
      const docs = snap.docs;
      const visible = docs.length > PAGE_SIZE ? docs.slice(0, PAGE_SIZE) : docs;
      setItems((prev) => {
        if (prev === null) return visible.map(mapDocToSummary);
        // دمج بدون تكرار (المفتاح = patientFileNameKey)
        const existing = new Map(prev.map((s) => [s.patientFileNameKey, s]));
        visible.forEach((d) => {
          const summary = mapDocToSummary(d);
          existing.set(summary.patientFileNameKey, summary);
        });
        return Array.from(existing.values());
      });
      setHasMore(docs.length > PAGE_SIZE);
      cursorRef.current = visible.length > 0 ? visible[visible.length - 1] : cursor;
    } catch (error) {
      console.warn('[useDoctorPatientSummaries] loadMore failed:', error);
    } finally {
      if (sessionKeyRef.current === sessionKey) setFetchingMore(false);
    }
  }, [userId, enabled, fetchingMore, hasMore, isInSearchMode]);

  // ─── البحث على السيرفر (Server Search) ────────────────────────────
  // بيشغّل 3 queries مفلترة (اسم/رقم ملف/هاتف) ويدمج النتائج. التكلفة: لـ
  // البحث الكامل = حد أقصى 90 قراءة (3×30) — بدل 5000 قراءة في النسخة القديمة.
  const searchOnServer = useCallback(async (term: string): Promise<void> => {
    if (!enabled || !userId) return;
    const trimmed = String(term || '').trim();
    if (trimmed.length < 2) return;

    const sessionKey = sessionKeyRef.current;
    const summariesRef = collection(db, 'users', userId, 'patientSummaries');
    const queries: Promise<{ docs: DocumentSnapshot[] }>[] = [];

    // (1) بحث بالاسم — prefix match على patientFileNameKey باستخدام
    // الحيلة المعروفة: range query من النص لنفس النص + أعلى حرف يونيكود
    // ('' في Private Use Area). Firestore بيقارن lexicographically.
    const normalizedName = buildPatientFileNameKey(trimmed);
    if (normalizedName) {
      queries.push(getDocs(query(
        summariesRef,
        where('patientFileNameKey', '>=', normalizedName),
        where('patientFileNameKey', '<=', normalizedName + ''),
        limit(30),
      )));
    }

    // (2) بحث برقم الملف — exact match
    const fileNum = Number(trimmed);
    if (Number.isFinite(fileNum) && fileNum > 0) {
      queries.push(getDocs(query(
        summariesRef,
        where('patientFileNumber', '==', fileNum),
        limit(30),
      )));
    }

    // (3) بحث بالهاتف — array-contains (الـCloud Function بيخزّن phones كـarray)
    const phoneDigits = trimmed.replace(/\D/g, '');
    if (phoneDigits.length >= 5) {
      queries.push(getDocs(query(
        summariesRef,
        where('phones', 'array-contains', phoneDigits),
        limit(30),
      )));
    }

    if (queries.length === 0) return;

    setFetchingMore(true);
    try {
      const snaps = await Promise.all(queries);
      if (sessionKeyRef.current !== sessionKey) return;
      // دمج فريد بـpatientFileNameKey
      const unique = new Map<string, DoctorPatientSummary>();
      for (const snap of snaps) {
        snap.docs.forEach((d) => {
          const summary = mapDocToSummary(d);
          unique.set(summary.patientFileNameKey, summary);
        });
      }
      setItems(Array.from(unique.values()));
      setIsInSearchMode(true);
      setHasMore(false); // البحث ما عندوش pagination — كل النتائج معاكي
    } catch (error) {
      console.warn('[useDoctorPatientSummaries] searchOnServer failed:', error);
    } finally {
      if (sessionKeyRef.current === sessionKey) setFetchingMore(false);
    }
  }, [userId, enabled]);

  // ─── الخروج من وضع البحث (Clear Search) ──────────────────────────
  // بيرجّع لـbrowse mode الأصلي (الصفحة الأولى من lastVisitAtMs desc).
  const clearSearch = useCallback(async () => {
    if (!enabled || !userId) return;
    if (!isInSearchMode) return;

    const sessionKey = sessionKeyRef.current;
    const summariesRef = collection(db, 'users', userId, 'patientSummaries');
    const initialQuery = query(
      summariesRef,
      orderBy('lastVisitAtMs', 'desc'),
      limit(PAGE_SIZE + 1),
    );

    setLoading(true);
    try {
      const snap = await getDocs(initialQuery);
      if (sessionKeyRef.current !== sessionKey) return;
      const docs = snap.docs;
      const visible = docs.length > PAGE_SIZE ? docs.slice(0, PAGE_SIZE) : docs;
      setItems(visible.map(mapDocToSummary));
      setHasMore(docs.length > PAGE_SIZE);
      cursorRef.current = visible.length > 0 ? visible[visible.length - 1] : null;
      setIsInSearchMode(false);
    } catch (error) {
      console.warn('[useDoctorPatientSummaries] clearSearch failed:', error);
    } finally {
      if (sessionKeyRef.current === sessionKey) setLoading(false);
    }
  }, [userId, enabled, isInSearchMode]);

  return {
    items,
    loading,
    fetchingMore,
    hasMore,
    isInSearchMode,
    loadMore,
    searchOnServer,
    clearSearch,
  };
};
