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
  getDoctorRatingStats, getFilledClinicSchedule, generateDoctorSlug, findDoctorBySlug, getAdBranches, } from './helpers';
import type { PublicDoctorsDirectoryPageProps } from '../../../types';
import { useDirectoryFilters } from './useDirectoryFilters';
import { usePublicBookingReviews } from './usePublicBookingReviews';
import { getCachedDirectoryPage, setCachedDirectoryPage } from './directoryCache';

// مفتاح sessionStorage لحفظ doctor id اللي المريض كان بيحاول يحجز معاه قبل ما
// يضغط Google login. لو signInWithGoogle عمل fallback لـsignInWithRedirect،
// الـpage بتـreload وكل state بيضيع. بنحفظ الـintent هنا عشان نـauto-resume
// الحجز بعد ما المريض يرجع من Google.
const PENDING_BOOKING_INTENT_KEY = 'dh_pending_booking_intent';

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
  // cursor للـpagination — نص opaque بيرجع من الـservice. شكله مختلف حسب نوع الـquery:
  //   • بدون بحث نصّي → updatedAt ISO لآخر دكتور في الصفحه (Firestore startAfter).
  //   • مع بحث نصّي  → رقم offset داخل string (slice client-side بعد الفلتره).
  // الـcontroller مش محتاج يعرف الفرق — بيبعت القيمه كما هي.
  const [lastVisibleDoc, setLastVisibleDoc] = useState<string | null>(null);

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
  // حالة حفظ بانل "حسابي" — للسبينر داخل الزر ورسالة الخطأ.
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSaveError, setAccountSaveError] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptDoctorId, setAuthPromptDoctorId] = useState('');
  // ─── حالة مودال اختيار الفرع ───
  // لما المريض يضغط "احجز الآن" على طبيب عنده أكثر من فرع، بنخزّن الـid هنا
  // عشان يفتح مودال BranchPickerModal. لو فرع واحد بنروح للفورم على طول.
  const [branchPickerDoctorId, setBranchPickerDoctorId] = useState<string>('');
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

  // بناء رابط الفورم العام من معرّف الطبيب (مع تمرير الفرع لو الطبيب عنده أكتر من واحد).
  // كنّا قبل كده بنجيب الـsecret هنا وبنرجع رسالة "تعذر إنشاء رابط الحجز" لو مفقود،
  // وده كان بيمنع المريض من الحجز. دلوقتي بنستخدم مسار /book-public/:userId مباشرة،
  // والـbootstrap في فورم الحجز هو اللي بيعمل lookup للـsecret داخلياً ويعرض شاشه واضحه
  // لو الرابط فعلاً غير صالح.
  const buildSiteBookingUrl = (doctorId: string, branchId = ''): string => {
    const params = new URLSearchParams({ entry: 'public-site' });
    if (branchId) params.set('branch', branchId);
    return `/book-public/${encodeURIComponent(doctorId)}?${params.toString()}`;
  };

  // مزامنة الـmodal مع query string في اتجاهين:
  //   • وجود ?doctor=slug → فتح مودال الطبيب المطابق
  //   • غياب الـquery → قفل المودال
  // ده بيخلي الـURL هي مصدر الحقيقة الوحيد، فمفيش race condition بين
  // setSelectedDoctorId و setSearchParams (اللي كانت بتسبب رعشة في الإغلاق
  // وبتخلي الكليك الأول برّا المودال ميقفلش — نضطر نضغط مرتين).
  useEffect(() => {
    const doctorSlug = searchParams.get('doctor');
    if (!doctorSlug) {
      // مش بنعمل setState إلا لو القيمه فعلاً متغيره — لمنع re-renders فاضيه.
      setSelectedDoctorId((prev) => (prev === null ? prev : null));
      return;
    }
    if (ads.length === 0) return;
    const doctorId = findDoctorBySlug(ads, doctorSlug);
    if (doctorId) {
      setSelectedDoctorId((prev) => (prev === doctorId ? prev : doctorId));
    }
  }, [searchParams, ads]);

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
    // catch + finally — قبل الإصلاح، الـpromise لو رفض كان loading يفضل true للأبد.
    // دلوقتي finally يضمن إن الـloading يقفل في كل الحالات (success/failure).
    firestoreService
      .getPublicUserBookingsOnce(user.uid)
      .then((bookings) => {
        if (active) setMyBookings(bookings);
      })
      .catch((err) => {
        console.warn('[publicDirectory] getPublicUserBookingsOnce failed:', err);
        if (active) setMyBookings([]);
      })
      .finally(() => {
        if (active) setMyBookingsLoading(false);
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
    // ─ مسح الـsnapshot كاملاً عند logout (user=null) ─
    // قبل الإصلاح: الـprev fallback (`prev.name || prev.email || prev.phone`)
    // كان بيحتفظ بقيم المستخدم السابق حتى بعد ما يسجّل خروج. على جهاز مشترك،
    // المستخدم الجديد كان ممكن يلاقي بيانات المستخدم السابق ظاهره في "حسابي".
    if (!user) {
      setAccountSnapshot({ name: '', email: '', phone: '' });
      return;
    }

    // المستخدم مسجَّل دخول — نملأ القيم من profile/user. بنحط prev.name/email/phone
    // كـfallback تالت بس (بعد user data) عشان لو الـprofile لسه ما اتحملش من
    // Firestore، ميمسحش القيم اللي المستخدم لسه ضايفها يدوياً في الجلسه دي.
    const fallbackEmail = (profile?.email || user?.email || '').trim().toLowerCase();
    const emailLocalPart = fallbackEmail ? fallbackEmail.split('@')[0] : '';
    setAccountSnapshot((prev) => ({
      name: (profile?.name || user?.displayName || prev.name || emailLocalPart || '').trim(),
      email: (profile?.email || user?.email || prev.email || '').trim().toLowerCase(),
      phone: (profile?.phone || prev.phone || '').trim(),
    }));
  }, [user, profile?.email, profile?.name, profile?.phone, user?.displayName, user?.email]);

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

  // استكمال خطوات الحجز بعد تسجيل الدخول. لو الطبيب عنده فرع واحد بنروح للفورم
  // مباشرة، ولو عنده أكتر من فرع بنفتح المريض على مودال اختيار الفرع.
  const continueBookingFlow = (doctorId?: string) => {
    const targetDoctorId = doctorId || authPromptDoctorId;
    closeAuthPrompt();
    if (!targetDoctorId) return;

    const targetDoctor = ads.find((ad) => ad.doctorId === targetDoctorId);
    const branches = targetDoctor ? getAdBranches(targetDoctor) : [];

    if (branches.length > 1) {
      // فروع متعددة → مودال الاختيار يفتح؛ اللي بعد كده بيكمّل goToBookingFormWithBranch.
      setBranchPickerDoctorId(targetDoctorId);
      return;
    }
    // فرع واحد (أو طبيب قديم بدون branches) → روحلة الفورم على طول.
    navigate(buildSiteBookingUrl(targetDoctorId));
  };

  // Auto-resume الحجز بعد الرجوع من signInWithRedirect.
  // لو الـpage تـreload بسبب popup-blocked → redirect، الـin-memory state ضاع
  // لكن الـintent محفوظ في sessionStorage. لما user يتحدد (auth جاهز)، نلتقط
  // الـintent ونكمل الحجز تلقائياً بدون تدخل من المريض.
  useEffect(() => {
    if (!user) return;
    let pendingDoctorId: string | null = null;
    try { pendingDoctorId = sessionStorage.getItem(PENDING_BOOKING_INTENT_KEY); }
    catch { /* تجاهل: storage مغلق */ }
    if (!pendingDoctorId) return;

    try { sessionStorage.removeItem(PENDING_BOOKING_INTENT_KEY); } catch { /* تجاهل */ }
    continueBookingFlow(pendingDoctorId);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- continueBookingFlow معرَّفه
  // داخل الـcomponent ومش memoized. الـlogic معتمد فقط على user يتحدد بعد الـredirect.
  }, [user]);

  const handlePublicGoogleLogin = async () => {
    setAuthError('');
    setAuthInfo('');
    setAuthWorking(true);

    // حفظ doctor intent قبل signInWithGoogle عشان لو حصل redirect fallback
    // (popup blocked) الصفحه هتـreload وكل الـin-memory state هيضيع. الـmount
    // effect أدناه بيلتقط الـintent بعد الرجوع ويكمّل الحجز تلقائياً.
    if (authPromptDoctorId) {
      try { sessionStorage.setItem(PENDING_BOOKING_INTENT_KEY, authPromptDoctorId); }
      catch { /* تجاهل: storage مغلق */ }
    }

    try {
      const credential = await signInWithGoogle('public');
      const email = (credential.user.email || '').trim().toLowerCase();
      await upsertPublicAccountProfile(credential.user, email);
      setPublicAccountVerified(true);
      // popup نجح — نمسح الـintent ونكمل في نفس الـsession (الـmount effect مش هيـtrigger)
      try { sessionStorage.removeItem(PENDING_BOOKING_INTENT_KEY); } catch { /* تجاهل */ }
      continueBookingFlow();
    } catch (err: any) {
      // المستخدم لغى الـpopup أو حصل خطأ — نمسح الـintent عشان ميـauto-resume غلط
      try { sessionStorage.removeItem(PENDING_BOOKING_INTENT_KEY); } catch { /* تجاهل */ }
      setAuthError(err?.message || 'تعذر تسجيل الدخول عبر Google.');
    } finally {
      setAuthWorking(false);
    }
  };

  const goToPublicBookingForm = (doctorId: string) => {
    if (!doctorId) return;
    const currentUser = auth.currentUser || user;
    const hasVerifiedEmail = Boolean(
      currentUser &&
      !currentUser.isAnonymous &&
      currentUser.email &&
      (currentUser.emailVerified || publicAccountVerified)
    );

    // المريض لازم يكون مسجّل دخول قبل الحجز — لو لأ بنفتحله المودال،
    // وبعد الـlogin بنرجع لـcontinueBookingFlow اللي بيقرّر فرع/مباشر.
    if (!hasVerifiedEmail) {
      openAuthPrompt(doctorId);
      return;
    }

    continueBookingFlow(doctorId);
  };

  // المريض اختار فرع من المودال → نقفل المودال ونروح للفورم محدّداً الفرع مسبقاً.
  const selectBranchAndGoToBooking = (branchId: string) => {
    const targetDoctorId = branchPickerDoctorId;
    setBranchPickerDoctorId('');
    if (targetDoctorId && branchId) {
      navigate(buildSiteBookingUrl(targetDoctorId, branchId));
    }
  };

  const closeBranchPicker = () => setBranchPickerDoctorId('');

  // فتح/قفل المودال بنغيّر الـURL بس — الـeffect فوق هو اللي بيحدّث selectedDoctorId.
  const openDoctorModal = (doctorId: string) => {
    const doctor = ads.find((ad) => ad.doctorId === doctorId);
    if (!doctor) return;
    const slug = doctor.publicSlug || generateDoctorSlug(doctor);
    setSearchParams({ doctor: slug });
  };

  const closeDoctorModal = () => {
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
  const accountEmail = (activePublicUser?.email || accountSnapshot.email || '').trim().toLowerCase();
  // الاسم: snapshot ← displayName من جوجل ← الجزء قبل @ في الإيميل ← "مستخدم".
  // ده بيخلي السايد بار يعرض اسم معقول دايماً بدل "مستخدم عام".
  const emailLocalForName = accountEmail ? accountEmail.split('@')[0] : '';
  const accountName = (
    accountSnapshot.name ||
    activePublicUser?.displayName ||
    emailLocalForName ||
    ''
  ).trim() || 'مستخدم';
  const accountPhone = (accountSnapshot.phone || '').trim();
  // الضيف مش حساب مؤقّت (غير مسجّل أصلاً) — الـtemporary بيوصف الـanonymous Firebase session.
  const isTemporaryPublicAccount = Boolean(activePublicUser?.isAnonymous);
  const isPublicEmailVerified = Boolean(
    activePublicUser &&
    !activePublicUser.isAnonymous &&
    activePublicUser.email &&
    (activePublicUser.emailVerified || publicAccountVerified)
  );

  // حفظ الاسم/التليفون من بانل "حسابي". بنحفظ في users/{uid}.publicProfile.
  // المستخدم لازم يكون مسجّل دخول (مش ضيف) عشان يقدر يحفظ — لو مش مسجّل، بنرجع
  // رسالة خطأ بدل ما نفتح Firestore call فاشلة.
  const saveAccountProfile = async (nextName: string, nextPhone: string): Promise<boolean> => {
    setAccountSaveError('');
    const currentUser = auth.currentUser || user;
    if (!currentUser?.uid) {
      setAccountSaveError('سجّل دخول أولاً عشان نقدر نحفظ بياناتك.');
      return false;
    }

    const trimmedName = nextName.trim();
    const trimmedPhone = nextPhone.trim();
    setAccountSaving(true);
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          authRole: 'public',
          publicProfile: {
            name: trimmedName,
            email: accountEmail,
            phone: trimmedPhone,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      // نحدّث الـsnapshot المحلّي عشان السايد بار يعكس التغيير فوراً
      setAccountSnapshot((prev) => ({
        ...prev,
        name: trimmedName,
        phone: trimmedPhone,
        email: accountEmail,
      }));
      return true;
    } catch (err: any) {
      setAccountSaveError(err?.message || 'تعذر حفظ البيانات، جرّب تاني.');
      return false;
    } finally {
      setAccountSaving(false);
    }
  };

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
      // dev/staging: مفيش دومين طبيب منفصل، لكن لازم نخلي الـtab الجديد
      // يبقى مستقل تمامًا عن تطبيق الجمهور (sessionStorage مفصول، الـapp بيـreload
      // كأنه تطبيق مختلف). ?hostMode=clinic = الـtab الجديد يبدأ بـclinic flavor
      // صراحه فالـtitle/manifest يطابقوا تطبيق الطبيب من أول لحظه.
      const url = new URL('/signup/doctor', window.location.origin);
      url.searchParams.set('hostMode', 'clinic');
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    }
  };

  const handleContactWhatsApp = () => {
    const phone = '01092805293';
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
  // الطبيب اللي اتفتحله مودال اختيار الفرع — بنحسب اسمه وفروعه للـUI.
  const branchPickerDoctor = useMemo(
    () => (branchPickerDoctorId ? ads.find((ad) => ad.doctorId === branchPickerDoctorId) || null : null),
    [ads, branchPickerDoctorId]
  );
  const branchPickerBranches = useMemo(
    () => (branchPickerDoctor ? getAdBranches(branchPickerDoctor) : []),
    [branchPickerDoctor]
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
    accountPhone,
    accountSaving,
    accountSaveError,
    saveAccountProfile,
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
    // مودال اختيار الفرع
    branchPickerDoctor,
    branchPickerBranches,
    selectBranchAndGoToBooking,
    closeBranchPicker,
  };
};


