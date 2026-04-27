// ─────────────────────────────────────────────────────────────────────────────
// Hook منطق تحقق الأطباء (useDoctorVerification)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف كل الـ state والعمليات الخاصة بشاشة تحقق الأطباء:
//   • تحميل طلبات الأطباء المعلقين (submitted + pending legacy)
//   • إجراء اعتماد طبيب (مع تحديد نوع الحساب ومدة الاشتراك)
//   • إجراء رفض طبيب (مع سبب + حظر البريد + حذف الحساب)
//   • إجراء حذف كل المعلقين دفعة واحدة (bulk cleanup للاختبار)
//   • state على مستوى كل كارد (loading/error/success) بدل global
//
// سبب الفصل: المنطق كبير ومعقد (race conditions + bulk delete + حذف متزامن).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { deleteDoc, doc, limit, setDoc, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../../services/firestore/cacheFirst';
import {
  buildDoctorUserProfilePayload,
  getDoctorUsersQuery,
  getUserProfileDocRef,
} from '../../../services/firestore/profileRoles';
import {
  isDoctorPendingVerification,
  normalizeDoctorVerificationStatus,
} from '../../../utils/doctorVerificationStatus';
import {
  BULK_DELETE_CONCURRENCY,
  BULK_DELETE_CONFIRM_PHRASE,
  PENDING_FETCH_LIMIT_PER_STATUS,
  type DoctorVerificationItem,
  type RejectConfirmState,
} from './doctorVerificationHelpers';
import { buildApprovalWhatsAppUrl } from './approvalWhatsApp';

