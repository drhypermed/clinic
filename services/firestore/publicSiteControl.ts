/**
 * خدمة التحكم في واجهة الجمهور (Public Site Control Service)
 * ───────────────────────────────────────────────────────────────────
 * الـdoc الواحد: `settings/publicSiteControl` فيه إعدادات حجب/إظهار
 * صفحة المرضى على www.drhypermed.com.
 *
 * - enabled=true (الافتراضي) → الموقع يفتح عادي
 * - enabled=false → بيظهر صفحة "Maintenance/Block" بشعار التطبيق + رسالة
 *   مخصّصة من الأدمن (مفيدة وقت الصيانة، أو مشاكل في السيرفر، إلخ).
 *
 * الـrules: قراءة عامة (الموقع لازم يقراها قبل تسجيل الدخول)، كتابة للأدمن فقط.
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst } from './cacheFirst';

export interface PublicSiteControl {
  /** true = الموقع شغال للجميع، false = محجوب (إلا للإيميلات في allowedEmails) */
  enabled: boolean;
  /** عنوان الرسالة على شاشة الحجب (مثلاً: "صيانة مؤقتة") */
  blockTitle: string;
  /** نص الرسالة الموحّد (HTML بسيط مدعوم — newlines + bold عبر **) */
  blockMessage: string;
  /** عرض شعار التطبيق فوق الرسالة */
  showLogo: boolean;
  /**
   * 🆕 (2026-05) قائمة الإيميلات المسموح لها الوصول حتى لما enabled=false.
   * - فاضي + enabled=false = الموقع محجوب لكل الناس
   * - فيها إيميلات + enabled=false = الكل محجوب إلا أصحاب الإيميلات دي (لازم
   *   يكونوا مسجّلين دخول بالإيميل ده)
   * - enabled=true = الموقع مفتوح للجميع (القائمة دي بتتجاهل)
   * كل إيميل بيتخزّن lowercase trimmed عشان المقارنة آمنة.
   */
  allowedEmails: string[];
  /** آخر تعديل (ISO) */
  updatedAt?: string;
  /** البريد بتاع الأدمن اللي عدّل */
  updatedBy?: string;
}

const PUBLIC_SITE_CONTROL_DOC_ID = 'publicSiteControl';

/** الافتراضي: الموقع شغال + رسالة موحّدة جاهزة لو الأدمن قفل */
export const DEFAULT_PUBLIC_SITE_CONTROL: PublicSiteControl = {
  enabled: true,
  blockTitle: 'الموقع تحت الصيانة',
  blockMessage:
    'نعمل حالياً على تحسين تجربتك. سنعود قريباً بإذن الله.\n\nنشكر صبركم وتفهمكم.',
  showLogo: true,
  allowedEmails: [],
};

/** Helper: تطبيع إيميل واحد للمقارنة (lowercase + trim). */
export const normalizeAllowedEmail = (email: string): string =>
  String(email || '').trim().toLowerCase();

/** Helper: هل الإيميل ده في القائمة المسموحة؟ */
export const isEmailAllowed = (
  email: string | null | undefined,
  allowedEmails: string[],
): boolean => {
  if (!email) return false;
  const normalized = normalizeAllowedEmail(email);
  if (!normalized) return false;
  return allowedEmails.some((allowed) => normalizeAllowedEmail(allowed) === normalized);
};

const docRef = () => doc(db, 'settings', PUBLIC_SITE_CONTROL_DOC_ID);

/**
 * قراءة الإعدادات من Firestore (cache-first عشان التحميل فوري للزائر).
 * لو الـdoc مش موجود، نرجّع الافتراضيات (enabled=true) — الموقع يفتح عادي.
 */
export const getPublicSiteControl = async (): Promise<PublicSiteControl> => {
  try {
    const snap = await getDocCacheFirst(docRef());
    if (!snap.exists()) return DEFAULT_PUBLIC_SITE_CONTROL;
    return mergeWithDefaults(snap.data() as Partial<PublicSiteControl>);
  } catch (error) {
    // أي فشل (شبكة/صلاحيات) → الموقع يفتح عادي (fail-open) عشان مفيش حاجة تكسر
    // تجربة الزوار لو حصل خطأ نادر.
    console.warn('[publicSiteControl] read failed, defaulting to enabled:', error);
    return DEFAULT_PUBLIC_SITE_CONTROL;
  }
};

/**
 * اشتراك لحظي على إعدادات الموقع — لما الأدمن يقفل/يفتح، الصفحة بتتحدّث فوراً
 * بدون reload. cb بياخد الإعدادات الحالية أو الافتراضيات لو الـdoc مش موجود.
 *
 * @returns unsubscribe function
 */
export const subscribeToPublicSiteControl = (
  cb: (settings: PublicSiteControl) => void,
): (() => void) => {
  return onSnapshot(
    docRef(),
    (snap) => {
      if (!snap.exists()) {
        cb(DEFAULT_PUBLIC_SITE_CONTROL);
        return;
      }
      cb(mergeWithDefaults(snap.data() as Partial<PublicSiteControl>));
    },
    (err) => {
      console.warn('[publicSiteControl] subscription error, defaulting to enabled:', err);
      cb(DEFAULT_PUBLIC_SITE_CONTROL);
    },
  );
};

/** الكتابة (للأدمن فقط — الـrules بترفض غير الأدمن). */
export const savePublicSiteControl = async (
  payload: Partial<PublicSiteControl>,
  adminEmail?: string,
): Promise<void> => {
  const merged = mergeWithDefaults(payload);
  await setDoc(
    docRef(),
    {
      ...merged,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail || '',
    },
    { merge: true },
  );
};

/** ضمان كل الحقول موجودة بقيم صالحة قبل ما نرجّعها للـUI. */
const mergeWithDefaults = (data: Partial<PublicSiteControl>): PublicSiteControl => ({
  enabled: data.enabled !== false, // أي قيمة مش false = شغال (defensive)
  blockTitle: typeof data.blockTitle === 'string' && data.blockTitle.trim()
    ? data.blockTitle.trim().slice(0, 200)
    : DEFAULT_PUBLIC_SITE_CONTROL.blockTitle,
  blockMessage: typeof data.blockMessage === 'string' && data.blockMessage.trim()
    ? data.blockMessage.trim().slice(0, 2000)
    : DEFAULT_PUBLIC_SITE_CONTROL.blockMessage,
  showLogo: data.showLogo !== false,
  // الإيميلات: نطبّعها (lowercase + trim) ونـdedupe + سقف أمني 200 إيميل max.
  allowedEmails: Array.isArray(data.allowedEmails)
    ? Array.from(
        new Set(
          data.allowedEmails
            .map((e) => normalizeAllowedEmail(typeof e === 'string' ? e : ''))
            .filter((e) => e.includes('@')),
        ),
      ).slice(0, 200)
    : [],
  updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
});
