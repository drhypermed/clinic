/**
 * usePublicBookingAppointmentActions — إجراءات إدارة مواعيد السكرتارية
 *
 * يُغلّف هذا الـ hook كل الإجراءات التي تستخدمها واجهة السكرتارية لإدارة
 * مواعيد اليوم (إرسال طلب دخول، حذف، تعديل، حفظ، إلغاء التعديل). تم فصل
 * المنطق المعقّد إلى `usePublicBookingAppointmentActions/*`:
 *
 *   - `types.ts`              : أنواع الـ props والبيانات.
 *   - `sessionHelpers.ts`     : retry logic لجلسة السكرتارية.
 *   - `submitAppointment.ts`  : منطق حفظ/تحديث الموعد عبر Cloud Function.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { httpsCallable } from 'firebase/functions';
import { firestoreService } from '../../../services/firestore';
import { resolveAppointmentType } from '../../../utils/appointmentType';
import { functions } from '../../../services/firebaseConfig';
import { buildLocalDateTime, currentTimeMin, toLocalDateStr } from '../utils';
import { extractBookingQuotaNotice } from './helpers';
import { sanitizePhoneDigits, sanitizePublicText } from './securityUtils';
import { sanitizeSecretaryVitalsInput } from '../../../utils/secretaryVitals';
import { playNotificationCue } from '../../../utils/notificationSound';
import type { AppointmentType } from '../../../types';
import { normalizeGender } from '../../../utils/patientIdentity';
import type { TodayAppointment } from './types';
import type { EntryRequestAppointment, UsePublicBookingAppointmentActionsParams } from './usePublicBookingAppointmentActions/types';
import { callWithSessionRetry, isInvalidSecretarySessionError } from './usePublicBookingAppointmentActions/sessionHelpers';
import {
  buildMergedTodayAppointment,
  isSameLocalDay,
  submitAppointment,
  syncTodayAppointmentsToBookingConfig,
} from './usePublicBookingAppointmentActions/submitAppointment';

export const usePublicBookingAppointmentActions = ({
  secret,
  userId,
  getSessionToken,
  sessionBranchId,
  onSessionInvalid,
  success,
  patientName,
  age,
  phone,
  gender,
  pregnant,
  breastfeeding,
  dateStr,
  timeStr,
  visitReason,
  secretaryVitals,
  secretaryVitalFields,
  secretaryVitalsVisibility,
  appointmentType,
  selectedConsultationCandidateId,
  editingAppointmentId,
  todayAppointments,
  recentExamPatients,
  paymentType,
  insuranceCompanyId,
  insuranceCompanyName,
  insuranceMembershipId,
  insuranceApprovalCode,
  patientSharePercent,
  discountAmount,
  discountPercent,
  discountReasonId,
  discountReasonLabel,
  setPaymentType,
  setInsuranceCompanyId,
  setInsuranceCompanyName,
  setInsuranceMembershipId,
  setInsuranceApprovalCode,
  setPatientSharePercent,
  setDiscountAmount,
  setDiscountPercent,
  setDiscountReasonId,
  setDiscountReasonLabel,
  setPendingEntryAppointmentId,
  setBookingQuotaNotice,
  setFormError,
  setEditingAppointmentId,
  setPatientName,
  setAge,
  setPhone,
  setGender,
  setPregnant,
  setBreastfeeding,
  setDateStr,
  setTimeStr,
  setVisitReason,
  setSecretaryVitals,
  setAppointmentType,
  setSelectedConsultationCandidateId,
  setSuccess,
  setSubmitting,
  setBookingFormOpen,
  setTodayAppointments,
}: UsePublicBookingAppointmentActionsParams) => {
  const [entryRequestSendingId, setEntryRequestSendingId] = useState<string | null>(null);

  const resolveCurrentSessionToken = (): string | undefined => {
    const token = String(getSessionToken?.() || '').trim();
    return token || undefined;
  };

  const isAppointmentForToday = (dateTime: string) =>
    isSameLocalDay(dateTime, toLocalDateStr(new Date()), toLocalDateStr);

  const requestEntryNow = async (apt: EntryRequestAppointment) => {
    if (!secret || !userId) return;
    setPendingEntryAppointmentId(apt.id);
    setEntryRequestSendingId(apt.id);
    setBookingQuotaNotice(null);
    try {
      const resolvedType = resolveAppointmentType(apt);
      // نبحث عن الموعد الكامل في قائمة مواعيد اليوم لجلب gender/pregnant/breastfeeding
      // (الـ EntryRequestAppointment معندوش الحقول دي — بنجيبها من الـ state)
      const fullAppt = todayAppointments.find((item) => item.id === apt.id);
      const aptGender = fullAppt?.gender === 'male' || fullAppt?.gender === 'female'
        ? fullAppt.gender
        : undefined;
      const aptPregnant = typeof fullAppt?.pregnant === 'boolean' ? fullAppt.pregnant : undefined;
      const aptBreastfeeding = typeof fullAppt?.breastfeeding === 'boolean' ? fullAppt.breastfeeding : undefined;

      await firestoreService.setSecretaryEntryRequest(
        secret,
        {
          appointmentId: apt.id,
          patientName: apt.patientName,
          age: apt.age,
          visitReason: apt.visitReason,
          appointmentType: resolvedType,
          consultationSourceAppointmentId: apt.consultationSourceAppointmentId,
          consultationSourceCompletedAt: apt.consultationSourceCompletedAt,
          consultationSourceRecordId: apt.consultationSourceRecordId,
          // تمرير الفرع الحالي للسكرتيرة — للعزل بين الفروع عند إرسال الطلب للطبيب
          branchId: sessionBranchId,
          // الهوية الثابتة + الحالة المؤقتة — تظهر في إشعار الطبيب
          gender: aptGender,
          pregnant: aptPregnant,
          breastfeeding: aptBreastfeeding,
        },
        userId
      );
      // 🔔 صوت تأكيد قصير — طلب الإدخال اتبعت للطبيب
      void playNotificationCue('action_confirmed');
    } catch (error) {
      // ❌ صوت خطأ
      void playNotificationCue('error');
      console.error('[Secretary] Failed to send entry request:', error);
      setPendingEntryAppointmentId(null);
      const quotaNotice = extractBookingQuotaNotice(error);
      if (quotaNotice) {
        setBookingQuotaNotice(quotaNotice);
        setFormError(quotaNotice.message);
        return;
      }
      setFormError('تعذر إرسال طلب الدخول للطبيب. يرجى المحاولة مرة أخرى.');
    } finally {
      setEntryRequestSendingId(null);
    }
  };

  const removeTodayAppointment = async (appointmentId: string) => {
    if (!userId || !secret) return;
    try {
      const deleteFn = httpsCallable<{
        userId: string;
        appointmentId: string;
        secret: string;
        sessionToken?: string;
        branchId?: string;
      }>(functions, 'deleteAppointmentBySecretary');
      await callWithSessionRetry(
        (currentSessionToken) =>
          deleteFn({
            userId,
            appointmentId,
            secret,
            sessionToken: currentSessionToken,
            branchId: sessionBranchId,
          }),
        resolveCurrentSessionToken
      );
      const updatedTodayAppointments = todayAppointments.filter((apt) => apt.id !== appointmentId);
      setTodayAppointments(updatedTodayAppointments);
      void syncTodayAppointmentsToBookingConfig(secret, updatedTodayAppointments, sessionBranchId);
      // 🗑️ صوت حذف — تأكيد للسكرتيرة بأن الموعد اتحذف
      void playNotificationCue('appointment_deleted');
    } catch (error) {
      // ❌ صوت خطأ
      void playNotificationCue('error');
      console.error('[Secretary] Failed to delete appointment via cloud function:', error);
      if (isInvalidSecretarySessionError(error)) {
        const sessionMessage = 'Secretary session expired. Please log in again.';
        onSessionInvalid?.(sessionMessage);
        setFormError(sessionMessage);
        return;
      }
      setFormError('تعذر حذف الموعد. حاول مرة أخرى.');
    }
  };

  const handleEditAppointment = (apt: TodayAppointment) => {
    const dt = new Date(apt.dateTime);
    if (Number.isNaN(dt.getTime())) return;
    const pad = (value: number) => String(value).padStart(2, '0');
    setEditingAppointmentId(apt.id);
    setPatientName(apt.patientName || '');
    setAge(apt.age || '');
    setPhone(apt.phone || '');
    // تحميل حقول الهوية لو الموعد محفوظ بها (الموعد القديم قد لا يحتوي عليها)
    setGender(normalizeGender((apt as any).gender) ?? '');
    setPregnant(typeof (apt as any).pregnant === 'boolean' ? (apt as any).pregnant : null);
    setBreastfeeding(typeof (apt as any).breastfeeding === 'boolean' ? (apt as any).breastfeeding : null);
    setVisitReason(apt.visitReason || '');
    setSecretaryVitals(
      sanitizeSecretaryVitalsInput((apt as { secretaryVitals?: unknown }).secretaryVitals, {
        visibility: secretaryVitalsVisibility,
        fieldDefinitions: secretaryVitalFields,
      }) || {}
    );
    setDateStr(toLocalDateStr(dt));
    setTimeStr(`${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
    if (apt.appointmentType === 'consultation') {
      setAppointmentType('consultation');
      setSelectedConsultationCandidateId(apt.consultationSourceAppointmentId || '');
    } else {
      setAppointmentType('exam');
      setSelectedConsultationCandidateId('');
    }
    setPaymentType((apt as any).paymentType || 'cash');
    setInsuranceCompanyId((apt as any).insuranceCompanyId || '');
    setInsuranceCompanyName((apt as any).insuranceCompanyName || '');
    setInsuranceMembershipId((apt as any).insuranceMembershipId || '');
    setInsuranceApprovalCode((apt as any).insuranceApprovalCode || '');
    setPatientSharePercent((apt as any).patientSharePercent || 0);
    setDiscountAmount(Number((apt as any).discountAmount || 0) || 0);
    setDiscountPercent(Number((apt as any).discountPercent || 0) || 0);
    setDiscountReasonId(String((apt as any).discountReasonId || '').trim());
    setDiscountReasonLabel(String((apt as any).discountReasonLabel || '').trim());
    setFormError(null);
    setBookingFormOpen(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setBookingQuotaNotice(null);
    if (!userId || !secret) {
      setFormError('رابط غير صالح');
      return;
    }
    const name = sanitizePublicText(patientName);
    const ageVal = sanitizePublicText(age);
    const ph = sanitizePhoneDigits(phone);
    const reasonVal = sanitizePublicText(visitReason);
    if (!name) { setFormError('يرجى إدخال اسم المريض'); return; }
    if (!ageVal) { setFormError('يرجى إدخال السن'); return; }
    if (!dateStr || !timeStr) { setFormError('يرجى اختيار التاريخ والوقت'); return; }

    let chosenDateTime = buildLocalDateTime(dateStr, timeStr);
    if (Number.isNaN(chosenDateTime.getTime())) {
      setFormError('تاريخ أو وقت غير صالح');
      return;
    }
    const now = new Date();
    if (chosenDateTime.getTime() < now.getTime()) {
      chosenDateTime = now;
      setDateStr(toLocalDateStr(now));
      setTimeStr(currentTimeMin());
    }
    const dateTime = chosenDateTime;
    const selectedConsultationCandidate = recentExamPatients.find((c) => c.id === selectedConsultationCandidateId);
    const resolvedAppointmentType: AppointmentType = appointmentType;
    const sanitizedSecretaryVitals = sanitizeSecretaryVitalsInput(secretaryVitals, {
      visibility: secretaryVitalsVisibility,
      fieldDefinitions: secretaryVitalFields,
    });
    const editingAppointment = editingAppointmentId
      ? todayAppointments.find((item) => item.id === editingAppointmentId) || null
      : null;
    if (editingAppointmentId && !editingAppointment) {
      setFormError('لا يمكن تعديل هذا الموعد حاليًا. حاول تحديث الصفحة.');
      return;
    }

    const normalizedDiscountReasonId = String(discountReasonId || '').trim();
    const normalizedDiscountReasonLabel = sanitizePublicText(discountReasonLabel);

    // حساب consultation source metadata لو موعد استشارة
    const consultationSourceMeta: {
      consultationSourceAppointmentId?: string;
      consultationSourceCompletedAt?: string;
      consultationSourceRecordId?: string;
    } = {};
    if (resolvedAppointmentType === 'consultation' && selectedConsultationCandidateId) {
      consultationSourceMeta.consultationSourceAppointmentId = selectedConsultationCandidateId;
      if (selectedConsultationCandidate?.examCompletedAt) {
        consultationSourceMeta.consultationSourceCompletedAt = selectedConsultationCandidate.examCompletedAt;
      }
      if (selectedConsultationCandidate?.consultationSourceRecordId) {
        consultationSourceMeta.consultationSourceRecordId = selectedConsultationCandidate.consultationSourceRecordId;
      }
    }

    // تطبيع حقول الهوية الجديدة قبل الإرسال
    const genderForPayload = normalizeGender(gender);
    const pregnantForPayload = typeof pregnant === 'boolean' ? pregnant : undefined;
    const breastfeedingForPayload = typeof breastfeeding === 'boolean' ? breastfeeding : undefined;

    setSubmitting(true);
    try {
      const savedAppointmentId = await submitAppointment({
        userId,
        secret,
        branchId: sessionBranchId,
        resolveCurrentSessionToken,
        editingAppointment,
        name,
        ageVal,
        ph,
        reasonVal,
        dateTime,
        sanitizedSecretaryVitals,
        resolvedAppointmentType,
        ...consultationSourceMeta,
        paymentType,
        insuranceCompanyId,
        insuranceCompanyName,
        insuranceMembershipId,
        insuranceApprovalCode,
        patientSharePercent,
        discountAmount,
        discountPercent,
        normalizedDiscountReasonId,
        normalizedDiscountReasonLabel,
        gender: genderForPayload,
        pregnant: pregnantForPayload,
        breastfeeding: breastfeedingForPayload,
      });

      if (savedAppointmentId) {
        const mergedAppointment = buildMergedTodayAppointment({
          savedAppointmentId,
          branchId: sessionBranchId,
          name,
          ageVal,
          ph,
          reasonVal,
          sanitizedSecretaryVitals,
          dateTime,
          editingAppointment,
          resolvedAppointmentType,
          ...consultationSourceMeta,
          paymentType,
          insuranceCompanyId,
          insuranceCompanyName,
          insuranceMembershipId,
          insuranceApprovalCode,
          patientSharePercent,
          discountAmount,
          discountPercent,
          normalizedDiscountReasonId,
          normalizedDiscountReasonLabel,
          gender: genderForPayload,
          pregnant: pregnantForPayload,
          breastfeeding: breastfeedingForPayload,
        });
        const currentDayStr = toLocalDateStr(new Date());
        const cleanedCurrentDayAppointments = todayAppointments.filter((apt) =>
          isSameLocalDay(apt.dateTime, currentDayStr, toLocalDateStr)
        );
        const withoutCurrent = cleanedCurrentDayAppointments.filter((apt) => apt.id !== savedAppointmentId);
        const updatedTodayAppointments = isAppointmentForToday(mergedAppointment.dateTime)
          ? [...withoutCurrent, mergedAppointment].sort(
            (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          )
          : withoutCurrent;
        setTodayAppointments(updatedTodayAppointments);
        void syncTodayAppointmentsToBookingConfig(secret, updatedTodayAppointments, sessionBranchId);
      }

      // إعادة تعيين الفورم إلى الحالة الافتراضية
      setPatientName('');
      setAge('');
      setPhone('');
      setGender('');
      setPregnant(null);
      setBreastfeeding(null);
      setDateStr(toLocalDateStr(new Date()));
      setTimeStr(currentTimeMin());
      setVisitReason('');
      setSecretaryVitals({});
      setAppointmentType('exam');
      setSelectedConsultationCandidateId('');
      setEditingAppointmentId(null);
      setPaymentType('cash');
      setInsuranceCompanyId('');
      setInsuranceCompanyName('');
      setInsuranceMembershipId('');
      setInsuranceApprovalCode('');
      setPatientSharePercent(0);
      setDiscountAmount(0);
      setDiscountPercent(0);
      setDiscountReasonId('');
      setDiscountReasonLabel('');
      setSuccess(true);
      // 💾 صوت حفظ — تأكيد نجاح (3 نغمات صاعدة)
      void playNotificationCue('appointment_saved');
    } catch (err) {
      // ❌ صوت خطأ
      void playNotificationCue('error');
      console.error('[Secretary] Failed to save appointment:', err, { userId, secret });
      if (isInvalidSecretarySessionError(err)) {
        const sessionMessage = 'Secretary session expired. Please log in again.';
        onSessionInvalid?.(sessionMessage);
        setFormError(sessionMessage);
        return;
      }
      const quotaNotice = extractBookingQuotaNotice(err);
      if (quotaNotice) {
        setBookingQuotaNotice(quotaNotice);
        setFormError(quotaNotice.message);
        return;
      }
      setFormError('فشل حفظ الموعد. تحقق من الرابط أو حاول لاحقًا.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAppointmentId(null);
    setPatientName('');
    setAge('');
    setPhone('');
    setGender('');
    setPregnant(null);
    setBreastfeeding(null);
    setDateStr(toLocalDateStr(new Date()));
    setTimeStr(currentTimeMin());
    setVisitReason('');
    setSecretaryVitals({});
    setAppointmentType('exam');
    setSelectedConsultationCandidateId('');
    setFormError(null);
    setPaymentType('cash');
    setInsuranceCompanyId('');
    setInsuranceCompanyName('');
    setInsuranceMembershipId('');
    setInsuranceApprovalCode('');
    setPatientSharePercent(0);
    setDiscountAmount(0);
    setDiscountPercent(0);
    setDiscountReasonId('');
    setDiscountReasonLabel('');
  };

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      setSuccess(false);
    }, 5000);
    return () => clearTimeout(t);
  }, [success, setSuccess]);

  return {
    entryRequestSendingId,
    requestEntryNow,
    removeTodayAppointment,
    handleEditAppointment,
    handleSubmit,
    handleCancelEdit,
  };
};
