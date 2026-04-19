/**
 * الملف: usePublicBookingRealtimeSync.ts (Hook)
 * الوصف: "محرك المزامنة اللحظية". 
 * هذا الملف هو المسؤول عن بقاء واجهة السكرتارية "حية" وتحديثها تلقائياً. 
 * يقوم بـ: 
 * 1. الاشتراك في Firestore لمراقبة أي تغيير في المواعيد أو الإعدادات. 
 * 2. مراقبة "ردود الطبيب" وعرض تنبيهات (Approved/Wait) فور صدورها. 
 * 3. حماية الجلسة؛ حيث يقوم بتسجيل الخروج التلقائي إذا غير الطبيب كلمة السر. 
 * 4. تشغيل أصوات التنبيهات (Notification Sounds) عند وصول طلبات جديدة.
 */
import { EntryAlert, SecretaryAuthCredentials } from './types';
import { PatientSuggestionOption } from '../add-appointment-form/types';
import { TodayAppointment } from './types';
import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { firestoreService } from '../../../services/firestore';
import { playNotificationCue } from '../../../utils/notificationSound';
import { parseIsoTimeMs } from '../../../utils/expiryTime';
import { SECRETARY_LAST_SECRET_KEY, SECRETARY_TOAST_AUTO_HIDE_MS } from './constants';
import {
  clearSecretaryHandledEntryAlert,
  buildSecretaryDoctorResponseToastKey,
  clearTimedPayload,
  markNotificationSeen,
  persistTimedPayload,
  readSecretaryHandledEntryAlert,
  readTimedPayload,
  wasNotificationSeen,
} from '../internalToastStorage';
import {
  secretaryAuthSecretKey, secretaryAuthUserKey,
} from './helpers';
import type {
  DoctorEntryResponse,
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
} from '../../../types';
import { buildSecretaryVisibilityByFieldDefinitions } from '../../../utils/secretaryVitals';
import {
  isDoctorResponseToastValue,
  mergePatientDirectoryLists,
} from './realtimeSync.helpers';

/**
 * المعاملات الخاصة بـ Hook المزامنة اللحظية مع Firestore
 */
type UsePublicBookingRealtimeSyncParams = {
  secret: string;
  userId: string;
  /** الفرع المربوط بالسكرتارية الحالية ('main' افتراضياً) لاختيار إعدادات الفرع. */
  sessionBranchId?: string;
  doctorEntryResponse: DoctorEntryResponse;
  activeAuthCredentialsRef: MutableRefObject<SecretaryAuthCredentials>; // مرجع لبيانات الدخول النشطة
  isAuthenticatedRef: MutableRefObject<boolean>;
  lastEntryAlertCreatedRef: MutableRefObject<string | null>; // آخر وقت لتنبيه دخول تم عرضه
  entryAlertInitializedRef: MutableRefObject<boolean>;
  lastDoctorResponseRespondedAtRef: MutableRefObject<string | null>;
  doctorResponseInitializedRef: MutableRefObject<boolean>;
  // دوال تحديث الحالة في واجهة الصفحة الرئيسية
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setAuthChecking: Dispatch<SetStateAction<boolean>>;
  setAuthError: Dispatch<SetStateAction<string>>;
  setEntryAlert: Dispatch<SetStateAction<EntryAlert | null>>;
  setTodayAppointments: Dispatch<SetStateAction<TodayAppointment[]>>;
  setUpcomingAppointments: Dispatch<SetStateAction<TodayAppointment[]>>;
  setCompletedAppointments: Dispatch<SetStateAction<TodayAppointment[]>>;
  setPatientDirectory: Dispatch<SetStateAction<PatientSuggestionOption[]>>;
  setDoctorEntryResponse: Dispatch<SetStateAction<DoctorEntryResponse>>;
  setApprovedEntryAppointmentIds: Dispatch<SetStateAction<string[]>>;
  setSubscriptionFormTitle: Dispatch<SetStateAction<string>>;
  setSecretaryVitalsVisibility: Dispatch<SetStateAction<SecretaryVitalsVisibility>>;
  setSecretaryVitalFields: Dispatch<SetStateAction<SecretaryVitalFieldDefinition[]>>;
  setSecretaryApprovedEntryIds: Dispatch<SetStateAction<string[]>>;
  setPendingEntryAppointmentId: Dispatch<SetStateAction<string | null>>;
  setDoctorResponseToast: Dispatch<SetStateAction<'approved' | 'wait' | null>>;
};

