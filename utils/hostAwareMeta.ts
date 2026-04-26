// ─────────────────────────────────────────────────────────────────────────────
// applyHostAwareMeta — دالّه نقيّه (بدون React) لتعديل الـmeta tags في الـDOM
// ─────────────────────────────────────────────────────────────────────────────
// بتتنادي في مكانين:
//   1) index.tsx قبل React ما يعمل mount — عشان Googlebot يقرا القيم الصح
//      من أول SSR render (مش الثابته في index.html).
//   2) useHostAwareMeta hook — مع كل navigation داخلي لتحديث الـcanonical.
//
// الـindex.html واحد بيخدم الدومينين (drhypermed.com + clinic.drhypermed.com)،
// فلازم نعدّل على الـruntime حسب الـhostname الفعلي + الـpathname الحالي.
//
// ── استراتيجيّه الـSEO ──
// كل دومين عنده صفحات عامّه (بتتفهرس) وصفحات خاصّه (مخفيّه):
//   • drhypermed.com:
//       - عام: /، /public، /dr/:slug
//       - خاص: /login/*، /book-public/* (roboto بيمنعهم)
//   • clinic.drhypermed.com:
//       - عام: /، /user-guide  ← لازم يظهر في جوجل (برنامج عياده، روشته إلكترونيّه)
//       - خاص: /login/*، /home، /app/*، /admin (noindex لكل واحده)
// ─────────────────────────────────────────────────────────────────────────────

import { getHostMode } from './hostMode';

// تثبيت/تحديث meta tag لو موجود، أو إضافتها لو مفيش
const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
  if (typeof document === 'undefined') return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

// تثبيت/تحديث الـcanonical link
const setCanonical = (href: string) => {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

// الـorigin الرسمي لكل دومين
// بنستخدم www.drhypermed.com لأنه الدومين الشغّال فعلاً في Firebase Hosting،
// والدومين بدون www لسه مش مظبوط DNS (Status: Needs setup).
// كده Google هيفهرس النسخه الشغّاله بس ومش هيحصل تضارب canonical.
const PATIENT_ORIGIN = 'https://www.drhypermed.com';
const CLINIC_ORIGIN = 'https://clinic.drhypermed.com';

// ── meta للمرضى (drhypermed.com) ──
// اللغه مصريّه عاميّه عشان يطابق اللي المريض بيكتبه في جوجل.
// ملحوظه: ممنوع ادّعاءات بأرقام (عدد أطباء/محافظات) — التطبيق pre-launch
// وجوجل بيعاقب على الـmisleading claims. نتكلّم عن الفايده مش عن أرقام.
const PATIENT_META = {
  title: 'Dr Hyper — احجز دكتور أون لاين في مصر',
  description: 'دوّر على دكتور قريب منّك في مصر، شوف مواعيد العيادة وتقييمات المرضى، واحجز ميعادك من الموبايل بدون اتصالات. حجزك كـمريض مجاني.',
  robots: 'index, follow',
} as const;

// ── meta للدكاتره (صفحه clinic.drhypermed.com/) ──
// كلمات مفتاحيّه مستهدفه: "برنامج عياده"، "روشته إلكترونيّه"، "إداره عيادات"، "نظام عياده".
const CLINIC_LANDING_META = {
  title: 'Dr Hyper Clinic | برنامج إداره العيادات والروشته الإلكترونيّه للأطباء في مصر',
  description: 'نظام متكامل لإداره العياده: روشته إلكترونيّه احترافيّه، أكتر من 10,000 دواء بأسعارهم وجرعاتهم وتفاعلاتهم، حجز مواعيد أون لاين، سكرتاريه مربوطه، ملفات مرضى، تقارير ماليّه، وإداره فروع — كل ده في مكان واحد.',
  robots: 'index, follow',
} as const;

// ── meta لدليل المستخدم (clinic.drhypermed.com/user-guide) ──
// صفحه تعليميّه للدكاتره = keywords "ازاي استخدم برنامج عياده"، "شرح Dr Hyper".
const CLINIC_USER_GUIDE_META = {
  title: 'دليل إستخدام Dr Hyper Clinic | شرح كامل للدكاتره والسكرتاريه',
  description: 'تعلّم ازاي تستخدم Dr Hyper Clinic خطوه بخطوه — الروشته الإلكترونيّه، حجز المواعيد، إداره السكرتاريه، التقارير الماليّه، وكل أدوات البرنامج في دليل عملي بالصور.',
  robots: 'index, follow',
} as const;

// ── meta للصفحات الداخليّه في clinic (مخفيّه من جوجل) ──
// الـ/home و /app و /admin مفيش داعي جوجل يشوفها — ده تطبيق خاص.
const CLINIC_PRIVATE_META = {
  title: 'Dr Hyper Clinic — بوابه الطاقم الطبّي',
  description: 'بوابه الأطباء والسكرتاريه لنظام إداره عياده Dr Hyper.',
  robots: 'noindex, nofollow',
} as const;

// تنضيف الـpathname — نشيل أي trailing slash مكرّر ونسيب slash واحد للجذر
const normalizePathname = (pathname: string): string => {
  if (!pathname || pathname === '/') return '/';
  // نشيل الـtrailing slash لو في أكتر من حرف (مثلاً /public/ → /public)
  return pathname.replace(/\/+$/, '') || '/';
};

// فاصل لصفحات clinic العامّه (indexable) عن الخاصّه (noindex)
const isClinicPublicPath = (pathname: string): boolean => {
  const p = normalizePathname(pathname);
  return p === '/' || p === '/user-guide';
};

/**
 * بيختار الـmeta الصح حسب الـmode والـpathname.
 */
const pickMeta = (mode: 'patient' | 'clinic', pathname: string) => {
  if (mode === 'patient') {
    return PATIENT_META;
  }
  // clinic mode — نبص على الـpath
  const p = normalizePathname(pathname);
  if (p === '/') return CLINIC_LANDING_META;
  if (p === '/user-guide') return CLINIC_USER_GUIDE_META;
  return CLINIC_PRIVATE_META;
};

/**
 * المسارات اللي بتخدم الجمهور بس — في dev بنستخدمها لاستنتاج الـeffective flavor
 * (لأن mode='both' بيخدم الاتنين من نفس الـport، فالـpathname هو اللي بيحدد).
 */
const isPatientPath = (pathname: string): boolean => {
  const p = (pathname || '').toLowerCase();
  return p === '/public' || p.startsWith('/public/') ||
         p === '/login/public' ||
         p.startsWith('/book-public/');
};

/**
 * في dev (both): بنستنتج الـflavor من الـpathname/override بدل ما نسيب الـmeta
 * متضارب (عنوان جمهور + واجهة طبيب). في prod: بنستخدم الـmode مباشره.
 */
const resolveEffectiveFlavor = (mode: 'patient' | 'clinic' | 'both', pathname: string): 'patient' | 'clinic' => {
  if (mode !== 'both') return mode;
  // dev mode — اقرأ override من URL/storage الأول
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search || '');
      const fromUrl = params.get('hostMode');
      if (fromUrl === 'patient' || fromUrl === 'clinic') return fromUrl;
      const fromStorage = window.localStorage.getItem('__hostMode_override');
      if (fromStorage === 'patient' || fromStorage === 'clinic') return fromStorage;
    }
  } catch { /* تجاهل: storage مقفول */ }
  // الافتراضي: clinic، إلا إذا الـpath من مسارات الجمهور
  return isPatientPath(pathname) ? 'patient' : 'clinic';
};

