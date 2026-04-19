import { useEffect, useRef, useState } from 'react';
import type { ClinicAppointment } from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { playNotificationCue } from '../../../utils/notificationSound';
import type { SecretaryEntryAlertResponse } from '../../../types';
import {
  INTERNAL_TOAST_MIN_VISIBLE_MS,
  buildDoctorSecretaryResponseToastKey,
  clearTimedPayload,
  persistTimedPayload,
  readTimedPayload,
} from '../internalToastStorage';

const isSecretaryResponseToastState = (
  value: unknown
): value is { status: 'approved' | 'rejected'; appointmentId: string } => {
  if (!value || typeof value !== 'object') return false;
  const toast = value as { status?: unknown; appointmentId?: unknown };
  return (
    (toast.status === 'approved' || toast.status === 'rejected') &&
    typeof toast.appointmentId === 'string' &&
    toast.appointmentId.trim().length > 0
  );
};

/**
 * الملف: useSecretaryEntryAlerts.ts (Hook)
 * الوصف: هذا الـ Hook يمثل "نظام المحادثة الصامت" بين الطبيب والسكرتارية. 
 * يدير عملية إرسال إشعارات "طلب دخول مريض" (Entry Alert) للسكرتارية، 
 * ويستقبل ردود الفعل اللحظية (قبول أو رفض) مع تفعيل تنبيهات صوتية وبصرية (Toasts) 
 * للطبيب ليعلم متى يدخل المريض القادم للغرفة، مما يقلل من الحاجة للتواصل الشفهي.
 */

interface UseSecretaryEntryAlertsArgs {
  bookingSecret: string | null;
  appointments: ClinicAppointment[];
  showNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const useSecretaryEntryAlerts = ({
  bookingSecret,
  appointments,
  showNotification,
}: UseSecretaryEntryAlertsArgs) => {
  // معرفات المواعيد التي تم إرسال طلب دخول لها
  const [sentEntryForIds, setSentEntryForIds] = useState<Set<string>>(new Set());
  const [entrySendingId, setEntrySendingId] = useState<string | null>(null);
  
  // الاستجابة من السكرتارية
  const [secretaryEntryAlertResponse, setSecretaryEntryAlertResponse] = useState<SecretaryEntryAlertResponse | null>(null);
  const [approvedEntryAppointmentIds, setApprovedEntryAppointmentIds] = useState<string[]>([]);
  const [secretaryApprovedEntryIds, setSecretaryApprovedEntryIds] = useState<string[]>([]);
  
  // حالة الإشعار الظاهر للطبيب (Toast)
  const [secretaryResponseToast, setSecretaryResponseToast] = useState<{
    status: 'approved' | 'rejected';
    appointmentId: string;
  } | null>(null);

  const syncedPublicExecutionIdsRef = useRef<Set<string>>(new Set());
  const lastEntryResponseRespondedAtRef = useRef<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearSecretaryResponseToastWithStorage = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setSecretaryResponseToast(null);
    if (!bookingSecret) return;
    clearTimedPayload(buildDoctorSecretaryResponseToastKey(bookingSecret));
  };

