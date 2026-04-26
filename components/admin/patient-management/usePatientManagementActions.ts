/**
 * هوك إجراءات إدارة الجمهور (usePatientManagementActions)
 * يوفر الدوال المنطقية للتعامل مع حسابات المرضى (تعطيل، تفعيل، حذف، حذف تقييم).
 * يضمن هذا الهوك تحديث كافة المجموعات المرتبطة في Firestore لضمان اتساق البيانات.
 */

import { deleteDoc, deleteField, doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../../../services/firebaseConfig';
import { bookingPublicService } from '../../../services/firestore/bookingPublic';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import { clearBookingReview, getPatientMetrics, isRatedBooking } from './patientUtils';
import {
  mapPatientActionError,
  safeDocId,
  sanitizeReasonInput,
} from './securityUtils';
import { UsePatientManagementActionsParams } from '../../../types';

const MAX_REASON_LENGTH = 500;

const buildWritePayload = (
  now: string,
  payload: Record<string, unknown>
): Record<string, unknown> => ({
  authRole: 'public',
  userRole: 'public',
  updatedAt: now,
  ...payload,
});

const writePatientRecordToAllCollections = async (
  patientId: string,
  payload: Record<string, unknown>,
  now: string
) => {
  const mergedPayload = buildWritePayload(now, payload);
  await setDoc(doc(db, 'users', patientId), mergedPayload, { merge: true });
};

const resolvePublicUserIdentity = async (patientId: string) => {
  const snap = await getDocCacheFirst(doc(db, 'users', patientId) as any);

  let email = '';
  let name = '';
  if (snap.exists()) {
    const data = snap.data() as Record<string, any>;
    email = String(data?.email || data?.publicProfile?.email || '').trim().toLowerCase();
    name = String(data?.displayName || data?.name || data?.publicProfile?.name || '').trim();
  }

  return { email, name };
};

export const usePatientManagementActions = ({
  isAdminUser,
  adminEmail,
  setPatients,
  setSelectedPatientReviews,
}: UsePatientManagementActionsParams) => {
  const normalizedAdminEmail = String(adminEmail || '').trim().toLowerCase() || 'admin';

  /** التحقق من صلاحيات الأدمن قبل تنفيذ أي إجراء حساس */
  const ensureAdminAccess = () => {
    if (isAdminUser) return true;
    alert('غير مصرح لك بتنفيذ هذا الإجراء.');
    return false;
  };

  /**
   * تعطيل حساب جمهور
   * يستدعي Cloud Function setPublicAccountDisabled التي تنفّذ ذرياً:
   *   Firestore + Firebase Auth (disabled=true) + إبطال tokens النشطة.
   * هذا يضمن حماية server-side لا يمكن تجاوزها من العميل.
   */
  const handleDisableAccount = async (rawPatientId: string) => {
    if (!ensureAdminAccess()) return;

    const patientId = safeDocId(rawPatientId);
    if (!patientId) {
      alert('معرف الحساب غير صالح.');
      return;
    }

    const disableReasonInput = window.prompt('الرجاء إدخال سبب تعطيل الحساب:');
    const disableReason = sanitizeReasonInput(disableReasonInput, MAX_REASON_LENGTH);

    if (!disableReason) {
      alert('يجب إدخال سبب التعطيل');
      return;
    }

    if (!window.confirm('تحذير: سيتم تعطيل حساب هذا المريض في Firebase Auth + Firestore. هل أنت متأكد؟')) return;

    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const setDisabled = httpsCallable(functions, 'setPublicAccountDisabled');
      const result = await setDisabled({ userId: patientId, disabled: true, reason: disableReason });
      const timestamp = (result.data as { timestamp?: string })?.timestamp || new Date().toISOString();

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === patientId
            ? { ...patient, isAccountDisabled: true, disabledReason: disableReason, disabledAt: timestamp }
            : patient
        )
      );
      alert('تم تعطيل حساب المريض بنجاح.');
    } catch (err: unknown) {
      console.error('Error disabling account:', err);
      alert(mapPatientActionError(err, 'حدث خطأ في تعطيل الحساب.'));
    }
  };

  /**
   * تفعيل حساب مريض معطل وتصفيره لإعادة التسجيل
   * الإجراء يتم على مرحلتين عشان يضمن إصلاح Firebase Auth + Firestore + blacklist:
   *   1) استدعاء Cloud Function setPublicAccountDisabled({ disabled: false })
   *      → يلغي disabled على مستوى Firebase Auth (يسمح بالدخول مرة أخرى)
   *      → ويحدّث Firestore بـ isAccountDisabled=false + enabledBy/enabledAt
   *   2) تصفير الأدوار من العميل: حذف authRole/userRole/role/accountType + إزالة البريد من blacklist
   * ⚠️ قبل الإصلاح: كان يستخدم setDoc مباشرة فقط → الحساب يفضل معطل في Auth ولا يقدر المستخدم يدخل.
   */
  const handleEnableAccount = async (rawPatientId: string) => {
    if (!ensureAdminAccess()) return;

    const patientId = safeDocId(rawPatientId);
    if (!patientId) {
      alert('معرف الحساب غير صالح.');
      return;
    }

    if (!window.confirm(
      '⚠️ تنبيه: هذا الإجراء ليس "تفعيل" عادي — سيُعيد الحساب للصفر:\n\n' +
      '• فك تعطيل الحساب في نظام تسجيل الدخول (Firebase Auth)\n' +
      '• حذف كل الأدوار (جمهور/طبيب/...)\n' +
      '• إزالة البريد من قائمة حظر الجمهور\n\n' +
      'المستخدم سيحتاج لإعادة التسجيل من جديد.\n\n' +
      'هل أنت متأكد؟'
    )) return;

    try {
      // تجديد التوكن لضمان تمرير claim الأدمن للـ Cloud Function
      if (auth.currentUser) await auth.currentUser.getIdToken(true);

      // المرحلة 1: فك التعطيل عبر Cloud Function (يصلح Firebase Auth + Firestore ذرياً)
      const setDisabled = httpsCallable(functions, 'setPublicAccountDisabled');
      await setDisabled({ userId: patientId, disabled: false });

      // المرحلة 2: تصفير الأدوار + إزالة البريد من blacklist (للسماح بإعادة تسجيل بنفس البريد)
      const identity = await resolvePublicUserIdentity(patientId);
      const now = new Date().toISOString();

      // مسح الحقول التي تربط الحساب بدور "جمهور" أو "طبيب" حتى يبدأ من الصفر
      await setDoc(doc(db, 'users', patientId), {
        authRole: deleteField(),
        userRole: deleteField(),
        role: deleteField(),
        accountType: deleteField(),
        verificationStatus: deleteField(),
        deletedAt: deleteField(),
        updatedAt: now,
      }, { merge: true });

      // إزالة البريد من القائمة السوداء للجمهور إن كان موجوداً (الـ rules تسمح للأدمن)
      if (identity.email) {
        try {
          await deleteDoc(doc(db, 'publicBlacklistedEmails', identity.email));
        } catch {
          // ليس فشلاً قاتلاً — البريد ربما لم يكن في القائمة أصلاً
        }
      }

      // إزالة المريض من القائمة المعروضة فوراً (لأنه لم يعد "جمهور")
      setPatients((prev) => prev.filter((patient) => patient.id !== patientId));
      alert('✅ تم فك حظر الحساب بنجاح. الحساب الآن نظيف ويمكن للمستخدم إعادة التسجيل كجمهور أو طبيب.');
    } catch (err: unknown) {
      console.error('Error enabling account:', err);
      alert(mapPatientActionError(err, 'حدث خطأ في تفعيل الحساب.'));
    }
  };

  /**
   * حذف حساب جمهور نهائياً عبر Cloud Function deletePublicAccount.
   * يحذف: Firebase Auth + Firestore doc + subcollections (bookings/reviews/notifications/...)
   * ويضيف البريد لـ publicBlacklistedEmails.
   */
  const handleDeletePatient = async (rawPatientId: string) => {
    if (!ensureAdminAccess()) return;

    const patientId = safeDocId(rawPatientId);
    if (!patientId) {
      alert('معرف الحساب غير صالح.');
      return;
    }

    const deleteReasonInput =
      window.prompt('⚠️ سيتم حذف حساب الجمهور بالكامل (بما في ذلك حجوزاته وتقييماته) ومنعه من الدخول نهائياً.\n\nأدخل سبب الحذف (اختياري):') || '';
    const deleteReason = sanitizeReasonInput(deleteReasonInput, MAX_REASON_LENGTH);

    const confirmDelete = window.confirm(
      '⚠️ تحذير نهائي: سيتم حذف الحساب + الحجوزات + التقييمات من Firebase بالكامل. لا يمكن التراجع. هل أنت متأكد؟'
    );
    if (!confirmDelete) return;

    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const deletePublic = httpsCallable(functions, 'deletePublicAccount');
      await deletePublic({ userId: patientId, deleteReason });

      // إزالة المريض من القائمة المعروضة فوراً
      setPatients((prev) => prev.filter((patient) => patient.id !== patientId));
      alert('✅ تم حذف حساب الجمهور بالكامل وإضافته لقائمة حظر الجمهور.');
    } catch (err: unknown) {
      console.error('Error deleting patient:', err);
      alert(mapPatientActionError(err, 'حدث خطأ في حذف بيانات الجمهور.'));
    }
  };

  /** 
   * حذف تقييم/مراجعة قام بها المريض 
   * يمسح نص التقييم والنجوم ويعيد حساب متوسط تقييم الطبيب المعني.
   */
  const handleDeleteReview = async (rawPatientId: string, rawBookingId: string) => {
    if (!ensureAdminAccess()) return;

    const patientId = safeDocId(rawPatientId);
    const bookingId = safeDocId(rawBookingId);
    if (!patientId || !bookingId) {
      alert('معرف التقييم غير صالح.');
      return;
    }

    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق واستبعاد تقييمه من الطبيب؟')) return;

    try {
      // مسح التقييم من سجل الحجز في Firestore
      await bookingPublicService.deletePublicUserBookingReview(patientId, bookingId);

      // تحديث الإحصائيات (Metrics) في الحالة المحلية للواجهة
      setPatients((prev) =>
        prev.map((patient) => {
          if (patient.id !== patientId) return patient;
          const updatedBookings = patient.bookings.map((booking) =>
            booking.id === bookingId ? clearBookingReview(booking) : booking
          );
          const metrics = getPatientMetrics(updatedBookings);
          return {
            ...patient,
            bookings: updatedBookings,
            totalAppointments: metrics.totalAppointments,
            completedAppointments: metrics.confirmedAppointments,
            totalReviews: metrics.totalReviews,
            averageRating: metrics.averageRating,
          };
        })
      );

      setSelectedPatientReviews((prev) => {
        if (!prev) return null;
        return prev
          .map((booking) => (booking.id === bookingId ? clearBookingReview(booking) : booking))
          .filter((booking) => isRatedBooking(booking));
      });

      alert('تم حذف التعليق واستبعاد التقييم من حساب الطبيب بنجاح.');
    } catch (err: unknown) {
      console.error('Error deleting review:', err);
      alert(mapPatientActionError(err, 'حدث خطأ في حذف التعليق.'));
    }
  };

  return {
    handleDisableAccount,
    handleEnableAccount,
    handleDeletePatient,
    handleDeleteReview,
  };
};
