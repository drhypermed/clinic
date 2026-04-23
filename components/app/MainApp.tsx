// ─────────────────────────────────────────────────────────────────────────────
// MainApp — الواجهة الرئيسية للطبيب بعد تسجيل الدخول
// ─────────────────────────────────────────────────────────────────────────────
// المكون ده "orchestrator" — بيجمع بين الـ state من useDrHyper والـ hooks
// المساعدة ثم يوجّه العرض عبر MainAppViewRouter بين الأقسام المختلفة.
//
// الرحلة: 912 سطر (MainAppCore.tsx القديم) → 851 (MainApp) → 577 بعد التقسيم.
//
// المنطق المعقد في hooks/components منفصلة تحت `./main-app/` و `./`:
//
//   ── Hooks في ./main-app/ ──
//   • useAppointmentSyncOnSave     : مزامنة الموعد مع السجل بعد الحفظ
//   • useMedicalReportPrinter      : طباعة تقرير AI للمريض
//   • useSecretaryEntryResponse    : استجابة الطبيب لطلبات السكرتارية
//   • useMainAppSecretaryVitals    : تعريفات وقيم علامات السكرتارية
//   • useMainAppReadyPrescriptions : مودالات الروشتات الجاهزة
//   • useMainAppBookingSecret      : سر الحجز للفرع النشط
//   • useMainAppAppointmentOpener  : فتح الموعد في الروشتة (كشف/استشارة)
//   • useMainAppPrescriptionExport : طباعة/تنزيل/واتساب الروشتة
//   • useMainAppResetControls      : ريست الفورم + ماضي + push prompt
//
//   ── Components في ./ ──
//   • MainAppViewRouter            : موجّه JSX بين كل الشاشات
//   • MainAppOverlays              : المودالات والـ overlays
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDrHyper } from '../../hooks/useDrHyper/useDrHyper';
import { usePrescriptionSettings } from '../../hooks/usePrescriptionSettings';
import { useSystemRequestLineSettings } from '../../hooks/useSystemRequestLineSettings';
import { safeStorageGetItem } from '../../services/auth-service/storage';
import { Sidebar } from '../layout/Sidebar';

// ملاحظة: كل الـ lazy imports للشاشات الرئيسية اتنقلت لـ MainAppViewRouter.tsx
// عشان الـ bundle splitting يبقى في مكان واحد مع الـ JSX بتاعها.

import { LoadingStateScreen } from './LoadingStateScreen';
import { NotificationToast } from './NotificationToast';
import { NotificationPermissionPrompt } from '../common/NotificationPermissionPrompt';
import { AppUpdateBroadcastBanner } from '../common/AppUpdateBroadcastBanner';
import { InAppAudienceNotificationPopup } from '../common/InAppAudienceNotificationPopup';
import { MainAppViewRouter, preloadMainAppViewChunks } from './MainAppViewRouter';
import type { AppView } from './utils';
import { buildBasicPatientSuggestions, buildBreadcrumbs, VIEW_TAB_PARAM } from './utils';
import { useMainAppRouteSync } from './hooks/useMainAppRouteSync';
import { useMainAppProfile } from './hooks/useMainAppProfile';
import { useMainAppAppointments } from './hooks/useMainAppAppointments';
import { useBreadcrumbPageTitle } from './core/usePageTitle';
import { Breadcrumbs } from '../layout/Breadcrumbs';
import { MainAppOverlays } from './MainAppOverlays';
import type { ClinicAppointment } from '../../types';
import { PUSH_PROMPT_HIDE_UNTIL_KEY } from './main-app/constants';
import { useAppointmentSyncOnSave } from './main-app/useAppointmentSyncOnSave';
import { useMedicalReportPrinter } from './main-app/useMedicalReportPrinter';
import { useSecretaryEntryResponse } from './main-app/useSecretaryEntryResponse';
import { useMainAppSecretaryVitals } from './main-app/useMainAppSecretaryVitals';
import { useMainAppReadyPrescriptions } from './main-app/useMainAppReadyPrescriptions';
import { useMainAppBookingSecret } from './main-app/useMainAppBookingSecret';
import { useMainAppAppointmentOpener } from './main-app/useMainAppAppointmentOpener';
import { useMainAppPrescriptionExport } from './main-app/useMainAppPrescriptionExport';
import { useMainAppResetControls } from './main-app/useMainAppResetControls';
import { ConfirmModal } from '../modals/ConfirmModal';
import { WhatsAppDownloadGuideModal } from '../prescription/WhatsAppDownloadGuideModal';
import { useBranches } from '../../hooks/useBranches';
import { useHideBootSplash } from '../../hooks/useHideBootSplash';

