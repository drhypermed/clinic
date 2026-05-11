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
  onForegroundMessage,
  requestPermissionAndSaveTokenForSecretaryWithDetails,
  showForegroundSystemNotification,
} from '../../../services/messagingService';
import { firestoreService } from '../../../services/firestore';
import { entryConversations } from '../../../services/firestore/entryConversations';
import { resolveNotificationActionStatus } from '../../../utils/notificationAction';
import { SECRETARY_TOAST_AUTO_HIDE_MS } from './constants';
import { isSafePushActionAppointmentId } from './securityUtils';
import type { EntryAlert } from '../../../types';
import type { SecretaryActionToastState } from './types';
import {
  buildSecretaryActionToastKey,
  clearTimedPayload,
  persistSecretaryHandledEntryAlert,
  persistTimedPayload,
  readTimedPayload,
} from '../internalToastStorage';

// نقبل القيم الجديدة (object بمصدر) + القيم القديمة (string) للتوافق مع localStorage
// المحفوظ من إصدارات سابقة. أي قيمة قديمة بنعتبرها 'secretary-action' لأن كان ده
// السلوك الافتراضي قبل ما نضيف مصدر للتوست.
const isSecretaryActionToastValue = (value: unknown): value is SecretaryActionToastState => {
  if (value === null) return true;
  if (value === 'approved' || value === 'rejected') return true; // legacy string
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as { status?: unknown; source?: unknown };
  const validStatus = obj.status === 'approved' || obj.status === 'rejected';
  const validSource = obj.source === 'secretary-action' || obj.source === 'doctor-response';
  return validStatus && validSource;
};

