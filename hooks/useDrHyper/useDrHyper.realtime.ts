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

import { useEffect, useRef, useState } from 'react';
import { collection, deleteDoc, deleteField, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
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
  const [readyPrescriptions, setReadyPrescriptions] = useState<ReadyPrescription[]>([]); // قائمة الروشتات الجاهزة
  const showNotificationRef = useRef(showNotification);
  const recordsMigrationInFlightRef = useRef(false);
  const patientFilesMigrationInFlightRef = useRef(false);
  const patientFilesSeniorityIndexedRef = useRef(false);
  // guards: تضمن تشغيل migration مرة واحدة فقط لمنع feedback loop (كتابة Firestore تولد snapshot جديد)
  const legacyConsultationsMigratedRef = useRef(false);
  const patientFilesBackfillDoneRef = useRef(false);

  // تحديث المرجع لضمان استخدام أحدث نسخة من دالة الإشعارات داخل UseEffect
  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  // --- 1. مراقبة سجلات المرضى ---
  useEffect(() => {
    if (!user) {
      setRecords([]);
      patientFilesSeniorityIndexedRef.current = false;
      legacyConsultationsMigratedRef.current = false;
      patientFilesBackfillDoneRef.current = false;
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

    // تحميل كل سجلات المستخدم بدون orderBy عشان نضمن إنها تشمل السجلات القديمة
    // اللي قد يكون حقل date فيها متخزّن بصيغة مختلفة (Timestamp vs string).
    // النظام بيحذف تلقائياً اللي أقدم من 7 سنين، فالمجموع محدود طبيعياً.
    // الـ limit 10000 سقف أمان للحالات النادرة جداً.
    const q = query(
      collection(db, 'users', user.uid, 'records'),
      limit(10000)
    );

    /** تحويل أي صيغة date (string / Timestamp / Date / number) لـ ISO string موحّد */
    const normalizeDateField = (raw: unknown): string => {
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

    const handleSnap = (snapshot: any, allowMutations: boolean) => {
      const loadedRecordsRaw = snapshot.docs.map((docSnapshot: any) => {
        const raw = docSnapshot.data() as Omit<PatientRecord, 'id'>;
        // توحيد صيغة الـ date عشان كل الترتيبات والفلاتر تشتغل بدون فروقات نوع
        return {
          id: docSnapshot.id,
          ...raw,
          date: normalizeDateField((raw as { date?: unknown }).date),
        };
      }) as PatientRecord[];

      // ترتيب من الأحدث للأقدم client-side (بدل orderBy اللي كان بيضيّع سجلات)
      loadedRecordsRaw.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      // migration تشتغل مرة واحدة فقط على أول snapshot من السيرفر (مش كاش)
      // لمنع feedback loop: كتابة Firestore ← snapshot جديد ← migration تاني ← ...
      if (allowMutations && !legacyConsultationsMigratedRef.current) {
        legacyConsultationsMigratedRef.current = true;
        void maybeMigrateLegacyConsultations(loadedRecordsRaw);
      }
      if (allowMutations && !patientFilesBackfillDoneRef.current) {
        patientFilesBackfillDoneRef.current = true;
        void maybeBackfillPatientFiles(loadedRecordsRaw, true);
      }

      const loadedRecords = attachSeparatedConsultationsToExamRecords(loadedRecordsRaw);

      // فلترة حسب الفرع النشط (البيانات القديمة بدون branchId تُعتبر تابعة للفرع الرئيسي)
      const filteredRecords = activeBranchId
        ? loadedRecords.filter(r => (r.branchId || DEFAULT_BRANCH_ID) === activeBranchId)
        : loadedRecords;

      setRecords(filteredRecords);

      // تنظيف تلقائي: حذف السجلات الأقدم من 7 سنوات
      // يشتغل فقط من snapshot السيرفر (مش الكاش) لتفادي الحذف المتكرر
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

    getDocsCacheFirst(q).then((snap) => {
      if (!snap.empty) handleSnap(snap, false);
    }).catch(() => { });

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const isServerSnapshot = !(snapshot?.metadata?.fromCache ?? false);
      handleSnap(snapshot, isServerSnapshot);
    }, (error) => {
      console.error('Error loading records:', error);
      showNotificationRef.current('حدث خطأ في تحميل السجلات', 'error');
    });

    return () => unsubscribe();
  }, [user, activeBranchId]);

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
          // تذكير انتهاء الاشتراك المميز له شريط ثابت داخل الصفحة الرئيسية
          // لذلك لا نعرضه كـ Toast عائم في منتصف الشاشة.
          const rawMessage = String(data?.message || '');
          if (data.type === 'premium-expiry' || rawMessage.includes('الاشتراك المميز سينتهي')) return;

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

  return {
    records,
    readyPrescriptions,
  };
};

export type DrHyperRealtimeData = ReturnType<typeof useDrHyperRealtimeData>;
