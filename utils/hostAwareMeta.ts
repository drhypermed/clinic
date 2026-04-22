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
const PATIENT_ORIGIN = 'https://drhypermed.com';
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
  description: 'نظام متكامل لإداره العياده: روشته إلكترونيّه احترافيّه، أكتر من 10,000 دواء بجرعاتهم وتفاعلاتهم، حجز مواعيد اون لاين، سكرتاريه مربوطه، ملفات مرضى، تقارير ماليّه، وإداره فروع — كل ده في مكان واحد.',
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
 * يطبّق الـmeta tags حسب الـhost والـpathname.
 * لو مرّرت pathname = undefined بياخد الـwindow.location.pathname الحالي.
 */
export const applyHostAwareMeta = (pathname?: string): void => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const mode = getHostMode();

  // في الـdev (both): مفيش تعديل — نسيب الـindex.html زي ما هو
  if (mode === 'both') return;

  const currentPath = pathname ?? window.location.pathname;
  const meta = pickMeta(mode, currentPath);
  const origin = mode === 'clinic' ? CLINIC_ORIGIN : PATIENT_ORIGIN;
  // الـcanonical = origin + الـpathname الحالي (بدون query أو hash).
  // للصفحات الخاصّه (noindex) الـcanonical مش مهم — جوجل مش هيفهرسها أصلاً.
  const canonical = `${origin}${normalizePathname(currentPath)}`;

  // تحديث الـtitle (تبويب المتصفح + Google)
  document.title = meta.title;

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

// نصدّر الـhelper عشان نستخدمه لو احتجنا نفحص من برّا (مثلاً في sitemap JS)
export { isClinicPublicPath };