export const MainApp: React.FC = () => {
  // إخفاء السبلاش الأوّلي فور ما MainApp تعمل mount — ده بيضمن إن المستخدم
  // يشوف سبلاش → لوحة التحكم مباشرة، بدون شاشة بيضاء وسطانية.
  useHideBootSplash('main-app-mounted');

  // preload لكل صفحات السايد بار في الخلفية بعد ما المتصفح يخلص أول رسم.
  // النتيجة: لما المستخدم يدوس على أي تبويب، الـ chunk هيكون جاهز ومش هيشوف
  // spinner ثقيل. الـ import() نفسه محفوظ في كاش Vite/المتصفح فمفيش download
  // زيادة لما المستخدم يفتح الصفحة.
  React.useEffect(() => {
    const browserWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (typeof browserWindow.requestIdleCallback === 'function') {
      idleId = browserWindow.requestIdleCallback(() => preloadMainAppViewChunks(), { timeout: 4000 });
    } else {
      timeoutId = setTimeout(() => preloadMainAppViewChunks(), 1500);
    }
    return () => {
      if (idleId !== null && browserWindow.cancelIdleCallback) browserWindow.cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentView, setCurrentView,
    notifications,
    showNotification,
    patientName, setPatientName, phone, setPhone, ageYears, setAgeYears, ageMonths, setAgeMonths, ageDays, setAgeDays,
    gender, setGender, pregnant, setPregnant, breastfeeding, setBreastfeeding,
    weight, setWeight, height, setHeight, bmi, vitals, setVitals, updateVital,
    complaint, setComplaint, medicalHistory, setMedicalHistory, examination, setExamination, investigations, setInvestigations,
    complaintEn, setComplaintEn, historyEn, setHistoryEn, examEn, setExamEn, investigationsEn, setInvestigationsEn, diagnosisEn, setDiagnosisEn,
    rxItems, generalAdvice, labInvestigations, usageStats,
    historyStack, futureStack, analyzing, setAnalyzing, errorMsg, smartQuotaNotice, smartQuotaModalOpen, selectedMed, setSelectedMed, isDataOnlyMode, setIsDataOnlyMode, prescriptionRef,
    records, totalAgeInMonths,
    readyPrescriptions,
    handleUndo, handleRedo, handleReset, handleSaveRecord, handleLoadRecord, handleLoadConsultation, handleOpenConsultation,
    handleNewExamFromRecord, handleDeleteRecord, handleDeleteConsultation, handleDeleteExam,
    handleSaveReadyPrescription, handleUpdateReadyPrescription, handleCreateReadyPrescription, handleDeleteReadyPrescription, handleApplyReadyPrescription,
    handleFullAutomatedRX, handleAddManualMedication, handleAddEmptyMedication, handleAddCustomItem, handleAddManualLab, handleAddManualAdvice,
    removeItem, updateItemName, updateItemInstruction, updateItemFontSize, handleSwapItem, selectMedicationForItem,
    updateAdvice, removeAdvice, updateLab, removeLab,
    dismissNotification,
    dismissSmartQuotaNotice,
    consultationDate, setConsultationDate,
    visitDate, setVisitDate,
    visitType, setVisitType,
    setActivePatientFileId,
    activePatientFileId,
    setActivePatientFileNumber,
    activePatientFileNumber,
    setActivePatientFileNameKey,
    activePatientFileNameKey,
    setIsPastConsultationMode,
    paymentType, setPaymentType,
    insuranceCompanyId, setInsuranceCompanyId,
    insuranceCompanyName, setInsuranceCompanyName,
    insuranceApprovalCode, setInsuranceApprovalCode,
    insuranceMembershipId, setInsuranceMembershipId,
    patientSharePercent, setPatientSharePercent,
    discountAmount, setDiscountAmount,
    discountPercent, setDiscountPercent,
    discountReasonId,
    discountReasonLabel,
    setDiscountReasonId,
    setDiscountReasonLabel,
    hasUnsavedChanges,
  } = useDrHyper();

  const isQuotaLimitError = typeof errorMsg === 'string' && errorMsg.includes('تم استهلاك الحد اليومي');

  const { user, signOut, updateUserProfile } = useAuth();
  const userId = user?.uid ?? '';

  const {
    branches,
    activeBranchId,
    loading: branchesLoading,
    setActiveBranchId,
    addBranch,
    updateBranch,
    deleteBranch,
  } = useBranches(userId || null);

  const { navigateToView, pendingView } = useMainAppRouteSync({
    currentView,
    setCurrentView,
    pathname: location.pathname,
    navigate,
    syncKey: user?.uid,
  });

  // Breadcrumbs: بناء مسار التنقل بناءً على الواجهة الحالية والتاب المفتوح
  const [searchParams] = useSearchParams();
  const tabParamKey = VIEW_TAB_PARAM[currentView];
  const activeTabValue = tabParamKey ? searchParams.get(tabParamKey) : null;
  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(currentView, activeTabValue),
    [currentView, activeTabValue],
  );

  // تحديث عنوان التاب في المتصفح ليعكس الموقع الحالي
  useBreadcrumbPageTitle(breadcrumbs);

  const basicPatientSuggestions = useMemo(() => buildBasicPatientSuggestions(records), [records]);

  const {
    appointments,
    newAppointmentToast,
    setNewAppointmentToast,
    bookingSecret,
    setBookingSecret,
    secretaryEntryRequest,
    setSecretaryEntryRequest,
    showPushPrompt,
    pushEnableSuccessMessage,
    handleEnablePushNotifications,
    todayAppointmentsCount,
    dashboardStats,
    todayStr,
  } = useMainAppAppointments({
    userId,
    userEmail: user?.email,
    records,
    pathname: location.pathname,
    search: location.search,
    navigate,
    activeBranchId,
    // عند فتح push notification لموعد في فرع مختلف، نبدل للفرع الصحيح تلقائياً
    // حتى يرى الطبيب الموعد في الواجهة بدلاً من رسالة "لا يوجد" (لأن المواعيد مفلترة بالفرع).
    onRequestBranchSwitch: setActiveBranchId,
    // قائمة فروع الطبيب — تستخدم لضمان كتابة `todayAppointmentsByBranch.{X} = []`
    // لكل فرع بدون مواعيد اليوم (تجنب استمرار مواعيد قديمة).
    branchIds: branches.map((b) => b.id),
  });

  // فلترة مواعيد اليوم للصفحة الرئيسية — نستخدم todayStr المُشترك من الـ hook حتى يتحدّث تلقائياً عند منتصف الليل
  const todayAppointmentsList = useMemo(() => {
    return appointments.filter((apt) => {
      const dt = new Date(apt.dateTime);
      const dayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return dayStr === todayStr;
    });
  }, [appointments, todayStr]);

  const {
    profileKey,
    profileImage,
    doctorName,
    doctorSpecialty,
    accountType,
    handleProfileImageUpdate,
    handleDoctorNameUpdate,
    handleDoctorSpecialtyUpdate,
  } = useMainAppProfile({
    user: user ?? null,
    userId,
    updateUserProfile,
  });
  const normalizedDoctorName = String(doctorName || '').trim();
  const normalizedDoctorSpecialty = String(doctorSpecialty || '').trim();

  const {
    settings: prescriptionSettings,
    saveSettings: savePrescriptionSettings,
    error: settingsError,
  } = usePrescriptionSettings(user?.uid || null, activeBranchId);
  const { settings: systemRequestLineSettings } = useSystemRequestLineSettings();

  // ── حالة الـ UI المحلية فقط (modals + flags) ──
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hidePushPromptUntil, setHidePushPromptUntil] = useState(0);
  const [whatsappGuideOpen, setWhatsappGuideOpen] = useState(false);
  const [openedAppointmentContext, setOpenedAppointmentContext] = useState<ClinicAppointment | null>(null);
  const mainContentRef = React.useRef<HTMLElement | null>(null);

  // ── Hook العلامات الحيوية للسكرتارية (تعريفات + قيم مخصصة للموعد) ──
  const {
    prescriptionSecretaryFieldDefinitions,
    appointmentSecretaryCustomValues,
    setAppointmentSecretaryCustomValues,
    updateAppointmentSecretaryCustomValue,
    mapAppointmentSecretaryCustomValues,
    handleSyncSecretaryVitalsVisibility,
  } = useMainAppSecretaryVitals({
    userId,
    activeBranchId,
    bookingSecret,
    setBookingSecret,
    prescriptionSettings,
    openedAppointmentContext,
  });

  // تحميل وقت إخفاء تنبيه الـ push من localStorage عند أول render
  useEffect(() => {
    const hideUntilRaw = safeStorageGetItem(PUSH_PROMPT_HIDE_UNTIL_KEY);
    const hideUntil = Number(hideUntilRaw || 0);
    if (Number.isFinite(hideUntil) && hideUntil > 0) {
      setHidePushPromptUntil(hideUntil);
    }
  }, []);

  // ── Hook إدارة سر الحجز للفرع النشط ──
  const { handleBookingSecretReady } = useMainAppBookingSecret({
    userId,
    activeBranchId,
    branches,
    setBookingSecret,
    updateBranch,
  });

  // Reset controls + past exam/consultation helpers + push prompt — hook مجمع
  const {
    showUnsavedResetModal,
    handleResetAndClearOpenedAppointment,
    handleConfirmUnsavedReset,
    handleCancelUnsavedReset,
    handleAddPastExam,
    handleAddPastConsultation,
    handlePushPromptLater,
    canShowPushPrompt,
  } = useMainAppResetControls({
    hasUnsavedChanges,
    handleReset,
    setOpenedAppointmentContext,
    setAppointmentSecretaryCustomValues,
    setVisitDate,
    setConsultationDate,
    setVisitType,
    setIsPastConsultationMode,
    navigateToView,
    showPushPrompt,
    hidePushPromptUntil,
    setHidePushPromptUntil,
  });

  // مزامنة بيانات الموعد مع السجل بعد الحفظ — hook مستخرج للتقليل من حجم الملف
  const { handleSaveRecordWithAppointmentSync } = useAppointmentSyncOnSave({
    userId,
    openedAppointmentContext,
    setOpenedAppointmentContext,
    patientName,
    phone,
    ageYears,
    ageMonths,
    ageDays,
    weight,
    height,
    vitals,
    activePatientFileId,
    activePatientFileNumber,
    activePatientFileNameKey,
    paymentType,
    insuranceCompanyId,
    insuranceCompanyName,
    insuranceApprovalCode,
    insuranceMembershipId,
    patientSharePercent,
    discountAmount,
    discountPercent,
    discountReasonId,
    discountReasonLabel,
    appointmentSecretaryCustomValues,
    prescriptionSecretaryFieldDefinitions,
    handleSaveRecord,
    showNotification,
  });

  // handleSyncSecretaryVitalsVisibility اتنقل لـ useMainAppSecretaryVitals

  useEffect(() => {
    if (!userId || !accountType) return;

    import('../../services/accountTypeControlsService').then(m => {
      m.getAccountTypeControls().catch(() => { });
    });

    console.log(`[MainApp] Account type synced in background: ${accountType}`);
  }, [accountType, userId]);

  // ── تصدير الروشتة (طباعة / تنزيل PDF / واتساب) — عبر hook مغلف ──
  const {
    isPrinting,
    isDownloading,
    isSharingViaWhatsApp,
    isExporting: isExportingPrescription,
    handlePrint: handleNativePrint,
    handleDownload: handleDownloadPrescriptionPdf,
    handleShareWhatsApp: handleSharePrescriptionViaWhatsApp,
  } = useMainAppPrescriptionExport({
    paperSize: prescriptionSettings?.paperSize,
    patientName,
    phone,
    userId,
    showNotification,
    setWhatsappGuideOpen,
  });

  // طباعة التقرير الطبي AI — hook مستخرج
  const { handleGeneratePatientMedicalReport } = useMedicalReportPrinter({
    userId,
    user: user ?? null,
    doctorName,
    systemRequestLineSettings,
  });

  // handleAddPastExam, handleAddPastConsultation اتنقلوا لـ useMainAppResetControls

  // ── Hook إدارة مودالات الروشتات الجاهزة (فتح، حفظ، قفل تلقائي عند Quota) ──
  const {
    showReadyPrescriptionsModal,
    setShowReadyPrescriptionsModal,
    showSaveReadyPrescriptionModal,
    setShowSaveReadyPrescriptionModal,
    readyPrescriptionName,
    setReadyPrescriptionName,
    isSavingReadyPrescription,
    isClosingReadyPrescriptionModal,
    openSaveReadyPrescriptionModal,
    handleConfirmSaveReadyPrescription,
  } = useMainAppReadyPrescriptions({
    diagnosisEn,
    complaintEn,
    patientName,
    handleSaveReadyPrescription,
    smartQuotaModalOpen,
  });

  const parsedWeight = Number.parseFloat(weight) || 0;

  // ── Hook فتح الموعد في الروشتة (كشف جديد / استشارة لكشف سابق) ──
  const { openExam, openConsultation: openConsultationForAppointment } = useMainAppAppointmentOpener({
    appointments, records,
    prescriptionSecretaryFieldDefinitions,
    mapAppointmentSecretaryCustomValues,
    setAppointmentSecretaryCustomValues,
    setOpenedAppointmentContext,
    handleResetAndClearOpenedAppointment,
    handleOpenConsultation,
    navigateToView,
    setPatientName, setPhone, setAgeYears, setAgeMonths, setAgeDays,
    setGender, setPregnant, setBreastfeeding,
    setVisitDate, setVisitType, setIsPastConsultationMode,
    setActivePatientFileId, setActivePatientFileNumber, setActivePatientFileNameKey,
    setPaymentType, setInsuranceCompanyId, setInsuranceCompanyName,
    setInsuranceApprovalCode, setInsuranceMembershipId, setPatientSharePercent,
    setDiscountAmount, setDiscountPercent, setDiscountReasonId, setDiscountReasonLabel,
    setWeight, setHeight, setVitals,
  });

  // استجابة الطبيب لطلبات دخول السكرتارية — hook مستخرج
  const { handleApproveSecretaryEntry, handleRejectSecretaryEntry } = useSecretaryEntryResponse({
    bookingSecret,
    secretaryEntryRequest,
    setSecretaryEntryRequest,
    showNotification,
  });

  // handlePushPromptLater + canShowPushPrompt اتنقلوا لـ useMainAppResetControls

  // توحيد الخلفيه: كل الصفحات تاخد الخلفيه البيضا الافتراضيه من body
  // زي سجلات المرضى وملفات المرضى. قبل كده التقارير الماليه والإعلان
  // وأدوات الأدويه وتصميم الروشته كانوا بياخدوا bg-slate-50 (رمادي فاتح)
  // ده اللي كان بيظهر كـ"خلفيه غير بيضا" للمستخدم.
  return (
    <div className={`min-h-screen ${currentView === 'prescription' ? 'clinic-page prescription-page' : ''}`} dir="rtl">
      <NotificationPermissionPrompt open={canShowPushPrompt} title="فعّل إشعارات العيادة" description="لتصلك إشعارات المواعيد وطلبات السكرتارية فوراً حتى أثناء التنقل داخل النظام." enableLabel="تفعيل الإشعارات" onEnable={handleEnablePushNotifications} onLater={handlePushPromptLater} />
      {pushEnableSuccessMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10030] w-[min(94vw,30rem)]" dir="rtl">
          <div className="rounded-2xl border border-emerald-200 bg-white shadow-[0_24px_50px_-28px_rgba(2,6,23,0.8)] px-4 py-3 text-center">
            <p className="text-emerald-700 font-black text-sm">{pushEnableSuccessMessage}</p>
          </div>
        </div>
      )}
      {/* حشو البنر فوق: لا حشو لكل الصفحات عشان الاسم يبقى في نفس المستوى
          في كل الصفحات بدون مساحه فاضيه فوق. */}
      <div className="px-0 pt-0">
        <AppUpdateBroadcastBanner audience="doctors" scopeId={userId} />
      </div>
      <InAppAudienceNotificationPopup audience="doctors" scopeIds={[userId]} />
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      <div className="flex min-h-screen overflow-hidden">
        <Sidebar key={`sidebar-${profileKey}`} currentView={currentView} setCurrentView={navigateToView} todayAppointmentsCount={todayAppointmentsCount} user={user} onShowProfile={() => setShowProfileModal(true)} onLogout={() => signOut()} doctorName={normalizedDoctorName || undefined} profileImage={profileImage || undefined} breadcrumbs={breadcrumbs} onNavigateView={navigateToView} />

        <main ref={mainContentRef} className={`flex-1 min-w-0 overflow-x-hidden ${currentView === 'prescription' ? 'prescription-main md:mr-60 p-0 pt-20 pb-6 sm:p-0 sm:pt-20 sm:pb-6 md:p-0 md:pt-4 md:pb-6' : currentView === 'home' || currentView === 'records' || currentView === 'patientFiles' || currentView === 'appointments' || currentView === 'secretary' || currentView === 'financialReports' || currentView === 'drugtools' || currentView === 'medicationEdit' || currentView === 'settings' || currentView === 'branchSettings' || currentView === 'advertisement' ? 'md:mr-60 p-0 pt-16 pb-24 sm:p-0 sm:pt-16 sm:pb-8 md:p-0 md:pt-4 md:pb-6' : 'md:mr-60 p-2 pb-24 pt-16 sm:p-4 sm:pb-8 md:p-6 md:pb-8 md:pt-6 space-y-4 sm:space-y-6'}`}>
          {/* Desktop Breadcrumbs */}
          <div className="hidden md:block sticky top-0 z-40">
            <Breadcrumbs segments={breadcrumbs} onNavigateView={navigateToView} variant="desktop" />
          </div>

          {/* Spinner أثناء الانتقال بين الصفحات - يظهر فوراً قبل الـ render الثقيل */}
          {pendingView !== null ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
          <React.Suspense fallback={<div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
            <MainAppViewRouter
              currentView={currentView}
              navigateToView={navigateToView}
              user={user}
              userId={userId}
              activeBranchId={activeBranchId}
              branches={branches}
              branchesLoading={branchesLoading}
              normalizedDoctorName={normalizedDoctorName}
              normalizedDoctorSpecialty={normalizedDoctorSpecialty}
              profileImage={profileImage}
              records={records}
              appointments={appointments}
              todayAppointmentsList={todayAppointmentsList}
              dashboardStats={dashboardStats}
              onStartNewExam={() => navigateToView('prescription')}
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
              patientName={patientName} setPatientName={setPatientName}
              phone={phone} setPhone={setPhone}
              ageYears={ageYears} setAgeYears={setAgeYears}
              ageMonths={ageMonths} setAgeMonths={setAgeMonths}
              ageDays={ageDays} setAgeDays={setAgeDays}
              gender={gender} setGender={setGender}
              pregnant={pregnant} setPregnant={setPregnant}
              breastfeeding={breastfeeding} setBreastfeeding={setBreastfeeding}
              setActivePatientFileId={setActivePatientFileId}
              setActivePatientFileNumber={setActivePatientFileNumber}
              setActivePatientFileNameKey={setActivePatientFileNameKey}
              basicPatientSuggestions={basicPatientSuggestions}
              visitDate={visitDate} setVisitDate={setVisitDate}
              visitType={visitType} setVisitType={setVisitType}
              handleResetAndClearOpenedAppointment={handleResetAndClearOpenedAppointment}
              complaint={complaint} setComplaint={setComplaint}
              medicalHistory={medicalHistory} setMedicalHistory={setMedicalHistory}
              examination={examination} setExamination={setExamination}
              investigations={investigations} setInvestigations={setInvestigations}
              handleFullAutomatedRX={handleFullAutomatedRX}
              smartQuotaNotice={smartQuotaNotice}
              isQuotaLimitError={isQuotaLimitError} errorMsg={errorMsg}
              weight={weight} setWeight={setWeight}
              height={height} setHeight={setHeight}
              bmi={bmi} vitals={vitals} updateVital={updateVital}
              prescriptionSettings={prescriptionSettings}
              appointmentSecretaryCustomValues={appointmentSecretaryCustomValues}
              updateAppointmentSecretaryCustomValue={updateAppointmentSecretaryCustomValue}
              totalAgeInMonths={totalAgeInMonths} parsedWeight={parsedWeight}
              handleAddManualMedication={handleAddManualMedication}
              handleAddEmptyMedication={handleAddEmptyMedication}
              handleAddCustomItem={handleAddCustomItem}
              handleAddManualLab={handleAddManualLab}
              handleAddManualAdvice={handleAddManualAdvice}
              setShowReadyPrescriptionsModal={setShowReadyPrescriptionsModal}
              consultationDate={consultationDate}
              rxItems={rxItems} generalAdvice={generalAdvice} labInvestigations={labInvestigations}
              complaintEn={complaintEn} setComplaintEn={setComplaintEn}
              historyEn={historyEn} setHistoryEn={setHistoryEn}
              examEn={examEn} setExamEn={setExamEn}
              investigationsEn={investigationsEn} setInvestigationsEn={setInvestigationsEn}
              diagnosisEn={diagnosisEn} setDiagnosisEn={setDiagnosisEn}
              removeItem={removeItem} updateItemName={updateItemName}
              updateItemInstruction={updateItemInstruction}
              updateItemFontSize={updateItemFontSize}
              handleSwapItem={handleSwapItem}
              selectMedicationForItem={selectMedicationForItem}
              setSelectedMed={setSelectedMed} selectedMed={selectedMed}
              updateAdvice={updateAdvice} removeAdvice={removeAdvice}
              updateLab={updateLab} removeLab={removeLab}
              isExportingPrescription={isExportingPrescription}
              isDataOnlyMode={isDataOnlyMode} setIsDataOnlyMode={setIsDataOnlyMode}
              prescriptionRef={prescriptionRef} usageStats={usageStats}
              handleNativePrint={handleNativePrint} isPrinting={isPrinting}
              handleDownloadPrescriptionPdf={handleDownloadPrescriptionPdf}
              isDownloading={isDownloading}
              handleSharePrescriptionViaWhatsApp={handleSharePrescriptionViaWhatsApp}
              isSharingViaWhatsApp={isSharingViaWhatsApp}
              handleSaveRecordWithAppointmentSync={handleSaveRecordWithAppointmentSync}
              openSaveReadyPrescriptionModal={openSaveReadyPrescriptionModal}
              handleUndo={handleUndo} handleRedo={handleRedo}
              historyStackLength={historyStack.length} futureStackLength={futureStack.length}
              paymentType={paymentType} setPaymentType={setPaymentType}
              insuranceCompanyId={insuranceCompanyId} setInsuranceCompanyId={setInsuranceCompanyId}
              insuranceCompanyName={insuranceCompanyName} setInsuranceCompanyName={setInsuranceCompanyName}
              insuranceApprovalCode={insuranceApprovalCode} setInsuranceApprovalCode={setInsuranceApprovalCode}
              insuranceMembershipId={insuranceMembershipId} setInsuranceMembershipId={setInsuranceMembershipId}
              patientSharePercent={patientSharePercent} setPatientSharePercent={setPatientSharePercent}
              discountAmount={discountAmount} setDiscountAmount={setDiscountAmount}
              discountPercent={discountPercent} setDiscountPercent={setDiscountPercent}
              discountReasonId={discountReasonId} setDiscountReasonId={setDiscountReasonId}
              discountReasonLabel={discountReasonLabel} setDiscountReasonLabel={setDiscountReasonLabel}
              bookingSecret={bookingSecret}
              handleBookingSecretReady={handleBookingSecretReady}
              handleSyncSecretaryVitalsVisibility={handleSyncSecretaryVitalsVisibility}
              openExam={openExam}
              openConsultationForAppointment={openConsultationForAppointment}
              showNotification={showNotification}
              setOpenedAppointmentContext={setOpenedAppointmentContext}
              handleLoadRecord={handleLoadRecord}
              handleOpenConsultation={handleOpenConsultation}
              handleLoadConsultation={handleLoadConsultation}
              handleNewExamFromRecord={handleNewExamFromRecord}
              handleGeneratePatientMedicalReport={handleGeneratePatientMedicalReport}
              handleDeleteRecord={handleDeleteRecord}
              handleDeleteConsultation={handleDeleteConsultation}
              handleDeleteExam={handleDeleteExam}
              handleAddPastExam={handleAddPastExam}
              handleAddPastConsultation={handleAddPastConsultation}
              setActiveBranchId={setActiveBranchId}
              addBranch={addBranch} updateBranch={updateBranch} deleteBranch={deleteBranch}
              savePrescriptionSettings={savePrescriptionSettings}
            />
          </React.Suspense>
          )}
        </main>
      </div>

      <WhatsAppDownloadGuideModal
        isOpen={whatsappGuideOpen}
        onClose={() => setWhatsappGuideOpen(false)}
      />

      <ConfirmModal
        isOpen={showUnsavedResetModal}
        title="بيانات غير محفوظة"
        message="لم يتم حفظ بيانات المريض الحالي في سجلات المرضى. هل تريد المتابعة لمريض جديد وفقدان البيانات الحالية؟"
        confirmText="نعم، متابعة"
        cancelText="إلغاء"
        isDanger
        onConfirm={handleConfirmUnsavedReset}
        onCancel={handleCancelUnsavedReset}
      />

      <MainAppOverlays
        user={user} showProfileModal={showProfileModal} setShowProfileModal={setShowProfileModal}
        doctorName={normalizedDoctorName} doctorSpecialty={normalizedDoctorSpecialty} profileImage={profileImage} onNameUpdate={handleDoctorNameUpdate} onSpecialtyUpdate={handleDoctorSpecialtyUpdate} onProfileImageUpdate={handleProfileImageUpdate}
        showReadyPrescriptionsModal={showReadyPrescriptionsModal} setShowReadyPrescriptionsModal={setShowReadyPrescriptionsModal} readyPrescriptions={readyPrescriptions}
        handleApplyReadyPrescription={handleApplyReadyPrescription} handleUpdateReadyPrescription={handleUpdateReadyPrescription} handleCreateReadyPrescription={handleCreateReadyPrescription} handleDeleteReadyPrescription={handleDeleteReadyPrescription}
        rxItems={rxItems} generalAdvice={generalAdvice} labInvestigations={labInvestigations}
        showSaveReadyPrescriptionModal={showSaveReadyPrescriptionModal} isClosingReadyPrescriptionModal={isClosingReadyPrescriptionModal} isSavingReadyPrescription={isSavingReadyPrescription} readyPrescriptionName={readyPrescriptionName} setReadyPrescriptionName={setReadyPrescriptionName} setShowSaveReadyPrescriptionModal={setShowSaveReadyPrescriptionModal} handleConfirmSaveReadyPrescription={handleConfirmSaveReadyPrescription}
        settingsError={settingsError} secretaryEntryRequest={secretaryEntryRequest} bookingSecret={bookingSecret} onApproveSecretaryEntry={handleApproveSecretaryEntry} onRejectSecretaryEntry={handleRejectSecretaryEntry}
        newAppointmentToast={newAppointmentToast} setNewAppointmentToast={setNewAppointmentToast} smartQuotaModalOpen={smartQuotaModalOpen} smartQuotaNotice={smartQuotaNotice} dismissSmartQuotaNotice={dismissSmartQuotaNotice}
      />
    </div>
  );
};
