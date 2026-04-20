/**
 * الملف: usePublicBookingPageLogicCore.ts (Hook)
 * الوصف: "العمود الفقري" لمنطق واجهة السكرتارية. 
 * بما أن واجهة السكرتارية معقدة جداً، تم تقسيم منطقها إلى أكثر من 10 Hooks فرعية. 
 * يقوم هذا الـ Hook بـ: 
 * - جمع وتنسيق كافة الـ Hooks الفرعية (المصادقة، المزامنة، الأمان، الإشعارات). 
 * - استخلاص الحالة الموحدة (Unified State) وتمريرها للمكونات المرئية. 
 * - إدارة التنقل (Navigation) والربط بين المعاملات في الرابط (Slug/Secret).
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// استيراد الـ Hooks الفرعية التي تقسم المنطق البرمجي المعقد إلى أجزاء صغيرة سهلة الإدارة
import { usePublicBookingPublicSection } from './usePublicBookingPublicSection'; // منطق فتح فتحات الحجز للجمهور
import { usePublicBookingConsultationData } from './usePublicBookingConsultationData'; // منطق التعامل مع بيانات الاستشارات
import { usePublicBookingAuthProfile } from './usePublicBookingAuthProfile'; // منطق المصادقة والملف الشخصي للسكرتارية
import { usePublicBookingPushNotifications } from './usePublicBookingPushNotifications'; // منطق الإشعارات اللحظية
import { usePublicBookingRealtimeSync } from './usePublicBookingRealtimeSync'; // منطق المزامنة اللحظية مع Firestore
import { usePublicBookingAppointmentActions } from './usePublicBookingAppointmentActions'; // منطق إجراءات المواعيد (حفظ، حذف، تعديل)
import { usePublicBookingConfigLoader } from './usePublicBookingConfigLoader'; // منطق تحميل إعدادات العيادة
import { usePublicBookingLinkResolution } from './usePublicBookingLinkResolution'; // منطق فك رموز الروابط السرية
import { usePublicBookingTimeAndFormEffects } from './usePublicBookingTimeAndFormEffects'; // منطق التوقيت وتغييرات النموذج
import { usePublicBookingPatientSelectionHandlers } from './usePublicBookingPatientSelectionHandlers'; // منطق اختيار المرضى
import { usePublicBookingEntryAlertActions } from './usePublicBookingEntryAlertActions'; // منطق تنبيهات دخول المريض للطبيب
import { usePublicBookingPageState } from './usePublicBookingPageState'; // إدارة الحالة (State) الموحدة للصفحة
import { useSecretaryDataLoading } from './useSecretaryDataLoading'; // تحميل مواعيد + كشوفات حديثة عبر Cloud Functions
import { useSecretaryVitalsNormalizer } from './useSecretaryVitalsNormalizer'; // تطبيع إعدادات العلامات الحيوية للفرع
import { useBranches } from '../../../hooks/useBranches'; // قائمة الفروع للطبيب
import { insuranceService } from '../../../services/insuranceService'; // خدمة شركات التأمين
import { discountReasonService } from '../../../services/discountReasonService';



/**
 * الـ Hook الرئيسي (Logic Core) الذي يجمع كل الأجزاء المنطقية لواجهة السكرتارية.
 * يتم استدعاؤه في PublicBookingPage.tsx ويرجع له كافة البيانات والأدوات اللازمة لتشغيل الواجهة.
 */
