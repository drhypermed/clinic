import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import {
  getPushSupportInfo,
  onForegroundMessage,
  requestPermissionAndSaveTokenWithDetails,
  showForegroundSystemNotification,
} from '../../../services/messagingService';
import { firestoreService } from '../../../services/firestore';
import { playNotificationCue } from '../../../utils/notificationSound';
import {
  INTERNAL_TOAST_MIN_VISIBLE_MS,
  buildDoctorNewAppointmentToastKey,
  clearTimedPayload,
  markNotificationSeen,
  persistTimedPayload,
  readTimedPayload,
  wasNotificationSeen,
} from '../../appointments/internalToastStorage';
import type { ClinicAppointment, PatientRecord } from '../../../types';
import { useBookingConfigSync } from './useBookingConfigSync';
import { usePushNotificationDeepLink } from './usePushNotificationDeepLink';

/**
 * Hook إدارة المواعيد والتنبيهات (useMainAppAppointments)
 * المحرك المسؤول عن كل ما يخص المواعيد وإشعارات السكرتارية.
 * المهام:
 * 1. متابعة قائمة المواعيد من Firestore لحظياً.
 * 2. اكتشاف المواعيد الجديدة وإظهار تنبيه (Toast) للمستخدم.
 * 3. إدارة إشعارات الـ Push وتفعيلها وحل مشاكل التوكنات.
 * 4. إدارة نظام "طلب دخول السكرتارية" (Secretary Entry Requests).
 * 5. معالجة الإجراءات التفاعلية من الإشعارات (مثل ضغط زر "دخول" من إشعار الهاتف).
 */

export interface NewAppointmentToastData {
  patientName: string;
  age?: string;
  visitReason?: string;
  dateTime: string;
  source: 'secretary' | 'public';
  appointmentType?: 'exam' | 'consultation';
  secretaryVitals?: ClinicAppointment['secretaryVitals'];
  consultationSourceAppointmentId?: string;
  consultationSourceCompletedAt?: string;
  consultationSourceRecordId?: string;
  /** الفرع الذي يخصه الموعد — للتوجيه الصحيح من push notification. */
  branchId?: string;
}

export interface SecretaryEntryRequestData {
  appointmentId: string;
  patientName: string;
  age?: string;
  visitReason?: string;
  appointmentType?: 'exam' | 'consultation';
  createdAt: string;
  /** الفرع الذي أرسل منه السكرتير الطلب — لتوجيه الرد إلى نفس الفرع. */
  branchId?: string;
}

interface UseMainAppAppointmentsParams {
  userId: string;
  userEmail?: string | null;
  records: PatientRecord[];
  pathname: string;
  search: string;
  navigate: NavigateFunction;
  /** الفرع النشط — لو تم تمريره يتم فلترة المواعيد حسبه */
  activeBranchId?: string;
  /**
   * Callback اختياري للتبديل للفرع المحدد — يُستدعى عند فتح push notification
   * لموعد في فرع غير الفرع النشط حالياً. الـ parent يمرر `setActiveBranchId`.
   */
  onRequestBranchSwitch?: (branchId: string) => void;
  /**
   * قائمة الـ branchId لكل فروع الطبيب.
   * نحتاجها عند مزامنة `todayAppointmentsByBranch` لضمان كتابة مفتاح فارغ `[]` لكل فرع
   * بدون مواعيد اليوم — بدون هذا، فرع بدون مواعيد اليوم يحتفظ بقائمة مواعيد أمس القديمة.
   */
  branchIds?: string[];
}

// ثوابت زمنية لتجاهل الإشعارات القديمة
const NOTIFICATION_STALE_AFTER_MS = 3 * 60 * 60 * 1000;
const formatLocalDayStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const isNewAppointmentToastData = (value: unknown): value is NewAppointmentToastData => {
  if (!value || typeof value !== 'object') return false;
  const toast = value as Partial<NewAppointmentToastData>;
  return (
    typeof toast.patientName === 'string' &&
    typeof toast.dateTime === 'string' &&
    (toast.source === 'secretary' || toast.source === 'public')
  );
};

const getTimeMs = (value?: string | null): number | null => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
};

const isRecentNotification = (value?: string | null) => {
  const createdMs = getTimeMs(value);
  if (createdMs === null) return true;
  return Date.now() - createdMs <= NOTIFICATION_STALE_AFTER_MS;
};

