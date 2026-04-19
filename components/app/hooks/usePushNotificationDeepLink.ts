// ─────────────────────────────────────────────────────────────────────────────
// Hook معالجة الروابط التفاعلية من إشعارات Push (usePushNotificationDeepLink)
// ─────────────────────────────────────────────────────────────────────────────
// لما الطبيب يضغط على إشعار في الهاتف، المتصفح بيفتح التطبيق مع query params
// بتحدد نوع الإجراء:
//
//   • dh_open=push + dh_type=secretary_entry_request:
//     فتح مودال طلب دخول السكرتارية (مع تبديل الفرع تلقائياً لو لازم)
//
//   • dh_open=push + dh_type=new_appointment:
//     عرض Toast بالموعد الجديد (مع تبديل الفرع + العلامات الحيوية من notification)
//
//   • dh_action=doctor_entry_response + status=approved/rejected:
//     استجابة من زر الإشعار نفسه (بدون ما يفتح التطبيق) —
//     نعالجها ونرسل الرد لـ Firestore
//
// بعد المعالجة، نمسح الـ query params من URL (navigate with replace) عشان
// ما تتكررش لو الصفحة اتعمل لها refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { closePushNotificationsByContext } from '../../../services/messagingService';
import { firestoreService } from '../../../services/firestore';
import { resolveNotificationActionStatus } from '../../../utils/notificationAction';
import { extractSecretaryVitalsFromNotificationData } from '../../../utils/secretaryVitals';
import type { NewAppointmentToastData, SecretaryEntryRequestData } from './useMainAppAppointments';

interface UsePushNotificationDeepLinkParams {
  userId: string;
  bookingSecret: string | null;
  pathname: string;
  search: string;
  navigate: NavigateFunction;
  activeBranchId?: string;
  onRequestBranchSwitch?: (branchId: string) => void;
  setSecretaryEntryRequest: (data: SecretaryEntryRequestData | null) => void;
  setNewAppointmentToastState: (data: NewAppointmentToastData | null) => void;
}