/**
 * هوك (Hook) "المزامنة اللحظية" (usePublicBookingRealtimeSync)
 * يقوم بالاشتراك في تحديثات Firestore لضمان بقاء بيانات الصفحة محدثة دائماً
 * (المواعيد، طلبات الدخول، ردود الطبيب، حالة المصادقة)
 */
export const usePublicBookingRealtimeSync = ({
  secret,
  userId,
  sessionBranchId,
  doctorEntryResponse,
  activeAuthCredentialsRef,
  isAuthenticatedRef,
  lastEntryAlertCreatedRef,
  entryAlertInitializedRef,
  lastDoctorResponseRespondedAtRef,
  doctorResponseInitializedRef,
  setIsAuthenticated,
  setAuthChecking,
  setAuthError,
  setEntryAlert,
  setTodayAppointments,
  setUpcomingAppointments,
  setCompletedAppointments,
  setPatientDirectory,
  setDoctorEntryResponse,
  setApprovedEntryAppointmentIds,
  setSubscriptionFormTitle,
  setSecretaryVitalsVisibility,
  setSecretaryVitalFields,
  setSecretaryApprovedEntryIds,
  setPendingEntryAppointmentId,
  setDoctorResponseToast,
}: UsePublicBookingRealtimeSyncParams) => {

  // التأثير الأول: الاشتراك في إعدادات وبيانات العيادة (الاشتراك الرئيسي)
  useEffect(() => {
    if (!secret) return;

    // 🛡️ Safety timeout: لو الـ subscribe لم يستدع أي callback (لا نجاح ولا خطأ)
    // خلال 10 ثواني (ممكن يحصل في بعض الشبكات البطيئة أو الـ service workers المعلقة)،
    // نخرج من شاشة "جاري الانتظار" ونعرض رسالة خطأ للمستخدم بدل التعليق للأبد.
    let receivedFirstCallback = false;
    const safetyTimer = setTimeout(() => {
      if (!receivedFirstCallback) {
        console.warn('[usePublicBookingRealtimeSync] No callback received within 10s — showing error.');
        setAuthError('تعذر الاتصال بالسيرفر. تحقق من الإنترنت وحاول إعادة فتح الصفحة.');
        setAuthChecking(false);
      }
    }, 10000);

    const unsub = firestoreService.subscribeToBookingConfig(secret, (data) => {
      receivedFirstCallback = true;
      clearTimeout(safetyTimer);
      // ⚠️ معالجة خطأ الاشتراك (permission-denied / unauthenticated / offline)
      // لو الـ Firestore رفض القراءة (عادةً بسبب انتهاء Firebase custom token بعد
      // ساعة من الـ login)، نُخرج الـ UI من "جاري الانتظار" ونعرض رسالة login.
      if ((data as { __error?: string }).__error) {
        const errorType = (data as { __error?: string }).__error;
        if (errorType === 'permission-denied' || errorType === 'unauthenticated') {
          setAuthError('انتهت جلسة السكرتارية. يرجى تسجيل الدخول مرة أخرى.');
          setIsAuthenticated(false);
        } else if (errorType === 'unavailable') {
          setAuthError('تعذر الاتصال بالسيرفر. تحقق من الإنترنت ثم حاول مرة أخرى.');
        } else {
          setAuthError('حدث خطأ في تحميل البيانات. حاول إعادة فتح الصفحة.');
        }
        setAuthChecking(false);
        return;
      }

      const resolvedUserIdForAuth = (typeof data.userId === 'string' && data.userId.trim()) || userId;
      const secretKey = secretaryAuthSecretKey(secret);
      const userKey = resolvedUserIdForAuth ? secretaryAuthUserKey(resolvedUserIdForAuth) : '';
      const storedBySecret = localStorage.getItem(secretKey) || '';
      const storedByUser = userKey ? (localStorage.getItem(userKey) || '') : '';
      const storedSessionToken = storedBySecret || storedByUser;
      const requiresSecretaryAuth = Boolean(data.secretaryAuthRequired);

      const activeCredentials: SecretaryAuthCredentials = {
        sessionToken: storedSessionToken || undefined,
        doctorEmail: data.doctorEmail,
      };
      activeAuthCredentialsRef.current = activeCredentials;

      if (!requiresSecretaryAuth) {
        setIsAuthenticated(true);
        setAuthError('');
        localStorage.setItem(SECRETARY_LAST_SECRET_KEY, secret);
      } else if (storedSessionToken) {
        setIsAuthenticated(true);
        setAuthError('');
        localStorage.setItem(SECRETARY_LAST_SECRET_KEY, secret);
        localStorage.setItem(secretKey, storedSessionToken);
        if (userKey) localStorage.setItem(userKey, storedSessionToken);
      } else {
        if (isAuthenticatedRef.current) {
          setAuthError('انتهت جلسة السكرتارية. يرجى تسجيل الدخول مرة أخرى.');
        }
        setIsAuthenticated(false);
      }
      setAuthChecking(false);

      // اختيار مفتاح الفرع الحالي (عزل بيانات الفروع عن بعضها)
      const secretaryBranchKey = (sessionBranchId || 'main').trim() || 'main';

      // 2. مراقبة "تنبيهات طلب الدخول" (Entry Alerts)
      // تفضيل القراءة من الخريطة المعزولة بالفرع، ثم fallback للحقل القديم (مع فحص branchId إن وُجد)
      const branchEntryAlert = data.entryAlertByBranch?.[secretaryBranchKey];
      const legacyEntryAlert = data.entryAlert;
      const legacyMatchesBranch =
        legacyEntryAlert &&
        (!legacyEntryAlert.branchId || legacyEntryAlert.branchId === secretaryBranchKey);
      const entry = branchEntryAlert || (legacyMatchesBranch ? legacyEntryAlert : undefined);

      if (entry?.caseName && entry?.createdAt && entry?.appointmentId) {
        const handledMarker = readSecretaryHandledEntryAlert(secret);
        const sameAppointment = handledMarker?.appointmentId === entry.appointmentId;
        const handledAtMs = parseIsoTimeMs(handledMarker?.handledAt);
        const entryCreatedAtMs = parseIsoTimeMs(entry.createdAt);
        const markerCreatedAt = (handledMarker?.createdAt || '').trim();
        const handledMarkerAgeMs = handledAtMs === null ? Number.POSITIVE_INFINITY : (Date.now() - handledAtMs);

        // منع إعادة إظهار نفس الطلب بعد تنفيذ الإجراء:
        // 1) تطابق createdAt مباشرة.
        // 2) أو أن createdAt الوارد أقدم من/مساوٍ لوقت تنفيذ الإجراء (حالة شائعة مع stale/local snapshots).
        // 3) أو fallback قصير (دقيقتان) إذا تعذر تحليل الوقت.
        const sameRequestByTimestamp =
          sameAppointment &&
          handledAtMs !== null &&
          entryCreatedAtMs !== null &&
          entryCreatedAtMs <= handledAtMs + 1500;

        const sameRequestByCreatedAt =
          sameAppointment && !!markerCreatedAt && markerCreatedAt === entry.createdAt;

        const sameRequestByFallback =
          sameAppointment &&
          handledMarkerAgeMs < 2 * 60 * 1000 &&
          (handledAtMs === null || entryCreatedAtMs === null);

        const sameRequest = sameRequestByCreatedAt || sameRequestByTimestamp || sameRequestByFallback;

        // بالإضافة للـ "handled" marker، نتحقق من الـ "seen" marker:
        // لو الإشعار ظهر قبل كده في هذا الجهاز (حتى لو السكرتيرة ما ضغطت نعم/لا)،
        // ما نعرضوش تاني عند إعادة فتح الصفحة.
        const alreadySeen = wasNotificationSeen(
          'doctor_entry_alert',
          secret,
          entry.appointmentId,
          entry.createdAt
        );

        if (sameRequest || alreadySeen) {
          setEntryAlert(null);
          lastEntryAlertCreatedRef.current = entry.createdAt;
        } else {
          // تمرير branchId حتى يصل للـ actions handlers ويُستعمل في respond API
          setEntryAlert({
            caseName: entry.caseName,
            createdAt: entry.createdAt,
            appointmentId: entry.appointmentId,
            branchId: entry.branchId || secretaryBranchKey,
          });
          markNotificationSeen('doctor_entry_alert', secret, entry.appointmentId, entry.createdAt);
          if (!entryAlertInitializedRef.current) {
            entryAlertInitializedRef.current = true;
            lastEntryAlertCreatedRef.current = entry.createdAt;
          } else if (entry.createdAt !== lastEntryAlertCreatedRef.current) {
            lastEntryAlertCreatedRef.current = entry.createdAt;
            void playNotificationCue('entry_request');
          }
        }
      } else {
        setEntryAlert(null);
        lastEntryAlertCreatedRef.current = null;
        clearSecretaryHandledEntryAlert(secret);
      }

      // 3. تحديث قائمة مواعيد اليوم — تفضل نسخة الفرع فقط (عزل بين الفروع)
      const byBranch = (data as { todayAppointmentsByBranch?: Record<string, unknown> }).todayAppointmentsByBranch;
      if (byBranch && typeof byBranch === 'object' && Array.isArray(byBranch[secretaryBranchKey])) {
        setTodayAppointments(byBranch[secretaryBranchKey] as TodayAppointment[]);
      } else if (Array.isArray(data.todayAppointments)) {
        // Fallback: فلترة القائمة القديمة بـ branchId داخل كل عنصر (للتوافق مع الكود القديم)
        const filtered = data.todayAppointments.filter((apt) => {
          const aptBranch = (apt as { branchId?: string }).branchId || 'main';
          return aptBranch === secretaryBranchKey;
        });
        setTodayAppointments(filtered);
      }

      // 3.5. تحديث المواعيد القادمة — نفس المنطق مع todayAppointmentsByBranch
      const upByBranch = (data as { upcomingAppointmentsByBranch?: Record<string, unknown> }).upcomingAppointmentsByBranch;
      if (upByBranch && typeof upByBranch === 'object' && Array.isArray(upByBranch[secretaryBranchKey])) {
        setUpcomingAppointments(upByBranch[secretaryBranchKey] as TodayAppointment[]);
      } else {
        setUpcomingAppointments([]);
      }

      // 3.6. المواعيد المنفذة
      const compByBranch = (data as { completedAppointmentsByBranch?: Record<string, unknown> }).completedAppointmentsByBranch;
      const hasField = compByBranch && typeof compByBranch === 'object';
      const branchArr = hasField ? compByBranch[secretaryBranchKey] : undefined;
      if (hasField && Array.isArray(branchArr)) {
        setCompletedAppointments(branchArr as TodayAppointment[]);
      } else {
        setCompletedAppointments([]);
      }

      // دليل المرضى — تفضيل نسخة الفرع أولاً ثم الدليل الموحد (fallback)
      const branchDirectory = data.patientDirectoryByBranch?.[secretaryBranchKey];
      const effectiveDirectory =
        Array.isArray(branchDirectory) && branchDirectory.length > 0
          ? branchDirectory
          : data.patientDirectory;
      if (Array.isArray(effectiveDirectory) && effectiveDirectory.length > 0) {
        setPatientDirectory((current) => mergePatientDirectoryLists(current, effectiveDirectory));
      }

      // 4. مراقبة "رد فعل الطبيب" اللحظي على طلبات الدخول — من خريطة الفرع أولاً
      //    ⚠️ لو الرد مصدره السكرتيرة نفسها (source='secretary') → نتجاهله
      //    لأن السكرتيرة هي اللي كتبته ومش محتاجة إشعار عن ردها!
      //    بدون هذا الفحص: السكرتيرة ترد "نعم" → doctorEntryResponse يتحدث →
      //    الـ subscriber يكتشف → toast "تمت الموافقة" يظهر ← مكرر ومربك.
      const branchDocResp = data.doctorEntryResponseByBranch?.[secretaryBranchKey];
      const legacyDocResp = data.doctorEntryResponse;
      const rawDocResp = branchDocResp || legacyDocResp || null;
      const docRespSource = (rawDocResp as { source?: string } | null)?.source;
      // فقط لو المصدر هو الطبيب (أو غير محدد = legacy) نُظهر الرد
      const effectiveDocResp =
        rawDocResp && docRespSource === 'secretary' ? null : rawDocResp;
      setDoctorEntryResponse(effectiveDocResp);

      // 5. تحديث أسماء الحالات التي دخلت بالفعل — من خريطة الفرع أولاً
      const branchApproved = data.approvedEntryAppointmentIdsByBranch?.[secretaryBranchKey];
      if (Array.isArray(branchApproved)) {
        setApprovedEntryAppointmentIds(branchApproved);
      } else if (Array.isArray(data.approvedEntryAppointmentIds)) {
        setApprovedEntryAppointmentIds(data.approvedEntryAppointmentIds);
      } else {
        setApprovedEntryAppointmentIds([]);
      }

      // 6. تحديث عنوان الفورم إذا تغير
      if (data.formTitle !== undefined) {
        setSubscriptionFormTitle(data.formTitle || '');
      }

      // اختيار الإعدادات per-branch: المفضّل حقل map للفرع الحالي، ثم fallback للحقل العام.
      const branchKey = !sessionBranchId || sessionBranchId === 'main' ? 'main' : sessionBranchId;
      const branchFields = data.secretaryVitalFieldsByBranch?.[branchKey];
      const branchVisibility = data.secretaryVitalsVisibilityByBranch?.[branchKey];
      const effectiveFields =
        Array.isArray(branchFields) && branchFields.length > 0
          ? branchFields
          : data.secretaryVitalFields;
      const effectiveVisibility = branchVisibility || data.secretaryVitalsVisibility;
      const hasSecretaryFields = Array.isArray(effectiveFields) && effectiveFields.length > 0;

      if (hasSecretaryFields) {
        const nextFields = effectiveFields as SecretaryVitalFieldDefinition[];
        setSecretaryVitalFields(nextFields);
        setSecretaryVitalsVisibility((current) =>
          buildSecretaryVisibilityByFieldDefinitions(
            nextFields,
            effectiveVisibility || current
          )
        );
      } else if (effectiveVisibility) {
        setSecretaryVitalsVisibility(effectiveVisibility);
      }
    });

    // إلغاء الاشتراك + الـ safety timer عند إغلاق الصفحة
    return () => {
      clearTimeout(safetyTimer);
      unsub();
    };
  }, [
    secret,
    userId,
    sessionBranchId,
    activeAuthCredentialsRef,
    isAuthenticatedRef,
    lastEntryAlertCreatedRef,
    entryAlertInitializedRef,
    setIsAuthenticated,
    setAuthChecking,
    setAuthError,
    setEntryAlert,
    setTodayAppointments,
    setUpcomingAppointments,
    setPatientDirectory,
    setDoctorEntryResponse,
    setApprovedEntryAppointmentIds,
    setSubscriptionFormTitle,
    setSecretaryVitalsVisibility,
    setSecretaryVitalFields,
  ]);

  // التأثير الثاني: الاشتراك في الحالات التي وافقت عليها السكرتارية — مقسم بالفرع
  useEffect(() => {
    if (!secret) return;
    const unsub = firestoreService.subscribeToSecretaryApprovedEntryIds(
      secret,
      setSecretaryApprovedEntryIds,
      sessionBranchId
    );
    return () => unsub();
  }, [secret, sessionBranchId, setSecretaryApprovedEntryIds]);

  useEffect(() => {
    if (!secret) return;
    const storageKey = buildSecretaryDoctorResponseToastKey(secret);
    const restored = readTimedPayload(storageKey, isDoctorResponseToastValue);
    if (!restored) return;
    setDoctorResponseToast(restored.value);
    const remainingMs = Math.max(0, restored.expiresAt - Date.now());
    const timer = setTimeout(() => {
      setDoctorResponseToast(null);
      clearTimedPayload(storageKey);
    }, remainingMs);
    return () => clearTimeout(timer);
  }, [secret, setDoctorResponseToast]);

  // التأثير الثالث: التعامل مع رد فعل الطبيب وعرضه كتنبيه منبثق (Toast)
  useEffect(() => {
    if (!doctorEntryResponse?.respondedAt) return;
    // عدم تفعيل التنبيه إذا كان المستخدم قد نفذ إجراءً للتو من رابط إشعار خارجي
    const isPushActionRunning = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dh_action');
    if (isPushActionRunning) return;

    if (!doctorResponseInitializedRef.current) {
      doctorResponseInitializedRef.current = true;
      lastDoctorResponseRespondedAtRef.current = doctorEntryResponse.respondedAt;
      return;
    }

    if (lastDoctorResponseRespondedAtRef.current === doctorEntryResponse.respondedAt) return;
    lastDoctorResponseRespondedAtRef.current = doctorEntryResponse.respondedAt;

    setPendingEntryAppointmentId(null);
    const storageKey = buildSecretaryDoctorResponseToastKey(secret);

    // إظهار تنبيه "تم الموافقة" أو "انتظر" بناءً على اختيار الطبيب
    if (doctorEntryResponse.status === 'approved') {
      setDoctorResponseToast('approved');
      persistTimedPayload(storageKey, 'approved', SECRETARY_TOAST_AUTO_HIDE_MS);
      void playNotificationCue('entry_response_approved');
      const t = setTimeout(() => {
        setDoctorResponseToast(null);
        clearTimedPayload(storageKey);
      }, SECRETARY_TOAST_AUTO_HIDE_MS);
      return () => clearTimeout(t);
    }

    setDoctorResponseToast('wait');
    persistTimedPayload(storageKey, 'wait', SECRETARY_TOAST_AUTO_HIDE_MS);
    void playNotificationCue('entry_response_wait');
    const t = setTimeout(() => {
      setDoctorResponseToast(null);
      clearTimedPayload(storageKey);
    }, SECRETARY_TOAST_AUTO_HIDE_MS);
    return () => clearTimeout(t);
  }, [
    secret,
    doctorEntryResponse,
    doctorResponseInitializedRef,
    lastDoctorResponseRespondedAtRef,
    setPendingEntryAppointmentId,
    setDoctorResponseToast,
  ]);
};
