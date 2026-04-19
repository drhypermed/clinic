/**
 * مزامنة بيانات السكرتارية (Secretary Data Synchronization)
 * هذا الملف مسؤول عن "تصدير" بيانات العيادة الحية إلى لوحة تحكم السكرتير:
 * 1. مزامنة مواعيد اليوم (Today's Appointments).
 * 2. مزامنة المرضى الذين أتموا الكشف مؤخراً (Recent Exams).
 * 3. مزامنة دليل المرضى (Patient Directory) للبحث السريع.
 * 4. الاشتراك في إعدادات الحجز لضمان تحديث الواجهة فورياً عند أي تغيير سحابي.
 *
 * بعد التقسيم:
 *   - `bookingConfigSync.types.ts`      : واجهات الـ payload + الثوابت.
 *   - `bookingConfigSync.transforms.ts` : دوال sanitize قبل الكتابة + map بعد القراءة.
 *   - `bookingConfigSync.writers.ts`    : دوال set* للكتابة إلى Firestore.
 *   - هذا الملف بيحتوي على subscribeToBookingConfig + re-exports.
 */

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret, normalizeEmail, toOptionalText } from './helpers';
import {
  normalizeSecretaryVitalFieldDefinitions,
  normalizeSecretaryVitalsVisibility,
} from '../../../utils/secretaryVitals';
import type {
  BookingConfigTodayAppointment,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
} from '../../../types';
import { getDocCacheFirst } from '../cacheFirst';
import type { PatientDirectoryItem, RecentExamPatient, SecretaryEntryResponse } from './types';
import type { BookingConfigSubscribePayload } from './bookingConfigSync.types';
import {
  mapEntryResponse,
  mapPatientDirectory,
  mapRecentExamPatients,
  mapTodayAppointments,
} from './bookingConfigSync.transforms';

// إعادة تصدير الأنواع والـ writers حتى لا تنكسر الـ imports القديمة
export type { BookingConfigSubscribePayload } from './bookingConfigSync.types';
export {
  setBookingConfigTodayAppointments,
  setBookingConfigTodayAppointmentsByBranch,
  setBookingConfigUpcomingAppointmentsByBranch,
  setBookingConfigCompletedAppointmentsByBranch,
  setBookingConfigRecentExamPatients,
  setBookingConfigRecentExamPatientsByBranch,
  setBookingConfigPatientDirectory,
  setBookingConfigPatientDirectoryByBranch,
} from './bookingConfigSync.writers';

/**
 * الوظيفة الرئيسية للاشتراك في كافة تحديثات لوحة السكرتير.
 * تستخدم في تطبيق السكرتارية لضمان بقاء الشاشة محدثة لحظة بلحظة ببيانات العيادة.
 */
