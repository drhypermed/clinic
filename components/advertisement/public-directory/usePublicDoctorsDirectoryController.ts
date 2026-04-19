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
  const [myBookingsLoading, setMyBookingsLoading] = useState(true);
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
  } = usePublicBookingReviews(user.uid);

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

  useEffect(() => {
    let active = true;
    const fetchFirstPage = async () => {
      setLoading(true);
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
          null
        );

        if (active) {
          setAds(data);
          setLastVisibleDoc(newLastDoc);
          setHasMore(newHasMore);
          setLoading(false);
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

  useEffect(() => {
    if (!user?.uid) {
      setMyBookings([]);
      setMyBookingsLoading(false);
      return;
    }

    setMyBookingsLoading(true);
    const unsub = firestoreService.subscribeToPublicUserBookings(user.uid, (bookings) => {
      setMyBookings(bookings);
      setMyBookingsLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

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
    setAccountSnapshot((prev) => ({
      name: (profile?.name || prev.name || user.displayName || '').trim() || 'مستخدم عام',
      email: (profile?.email || prev.email || user.email || '').trim().toLowerCase(),
      phone: (profile?.phone || prev.phone || '').trim(),
    }));
  }, [profile?.email, profile?.name, profile?.phone, user.displayName, user.email]);

  useEffect(() => {
    const isFirebaseVerified = Boolean(auth.currentUser?.emailVerified || user.emailVerified);
    setPublicAccountVerified(isFirebaseVerified);
  }, [user.emailVerified, user.uid]);

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

  const activePublicUser = auth.currentUser || user;
  const accountName = (accountSnapshot.name || activePublicUser.displayName || '').trim() || 'مستخدم عام';
  const accountEmail = (activePublicUser.email || accountSnapshot.email || '').trim().toLowerCase();
  const isTemporaryPublicAccount = Boolean(activePublicUser.isAnonymous);
  const isPublicEmailVerified = Boolean(
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
    try {
      await onLogout();
      navigate('/signup/doctor', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'تعذر الانتقال إلى تسجيل الطبيب.');
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


