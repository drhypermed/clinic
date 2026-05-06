/**
 * محرك البيانات اللحظية (useDrHyperRealtimeData):
 * هذا الـ Hook هو المسؤول عن المزامنة المباشرة مع قاعدة بيانات Firebase Firestore.
 * يضمن بقاء سجلات المرضى والروشتات الجاهزة والاشعارات محدثة دائماً دون الحاجة لإعادة تحميل الصفحة.
 * 
 * المهام الرئيسية:
 * 1. تحميل ومراقبة سجلات المرضى (Patients Records) مع ميزة التحميل الفوري من الكاش.
 * 2. تحميل ومراقبة الروشتات الجاهزة (Ready Prescriptions).
 * 3. استقبال الإشعارات اللحظية المرسلة من النظام أو السكرتارية.
 * 4. التنظيف التلقائي للسجلات القديمة جداً (أكثر من 7 سنين) لتوفير المساحة.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { collection, deleteDoc, deleteField, doc, getDocs, getDocsFromCache, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, updateDoc, where } from 'firebase/firestore';
import { PatientRecord, ReadyPrescription } from '../../types';
import { db } from '../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../services/firestore/cacheFirst';
import { getDoctorNotificationsCollectionRef } from '../../services/firestore/profileRoles';
import { sanitizeForFirestore } from './useDrHyper.helpers';
import {
  attachSeparatedConsultationsToExamRecords,
  buildGeneratedConsultationRecordId,
  buildSeparatedConsultationRecordPayload,
} from './useDrHyper.consultationRecords';
import { buildPatientFileNameKey, patientFilesService } from '../../services/patient-files';
import { DEFAULT_BRANCH_ID } from '../../services/firestore/branches';

type ShowNotification = (
  message: string,
  type?: 'success' | 'error' | 'info',
  options?: {
    event?: any;
    id?: string;
    firestoreId?: string;
  }
) => void;

interface FirestoreTimestampLike {
  toDate?: () => Date;
}

/** محول للأوقات المخزنة في Firestore إلى صيغة ISO النصية */
const toIsoMaybe = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const tsLike = value as FirestoreTimestampLike;
    if (typeof tsLike.toDate === 'function') {
      return tsLike.toDate().toISOString();
    }
  }
  return undefined;
};

/** توحيد صيغة الـ date (string / Timestamp / Date / number) إلى ISO string موحّد */
const normalizeRecordDateField = (raw: unknown): string => {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return new Date(raw).toISOString();
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === 'object') {
    const ts = raw as { toDate?: () => Date; seconds?: number };
    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
    if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000).toISOString();
  }
  return '';
};

