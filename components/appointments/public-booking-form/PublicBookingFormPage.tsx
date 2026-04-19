/**
 * الملف: PublicBookingFormPage.tsx
 * الوصف: الصفحة الرئيسية لـ "فورم حجز الجمهور". 
 * هذه هي الواجهة التي يراها المريض عندما يفتح رابط الحجز الخاص بالعيادة. 
 * تقوم الصفحة بـ: 
 * - التحقق من هوية الطبيب وصلاحية الرابط (Bootstrap). 
 * - فرض تسجيل الدخول بحساب جوجل لضمان جدية الحجز ومنع السبام. 
 * - إدارة عملية إدخال البيانات (الاسم، السن، الموبايل) مع دعم الإكمال التلقائي 
 *   للمرضى الذين حجزوا مسبقاً بنفس رقم الهاتف. 
 * - عرض "كارت النجاح" (Success Card) بعد إتمام الحجز.
 */
import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { BookingSuccessCard } from '../BookingSuccessCard';
import type { AppointmentType, PatientSuggestionOption, RecentExamPatientOption } from '../AddAppointmentForm';
import { AppUpdateBroadcastBanner } from '../../common/AppUpdateBroadcastBanner';
import { InAppAudienceNotificationPopup } from '../../common/InAppAudienceNotificationPopup';
import { PublicBookingTopBar } from './PublicBookingTopBar';
import { PublicBookingInvalidLinkView, PublicBookingLoadingView, PublicBookingLoginRequiredView } from './PublicBookingStatusViews';
import { useAuth } from '../../../hooks/useAuth';
import { BranchSelectorScreen } from './BranchSelectorScreen';
import { PublicBookingFormCard } from './PublicBookingFormCard';
import { usePublicBookingBootstrap } from './usePublicBookingBootstrap';
import { usePublicBookingSuggestions } from './usePublicBookingSuggestions';
import { usePublicBookingShare } from './usePublicBookingShare';
import { usePublicBookingSubmit } from './usePublicBookingSubmit';
import { sanitizePhoneDigits, sanitizePublicText } from './securityUtils';
import { formatUserDate, formatUserTime } from '../../../utils/cairoTime';
import {
  MAX_PUBLIC_AGE_LENGTH,
  MAX_PUBLIC_NAME_LENGTH,
  MAX_PUBLIC_PHONE_LENGTH,
  MAX_PUBLIC_REASON_LENGTH,
} from './constants';
import { useHideBootSplash } from '../../../hooks/useHideBootSplash';

