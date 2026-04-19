import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/useAuth';
import { firestoreService } from '../../../services/firestore';
import { SecretaryResponseToast } from '../SecretaryResponseToast';
import { AddAppointmentForm } from '../AddAppointmentForm';
import { AppointmentsStats } from '../AppointmentsStats';
import type { AppointmentsViewProps, ClinicAppointment } from '../../../types';
import { AppointmentsListColumns } from './AppointmentsListColumns';
import { useSecretaryEntryAlerts } from './useSecretaryEntryAlerts';
import { useAppointmentsDerivedData } from './useAppointmentsDerivedData';
import { useBookingSectionControls } from './useBookingSectionControls';
import { useAppointmentFormState } from './useAppointmentFormState';
import { useAppointmentExecutionActions } from './useAppointmentExecutionActions';
import { LoadingText } from '../../ui/LoadingText';

/**
 * الملف: AppointmentsView.tsx
 * الوصف: هذا هو المكون "المنظم" (Orchestrator) لشاشة المواعيد بالكامل. 
 * يقوم بربط كافة الوظائف والـ Hooks المتخصصة معاً، مثل: 
 * - إدارة المواعيد (إضافة، تعديل، حذف) عبر useAppointmentFormState.
 * - إدارة روابط الحجز للسكرتارية والجمهور عبر useBookingSectionControls.
 * - إحصائيات العيادة وتصنيف المواعيد زمنياً عبر useAppointmentsDerivedData.
 * - التفاعل الحي مع طلبات دخول المرضى من السكرتارية عبر useSecretaryEntryAlerts.
 * يعمل كحلقة وصل أساسية تضمن تدفق البيانات بسلاسة بين الواجهة وقاعدة البيانات.
 */

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  bookingSecret: bookingSecretProp,
  onBookingSecretReady,
  prescriptionVitalsConfig,
  prescriptionCustomBoxes,
  onSyncSecretaryVitalsVisibility,
  records,
  appointments,
  onOpenExam,
  onOpenConsultation,
  showNotification,
  activeBranchId,
}) => {
  const toPositiveFileNumber = (value: unknown): number | undefined => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
    return Math.floor(parsed);
  };

  const normalizeNameLookup = (value?: string): string => String(value || '').trim().toLocaleLowerCase();
  const normalizePhoneLookup = (value?: string): string => String(value || '').replace(/\D/g, '');

  const { user } = useAuth();
  const userId = user?.uid ?? '';
  const bookingSecret = bookingSecretProp;

  /** 
   * إدارة حالة النموذج (Form Management). 
   * هذا الـ Hook مسؤول عن كل ما يتعلق بإدخال بيانات المريض الجديد، 
   * التحقق من صحة البيانات، ومعالجة حالات التعديل (Editing).
   */
  const {
    patientName, setPatientName, age, setAge, phone, setPhone, currentDayStr,
    dateStr, setDateStr, timeStr, setTimeStr, visitReason, setVisitReason,
    appointmentType, selectedConsultationCandidateId, editingAppointmentId,
    formError, bookingQuotaNotice, saving, addSuccessToast, addAppointmentFormOpen,
    patientSuggestions, recentExamCandidates, visibleConsultationCandidates,
    handleAppointmentTypeChange,
    handleSelectConsultationCandidate, handleSelectPatientSuggestion,
    handleEditAppointment, addAppointment, toggleAddAppointmentFormOpen,
    clearEditing, closeAddSuccessToast,
    paymentType, setPaymentType,
    insuranceCompanyId, setInsuranceCompanyId,
    insuranceCompanyName, setInsuranceCompanyName,
    insuranceApprovalCode, setInsuranceApprovalCode,
    insuranceMembershipId, setInsuranceMembershipId,
    patientSharePercent, setPatientSharePercent,
    discountAmount, setDiscountAmount,
    discountPercent, setDiscountPercent,
    discountReasonId, setDiscountReasonId,
    discountReasonLabel, setDiscountReasonLabel,
    discountReasons,
  } = useAppointmentFormState({ userId, records, appointments });

  // Keep hook running for side-effects: fetches bookingSecret, syncs secretary vitals visibility
  useBookingSectionControls({
    userId, bookingSecret: bookingSecretProp, onBookingSecretReady,
    prescriptionVitalsConfig,
    prescriptionCustomBoxes,
    onSyncSecretaryVitalsVisibility,
    userDisplayName: user?.displayName, userEmail: user?.email, currentDayStr,
  });

  // معالجة البيانات للعرض (فرز المواعيد حسب التاريخ، حساب الإحصائيات)
  const {
    sortedList, now, todayStr, timeMin, todayDateMeta, todayPending,
    futurePendingGroups, completedGroups, completedInLastMonth, bookedInLastMonth,
    todayCount, upcomingCount,
  } = useAppointmentsDerivedData({ appointments, currentDayStr, dateStr });

  // الأكشنز الخاصة بالتعامل مع كل موعد (فتح الكشف، حذف...)
  const { removeAppointment, openExam, openConsultation } = useAppointmentExecutionActions({
    userId, bookingSecret, records, sortedList, onOpenExam, onOpenConsultation,
  });

  // نظام التنبيهات والطلبات الحية بين الطبيب والسكرتارية
  const {
    sentEntryForIds, entrySendingId, sendEntryRequest, secretaryEntryAlertResponse,
    approvedEntryAppointmentIds, secretaryApprovedEntryIds, secretaryResponseToast,
    handleCloseApprovedToast, handleCloseRejectedToast,
  } = useSecretaryEntryAlerts({ bookingSecret, appointments, showNotification });

  const patientFileNumberLookup = useMemo(() => {
    const byNameAndPhone = new Map<string, number>();
    const byNameOnly = new Map<string, number>();

    records.forEach((record) => {
      const fileNumber = toPositiveFileNumber(record.patientFileNumber);
      if (!fileNumber) return;

      const normalizedName = normalizeNameLookup(record.patientName);
      if (!normalizedName) return;

      const normalizedPhone = normalizePhoneLookup(record.phone);
      if (normalizedPhone) {
        byNameAndPhone.set(`${normalizedName}|${normalizedPhone}`, fileNumber);
      }

      if (!byNameOnly.has(normalizedName)) {
        byNameOnly.set(normalizedName, fileNumber);
      }
    });

    return { byNameAndPhone, byNameOnly };
  }, [records]);

  const resolvePatientFileNumberForAppointment = (apt: ClinicAppointment): number | undefined => {
    const normalizedName = normalizeNameLookup(apt.patientName);
    if (!normalizedName) return undefined;

    const normalizedPhone = normalizePhoneLookup(apt.phone);
    if (normalizedPhone) {
      const byNameAndPhone = patientFileNumberLookup.byNameAndPhone.get(`${normalizedName}|${normalizedPhone}`);
      if (byNameAndPhone) return byNameAndPhone;
    }

    return patientFileNumberLookup.byNameOnly.get(normalizedName);
  };

  // مزامنة قائمة المرضى المقترحين والمرشحين للاستشارة مع قاعدة البيانات (السرية)
  // نستخدم النسخة المقسّمة بالفرع ليتمكن كل فرع من رؤية مرضاه فقط.
  // `records` الحالية مفلترة بالفعل بالفرع النشط، فنكتب فقط للفرع النشط بـ dot-notation.
  const activeBranchKey = (activeBranchId || 'main').trim() || 'main';

  useEffect(() => {
    if (!bookingSecret) return;
    firestoreService.setBookingConfigRecentExamPatientsByBranch(bookingSecret, {
      [activeBranchKey]: recentExamCandidates,
    });
  }, [bookingSecret, recentExamCandidates, activeBranchKey]);

  useEffect(() => {
    if (!bookingSecret) return;
    firestoreService.setBookingConfigPatientDirectoryByBranch(bookingSecret, {
      [activeBranchKey]: patientSuggestions,
    });
  }, [bookingSecret, patientSuggestions, activeBranchKey]);

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  // عرض إشعارات الاستجابة من السكرتارية (مقبول/مرفوض)
  const secretaryResponseToastPortal = secretaryResponseToast && portalTarget && createPortal(
    <SecretaryResponseToast toast={secretaryResponseToast} onCloseApproved={handleCloseApprovedToast} onCloseRejected={handleCloseRejectedToast} />,
    portalTarget
  );

  // إشعار نجاح إضافة موعد يدوي
  const addSuccessToastPortal = addSuccessToast && portalTarget && createPortal(
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto flex items-center gap-3 p-4 rounded-xl bg-teal-600 text-white shadow-xl border border-teal-700" dir="rtl">
      <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
      </span>
      <p className="font-bold text-sm flex-1">تمت الإضافة بنجاح</p>
      <button onClick={closeAddSuccessToast} className="p-1.5 rounded-lg hover:bg-white/20"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
    </div>,
    portalTarget
  );

  return (
    <div data-no-reveal className="px-3 py-3 sm:px-5 sm:py-4 space-y-3" dir="rtl">
      {secretaryResponseToastPortal}
      {addSuccessToastPortal}

      {/* ملخص الإحصائيات */}
        <div className="dh-stagger-1">
          <AppointmentsStats bookedInLastMonth={bookedInLastMonth} todayCount={todayCount} upcomingCount={upcomingCount} completedInLastMonth={completedInLastMonth} />
        </div>

        {/* نموذج إضافة وحجز موعد */}
        <div className="dh-stagger-2"><AddAppointmentForm
          bookingSecret={bookingSecret}
          patientName={patientName} onPatientNameChange={setPatientName} age={age} onAgeChange={setAge}
          phone={phone} onPhoneChange={setPhone} dateStr={dateStr} onDateStrChange={setDateStr}
          timeStr={timeStr} onTimeStrChange={setTimeStr} visitReason={visitReason} onVisitReasonChange={setVisitReason}
          todayStr={todayStr} timeMin={timeMin} saving={saving} formError={formError}
          bookingQuotaNotice={bookingQuotaNotice} appointmentType={appointmentType}
          onAppointmentTypeChange={handleAppointmentTypeChange} consultationCandidates={visibleConsultationCandidates}
          selectedConsultationCandidateId={selectedConsultationCandidateId} onSelectConsultationCandidate={handleSelectConsultationCandidate}
          patientSuggestions={patientSuggestions} onSelectPatientSuggestion={handleSelectPatientSuggestion}
          submitLabel={editingAppointmentId ? 'حفظ التعديل' : 'إضافة موعد كشف'}
          onSubmit={addAppointment} isOpen={addAppointmentFormOpen} onToggleOpen={toggleAddAppointmentFormOpen}
          userId={userId}
          activeBranchId={activeBranchId}
          paymentType={paymentType} onPaymentTypeChange={setPaymentType}
          insuranceCompanyId={insuranceCompanyId} onInsuranceCompanyIdChange={setInsuranceCompanyId}
          insuranceCompanyName={insuranceCompanyName} onInsuranceCompanyNameChange={setInsuranceCompanyName}
          insuranceApprovalCode={insuranceApprovalCode} onInsuranceApprovalCodeChange={setInsuranceApprovalCode}
          insuranceMembershipId={insuranceMembershipId} onInsuranceMembershipIdChange={setInsuranceMembershipId}
          patientSharePercent={patientSharePercent} onPatientSharePercentChange={setPatientSharePercent}
          discountAmount={discountAmount} onDiscountAmountChange={setDiscountAmount}
          discountPercent={discountPercent} onDiscountPercentChange={setDiscountPercent}
          discountReasonId={discountReasonId} onDiscountReasonIdChange={setDiscountReasonId}
          discountReasonLabel={discountReasonLabel} onDiscountReasonLabelChange={setDiscountReasonLabel}
          discountReasons={discountReasons}
        /></div>

        {/* تنبيه حالة التعديل */}
        {editingAppointmentId && (
          <div className="dh-day-shell rounded-2xl border px-4 py-3 flex items-center justify-between gap-2">
            <p className="text-xs font-black text-blue-800"><LoadingText>جاري تعديل بيانات الموعد الحالي</LoadingText></p>
            <button onClick={clearEditing} className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-xs font-black text-blue-700 hover:bg-blue-50 transition-colors">إلغاء التعديل</button>
          </div>
        )}

        {/* قائمة المواعيد (مقسمة لأعمدة) */}
        <div className="dh-stagger-3"><AppointmentsListColumns
          todayPending={todayPending} futurePendingGroups={futurePendingGroups} completedGroups={completedGroups}
          todayDateMeta={todayDateMeta} now={now} todayStr={todayStr}
          approvedEntryAppointmentIds={approvedEntryAppointmentIds} sentEntryForIds={sentEntryForIds}
          secretaryApprovedEntryIds={secretaryApprovedEntryIds} secretaryEntryAlertResponse={secretaryEntryAlertResponse}
          entrySendingId={entrySendingId} onSendEntryRequest={sendEntryRequest} onOpenExam={openExam}
          onOpenConsultation={openConsultation} onEditAppointment={handleEditAppointment} onRemoveAppointment={removeAppointment}
          resolvePatientFileNumberForAppointment={resolvePatientFileNumberForAppointment}
        /></div>
    </div>
  );
};
