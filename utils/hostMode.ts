// ─────────────────────────────────────────────────────────────────────────────
// تحديد "وضع" التطبيق حسب الدومين (Host Mode)
// ─────────────────────────────────────────────────────────────────────────────
// التطبيق بيخدم دومينين من نفس الـbuild:
//   • drhypermed.com / www.drhypermed.com → وضع المريض (Patient Mode)
//   • clinic.drhypermed.com              → وضع الطاقم الطبّي (Clinic Mode)
//
// وظيفه الملف: نعرّف الـhostname الحالي ونردّ الوضع المناسب عشان الصفحات
// تعرف تعرض إيه (landing مريض vs login طبيب) وتخفي إيه.
//
// في الـdev (localhost) بنفتح وضع "both" عشان نختبر السيناريوهين.
// لو حابب تختبر وضع معيّن في الـdev، تقدر تستخدم:
//   ?hostMode=patient  أو  ?hostMode=clinic  في الـURL
// أو تحط في localStorage: `__hostMode_override` = 'patient' / 'clinic'.
// ─────────────────────────────────────────────────────────────────────────────

export type HostMode = 'patient' | 'clinic' | 'both';

/** الدومينات اللي بتعتبر "وضع مريض" */
const PATIENT_HOSTS = new Set([
  'drhypermed.com',
  'www.drhypermed.com',
]);

/** الدومينات اللي بتعتبر "وضع طاقم طبّي" */
const CLINIC_HOSTS = new Set([
  'clinic.drhypermed.com',
]);

/** دومينات التجربه — Firebase Hosting الافتراضي والـstaging */
const FIREBASE_DEFAULT_HOSTS_SUFFIX = [
  '.web.app',
  '.firebaseapp.com',
];

/** فحص لو الـhostname دا localhost أو IP لتطوير محلّي */
const isLocalHost = (hostname: string): boolean => {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );
};

/** قراءه override من URL param أو localStorage أو env var — للتجربه في الـdev */
const readDevOverride = (): HostMode | null => {
  // 1) env variable من scripts — ده بيتحدد وقت تشغيل `npm run dev:public`
  //    أو `npm run dev:clinic`، فبيخلي كل بورت يفتح النسخه الصح من أول ثانيه
  //    من غير ما المستخدم يحط أي حاجه في الـURL.
  //    بيشتغل حتى لو window مش متاح (build time).
  try {
    const envMode = (import.meta as any)?.env?.VITE_DEV_HOST_MODE;
    if (envMode === 'patient' || envMode === 'clinic' || envMode === 'both') {
      return envMode;
    }
  } catch {
    /* تجاهل — ممكن import.meta.env مش متاح في بعض السياقات */
  }

  if (typeof window === 'undefined') return null;

  try {
    // 2) URL param: ?hostMode=patient — للتبديل السريع بدون إعادة تشغيل
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('hostMode');
    if (fromUrl === 'patient' || fromUrl === 'clinic' || fromUrl === 'both') {
      return fromUrl;
    }

    // 3) localStorage override (يفضل لحدّ ما تمسحه)
    const fromStorage = window.localStorage.getItem('__hostMode_override');
    if (fromStorage === 'patient' || fromStorage === 'clinic' || fromStorage === 'both') {
      return fromStorage;
    }
  } catch {
    /* تجاهل — ممكن يكون storage غير متاح */
  }

  return null;
};

/**
 * تحديد وضع التطبيق الحالي حسب الدومين.
 * - في الـproduction: بيقرأ من الـhostname
 * - في الـdev/staging: بيرجع 'both' (عشان نقدر نختبر السيناريوهين)
 * - مع إمكانيه override يدوي للتجربه
 */
export const getHostMode = (): HostMode => {
  // دعم SSR/build time — مفيش window
  if (typeof window === 'undefined') return 'both';

  // الأولويه الأولى: override من الـdev
  const override = readDevOverride();
  if (override) return override;

  const hostname = (window.location.hostname || '').toLowerCase();

  // localhost أو تطوير = both (نعرض كل الخيارات للتجربه)
  if (isLocalHost(hostname)) return 'both';

  // دومينات Firebase الافتراضيه (staging) = both
  if (FIREBASE_DEFAULT_HOSTS_SUFFIX.some((suffix) => hostname.endsWith(suffix))) {
    return 'both';
  }

  // دومين العياده
  if (CLINIC_HOSTS.has(hostname)) return 'clinic';

  // دومين المريض (أو أي دومين root غير معروف = نفترضه للمريض لأنه العامّ)
  if (PATIENT_HOSTS.has(hostname)) return 'patient';

  // fallback: أي دومين تاني = مريض (الأغلبيّه)
  return 'patient';
};

/** اختصار للقراءه الواضحه في الكود */
export const isPatientHost = (): boolean => {
  const mode = getHostMode();
  return mode === 'patient' || mode === 'both';
};

export const isClinicHost = (): boolean => {
  const mode = getHostMode();
  return mode === 'clinic' || mode === 'both';
};
