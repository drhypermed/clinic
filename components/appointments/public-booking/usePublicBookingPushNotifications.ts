/**
 * الملف: usePublicBookingPushNotifications.ts (Hook)
 * الوصف: "نظام التنبيهات الذكي". 
 * يربط هذا الملف المتصفح بخدمة الإشعارات (Firebase Cloud Messaging): 
 * - يطلب إذن المستخدم لتفعيل الإشعارات (Push Permissions). 
 * - يحفظ "عنوان الجهاز" (FCM Token) في قاعدة البيانات لتصل إليه التنبيهات. 
 * - يعالج "الأفعال السريعة" (Quick Actions)؛ مثل الموافقة على دخول 
 *   مريض مباشرة من الإشعار المنبثق في الهاتف دون الحاجة لفتح التطبيق. 
 * - يدعم أجهزة iPhone و Android مع مراعاة القيود الفنية لكل نظام.
 */
import { useEffect, useRef, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import {
  closePushNotificationsByContext,
  getPushSupportInfo,
  requestPermissionAndSaveTokenForSecretaryWithDetails,
} from '../../../services/messagingService';
import { firestoreService } from '../../../services/firestore';
import { resolveNotificationActionStatus } from '../../../utils/notificationAction';
import {
  SECRETARY_PUSH_PROMPT_HIDE_MS,
  SECRETARY_PUSH_PROMPT_HIDE_UNTIL_KEY,
  SECRETARY_TOAST_AUTO_HIDE_MS,
} from './constants';
import { isSafePushActionAppointmentId } from './securityUtils';
import type { EntryAlert } from '../../../types';
import {
  buildSecretaryActionToastKey,
  clearTimedPayload,
  persistSecretaryHandledEntryAlert,
  persistTimedPayload,
  readTimedPayload,
} from '../internalToastStorage';

const isSecretaryActionToastValue = (value: unknown): value is 'approved' | 'rejected' =>
  value === 'approved' || value === 'rejected';

/**
 * المعاملات الخاصة بـ Hook إشعارات السكرتارية
 */
type UsePublicBookingPushNotificationsParams = {
  secret: string;
  /** معرّف الفرع اللي السكرتيرة مسجلة دخول عليه. يُستخدم لعزل الإشعارات. */
  sessionBranchId?: string;
  isAuthenticated: boolean;
  locationPathname: string;
  locationSearch: string;
  navigate: NavigateFunction;
  setEntryResponding: (value: boolean) => void;
  setSecretaryActionToast: (value: 'approved' | 'rejected' | null) => void;
  setEntryAlert: (value: EntryAlert | null) => void;
  setFormError: (value: string | null) => void;
};

/**
 * هوك (Hook) "إشعارات السكرتارية" (usePublicBookingPushNotifications)
 * مسؤول عن طلب إذن الإشعارات، حفظ توكن الجهاز، ومعالجة الإجراءات القادمة من الإشعارات المنبثقة
 */
export const usePublicBookingPushNotifications = ({
  secret,
  sessionBranchId,
  isAuthenticated,
  locationPathname,
  locationSearch,
  navigate,
  setEntryResponding,
  setSecretaryActionToast,
  setEntryAlert,
  setFormError,
}: UsePublicBookingPushNotificationsParams) => {
  // مراجع لتتبع حالة طلب الإشعارات ومنع التكرار
  const secretaryFcmRequestedRef = useRef(false);
  const handledPushSecretaryActionRef = useRef<string | null>(null);
  const handledPushOpenRef = useRef<string | null>(null);
  
  // حالة التحكم في ظهور رسالة طلب تفعيل الإشعارات
  const [showSecretaryPushPrompt, setShowSecretaryPushPrompt] = useState(false);
  const [hideSecretaryPushPromptUntil, setHideSecretaryPushPromptUntil] = useState(0);
  const [pushEnableSuccessMessage, setPushEnableSuccessMessage] = useState<string | null>(null);
  const pushEnableSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secretaryActionToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // هل يمكن عرض التنبيه الآن بناءً على وقت التأجيل المخزن؟
  const canShowSecretaryPushPrompt = showSecretaryPushPrompt && Date.now() >= hideSecretaryPushPromptUntil;

  /**
   * إظهار رسالة نجاح تفعيل الإشعارات لفترة قصيرة
   */
  const showPushEnabledToast = (message: string) => {
    setPushEnableSuccessMessage(message);
    if (pushEnableSuccessTimerRef.current) {
      clearTimeout(pushEnableSuccessTimerRef.current);
    }
    pushEnableSuccessTimerRef.current = setTimeout(() => {
      setPushEnableSuccessMessage(null);
      pushEnableSuccessTimerRef.current = null;
    }, 3200);
  };

  const clearSecretaryActionToastWithStorage = () => {
    if (secretaryActionToastTimerRef.current) {
      clearTimeout(secretaryActionToastTimerRef.current);
      secretaryActionToastTimerRef.current = null;
    }
    setSecretaryActionToast(null);
    if (!secret) return;
    clearTimedPayload(buildSecretaryActionToastKey(secret));
  };

  const scheduleSecretaryActionToastClear = (delayMs: number) => {
    if (secretaryActionToastTimerRef.current) {
      clearTimeout(secretaryActionToastTimerRef.current);
    }
    secretaryActionToastTimerRef.current = setTimeout(() => {
      clearSecretaryActionToastWithStorage();
    }, Math.max(0, delayMs));
  };

  const showSecretaryActionToastForMinute = (status: 'approved' | 'rejected') => {
    setSecretaryActionToast(status);
    if (!secret) return;
    const storageKey = buildSecretaryActionToastKey(secret);
    persistTimedPayload(storageKey, status, SECRETARY_TOAST_AUTO_HIDE_MS);
    scheduleSecretaryActionToastClear(SECRETARY_TOAST_AUTO_HIDE_MS);
  };

  /**
   * التأثير الأول: التحقق الابتدائي من دعم الإشعارات حالة الإذن
   */
  useEffect(() => {
    if (!secret || !isAuthenticated) {
      setShowSecretaryPushPrompt(false);
      return;
    }
    const support = getPushSupportInfo();
    if (!support.supported || typeof window === 'undefined' || !('Notification' in window)) {
      // إبقاء الرسالة ظاهرة على iOS في حال لم يتم تثبيت التطبيق على الشاشة الرئيسية بعد
      setShowSecretaryPushPrompt(support.reason === 'ios-install-required');
      return;
    }

    // إذا كان الإذن ممنوحاً بالفعل، نقوم بتحديث التوكن في الخلفية
    if (Notification.permission === 'granted') {
      setShowSecretaryPushPrompt(false);
      if (secretaryFcmRequestedRef.current) return;
      secretaryFcmRequestedRef.current = true;
      requestPermissionAndSaveTokenForSecretaryWithDetails(secret, sessionBranchId)
        .then(() => {
          setShowSecretaryPushPrompt(false);
        })
        .catch(() => {
          setShowSecretaryPushPrompt(false);
        });
      return;
    }

    // إذا لم يمنح الإذن بعد، نظهر رسالة تفعيل الإشعارات
    setShowSecretaryPushPrompt(true);
  }, [secret, isAuthenticated, sessionBranchId]);

  /**
   * استرجاع وقت "التأجيل" (Hide Later) من التخزين المحلي
   */
  useEffect(() => {
    const raw = localStorage.getItem(SECRETARY_PUSH_PROMPT_HIDE_UNTIL_KEY);
    const until = Number(raw || 0);
    if (Number.isFinite(until) && until > 0) {
      setHideSecretaryPushPromptUntil(until);
    }
  }, []);

  useEffect(() => {
    if (!secret || !isAuthenticated) return;
    const storageKey = buildSecretaryActionToastKey(secret);
    const restored = readTimedPayload(storageKey, isSecretaryActionToastValue);
    if (!restored) return;
    setSecretaryActionToast(restored.value);
    const remainingMs = Math.max(0, restored.expiresAt - Date.now());
    scheduleSecretaryActionToastClear(remainingMs);
  }, [secret, isAuthenticated, setSecretaryActionToast]);

  /**
   * تحديث التوكن دورياً أو عند عودة المستخدم للصفحة (Visibility Change)
   */
  useEffect(() => {
    if (!secret || !isAuthenticated) return;
    const refreshToken = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;
      try {
        await requestPermissionAndSaveTokenForSecretaryWithDetails(secret, sessionBranchId);
        setShowSecretaryPushPrompt(false);
      } catch {
        setShowSecretaryPushPrompt(false);
      }
    };

    void refreshToken();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshToken();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [secret, isAuthenticated, sessionBranchId]);

  /**
   * بدء عملية تفعيل الإشعارات يدوياً عند النقر على الزر
   */
  const handleEnableSecretaryPushNotifications = async () => {
    if (!secret) return;
    const support = getPushSupportInfo();
    
    // التعامل مع قيود iOS (يجب التثبيت على الشاشة الرئيسية أولاً)
    if (!support.supported) {
      if (support.reason === 'ios-install-required') {
        alert('بالنسبة لأجهزة iPhone/iPad: يجب تثبيت التطبيق أولاً من Safari (مشاركة > إضافة إلى الشاشة الرئيسية)، ثم افتح التطبيق المثبت وفعّل الإشعارات من هناك.');
      } else {
        alert(`هذا الجهاز/المتصفح لا يدعم الإشعارات حالياً (${support.reason || 'غير مدعوم'}).`);
      }
      return;
    }

    const result = await requestPermissionAndSaveTokenForSecretaryWithDetails(secret, sessionBranchId);
    if (result.ok) {
      secretaryFcmRequestedRef.current = true;
      setShowSecretaryPushPrompt(false);
      showPushEnabledToast('تم تفعيل الإشعارات بنجاح.');
      return;
    }
    if (result.permission === 'granted') {
      secretaryFcmRequestedRef.current = true;
      setShowSecretaryPushPrompt(false);
      showPushEnabledToast('تم منح إذن الإشعارات، وجارٍ تجهيز التنبيهات.');
      return;
    }

    // التعامل مع الأخطاء الشائعة أثناء التفعيل
    if (result.reason === 'save-failed') {
      alert('تم السماح بالإشعارات لكن تعذر حفظ توكن الجهاز. تحقق من الاتصال ثم أعد المحاولة.');
      return;
    }
    if (result.reason === 'token-empty') {
      const debugCode = String(result.debugCode || '').toLowerCase();
      if (debugCode.includes('invalid-vapid-key')) {
        alert('تعذر تفعيل إشعارات الخلفية الآن بسبب إعدادات مفاتيح الإشعارات. أعد المحاولة بعد قليل.');
      } else if (debugCode.includes('failed-service-worker-registration')) {
        alert('تعذر تجهيز خدمة الإشعارات في المتصفح. أغلق التطبيق تماماً وافتحه ثم أعد المحاولة.');
      } else {
        alert('تعذر استخراج توكن الإشعارات للجهاز. أعد فتح الصفحة ثم حاول مرة أخرى.');
      }
      return;
    }
    if (typeof window !== 'undefined' && Notification.permission === 'denied') {
      alert('الإشعارات محظورة من المتصفح. فعّلها يدويًا من إعدادات الموقع.');
      return;
    }
    alert('لم يتم تفعيل إشعارات السكرتارية. حاول مرة أخرى.');
  };

  /**
   * تأجيل ظهور رسالة تفعيل الإشعارات لفترة زمنية محددة
   */
  const handleSecretaryPushPromptLater = () => {
    const until = Date.now() + SECRETARY_PUSH_PROMPT_HIDE_MS;
    setHideSecretaryPushPromptUntil(until);
    localStorage.setItem(SECRETARY_PUSH_PROMPT_HIDE_UNTIL_KEY, String(until));
  };

  /**
   * أهم جزء: مراقبة الرابط (URL) للبحث عن "إجراءات قادمة من إشعار" (dh_action)
   * تتيح للسكرتارية الموافقة على دخول الحالة مباشرة من التنبيه المنبثق في الهاتف
   */
  useEffect(() => {
    if (!secret || !isAuthenticated) return;
    const params = new URLSearchParams(locationSearch);
    const openSource = (params.get('dh_open') || '').trim();
    const openType = (params.get('dh_type') || '').trim();
    if (openSource === 'push' && openType === 'doctor_entry_request') {
      const appointmentId = (params.get('appointmentId') || '').trim();
      if (!isSafePushActionAppointmentId(appointmentId)) {
        navigate(locationPathname, { replace: true });
        return;
      }
      const openSecret = (params.get('secret') || '').trim();
      if (openSecret && openSecret !== secret) return;
      const dedupeKey = `${secret}:${appointmentId}:open`;
      if (handledPushOpenRef.current !== dedupeKey) {
        const caseName = (params.get('caseName') || params.get('patientName') || '').trim() || 'مريض';
        setEntryAlert({
          caseName,
          appointmentId,
          createdAt: new Date().toISOString(),
        });
        handledPushOpenRef.current = dedupeKey;
      }
      navigate(locationPathname, { replace: true });
      return;
    }

    const action = params.get('dh_action');
    if (action !== 'secretary_entry_response') return;

    // تحليل حالة الرد (موافقة/رفض) ومعرف الموعد المرتبط
    const status = resolveNotificationActionStatus({
      status: params.get('status'),
      button: params.get('dh_btn'),
    });
    const appointmentId = (params.get('appointmentId') || '').trim();
    if (!status || !isSafePushActionAppointmentId(appointmentId)) return;
    
    const source = (params.get('dh_src') || '').trim();
    const tsRaw = Number(params.get('dh_ts') || 0);
    
    // التأكد من أن الإجراء حديث (خلال آخر 10 دقائق) لمنع تكرار الإجراءات القديمة
    if (source === 'push' && Number.isFinite(tsRaw) && tsRaw > 0) {
      const ageMs = Date.now() - tsRaw;
      if (ageMs > 10 * 60 * 1000) {
        navigate(locationPathname, { replace: true });
        return;
      }
    }

    const actionKey = `${secret}:${appointmentId}:${status}`;
    const pendingActionKey = `pending:${actionKey}`;
    if (handledPushSecretaryActionRef.current === actionKey || handledPushSecretaryActionRef.current === pendingActionKey) return;
    handledPushSecretaryActionRef.current = pendingActionKey;

    setEntryResponding(true);
    (async () => {
      let success = false;
      try {
        // إرسال الإجراء إلى Firestore ليراه الطبيب (مقسّم بالفرع).
        // الدالة الآن تعتبر الرد ناجحاً إذا وصل الطبيب عبر secretaryEntryAlertResponse
        // حتى لو فشلت عملية تنظيف bookingConfig — نتعامل مع النجاح هنا كنجاح حقيقي.
        await firestoreService.respondToDoctorEntryAlert(secret, appointmentId, status, sessionBranchId);
        if (status === 'approved') showSecretaryActionToastForMinute('approved');
        else showSecretaryActionToastForMinute('rejected');
        persistSecretaryHandledEntryAlert(secret, {
          appointmentId,
          createdAt: '',
          status,
          handledAt: new Date().toISOString(),
        });
        setEntryAlert(null);
        void closePushNotificationsByContext({
          type: 'doctor_entry_request',
          appointmentId,
          secret,
        });
        success = true;
      } catch (error) {
        console.error('[Secretary] Failed to handle push action:', error);
        // الفشل هنا يعني إن كتابة الرد الأساسية فشلت — نخبر المستخدم بالنظافة
        setEntryAlert(null);
        setFormError('تعذر تنفيذ الإجراء من الإشعار. حاول مرة أخرى.');
      } finally {
        setEntryResponding(false);
        if (success) {
          handledPushSecretaryActionRef.current = actionKey;
          // تنظيف الرابط بعد النجاح لعدم تكرار الإجراء عند التحديث
          navigate(locationPathname, { replace: true });
        } else if (handledPushSecretaryActionRef.current === pendingActionKey) {
          handledPushSecretaryActionRef.current = null;
        }
      }
    })();
  }, [
    secret,
    isAuthenticated,
    locationPathname,
    locationSearch,
    navigate,
    setEntryResponding,
    setSecretaryActionToast,
    setEntryAlert,
    setFormError,
  ]);

  // تنظيف المؤقتات عند إغلاق المكون
  useEffect(() => {
    return () => {
      if (pushEnableSuccessTimerRef.current) {
        clearTimeout(pushEnableSuccessTimerRef.current);
      }
      if (secretaryActionToastTimerRef.current) {
        clearTimeout(secretaryActionToastTimerRef.current);
      }
    };
  }, []);

  // تصدير الحالة والدوال لاستخدامها في واجهة المستخدم
  return {
    showSecretaryPushPrompt,
    setShowSecretaryPushPrompt,
    canShowSecretaryPushPrompt,
    pushEnableSuccessMessage,
    handleEnableSecretaryPushNotifications,
    handleSecretaryPushPromptLater,
  };
};