export const usePublicBookingPageLogic = () => {
  // استخراج المعاملات من رابط الصفحة (slug للطبيب و secret للسكرتارية)
  const { slug: slugParam = '', secret: secretParam = '' } = useParams<{ slug: string; secret: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // فك شفرة الرابط للتأكد من هوية العيادة
  const linkResolution = usePublicBookingLinkResolution({
    slugParam,
    secretParam,
  });


  const state = usePublicBookingPageState();
  const userId = state.config?.userId ?? linkResolution.userIdParam;

  const auth = usePublicBookingAuthProfile({
    secret: linkResolution.secret,
    userId,
    navigate,
  });

  // تفعيل نظام الإشعارات اللحظية للسكرتارية (Web Push Notifications).
  // `sessionBranchId` يُمرَّر لعزل الإشعارات بين الفروع — السكرتيرة تستقبل إشعارات فرعها فقط.
  const push = usePublicBookingPushNotifications({
    secret: linkResolution.secret,
    sessionBranchId: auth.sessionBranchId || 'main',
    isAuthenticated: auth.isAuthenticated,
    locationPathname: location.pathname,
    locationSearch: location.search,
    navigate,
    setEntryResponding: state.setEntryResponding,
    setSecretaryActionToast: state.setSecretaryActionToast,
    setEntryAlert: state.setEntryAlert,
    setFormError: state.setFormError,
  });


  const consultationData = usePublicBookingConsultationData({
    recentExamPatients: state.recentExamPatients,
    consultationCandidatesVisibleCount: state.consultationCandidatesVisibleCount,
  });

  const branchesHook = useBranches(userId || null);

  // للسكرتارية: استخدم الفرع المرتبط بـ session بدل الفرع النشط المحلي.
  // `sessionBranchId` = 'main' افتراضياً (قبل الـ login أو للـ legacy).
  const sessionBranchId = auth.sessionBranchId || 'main';

  const publicSection = usePublicBookingPublicSection({
    userId,
    currentDayStr: state.currentDayStr,
    branches: branchesHook.branches,
    activeBranchId: sessionBranchId,
  });

  usePublicBookingTimeAndFormEffects({
    currentDayStr: state.currentDayStr,
    setCurrentDayStr: state.setCurrentDayStr,
    previousDayStrRef: state.previousDayStrRef,
    dateStr: state.dateStr,
    setDateStr: state.setDateStr,
    setTimeStr: state.setTimeStr,
    publicSlotDateStr: publicSection.publicSlotDateStr,
    setPublicSlotDateStr: publicSection.setPublicSlotDateStr,
    setPublicSlotTimeStr: publicSection.setPublicSlotTimeStr,
    bookingFormOpen: state.bookingFormOpen,
    setFormError: state.setFormError,
    setBookingFormLoading: state.setBookingFormLoading,
    bookingFormLoadingTimerRef: state.bookingFormLoadingTimerRef,
  });

  const selectionHandlers = usePublicBookingPatientSelectionHandlers({
    appointmentType: state.appointmentType,
    setAppointmentType: state.setAppointmentType,
    setSelectedConsultationCandidateId: state.setSelectedConsultationCandidateId,
    setConsultationCandidatesVisibleCount: state.setConsultationCandidatesVisibleCount,
    setPatientName: state.setPatientName,
    setAge: state.setAge,
    setPhone: state.setPhone,
    findMatchedConsultationCandidateId: consultationData.findMatchedConsultationCandidateId,
  });

  // ── تحميل كشوفات المرضى + المواعيد (اليوم / القادمة / المنفذة) عبر Cloud Functions ──
  // hook مستخرج — يدير polling ومعالجة انتهاء الجلسة تلقائياً.
  // نستدعي refreshAppointments يدوياً بعد CRUD لضمان التحديث الفوري بدون الاعتماد
  // على وجود الطبيب online.
  const { refreshAppointmentsRef } = useSecretaryDataLoading({
    isAuthenticated: auth.isAuthenticated,
    secret: linkResolution.secret,
    userId,
    sessionBranchId: auth.sessionBranchId,
    getCurrentSessionToken: auth.getCurrentSessionToken,
    invalidateSecretarySession: auth.invalidateSecretarySession,
    setRecentExamPatients: state.setRecentExamPatients,
    setPatientDirectory: state.setPatientDirectory,
    setTodayAppointments: state.setTodayAppointments,
    setUpcomingAppointments: state.setUpcomingAppointments,
    setCompletedAppointments: state.setCompletedAppointments,
  });

  useEffect(() => {
    if (linkResolution.resolvingSecret) return;
    if (!linkResolution.secret) {
      auth.setAuthChecking(false);
    }
  }, [linkResolution.resolvingSecret, linkResolution.secret, auth.setAuthChecking]);

  // جلب شركات التأمين في حال كان السكرتير مسجل الدخول
  useEffect(() => {
    if (!auth.isAuthenticated) {
      state.setInsuranceCompanies([]);
      return;
    }
    if (!linkResolution.secret && !userId) {
      state.setInsuranceCompanies([]);
      return;
    }

    const unsubscribe = linkResolution.secret
      ? insuranceService.subscribeToCompaniesBySecret(linkResolution.secret, (companies) => {
          state.setInsuranceCompanies(companies);
        })
      : insuranceService.subscribeToCompanies(userId, (companies) => {
          state.setInsuranceCompanies(companies);
        });

    return () => unsubscribe();
  }, [linkResolution.secret, userId, auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      state.setDiscountReasons([]);
      return;
    }
    if (!linkResolution.secret && !userId) {
      state.setDiscountReasons([]);
      return;
    }

    const unsubscribe = linkResolution.secret
      ? discountReasonService.subscribeToReasonsBySecret(linkResolution.secret, (reasons) => {
          state.setDiscountReasons(reasons);
        })
      : discountReasonService.subscribeToReasons(userId, (reasons) => {
          state.setDiscountReasons(reasons);
        });

    return () => unsubscribe();
  }, [linkResolution.secret, userId, auth.isAuthenticated]);


  // المزامنة اللحظية (Real-time Sync) مع قاعدة البيانات Firestore
  // تضمن هذه الوظيفة أن السكرتارية ترى المواعيد وتنبيهات الطبيب فور حدوثها دون الحاجة لتحديث الصفحة
  usePublicBookingRealtimeSync({
    secret: linkResolution.secret,
    userId,
    sessionBranchId,
    doctorEntryResponse: state.doctorEntryResponse,
    activeAuthCredentialsRef: auth.activeAuthCredentialsRef,
    isAuthenticatedRef: auth.isAuthenticatedRef,
    lastEntryAlertCreatedRef: state.lastEntryAlertCreatedRef,
    entryAlertInitializedRef: state.entryAlertInitializedRef,
    setIsAuthenticated: auth.setIsAuthenticated,
    setAuthChecking: auth.setAuthChecking,
    setAuthError: auth.setAuthError,
    setEntryAlert: state.setEntryAlert,
    setTodayAppointments: state.setTodayAppointments,
    setUpcomingAppointments: state.setUpcomingAppointments,
    setCompletedAppointments: state.setCompletedAppointments,
    setPatientDirectory: state.setPatientDirectory,
    setDoctorEntryResponse: state.setDoctorEntryResponse,
    setApprovedEntryAppointmentIds: state.setApprovedEntryAppointmentIds,
    setSubscriptionFormTitle: state.setSubscriptionFormTitle,
    setSecretaryVitalsVisibility: state.setSecretaryVitalsVisibility,
    setSecretaryVitalFields: state.setSecretaryVitalFields,
    setSecretaryApprovedEntryIds: state.setSecretaryApprovedEntryIds,
    setPendingEntryAppointmentId: state.setPendingEntryAppointmentId,
  });


  const { retryLoadConfig } = usePublicBookingConfigLoader({
    secret: linkResolution.secret,
    resolvingSecret: linkResolution.resolvingSecret,
    setConfig: state.setConfig,
    setConfigLoading: state.setConfigLoading,
  });

  // تطبيع إعدادات العلامات الحيوية حسب الفرع — hook مستخرج
  useSecretaryVitalsNormalizer({
    sessionBranchId,
    config: state.config,
    setSecretaryVitalFields: state.setSecretaryVitalFields,
    setSecretaryVitalsVisibility: state.setSecretaryVitalsVisibility,
  });

  const appointmentActions = usePublicBookingAppointmentActions({
    secret: linkResolution.secret,
    userId,
    getSessionToken: auth.getCurrentSessionToken,
    sessionBranchId: auth.sessionBranchId,
    onSessionInvalid: auth.invalidateSecretarySession,
    success: state.success,
    patientName: state.patientName,
    age: state.age,
    phone: state.phone,
    dateStr: state.dateStr,
    timeStr: state.timeStr,
    visitReason: state.visitReason,
    secretaryVitals: state.secretaryVitals,
    secretaryVitalFields: state.secretaryVitalFields,
    secretaryVitalsVisibility: state.secretaryVitalsVisibility,
    appointmentType: state.appointmentType,
    selectedConsultationCandidateId: state.selectedConsultationCandidateId,
    editingAppointmentId: state.editingAppointmentId,
    todayAppointments: state.todayAppointments,
    recentExamPatients: state.recentExamPatients,
    paymentType: state.paymentType,
    insuranceCompanyId: state.insuranceCompanyId,
    insuranceCompanyName: state.insuranceCompanyName,
    insuranceMembershipId: state.insuranceMembershipId,
    insuranceApprovalCode: state.insuranceApprovalCode,
    patientSharePercent: state.patientSharePercent,
    discountAmount: state.discountAmount,
    discountPercent: state.discountPercent,
    discountReasonId: state.discountReasonId,
    discountReasonLabel: state.discountReasonLabel,
    setPaymentType: state.setPaymentType,
    setInsuranceCompanyId: state.setInsuranceCompanyId,
    setInsuranceCompanyName: state.setInsuranceCompanyName,
    setInsuranceMembershipId: state.setInsuranceMembershipId,
    setInsuranceApprovalCode: state.setInsuranceApprovalCode,
    setPatientSharePercent: state.setPatientSharePercent,
    setDiscountAmount: state.setDiscountAmount,
    setDiscountPercent: state.setDiscountPercent,
    setDiscountReasonId: state.setDiscountReasonId,
    setDiscountReasonLabel: state.setDiscountReasonLabel,
    setPendingEntryAppointmentId: state.setPendingEntryAppointmentId,
    setBookingQuotaNotice: state.setBookingQuotaNotice,
    setFormError: state.setFormError,
    setEditingAppointmentId: state.setEditingAppointmentId,
    setPatientName: state.setPatientName,
    setAge: state.setAge,
    setPhone: state.setPhone,
    setDateStr: state.setDateStr,
    setTimeStr: state.setTimeStr,
    setVisitReason: state.setVisitReason,
    setSecretaryVitals: state.setSecretaryVitals,
    setAppointmentType: state.setAppointmentType,
    setSelectedConsultationCandidateId: state.setSelectedConsultationCandidateId,
    setSuccess: state.setSuccess,
    setSubmitting: state.setSubmitting,
    setBookingFormOpen: state.setBookingFormOpen,
    setTodayAppointments: state.setTodayAppointments,
  });

  const fixedTitle = state.subscriptionFormTitle?.trim() || state.config?.formTitle?.trim() || 'حجز موعد — صفحة السكرتارية';
  const doctorDisplayName = state.config?.doctorDisplayName?.trim() || 'غير محدد';
  const secretaryDisplayName = auth.secretaryName.trim() || 'سكرتيرة';
  const secretaryAvatarText = useMemo(() => {
    const words = secretaryDisplayName.split(/\s+/).filter(Boolean);
    return words[0] || 'سكرتيرة';
  }, [secretaryDisplayName]);

  const entryAlertActions = usePublicBookingEntryAlertActions({
    secret: linkResolution.secret,
    entryAlert: state.entryAlert,
    entryResponding: state.entryResponding,
    setEntryResponding: state.setEntryResponding,
    setEntryAlert: state.setEntryAlert,
    setSecretaryActionToast: state.setSecretaryActionToast,
  });

  const loadMoreConsultationCandidates = () => {
    state.setConsultationCandidatesVisibleCount((prev) => prev + 10);
  };

  // نغلّف handleSubmit/removeTodayAppointment عشان بعد كل نجاح تحديث/إضافة/حذف
  // نطلب refresh للمواعيد من الـ Cloud Function (مصدر الحقيقة).
  // ده يضمن ظهور الموعد الجديد فوراً حتى لو الـ local sync فشل أو الطبيب مش online.
  const handleSubmitWithRefresh = useCallback(
    async (event: Parameters<typeof appointmentActions.handleSubmit>[0]) => {
      const result = await appointmentActions.handleSubmit(event);
      void refreshAppointmentsRef.current();
      return result;
    },
    [appointmentActions]
  );
  const removeTodayAppointmentWithRefresh = useCallback(
    async (id: string) => {
      const result = await appointmentActions.removeTodayAppointment(id);
      void refreshAppointmentsRef.current();
      return result;
    },
    [appointmentActions]
  );

  return {
    configLoading: state.configLoading,
    resolvingSecret: linkResolution.resolvingSecret,
    secret: linkResolution.secret,
    authChecking: auth.authChecking,
    isAuthenticated: auth.isAuthenticated,
    doctorEmailInput: auth.doctorEmailInput,
    setDoctorEmailInput: auth.setDoctorEmailInput,
    passwordInput: auth.passwordInput,
    setPasswordInput: auth.setPasswordInput,
    authError: auth.authError,
    handleLogin: auth.handleLogin,
    config: state.config,
    retryLoadConfig,
    canShowSecretaryPushPrompt: push.canShowSecretaryPushPrompt,
    pushEnableSuccessMessage: push.pushEnableSuccessMessage,
    handleEnableSecretaryPushNotifications: push.handleEnableSecretaryPushNotifications,
    handleSecretaryPushPromptLater: push.handleSecretaryPushPromptLater,
    secretaryActionToast: state.secretaryActionToast,
    setSecretaryActionToast: state.setSecretaryActionToast,
    entryAlert: state.entryAlert,
    entryResponding: state.entryResponding,
    setEntryAlert: state.setEntryAlert,
    handleApproveEntryAlert: entryAlertActions.handleApproveEntryAlert,
    handleRejectEntryAlert: entryAlertActions.handleRejectEntryAlert,
    profileMenuRef: auth.profileMenuRef,
    profileMenuOpen: auth.profileMenuOpen,
    setProfileMenuOpen: auth.setProfileMenuOpen,
    secretaryAvatarText,
    secretaryNameInput: auth.secretaryNameInput,
    setSecretaryNameInput: auth.setSecretaryNameInput,
    setProfileSaveMessage: auth.setProfileSaveMessage,
    profileSaving: auth.profileSaving,
    handleSaveSecretaryName: auth.handleSaveSecretaryName,
    doctorDisplayName,
    profileSaveMessage: auth.profileSaveMessage,
    handleSecretaryLogout: auth.handleSecretaryLogout,
    fixedTitle,
    success: state.success,
    sortedTodayAppointments: state.sortedTodayAppointments,
    upcomingAppointments: state.upcomingAppointments,
    completedAppointments: state.completedAppointments,
    todayDateMeta: state.todayDateMeta,
    todaySectionOpen: state.todaySectionOpen,
    setTodaySectionOpen: state.setTodaySectionOpen,
    approvedEntryAppointmentIds: state.approvedEntryAppointmentIds,
    secretaryApprovedEntryIds: state.secretaryApprovedEntryIds,
    pendingEntryAppointmentId: state.pendingEntryAppointmentId,
    entryRequestSendingId: appointmentActions.entryRequestSendingId,
    requestEntryNow: appointmentActions.requestEntryNow,
    handleEditAppointment: appointmentActions.handleEditAppointment,
    removeTodayAppointment: removeTodayAppointmentWithRefresh,
    bookingFormOpen: state.bookingFormOpen,
    setBookingFormOpen: state.setBookingFormOpen,
    editingAppointmentId: state.editingAppointmentId,
    handleCancelEdit: appointmentActions.handleCancelEdit,
    bookingFormLoading: state.bookingFormLoading,
    patientName: state.patientName,
    setPatientName: state.setPatientName,
    age: state.age,
    setAge: state.setAge,
    phone: state.phone,
    setPhone: state.setPhone,
    dateStr: state.dateStr,
    setDateStr: state.setDateStr,
    timeStr: state.timeStr,
    setTimeStr: state.setTimeStr,
    visitReason: state.visitReason,
    setVisitReason: state.setVisitReason,
    secretaryVitals: state.secretaryVitals,
    setSecretaryVitals: state.setSecretaryVitals,
    secretaryVitalFields: state.secretaryVitalFields,
    secretaryVitalsVisibility: state.secretaryVitalsVisibility,
    todayStr: state.todayStr,
    submitting: state.submitting,
    formError: state.formError,
    bookingQuotaNotice: state.bookingQuotaNotice,
    appointmentType: state.appointmentType,
    handleAppointmentTypeChange: selectionHandlers.handleAppointmentTypeChange,
    visibleConsultationCandidates: consultationData.visibleConsultationCandidates,
    canLoadMoreConsultationCandidates: consultationData.canLoadMoreConsultationCandidates,
    loadMoreConsultationCandidates,
    selectedConsultationCandidateId: state.selectedConsultationCandidateId,
    handleSelectConsultationCandidate: selectionHandlers.handleSelectConsultationCandidate,
    patientDirectory: state.patientDirectory,
    handleSelectPatientSuggestion: selectionHandlers.handleSelectPatientSuggestion,
    handleSubmit: handleSubmitWithRefresh,
    publicSectionOpen: publicSection.publicSectionOpen,
    setPublicSectionOpen: publicSection.setPublicSectionOpen,
    publicBookingLink: publicSection.publicBookingLink,
    publicLinkCopied: publicSection.publicLinkCopied,
    copyPublicBookingLink: publicSection.copyPublicBookingLink,
    publicSlotDateStr: publicSection.publicSlotDateStr,
    publicSlotTodayStr: publicSection.publicSlotTodayStr,
    setPublicSlotDateStr: publicSection.setPublicSlotDateStr,
    publicSlotTimeStr: publicSection.publicSlotTimeStr,
    publicTimeMin: publicSection.publicTimeMin,
    setPublicSlotTimeStr: publicSection.setPublicSlotTimeStr,
    branches: branchesHook.branches,
    currentBranchId: publicSection.currentBranchId,
    branchAddresses: publicSection.branchAddresses,
    branchAddressesSaving: publicSection.branchAddressesSaving,
    saveBranchAddress: publicSection.saveBranchAddress,
    addPublicSlot: publicSection.addPublicSlot,
    publicSecret: publicSection.publicSecret,
    publicSlotAdding: publicSection.publicSlotAdding,
    publicSlotError: publicSection.publicSlotError,
    publicSlotsLoading: publicSection.publicSlotsLoading,
    publicSlots: publicSection.publicSlots,
    removePublicSlot: publicSection.removePublicSlot,
    formatSlotLabel: publicSection.formatSlotLabel,
    // تأمين
    paymentType: state.paymentType,
    setPaymentType: state.setPaymentType,
    insuranceCompanyId: state.insuranceCompanyId,
    setInsuranceCompanyId: state.setInsuranceCompanyId,
    insuranceCompanyName: state.insuranceCompanyName,
    setInsuranceCompanyName: state.setInsuranceCompanyName,
    insuranceMembershipId: state.insuranceMembershipId,
    setInsuranceMembershipId: state.setInsuranceMembershipId,
    insuranceApprovalCode: state.insuranceApprovalCode,
    setInsuranceApprovalCode: state.setInsuranceApprovalCode,
    patientSharePercent: state.patientSharePercent,
    setPatientSharePercent: state.setPatientSharePercent,
    discountAmount: state.discountAmount,
    setDiscountAmount: state.setDiscountAmount,
    discountPercent: state.discountPercent,
    setDiscountPercent: state.setDiscountPercent,
    discountReasonId: state.discountReasonId,
    setDiscountReasonId: state.setDiscountReasonId,
    discountReasonLabel: state.discountReasonLabel,
    setDiscountReasonLabel: state.setDiscountReasonLabel,
    insuranceCompanies: state.insuranceCompanies,
    discountReasons: state.discountReasons,
    userId,
    // فرع جلسة السكرتيرة — يُمرَّر للنموذج لاختيار override نسبة التأمين للفرع الصحيح.
    sessionBranchId,
    // اسم الفرع الحالي — يُعرض في الملف الشخصي
    currentBranchName: branchesHook.branches.find((b) => b.id === sessionBranchId)?.name || '',
    hasMultipleBranches: branchesHook.branches.length > 1,
  };
};