// تطبيع القيمة المحفوظة لو كانت بالشكل القديم (string)
const normalizeRestoredToast = (value: unknown): SecretaryActionToastState => {
  if (value === 'approved' || value === 'rejected') {
    return { status: value, source: 'secretary-action' };
  }
  if (value && typeof value === 'object') return value as SecretaryActionToastState;
  return null;
};

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
  setSecretaryActionToast: (value: SecretaryActionToastState) => void;
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
  // ⚠️ منع تكرار ظهور تنبيه التفعيل: لو تم set مرة في الـsession،
  // الـeffects التانية ما تحاولش تـset(true) تاني (يمنع flicker/duplicate).
  const promptShownInSessionRef = useRef(false);

  // حالة التحكم في ظهور رسالة طلب تفعيل الإشعارات
  const [showSecretaryPushPrompt, setShowSecretaryPushPrompt] = useState(false);
  const [pushEnableSuccessMessage, setPushEnableSuccessMessage] = useState<string | null>(null);
  const pushEnableSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secretaryActionToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // الـprompt يظهر دايماً لو معطل — السكرتيرة تشوف زر التفعيل مع كل refresh.
  // (شيلنا feature الـ"later" اللي كان بيخفيه لأسبوع — كان بيخلي السكرتيرة
  // تنسى تفعّل الإشعارات. الإعدادات بقت في الـsidebar للتحكم اليدوي).
  const canShowSecretaryPushPrompt = showSecretaryPushPrompt;

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
    // مصدر التوست هنا "secretary-action" — السكرتيرة ردت بنفسها عبر الإشعار.
    const toastValue: SecretaryActionToastState = { status, source: 'secretary-action' };
    setSecretaryActionToast(toastValue);
    if (!secret) return;
    const storageKey = buildSecretaryActionToastKey(secret);
    persistTimedPayload(storageKey, toastValue, SECRETARY_TOAST_AUTO_HIDE_MS);
    scheduleSecretaryActionToastClear(SECRETARY_TOAST_AUTO_HIDE_MS);
  };

  /**
   * التأثير الأول: التحقق الابتدائي من دعم الإشعارات حالة الإذن.
   * - لو granted → register تلقائي (default behavior)
   * - لو غير granted → نظهر تنبيه التفعيل (مرة واحدة فقط في الـsession)
   */
  useEffect(() => {
    if (!secret || !isAuthenticated) {
      setShowSecretaryPushPrompt(false);
      promptShownInSessionRef.current = false;
      return;
    }
    const support = getPushSupportInfo();
    if (!support.supported || typeof window === 'undefined' || !('Notification' in window)) {
      // إبقاء الرسالة ظاهرة على iOS في حال لم يتم تثبيت التطبيق على الشاشة الرئيسية بعد
      if (support.reason === 'ios-install-required' && !promptShownInSessionRef.current) {
        promptShownInSessionRef.current = true;
        setShowSecretaryPushPrompt(true);
      }
      return;
    }

    // إذا كان الإذن ممنوحاً بالفعل، نقوم بتحديث التوكن في الخلفية (الافتراضي)
    if (Notification.permission === 'granted') {
      setShowSecretaryPushPrompt(false);
      promptShownInSessionRef.current = false;
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

    // غير granted → نظهر التنبيه مرة واحدة (الـref يمنع التكرار من re-render)
    if (!promptShownInSessionRef.current) {
      promptShownInSessionRef.current = true;
      setShowSecretaryPushPrompt(true);
    }
  }, [secret, isAuthenticated, sessionBranchId]);

  useEffect(() => {
    if (!secret || !isAuthenticated) return;
    const storageKey = buildSecretaryActionToastKey(secret);
    const restored = readTimedPayload(storageKey, isSecretaryActionToastValue);
    if (!restored) return;
    // تطبيع القيم القديمة (string) للشكل الجديد (object) — توافق رجوعي.
    setSecretaryActionToast(normalizeRestoredToast(restored.value));
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
   * استقبال الإشعارات وعرضها وقت ما الصفحة فاتحة (Foreground).
   * بدون هذا الـ listener، الإشعارات اللي بترسلها Cloud Function (مثل
   * "يتم الانتظار قليلاً" لما الطبيب يضغط انتظار، أو "موعد جديد") ما تظهرش
   * للسكرتيرة طول ما هي فاتحة الصفحة — لأن الـ FCM SDK في الـ foreground
   * مش بيعرضها تلقائياً، لازم نستقبلها يدوياً ونعرضها كـ system notification.
   */
  useEffect(() => {
    if (!secret || !isAuthenticated) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const cleanup = onForegroundMessage((payload) => {
      void showForegroundSystemNotification(payload);
    });
    return cleanup ? () => { cleanup(); } : undefined;
  }, [secret, isAuthenticated]);

  /**
   * بدء عملية تفعيل الإشعارات يدوياً عند النقر على الزر.
   * ترجع true لو نجح فعلياً (token مسجل) — false لو فشل لأي سبب.
   * الـcomponents تستخدم الـreturn value لتحديث الـUI بدقة.
   */
  const handleEnableSecretaryPushNotifications = async (): Promise<boolean> => {
    if (!secret) return false;
    const support = getPushSupportInfo();

    // التعامل مع قيود iOS (يجب التثبيت على الشاشة الرئيسية أولاً)
    if (!support.supported) {
      if (support.reason === 'ios-install-required') {
        alert('بالنسبة لأجهزة iPhone/iPad: يجب تثبيت التطبيق أولاً من Safari (مشاركة > إضافة إلى الشاشة الرئيسية)، ثم افتح التطبيق المثبت وفعّل الإشعارات من هناك.');
      } else {
        alert(`هذا الجهاز/المتصفح لا يدعم الإشعارات حالياً (${support.reason || 'غير مدعوم'}).`);
      }
      return false;
    }

    const result = await requestPermissionAndSaveTokenForSecretaryWithDetails(secret, sessionBranchId);
    if (result.ok) {
      secretaryFcmRequestedRef.current = true;
      setShowSecretaryPushPrompt(false);
      showPushEnabledToast('تم تفعيل الإشعارات بنجاح.');
      return true;
    }

    // ⚠️ ما نعرضش رسالة نجاح لو الـsave فشل — كان فيه bug سابق بيعرض
    // "تم منح الإذن" حتى لو الـtoken مش مسجَّل، فالسكرتيرة تفتكر إنه شغّال
    // وفعلياً مش هتستلم إشعارات.
    if (result.reason === 'save-failed') {
      alert('تعذر حفظ تسجيل الإشعارات. الجلسة قد تكون انتهت — سجّل خروج ودخول مرة أخرى ثم جرّب.');
      return false;
    }
    if (result.reason === 'timeout') {
      alert('استغرق تفعيل الإشعارات وقتاً طويلاً. تحقق من الإنترنت وأعد المحاولة. لو استمرت المشكلة، أغلق المتصفح وافتحه من جديد.');
      return false;
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
      return false;
    }
    if (typeof window !== 'undefined' && Notification.permission === 'denied') {
      alert('الإشعارات محظورة من المتصفح. فعّلها يدويًا من إعدادات الموقع.');
      return false;
    }
    alert('لم يتم تفعيل إشعارات السكرتارية. حاول مرة أخرى.');
    return false;
  };

  /**
   * إخفاء تنبيه التفعيل للجلسة الحالية فقط (يظهر تاني مع refresh أو login).
   */
  const handleSecretaryPushPromptLater = () => {
    setShowSecretaryPushPrompt(false);
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
        await entryConversations.respond({
          secret,
          direction: 'D2S',
          appointmentId,
          status,
          branchId: sessionBranchId,
        });
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