  const showSecretaryResponseToastForMinute = (toast: { status: 'approved' | 'rejected'; appointmentId: string }) => {
    setSecretaryResponseToast(toast);
    if (!bookingSecret) return;
    const storageKey = buildDoctorSecretaryResponseToastKey(bookingSecret);
    persistTimedPayload(storageKey, toast, INTERNAL_TOAST_MIN_VISIBLE_MS);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      clearSecretaryResponseToastWithStorage();
    }, INTERNAL_TOAST_MIN_VISIBLE_MS);
  };

  /** إرسال طلب السكرتارية لدخول مريض محدد — branchId بيتاخد من الموعد نفسه للعزل بين الفروع */
  const sendEntryRequest = async (apt: ClinicAppointment) => {
    if (!bookingSecret) return;
    const name = apt.patientName?.trim() || 'مريض';
    setEntrySendingId(apt.id);
    try {
      await firestoreService.setEntryAlert(bookingSecret, name, apt.id, apt.branchId);
      setSentEntryForIds((prev) => new Set(prev).add(apt.id));
      // 🔔 صوت تأكيد قصير — الطلب اتبعت للسكرتيرة
      void playNotificationCue('action_confirmed');
      showNotification?.('تم إرسال طلب الدخول للسكرتارية بنجاح', 'success');
    } catch (err) {
      // ❌ صوت خطأ — فشل الإرسال
      void playNotificationCue('error');
      console.error('Failed to send entry request:', err);
      showNotification?.('تعذر إرسال الطلب. حاول مرة أخرى.', 'error');
    } finally { setEntrySendingId(null); }
  };

  // الاشتراك في قائمة المواعيد المعتمدة للدخول (Approved)
  useEffect(() => {
    if (!bookingSecret) return;
    return firestoreService.subscribeToBookingConfig(bookingSecret, (data) => {
      setApprovedEntryAppointmentIds(Array.isArray(data.approvedEntryAppointmentIds) ? data.approvedEntryAppointmentIds : []);
    });
  }, [bookingSecret]);

  // الاشتراك في قائمة المواعيد التي وافقت عليها السكرتارية حديثاً
  useEffect(() => {
    if (!bookingSecret) return;
    return firestoreService.subscribeToSecretaryApprovedEntryIds(bookingSecret, setSecretaryApprovedEntryIds);
  }, [bookingSecret]);

  // مزامنة حالة اكتمال المواعيد العامة (Public) مع حسابات المرضى عند الموافقة على الدخول
  useEffect(() => {
    if (!appointments.length) return;
    const approvedIds = new Set<string>([...approvedEntryAppointmentIds, ...secretaryApprovedEntryIds]);
    if (approvedIds.size === 0) return;

    appointments.forEach(async (apt) => {
      if (apt.source === 'public' && apt.publicUserId && approvedIds.has(apt.id) && !syncedPublicExecutionIdsRef.current.has(apt.id)) {
        try {
          await firestoreService.markPublicUserBookingCompleted(apt.publicUserId, apt.id, apt.examCompletedAt || new Date().toISOString());
          syncedPublicExecutionIdsRef.current.add(apt.id);
        } catch (err) { console.error('Sync public completion failed:', err); }
      }
    });
  }, [appointments, approvedEntryAppointmentIds, secretaryApprovedEntryIds]);

  // الاستماع المباشر لرد السكرتارية على الطلب الحالي
  useEffect(() => {
    if (!bookingSecret) return;
    return firestoreService.subscribeToSecretaryEntryAlertResponse(bookingSecret, setSecretaryEntryAlertResponse);
  }, [bookingSecret]);

  useEffect(() => {
    if (!bookingSecret) return;
    const storageKey = buildDoctorSecretaryResponseToastKey(bookingSecret);
    const restored = readTimedPayload(storageKey, isSecretaryResponseToastState);
    if (!restored) return;
    setSecretaryResponseToast(restored.value);
    const remainingMs = Math.max(0, restored.expiresAt - Date.now());
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      clearSecretaryResponseToastWithStorage();
    }, remainingMs);
  }, [bookingSecret]);

  /** 
   * معالجة رد السكرتارية (Process Response). 
   * عندما تستجيب السكرتارية على طلب دخول، تقوم هذه الوظيفة بـ: 
   * - التحقق من حداثة الرد (أقل من دقيقة). 
   * - تشغيل صوت تنبيه مميز. 
   * - عرض رسالة (Toast) تحتوي على حالة الرد (مقبول/مرفوض). 
   * - تحديث حالة النموذج لإتاحة المحاولة مرة أخرى في حال الرفض.
   */
  useEffect(() => {
    if (!secretaryEntryAlertResponse?.respondedAt || !bookingSecret) return;
    if (lastEntryResponseRespondedAtRef.current === secretaryEntryAlertResponse.respondedAt) return;

    lastEntryResponseRespondedAtRef.current = secretaryEntryAlertResponse.respondedAt;
    const respondedAtMs = new Date(secretaryEntryAlertResponse.respondedAt).getTime();
    const ageSeconds = (Date.now() - respondedAtMs) / 1000;

    // تجاهل الردود القديمة جداً (أكثر من 5 دقائق) لتجنب التنبيهات المزعجة عند فتح الصفحة، مع مراعاة فرق التوقيت المحتمل
    if (Math.abs(ageSeconds) > 300) { firestoreService.clearSecretaryEntryAlertResponse(bookingSecret).catch(() => {}); return; }

    // تشغيل صوت الإشعار إذا كان الرد حديثاً جداً
    if (ageSeconds < 15) {
      void playNotificationCue(
        secretaryEntryAlertResponse.status === 'approved'
          ? 'entry_response_approved'
          : 'entry_response_wait'
      );
    }

    // عرض الإشعار على الشاشة لمدة دقيقة
    showSecretaryResponseToastForMinute({
      status: secretaryEntryAlertResponse.status,
      appointmentId: secretaryEntryAlertResponse.appointmentId,
    });

    // تصفير الرد في قاعدة البيانات لضمان عدم تكرار التنبيه بالخطأ
    setTimeout(() => firestoreService.clearSecretaryEntryAlertResponse(bookingSecret).catch(() => {}), 1500);

    // إذا تم الرفض، نعيد إتاحة زر "إرسال طلب" مرة أخرى للمحاولة مع مريض آخر أو إعادة الطلب
    if (secretaryEntryAlertResponse.status === 'rejected') {
      setSentEntryForIds((prev) => {
        const next = new Set(prev);
        next.delete(secretaryEntryAlertResponse.appointmentId);
        return next;
      });
    }
  }, [secretaryEntryAlertResponse, bookingSecret]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleCloseApprovedToast = () => clearSecretaryResponseToastWithStorage();

  const handleCloseRejectedToast = () => {
    setSecretaryResponseToast((prev) => {
      if (prev) {
        setSentEntryForIds((current) => {
          const next = new Set(current);
          next.delete(prev.appointmentId);
          return next;
        });
      }
      return null;
    });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (bookingSecret) {
      clearTimedPayload(buildDoctorSecretaryResponseToastKey(bookingSecret));
    }
  };

  return {
    sentEntryForIds, entrySendingId, sendEntryRequest,
    secretaryEntryAlertResponse, approvedEntryAppointmentIds,
    secretaryApprovedEntryIds, secretaryResponseToast,
    handleCloseApprovedToast, handleCloseRejectedToast,
  };
};