export const PublicBookingFormPage: React.FC = () => {
  useHideBootSplash('public-booking-form-mounted');
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: slugParam = '', secret: secretParam = '', userId: userIdRouteParam = '' } = useParams<{ slug: string; secret: string; userId: string }>();
  const { user, loading: authLoading, signInGoogle } = useAuth();
  const isFromPublicSite = new URLSearchParams(location.search).get('entry') === 'public-site';

  const {
    userId,
    secret,
    resolvingSecret,
    config,
    configLoading,
    slots,
    slotsLoading,
    doctorSummary,
    branches,
  } = usePublicBookingBootstrap(slugParam, secretParam, userIdRouteParam);

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // لو في فرع واحد فقط، نثبّته تلقائياً حتى يُحفظ الحجز بـ branchId صحيح وليس undefined.
  useEffect(() => {
    if (branches.length === 1 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  // فلترة slots: المواعيد القديمة (بدون branchId) تظهر في كل الفروع
  const filteredSlots = React.useMemo(() => {
    if (!selectedBranchId || branches.length <= 1) return slots;
    return slots.filter((slot) => !slot.branchId || slot.branchId === selectedBranchId);
  }, [slots, selectedBranchId, branches.length]);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('exam');
  const [selectedConsultationCandidateId, setSelectedConsultationCandidateId] = useState<string>('');
  const [activeSuggestionField, setActiveSuggestionField] = useState<'name' | 'phone' | null>(null);
  const [recentExamPatients, setRecentExamPatients] = useState<RecentExamPatientOption[]>([]);
  const [patientDirectory, setPatientDirectory] = useState<PatientSuggestionOption[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const alertRef = useRef<HTMLDivElement | null>(null);

  const {
    normalize,
    normalizePhone,
    consultationCandidatesPool,
    phoneSuggestionOptions,
    exactPhoneMatches,
    latestPhoneForName,
  } = usePublicBookingSuggestions({
    appointmentType,
    phone,
    patientName,
    recentExamPatients,
    patientDirectory,
  });

  const {
    linkCopied,
    showShareMenu,
    setShowShareMenu,
    shareToSocialMedia,
  } = usePublicBookingShare(doctorSummary);

  const {
    formError,
    bookingQuotaNotice,
    submitting,
    handleSubmit,
  } = usePublicBookingSubmit({
    userId,
    secret,
    isFromPublicSite,
    slots: filteredSlots,
    appointmentType,
    selectedConsultationCandidateId,
    consultationCandidatesPool,
    doctorSummary,
    clinicTitle: config?.title,
    patientName,
    age,
    phone,
    visitReason,
    selectedBranchId,
    onSuccess: () => setSuccess(true),
  });

  useEffect(() => {
    if (!bookingQuotaNotice && !formError) return;
    if (!alertRef.current) return;
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [bookingQuotaNotice, formError]);

  useEffect(() => {
    setRecentExamPatients([]);
    setPatientDirectory([]);
  }, []);

  /** 
   * تطبيق الاقتراح (Auto-fill). 
   * عندما يختار المريض اسماً من قائمة الاقتراحات (أو يتم التعرف عليه برقم هاتفه)، 
   * تقوم هذه الدالة بتعبئة كافة الحقول (الاسم والسن) تلقائياً لتوفير الوقت.
   */
  const applyPhoneSuggestion = (item: PatientSuggestionOption) => {
    setPatientName(sanitizePublicText(item.patientName || '', MAX_PUBLIC_NAME_LENGTH));
    setAge(sanitizePublicText(item.age || '', MAX_PUBLIC_AGE_LENGTH));
    setPhone(sanitizePhoneDigits(item.phone || '', MAX_PUBLIC_PHONE_LENGTH));

    if (appointmentType === 'consultation') {
      const matched = consultationCandidatesPool.find((candidate) => {
        const sameName = normalize(candidate.patientName) === normalize(item.patientName);
        const samePhone = normalizePhone(candidate.phone) === normalizePhone(item.phone);
        return samePhone || (sameName && !candidate.phone && !item.phone);
      });
      setSelectedConsultationCandidateId(matched?.id || '');
    }

    setActiveSuggestionField(null);
  };

  useEffect(() => {
    if (normalizePhone(phone).length < 11) return;

    const uniqueNames = new Set(exactPhoneMatches.map((item) => normalize(item.patientName)));
    if (exactPhoneMatches.length > 0 && uniqueNames.size === 1) {
      applyPhoneSuggestion(exactPhoneMatches[0]);
      return;
    }

    if (exactPhoneMatches.length > 1 && uniqueNames.size > 1) {
      if (appointmentType === 'consultation') setSelectedConsultationCandidateId('');
    }
  }, [phone, exactPhoneMatches, appointmentType]);

  const formatSlotLabel = (dateTime: string) => {
    return (
      formatUserDate(dateTime, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }, 'ar-EG') +
      ' - ' +
      formatUserTime(dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')
    );
  };

  if (configLoading || resolvingSecret || authLoading) return <PublicBookingLoadingView />;
  if (!userId) return <PublicBookingInvalidLinkView />;

  if (!user) {
    return (
      <PublicBookingLoginRequiredView
        onLogin={() => signInGoogle('public')}
        loading={authLoading}
      />
    );
  }

  // شاشة اختيار الفرع: تظهر لو عنده أكثر من فرع نشط ولم يتم الاختيار بعد
  if (branches.length > 1 && !selectedBranchId && !success) {
    return (
      <BranchSelectorScreen
        branches={branches}
        doctorName={doctorSummary.doctorName}
        clinicTitle={config?.title}
        onSelect={setSelectedBranchId}
      />
    );
  }

  if (success) {
    const bookedSlot = slots.find((s) => s.id === selectedSlotId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-2xl space-y-4">
          {isFromPublicSite && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="h-10 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 font-black text-sm hover:bg-slate-50"
              >
                رجوع للصفحة الرئيسية
              </button>
            </div>
          )}
          <BookingSuccessCard
            clinicName={config?.title}
            patientName={patientName}
            dateTime={bookedSlot ? new Date(bookedSlot.dateTime) : new Date()}
            clinicContact={config?.contactInfo}
            appointmentType={appointmentType}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4" dir="rtl">
      <div className="max-w-xl mx-auto">
        <AppUpdateBroadcastBanner
          audience="public"
          scopeId={user?.uid || userId}
          className="mb-3"
        />
        <InAppAudienceNotificationPopup audience="public" scopeIds={[user?.uid || '', userId || '']} />
        <PublicBookingTopBar
          isFromPublicSite={isFromPublicSite}
          showShareMenu={showShareMenu}
          linkCopied={linkCopied}
          doctorName={doctorSummary.doctorName || config?.title || 'حجز موعد'}
          onBack={() => navigate('/')}
          onToggleShareMenu={() => setShowShareMenu(!showShareMenu)}
          onShare={shareToSocialMedia}
        />

        <PublicBookingFormCard
          configTitle={config?.title}
          contactInfo={config?.contactInfo}
          appointmentType={appointmentType}
          onSelectExam={() => {
            setAppointmentType('exam');
            setSelectedConsultationCandidateId('');
            setActiveSuggestionField(null);
          }}
          onSelectConsultation={() => {
            setAppointmentType('consultation');
          }}
          slotsLoading={slotsLoading}
          slots={filteredSlots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
          formatSlotLabel={formatSlotLabel}
          phone={phone}
          patientName={patientName}
          age={age}
          visitReason={visitReason}
          activeSuggestionField={activeSuggestionField}
          phoneSuggestionOptions={phoneSuggestionOptions}
          latestPhoneForName={latestPhoneForName}
          maxPhoneLength={MAX_PUBLIC_PHONE_LENGTH}
          maxNameLength={MAX_PUBLIC_NAME_LENGTH}
          maxAgeLength={MAX_PUBLIC_AGE_LENGTH}
          maxReasonLength={MAX_PUBLIC_REASON_LENGTH}
          onPhoneFocus={() => setActiveSuggestionField('phone')}
          onPhoneBlur={() => setTimeout(() => setActiveSuggestionField(null), 120)}
          onPhoneChange={(value) => {
            setPhone(sanitizePhoneDigits(value, MAX_PUBLIC_PHONE_LENGTH));
            if (appointmentType === 'consultation') setSelectedConsultationCandidateId('');
          }}
          onPatientNameChange={(value) => {
            setPatientName(sanitizePublicText(value, MAX_PUBLIC_NAME_LENGTH));
            if (appointmentType === 'consultation') setSelectedConsultationCandidateId('');
          }}
          onAgeChange={(value) => setAge(sanitizePublicText(value, MAX_PUBLIC_AGE_LENGTH))}
          onVisitReasonChange={(value) => setVisitReason(sanitizePublicText(value, MAX_PUBLIC_REASON_LENGTH))}
          applyPhoneSuggestion={applyPhoneSuggestion}
          normalizePhone={normalizePhone}
          formError={formError}
          bookingQuotaNotice={bookingQuotaNotice}
          alertRef={alertRef}
          submitting={submitting}
          onSubmit={(e) => handleSubmit(e, selectedSlotId)}
        />
      </div>
    </div>
  );
};
