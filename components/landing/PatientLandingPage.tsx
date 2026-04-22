/**
 * الصفحه التعريفيّه للمرضى (Patient Landing Page)
 * ─────────────────────────────────────────────────────────────────────────────
 * نسخه مرآه (mirror) للـLandingPage الأصليّه اللي هتفضل للأطباء على clinic.drhypermed.com
 *   - نفس الـbuilding blocks: Hero + 13 ميزه + CTA + Footer
 *   - نفس الـanimations (useInView, Counter, A)
 *   - نفس الـstyle والـgradients (sh, fl)
 *   - المحتوى مخصوص للمريض (ابحث، احجز، تقييمات، تذكيرات...)
 *
 * بيتعرض على دومين `drhypermed.com` فقط — الـrouting في AppCoreContent بيوجّه
 * حسب الـhost الحالي (patient vs clinic).
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHideBootSplash } from '../../hooks/useHideBootSplash';
import {
  FaUserGroup,
  FaShieldHalved,
  FaWhatsapp,
  FaUserDoctor,
} from 'react-icons/fa6';
import { BrandLogo } from '../common/BrandLogo';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineStar,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineIdentification,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineBell,
  HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
  HiOutlineArrowRightEndOnRectangle,
} from 'react-icons/hi2';

/* ── Hook صغير: بيعرف الـelement دخل الـviewport ولّا لأ ── */
const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } },
      { threshold }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, visible: v };
};

/* ── عدّاد متحرّك — بيعدّ من 0 للقيمه المستهدفه لمّا الـelement يبان ── */
const Counter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
  const [c, setC] = useState(0);
  const { ref, visible } = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let n = 0;
    const s = Math.max(1, Math.ceil(target / 80));
    const id = setInterval(() => {
      n += s;
      if (n >= target) { setC(target); clearInterval(id); }
      else setC(n);
    }, 18);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={ref}>{c.toLocaleString('ar-EG')}{suffix}</span>;
};

/* ── Animate reveal — fade + slide up لمّا الـelement يبان ── */
const A: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const { ref, visible } = useInView(0.06);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ── 12 ميزه للمريض — بنفس شكل ونمط الـFEATURES في LandingPage الأصليّه ── */
interface Feature { icon: React.ReactNode; title: string; desc: string; color: string }
const PATIENT_FEATURES: Feature[] = [
  {
    icon: <HiOutlineMagnifyingGlass className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'ابحث بالتخصّص',
    desc: 'لاقي دكتورك في أكتر من 30 تخصص — من الأطفال للباطنه والجراحه والنسا والنفسيه وغيرهم.',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: <HiOutlineMapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'ابحث بالموقع',
    desc: 'اختار المحافظه والمدينه — تغطيه 28 محافظه في كل أنحاء مصر لدكاتره قريبين منك.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: <HiOutlineStar className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'تقييمات مرضى حقيقيّه',
    desc: 'اقرا تجارب مرضى زيّك قبل ما تحجز — تقييمات موثّقه بعد الحجز الفعلي مش تقييمات وهميّه.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: <HiOutlineCalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'حجز فوري إلكتروني',
    desc: 'احجز موعدك في دقيقتين — اختار اليوم والوقت بدون اتصال أو انتظار على التليفون.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: <HiOutlineBanknotes className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'أسعار واضحه قبل الحجز',
    desc: 'شوف سعر الكشف والاستشاره والخدمات قبل ما تحجز — مفيش مفاجآت في العياده.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: <HiOutlineIdentification className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'ملف طبيب كامل',
    desc: 'شهادات، سنوات الخبره، الخدمات، ومعرض صور العياده — كل اللي محتاجه تعرفه في صفحه واحده.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: <HiOutlineTag className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'خصومات وعروض خاصّه',
    desc: 'عيادات كتيره بتقدّم عروض حصريّه لمستخدمي Dr Hyper — وفّر فلوس على كل زياره.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: <HiOutlineClock className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'مواعيد عمل الحيّه',
    desc: 'اعرف العياده شغّاله امتى بالظبط — مواعيد كل يوم محدّثه من الدكتور نفسه.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: <FaWhatsapp className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'تواصل مباشر بواتساب',
    desc: 'اتصل أو كلّم العياده على واتساب من التطبيق مباشره — من غير ما تخرج أو تحفظ الرقم.',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: <HiOutlineBell className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'تذكير بالموعد',
    desc: 'هنفكّرك قبل موعدك بساعات — مش هتنسى ومش هتحتار في المواعيد الضروريّه.',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    icon: <HiOutlineClipboardDocumentList className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'حجوزاتي كلها في مكان',
    desc: 'لوحه واحده تشوف فيها كل مواعيدك — اللي فاتت، الجايّه، وتقدر تقيّم الزياره بعدها.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <HiOutlineShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'خصوصيّه وأمان كامل',
    desc: 'بياناتك مشفّره ومحميه — طبيبك هو اللي يشوف تفاصيلك الصحّيه ومحدش غيره.',
    color: 'from-teal-500 to-emerald-600',
  },
];