/** تحويل البيانات الخام المجلوبة من Firestore إلى كائن "روشتة جاهزة" متوافق مع النوع */
const mapReadyPrescription = (
  id: string,
  raw: unknown
): ReadyPrescription => {
  const data = (raw && typeof raw === 'object'
    ? (raw as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  return {
    id,
    name: String(data.name || 'روشتة جاهزة بدون اسم'),
    rxItems: Array.isArray(data.rxItems) ? data.rxItems : [],
    generalAdvice: Array.isArray(data.generalAdvice) ? data.generalAdvice : [],
    labInvestigations: Array.isArray(data.labInvestigations) ? data.labInvestigations : [],
    createdAt: toIsoMaybe(data.createdAt),
    updatedAt: toIsoMaybe(data.updatedAt),
  } as ReadyPrescription;
};

interface MinimalUserArgs {
  uid: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination الـrecords — تقليل تكلفة Firestore عند فتح التطبيق
// ─────────────────────────────────────────────────────────────────────────────
// السلوك القديم: نقرا حد أقصى 10,000 سجل دفعة واحدة كل ما الطبيب يفتح التطبيق.
// السلوك الجديد (paginated mode): نقرا 50 سجل بس مبدئياً، والباقي عند الطلب
// (loadMoreRecords / ensureFullRecordsLoaded). توفير من 10,000 لـ 50 قراءة
// = ~99% للمرة الأولى على جهاز/متصفح جديد.
//
// الـpagination مفعّل افتراضياً عشان التطبيق يفضل سريع حتى لو الطبيب عنده آلاف السجلات.
// لو حصل أي مشكلة طارئة في الإنتاج، نقدر نعطّله بسرعة بطريقتين:
//   1) env var وقت البناء:  VITE_RECORDS_PAGINATION_ENABLED=false
//   2) localStorage على الجهاز: dh_records_pagination_enabled = "false"
// أي حاجة تانية (فاضي/true/قيمة عشوائية) = الـpagination شغّال.
const RECORDS_PAGINATION_STORAGE_KEY = 'dh_records_pagination_enabled';
const DEFAULT_RECORDS_PAGE_SIZE = 50;
const LEGACY_RECORDS_LIMIT = 10000;

const isTruthyFlag = (value: unknown): boolean => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

const isFalsyFlag = (value: unknown): boolean => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off';
};

/**
 * الـpagination مفعّل افتراضياً. لإطفائه:
 *   1) env var: VITE_RECORDS_PAGINATION_ENABLED=false
 *   2) localStorage: dh_records_pagination_enabled = "false"
 *
 * مهم: حتى لو الـflag مفعّل، الـpaginated mode بيشتغل بس لما dateMs migration
 * يكون اتعمل (السجلات القديمة عندها dateMs). أول session على جهاز جديد بيحمّل
 * كامل عشان migration يجري، والـsessions اللي بعدها بـ50 سجل بس.
 */
const isRecordsPaginationRequested = (): boolean => {
  if (isFalsyFlag(import.meta.env.VITE_RECORDS_PAGINATION_ENABLED)) return false;
  try {
    if (isFalsyFlag(localStorage.getItem(RECORDS_PAGINATION_STORAGE_KEY))) return false;
  } catch {
    // الـlocalStorage مش متاح — نكمل بالافتراضي (مفعّل)
  }
  return true;
};

/** حجم الصفحة — قابل للتجاوز عبر env var (للأمان: بين 20 و200). */
const getRecordsPageSize = (): number => {
  const parsed = Number(import.meta.env.VITE_RECORDS_PAGE_SIZE);
  if (!Number.isFinite(parsed)) return DEFAULT_RECORDS_PAGE_SIZE;
  return Math.max(20, Math.min(200, Math.floor(parsed)));
};

interface UseDrHyperRealtimeDataArgs {
  user: MinimalUserArgs | null | undefined;
  showNotification: ShowNotification;
  /** الفرع النشط — لو تم تمريره يتم فلترة السجلات حسبه */
  activeBranchId?: string;
}

export const useDrHyperRealtimeData = ({
  user,
  showNotification,
  activeBranchId,
}: UseDrHyperRealtimeDataArgs) => {
  const [records, setRecords] = useState<PatientRecord[]>([]); // قائمة سجلات المرضى
  const [recordsLoadingMore, setRecordsLoadingMore] = useState(false); // أثناء loadMore
  const [recordsHasMore, setRecordsHasMore] = useState(false); // فيه صفحات قدام؟
  const [recordsPagingEnabled, setRecordsPagingEnabled] = useState(false); // الـflag مفعّل؟
  const [recordsFullyLoaded, setRecordsFullyLoaded] = useState(true); // كل السجلات محملة؟
  const [readyPrescriptions, setReadyPrescriptions] = useState<ReadyPrescription[]>([]); // قائمة الروشتات الجاهزة
  const showNotificationRef = useRef(showNotification);
  const recordsMigrationInFlightRef = useRef(false);
  const patientFilesMigrationInFlightRef = useRef(false);
  const patientFilesSeniorityIndexedRef = useRef(false);
  // refs لـpagination — مستخدمة داخل الـuseEffect بدون retrigger renders.
  const recordsPageCursorRef = useRef<any | null>(null);
  const recordsHasMoreRef = useRef(false);
  const recordsLoadingMoreRef = useRef(false);
  const recordsFullyLoadedRef = useRef(true);
  const recordsFullLoadInFlightRef = useRef<Promise<void> | null>(null);
  const loadMoreRecordsRef = useRef<() => Promise<void>>(async () => {});
  const ensureFullRecordsLoadedRef = useRef<() => Promise<void>>(async () => {});
  // guards: تضمن تشغيل migration مرة واحدة فقط لمنع feedback loop (كتابة Firestore تولد snapshot جديد)
  const legacyConsultationsMigratedRef = useRef(false);
  const patientFilesBackfillDoneRef = useRef(false);
  // مرجع لدالة التحديث اليدوي — تُستدعى من خارج الـ hook بعد الحفظ/الحذف
  const refreshRecordsFromCacheRef = useRef<() => Promise<void>>(async () => {});

  // Helpers لتزامن state و ref معاً (state للرندر، ref للـclosures داخل useEffect).
  const markRecordsHasMore = useCallback((value: boolean) => {
    recordsHasMoreRef.current = value;
    setRecordsHasMore(value);
  }, []);
  const markRecordsLoadingMore = useCallback((value: boolean) => {
    recordsLoadingMoreRef.current = value;
    setRecordsLoadingMore(value);
  }, []);
  const markRecordsFullyLoaded = useCallback((value: boolean) => {
    recordsFullyLoadedRef.current = value;
    setRecordsFullyLoaded(value);
  }, []);

  // تحديث المرجع لضمان استخدام أحدث نسخة من دالة الإشعارات داخل UseEffect
  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  // --- 1. تحميل سجلات المرضى (بدون listener دائم — توفير قراءات Firestore) ---
  // الاستراتيجية:
  //   1) عرض فوري من الكاش المحلي (0 قراءات).
  //   2) قراءة واحدة من السيرفر لضمان تحديث البيانات (≈ عدد السجلات).
  //   3) refreshRecordsFromCacheRef: يُستدعى بعد الحفظ/الحذف ليقرأ من الكاش
  //      (الذي يحدّثه Firestore SDK تلقائياً بعد الكتابة الناجحة) — بدون قراءات سيرفر.
  useEffect(() => {
    if (!user) {
      setRecords([]);
      patientFilesSeniorityIndexedRef.current = false;
      legacyConsultationsMigratedRef.current = false;
      patientFilesBackfillDoneRef.current = false;
      refreshRecordsFromCacheRef.current = async () => {};
      return;
    }

    patientFilesSeniorityIndexedRef.current = false;
    legacyConsultationsMigratedRef.current = false;
    patientFilesBackfillDoneRef.current = false;

    const maybeMigrateLegacyConsultations = async (loadedRecords: PatientRecord[]) => {
      if (recordsMigrationInFlightRef.current) return;
      const operations: Promise<unknown>[] = [];

      loadedRecords.forEach((record) => {
        if (record.isConsultationOnly && record.consultation) {
          const flattenedPayload = sanitizeForFirestore(
            buildSeparatedConsultationRecordPayload({
              baseRecord: record,
              consultation: record.consultation,
              sourceExamRecordId: record.sourceExamRecordId,
              sourceExamDate: record.sourceExamDate,
            }),
          ) as Record<string, unknown>;

          operations.push(
            setDoc(
              doc(db, 'users', user.uid, 'records', record.id),
              {
                ...flattenedPayload,
                consultation: deleteField(),
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            ),
          );
          return;
        }

        if (record.isConsultationOnly || !record.consultation) return;

        const consultationRecordId = buildGeneratedConsultationRecordId(record.id, record.consultation?.date || record.date);
        const consultationPayload = sanitizeForFirestore(
          buildSeparatedConsultationRecordPayload({
            baseRecord: record,
            consultation: record.consultation,
            sourceExamRecordId: record.id,
            sourceExamDate: record.date,
          }),
        ) as Record<string, unknown>;

        operations.push(
          setDoc(
            doc(db, 'users', user.uid, 'records', consultationRecordId),
            {
              ...consultationPayload,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
            },
            { merge: true },
          ),
        );
        operations.push(
          updateDoc(doc(db, 'users', user.uid, 'records', record.id), {
            consultation: deleteField(),
            updatedAt: serverTimestamp(),
          }),
        );
      });

      if (operations.length === 0) return;

      recordsMigrationInFlightRef.current = true;
      try {
        await Promise.all(operations);
        showNotificationRef.current('تم فصل الاستشارات القديمة إلى سجلات مستقلة تلقائيا', 'info');
      } catch (error) {
        console.error('Error migrating legacy consultation records:', error);
      } finally {
        recordsMigrationInFlightRef.current = false;
      }
    };

    const maybeBackfillPatientFiles = async (loadedRecords: PatientRecord[], allowMutations: boolean) => {
      if (!allowMutations) return;
      if (patientFilesMigrationInFlightRef.current) return;

      patientFilesMigrationInFlightRef.current = true;
      try {
        if (!patientFilesSeniorityIndexedRef.current) {
          await patientFilesService.ensurePatientFilesSeniorityIndex(user.uid, loadedRecords);
          patientFilesSeniorityIndexedRef.current = true;
        }

        const candidates = loadedRecords.filter((record) => {
          const expectedNameKey = buildPatientFileNameKey(record.patientName);
          if (!expectedNameKey) return false;

          const hasFileId = String(record.patientFileId || '').trim().length > 0;
          const fileNumber = Number(record.patientFileNumber);
          const hasFileNumber = Number.isFinite(fileNumber) && fileNumber > 0;
          const hasMatchingNameKey = String(record.patientFileNameKey || '').trim() === expectedNameKey;

          return !hasFileId || !hasFileNumber || !hasMatchingNameKey;
        });

        if (candidates.length === 0) return;

        const samplesByNameKey = new Map<string, { patientName: string; phone?: string }>();

        candidates.forEach((record) => {
          const nameKey = buildPatientFileNameKey(record.patientName);
          if (!nameKey) return;

          const sample = samplesByNameKey.get(nameKey);
          const phoneText = String(record.phone || '').trim();

          if (!sample) {
            samplesByNameKey.set(nameKey, {
              patientName: record.patientName,
              ...(phoneText ? { phone: phoneText } : {}),
            });
            return;
          }

          if (!sample.phone && phoneText) {
            samplesByNameKey.set(nameKey, {
              ...sample,
              phone: phoneText,
            });
          }
        });

        const ensuredByNameKey = new Map<string, { patientFileId: string; patientFileNumber: number; patientFileNameKey: string }>();

        for (const [nameKey, sample] of samplesByNameKey.entries()) {
          const ensured = await patientFilesService.ensurePatientFileReference(
            user.uid,
            sample.patientName,
            sample.phone
          );
          if (ensured) {
            ensuredByNameKey.set(nameKey, ensured);
          }
        }

        const updates: Promise<unknown>[] = [];

        candidates.forEach((record) => {
          const nameKey = buildPatientFileNameKey(record.patientName);
          if (!nameKey) return;

          const ensured = ensuredByNameKey.get(nameKey);
          if (!ensured) return;

          const currentFileId = String(record.patientFileId || '').trim();
          const currentNameKey = String(record.patientFileNameKey || '').trim();
          const currentFileNumber = Number(record.patientFileNumber);

          const needsFileId = currentFileId !== ensured.patientFileId;
          const needsNameKey = currentNameKey !== ensured.patientFileNameKey;
          const needsFileNumber = !Number.isFinite(currentFileNumber) || currentFileNumber !== ensured.patientFileNumber;

          if (!needsFileId && !needsNameKey && !needsFileNumber) return;

          updates.push(
            updateDoc(doc(db, 'users', user.uid, 'records', record.id), {
              patientFileId: ensured.patientFileId,
              patientFileNumber: ensured.patientFileNumber,
              patientFileNameKey: ensured.patientFileNameKey,
              updatedAt: serverTimestamp(),
            }),
          );
        });

        if (updates.length > 0) {
          await Promise.all(updates);
        }
      } catch (error) {
        console.error('Error backfilling patient file fields:', error);
      } finally {
        patientFilesMigrationInFlightRef.current = false;
      }
    };

    // مفتاح localStorage للتحقق من انتهاء migration الخاص بـ dateMs للمستخدم الحالي.
    // dateMs ضروري للـpaginated mode عشان نعمل orderBy('dateMs'). للـlegacy mode
    // مش لازم لكن بيتحدّث برضو عشان لو الطبيب فعّل الـpagination flag بعدين، السجلات
    // القديمة تكون جاهزة بدون ضياع.
    const DATE_MS_MIGRATION_KEY = `dh_dateMs_migrated_${user.uid}`;
    const isDateMsMigrated = (() => {
      try {
        return localStorage.getItem(DATE_MS_MIGRATION_KEY) === '1';
      } catch {
        return false;
      }
    })();

    // Migration لـ dateMs: يكتب dateMs للسجلات القديمة اللي ما عندهاش.
    // مفيد لاستعلامات التاريخ المستقبلية (fetchRecordsByDateRange).
    const maybeBackfillDateMs = async (loadedRecords: PatientRecord[]) => {
      if (isDateMsMigrated) return;

      const toFix = loadedRecords.filter((record) => {
        const existing = (record as { dateMs?: unknown }).dateMs;
        return typeof existing !== 'number' || !Number.isFinite(existing);
      });

      if (toFix.length === 0) {
        try { localStorage.setItem(DATE_MS_MIGRATION_KEY, '1'); } catch { /* no-op */ }
        return;
      }

      const updates = toFix.map((record) => {
        const parsed = Date.parse(record.date || '');
        const computedMs = Number.isFinite(parsed) ? parsed : Date.now();
        return updateDoc(doc(db, 'users', user.uid, 'records', record.id), {
          dateMs: computedMs,
        }).catch((err) => {
          console.warn('dateMs backfill failed for record', record.id, err);
        });
      });

      try {
        await Promise.all(updates);
        localStorage.setItem(DATE_MS_MIGRATION_KEY, '1');
      } catch (error) {
        console.error('dateMs migration error:', error);
      }
    };

    // handleSnap: يحوّل docs إلى PatientRecord[] ويحدّث الـstate.
    //   - mode='replace': يستبدل records بالكامل (Initial load أو ensureFull).
    //   - mode='merge': يدمج مع records الموجودة (loadMore — يضيف 50 على الموجود).
    //   - allowMutations=true: يشغّل migrations + auto-delete (لازم تكون البيانات كاملة).
    //     في paginated mode للـinitial page = false (البيانات partial). يبقى true في
    //     ensureFull و legacy initial server.
    const handleSnap = (
      snapshot: any,
      allowMutations: boolean,
      mode: 'replace' | 'merge' = 'replace',
    ) => {
      const loadedRecordsRaw = snapshot.docs.map((docSnapshot: any) => {
        const raw = docSnapshot.data() as Omit<PatientRecord, 'id'>;
        // توحيد صيغة الـ date عشان كل الترتيبات والفلاتر تشتغل بدون فروقات نوع
        return {
          id: docSnapshot.id,
          ...raw,
          date: normalizeRecordDateField((raw as { date?: unknown }).date),
        };
      }) as PatientRecord[];

      // ترتيب من الأحدث للأقدم client-side (بدل orderBy اللي كان بيضيّع سجلات)
      loadedRecordsRaw.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      // migration تشتغل مرة واحدة فقط على أول snapshot من السيرفر (مش كاش)
      // لمنع feedback loop: كتابة Firestore ← snapshot جديد ← migration تاني ← ...
      // مهم: في paginated mode، migrations ما تشتغلش على partial data — هتشتغل
      // فقط لما الـcaller يمرر allowMutations=true (يعني full data set).
      if (allowMutations && !legacyConsultationsMigratedRef.current) {
        legacyConsultationsMigratedRef.current = true;
        void maybeMigrateLegacyConsultations(loadedRecordsRaw);
      }
      if (allowMutations && !patientFilesBackfillDoneRef.current) {
        patientFilesBackfillDoneRef.current = true;
        void maybeBackfillPatientFiles(loadedRecordsRaw, true);
      }
      if (allowMutations) {
        void maybeBackfillDateMs(loadedRecordsRaw);
      }

      const loadedRecords = attachSeparatedConsultationsToExamRecords(loadedRecordsRaw);

      // فلترة حسب الفرع النشط (البيانات القديمة بدون branchId تُعتبر تابعة للفرع الرئيسي)
      const filteredRecords = activeBranchId
        ? loadedRecords.filter(r => (r.branchId || DEFAULT_BRANCH_ID) === activeBranchId)
        : loadedRecords;

      if (mode === 'merge') {
        // دمج مع records الموجودة بدون تكرار، مع إعادة فرز/فلترة الفرع.
        setRecords((prev) => {
          const byId = new Map<string, PatientRecord>(prev.map((r) => [r.id, r]));
          filteredRecords.forEach((r) => byId.set(r.id, r));
          let merged = Array.from(byId.values());
          merged = attachSeparatedConsultationsToExamRecords(merged);
          if (activeBranchId) {
            merged = merged.filter((r) => (r.branchId || DEFAULT_BRANCH_ID) === activeBranchId);
          }
          merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          return merged;
        });
      } else {
        setRecords(filteredRecords);
      }

      // تنظيف تلقائي: حذف السجلات الأقدم من 7 سنوات.
      // يشتغل فقط من snapshot السيرفر مع full data (allowMutations=true) لتفادي
      // حذف سجل لأنه مش في paginated page (لو شغّلنا على 50 سجل، السجلات القديمة
      // الباقية في Firestore هتتحذف بالغلط).
      if (allowMutations) {
        const SEVEN_YEARS_MS = 7 * 365 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        loadedRecords.forEach((record) => {
          const recordDateMs = new Date(record.date).getTime();
          if (now - recordDateMs > SEVEN_YEARS_MS) {
            deleteDoc(doc(db, 'users', user.uid, 'records', record.id))
              .catch((err) => console.error('Auto-delete failed', err));
          }
        });
      }
    };

    let cancelled = false;

    // ─── تحديد الوضع: paginated أو legacy ────────────────────────────
    // paginated mode بيشتغل لو الـflag مفعّل + dateMs migrated (عشان نقدر
    // نـorderBy('dateMs') بدون ضياع السجلات القديمة بدون dateMs).
    const paginationRequested = isRecordsPaginationRequested();
    const pagedRecordsEnabled = paginationRequested && isDateMsMigrated;
    const recordsPageSize = getRecordsPageSize();
    setRecordsPagingEnabled(pagedRecordsEnabled);
    markRecordsFullyLoaded(!pagedRecordsEnabled); // legacy = كل حاجة محملة فوراً

    // legacy query (full load): الـquery ده هو نفسه refresh-from-cache بعد كل
    // حفظ. paginated بيستخدم cursors منفصلة فمش محتاجين الـq هنا.
    const legacyQuery = query(collection(db, 'users', user.uid, 'records'), limit(LEGACY_RECORDS_LIMIT));

    if (pagedRecordsEnabled) {
      // ════════════ PAGINATED MODE ════════════
      // أول page (50 سجل بـorderBy dateMs desc). +1 عشان نعرف لو فيه صفحات بعد.
      const initialPagedQuery = query(
        collection(db, 'users', user.uid, 'records'),
        orderBy('dateMs', 'desc'),
        limit(recordsPageSize + 1),
      );

      const handlePagedSnap = (
        snapshot: any,
        allowMutations: boolean,
        mode: 'replace' | 'merge',
      ) => {
        const docs = Array.isArray(snapshot.docs) ? snapshot.docs : [];
        const visibleDocs = docs.length > recordsPageSize ? docs.slice(0, recordsPageSize) : docs;
        const hasMore = docs.length > recordsPageSize;
        recordsPageCursorRef.current = visibleDocs.length > 0
          ? visibleDocs[visibleDocs.length - 1]
          : null;
        markRecordsHasMore(hasMore);
        // mutate=false دايماً للـpaginated initial — البيانات partial، مش وقت migrations.
        handleSnap({ docs: visibleDocs }, allowMutations, mode);
      };

      // (1) من الكاش فوراً — 0 قراءات سيرفر
      getDocsCacheFirst(initialPagedQuery).then((snap) => {
        if (cancelled || snap.empty) return;
        handlePagedSnap(snap, false, 'replace');
      }).catch(() => {});

      // (2) قراءة سيرفر — 51 قراءة بدل 10K (توفير ~99%)
      getDocs(initialPagedQuery).then((snap) => {
        if (cancelled) return;
        handlePagedSnap(snap, false, 'replace');
      }).catch((error) => {
        if (cancelled) return;
        console.error('Error loading paginated records:', error);
        showNotificationRef.current('حدث خطأ في تحميل السجلات', 'error');
      });

      // loadMore: يجيب 50 إضافية بـstartAfter cursor.
      loadMoreRecordsRef.current = async () => {
        if (cancelled || recordsLoadingMoreRef.current || !recordsHasMoreRef.current) return;
        const cursor = recordsPageCursorRef.current;
        if (!cursor) return;

        markRecordsLoadingMore(true);
        try {
          const snap = await getDocs(query(
            collection(db, 'users', user.uid, 'records'),
            orderBy('dateMs', 'desc'),
            startAfter(cursor),
            limit(recordsPageSize + 1),
          ));
          if (!cancelled) handlePagedSnap(snap, false, 'merge');
        } catch (err) {
          if (!cancelled) {
            console.error('loadMoreRecords failed:', err);
            showNotificationRef.current('تعذر تحميل المزيد من السجلات', 'error');
          }
        } finally {
          if (!cancelled) markRecordsLoadingMore(false);
        }
      };

      // ensureFullRecordsLoaded: يجيب كل السجلات مرة واحدة (legacy load).
      // بيتنادى من الصفحات اللي محتاجة كل التاريخ (مثلاً ensureSnapshots).
      // بعد التحميل الكامل، بنشغّل migrations + auto-delete (allowMutations=true).
      ensureFullRecordsLoadedRef.current = async () => {
        if (cancelled || recordsFullyLoadedRef.current) return;
        if (recordsFullLoadInFlightRef.current) {
          await recordsFullLoadInFlightRef.current;
          return;
        }
        const run = (async () => {
          try {
            const snap = await getDocs(legacyQuery);
            if (cancelled) return;
            handleSnap(snap, true, 'replace');
            recordsPageCursorRef.current = null;
            markRecordsHasMore(false);
            markRecordsFullyLoaded(true);
          } catch (err) {
            if (!cancelled) {
              console.error('ensureFullRecordsLoaded failed:', err);
              showNotificationRef.current('تعذر تحميل كل السجلات الآن', 'error');
            }
          } finally {
            recordsFullLoadInFlightRef.current = null;
          }
        })();
        recordsFullLoadInFlightRef.current = run;
        await run;
      };

      refreshRecordsFromCacheRef.current = async () => {
        if (cancelled) return;
        // لو السجلات اتحملت كاملة، نقرا من الـlegacyQuery cache.
        // لو لسه paginated، نقرا من الـinitialPagedQuery cache.
        const queryToUse = recordsFullyLoadedRef.current ? legacyQuery : initialPagedQuery;
        try {
          const snap = await getDocsFromCache(queryToUse);
          if (cancelled) return;
          if (recordsFullyLoadedRef.current) {
            handleSnap(snap, false, 'replace');
          } else {
            handlePagedSnap(snap, false, 'replace');
          }
        } catch {
          // الكاش غير متاح — نتجاهل بصمت
        }
      };
    } else {
      // ════════════ LEGACY MODE (السلوك القديم بالظبط) ════════════
      // (1) عرض من الكاش فوراً — 0 قراءات
      getDocsCacheFirst(legacyQuery).then((snap) => {
        if (cancelled || snap.empty) return;
        handleSnap(snap, false, 'replace');
      }).catch(() => { });

      // (2) قراءة سيرفر واحدة بـlimit(10000) — تشغّل migrations + auto-delete
      getDocs(legacyQuery).then((snap) => {
        if (cancelled) return;
        handleSnap(snap, true, 'replace');
      }).catch((error) => {
        if (cancelled) return;
        console.error('Error loading records:', error);
        showNotificationRef.current('حدث خطأ في تحميل السجلات', 'error');
      });

      refreshRecordsFromCacheRef.current = async () => {
        if (cancelled) return;
        try {
          const snap = await getDocsFromCache(legacyQuery);
          if (!cancelled) handleSnap(snap, false, 'replace');
        } catch {
          // الكاش غير متاح — نتجاهل بصمت
        }
      };

      // legacy mode: مفيش loadMore أو ensureFull — كل حاجة محملة بالفعل.
      loadMoreRecordsRef.current = async () => {};
      ensureFullRecordsLoadedRef.current = async () => {};
    }

    return () => {
      cancelled = true;
      refreshRecordsFromCacheRef.current = async () => {};
      loadMoreRecordsRef.current = async () => {};
      ensureFullRecordsLoadedRef.current = async () => {};
    };
  }, [user, activeBranchId, markRecordsFullyLoaded, markRecordsHasMore, markRecordsLoadingMore]);

  // --- 2. مراقبة الروشتات الجاهزة ---
  useEffect(() => {
    if (!user) {
      setReadyPrescriptions([]);
      return;
    }

    const q = query(collection(db, 'users', user.uid, 'readyPrescriptions'));
    const handleSnap = (snapshot: any) => {
      const loadedPresets = snapshot.docs.map((docSnapshot: any) =>
        mapReadyPrescription(docSnapshot.id, docSnapshot.data())
      );
      setReadyPrescriptions(loadedPresets);
    };

    // الروشتات الجاهزة بتتغير لما الدكتور يحفظ واحدة جديدة بس — كاش يكفي
    let cancelled = false;
    getDocsCacheFirst(q).then((snap) => {
      if (!cancelled && !snap.empty) handleSnap(snap);
    }).catch(() => {
      if (!cancelled) showNotificationRef.current('حدث خطأ في تحميل الروشتات الجاهزة', 'error');
    });

    return () => { cancelled = true; };
  }, [user]);

  // --- 3. مراقبة الإشعارات اللحظية من السيرفر ---
  useEffect(() => {
    if (!user) return;
    // جلب الإشعارات التي أُنشئت في آخر 30 دقيقة فقط
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const q = query(
      getDoctorNotificationsCollectionRef(user.uid),
      where('createdAt', '>=', thirtyMinsAgo),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // نركز فقط على الإشعارات الجديدة المضافة (Added)
        if (change.type === 'added') {
          const data = change.doc.data();
          // تذكير انتهاء اشتراك برو له شريط ثابت داخل الصفحة الرئيسية
          // لذلك لا نعرضه كـ Toast عائم في منتصف الشاشة.
          const rawMessage = String(data?.message || '');
          if (data.type === 'premium-expiry' || rawMessage.includes('اشتراك برو سينتهي')) return;

          showNotificationRef.current(
            data.message || 'إشعار جديد',
            data.type || 'info',
            { firestoreId: change.doc.id } as any
          );
        }
      });
    }, (error) => {
      if ((error as { code?: string })?.code === 'permission-denied') {
        return;
      }
      console.error('Error loading notifications:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // دالة تحديث السجلات من الكاش — تُستدعى من خارج الـ hook بعد الحفظ/الحذف
  // لتعكس التغييرات في القائمة المحلية دون قراءات سيرفر إضافية.
  const refreshRecords = useCallback(async () => {
    await refreshRecordsFromCacheRef.current();
  }, []);

  // تحميل المزيد من السجلات (paginated mode فقط — في legacy = no-op).
  const loadMoreRecords = useCallback(async () => {
    await loadMoreRecordsRef.current();
  }, []);

  // تحميل كل السجلات (للصفحات اللي محتاجة التاريخ كامل، مثلاً ensureSnapshots).
  // في legacy mode = no-op لأن records محمّلة بالفعل.
  const ensureFullRecordsLoaded = useCallback(async () => {
    await ensureFullRecordsLoadedRef.current();
  }, []);

  // دمج سجلات جاية من السيرفر مع القائمة الحالية (بدون تكرار).
  // يطبّق نفس ترتيب وفلترة الفرع اللي في handleSnap عشان النتيجة متسقة.
  const mergeServerRecords = useCallback(
    (docs: { id: string; data: () => unknown }[]) => {
      if (docs.length === 0) return;
      const incoming = docs.map((docSnapshot) => {
        const raw = (docSnapshot.data() || {}) as Record<string, unknown>;
        return {
          id: docSnapshot.id,
          ...(raw as Omit<PatientRecord, 'id'>),
          date: normalizeRecordDateField(raw.date),
        } as PatientRecord;
      });

      setRecords((prev) => {
        const byId = new Map<string, PatientRecord>(prev.map((r) => [r.id, r]));
        incoming.forEach((rec) => byId.set(rec.id, rec));
        let merged = Array.from(byId.values());
        merged = attachSeparatedConsultationsToExamRecords(merged);
        if (activeBranchId) {
          merged = merged.filter((r) => (r.branchId || DEFAULT_BRANCH_ID) === activeBranchId);
        }
        merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        return merged;
      });
    },
    [activeBranchId],
  );

  // بحث على السيرفر باسم المريض / تليفون / رقم الملف.
  // يرجع عدد السجلات اللي اتجابت (للـ UI يعرف لو لسه محتاج يعمل fallback).
  const searchRecordsOnServer = useCallback(
    async (term: string): Promise<number> => {
      const trimmed = String(term || '').trim();
      if (!user || trimmed.length < 2) return 0;

      const normalizedName = buildPatientFileNameKey(trimmed);
      const fileNum = Number(trimmed);
      const phoneDigits = trimmed.replace(/\D/g, '');

      const recordsRef = collection(db, 'users', user.uid, 'records');
      const queries: Promise<{ docs: { id: string; data: () => unknown }[] }>[] = [];

      if (normalizedName) {
        queries.push(
          getDocs(
            query(
              recordsRef,
              where('patientFileNameKey', '>=', normalizedName),
              where('patientFileNameKey', '<=', normalizedName + '\uf8ff'),
              limit(30),
            ),
          ),
        );
      }

      if (Number.isFinite(fileNum) && fileNum > 0) {
        queries.push(
          getDocs(query(recordsRef, where('patientFileNumber', '==', fileNum), limit(30))),
        );
      }

      if (phoneDigits.length >= 5) {
        queries.push(
          getDocs(query(recordsRef, where('phone', '==', phoneDigits), limit(30))),
        );
      }

      if (queries.length === 0) return 0;

      try {
        const snaps = await Promise.all(queries);
        const uniqueDocs = new Map<string, { id: string; data: () => unknown }>();
        snaps.forEach((snap) => {
          snap.docs.forEach((d) => uniqueDocs.set(d.id, d));
        });
        const docs = Array.from(uniqueDocs.values());
        mergeServerRecords(docs);
        return docs.length;
      } catch (error) {
        console.error('searchRecordsOnServer failed:', error);
        return 0;
      }
    },
    [user, mergeServerRecords],
  );

  // جلب سجلات نطاق تاريخ من السيرفر — مستخدم في:
  //  • فلتر التاريخ في صفحة السجلات (يوم/شهر).
  //  • تحميل سجلات السنة في التقارير المالية والرئيسية (paginated mode).
  // الحدّ مرفوع لـ5000 عشان السنة كاملة تتحمّل في طلب واحد (طبيب نشط ~1500
  // سجل/سنة، 5000 يدّينا هامش أمان كبير).
  const fetchRecordsByDateRange = useCallback(
    async (startMs: number, endMs: number): Promise<number> => {
      if (!user) return 0;
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 0;
      if (endMs < startMs) return 0;

      const recordsRef = collection(db, 'users', user.uid, 'records');
      try {
        const snap = await getDocs(
          query(
            recordsRef,
            where('dateMs', '>=', startMs),
            where('dateMs', '<=', endMs),
            limit(5000),
          ),
        );
        mergeServerRecords(snap.docs);
        return snap.docs.length;
      } catch (error) {
        console.error('fetchRecordsByDateRange failed:', error);
        return 0;
      }
    },
    [user, mergeServerRecords],
  );

  return {
    records,
    recordsLoadingMore,
    recordsHasMore,
    recordsPagingEnabled,
    recordsFullyLoaded,
    readyPrescriptions,
    refreshRecords,
    loadMoreRecords,
    ensureFullRecordsLoaded,
    // دوال بحث سيرفر-سايد. paginated consumers بيستخدموها بدل البحث المحلي
    // اللي بيشتغل على records محملة جزئياً.
    searchRecordsOnServer,
    fetchRecordsByDateRange,
  };
};

export type DrHyperRealtimeData = ReturnType<typeof useDrHyperRealtimeData>;
