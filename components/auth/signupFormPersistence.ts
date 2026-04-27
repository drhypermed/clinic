// ─────────────────────────────────────────────────────────────────────────────
// حفظ بيانات الـsignup عبر redirect (Signup Form Persistence)
// ─────────────────────────────────────────────────────────────────────────────
// المشكله: على Safari/iOS وفي الـPWA المثبَّت، signInWithPopup بيتمنع، فبنحتاج
// نـfallback لـsignInWithRedirect. لكن الـredirect بيـreload الصفحه بالكامل،
// فالـform اللي الطبيب ملاها (الاسم، التخصص، الواتساب، صورة الترخيص) بتضيع.
//
// الحل: قبل ما نـtrigger الـredirect، نحفظ الـform في sessionStorage. ولما
// الطبيب يرجع بعد تسجيل الدخول بنجاح، نسترجع الـform ونكمل العمليه تلقائياً.
//
// ملاحظات تقنيه مهمه:
//   • sessionStorage بيتحفظ عبر redirect لو نفس الـtab (مهم للأمان)
//   • الصوره File object → بنحوّلها base64 (عبر FileReader.readAsDataURL)
//   • base64 = ~1.33× حجم الـbinary → صوره 5MB ≈ 6.7MB. حد sessionStorage
//     عاده ~5MB. فبنرفض الصور اللي data URL بتاعتها > 4.5MB
//   • TTL 30 دقيقه — لو الطبيب اتأخر أو قفل الـtab، البيانات بتتنظّف تلقائياً
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dh_signup_pending_form';
const REDIRECT_FLAG_KEY = 'dh_signup_pending_redirect';
const FORM_TTL_MS = 30 * 60 * 1000;       // 30 دقيقه
const MAX_DATA_URL_BYTES = 4_500_000;     // ~4.5MB — هامش أمان تحت حد sessionStorage

/**
 * البيانات اللي بنحفظها قبل الـredirect.
 * الصوره مخزّنه كـdata URL (base64) عشان sessionStorage بياخد strings فقط.
 */
export type SignupFormSnapshot = {
  doctorName: string;
  specialty: string;
  whatsapp: string;
  licenseImageDataUrl: string;
  licenseImageName: string;
  savedAt: number;
};

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: 'too-large' | 'storage-error' };

/** تحويل File → Data URL (base64) عشان نقدر نخزّنه في sessionStorage. */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
};

/** تحويل Data URL → File عشان نقدر نرفعها على Storage بعد الاسترجاع. */
export const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
  try {
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
    if (!match) return null;
    const mimeType = match[1] || 'application/octet-stream';
    const base64 = match[2] || '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], filename, { type: mimeType });
  } catch {
    return null;
  }
};

/**
 * حفظ الـform في sessionStorage قبل الـredirect.
 * بيرجع نتيجه واضحه (ok / too-large / storage-error) عشان الـcaller يقدر
 * يقرر يـfallback لرساله بدل الـredirect لو مقدرناش نحفظ.
 */
export const saveSignupForm = (
  snapshot: Omit<SignupFormSnapshot, 'savedAt'>,
): SaveResult => {
  if (typeof window === 'undefined') {
    return { ok: false, reason: 'storage-error' };
  }

  // فحص حجم الـdata URL — لو أكبر من الحد، sessionStorage هيرفض غالباً
  if (snapshot.licenseImageDataUrl.length > MAX_DATA_URL_BYTES) {
    return { ok: false, reason: 'too-large' };
  }

  const payload: SignupFormSnapshot = {
    ...snapshot,
    savedAt: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { ok: true };
  } catch {
    // QuotaExceeded أو سياق مغلق (private browsing بعض المتصفحات)
    return { ok: false, reason: 'storage-error' };
  }
};

/**
 * استرجاع الـform بعد الـredirect.
 * بيرجع null لو:
 *   - مفيش بيانات محفوظه
 *   - البيانات قديمه (TTL > 30 دقيقه)
 *   - JSON تالف
 */
export const loadSignupForm = (): SignupFormSnapshot | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SignupFormSnapshot;

    // فحص الصلاحيه (TTL)
    if (!parsed.savedAt || Date.now() - parsed.savedAt > FORM_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // فحص بسيط للحقول الأساسيه — لو ناقص حاجه، نـreturn null
    if (
      typeof parsed.doctorName !== 'string' ||
      typeof parsed.specialty !== 'string' ||
      typeof parsed.whatsapp !== 'string' ||
      typeof parsed.licenseImageDataUrl !== 'string' ||
      typeof parsed.licenseImageName !== 'string'
    ) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    // JSON تالف أو storage مغلق
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* تجاهل */ }
    return null;
  }
};

/** مسح الـform من sessionStorage بعد ما الـsubmit يخلص (نجاح أو فشل نهائي). */
export const clearSignupForm = (): void => {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* تجاهل */ }
};

/**
 * تفعيل علم "في انتظار redirect" قبل ما نستدعي signInWithRedirect.
 * useEffect عند الـmount بيتحقق منه عشان يعرف لو الطبيب رجع من الـredirect.
 */
export const setSignupRedirectFlag = (): void => {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(REDIRECT_FLAG_KEY, '1'); } catch { /* تجاهل */ }
};

/**
 * قراءة العلم ومسحه في عمليه واحده (consume).
 * بيرجع true لو الطبيب رجع للتو من signInWithRedirect.
 */
export const consumeSignupRedirectFlag = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const value = sessionStorage.getItem(REDIRECT_FLAG_KEY);
    if (value === '1') {
      sessionStorage.removeItem(REDIRECT_FLAG_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