/* ════════════ COMPONENT ════════════ */
export const PatientLandingPage: React.FC = () => {
  // إخفاء الـsplash لمّا الصفحه تعمل mount — المريض يشوف المحتوى مباشره
  useHideBootSplash('patient-landing-mounted');
  const navigate = useNavigate();
  const go = useCallback((p: string) => navigate(p), [navigate]);

  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden bg-white" dir="rtl">
      <style>{`
        @keyframes shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
        @keyframes float-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .sh{background:linear-gradient(110deg,#0d9488,#06b6d4 30%,#0d9488 50%,#10b981 75%,#0d9488);background-size:400% 100%;animation:shimmer 5s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .fl{animation:float-slow 8s ease-in-out infinite}
      `}</style>

      {/* ══════════ HERO + FEATURES ══════════ */}
      <section className="pt-6 pb-12 sm:pt-10 sm:pb-16 px-3 sm:px-6 bg-gradient-to-b from-teal-50/40 to-white">
        <div className="max-w-6xl mx-auto">
          <A>
            <div className="flex flex-col lg:flex-row-reverse items-center justify-center gap-6 lg:gap-14 mb-6 sm:mb-8">
              <BrandLogo className="w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 shrink-0" size={320} fetchPriority="high" />
              <div className="flex flex-col items-center lg:items-start gap-3 text-center lg:text-right max-w-lg">
                <div className="flex items-center gap-2 lg:self-center">
                  <p className="text-lg sm:text-2xl font-bold text-slate-800">دليل الأطباء وحجز المواعيد</p>
                  <HiOutlineSparkles className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600 shrink-0" aria-hidden="true" />
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
                  Dr Hyper — لاقي دكتورك واحجز موعدك في دقيقتين بدون انتظار ولا تليفونات.
                </p>
                <div className="flex items-center gap-6 sm:gap-10 pt-1 lg:self-center">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-teal-600"><Counter target={1000} suffix="+" /></div>
                    <div className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">دكتور معتمد</div>
                  </div>
                  <div className="w-px h-9 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600"><Counter target={30} suffix="+" /></div>
                    <div className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">تخصّص</div>
                  </div>
                </div>
                {/* CTA كبير — زر البحث عن دكتور */}
                <div className="pt-2 lg:self-center">
                  <button
                    type="button"
                    onClick={() => go('/public')}
                    className="inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-sm sm:text-base font-black px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                  >
                    <HiOutlineMagnifyingGlass className="w-5 h-5" />
                    ابحث عن دكتورك الآن
                  </button>
                </div>
              </div>
            </div>
          </A>
          <A>
            <div className="flex items-center justify-center gap-2 mt-8 mb-6 sm:mt-12 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center">كل اللي محتاجه عشان تلاقي دكتورك</h2>
              <HiOutlineSquares2X2 className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600 shrink-0" aria-hidden="true" />
            </div>
          </A>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {PATIENT_FEATURES.map((f, i) => (
              <A key={f.title} delay={(i % 3) * 80}>
                <div className="group relative bg-white rounded-2xl ring-1 ring-slate-200/60 p-4 sm:p-6 hover:shadow-xl hover:ring-transparent transition-all duration-500 overflow-hidden h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl`} />
                  <div className="relative">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center shadow-lg mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      {f.icon}
                    </div>
                    <h3 className="text-[13px] sm:text-base font-black text-slate-900 mb-1 sm:mb-1.5 leading-snug">{f.title}</h3>
                    <p className="text-[11px] sm:text-sm text-slate-500 font-semibold leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <A>
            <div className="text-center mb-8 sm:mb-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">ابدأ رحلتك مع <span className="sh">Dr Hyper</span></h2>
              <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
                ابحث عن دكتورك، شوف تقييمات مرضى زيّك، واحجز موعدك في ثواني — كل ده من صفحتك.
              </p>
            </div>
          </A>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* ابحث عن دكتور (الـCTA الأساسي) */}
            <A>
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm hover:shadow-lg transition-all p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-md">
                    <HiOutlineMagnifyingGlass className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">ابحث عن دكتور</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed flex-1">
                  تصفّح دليل الأطباء كامل — ابحث بالتخصّص أو المحافظه أو الاسم.
                </p>
                <button
                  type="button"
                  onClick={() => go('/public')}
                  className="self-start flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors active:scale-[0.97]"
                >
                  <HiOutlineMagnifyingGlass className="w-3.5 h-3.5" />
                  تصفّح الأطباء
                </button>
              </div>
            </A>
            {/* احجز موعدك */}
            <A delay={80}>
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm hover:shadow-lg transition-all p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
                    <HiOutlineCalendarDays className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">احجز موعدك</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed flex-1">
                  اختار اليوم والوقت المناسب — حجز فوري إلكتروني بدون تليفونات ولا انتظار.
                </p>
                <button
                  type="button"
                  onClick={() => go('/public')}
                  className="self-start flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors active:scale-[0.97]"
                >
                  <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                  احجز الآن
                </button>
              </div>
            </A>
            {/* حجوزاتي */}
            <A delay={160}>
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm hover:shadow-lg transition-all p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <FaUserGroup className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">حجوزاتي</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed flex-1">
                  شوف كل حجوزاتك السابقه والجايه — وقيّم زياراتك عشان تساعد مرضى آخرين.
                </p>
                <button
                  type="button"
                  onClick={() => go('/login/public')}
                  className="self-start flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors active:scale-[0.97]"
                >
                  <HiOutlineArrowRightEndOnRectangle className="w-3.5 h-3.5" />
                  تسجيل الدخول
                </button>
              </div>
            </A>
          </div>

          {/* قسم ثانوي صغيّر — دعوه للأطباء للانضمام */}
          <A delay={240}>
            <div className="mt-8 sm:mt-10 bg-gradient-to-l from-slate-50 to-teal-50/40 rounded-2xl ring-1 ring-slate-200/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <FaUserDoctor className="w-4 h-4" />
                </div>
                <div className="text-center sm:text-right">
                  <h4 className="text-sm font-black text-slate-900">انت دكتور؟</h4>
                  <p className="text-xs text-slate-500 font-semibold">انضم لـDr Hyper ووصلّي مرضى جداد من دليلنا.</p>
                </div>
              </div>
              <a
                href="https://clinic.drhypermed.com"
                className="flex items-center gap-1.5 bg-white ring-1 ring-slate-200 hover:ring-blue-300 text-blue-700 hover:text-blue-800 text-xs font-black px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.97]"
              >
                <HiOutlineArrowRightEndOnRectangle className="w-3.5 h-3.5" />
                بوابة الأطباء
              </a>
            </div>
          </A>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-5 px-4 sm:px-6 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-800">Dr Hyper</span>
            <span className="text-xs text-slate-400 font-semibold">— دليل الأطباء وحجز المواعيد</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <FaShieldHalved className="w-3 h-3" />
            بياناتك مشفّره ومحميه
          </div>
        </div>
      </footer>
    </div>
  );
};
