/**
 * الملف: PublicBookingPage.tsx
 * الوصف: "لوحة تحكم السكرتارية" (Secretary Dashboard).
 * هذه الصفحة هي المركز الرئيسي لعمل السكرتير داخل العيادة، وتتولى المهام التالية:
 * 1. حماية الدخول بكلمة سر خاصة بالسكرتارية (Admin-level security).
 * 2. إدارة قائمة الانتظار الحالية (Today's Queue) وإرسال الملحوظات للطبيب.
 * 3. إضافة وتعديل مواعيد المرضى يدوياً (كشوفات واستشارات).
 * 4. فتح وإدارة "المواعيد الإلكترونية" المتاحة للجمهور للحجز أونلاين.
 * 5. استقبال إشعارات لحظية (Push Notifications) عند حدوث ردود فعل من الطبيب.
 *
 * التصميم يعتمد على سايد بار ثابت على الديسكتوب وقائمة هامبرغر على الموبايل
 * مع أربع واجهات فرعية: الملف الشخصي، مواعيد اليوم، حجز موعد جديد، فورم الجمهور.
 */
import React, { useState } from 'react';
import { NotificationPermissionPrompt } from '../../common/NotificationPermissionPrompt';
import { AppUpdateBroadcastBanner } from '../../common/AppUpdateBroadcastBanner';
import { InAppAudienceNotificationPopup } from '../../common/InAppAudienceNotificationPopup';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { currentTimeMin } from '../utils';
import { PublicBookingLoginScreen } from './PublicBookingLoginScreen';
import { PublicBookingConfigErrorScreen } from './PublicBookingConfigErrorScreen';
import { PublicBookingAlerts } from './PublicBookingAlerts';
import { PublicBookingTodaySection } from './PublicBookingTodaySection';
import { PublicBookingUpcomingSection } from './PublicBookingUpcomingSection';
import { PublicBookingCompletedSection } from './PublicBookingCompletedSection';
import { PublicBookingFormSection } from './PublicBookingFormSection';
import { PublicBookingPublicSlotsSection } from './PublicBookingPublicSlotsSection';
import { PublicBookingProfileView } from './PublicBookingProfileView';
import { PublicBookingSidebar } from './PublicBookingSidebar';
import type { SecretaryBookingView } from './PublicBookingSidebar';
import { usePublicBookingPageLogic } from './usePublicBookingPageLogicCore';
import {
  buildSecretaryActionToastKey,
  clearTimedPayload,
} from '../internalToastStorage';
import { useHideBootSplash } from '../../../hooks/useHideBootSplash';

/**
 * مكون صفحة "إدارة المواعيد" (PublicBookingPage) - وهي الواجهة المخصصة للسكرتارية
 * تتيح للسكرتارية تسجيل المرضى، إدارة قائمة الانتظار لليوم، وفتح مواعيد للحجز الإلكتروني
 */
