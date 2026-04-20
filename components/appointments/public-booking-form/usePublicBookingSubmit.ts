/**
 * الملف: usePublicBookingSubmit.ts (Hook)
 * الوصف: المحرك المسؤول عن "عملية الحجز الفعلي". 
 * يقوم هذا الـ Hook بـ: 
 * 1. التحقق الصارم من صحة البيانات المدخلة قبل إرسالها. 
 * 2. معالجة حالات الاستشارات (المتابعة) عند توفر ربط كشف سابق اختيارياً.
 * 3. التواصل مع خادم Firestore لإنشاء سجل الموعد. 
 * 4. إدارة "حصص الحجز" (Quotas) وعرض رسائل تنبيهية في حال تجاوز الطبيب لعدد الحجوزات المتاحة في باقته.
 */
import { useState } from 'react';

import type { PublicBookingSlot } from '../../../types';
import { auth } from '../../../services/firebaseConfig';
import { firestoreService } from '../../../services/firestore';
import type { AppointmentType, RecentExamPatientOption } from '../AddAppointmentForm';
import type { BookingQuotaNotice } from '../../../types';
import { extractBookingQuotaNotice, sanitizePhoneDigits, sanitizePublicText } from './securityUtils';
import {
  MAX_PUBLIC_AGE_LENGTH,
  MAX_PUBLIC_NAME_LENGTH,
  MAX_PUBLIC_PHONE_LENGTH,
  MAX_PUBLIC_REASON_LENGTH,
} from './constants';

type DoctorSummary = { doctorName: string; doctorSpecialty: string };

type UsePublicBookingSubmitParams = {
  userId: string | null;
  secret: string;
  isFromPublicSite: boolean;
  slots: PublicBookingSlot[];
  appointmentType: AppointmentType;
  selectedConsultationCandidateId: string;
  consultationCandidatesPool: RecentExamPatientOption[];
  doctorSummary: DoctorSummary;
  clinicTitle?: string;
  patientName: string;
  age: string;
  phone: string;
  visitReason: string;
  isFirstVisit: boolean | null;
  selectedBranchId?: string;
  onSuccess: () => void;
};

export const usePublicBookingSubmit = ({
  userId,
  secret,
  isFromPublicSite,
  slots,
  appointmentType,
  selectedConsultationCandidateId,
  consultationCandidatesPool,
  doctorSummary,
  clinicTitle,
  patientName,
  age,
  phone,
  visitReason,
  isFirstVisit,
  selectedBranchId,
  onSuccess,
}: UsePublicBookingSubmitParams) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [bookingQuotaNotice, setBookingQuotaNotice] = useState<BookingQuotaNotice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, selectedSlotId: string) => {
    e.preventDefault();
    setFormError(null);
    setBookingQuotaNotice(null);

    if (!userId || !secret) {
      setFormError('رابط الحجز غير صالح');
      return;
    }

    const name = sanitizePublicText(patientName.trim(), MAX_PUBLIC_NAME_LENGTH);
    const ageVal = sanitizePublicText(age.trim(), MAX_PUBLIC_AGE_LENGTH);
    const ph = sanitizePhoneDigits(phone.trim(), MAX_PUBLIC_PHONE_LENGTH);
    const reasonVal = sanitizePublicText(visitReason.trim(), MAX_PUBLIC_REASON_LENGTH);

    if (
      name.length > MAX_PUBLIC_NAME_LENGTH ||
      ageVal.length > MAX_PUBLIC_AGE_LENGTH ||
      ph.length > MAX_PUBLIC_PHONE_LENGTH ||
      reasonVal.length > MAX_PUBLIC_REASON_LENGTH
    ) {
      setFormError('البيانات المدخلة تتجاوز الحد المسموح (50 حرف/رقم).');
      return;
    }

    if (!name) {
      setFormError('يرجى إدخال اسم المريض');
      return;
    }
    if (!ageVal || !/\d/.test(ageVal)) {
      setFormError('يرجى إدخال سن صحيح');
      return;
    }
    if (!ph || ph.length < 7) {
      setFormError('يرجى إدخال رقم تليفون صحيح (7 أرقام على الأقل)');
      return;
    }
    if (!selectedSlotId) {
      setFormError('يرجى اختيار موعد متاح من القائمة');
      return;
    }
    if (!reasonVal) {
      setFormError('يرجى إدخال سبب الزيارة');
      return;
    }
    if (isFirstVisit === null) {
      setFormError('يرجى تحديد إذا كانت هذه أول زيارة أم لا');
      return;
    }

    const slot = slots.find((s) => s.id === selectedSlotId);
    if (!slot) {
      setFormError('موعد الحجز غير متاح الآن. يرجى تحديث الصفحة.');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      if (isFromPublicSite && !currentUser) {
        setFormError('يجب تسجيل الدخول أولًا قبل الحجز من صفحة الجمهور.');
        return;
      }
      const publicUserId = isFromPublicSite
        ? (currentUser?.uid || undefined)
        : (currentUser && !currentUser.isAnonymous && currentUser.email ? currentUser.uid : undefined);

      const selectedConsultationCandidate = consultationCandidatesPool.find((candidate) => candidate.id === selectedConsultationCandidateId);
      const resolvedAppointmentType: AppointmentType = appointmentType;

      // اختر branchId المناسب: لو الـ slot نفسه عنده branchId استخدمه،
      // غير كده استخدم الفرع المختار من المريض (لو موجود)
      const resolvedBranchId = slot.branchId || (selectedBranchId && selectedBranchId.trim()) || undefined;

      await firestoreService.createAppointmentFromPublic(
        userId,
        secret,
        slot.id,
        slot.dateTime,
        {
          patientName: name,
          age: ageVal,
          phone: ph,
          visitReason: reasonVal,
          isFirstVisit: isFirstVisit === true,
          appointmentType: resolvedAppointmentType,
          consultationSourceAppointmentId: resolvedAppointmentType === 'consultation' ? selectedConsultationCandidateId : undefined,
          consultationSourceCompletedAt: resolvedAppointmentType === 'consultation' ? selectedConsultationCandidate?.examCompletedAt : undefined,
          consultationSourceRecordId: resolvedAppointmentType === 'consultation' ? selectedConsultationCandidate?.consultationSourceRecordId : undefined,
          branchId: resolvedBranchId,
        },
        {
          publicUserId,
          doctorId: userId,
          doctorName: doctorSummary.doctorName || clinicTitle || '',
          doctorSpecialty: doctorSummary.doctorSpecialty || '',
        }
      );

      onSuccess();
    } catch (error) {
      const rawCode = typeof (error as { code?: string })?.code === 'string' ? (error as { code: string }).code : '';
      const code = rawCode.replace(/^functions\//, '');
      console.error('[PublicForm] createAppointmentFromPublic failed:', error);

      const quotaNotice = extractBookingQuotaNotice(error);
      if (quotaNotice) {
        setBookingQuotaNotice(quotaNotice);
        setFormError(quotaNotice.message);
        return;
      }

      if (code === 'permission-denied') {
        setFormError('تعذر إتمام الحجز بسبب صلاحيات الوصول. تأكد من الرابط أو حاول مرة أخرى.');
      } else {
        setFormError('فشل إتمام الحجز. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formError,
    bookingQuotaNotice,
    submitting,
    setFormError,
    setBookingQuotaNotice,
    handleSubmit,
  };
};