export const useDoctorVerification = (isAdmin: boolean, userEmail: string | null | undefined) => {
  // ── بيانات الطلبات ──
  const [items, setItems] = useState<DoctorVerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isResultTruncated, setIsResultTruncated] = useState(false);

  // ── حالة التعديل على مستوى كل كارد (بدل global) ──
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [accountTypes, setAccountTypes] = useState<Record<string, 'free' | 'premium' | 'pro_max'>>({});
  const [subscriptionDurations, setSubscriptionDurations] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, 'approving' | 'rejecting' | null>>({});
  const [cardError, setCardError] = useState<Record<string, string>>({});
  const [cardSuccess, setCardSuccess] = useState<Record<string, string>>({});

  // ── مودال تأكيد الرفض ──
  const [rejectConfirm, setRejectConfirm] = useState<RejectConfirmState | null>(null);

  // ── مودال الحذف الجماعي ──
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');
  const [bulkDeleteRunning, setBulkDeleteRunning] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState<{
    done: number; total: number; succeeded: number; failed: number;
  }>({ done: 0, total: 0, succeeded: 0, failed: 0 });

  // مؤقتات مسح رسائل النجاح تلقائياً (بعد 3 ثواني)
  const successTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    const timers = successTimers.current;
    return () => { Object.values(timers).forEach(clearTimeout); };
  }, []);

  const showSuccess = (id: string, msg: string) => {
    setCardSuccess((prev) => ({ ...prev, [id]: msg }));
    if (successTimers.current[id]) clearTimeout(successTimers.current[id]);
    successTimers.current[id] = setTimeout(() => {
      setCardSuccess((prev) => ({ ...prev, [id]: '' }));
      delete successTimers.current[id];
    }, 3000);
  };

  // ── تحميل الطلبات: submitted + pending (للتوافق مع بيانات قديمة) ──
  useEffect(() => {
    if (!isAdmin) return;

    const run = async () => {
      setLoading(true);
      setFetchError('');

      try {
        const [submittedSnap, legacyPendingSnap] = await Promise.all([
          getDocsCacheFirst(
            getDoctorUsersQuery(
              where('verificationStatus', '==', 'submitted'),
              limit(PENDING_FETCH_LIMIT_PER_STATUS),
            ),
          ),
          getDocsCacheFirst(
            getDoctorUsersQuery(
              where('verificationStatus', '==', 'pending'),
              limit(PENDING_FETCH_LIMIT_PER_STATUS),
            ),
          ),
        ]);

        // نجمعهم في Map بالـ id عشان لو طبيب ظهر في الاثنين ما يظهرش مكرر
        const byId = new Map<string, DoctorVerificationItem>();
        const pushSnapshotItems = (snapshot: typeof submittedSnap) => {
          snapshot.docs.forEach((snapshotDoc) => {
            const item = snapshotDoc.data() as Record<string, any>;
            const mapped = {
              id: snapshotDoc.id,
              doctorName: item?.doctorName || item?.displayName || item?.name || '',
              doctorSpecialty: item?.doctorSpecialty || '',
              doctorWhatsApp: item?.doctorWhatsApp || '',
              doctorEmail: item?.doctorEmail || item?.email || '',
              verificationDocUrl: item?.verificationDocUrl || '',
              verificationStatus: normalizeDoctorVerificationStatus(item?.verificationStatus),
              accountType: item?.accountType === 'premium' ? 'premium'
                : item?.accountType === 'pro_max' ? 'pro_max'
                : 'free',
              createdAt: item?.createdAt || '',
            } as DoctorVerificationItem;
            if (isDoctorPendingVerification(mapped.verificationStatus)) {
              byId.set(mapped.id, mapped);
            }
          });
        };

        pushSnapshotItems(submittedSnap);
        pushSnapshotItems(legacyPendingSnap);

        // ترتيب تنازلي حسب createdAt (الأحدث أولاً)
        const data = Array.from(byId.values()).sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
        );
        setItems(data);
        setIsResultTruncated(
          submittedSnap.size >= PENDING_FETCH_LIMIT_PER_STATUS ||
          legacyPendingSnap.size >= PENDING_FETCH_LIMIT_PER_STATUS,
        );

        // تعيين القيم الافتراضية لكل كارد (نوع الحساب + مدة افتراضية 30 يوم)
        const types: Record<string, 'free' | 'premium'> = {};
        const durations: Record<string, number> = {};
        data.forEach((item) => {
          types[item.id] = item.accountType || 'free';
          durations[item.id] = 30;
        });
        setAccountTypes(types);
        setSubscriptionDurations(durations);
      } catch (err: any) {
        setFetchError(err?.message || 'تعذر تحميل طلبات الأطباء');
        setIsResultTruncated(false);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [isAdmin, refreshKey]);

  /** اعتماد طبيب: تحديث verificationStatus + إضافة بيانات الاشتراك لو premium. */
  const handleApprove = async (id: string) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approving' }));
    setCardError((prev) => ({ ...prev, [id]: '' }));

    try {
      const accountType = accountTypes[id] || 'free';
      const duration = subscriptionDurations[id] || 30;

      let applyData: Record<string, any> = {
        verificationStatus: 'approved',
        isVerified: true,
        accountType,
        reviewedAt: new Date().toISOString(),
        reviewedBy: userEmail || 'admin',
      };

      // للحسابات المدفوعة (برو أو برو ماكس): نحسب تاريخ البداية والانتهاء من المدة المختارة
      if (accountType === 'premium' || accountType === 'pro_max') {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
        applyData = {
          ...applyData,
          premiumStartDate: now.toISOString(),
          premiumExpiryDate: expiryDate.toISOString(),
          premiumNotificationSent: false,
        };
      }

      await setDoc(getUserProfileDocRef(id), buildDoctorUserProfilePayload(applyData), { merge: true });

      // ─ نفتح واتساب جاهز للطبيب ليعرف بالاعتماد. مفيش إخطار تلقائي حالياً
      //   (لا إيميل ولا واتساب API) — الـworkaround المؤقت ده تكلفته 0.
      //   لو الـpopup blocker منع الفتح، ما فيش مشكلة (الكارد بيختفي بعد الاعتماد
      //   فمفيش طريقة نعرض الـlink منفصل لاحقاً — الأدمن يقدر يكرر الـapproval لو لزم).
      const item = items.find((i) => i.id === id);
      const waUrl = buildApprovalWhatsAppUrl(item?.doctorName, item?.doctorWhatsApp);
      if (waUrl) {
        try { window.open(waUrl, '_blank', 'noopener,noreferrer'); } catch { /* popup blocker */ }
      }

      showSuccess(id, waUrl
        ? 'تم اعتماد الطبيب — افتح الواتساب لإرسال الإخطار له'
        : 'تم اعتماد الطبيب (لا يوجد رقم واتساب لإرسال إخطار)');
      setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 1500);
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, [id]: err?.message || 'تعذر اعتماد الطبيب' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  /** فتح مودال تأكيد الرفض (مع التحقق من وجود سبب). */
  const handleReject = (id: string) => {
    const reason = (rejectNotes[id] || '').trim();
    if (!reason) {
      setCardError((prev) => ({ ...prev, [id]: 'يرجى كتابة سبب الرفض قبل المتابعة' }));
      return;
    }
    const item = items.find((i) => i.id === id);
    setRejectConfirm({ id, name: item?.doctorName || 'طبيب', reason });
  };

  /**
   * تنفيذ الرفض (race condition fixed):
   *   1) حظر البريد في blacklistedEmails
   *   2) Cloud Function لحذف حساب Auth (لازم قبل حذف Firestore)
   *   3) حذف Firestore doc (لو فشل ده، المهم أن Auth اتحذف)
   */
  const executeReject = async () => {
    if (!rejectConfirm) return;
    const { id, reason } = rejectConfirm;
    setRejectConfirm(null);
    setActionLoading((prev) => ({ ...prev, [id]: 'rejecting' }));
    setCardError((prev) => ({ ...prev, [id]: '' }));

    try {
      const doctorEmail = (items.find((i) => i.id === id)?.doctorEmail || '').trim().toLowerCase();

      // الخطوة 1: حظر البريد
      if (doctorEmail) {
        await setDoc(doc(db, 'blacklistedEmails', doctorEmail), {
          email: doctorEmail,
          reason,
          blockedAt: new Date().toISOString(),
          blockedBy: userEmail || 'admin',
          type: 'rejected_verification',
        });
      }

      // الخطوة 2: Cloud Function أولاً (لحذف حساب Auth قبل Firestore)
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
      const deleteDoctorAccount = httpsCallable(functions, 'deleteDoctorAccount');
      await deleteDoctorAccount({
        doctorId: id,
        adminEmail: userEmail,
        rejectionReason: reason,
      });

      // الخطوة 3: حذف Firestore doc (بعد نجاح Cloud Function)
      try {
        await deleteDoc(getUserProfileDocRef(id));
      } catch (docErr) {
        console.warn('Auth deleted but Firestore doc removal failed (can retry):', docErr);
      }

      showSuccess(id, 'تم رفض الطبيب وحذف حسابه');
      setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 1500);
    } catch (err: any) {
      setCardError((prev) => ({ ...prev, [id]: err?.message || 'تعذر رفض الطبيب' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  /** فتح مودال الحذف الجماعي (للاختبار فقط). */
  const openBulkDelete = () => {
    if (items.length === 0) return;
    setBulkDeleteConfirmText('');
    setBulkDeleteError('');
    setBulkDeleteProgress({ done: 0, total: items.length, succeeded: 0, failed: 0 });
    setBulkDeleteOpen(true);
  };

  /**
   * تنفيذ الحذف الجماعي:
   *   - يشغل 10 workers متوازين (محدود بـ BULK_DELETE_CONCURRENCY)
   *   - يتابع التقدم ويعرض نجاح/فشل لكل طلب
   *   - يعيد ضبط عداد pendingDoctors في الداشبورد
   */
  const executeBulkDelete = async () => {
    if (bulkDeleteConfirmText.trim() !== BULK_DELETE_CONFIRM_PHRASE) {
      setBulkDeleteError(`يجب كتابة "${BULK_DELETE_CONFIRM_PHRASE}" للتأكيد.`);
      return;
    }
    if (items.length === 0) {
      setBulkDeleteOpen(false);
      return;
    }

    setBulkDeleteRunning(true);
    setBulkDeleteError('');
    const total = items.length;
    setBulkDeleteProgress({ done: 0, total, succeeded: 0, failed: 0 });

    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
      }
    } catch (tokenErr) {
      console.warn('Token refresh failed before bulk delete:', tokenErr);
    }

    const deleteDoctorAccountFn = httpsCallable(functions, 'deleteDoctorAccount');
    const targetIds = items.map((item) => item.id);

    let succeeded = 0;
    let failed = 0;
    let cursor = 0;

    // Worker: يسحب طلبات من الـ cursor ويحذفها واحد واحد
    const worker = async () => {
      while (cursor < targetIds.length) {
        const index = cursor++;
        const doctorId = targetIds[index];
        try {
          await deleteDoctorAccountFn({
            doctorId,
            adminEmail: userEmail,
            deleteReason: 'bulk-cleanup-pending-test-accounts',
          });
          try {
            await deleteDoc(getUserProfileDocRef(doctorId));
          } catch {
            // Cloud function already deleted the doc — ignore
          }
          succeeded += 1;
        } catch (err) {
          console.warn(`Bulk delete failed for ${doctorId}:`, err);
          failed += 1;
        } finally {
          setBulkDeleteProgress({ done: succeeded + failed, total, succeeded, failed });
        }
      }
    };

    const workerCount = Math.min(BULK_DELETE_CONCURRENCY, targetIds.length);
    await Promise.allSettled(Array.from({ length: workerCount }, () => worker()));

    // إعادة ضبط عداد pendingDoctors في الداشبورد عشان الشارة تختفي فوراً
    try {
      await setDoc(
        doc(db, 'settings', 'adminDashboardStats'),
        { pendingDoctors: 0 },
        { merge: true },
      );
    } catch (counterErr) {
      console.warn('Could not reset pendingDoctors counter:', counterErr);
    }

    setBulkDeleteRunning(false);

    if (failed > 0) {
      setBulkDeleteError(`فشل حذف ${failed} من ${total} طلباً. يمكنك إعادة المحاولة.`);
    } else {
      setBulkDeleteOpen(false);
      setBulkDeleteConfirmText('');
    }

    setRefreshKey((k) => k + 1);
  };

  return {
    // البيانات
    items,
    loading,
    fetchError,
    isResultTruncated,
    // لكل كارد
    rejectNotes, setRejectNotes,
    accountTypes, setAccountTypes,
    subscriptionDurations, setSubscriptionDurations,
    actionLoading,
    cardError, setCardError,
    cardSuccess,
    // مودال الرفض
    rejectConfirm, setRejectConfirm,
    // الحذف الجماعي
    bulkDeleteOpen, setBulkDeleteOpen,
    bulkDeleteConfirmText, setBulkDeleteConfirmText,
    bulkDeleteRunning,
    bulkDeleteError, setBulkDeleteError,
    bulkDeleteProgress,
    // الإجراءات
    setRefreshKey,
    handleApprove,
    handleReject,
    executeReject,
    openBulkDelete,
    executeBulkDelete,
  };
};
