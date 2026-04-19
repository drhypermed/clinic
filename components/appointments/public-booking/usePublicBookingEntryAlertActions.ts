/**
 * الملف: usePublicBookingEntryAlertActions.ts (Hook)
 * الوصف: "منفذ أوامر الدخول". 
 * يعالج هذا الملف التفاعل المباشر مع طلبات الطبيب لإدخال المرضى: 
 * - زر الموافق (Approve): يبلغ الطبيب أن المريض جاهز للدخول الآن. 
 * - زر الرفض (Reject): يبلغ الطبيب أن المريض غير موجود حالياً في الانتظار. 
 * - يضمن تزامن التنبيهات وإغلاق الإشعارات المنبثقة (Push Notifications) بعد اتخاذ الإجراء. 
 * - يحفظ سجل الإجراءات المتخذة محلياً لمنع تكرار التنبيه لنفس الحالة.
 */
import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

import { firestoreService } from '../../../services/firestore';
import { closePushNotificationsByContext } from '../../../services/messagingService';
import { playNotificationCue } from '../../../utils/notificationSound';
import type { EntryAlert } from '../../../types';
import {
  INTERNAL_TOAST_MIN_VISIBLE_MS,
  buildSecretaryActionToastKey,
  clearTimedPayload,
  persistSecretaryHandledEntryAlert,
  persistTimedPayload,
} from '../internalToastStorage';

type UsePublicBookingEntryAlertActionsParams = {
  secret: string;
  entryAlert: EntryAlert | null;
  entryResponding: boolean;
  setEntryResponding: Dispatch<SetStateAction<boolean>>;
  setEntryAlert: Dispatch<SetStateAction<EntryAlert | null>>;
  setSecretaryActionToast: Dispatch<SetStateAction<'approved' | 'rejected' | null>>;
};

export const usePublicBookingEntryAlertActions = ({
  secret,
  entryAlert,
  entryResponding,
  setEntryResponding,
  setEntryAlert,
  setSecretaryActionToast,
}: UsePublicBookingEntryAlertActionsParams) => {
  const secretaryActionToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSecretaryActionToastForMinute = (status: 'approved' | 'rejected') => {
    setSecretaryActionToast(status);
    if (!secret) return;
    const storageKey = buildSecretaryActionToastKey(secret);
    persistTimedPayload(storageKey, status, INTERNAL_TOAST_MIN_VISIBLE_MS);
    if (secretaryActionToastTimerRef.current) {
      clearTimeout(secretaryActionToastTimerRef.current);
    }
    secretaryActionToastTimerRef.current = setTimeout(() => {
      setSecretaryActionToast(null);
      clearTimedPayload(storageKey);
      secretaryActionToastTimerRef.current = null;
    }, INTERNAL_TOAST_MIN_VISIBLE_MS);
  };

  useEffect(() => {
    return () => {
      if (secretaryActionToastTimerRef.current) {
        clearTimeout(secretaryActionToastTimerRef.current);
      }
    };
  }, []);

  const finalizeEntryAlertResponse = (
    currentAlert: NonNullable<typeof entryAlert>,
    status: 'approved' | 'rejected'
  ) => {
    // نثبّت الحالة محلياً فوراً بعد نجاح الرد حتى لا يبقى الإشعار واقفاً
    persistSecretaryHandledEntryAlert(secret, {
      appointmentId: currentAlert.appointmentId,
      createdAt: currentAlert.createdAt,
      status,
      handledAt: new Date().toISOString(),
    });
    setEntryAlert(null);
    showSecretaryActionToastForMinute(status);
    void playNotificationCue('action_confirmed');
    void closePushNotificationsByContext({
      type: 'doctor_entry_request',
      appointmentId: currentAlert.appointmentId,
      secret,
    });
  };

  const handleApproveEntryAlert = async () => {
    if (!secret || !entryAlert || entryResponding) return;
    const currentAlert = entryAlert;
    setEntryResponding(true);
    try {
      await firestoreService.respondToDoctorEntryAlert(
        secret,
        currentAlert.appointmentId,
        'approved',
        currentAlert.branchId
      );
      finalizeEntryAlertResponse(currentAlert, 'approved');
    } catch (err) {
      void playNotificationCue('error');
      console.error('Approve entry alert failed:', err);
      // الرد الأساسي (إعلام الطبيب) فشل — نظف الواجهة ثم أظهر رسالة للمستخدم
      setEntryAlert(null);
      alert('تعذر إرسال الرد للطبيب الآن. تحقق من الإنترنت وحاول مرة أخرى.');
    } finally {
      setEntryResponding(false);
    }
  };

  const handleRejectEntryAlert = async () => {
    if (!secret || !entryAlert || entryResponding) return;
    const currentAlert = entryAlert;
    setEntryResponding(true);
    try {
      await firestoreService.respondToDoctorEntryAlert(
        secret,
        currentAlert.appointmentId,
        'rejected',
        currentAlert.branchId
      );
      finalizeEntryAlertResponse(currentAlert, 'rejected');
    } catch (err) {
      void playNotificationCue('error');
      console.error('Reject entry alert failed:', err);
      setEntryAlert(null);
      alert('تعذر إرسال الرفض للطبيب الآن. تحقق من الإنترنت وحاول مرة أخرى.');
    } finally {
      setEntryResponding(false);
    }
  };

  return {
    handleApproveEntryAlert,
    handleRejectEntryAlert,
  };
};
