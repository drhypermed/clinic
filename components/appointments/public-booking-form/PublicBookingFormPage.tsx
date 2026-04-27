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
// حفظ بيانات الحجز قبل Google signin — عشان لو الـpopup فشل ووحينا redirect،
// نسترجع البيانات بعد رجوع المريض ونكمّل الحجز تلقائياً بدل ما يضيع كل شيء.
import {
  savePendingBooking,
  loadPendingBooking,
  clearPendingBooking,
  type PendingBookingFormValues,
} from './bookingFormPersistence';

export const PublicBookingFormPage: React.FC = () => {
  useHideBootSplash('public-booking-form-mounted');
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: slugParam = '', secret: secretParam = '', userId: userIdRouteParam = '' } = useParams<{ slug: string; secret: string; userId: string }>();
  const { user, loading: authLoading, signInGoogle } = useAuth();
  const isFromPublicSite = new URLSearchParams(location.search).get('entry') === 'public-site';
  // الفرع المرسل من الديركتوري — لو المريض اختار فرع من مودال اختيار الفرع،
  // بنحدّده هنا مسبّقاً عشان مايشوفش شاشه اختيار تانيه جوّه الفورم.
  const preselectedBranchId = new URLSearchParams(location.search).get('branch') || '';

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

  // قراءه pending booking مرّه واحده عند الـmount — لو المريض رجع للتو من
  // signInWithRedirect، الـsnapshot هيكون موجود في sessionStorage. بنحمّله هنا
  // ونـreuse-ه في useState inits أدناه عشان الـUI يطلع بالقيم المحفوظه فوراً.
  // currentContext يضمن إن الـsnapshot لنفس رابط الحجز (slug + userIdRouteParam).
  const [pendingBookingSnapshot] = useState(() =>
    loadPendingBooking({ slug: slugParam, userIdRouteParam: userIdRouteParam }),
  );

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    pendingBookingSnapshot?.formValues.selectedBranchId || preselectedBranchId,
  );

  // ─── نظام تسجيل الدخول بعد ملء الفورم (بدل قبله) ───
  // لو المريض ضغط "حجز" وهو غير مسجل → نفتح Google popup ثم نُكمل الحجز تلقائياً
  // pendingSubmit: علم لتشغيل handleSubmit تلقائياً بعد نجاح تسجيل الدخول
  // عند الرجوع من redirect: pendingSubmit يبدأ true عشان الـauto-submit useEffect
  // يـtrigger handleSubmit لما user يجهز.
  const [pendingSubmit, setPendingSubmit] = useState<boolean>(
    Boolean(pendingBookingSnapshot?.pendingSlotId),
  );
  const pendingSlotIdRef = React.useRef<string>(
    pendingBookingSnapshot?.pendingSlotId || '',
  );

  // لو في فرع واحد فقط، نثبّته تلقائياً حتى يُحفظ الحجز بـ branchId صحيح وليس undefined.
  // لو المريض جاي من الديركتوري بفرع محدّد مسبّقاً (preselectedBranchId)، بنتأكّد إنه
  // فعلاً موجود في فروع الطبيب — لو مش موجود (لأي سبب) بنفضّيه ونرجّع شاشه الاختيار.
  useEffect(() => {
    if (branches.length === 1 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
      return;
    }
    if (
      selectedBranchId &&
      branches.length > 0 &&
      !branches.some((b) => b.id === selectedBranchId)
    ) {
      setSelectedBranchId('');
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

  // ـــ initial values مع استرجاع pending booking لو موجود ـــ
  // pendingBookingSnapshot؟.formValues = القيم المحفوظه قبل redirect.
  // لو null (الحاله العاديه) = نبدأ بقيم فاضيه/افتراضيه.
  const initialForm = pendingBookingSnapshot?.formValues;
  const [patientName, setPatientName] = useState(initialForm?.patientName || '');
  const [age, setAge] = useState(initialForm?.age || '');
  const [phone, setPhone] = useState(initialForm?.phone || '');
  // حقول الهوية الجديدة (الجنس ثابت، الحمل والرضاعة متغيران لكل زيارة)
  const [gender, setGender] = useState<PatientGender | ''>(
    (initialForm?.gender as PatientGender | '' | undefined) || '',
  );
  const [pregnant, setPregnant] = useState<boolean | null>(initialForm?.pregnant ?? null);
  const [breastfeeding, setBreastfeeding] = useState<boolean | null>(initialForm?.breastfeeding ?? null);
  const [visitReason, setVisitReason] = useState(initialForm?.visitReason || '');
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(initialForm?.isFirstVisit ?? null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>(
    (initialForm?.appointmentType as AppointmentType | undefined) || 'exam',
  );
  const [selectedConsultationCandidateId, setSelectedConsultationCandidateId] = useState<string>(
    initialForm?.selectedConsultationCandidateId || '',
  );
  const [activeSuggestionField, setActiveSuggestionField] = useState<'name' | 'phone' | null>(null);
  const [recentExamPatients, setRecentExamPatients] = useState<RecentExamPatientOption[]>([]);
  const [patientDirectory, setPatientDirectory] = useState<PatientSuggestionOption[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    pendingBookingSnapshot?.pendingSlotId || '',
  );
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
    onSuccess: () => {
      setSuccess(true);
      // الحجز اتسجّل بنجاح — امسح أي pending snapshot عشان ميـauto-fill-ش لو رجع
      clearPendingBooking();
    },
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
    // مسح الـsnapshot من sessionStorage قبل الـsubmit — عشان لو الـsubmit فشل
    // أو المريض رفرش الصفحه بعد كده، ميحصلش auto-fill غير مقصود.
    clearPendingBooking();
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

    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-2xl space-y-4">
          <BookingSuccessCard
            clinicName={config?.title}
            patientName={patientName}
            dateTime={bookedSlot ? new Date(bookedSlot.dateTime) : new Date()}
            clinicContact={config?.contactInfo}
            appointmentType={appointmentType}
          />

          {/* زر العودة لدليل الأطباء — حذفنا زر "تقييم الزيارة" بناءً على طلب المالك */}
          <div className="flex">
            <button
              type="button"
              onClick={handleGotoDirectory}
              className="flex-1 h-12 rounded-xl border-2 border-brand-400 bg-white text-brand-800 font-black text-sm hover:bg-brand-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              دليل الأطباء
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-50 py-8 px-4" dir="rtl">
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
            // حفظ الـbooking في sessionStorage قبل signInGoogle. لو الـpopup فشل
            // و signInGoogle عمل fallback لـsignInWithRedirect، الـpage هتـreload
            // وهنحتاج نسترجع البيانات دي عشان نكمّل الحجز تلقائياً بدل ما يضيع.
            const formValues: PendingBookingFormValues = {
              patientName,
              age,
              phone,
              gender: gender || '',
              pregnant,
              breastfeeding,
              visitReason,
              isFirstVisit,
              appointmentType,
              selectedConsultationCandidateId,
              selectedBranchId,
            };
            savePendingBooking(
              { slug: slugParam, userIdRouteParam },
              formValues,
              slotId,
            );
            try {
              await signInGoogle('public');
            } catch {
              // المريض أغلق الـpopup أو رفض — نعيد الزر لحالته الطبيعية ونمسح الـsnapshot
              setPendingSubmit(false);
              pendingSlotIdRef.current = '';
              clearPendingBooking();
            }
          }}
          onSubmit={(e) => handleSubmit(e, selectedSlotId)}
        />
      </div>
    </div>
  );
};