/** تحديث الـmanifest link + apple title + theme-color حسب الـflavor (dev/prod) */
const applyFlavorPwaIdentity = (flavor: 'patient' | 'clinic'): void => {
  if (typeof document === 'undefined') return;
  const manifestUrl = flavor === 'clinic' ? '/manifest-clinic.webmanifest' : '/manifest-patient.webmanifest';
  const appTitle = flavor === 'clinic' ? 'DrHyperMed' : 'DrHyperPublic';
  const themeColor = flavor === 'clinic' ? '#2563eb' : '#0d9488';

  // iOS apple title (بيظهر اسم التطبيق لما المستخدم يضيفه للشاشه)
  const appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  if (appleTitle) appleTitle.setAttribute('content', appTitle);

  // theme-color (لون شريط البراوزر العلوي)
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', themeColor);

  // PWA manifest — نبدّل الـlink لو الـhref اختلف (تجنّب re-trigger مكلّف)
  const links = document.querySelectorAll('link[rel="manifest"]');
  if (links.length === 0) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);
  } else {
    links.forEach((el, idx) => {
      // نسيب واحد بس بالـURL الصح، نشيل الباقي
      if (idx === 0) {
        if ((el as HTMLLinkElement).href.endsWith(manifestUrl)) return;
        (el as HTMLLinkElement).href = manifestUrl;
      } else {
        el.parentNode?.removeChild(el);
      }
    });
  }
};

/**
 * يطبّق الـmeta tags + هويه التطبيق (manifest/title/theme) حسب الـhost والـpathname.
 * لو مرّرت pathname = undefined بياخد الـwindow.location.pathname الحالي.
 *
 * في prod: الـflavor = الـhostname (clinic.drhypermed.com vs drhypermed.com).
 * في dev (both): الـflavor = الـpathname (/public/* = patient، باقي = clinic).
 * كده الـtab title والـPWA install دايماً بيطابقوا الواجهه المعروضه.
 */
export const applyHostAwareMeta = (pathname?: string): void => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const mode = getHostMode();
  const currentPath = pathname ?? window.location.pathname;
  const flavor = resolveEffectiveFlavor(mode, currentPath);

  // طبّق هويه الـPWA (manifest/title/theme) — في dev وprod
  applyFlavorPwaIdentity(flavor);

  // في dev: لا نلمس الـcanonical/robots/OG لأنها للـSEO على prod فقط، لكن
  // لازم نحدّث الـtitle عشان التبويب يبان صح للمطوّر.
  const meta = pickMeta(flavor, currentPath);
  document.title = meta.title;

  if (mode === 'both') return; // dev — وقفنا هنا، الباقي للـSEO

  const origin = flavor === 'clinic' ? CLINIC_ORIGIN : PATIENT_ORIGIN;
  // الـcanonical = origin + الـpathname الحالي (بدون query أو hash).
  // للصفحات الخاصّه (noindex) الـcanonical مش مهم — جوجل مش هيفهرسها أصلاً.
  const canonical = `${origin}${normalizePathname(currentPath)}`;

  // الوصف اللي بيظهر تحت العنوان في نتايج جوجل
  setMetaTag('name', 'description', meta.description);

  // التحكّم في فهرسه جوجل — حسب الـmeta المختاره
  setMetaTag('name', 'robots', meta.robots);

  // الـcanonical = الدومين الرسمي + الـpathname
  setCanonical(canonical);

  // Open Graph (للمشاركه في السوشيال)
  setMetaTag('property', 'og:title', meta.title);
  setMetaTag('property', 'og:description', meta.description);
  setMetaTag('property', 'og:url', canonical);

  // Twitter Card
  setMetaTag('name', 'twitter:title', meta.title);
  setMetaTag('name', 'twitter:description', meta.description);
};
