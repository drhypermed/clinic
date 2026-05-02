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
  /**
   * معرّف الموعد — مطلوب لمزامنة "تم رؤية الإشعار" بين الأجهزة.
   * عند إغلاق الإشعار على هذا الجهاز نكتب dismiss على Firestore، باقي الأجهزة
   * تستقبل التحديث وتمسح إشعارها فوراً (داخل التطبيق + درج النظام).
   */
  appointmentId?: string;
  /** وقت إنشاء الإشعار — يُستخدم لتجاهل الإشعارات الأقدم من 3 أيام. */
  createdAt?: string;
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

// ثوابت زمنية لتجاهل الإشعارات القديمة — أي إشعار عمره أكتر من 3 أيام يتجاهل في
// كل مسارات العرض (toast داخلي، deep link، foreground، background SW).
// النافذة الزمنية موحَّدة عبر الكود لضمان سلوك ثابت.
export const NOTIFICATION_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const NOTIFICATION_STALE_AFTER_MS = NOTIFICATION_MAX_AGE_MS;
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

/** مرجع الموعد الحالي المعروض كـ toast — نحتاجه عند الإغلاق لكتابة dismiss على Firestore. */
type CurrentToastRef = {
  appointmentId: string;
  branchId?: string;
} | null;

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
  // الـ Set دي بتيجي من Firestore — كل أجهزة الطبيب بتشاركها، فلو جهاز عمل dismiss،
  // باقي الأجهزة تعرف فوراً ومتعرضش الـ toast من جديد.
  const dismissedAppointmentIdsRef = useRef<Set<string>>(new Set());
  // مرجع للموعد المعروض حالياً — نحتاجه عند الإغلاق لإرسال dismiss للسيرفر.
  const currentToastRef = useRef<CurrentToastRef>(null);
  // علامة "وصل أول snapshot من قائمة الإشعارات المُتعامل معاها".
  // نحتاج state (مش ref) عشان الـ effects تعيد التشغيل لما الـ subscription يجاهز —
  // وإلا في race: snapshot المواعيد يصل قبل snapshot dismissed، الـ toast يطلع
  // ويلعب صوت لـ ms قليلة، ثم يختفي = تجربة "تكرار" مزعجة.
  const [dismissedSubscriptionReady, setDismissedSubscriptionReady] = useState(false);

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
    currentToastRef.current = null;
    setNewAppointmentToast(null);
    if (!userId) return;
    clearTimedPayload(buildDoctorNewAppointmentToastKey(userId));
    // ملاحظة: تسجيل dismiss على Firestore بيحصل عند **عرض** الـ toast (مش عند الإغلاق)،
    // لضمان "إشعار ظهر مرة = ما يظهرش تاني" حتى لو الجهاز قُفل قبل الـ TTL.
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
      // فحص cross-device: لو جهاز تاني تعامل مع الإشعار ده قبل كده، ما نعرضوش
      if (toast.appointmentId && dismissedAppointmentIdsRef.current.has(toast.appointmentId)) {
        return;
      }
      // فحص العمر — أي إشعار عمره أكتر من 3 أيام ميظهرش
      if (toast.createdAt) {
        const ageMs = Date.now() - new Date(toast.createdAt).getTime();
        if (Number.isFinite(ageMs) && ageMs > NOTIFICATION_MAX_AGE_MS) return;
      }
      setNewAppointmentToast(toast);
      currentToastRef.current = toast.appointmentId
        ? { appointmentId: toast.appointmentId, branchId: toast.branchId }
        : null;
      // ضمان "ظهر = اتسجل dismissed": نكتب على Firestore فوراً عند العرض،
      // قبل ما يقفل الـ user أو يخرج من التطبيق. ده يمنع تكرار العرض على
      // أي جهاز تاني، حتى لو الجهاز ده اتقفل قبل الـ TTL.
      if (toast.appointmentId && userId) {
        dismissedAppointmentIdsRef.current.add(toast.appointmentId);
        void firestoreService
          .markAppointmentNotificationDismissed(userId, {
            appointmentId: toast.appointmentId,
            branchId: toast.branchId,
          })
          .catch((err) => {
            console.warn('[useMainAppAppointments] failed to mark dismissed:', err);
          });
      }
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
    // ننتظر وصول قائمة "اللي اتعالج" قبل ما نستعيد toast من localStorage —
    // وإلا الـ toast هيظهر للحظة قبل ما نعرف إنه اتعالج على جهاز تاني (flicker + صوت).
    if (!dismissedSubscriptionReady) return;
    const storageKey = buildDoctorNewAppointmentToastKey(userId);
    const restored = readTimedPayload(storageKey, isNewAppointmentToastData);
    if (!restored) return;
    // فحص cross-device عند التحميل — لو جهاز تاني تعامل مع الإشعار، ما نعيد عرضه
    if (
      restored.value.appointmentId &&
      dismissedAppointmentIdsRef.current.has(restored.value.appointmentId)
    ) {
      clearTimedPayload(storageKey);
      return;
    }
    setNewAppointmentToast(restored.value);
    currentToastRef.current = restored.value.appointmentId
      ? { appointmentId: restored.value.appointmentId, branchId: restored.value.branchId }
      : null;
    const remainingMs = Math.max(0, restored.expiresAt - Date.now());
    scheduleNewAppointmentToastClear(remainingMs);
  }, [userId, dismissedSubscriptionReady, clearNewAppointmentToast, scheduleNewAppointmentToastClear]);

  // الاشتراك في "الإشعارات المُتعامل معاها" — مزامنة لحظية بين كل أجهزة الطبيب.
  // أول جهاز يقفل الإشعار → السيرفر يخبر باقي الأجهزة → نمسح الـ toast الحالي إن كان معروضاً.
  useEffect(() => {
    if (!userId) {
      dismissedAppointmentIdsRef.current = new Set();
      setDismissedSubscriptionReady(false);
      return;
    }
    const unsub = firestoreService.subscribeToDismissedAppointmentNotifications(
      userId,
      (ids) => {
        dismissedAppointmentIdsRef.current = ids;
        // أول snapshot يحرّر الـ effects الأخرى لتعمل (انظر التعليق فوق على الـ ref/state).
        setDismissedSubscriptionReady(true);
        // لو الـ toast المعروض حالياً اتعالج على جهاز تاني → اقفله من غير ما نسجل dismiss تاني
        const current = currentToastRef.current;
        if (current?.appointmentId && ids.has(current.appointmentId)) {
          if (newAppointmentToastTimerRef.current) {
            clearTimeout(newAppointmentToastTimerRef.current);
            newAppointmentToastTimerRef.current = null;
          }
          currentToastRef.current = null;
          setNewAppointmentToast(null);
          clearTimedPayload(buildDoctorNewAppointmentToastKey(userId));
        }
      },
    );
    return () => unsub();
  }, [userId]);

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
    // ننتظر قائمة "اللي اتعالج" قبل أي معالجة — مهم لتفادي إظهار toast + صوت
    // لإشعار سبق التعامل معاه على جهاز تاني (race بين subscription المواعيد و dismissed).
    if (!dismissedSubscriptionReady) return;
    const currentIds = new Set(appointments.map((a) => a.id));
    if (prevAppointmentIdsRef.current.size === 0) {
      // أول تعبئة (بعد mount أو بعد تبديل الفرع): املأ بصمت — لكن لو فيه موعد
      // اتحجز خلال آخر 60 ثانية، اعرض toast له. ده بيحل race تبديل الفرع:
      // لو سكرتيرة الفرع الجديد حجزت موعد لحظة التبديل، الموعد كان هيدخل ضمن
      // أول تعبئة بدون تنبيه — دلوقتي بنمسكه عبر createdAt.
      const RECENT_BRANCH_SWITCH_WINDOW_MS = 60_000;
      const cutoffMs = Date.now() - RECENT_BRANCH_SWITCH_WINDOW_MS;
      const veryRecent = appointments.find((a) => {
        if (a.source !== 'secretary' && a.source !== 'public') return false;
        const createdMs = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
        return Number.isFinite(createdMs) && createdMs >= cutoffMs;
      });
      if (
        veryRecent &&
        (veryRecent.source === 'secretary' || veryRecent.source === 'public') &&
        !dismissedAppointmentIdsRef.current.has(veryRecent.id)
      ) {
        void playNotificationCue('new_appointment');
        showNewAppointmentToastForMinute({
          patientName: veryRecent.patientName || '-',
          age: veryRecent.age,
          visitReason: veryRecent.visitReason,
          dateTime: veryRecent.dateTime,
          source: veryRecent.source,
          appointmentType: veryRecent.appointmentType,
          secretaryVitals: veryRecent.secretaryVitals,
          consultationSourceAppointmentId: veryRecent.consultationSourceAppointmentId,
          consultationSourceCompletedAt: veryRecent.consultationSourceCompletedAt,
          consultationSourceRecordId: veryRecent.consultationSourceRecordId,
          branchId: veryRecent.branchId,
          appointmentId: veryRecent.id,
          createdAt: veryRecent.createdAt,
        });
      }
      prevAppointmentIdsRef.current = currentIds;
      return;
    }
    const newIds = [...currentIds].filter((id) => !prevAppointmentIdsRef.current.has(id));
    if (newIds.length > 0) {
      const newApts = appointments.filter((a) => newIds.includes(a.id));
      // البحث عن أول موعد خارجي (من السكرتارية أو الجمهور) لعمل تنبيه له.
      // ملاحظة: نعتمد على createdAt فقط — مفيش fallback على dateTime لأن وقت
      // الموعد ممكن يكون مستقبلي بأيام (يخدع الفحص: "غير stale") أو ماضي بساعات
      // (يقفل toast لموعد لسه اتحجز). لو ما عندناش createdAt (موعد legacy)،
      // نعتبره recent — أصل البراءة.
      const firstExternal = newApts.find((a) => {
        if (a.source !== 'secretary' && a.source !== 'public') return false;
        return a.createdAt ? isRecentNotification(a.createdAt) : true;
      });
      if (firstExternal && (firstExternal.source === 'secretary' || firstExternal.source === 'public')) {
        // فحص cross-device قبل التشغيل والعرض — لو جهاز تاني تعامل مع الإشعار،
        // متشغّلش حتى الصوت (الطبيب أصلاً سمع التنبيه على الجهاز التاني).
        if (!dismissedAppointmentIdsRef.current.has(firstExternal.id)) {
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
            appointmentId: firstExternal.id,
            createdAt: firstExternal.createdAt,
          });
        }
      }
    }
    // تحديث المرجع دائماً (حتى عند نقصان العدد) حتى تبقى المقارنة دقيقة في التحديث التالي.
    prevAppointmentIdsRef.current = currentIds;
  }, [appointments, dismissedSubscriptionReady, showNewAppointmentToastForMinute]);

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
