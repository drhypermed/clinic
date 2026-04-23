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
import type { PatientGender } from '../../../types';
import {
  advancedAgeText,
  normalizeGender,
} from '../../../utils/patientIdentity';
import { parseAgeToYearsMonthsDays } from '../utils';
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
import { firestoreService } from '../../../services/firestore';
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

  // ─── نظام تسجيل الدخول بعد ملء الفورم (بدل قبله) ───
  // لو المريض ضغط "حجز" وهو غير مسجل → نفتح Google popup ثم نُكمل الحجز تلقائياً
  // pendingSubmit: علم لتشغيل handleSubmit تلقائياً بعد نجاح تسجيل الدخول
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const pendingSlotIdRef = React.useRef<string>('');

  // لو في فرع واحد فقط، نثبّته تلقائياً حتى يُحفظ الحجز بـ branchId صحيح وليس undefined.
  useEffect(() => {
    if (branches.length === 1 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  // المواعيد التي حجزها المستخدم الحالي عند هذا الطبيب — لإخفائها من عنده فقط
  // مع إبقائها متاحة لباقي الجمهور.
  const [myBookedDateTimes, setMyBookedDateTimes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.uid || !userId) {
      setMyBookedDateTimes((prev) => (prev.size === 0 ? prev : new Set()));
      return;
    }

    const unsub = firestoreService.subscribeToPublicUserBookings(user.uid, (bookings) => {
      const next = new Set<string>();
      bookings.forEach((b) => {
        if (b.doctorId === userId && b.dateTime) next.add(b.dateTime);
      });
      // Bail out if the filtered dates haven't changed — subscription fires for bookings
      // across all doctors, so unrelated updates would otherwise break filteredSlots memo.
      setMyBookedDateTimes((prev) => {
        if (prev.size === next.size) {
          let same = true;
          for (const dt of next) {
            if (!prev.has(dt)) { same = false; break; }
          }
          if (same) return prev;
        }
        return next;
      });
    });

    return () => unsub();
  }, [user?.uid, userId]);

  // فلترة slots: المواعيد القديمة (بدون branchId) تظهر في كل الفروع،
  // مع استبعاد المواعيد التي حجزها المستخدم الحالي من قبل عند نفس الطبيب.
  const filteredSlots = React.useMemo(() => {
    const baseSlots = (!selectedBranchId || branches.length <= 1)
      ? slots
      : slots.filter((slot) => !slot.branchId || slot.branchId === selectedBranchId);
    if (myBookedDateTimes.size === 0) return baseSlots;
    return baseSlots.filter((slot) => !myBookedDateTimes.has(slot.dateTime));
  }, [slots, selectedBranchId, branches.length, myBookedDateTimes]);

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  // حقول الهوية الجديدة (الجنس ثابت، الحمل والرضاعة متغيران لكل زيارة)
  const [gender, setGender] = useState<PatientGender | ''>('');
  const [pregnant, setPregnant] = useState<boolean | null>(null);
  const [breastfeeding, setBreastfeeding] = useState<boolean | null>(null);
  const [visitReason, setVisitReason] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
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
    gender,
    pregnant,
    breastfeeding,
    visitReason,
    isFirstVisit,
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
    setPhone(sanitizePhoneDigits(item.phone || '', MAX_PUBLIC_PHONE_LENGTH));

    // نقل الجنس (ثابت) + حساب السن الحالي من السن القديم + فرق الوقت من آخر زيارة
    setGender(normalizeGender(item.gender) ?? '');
    const lastVisit = item.lastExamDate || item.lastConsultationDate;
    if (lastVisit && item.age) {
      const advanced = advancedAgeText(
        parseAgeToYearsMonthsDays(item.age),
        lastVisit,
      );
      setAge(sanitizePublicText(advanced || item.age, MAX_PUBLIC_AGE_LENGTH));
    } else {
      setAge(sanitizePublicText(item.age || '', MAX_PUBLIC_AGE_LENGTH));
    }
    // الحمل/الرضاعة لا تُنقل من المريض القديم (بنسأل كل زيارة)
    setPregnant(null);
    setBreastfeeding(null);

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

  // بعد تسجيل الدخول بنجاح (popup أو redirect) → ننفذ الحجز المعلّق تلقائياً
  useEffect(() => {
    if (!user || !pendingSubmit || !pendingSlotIdRef.current) return;
    setPendingSubmit(false);
    // إنشاء submit event وهمي لاستدعاء handleSubmit
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    void handleSubmit(fakeEvent, pendingSlotIdRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingSubmit]);

  if (configLoading || resolvingSecret || authLoading) return <PublicBookingLoadingView />;
  if (!userId) return <PublicBookingInvalidLinkView />;

  // ⬇️ الـguard القديم "تسجيل دخول مطلوب أولاً" اتشال —
  //    المريض بيملأ الفورم أولاً، وعند الضغط "حجز" يظهر طلب Google login

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
    // رابط دليل الأطباء: لو من الموقع العام نروح للرئيسية، غير كده نفتح الموقع في تبويب جديد
    const handleGotoDirectory = () => {
      if (isFromPublicSite) {
        navigate('/');
      } else {
        window.open('https://www.drhypermed.com', '_blank', 'noopener,noreferrer');
      }
    };
    // رابط تقييم الزيارة: يوجه المريض لصفحة التقييمات في دليل الأطباء
    const handleRateVisit = () => {
      window.open('https://www.drhypermed.com', '_blank', 'noopener,noreferrer');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-2xl space-y-4">
          <BookingSuccessCard
            clinicName={config?.title}
            patientName={patientName}
            dateTime={bookedSlot ? new Date(bookedSlot.dateTime) : new Date()}
            clinicContact={config?.contactInfo}
            appointmentType={appointmentType}
          />

          {/* أزرار ما بعد التأكيد */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* الذهاب لدليل الأطباء */}
            <button
              type="button"
              onClick={handleGotoDirectory}
              className="flex-1 h-12 rounded-xl border-2 border-amber-400 bg-white text-amber-800 font-black text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              دليل الأطباء
            </button>

            {/* تقييم الزيارة */}
            <button
              type="button"
              onClick={handleRateVisit}
              className="flex-1 h-12 rounded-xl border-2 border-emerald-400 bg-white text-emerald-800 font-black text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              تقييم الزيارة
            </button>
          </div>
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
          gender={gender}
          pregnant={pregnant}
          breastfeeding={breastfeeding}
          visitReason={visitReason}
          isFirstVisit={isFirstVisit}
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
          onGenderChange={setGender}
          onPregnantChange={setPregnant}
          onBreastfeedingChange={setBreastfeeding}
          onVisitReasonChange={(value) => setVisitReason(sanitizePublicText(value, MAX_PUBLIC_REASON_LENGTH))}
          onIsFirstVisitChange={setIsFirstVisit}
          applyPhoneSuggestion={applyPhoneSuggestion}
          normalizePhone={normalizePhone}
          formError={formError}
          bookingQuotaNotice={bookingQuotaNotice}
          alertRef={alertRef}
          submitting={submitting}
          isLoggedIn={Boolean(user)}
          onLoginToBook={async (slotId) => {
            // احفظ الـ slotId وارفع علم الانتظار قبل فتح Google login
            pendingSlotIdRef.current = slotId;
            setPendingSubmit(true);
            try {
              await signInGoogle('public');
            } catch {
              // المريض أغلق الـpopup أو رفض — نعيد الزر لحالته الطبيعية
              setPendingSubmit(false);
              pendingSlotIdRef.current = '';
            }
          }}
          onSubmit={(e) => handleSubmit(e, selectedSlotId)}
        />
      </div>
    </div>
  );
};
