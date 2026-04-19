// ─────────────────────────────────────────────────────────────────────────────
// Hook مزامنة bookingConfig لكل الفروع (useBookingConfigSync)
// ─────────────────────────────────────────────────────────────────────────────
// مسؤول عن كتابة 3 أنواع من قوائم المواعيد في bookingConfig (لفورم السكرتارية):
//
//   1) todayAppointmentsByBranch — مواعيد اليوم لكل فرع (للعرض الفوري للسكرتيرة)
//   2) upcomingAppointmentsByBranch — مواعيد مستقبلية مقسمة بالفرع
//   3) completedAppointmentsByBranch — منفذة في آخر 30 يوم (حد أقصى 20 لكل فرع)
//
// المهم: كل فرع له array مستقل حتى لو فاضي — بدون هذا، فرع بدون مواعيد اليوم
// يحتفظ بقائمة أمس القديمة (لأن dot-notation لا يكتب على مفاتيح غائبة).
//
// فصلناه من useMainAppAppointments عشان الـ hook الأب كان 686 سطر.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo } from 'react';
import { firestoreService } from '../../../services/firestore';
import type { ClinicAppointment } from '../../../types';

interface UseBookingConfigSyncParams {
  /** سر الحجز — المفتاح الرئيسي لـ bookingConfig document */
  bookingSecret: string | null;
  /** كل المواعيد من كل الفروع (subscription منفصلة عن المواعيد المفلترة بالفرع) */
  allAppointmentsAcrossBranches: ClinicAppointment[];
  /** تاريخ اليوم كـ YYYY-MM-DD (يتحدث تلقائياً عند منتصف الليل) */
  todayStr: string;
  /** قائمة معرفات الفروع لضمان كتابة [] فارغة للفروع بدون مواعيد */
  branchIds?: string[];
}

/** نوع العنصر المبسط في todayAppointmentsByBranch (كل البيانات اللي السكرتيرة تحتاجها). */
interface TodayAppointmentItem {
  id: string;
  patientName: string;
  age?: string;
  phone?: string;
  visitReason?: string;
  secretaryVitals?: ClinicAppointment['secretaryVitals'];
  dateTime: string;
  source?: ClinicAppointment['source'];
  appointmentType?: ClinicAppointment['appointmentType'];
  consultationSourceAppointmentId?: string;
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;
  paymentType?: ClinicAppointment['paymentType'];
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
  insuranceMembershipId?: string;
  insuranceApprovalCode?: string;
  patientSharePercent?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountReasonId?: string;
  discountReasonLabel?: string;
  branchId: string;
}

/** نوع العنصر في upcomingAppointmentsByBranch (حقول أقل — محسّن للحجم). */
interface UpcomingAppointmentItem {
  id: string; patientName: string; age?: string; phone?: string;
  visitReason?: string; dateTime: string; source?: ClinicAppointment['source'];
  appointmentType?: ClinicAppointment['appointmentType']; branchId: string;
  paymentType?: ClinicAppointment['paymentType'];
  insuranceCompanyId?: string; insuranceCompanyName?: string;
}

/** نوع العنصر في completedAppointmentsByBranch (الأقل حقولاً — للسجل فقط). */
interface CompletedAppointmentItem {
  id: string; patientName: string; phone?: string;
  visitReason?: string; dateTime: string; examCompletedAt?: string;
  source?: ClinicAppointment['source']; appointmentType?: ClinicAppointment['appointmentType'];
  branchId: string;
}

/** بناء خريطة فارغة بكل الفروع المعروفة (+ main دائماً). */
const initEmptyBranchMap = <T>(branchIds?: string[]): Record<string, T[]> => {
  const result: Record<string, T[]> = {};
  const allBranchKeys = new Set<string>(['main']);
  (branchIds || []).forEach((id) => {
    const trimmed = String(id || '').trim();
    if (trimmed) allBranchKeys.add(trimmed);
  });
  allBranchKeys.forEach((branchKey) => { result[branchKey] = []; });
  return result;
};

/** الحصول على مفتاح الفرع من موعد، مع fallback على 'main'. */
const getBranchKey = (apt: ClinicAppointment) => (apt.branchId || 'main').trim() || 'main';

/** فلترة بسيطة: نفس اليوم، ولم يُكتمل فيه الكشف بعد. */
const isAppointmentOnDay = (apt: ClinicAppointment, targetDayStr: string): boolean => {
  const dt = new Date(apt.dateTime);
  const dayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  return dayStr === targetDayStr && !apt.examCompletedAt;
};

/** فلترة: تاريخ الموعد بعد اليوم (upcoming). */
const isAppointmentAfterDay = (apt: ClinicAppointment, targetDayStr: string): boolean => {
  const dt = new Date(apt.dateTime);
  const dayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  return dayStr > targetDayStr && !apt.examCompletedAt;
};

