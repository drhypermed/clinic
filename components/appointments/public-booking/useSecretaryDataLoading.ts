// ─────────────────────────────────────────────────────────────────────────────
// Hook تحميل بيانات السكرتارية عبر Cloud Functions (useSecretaryDataLoading)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف 3 أنواع من استدعاءات Cloud Functions مع polling:
//
//   1) loadRecentExamPatients (كل 60 ثانية):
//      - قائمة المرضى اللي عندهم كشوفات حديثة (آخر 30 يوم)
//      - يدمج الـ patient directory مع القادم الجديد (mergePatientDirectoryLists)
//
//   2) refreshAppointments (كل 30 ثانية + يدوياً بعد CRUD):
//      - مواعيد اليوم / القادمة / المنفذة لسكرتارية الفرع الحالي
//      - Cloud Function تقرأ بصلاحيات admin وتفلتر حسب الفرع
//
//   3) Session invalidation handling:
//      - لو الـ Cloud Function رجعت unauthenticated أو INVALID_SESSION_TOKEN،
//        نستدعي auth.invalidateSecretarySession تلقائياً لإعادة توجيه المستخدم
//        لشاشة تسجيل الدخول.
//
// سبب الفصل: usePublicBookingPageLogicCore.ts كان 612 سطر والمنطق ده ~100 سطر.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { listRecentExamRecordsForSecretary } from '../../../services/secretaryRecordsService';
import { listAppointmentsForSecretary } from '../../../services/secretaryAppointmentsService';
import { toLocalDateStr } from '../utils';
import { mergePatientDirectoryLists } from './usePublicBookingPageLogic.helpers';
import type { PatientSuggestionOption, RecentExamPatientOption } from '../add-appointment-form/types';
import type { TodayAppointment } from './types';

interface UseSecretaryDataLoadingParams {
  isAuthenticated: boolean;
  secret: string;
  userId: string | undefined;
  sessionBranchId: string | undefined;
  getCurrentSessionToken?: () => string | undefined;
  invalidateSecretarySession: (message: string) => void;
  setRecentExamPatients: Dispatch<SetStateAction<RecentExamPatientOption[]>>;
  setPatientDirectory: Dispatch<SetStateAction<PatientSuggestionOption[]>>;
  setTodayAppointments: Dispatch<SetStateAction<TodayAppointment[]>>;
  setUpcomingAppointments: Dispatch<SetStateAction<TodayAppointment[]>>;
  setCompletedAppointments: Dispatch<SetStateAction<TodayAppointment[]>>;
}

/** التحقق من أن الخطأ يمثل انتهاء جلسة السكرتارية. */
const isInvalidSecretarySessionError = (error: unknown): boolean => {
  const code = String((error as { code?: unknown })?.code || '')
    .trim()
    .toLowerCase()
    .replace(/^functions\//, '');
  const message = String((error as { message?: unknown })?.message || '').toUpperCase();
  return (
    code === 'unauthenticated' ||
    message.includes('INVALID_SESSION_TOKEN') ||
    message.includes('SECRETARY_SESSION_EXPIRED')
  );
};

export const useSecretaryDataLoading = ({
  isAuthenticated,
  secret,
  userId,
  sessionBranchId,
  getCurrentSessionToken,
  invalidateSecretarySession,
  setRecentExamPatients,
  setPatientDirectory,
  setTodayAppointments,
  setUpcomingAppointments,
  setCompletedAppointments,
}: UseSecretaryDataLoadingParams) => {
  // ── 1) تحميل كشوفات حديثة كل 60 ثانية ──
  useEffect(() => {
    if (!isAuthenticated || !secret || !userId) return;

    let isDisposed = false;

    const loadRecentExamPatients = async () => {
      try {
        const data = await listRecentExamRecordsForSecretary({
          secret,
          userId,
          sessionToken: getCurrentSessionToken?.(),
          branchId: sessionBranchId,
        });
        if (!isDisposed) {
          setRecentExamPatients(data.recentExamPatients);
          if (data.patientDirectory.length > 0) {
            setPatientDirectory((current) => mergePatientDirectoryLists(current, data.patientDirectory));
          }
        }
      } catch (error) {
        if (isInvalidSecretarySessionError(error)) {
          invalidateSecretarySession('انتهت جلسة السكرتارية. يرجى تسجيل الدخول مرة أخرى.');
          return;
        }
        console.error('[Secretary] Failed loading recent exam records:', error);
      }
    };

    void loadRecentExamPatients();
    const interval = setInterval(() => {
      void loadRecentExamPatients();
    }, 60000);

    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, secret, userId]);

  // ── 2) تحميل المواعيد (اليوم / القادمة / المنفذة) عبر Cloud Function ──
  // نستخدم ref حتى نقدر نستدعيها يدوياً بعد CRUD بدون إعادة إنشاء الدالة.
  const refreshAppointmentsRef = useRef<() => Promise<void>>(async () => undefined);

  const refreshAppointments = useCallback(async () => {
    if (!isAuthenticated || !secret || !userId) return;
    try {
      const todayStr = toLocalDateStr(new Date());
      const data = await listAppointmentsForSecretary({
        secret,
        userId,
        sessionToken: getCurrentSessionToken?.(),
        branchId: sessionBranchId,
        todayStr,
      });
      setTodayAppointments(data.today);
      setUpcomingAppointments(data.upcoming);
      setCompletedAppointments(data.completed);
    } catch (error) {
      if (isInvalidSecretarySessionError(error)) {
        invalidateSecretarySession('انتهت جلسة السكرتارية. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }
      console.error('[Secretary] Failed loading appointments list:', error);
    }
  }, [
    isAuthenticated, secret, userId, sessionBranchId,
    getCurrentSessionToken, invalidateSecretarySession,
    setTodayAppointments, setUpcomingAppointments, setCompletedAppointments,
  ]);

  refreshAppointmentsRef.current = refreshAppointments;

  // ── 3) Polling كل 15 ثانية ──
  // السكرتيرة ما تقدرش تستخدم onSnapshot مباشرة على users/{uid}/appointments
  // بسبب rules، لذلك نعتمد على Cloud Function. نوقف الـ polling وهي التاب مخفي
  // لتوفير استدعاءات CF، ونحدّث فوراً عند رجوع التاب visible.
  useEffect(() => {
    if (!isAuthenticated || !secret || !userId) return;
    let isDisposed = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (isDisposed) return;
      void refreshAppointmentsRef.current();
    };

    const startPolling = () => {
      if (intervalId != null) return;
      intervalId = setInterval(tick, 15000);
    };
    const stopPolling = () => {
      if (intervalId == null) return;
      clearInterval(intervalId);
      intervalId = null;
    };

    const handleVisibilityChange = () => {
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'visible') {
        tick();
        startPolling();
      } else {
        stopPolling();
      }
    };

    tick();
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      startPolling();
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      isDisposed = true;
      stopPolling();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [isAuthenticated, secret, userId]);

  return { refreshAppointments, refreshAppointmentsRef };
};