export const usePushNotificationDeepLink = ({
  userId,
  bookingSecret,
  pathname,
  search,
  navigate,
  activeBranchId,
  onRequestBranchSwitch,
  setSecretaryEntryRequest,
  setNewAppointmentToastState,
}: UsePushNotificationDeepLinkParams) => {
  // تتبع الـ actions اللي اتعاملنا معاها عشان ما نكررش التنفيذ (idempotent)
  const handledPushDoctorActionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(search);
    const openSource = (params.get('dh_open') || '').trim();
    const openType = (params.get('dh_type') || '').trim();

    /**
     * Helper: لو الإشعار يخص فرعاً مختلفاً عن الفرع النشط، نطلب من parent التبديل.
     * يضمن أن الطبيب يرى الموعد/الطلب في الواجهة الصحيحة بعد فتح الإشعار.
     */
    const requestBranchSwitchIfNeeded = (branchIdFromPush?: string) => {
      if (!branchIdFromPush) return;
      const normalizedTarget = branchIdFromPush.trim();
      const normalizedCurrent = (activeBranchId || '').trim();
      if (!normalizedTarget) return;
      if (normalizedTarget === normalizedCurrent) return;
      // التبديل اختياري — لو الـ parent ما مررش callback، نتجاهل
      if (onRequestBranchSwitch) onRequestBranchSwitch(normalizedTarget);
    };

    // ── حالة 1: فتح طلب دخول سكرتارية من notification ──
    if (openSource === 'push') {
      if (openType === 'secretary_entry_request') {
        const appointmentId = (params.get('appointmentId') || '').trim();
        if (!appointmentId) {
          navigate(pathname, { replace: true });
          return;
        }

        const patientName = (params.get('patientName') || '').trim() || 'مريض';
        const age = (params.get('age') || '').trim() || undefined;
        const visitReason = (params.get('visitReason') || '').trim() || undefined;
        const appointmentType = (params.get('appointmentType') || '').trim() === 'consultation'
          ? 'consultation' : 'exam';
        const branchIdFromPush = (params.get('branchId') || '').trim() || undefined;

        requestBranchSwitchIfNeeded(branchIdFromPush);

        setSecretaryEntryRequest({
          appointmentId,
          patientName,
          age,
          visitReason,
          appointmentType,
          createdAt: new Date().toISOString(),
          branchId: branchIdFromPush,
        });
        navigate(pathname, { replace: true });
        return;
      }

      // ── حالة 2: عرض Toast لموعد جديد من notification ──
      if (openType === 'new_appointment') {
        const patientName = (params.get('patientName') || '').trim() || 'مريض';
        const source = (params.get('source') || '').trim() === 'secretary' ? 'secretary' : 'public';
        const dateTime = (params.get('dateTime') || '').trim() || new Date().toISOString();
        const age = (params.get('age') || '').trim() || undefined;
        const visitReason = (params.get('visitReason') || '').trim() || undefined;
        const appointmentType = (params.get('appointmentType') || '').trim() === 'consultation'
          ? 'consultation' : 'exam';
        // الفرع الذي يخصه الموعد — يأتي من payload الإشعار الجديد
        const branchIdFromPush = (params.get('branchId') || '').trim() || undefined;

        requestBranchSwitchIfNeeded(branchIdFromPush);

        // استخراج العلامات الحيوية من بيانات الإشعار (لو السكرتارية سجلتهم)
        const notificationData: Record<string, unknown> = {};
        params.forEach((value, key) => {
          notificationData[key] = value;
        });
        const secretaryVitals = extractSecretaryVitalsFromNotificationData(notificationData);

        setNewAppointmentToastState({
          patientName,
          age,
          visitReason,
          dateTime,
          source,
          appointmentType,
          secretaryVitals,
          branchId: branchIdFromPush,
        });
        navigate(pathname, { replace: true });
        return;
      }
    }

    // ── حالة 3: رد من زر Action في الإشعار نفسه ──
    // (الطبيب ضغط على "موافق/رفض" بدون ما يفتح التطبيق — والـ service worker فتح URL خاص)
    const action = params.get('dh_action');
    if (action !== 'doctor_entry_response') return;

    const status = resolveNotificationActionStatus({
      status: params.get('status'),
      button: params.get('dh_btn'),
    });
    const appointmentId = (params.get('appointmentId') || '').trim();
    if (!status || !appointmentId || !bookingSecret) return;

    // الفرع المستهدف — يأتي من payload الإشعار؛ لو غير موجود يُعتبر 'main'
    const targetBranchId = (params.get('branchId') || '').trim() || undefined;

    // idempotency: لو عالجنا نفس الـ action قبل كده، ما نعيدهاش
    const actionKey = `${bookingSecret}:${appointmentId}:${status}:${targetBranchId || 'main'}`;
    if (handledPushDoctorActionsRef.current.has(actionKey)) return;
    handledPushDoctorActionsRef.current.add(actionKey);

    let cancelled = false;
    firestoreService
      .respondToSecretaryEntryRequest(bookingSecret, appointmentId, status, targetBranchId)
      .then(() => {
        if (cancelled) return;
        setSecretaryEntryRequest(null);
        // نقفل الإشعار من نفسه على كل الأجهزة (عشان ما يظهرش بعد الرد)
        void closePushNotificationsByContext({
          type: 'secretary_entry_request',
          appointmentId,
          secret: bookingSecret,
        });
        navigate(pathname, { replace: true });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Push action apply error:', err);
      });

    return () => { cancelled = true; };
  }, [
    userId, bookingSecret, pathname, search, navigate,
    setNewAppointmentToastState, setSecretaryEntryRequest,
    activeBranchId, onRequestBranchSwitch,
  ]);
};
