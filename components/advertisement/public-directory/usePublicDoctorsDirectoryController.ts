// ─────────────────────────────────────────────────────────────────────────────
// وحدة تحكم دليل الأطباء العام (Public Directory Controller)
// ─────────────────────────────────────────────────────────────────────────────
// Hook ضخم (≈460 سطر) يغلف كل منطق صفحة دليل الأطباء العام:
//   • جلب قائمة الأطباء من Firestore مع Pagination (20 طبيب في المرة)
//   • فلترة بالتخصص + المحافظة + المدينة + البحث النصي
//   • فتح مودالات التفاصيل والحجز والتقييمات
//   • إدارة جلسة المستخدم العام (signInWithGoogle + session role)
//   • ربط الحجوزات السابقة للمستخدم (myBookings)
//   • معالجة الـ URL params (نسخ رابط صديق، deep-link لطبيب معين)
//
// الـ hook ده كبير عمداً لأن كل الـ state مترابط (الفلاتر تؤثر على الـ pagination،
// والتفاصيل تعتمد على الحجز، إلخ). تقسيمه لـ hooks أصغر موجود فعلاً:
//   - useDirectoryFilters: الفلاتر والبحث
//   - usePublicBookingReviews: إدارة المراجعات
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState, useRef } from 'react';

import { type User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { DoctorAdProfile, DoctorPublicReview, PublicUserBooking } from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { auth, db } from '../../../services/firebaseConfig';
import {
  SESSION_ROLE_STORAGE_KEY, signInWithGoogle, } from '../../../services/auth-service';
import { useHomepageBanner } from '../../../hooks/useHomepageBanner';
import {
  getDoctorRatingStats, getFilledClinicSchedule, generateDoctorSlug, findDoctorBySlug, } from './helpers';
import type { PublicDoctorsDirectoryPageProps } from '../../../types';
import { useDirectoryFilters } from './useDirectoryFilters';
import { usePublicBookingReviews } from './usePublicBookingReviews';
import { getCachedDirectoryPage, setCachedDirectoryPage } from './directoryCache';

export const usePublicDoctorsDirectoryController = ({
  user,
  profile,
  onLogout,
}: PublicDoctorsDirectoryPageProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { banner, isVisible: isHomepageBannerVisible } = useHomepageBanner('public');

  const [ads, setAds] = useState<DoctorAdProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  // cursor للـ pagination — الـ service بيرجع رقم (مش DocumentSnapshot كما هو متعارف).
  const [lastVisibleDoc, setLastVisibleDoc] = useState<number | null>(null);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [showBookingsPanel, setShowBookingsPanel] = useState(false);
  const [showDoctorReviewsModal, setShowDoctorReviewsModal] = useState(false);
  const [reviewsDoctor, setReviewsDoctor] = useState<{ doctorId: string; doctorName: string } | null>(null);
  const [doctorReviews, setDoctorReviews] = useState<DoctorPublicReview[]>([]);
  const [doctorReviewsLoading, setDoctorReviewsLoading] = useState(false);
  const [myBookings, setMyBookings] = useState<PublicUserBooking[]>([]);
  // الـloading بقى false في البدايه لأننا مش بنجيب أي حاجه إلا لمّا المستخدم يفتح panel الحجوزات
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);
  const [accountSnapshot, setAccountSnapshot] = useState<{ name?: string; email?: string; phone?: string }>(
    profile || {}
  );
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptDoctorId, setAuthPromptDoctorId] = useState('');
  const [publicAccountVerified, setPublicAccountVerified] = useState(false);
  const [authWorking, setAuthWorking] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const {
    specialtyFilter,
    setSpecialtyFilter,
    governorateFilter,
    setGovernorateFilter,
    cityFilter,
    setCityFilter,
    searchFilter,
    setSearchFilter,
    specialties,
    topSpecialties,
    citiesForFilter,
    filteredAds,
    activeFiltersCount,
    stats,
    resetFilters,
  } = useDirectoryFilters(ads);
  const {
    reviewFeedback,
    reviewSubmittingId,
    getBookingReviewDraft,
    updateBookingReviewDraft,
    submitBookingReview,
    deleteBookingReview,
    // للضيف (user = null) بنبعت uid فاضي — الـhook مش بيقرا/يكتب إلا لمّا المستخدم
    // يدوس على زر فعلي (submitReview/deleteReview) واللي محتاج تسجيل دخول أصلاً.
  } = usePublicBookingReviews(user?.uid || '');

  const buildSiteBookingUrl = async (doctorId: string): Promise<string | null> => {
    const secret = await firestoreService.getPublicSecretByUserId(doctorId);
    if (secret) {
      return `/book-public/s/${secret}?entry=public-site`;
    }
    setError('تعذر إنشاء رابط الحجز لهذا الطبيب حاليًا.');
    return null;
  };

  useEffect(() => {
    const doctorSlug = searchParams.get('doctor');
    if (doctorSlug && ads.length > 0) {
      const doctorId = findDoctorBySlug(ads, doctorSlug);
      if (doctorId && doctorId !== selectedDoctorId) {
        setSelectedDoctorId(doctorId);
      }
    }
  }, [searchParams, ads, selectedDoctorId]);

  // تحسين التكلفه (Priority 2 من خطّة التوفير):
  // كل filter change كان = 20 قراءه جديده. مع الكاش المحلّي (sessionStorage):
  //   - لو المستخدم غيّر filter ثم رجع لنفس combination خلال 5 دقايق = 0 قراءات
  //   - لو refresh للصفحه في نفس الـtab = 0 قراءات
  // توفير متوقّع: ~70% من قراءات الصفحه الأولى.
  useEffect(() => {
    let active = true;
    const filters = {
      specialty: specialtyFilter,
      governorate: governorateFilter,
      city: cityFilter,
      search: searchFilter,
    };

    const fetchFirstPage = async () => {
      setError('');

      // 1) محاوله قراءه من الكاش أولاً — cache hit = عرض فوري بدون request
      const cached = getCachedDirectoryPage(filters);
      if (cached) {
        setAds(cached.data);
        setLastVisibleDoc(cached.lastVisibleDoc);
        setHasMore(cached.hasMore);
        setLoading(false);
        return;
      }

      // 2) cache miss = نطلب من Firestore زي الأول
      setLoading(true);
      try {
        const { data, lastVisibleDoc: newLastDoc, hasMore: newHasMore } = await firestoreService.getPublishedDoctorAdsPaginated(
          filters,
          20,
          null
        );

        if (active) {
          setAds(data);
          setLastVisibleDoc(newLastDoc);
          setHasMore(newHasMore);
          setLoading(false);
          // 3) خزّن في الكاش للـ5 دقايق الجايه
          setCachedDirectoryPage(filters, {
            data,
            lastVisibleDoc: newLastDoc,
            hasMore: newHasMore,
          });
        }
      } catch (err: any) {
        if (active) {
          setLoading(false);
          setError(err?.message || 'تعذر تحميل بيانات الأطباء.');
        }
      }
    };

    fetchFirstPage();

    return () => {
      active = false;
    };
  }, [specialtyFilter, governorateFilter, cityFilter, searchFilter]);

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError('');
    try {
      const { data, lastVisibleDoc: newLastDoc, hasMore: newHasMore } = await firestoreService.getPublishedDoctorAdsPaginated(
        {
          specialty: specialtyFilter,
          governorate: governorateFilter,
          city: cityFilter,
          search: searchFilter,
        },
        20,
        lastVisibleDoc
      );

      setAds((prev) => {
        // منع تكرار الإعلانات لو حصل سباق طلبات (Race condition)
        const existingIds = new Set(prev.map(ad => ad.doctorId));
        const newAds = data.filter(ad => !existingIds.has(ad.doctorId));
        return [...prev, ...newAds];
      });
      setLastVisibleDoc(newLastDoc);
      setHasMore(newHasMore);
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل المزيد من الأطباء.');
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  };

  // تحسين التكلفه (Priority 1 من خطّة التوفير):
  // كان فيه listener لحظي (onSnapshot) شغّال طول ما الصفحه مفتوحه — كارثه على التكلفه
  // عند 100K مستخدم (= 100K listener شغّال بيحرق قراءات 24/7).
  //
  // الحل: نجيبهم بس لمّا المستخدم يفتح panel "حجوزاتي" (lazy load) + one-time fetch
  // مع cache-first. السبب إن مفيش طبيب بيعدّل حجوزات المريض من بعيد، فمفيش داعي للمزامنه اللحظيّه.
  //
  // توفير متوقّع: ~95% من قراءات الحجوزات (معظم الجمهور مش بيفتح panel الحجوزات).
  useEffect(() => {
    // تنظيف لو المستخدم سجّل خروج
    if (!user?.uid) {
      setMyBookings([]);
      setMyBookingsLoading(false);
      return;
    }

    // مش بنجيب إلا لمّا الـpanel يفتح — توفير 95%+ من القراءات
    if (!showBookingsPanel) return;

    let active = true;
    setMyBookingsLoading(true);
    firestoreService.getPublicUserBookingsOnce(user.uid).then((bookings) => {
      if (active) {
        setMyBookings(bookings);
        setMyBookingsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [user?.uid, showBookingsPanel]);

  useEffect(() => {
    if (!showDoctorReviewsModal || !reviewsDoctor?.doctorId) {
      setDoctorReviews([]);
      setDoctorReviewsLoading(false);
      return;
    }

    setDoctorReviewsLoading(true);
    const unsub = firestoreService.subscribeToDoctorPublicReviews(reviewsDoctor.doctorId, (reviews) => {
      setDoctorReviews(reviews);
      setDoctorReviewsLoading(false);
    });

    return () => unsub();
  }, [reviewsDoctor?.doctorId, showDoctorReviewsModal]);

  useEffect(() => {
    // الـuser ممكن يكون null (ضيف) — نتعامل مع ده بـoptional chaining.
    setAccountSnapshot((prev) => ({
      name: (profile?.name || prev.name || user?.displayName || '').trim() || 'مستخدم عام',
      email: (profile?.email || prev.email || user?.email || '').trim().toLowerCase(),
      phone: (profile?.phone || prev.phone || '').trim(),
    }));
  }, [profile?.email, profile?.name, profile?.phone, user?.displayName, user?.email]);

  useEffect(() => {
    // للضيف، مفيش verified email — نسيب publicAccountVerified = false.
    const isFirebaseVerified = Boolean(auth.currentUser?.emailVerified || user?.emailVerified);
    setPublicAccountVerified(isFirebaseVerified);
  }, [user?.emailVerified, user?.uid]);

  const upsertPublicAccountProfile = async (currentUser: User, fallbackEmail = '') => {
    const normalizedEmail = (currentUser.email || fallbackEmail || accountSnapshot.email || '').trim().toLowerCase();
    const normalizedName = (accountSnapshot.name || currentUser.displayName || '').trim() || 'مستخدم عام';
    const normalizedPhone = (accountSnapshot.phone || '').trim();
    const nowIso = new Date().toISOString();

    await setDoc(
      doc(db, 'users', currentUser.uid),
      {
        authRole: 'public',
        publicProfile: {
          name: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone,
        },
        updatedAt: nowIso,
        ...(currentUser.emailVerified ? { publicVerifiedAt: nowIso } : {}),
      },
      { merge: true }
    );

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_ROLE_STORAGE_KEY, 'public');
    }
    setAccountSnapshot({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
    });
  };

  const closeAuthPrompt = () => {
    setShowAuthPrompt(false);
    setAuthError('');
    setAuthInfo('');
    setAuthWorking(false);
  };

  const openAuthPrompt = (nextDoctorId = '') => {
    setAuthPromptDoctorId(nextDoctorId);
    setAuthError('');
    setAuthInfo('');
    setShowAuthPrompt(true);
  };

  const continueBookingFlow = async (doctorId?: string) => {
    const targetDoctorId = doctorId || authPromptDoctorId;
    closeAuthPrompt();
    if (targetDoctorId) {
      const bookingUrl = await buildSiteBookingUrl(targetDoctorId);
      if (bookingUrl) navigate(bookingUrl);
    }
  };

  const handlePublicGoogleLogin = async () => {
    setAuthError('');
    setAuthInfo('');
    setAuthWorking(true);
    try {
      const credential = await signInWithGoogle('public');
      const email = (credential.user.email || '').trim().toLowerCase();
      await upsertPublicAccountProfile(credential.user, email);
      setPublicAccountVerified(true);
      await continueBookingFlow();
    } catch (err: any) {
      setAuthError(err?.message || 'تعذر تسجيل الدخول عبر Google.');
    } finally {
      setAuthWorking(false);
    }
  };

  const goToPublicBookingForm = async (doctorId: string) => {
    if (!doctorId) return;
    const currentUser = auth.currentUser || user;
    const hasVerifiedEmail = Boolean(
      currentUser &&
      !currentUser.isAnonymous &&
      currentUser.email &&
      (currentUser.emailVerified || publicAccountVerified)
    );

    if (!hasVerifiedEmail) {
      openAuthPrompt(doctorId);
      return;
    }

    const bookingUrl = await buildSiteBookingUrl(doctorId);
    if (bookingUrl) navigate(bookingUrl);
  };

  const openDoctorModal = (doctorId: string) => {
    const doctor = ads.find((ad) => ad.doctorId === doctorId);
    if (!doctor) return;

    const slug = doctor.publicSlug || generateDoctorSlug(doctor);
    setSelectedDoctorId(doctorId);
    setSearchParams({ doctor: slug });
  };

  const closeDoctorModal = () => {
    setSelectedDoctorId(null);
    setAvatarPreviewUrl(null);
    setSearchParams({});
  };

  const openDoctorReviews = (doctor: DoctorAdProfile) => {
    if (!doctor?.doctorId) return;
    setReviewsDoctor({
      doctorId: doctor.doctorId,
      doctorName: doctor.doctorName || 'طبيب غير معروف',
    });
    setShowDoctorReviewsModal(true);
  };

  const closeDoctorReviewsModal = () => {
    setShowDoctorReviewsModal(false);
  };

  // الـactivePublicUser ممكن يكون null للضيف — كل الـchecks تحت باستخدام optional chaining.
  const activePublicUser: User | null = auth.currentUser || user;
  const accountName = (accountSnapshot.name || activePublicUser?.displayName || '').trim() || 'مستخدم عام';
  const accountEmail = (activePublicUser?.email || accountSnapshot.email || '').trim().toLowerCase();
  // الضيف مش حساب مؤقّت (غير مسجّل أصلاً) — الـtemporary بيوصف الـanonymous Firebase session.
  const isTemporaryPublicAccount = Boolean(activePublicUser?.isAnonymous);
  const isPublicEmailVerified = Boolean(
    activePublicUser &&
    !activePublicUser.isAnonymous &&
    activePublicUser.email &&
    (activePublicUser.emailVerified || publicAccountVerified)
  );

  const handlePublicLogout = async () => {
    try {
      await onLogout();
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'تعذر تسجيل الخروج.');
    }
  };

  const handleJoinAsDoctor = async () => {
    // الفكره: تطبيق الجمهور (DrHyperPublic) وتطبيق الطبيب (DrHyperMed) اتنين PWA منفصلين
    // على دومينين مختلفين. زر "انضمام كطبيب" المفروض يخرج من تطبيق الجمهور خالص
    // ويفتح تطبيق الطبيب — لو مثبت كـPWA الـbrowser/OS هيعرض "Open in app"،
    // ولو لسه مش مثبت هيفتح في المتصفح والمستخدم يقدر يثبته من هناك.
    const DOCTOR_APP_URL = 'https://clinic.drhypermed.com/signup/doctor';

    try {
      // نعمل logout الأول عشان حساب العيان ما يفضلش مفتوح في التطبيق التاني
      await onLogout();
    } catch (err: any) {
      // حتى لو فشل الـlogout، نكمّل التحويل — الخطأ ده مش مانع للوصول لتطبيق الطبيب
      // (الدومين التاني عنده session مختلف أصلاً)
      console.warn('[handleJoinAsDoctor] logout failed, continuing:', err?.message);
    }

    if (typeof window === 'undefined') return;

    const host = (window.location.hostname || '').toLowerCase();
    const isProdPublicDomain =
      host === 'drhypermed.com' || host === 'www.drhypermed.com';

    if (isProdPublicDomain) {
      // الإنتاج: نفتح دومين الطبيب في تاب/تطبيق خارجي.
      // _blank + noopener: أمان — الصفحه الجديده ما تقدرش تتحكم في الصفحه الأصليه.
      // لو المستخدم مثبّت DrHyperMed كـPWA، Chrome/Edge هيعرضوا "Open in app"
      // (على Android/Desktop). على iOS هيفتح في Safari — دي حدود النظام.
      window.open(DOCTOR_APP_URL, '_blank', 'noopener,noreferrer');
    } else {
      // localhost / staging: مفيش دومين طبيب منفصل، نرجع للسلوك القديم (نفس التطبيق)
      // عشان المطور يقدر يختبر flow التسجيل بدون deployment.
      navigate('/signup/doctor', { replace: true });
    }
  };

  const handleContactWhatsApp = () => {
    const phone = '01551020238';
    const digitsOnly = phone.replace(/\D/g, '');
    const whatsappNumber = digitsOnly.startsWith('0') ? `2${digitsOnly}` : digitsOnly;
    const whatsappUrl = `https://wa.me/${whatsappNumber}`;
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const selectedDoctor = useMemo(
    () => (selectedDoctorId ? ads.find((ad) => ad.doctorId === selectedDoctorId) || null : null),
    [ads, selectedDoctorId]
  );
  const selectedDoctorFilledSchedule = useMemo(
    () => (selectedDoctor ? getFilledClinicSchedule(selectedDoctor) : []),
    [selectedDoctor]
  );
  const selectedDoctorRatingStats = useMemo(
    () => (selectedDoctor ? getDoctorRatingStats(selectedDoctor) : { count: 0, average: 0 }),
    [selectedDoctor]
  );

  return {
    banner,
    isHomepageBannerVisible,
    loading,
    error,
    setError,
    searchFilter,
    setSearchFilter,
    specialtyFilter,
    setSpecialtyFilter,
    specialties,
    governorateFilter,
    setGovernorateFilter,
    cityFilter,
    setCityFilter,
    citiesForFilter,
    topSpecialties,
    activeFiltersCount,
    filteredAds,
    ads,
    resetFilters,
    stats,
    showAccountPanel,
    setShowAccountPanel,
    showBookingsPanel,
    setShowBookingsPanel,
    showDoctorReviewsModal,
    showAuthPrompt,
    authError,
    authInfo,
    authWorking,
    myBookings,
    myBookingsLoading,
    reviewFeedback,
    reviewSubmittingId,
    accountName,
    accountEmail,
    isTemporaryPublicAccount,
    isPublicEmailVerified,
    reviewsDoctor,
    doctorReviews,
    doctorReviewsLoading,
    selectedDoctor,
    selectedDoctorFilledSchedule,
    selectedDoctorRatingStats,
    avatarPreviewUrl,
    setAvatarPreviewUrl,
    closeAuthPrompt,
    handlePublicGoogleLogin,
    openDoctorModal,
    closeDoctorModal,
    openDoctorReviews,
    closeDoctorReviewsModal,
    getBookingReviewDraft,
    updateBookingReviewDraft,
    submitBookingReview,
    deleteBookingReview,
    goToPublicBookingForm,
    openAuthPrompt,
    handlePublicLogout,
    handleJoinAsDoctor,
    handleContactWhatsApp,
    loadMore,
    hasMore,
    loadingMore,
  };
};