export const subscribeToBookingConfig = (
  secret: string,
  onUpdate: (data: BookingConfigSubscribePayload) => void,
) => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) {
    onUpdate({});
    return () => undefined;
  }

  const configRef = doc(db, 'bookingConfig', normalizedSecret);

  // معالجة الـ snapshot وتحويل البيانات الخام للنموذج الموحّد
  const handleSnap = (snap: {
    exists: () => boolean;
    data: () => Record<string, unknown> | undefined;
  }) => {
    if (!snap.exists()) {
      onUpdate({});
      return;
    }

    const data = snap.data() || {};
    const result: BookingConfigSubscribePayload = {};

    if (typeof data?.userId === 'string') {
      result.userId = data.userId.trim();
    }

    // entryAlert الأحادي (الشكل القديم، قبل per-branch)
    const entry = data?.entryAlert as
      | { caseName?: unknown; createdAt?: unknown; appointmentId?: unknown }
      | undefined;
    if (
      entry &&
      typeof entry.caseName === 'string' &&
      typeof entry.createdAt === 'string' &&
      typeof entry.appointmentId === 'string'
    ) {
      result.entryAlert = {
        caseName: toOptionalText(entry.caseName) || '',
        createdAt: entry.createdAt,
        appointmentId: entry.appointmentId,
      };
    }

    const entryAlertResponse = mapEntryResponse(data?.entryAlertResponse);
    if (entryAlertResponse) {
      result.entryAlertResponse = entryAlertResponse;
    }

    const todayAppointments = mapTodayAppointments(data?.todayAppointments);
    if (todayAppointments) {
      result.todayAppointments = todayAppointments;
    }

    // قراءة مواعيد اليوم مقسّمة بالفرع (للـ per-branch isolation)
    const rawByBranch = data?.todayAppointmentsByBranch as Record<string, unknown> | undefined;
    if (rawByBranch && typeof rawByBranch === 'object' && !Array.isArray(rawByBranch)) {
      const byBranch: Record<string, BookingConfigTodayAppointment[]> = {};
      Object.keys(rawByBranch).forEach((branchId) => {
        const branchList = mapTodayAppointments(rawByBranch[branchId]);
        if (branchList) byBranch[branchId] = branchList;
      });
      if (Object.keys(byBranch).length > 0) {
        result.todayAppointmentsByBranch = byBranch;
      }
    }

    // قراءة entryAlertByBranch (إذا كان موجود) — لعزل الطلبات بين الفروع
    const rawEntryAlertByBranch = data?.entryAlertByBranch as
      | Record<
          string,
          { caseName?: unknown; createdAt?: unknown; appointmentId?: unknown; branchId?: unknown }
        >
      | undefined;
    if (
      rawEntryAlertByBranch &&
      typeof rawEntryAlertByBranch === 'object' &&
      !Array.isArray(rawEntryAlertByBranch)
    ) {
      const byBranch: Record<
        string,
        { caseName: string; createdAt: string; appointmentId: string; branchId?: string }
      > = {};
      Object.keys(rawEntryAlertByBranch).forEach((branchId) => {
        const alert = rawEntryAlertByBranch[branchId];
        if (
          alert &&
          typeof alert.caseName === 'string' &&
          typeof alert.createdAt === 'string' &&
          typeof alert.appointmentId === 'string'
        ) {
          byBranch[branchId] = {
            caseName: toOptionalText(alert.caseName) || '',
            createdAt: alert.createdAt,
            appointmentId: alert.appointmentId,
            branchId: typeof alert.branchId === 'string' ? alert.branchId : branchId,
          };
        }
      });
      if (Object.keys(byBranch).length > 0) {
        result.entryAlertByBranch = byBranch;
      }
    }

    const recentExamPatients = mapRecentExamPatients(data?.recentExamPatients);
    if (recentExamPatients) {
      result.recentExamPatients = recentExamPatients;
    }

    // قراءة recentExamPatientsByBranch لعزل المرضى المفحوصين بين الفروع
    const rawRecentByBranch = data?.recentExamPatientsByBranch as
      | Record<string, unknown>
      | undefined;
    if (
      rawRecentByBranch &&
      typeof rawRecentByBranch === 'object' &&
      !Array.isArray(rawRecentByBranch)
    ) {
      const byBranch: Record<string, RecentExamPatient[]> = {};
      Object.keys(rawRecentByBranch).forEach((branchId) => {
        const list = mapRecentExamPatients(rawRecentByBranch[branchId]);
        if (list) byBranch[branchId] = list;
      });
      if (Object.keys(byBranch).length > 0) {
        result.recentExamPatientsByBranch = byBranch;
      }
    }

    const patientDirectory = mapPatientDirectory(data?.patientDirectory);
    if (patientDirectory) {
      result.patientDirectory = patientDirectory;
    }

    // قراءة patientDirectoryByBranch لعزل دليل المرضى بين الفروع
    const rawDirByBranch = data?.patientDirectoryByBranch as Record<string, unknown> | undefined;
    if (rawDirByBranch && typeof rawDirByBranch === 'object' && !Array.isArray(rawDirByBranch)) {
      const byBranch: Record<string, PatientDirectoryItem[]> = {};
      Object.keys(rawDirByBranch).forEach((branchId) => {
        const list = mapPatientDirectory(rawDirByBranch[branchId]);
        if (list) byBranch[branchId] = list;
      });
      if (Object.keys(byBranch).length > 0) {
        result.patientDirectoryByBranch = byBranch;
      }
    }

    const doctorEntryResponse = mapEntryResponse(data?.doctorEntryResponse);
    if (doctorEntryResponse) {
      result.doctorEntryResponse = doctorEntryResponse;
    }

    // قراءة doctorEntryResponseByBranch لعزل ردود الطبيب بين الفروع
    const rawRespByBranch = data?.doctorEntryResponseByBranch as
      | Record<string, unknown>
      | undefined;
    if (
      rawRespByBranch &&
      typeof rawRespByBranch === 'object' &&
      !Array.isArray(rawRespByBranch)
    ) {
      const byBranch: Record<string, SecretaryEntryResponse> = {};
      Object.keys(rawRespByBranch).forEach((branchId) => {
        const mapped = mapEntryResponse(rawRespByBranch[branchId]);
        if (mapped) byBranch[branchId] = mapped;
      });
      if (Object.keys(byBranch).length > 0) {
        result.doctorEntryResponseByBranch = byBranch;
      }
    }

    const approvedIds = data?.approvedEntryAppointmentIds;
    if (Array.isArray(approvedIds)) {
      result.approvedEntryAppointmentIds = approvedIds.filter(
        (id: unknown) => typeof id === 'string',
      ) as string[];
    }

    // قراءة approvedEntryAppointmentIdsByBranch (الأسماء في Firestore قد تكون idsByBranch)
    const rawApprovedByBranch = (data?.approvedEntryAppointmentIdsByBranch ||
      data?.idsByBranch) as Record<string, unknown> | undefined;
    if (
      rawApprovedByBranch &&
      typeof rawApprovedByBranch === 'object' &&
      !Array.isArray(rawApprovedByBranch)
    ) {
      const byBranch: Record<string, string[]> = {};
      Object.keys(rawApprovedByBranch).forEach((branchId) => {
        const list = rawApprovedByBranch[branchId];
        if (Array.isArray(list)) {
          byBranch[branchId] = list.filter((id: unknown): id is string => typeof id === 'string');
        }
      });
      if (Object.keys(byBranch).length > 0) {
        result.approvedEntryAppointmentIdsByBranch = byBranch;
      }
    }

    if (typeof data?.passwordHash === 'string') {
      result.passwordHash = data.passwordHash;
    }

    if (typeof data?.formTitle === 'string') {
      result.formTitle = toOptionalText(data.formTitle) || '';
    }

    if (typeof data?.doctorDisplayName === 'string') {
      result.doctorDisplayName = toOptionalText(data.doctorDisplayName) || '';
    }

    if (typeof data?.secretaryAuthRequired === 'boolean') {
      result.secretaryAuthRequired = data.secretaryAuthRequired;
    }

    if (typeof data?.doctorEmail === 'string') {
      result.doctorEmail = normalizeEmail(data.doctorEmail);
    }

    if (data?.secretaryVitalsVisibility && typeof data.secretaryVitalsVisibility === 'object') {
      result.secretaryVitalsVisibility = normalizeSecretaryVitalsVisibility(
        data.secretaryVitalsVisibility as SecretaryVitalsVisibility,
      );
    }

    if (Array.isArray(data?.secretaryVitalFields)) {
      result.secretaryVitalFields = normalizeSecretaryVitalFieldDefinitions(
        data.secretaryVitalFields as SecretaryVitalFieldDefinition[],
      );
    }

    // per-branch maps: نطبّع كل إدخال على حدة قبل تمريره للمستمع لاختيار فرعه.
    if (
      data?.secretaryVitalsVisibilityByBranch &&
      typeof data.secretaryVitalsVisibilityByBranch === 'object'
    ) {
      const rawMap = data.secretaryVitalsVisibilityByBranch as Record<string, unknown>;
      const visibilityByBranch: Record<string, SecretaryVitalsVisibility> = {};
      Object.entries(rawMap).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          visibilityByBranch[key] = normalizeSecretaryVitalsVisibility(
            value as SecretaryVitalsVisibility,
          );
        }
      });
      if (Object.keys(visibilityByBranch).length > 0) {
        result.secretaryVitalsVisibilityByBranch = visibilityByBranch;
      }
    }

    if (
      data?.secretaryVitalFieldsByBranch &&
      typeof data.secretaryVitalFieldsByBranch === 'object'
    ) {
      const rawMap = data.secretaryVitalFieldsByBranch as Record<string, unknown>;
      const fieldsByBranch: Record<string, SecretaryVitalFieldDefinition[]> = {};
      Object.entries(rawMap).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          fieldsByBranch[key] = normalizeSecretaryVitalFieldDefinitions(
            value as SecretaryVitalFieldDefinition[],
          );
        }
      });
      if (Object.keys(fieldsByBranch).length > 0) {
        result.secretaryVitalFieldsByBranch = fieldsByBranch;
      }
    }

    onUpdate(result);
  };

  // (1) المحاولة الأولى: جلب الإعدادات من الكاش للتحميل اللحظي
  getDocCacheFirst(configRef)
    .then((snap) => {
      if (snap.exists()) handleSnap(snap);
    })
    .catch(() => {});

  // (2) المحاولة الثانية: الاشتراك في التحديثات الحية من السيرفر
  // ⚠️ مهم: لو الـ subscribe فشل (permission-denied / offline / session expired)
  // لا يُستدعى handleSnap أبداً → الـ subscriber يبقى في "جاري الانتظار" للأبد.
  // لذلك نُرسل payload بـ `__error` يصف نوع الخطأ حتى الـ UI يكتشف الحاجة
  // لإعادة تسجيل الدخول.
  return onSnapshot(
    configRef,
    handleSnap,
    (error) => {
      const code = String((error as { code?: unknown })?.code || '').toLowerCase();
      let errorType: BookingConfigSubscribePayload['__error'] = 'unknown';
      if (code.includes('permission-denied')) errorType = 'permission-denied';
      else if (code.includes('unauthenticated')) errorType = 'unauthenticated';
      else if (code.includes('unavailable')) errorType = 'unavailable';
      console.error(
        '[subscribeToBookingConfig] onSnapshot error:',
        code,
        error?.message || error,
      );
      onUpdate({ __error: errorType });
    },
  );
};
