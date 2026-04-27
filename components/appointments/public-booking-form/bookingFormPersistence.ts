// ─────────────────────────────────────────────────────────────────────────────
// حفظ بيانات الحجز العام عبر redirect (Public Booking Form Persistence)
// ─────────────────────────────────────────────────────────────────────────────
// المشكله: لما المريض يضغط "حجز" بدون ما يكون مسجَّل دخول، الـapp بتطلب Google
// login. لو الـpopup فشل (Safari/iOS/PWA) بيـfallback لـsignInWithRedirect،
// والـpage بتتعاد تحميلها فالـstate بتاع الفورم (الـslot المختار + الاسم +
// الموبايل + إلخ) بيضيع. المريض يلاقي نفسه بعد الرجوع من Google والفورم فاضي.
//
// الحل: قبل ما نـtrigger signInGoogle، نحفظ الـbooking state في sessionStorage.
// بعد ما المريض يرجع من Google، نسترجع البيانات ونكمل الحجز تلقائياً.
//
// حماية: الـsave مرتبط بـcontext (slug + userIdRouteParam). لو المريض اتنقل لرابط
// حجز تاني بعد الـredirect، الـpending booking القديمه ميـauto-fill-ش.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dh_public_booking_pending';
const TTL_MS = 30 * 60 * 1000; // 30 دقيقه

/** الـcontext اللي بيحدد رابط الحجز — لازم يطابق الـURL الحالي للاسترجاع. */
export type PendingBookingContext = {
  slug: string;
  userIdRouteParam: string;
};

/**
 * كل القيم اللي المريض ملاها قبل ضغط "حجز".
 * مش بنحفظ user data من Google (الإيميل/الاسم) لأنها بترجع تلقائياً بعد signin.
 */
export type PendingBookingFormValues = {
  patientName: string;
  age: string;
  phone: string;
  gender: string;
  pregnant: boolean | null;
  breastfeeding: boolean | null;
  visitReason: string;
  isFirstVisit: boolean | null;
  appointmentType: string;
  selectedConsultationCandidateId: string;
  selectedBranchId: string;
};

export type PendingBooking = {
  context: PendingBookingContext;
  formValues: PendingBookingFormValues;
  pendingSlotId: string;
  savedAt: number;
};

/** حفظ الـbooking state قبل ما نـtrigger Google signin (popup/redirect). */
export const savePendingBooking = (
  context: PendingBookingContext,
  formValues: PendingBookingFormValues,
  pendingSlotId: string,
): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const payload: PendingBooking = {
      context,
      formValues,
      pendingSlotId,
      savedAt: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};

/**
 * استرجاع الـbooking state بعد الرجوع من signInWithRedirect.
 * لو currentContext اتمرَّر، بنرجع null لو الـsaved booking لـcontext مختلف
 * (المريض اتنقل لرابط حجز تاني) — وبنمسحه عشان ميـauto-fill-ش غلط.
 */
export const loadPendingBooking = (
  currentContext?: PendingBookingContext,
): PendingBooking | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingBooking;

    // فحص الصلاحيه (TTL)
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // فحص الـcontext — الـbooking المحفوظ لازم يكون لنفس الدكتور
    if (currentContext) {
      const sameContext =
        parsed.context.slug === currentContext.slug &&
        parsed.context.userIdRouteParam === currentContext.userIdRouteParam;
      if (!sameContext) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
    }

    // فحص بسيط للحقول الأساسيه — لو ناقص، نرجع null
    if (
      !parsed.context ||
      !parsed.formValues ||
      typeof parsed.pendingSlotId !== 'string'
    ) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* تجاهل */ }
    return null;
  }
};

/** مسح الـbooking المعلَّق بعد ما الحجز يخلص (نجاح أو فشل نهائي). */
export const clearPendingBooking = (): void => {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* تجاهل */ }
};