export const PublicBookingPage: React.FC = () => {
  useHideBootSplash('public-booking-mounted');
  const [currentView, setCurrentView] = useState<SecretaryBookingView>('newBooking');
  const [showProfile, setShowProfile] = useState(false);

  const {
    configLoading,
    resolvingSecret,
    secret,
    authChecking,
    isAuthenticated,
    doctorEmailInput,
    setDoctorEmailInput,
    passwordInput,
    setPasswordInput,
    authError,
    handleLogin,
    config,
    retryLoadConfig,
    canShowSecretaryPushPrompt,
    pushEnableSuccessMessage,
    handleEnableSecretaryPushNotifications,
    handleSecretaryPushPromptLater,
    secretaryActionToast,
    setSecretaryActionToast,
    entryAlert,
    entryResponding,
    handleApproveEntryAlert,
    handleRejectEntryAlert,
    profileMenuRef: _profileMenuRef,
    profileMenuOpen: _profileMenuOpen,
    setProfileMenuOpen: _setProfileMenuOpen,
    secretaryAvatarText,
    secretaryNameInput,
    setSecretaryNameInput,
    setProfileSaveMessage,
    profileSaving,
    handleSaveSecretaryName,
    doctorDisplayName,
    profileSaveMessage,
    handleSecretaryLogout,
    fixedTitle: _fixedTitle,
    success,
    sortedTodayAppointments,
    upcomingAppointments,
    completedAppointments,
    todayDateMeta,
    todaySectionOpen,
    setTodaySectionOpen,
    approvedEntryAppointmentIds,
    secretaryApprovedEntryIds,
    pendingEntryAppointmentId,
    entryRequestSendingId,
    requestEntryNow,
    handleEditAppointment,
    removeTodayAppointment,
    bookingFormOpen,
    setBookingFormOpen,
    editingAppointmentId,
    handleCancelEdit,
    bookingFormLoading,
    patientName,
    setPatientName,
    age,
    setAge,
    phone,
    setPhone,
    gender,
    setGender,
    pregnant,
    setPregnant,
    breastfeeding,
    setBreastfeeding,
    dateStr,
    setDateStr,
    timeStr,
    setTimeStr,
    visitReason,
    setVisitReason,
    secretaryVitals,
    secretaryVitalFields,
    setSecretaryVitals,
    secretaryVitalsVisibility,
    todayStr,
    submitting,
    formError,
    bookingQuotaNotice,
    appointmentType,
    handleAppointmentTypeChange,
    visibleConsultationCandidates,
    canLoadMoreConsultationCandidates,
    loadMoreConsultationCandidates,
    selectedConsultationCandidateId,
    handleSelectConsultationCandidate,
    patientDirectory,
    handleSelectPatientSuggestion,
    handleSubmit,
    publicSectionOpen,
    setPublicSectionOpen,
    publicBookingLink,
    publicLinkCopied,
    copyPublicBookingLink,
    publicSlotDateStr,
    publicSlotTodayStr,
    setPublicSlotDateStr,
    publicSlotTimeStr,
    publicTimeMin,
    setPublicSlotTimeStr,
    branches,
    currentBranchId,
    branchAddresses,
    branchAddressesSaving,
    saveBranchAddress,
    addPublicSlot,
    publicSecret,
    publicSlotAdding,
    publicSlotError,
    publicSlotsLoading,
    publicSlots,
    removePublicSlot,
    formatSlotLabel,
    paymentType,
    setPaymentType,
    insuranceCompanyId,
    setInsuranceCompanyId,
    insuranceCompanyName,
    setInsuranceCompanyName,
    insuranceMembershipId,
    setInsuranceMembershipId,
    insuranceApprovalCode,
    setInsuranceApprovalCode,
    patientSharePercent,
    setPatientSharePercent,
    discountAmount,
    setDiscountAmount,
    discountPercent,
    setDiscountPercent,
    discountReasonId,
    setDiscountReasonId,
    discountReasonLabel,
    setDiscountReasonLabel,
    insuranceCompanies,
    discountReasons,
    userId,
    sessionBranchId,
    currentBranchName,
    hasMultipleBranches,
  } = usePublicBookingPageLogic();

  // عرض شاشة التحميل في حال كانت البيانات لا تزال قادمة من السيرفر
  if (configLoading || resolvingSecret || (secret ? authChecking : false)) {
    return <LoadingStateScreen message="جاري التحميل" />;
  }

  // في حال عدم تسجيل الدخول، يتم عرض شاشة تسجيل دخول السكرتارية (كلمة السر)
  if (!isAuthenticated && secret) {
    return (
      <PublicBookingLoginScreen
        doctorEmailInput={doctorEmailInput}
        onDoctorEmailInputChange={setDoctorEmailInput}
        passwordInput={passwordInput}
        authError={authError}
        onPasswordInputChange={setPasswordInput}
        onSubmit={handleLogin}
      />
    );
  }

  // عرض رسالة خطأ في حال فشل تحميل إعدادات العيادة
  if (!config && !configLoading) {
    return (
      <PublicBookingConfigErrorScreen
        onReloadPage={() => window.location.reload()}
        onRetry={retryLoadConfig}
      />
    );
  }

  // عدد مواعيد اليوم (sortedTodayAppointments مفلترة بالفعل لليوم الحالي)
  const todayPendingCount = sortedTodayAppointments.length;

  // عند تعديل موعد نحول الواجهة لنموذج الحجز تلقائياً
  const handleEditAndSwitchView = (apt: Parameters<typeof handleEditAppointment>[0]) => {
    handleEditAppointment(apt);
    setCurrentView('newBooking');
  };

  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* السايد بار */}
      <PublicBookingSidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        secretaryAvatarText={secretaryAvatarText}
        todayAppointmentsCount={todayPendingCount}
        upcomingAppointmentsCount={upcomingAppointments.length}
        onLogout={handleSecretaryLogout}
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* المحتوى الرئيسي */}
      <main className="flex-1 min-w-0 overflow-x-hidden md:mr-56 pt-16 pb-24 md:pt-0 md:pb-6">
        {/* نافذة منبثقة لطلب إذن تفعيل الإشعارات على المتصفح */}
        <NotificationPermissionPrompt
          open={canShowSecretaryPushPrompt}
          title="فعّل إشعارات السكرتارية"
          description="لتصلك إشعارات المواعيد وطلبات السكرتارية فورًا حتى أثناء التنقل داخل النظام."
          enableLabel="تفعيل الإشعارات"
          onEnable={handleEnableSecretaryPushNotifications}
          onLater={handleSecretaryPushPromptLater}
        />
        {pushEnableSuccessMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10030] w-[min(94vw,30rem)]" dir="rtl">
            <div className="rounded-2xl border border-emerald-200 bg-white shadow-[0_24px_50px_-28px_rgba(2,6,23,0.8)] px-4 py-3 text-center">
              <p className="text-emerald-700 font-black text-sm">{pushEnableSuccessMessage}</p>
            </div>
          </div>
        )}

        {/* التنبيهات (Toasts) */}
        <div className="px-3 sm:px-4 pt-3">
          <AppUpdateBroadcastBanner audience="secretaries" scopeId={secret || userId || undefined} />
        </div>
        <InAppAudienceNotificationPopup audience="secretaries" scopeIds={[secret || '', userId || '']} />
        <PublicBookingAlerts
          secretaryActionToast={secretaryActionToast}
          onCloseSecretaryToast={() => {
            setSecretaryActionToast(null);
            if (secret) clearTimedPayload(buildSecretaryActionToastKey(secret));
          }}
          entryAlert={entryAlert}
          entryResponding={entryResponding}
          onApproveEntry={handleApproveEntryAlert}
          onRejectEntry={handleRejectEntryAlert}
        />

        {/* رسالة نجاح — في الأعلى بخلفية خضراء ونص أبيض ليكون واضحاً */}
        {success && (
          <div className="fixed top-4 left-4 right-4 z-[1200] flex justify-center pointer-events-none px-4" dir="rtl">
            <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-green-700 bg-green-600 shadow-2xl p-4 text-center animate-fadeIn">
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-white/20 shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-white font-black text-base">تم الحفظ بنجاح</p>
              </div>
              <p className="text-white text-xs font-bold mt-1 opacity-95">تم حفظ بيانات المريض وتأكيد الموعد بنجاح.</p>
            </div>
          </div>
        )}

        {/* ====== Profile Overlay ====== */}
        {showProfile && (
          <div className="fixed inset-0 z-[1100] flex items-start justify-center bg-black/50 pt-10 px-4" onClick={() => setShowProfile(false)}>
            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <PublicBookingProfileView
                secretaryAvatarText={secretaryAvatarText}
                secretaryNameInput={secretaryNameInput}
                onSecretaryNameInputChange={(value) => {
                  setSecretaryNameInput(value);
                  setProfileSaveMessage('');
                }}
                profileSaving={profileSaving}
                onSaveSecretaryName={handleSaveSecretaryName}
                doctorDisplayName={doctorDisplayName}
                profileSaveMessage={profileSaveMessage}
                branchName={currentBranchName}
                hasMultipleBranches={hasMultipleBranches}
                onLogout={handleSecretaryLogout}
              />
              <button
                type="button"
                onClick={() => setShowProfile(false)}
                className="w-full mt-3 py-3 rounded-2xl bg-white/90 backdrop-blur text-slate-600 font-bold text-sm hover:bg-white transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}

        {/* ====== الواجهات الفرعية ====== */}
        <div className="w-full">
          {/* مواعيد اليوم */}
          {currentView === 'todayAppointments' && (
            <div className="px-3 py-3 sm:px-5 sm:py-4">
              <PublicBookingTodaySection
                sortedTodayAppointments={sortedTodayAppointments}
                todayDateMeta={todayDateMeta}
                approvedEntryAppointmentIds={approvedEntryAppointmentIds}
                secretaryApprovedEntryIds={secretaryApprovedEntryIds}
                pendingEntryAppointmentId={pendingEntryAppointmentId}
                entryRequestSendingId={entryRequestSendingId}
                onRequestEntryNow={requestEntryNow}
                onEditAppointment={handleEditAndSwitchView}
                onRemoveTodayAppointment={removeTodayAppointment}
              />
            </div>
          )}

          {/* مواعيد قادمة */}
          {currentView === 'upcomingAppointments' && (
            <div className="px-3 py-3 sm:px-5 sm:py-4">
              <PublicBookingUpcomingSection
                upcomingAppointments={upcomingAppointments}
                onEditAppointment={handleEditAndSwitchView}
                onRemoveAppointment={removeTodayAppointment}
              />
            </div>
          )}

          {/* المواعيد المنفذة */}
          {currentView === 'completedAppointments' && (
            <div className="px-3 py-3 sm:px-5 sm:py-4">
              <PublicBookingCompletedSection
                completedAppointments={completedAppointments}
                onRemoveAppointment={removeTodayAppointment}
              />
            </div>
          )}

          {/* حجز موعد جديد */}
          {currentView === 'newBooking' && (
            <div className="px-3 py-3 sm:px-5 sm:py-4 space-y-4">
              <PublicBookingFormSection
                bookingFormOpen={true}
                onToggleOpen={() => {}}
                editingAppointmentId={editingAppointmentId}
                onCancelEdit={handleCancelEdit}
                bookingFormLoading={bookingFormLoading}
                patientName={patientName}
                onPatientNameChange={setPatientName}
                age={age}
                onAgeChange={setAge}
                phone={phone}
                onPhoneChange={setPhone}
                gender={gender}
                onGenderChange={setGender}
                pregnant={pregnant}
                onPregnantChange={setPregnant}
                breastfeeding={breastfeeding}
                onBreastfeedingChange={setBreastfeeding}
                dateStr={dateStr}
                onDateStrChange={setDateStr}
                timeStr={timeStr}
                onTimeStrChange={setTimeStr}
                visitReason={visitReason}
                onVisitReasonChange={setVisitReason}
                secretaryVitals={secretaryVitals}
                secretaryVitalFields={secretaryVitalFields}
                secretaryVitalsVisibility={secretaryVitalsVisibility}
                onSecretaryVitalsChange={setSecretaryVitals}
                todayStr={todayStr}
                timeMin={dateStr === todayStr ? currentTimeMin() : undefined}
                submitting={submitting}
                formError={formError}
                bookingQuotaNotice={bookingQuotaNotice}
                appointmentType={appointmentType}
                onAppointmentTypeChange={handleAppointmentTypeChange}
                visibleConsultationCandidates={visibleConsultationCandidates}
                canLoadMoreConsultationCandidates={canLoadMoreConsultationCandidates}
                onLoadMoreConsultationCandidates={loadMoreConsultationCandidates}
                selectedConsultationCandidateId={selectedConsultationCandidateId}
                onSelectConsultationCandidate={handleSelectConsultationCandidate}
                patientSuggestions={patientDirectory}
                onSelectPatientSuggestion={handleSelectPatientSuggestion}
                onSubmit={handleSubmit}
                paymentType={paymentType}
                onPaymentTypeChange={setPaymentType}
                insuranceCompanyId={insuranceCompanyId}
                onInsuranceCompanyIdChange={setInsuranceCompanyId}
                insuranceCompanyName={insuranceCompanyName}
                onInsuranceCompanyNameChange={setInsuranceCompanyName}
                insuranceMembershipId={insuranceMembershipId}
                onInsuranceMembershipIdChange={setInsuranceMembershipId}
                insuranceApprovalCode={insuranceApprovalCode}
                onInsuranceApprovalCodeChange={setInsuranceApprovalCode}
                patientSharePercent={patientSharePercent}
                onPatientSharePercentChange={setPatientSharePercent}
                discountAmount={discountAmount}
                onDiscountAmountChange={setDiscountAmount}
                discountPercent={discountPercent}
                onDiscountPercentChange={setDiscountPercent}
                discountReasonId={discountReasonId}
                onDiscountReasonIdChange={setDiscountReasonId}
                discountReasonLabel={discountReasonLabel}
                onDiscountReasonLabelChange={setDiscountReasonLabel}
                discountReasons={discountReasons}
                insuranceCompanies={insuranceCompanies}
                bookingSecret={secret}
                userId={secret ? userId : undefined}
                sessionBranchId={sessionBranchId}
              />
              {/* ملاحظة: إزالة عرض "مواعيد اليوم" و"المواعيد المنفذة" من هنا —
                   كل قسم له تبويب مستقل في السايدبار لتجنب التكرار. */}
            </div>
          )}

          {/* فورم الجمهور */}
          {currentView === 'publicForm' && (
            <div className="px-3 py-3 sm:px-5 sm:py-4">
              <PublicBookingPublicSlotsSection
                publicSectionOpen={true}
                onToggleOpen={() => {}}
                publicBookingLink={publicBookingLink}
                publicLinkCopied={publicLinkCopied}
                onCopyPublicBookingLink={copyPublicBookingLink}
                publicSlotDateStr={publicSlotDateStr}
                publicSlotTodayStr={publicSlotTodayStr}
                onPublicSlotDateChange={setPublicSlotDateStr}
                publicSlotTimeStr={publicSlotTimeStr}
                publicTimeMin={publicTimeMin}
                onPublicSlotTimeChange={setPublicSlotTimeStr}
                branches={branches}
                currentBranchId={currentBranchId}
                branchAddresses={branchAddresses}
                branchAddressesSaving={branchAddressesSaving}
                onSaveBranchAddress={saveBranchAddress}
                onAddPublicSlot={addPublicSlot}
                publicSecret={publicSecret}
                publicSlotAdding={publicSlotAdding}
                publicSlotError={publicSlotError}
                publicSlotsLoading={publicSlotsLoading}
                publicSlots={publicSlots}
                onRemovePublicSlot={removePublicSlot}
                formatSlotLabel={formatSlotLabel}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