export const useBookingConfigSync = ({
  bookingSecret,
  allAppointmentsAcrossBranches,
  todayStr,
  branchIds,
}: UseBookingConfigSyncParams) => {
  // ── 1) مواعيد اليوم مقسمة بالفرع (حقول كاملة) ──
  const todayAppointmentsByBranch = useMemo(() => {
    const result = initEmptyBranchMap<TodayAppointmentItem>(branchIds);

    const filtered = allAppointmentsAcrossBranches
      .filter((apt) => isAppointmentOnDay(apt, todayStr))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    filtered.forEach((apt) => {
      const branchKey = getBranchKey(apt);
      if (!result[branchKey]) result[branchKey] = [];
      result[branchKey].push({
        id: apt.id,
        patientName: apt.patientName || '',
        age: apt.age,
        phone: apt.phone,
        visitReason: apt.visitReason,
        secretaryVitals: apt.secretaryVitals,
        dateTime: apt.dateTime,
        source: apt.source,
        appointmentType: apt.appointmentType,
        consultationSourceAppointmentId: apt.consultationSourceAppointmentId,
        consultationSourceCompletedAt: apt.consultationSourceCompletedAt,
        consultationSourceRecordId: apt.consultationSourceRecordId,
        paymentType: apt.paymentType,
        insuranceCompanyId: apt.insuranceCompanyId,
        insuranceCompanyName: apt.insuranceCompanyName,
        insuranceMembershipId: apt.insuranceMembershipId,
        insuranceApprovalCode: apt.insuranceApprovalCode,
        patientSharePercent: apt.patientSharePercent,
        discountAmount: apt.discountAmount,
        discountPercent: apt.discountPercent,
        discountReasonId: apt.discountReasonId,
        discountReasonLabel: apt.discountReasonLabel,
        branchId: branchKey,
      });
    });

    return result;
  }, [allAppointmentsAcrossBranches, todayStr, branchIds]);

  useEffect(() => {
    if (!bookingSecret) return;
    firestoreService
      .setBookingConfigTodayAppointmentsByBranch(bookingSecret, todayAppointmentsByBranch)
      .catch((error) => {
        console.error('[useBookingConfigSync] Failed syncing today appointments by branch:', error);
      });
  }, [bookingSecret, todayAppointmentsByBranch]);

  // ── 2) مواعيد قادمة (بعد اليوم) مقسمة بالفرع (حقول أقل) ──
  const upcomingAppointmentsByBranch = useMemo(() => {
    const result = initEmptyBranchMap<UpcomingAppointmentItem>(branchIds);

    const filtered = allAppointmentsAcrossBranches
      .filter((apt) => isAppointmentAfterDay(apt, todayStr))
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    filtered.forEach((apt) => {
      const branchKey = getBranchKey(apt);
      if (!result[branchKey]) result[branchKey] = [];
      result[branchKey].push({
        id: apt.id,
        patientName: apt.patientName || '',
        age: apt.age,
        phone: apt.phone,
        visitReason: apt.visitReason,
        dateTime: apt.dateTime,
        source: apt.source,
        appointmentType: apt.appointmentType,
        branchId: branchKey,
        paymentType: apt.paymentType,
        insuranceCompanyId: apt.insuranceCompanyId,
        insuranceCompanyName: apt.insuranceCompanyName,
      });
    });

    return result;
  }, [allAppointmentsAcrossBranches, todayStr, branchIds]);

  useEffect(() => {
    if (!bookingSecret) return;
    firestoreService
      .setBookingConfigUpcomingAppointmentsByBranch(bookingSecret, upcomingAppointmentsByBranch)
      .catch((error) => {
        console.error('[useBookingConfigSync] Failed syncing upcoming appointments by branch:', error);
      });
  }, [bookingSecret, upcomingAppointmentsByBranch]);

  // ── 3) مواعيد منفذة (آخر 30 يوم، 20 لكل فرع كحد أقصى) ──
  const completedAppointmentsByBranch = useMemo(() => {
    const result = initEmptyBranchMap<CompletedAppointmentItem>(branchIds);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allCompleted = allAppointmentsAcrossBranches.filter((apt) => !!apt.examCompletedAt);
    const filtered = allCompleted
      .filter((apt) => new Date(apt.examCompletedAt!) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

    filtered.forEach((apt) => {
      const branchKey = getBranchKey(apt);
      if (!result[branchKey]) result[branchKey] = [];
      // حد أقصى 20 لكل فرع لتقليل حجم الـ document
      if (result[branchKey].length >= 20) return;
      result[branchKey].push({
        id: apt.id,
        patientName: apt.patientName || '',
        phone: apt.phone,
        visitReason: apt.visitReason,
        dateTime: apt.dateTime,
        examCompletedAt: apt.examCompletedAt,
        source: apt.source,
        appointmentType: apt.appointmentType,
        branchId: branchKey,
      });
    });

    return result;
  }, [allAppointmentsAcrossBranches, branchIds]);

  useEffect(() => {
    if (!bookingSecret) return;
    firestoreService
      .setBookingConfigCompletedAppointmentsByBranch(bookingSecret, completedAppointmentsByBranch)
      .catch((error) => {
        console.error('[useBookingConfigSync] Failed syncing completed appointments by branch:', error);
      });
  }, [bookingSecret, completedAppointmentsByBranch]);
};