export const useMainAppAppointments = ({ userId, userEmail, records, pathname, search, navigate, activeBranchId, onRequestBranchSwitch, branchIds }: UseMainAppAppointmentsParams) => {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const prevAppointmentIdsRef = useRef<Set<string>>(new Set());
  const [newAppointmentToast, setNewAppointmentToast] = useState<NewAppointmentToastData | null>(null);
  const [bookingSecret, setBookingSecret] = useState<string | null>(null);
  const [secretaryEntryRequest, setSecretaryEntryRequest] = useState<SecretaryEntryRequestData | null>(null);
  const lastSecretaryRequestCreatedRef = useRef<string | null>(null);
  const handledPushDoctorActionsRef = useRef<Set<string>>(new Set());
  const [showPushPrompt, setShowPushPrompt] = useState(false);
  const [, setPushRegistrationRequired] = useState(false);
  const [pushEnableSuccessMessage, setPushEnableSuccessMessage] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState<string>(() => formatLocalDayStr(new Date()));
  const newAppointmentToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // تحديث "تاريخ اليوم" تلقائياً عند منتصف الليل حتى تعكس عدادات مواعيد اليوم اليوم الصحيح
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const scheduleNextMidnight = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
      const delay = Math.max(1000, next.getTime() - now.getTime());
      timeoutId = setTimeout(() => {
        setTodayStr(formatLocalDayStr(new Date()));
        scheduleNextMidnight();
      }, delay);
    };
    scheduleNextMidnight();
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, []);

  const clearNewAppointmentToast = useCallback(() => {
    if (newAppointmentToastTimerRef.current) {
      clearTimeout(newAppointmentToastTimerRef.current);
      newAppointmentToastTimerRef.current = null;
    }
    setNewAppointmentToast(null);
    if (!userId) return;
    clearTimedPayload(buildDoctorNewAppointmentToastKey(userId));
  }, [userId]);

  const scheduleNewAppointmentToastClear = useCallback(
    (delayMs: number) => {
      if (newAppointmentToastTimerRef.current) {
        clearTimeout(newAppointmentToastTimerRef.current);
      }
      newAppointmentToastTimerRef.current = setTimeout(() => {
        clearNewAppointmentToast();
      }, Math.max(0, delayMs));
    },
    [clearNewAppointmentToast]
  );

  const showNewAppointmentToastForMinute = useCallback(
    (toast: NewAppointmentToastData) => {
      setNewAppointmentToast(toast);
      if (!userId) return;
      const storageKey = buildDoctorNewAppointmentToastKey(userId);
      persistTimedPayload(storageKey, toast, INTERNAL_TOAST_MIN_VISIBLE_MS);
      scheduleNewAppointmentToastClear(INTERNAL_TOAST_MIN_VISIBLE_MS);
    },
    [userId, scheduleNewAppointmentToastClear]
  );

  const setNewAppointmentToastState = useCallback(
    (value: NewAppointmentToastData | null) => {
      if (value) {
        showNewAppointmentToastForMinute(value);
        return;
      }
      clearNewAppointmentToast();
    },
    [clearNewAppointmentToast, showNewAppointmentToastForMinute]
  );

  useEffect(() => {
    if (!userId) {
      clearNewAppointmentToast();
      return;
    }
    const storageKey = buildDoctorNewAppointmentToastKey(userId);
    const restored = readTimedPayload(storageKey, isNewAppointmentToastData);
    if (!restored) return;
    setNewAppointmentToast(restored.value);
    const remainingMs = Math.max(0, restored.expiresAt - Date.now());
    scheduleNewAppointmentToastClear(remainingMs);
  }, [userId, clearNewAppointmentToast, scheduleNewAppointmentToastClear]);

  useEffect(() => {
    return () => {
      if (newAppointmentToastTimerRef.current) {
        clearTimeout(newAppointmentToastTimerRef.current);
      }
    };
  }, []);

  // 1. الاشتراك في تحديثات المواعيد من Firestore (مع فلترة حسب الفرع النشط)
  useEffect(() => {
    if (!userId) return;
    const unsub = firestoreService.subscribeToAppointments(userId, setAppointments, activeBranchId);
    return () => unsub();
  }, [userId, activeBranchId]);

  // 1.ب — الاشتراك في كل المواعيد (من كل الفروع) لأغراض مزامنة bookingConfig per-branch
  //        دي subscription منفصلة عشان السكرتيرات في كل فرع يشوفوا بياناتهم فقط.
  const [allAppointmentsAcrossBranches, setAllAppointmentsAcrossBranches] = useState<ClinicAppointment[]>([]);
  useEffect(() => {
    if (!userId) {
      setAllAppointmentsAcrossBranches([]);
      return;
    }
    const unsub = firestoreService.subscribeToAppointments(userId, setAllAppointmentsAcrossBranches, undefined);
    return () => unsub();
  }, [userId]);

  // 1.أ — تصفير مرجع الـ ids عند تبديل المستخدم أو الفرع حتى لا تُطلَق تنبيهات كاذبة لمواعيد فرع جديد كأنها "جديدة"
  useEffect(() => {
    prevAppointmentIdsRef.current = new Set();
  }, [userId, activeBranchId]);

  // 2. كشف المواعيد الجديدة وإطلاق صوت التنبيه والـ Toast
  //    المقارنة بالمحتوى (ids غير موجودة سابقاً) وليس بالأحجام، حتى لا يضيع أي موعد بعد حذف موعد آخر.
  useEffect(() => {
    const currentIds = new Set(appointments.map((a) => a.id));
    if (prevAppointmentIdsRef.current.size === 0) {
      // أول تعبئة (بعد mount أو بعد تبديل الفرع): املأ بصمت بدون تنبيهات.
      prevAppointmentIdsRef.current = currentIds;
      return;
    }
    const newIds = [...currentIds].filter((id) => !prevAppointmentIdsRef.current.has(id));
    if (newIds.length > 0) {
      const newApts = appointments.filter((a) => newIds.includes(a.id));
      // البحث عن أول موعد خارجي (من السكرتارية أو الجمهور) لعمل تنبيه له
      const firstExternal = newApts.find((a) => {
        if (a.source !== 'secretary' && a.source !== 'public') return false;
        return isRecentNotification(a.createdAt || a.dateTime);
      });
      if (firstExternal && (firstExternal.source === 'secretary' || firstExternal.source === 'public')) {
        void playNotificationCue('new_appointment');
        showNewAppointmentToastForMinute({
          patientName: firstExternal.patientName || '-',
          age: firstExternal.age,
          visitReason: firstExternal.visitReason,
          dateTime: firstExternal.dateTime,
          source: firstExternal.source,
          appointmentType: firstExternal.appointmentType,
          secretaryVitals: firstExternal.secretaryVitals,
          consultationSourceAppointmentId: firstExternal.consultationSourceAppointmentId,
          consultationSourceCompletedAt: firstExternal.consultationSourceCompletedAt,
          consultationSourceRecordId: firstExternal.consultationSourceRecordId,
          branchId: firstExternal.branchId,
        });
      }
    }
    // تحديث المرجع دائماً (حتى عند نقصان العدد) حتى تبقى المقارنة دقيقة في التحديث التالي.
    prevAppointmentIdsRef.current = currentIds;
  }, [appointments, showNewAppointmentToastForMinute]);

  // 3. استقبال إشعارات الـ Push في المقدمة (Foreground)
  useEffect(() => {
    if (!userId) return;
    if (Notification.permission === 'granted') {
      const cleanup = onForegroundMessage((payload) => {
        console.log('[App] Foreground push received:', payload);
        void showForegroundSystemNotification(payload);
      });
      return cleanup ? () => { cleanup(); } : undefined;
    }
  }, [userId]);

  // 4. مزامنة توكن الإشعارات (Token Sync) مع السيرفر لضمان استقبال الرسائل
  useEffect(() => {
    if (!userId) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    let isCancelled = false;
    const syncPushToken = async () => {
      try {
        const result = await requestPermissionAndSaveTokenWithDetails(userId);
        if (isCancelled) return;
        setPushRegistrationRequired(!result.ok);
        if (result.ok) setShowPushPrompt(false);
      } catch {
        if (isCancelled) return;
        setPushRegistrationRequired(true);
      }
    };

    void syncPushToken();
    const onVisibility = () => { if (document.visibilityState === 'visible') void syncPushToken(); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => { isCancelled = true; document.removeEventListener('visibilitychange', onVisibility); };
  }, [userId]);

  // وظيفة تفعيل الإشعارات يدوياً عند ضغط الطبيب على زر التفعيل
  const handleEnablePushNotifications = async () => {
    if (!userId) return;
    const result = await requestPermissionAndSaveTokenWithDetails(userId);
    if (result.ok) {
      setPushRegistrationRequired(false);
      setShowPushPrompt(false);
      setPushEnableSuccessMessage('تم تفعيل الإشعارات بنجاح.');
      return;
    }
    // معالجة حالات عدم الدعم (خصوصاً على iOS)
    if (result.reason === 'unsupported') {
      const support = getPushSupportInfo();
      if (support.reason === 'ios-install-required') {
        alert('على iPhone/iPad يجب تثبيت التطبيق كتطبيق ويب من Safari (Share > Add to Home Screen) أولاً.');
      } else {
        alert(`هذا المتصفح لا يدعم إشعارات الويب.`);
      }
      return;
    }
    alert('حدث خطأ أثناء تفعيل الإشعارات. حاول مرة أخرى.');
  };

  // 5. إدارة كود الحجز (Booking Secret) الربط مع السكرتارية
  useEffect(() => {
    if (!userId) return;
    firestoreService.getOrCreateBookingSecret(userId).then((secret) => {
      setBookingSecret(secret);
      if (userEmail) firestoreService.setBookingDoctorEmail(secret, userId, userEmail).catch(() => { });
    });
  }, [userId, userEmail]);

  // 6. متابعة طلبات دخول السكرتارية (Secretary Entry)
  //    الطبيب يشترك بدون branchId — يستقبل أحدث طلب من أي فرع، مع الحفاظ على branchId
  //    في بيانات الطلب حتى يوجَّه الرد للفرع الصحيح.
  useEffect(() => {
    if (!bookingSecret) return;
    const unsub = firestoreService.subscribeToSecretaryEntryRequest(bookingSecret, (data) => {
      if (!data) { setSecretaryEntryRequest(null); return; }
      // لو الإشعار ده ظهر قبل كده، ما نعرضوش تاني حتى لو الطبيب ما ردش عليه.
      // السكرتيرة تقدر ترسل طلب جديد من "إدخال الآن" (createdAt جديد → يظهر طبيعي).
      if (wasNotificationSeen('secretary_entry_req', bookingSecret, data.appointmentId, data.createdAt)) {
        setSecretaryEntryRequest(null);
        return;
      }
      setSecretaryEntryRequest(data);
      markNotificationSeen('secretary_entry_req', bookingSecret, data.appointmentId, data.createdAt);
      if (data.createdAt !== lastSecretaryRequestCreatedRef.current) {
        lastSecretaryRequestCreatedRef.current = data.createdAt;
        const ageSeconds = (Date.now() - new Date(data.createdAt).getTime()) / 1000;
        if (ageSeconds < 60) void playNotificationCue('entry_request');
      }
    });
    return () => unsub();
  }, [bookingSecret]);

  // 7. معالجة الروابط التفاعلية من الإشعارات (Deep Linking Actions) — hook مستخرج
  usePushNotificationDeepLink({
    userId, bookingSecret, pathname, search, navigate,
    activeBranchId, onRequestBranchSwitch,
    setSecretaryEntryRequest, setNewAppointmentToastState,
  });

  // 8. حساب إحصائيات لوحة التحكم لمواعيد اليوم
  const todayAppointmentsCount = useMemo(() => {
    return appointments.filter((apt) => {
      const dt = new Date(apt.dateTime);
      const dayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return dayStr === todayStr && !apt.examCompletedAt;
    }).length;
  }, [appointments, todayStr]);

  // ── مزامنة bookingConfig (today + upcoming + completed) لكل الفروع ──
  // Hook مستخرج بيتولى بناء المصفوفات الـ 3 + الـ sync effects (~200 سطر).
  useBookingConfigSync({
    bookingSecret,
    allAppointmentsAcrossBranches,
    todayStr,
    branchIds,
  });

  const dashboardStats = useMemo(() => ({
    appointments: todayAppointmentsCount,
    examinations: records.length,
    consultations: records.filter((r) => r.consultation).length,
  }), [records, todayAppointmentsCount]);

  return {
    appointments, newAppointmentToast, setNewAppointmentToast: setNewAppointmentToastState,
    bookingSecret, setBookingSecret,
    secretaryEntryRequest, setSecretaryEntryRequest,
    showPushPrompt, pushEnableSuccessMessage, handleEnablePushNotifications, todayAppointmentsCount, dashboardStats,
    todayStr,
  };
};
