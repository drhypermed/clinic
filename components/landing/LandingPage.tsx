/**
 * الصفحة التعريفية — تصميم SaaS احترافي يخاطب كل فئة بشكل منفصل.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHideBootSplash } from '../../hooks/useHideBootSplash';
import {
  FaUserDoctor,
  FaUserPlus,
  FaClipboardUser,
  FaUserGroup,
  FaShieldHalved,
  FaCapsules,
  FaStethoscope,
  FaWandMagicSparkles,
} from 'react-icons/fa6';
import { BrandLogo } from '../common/BrandLogo';
import {
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck,
  HiOutlineChartBarSquare,
  HiOutlineBeaker,
  HiOutlineBell,
  HiOutlineMegaphone,
  HiOutlineArrowRightEndOnRectangle,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
  HiOutlineBookOpen,
} from 'react-icons/hi2';

/* ── helpers ── */
const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, visible: v };
};

const Counter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
  const [c, setC] = useState(0);
  const { ref, visible } = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let n = 0;
    const s = Math.max(1, Math.ceil(target / 80));
    const id = setInterval(() => { n += s; if (n >= target) { setC(target); clearInterval(id); } else setC(n); }, 18);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={ref}>{c.toLocaleString('ar-EG')}{suffix}</span>;
};

const A: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const { ref, visible } = useInView(0.06);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ── features ── */
interface Feature { icon: React.ReactNode; title: string; desc: string; color: string }
const FEATURES: Feature[] = [
  {
    icon: <HiOutlineDocumentText className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'كتابة وطباعة الروشتات',
    desc: 'روشتة احترافية بشعار عيادتك وبياناتك من تصميمك الشخصي — مع مقاسات ورق مخصصة، طباعة فورية، أو مشاركة مباشرة على واتساب.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: <FaStethoscope className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'المساعدة في التشخيص',
    desc: 'اكتب الشكوى والتاريخ المرضي والفحوصات — والنظام يقترح عليك التشخيص المحتمل وتقدر تعدل عليه بكل سهولة، ويتضاف ويُكتب في الروشتة هو وكل تفاصيل المريض بشكل احترافي.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: <FaCapsules className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'اختيار الأدوية المناسبة',
    desc: 'جرعات آمنة تلقائياً بالوزن والعمر — مع تنبيهات للجرعة القصوى والاستخدامات والتحذيرات والتداخلات، وإمكانية التعديل عليها بعد الإضافة للروشتة.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: <HiOutlineBeaker className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'أدوات الأدوية المتقدمة',
    desc: 'فحص تفاعلات الأدوية، تعديل جرعات مرضى الكلى، وتصنيف أمان الأدوية في الحمل والرضاعة.',
    color: 'from-rose-500 to-red-600',
  },
  {
    icon: <FaWandMagicSparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'الروشتات الذكية',
    desc: 'اعمل روشتة جاهزة بالأدوية والفحوصات والتعليمات وضيفها بضغطة زر — مع التعديل عليها قبل الطباعة لو عايز.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: <HiOutlineCalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'حجز المواعيد إلكترونياً',
    desc: 'رابط حجز مخصّص لعيادتك — المرضى يحجزوا أونلاين وانت بتشوف كل حجز فوراً على شاشتك.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: <HiOutlineUserGroup className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'تنسيق مع السكرتارية',
    desc: 'السكرتارية تدخل بيانات المريض قبل الكشف وبتوصلك البيانات — وبتتواصل معاك بكل سهولة: تطلب دخول الحالة، وانت بترد بالموافقة أو الانتظار بشكل لحظي.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: <HiOutlineClipboardDocumentList className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'ملفات وسجلات المرضى',
    desc: 'أرشيف كامل لكل زيارات المريض مع بحث متقدم بالاسم، التشخيص، الدواء، أو التاريخ.',
    color: 'from-lime-500 to-green-600',
  },
  {
    icon: <HiOutlineChartBarSquare className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'الحسابات والتأمينات',
    desc: 'إيرادات ومصروفات يومياً وشهرياً وسنوياً — مع دعم شركات التأمين، الخصومات، والفواتير.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: <HiOutlineBuildingOffice2 className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'إدارة فروع متعددة',
    desc: 'أدر أكتر من فرع لعيادتك — كل فرع بإعداداته ومواعيده وحساباته وتسعيره المستقل.',
    color: 'from-slate-500 to-slate-700',
  },
  {
    icon: <HiOutlineMegaphone className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'دليل الأطباء والتسويق',
    desc: 'صفحة عامة لعيادتك في الدليل العام — بخدماتك وتقييمات المرضى ورابط الحجز المباشر.',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    icon: <HiOutlineBell className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'إشعارات فورية',
    desc: 'تنبيهات لحظية على المتصفح والموبايل لكل حجز جديد، تحديث بيانات، أو طلب من السكرتارية.',
    color: 'from-fuchsia-500 to-purple-600',
  },
  {
    icon: <HiOutlineShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: 'حماية وتشفير كامل',
    desc: 'بيانات المرضى مشفّرة بالكامل مع نسخ احتياطي تلقائي وصلاحيات مخصّصة لكل مستخدم.',
    color: 'from-green-500 to-emerald-600',
  },
];

/* ════════════ COMPONENT ════════════ */
export const LandingPage: React.FC = () => {
  // إخفاء السبلاش فور ما Landing تعمل mount — المستخدم يشوف الصفحة مباشرة.
  useHideBootSplash('landing-mounted');
  const navigate = useNavigate();
  const go = useCallback((p: string) => navigate(p), [navigate]);

  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden bg-white" dir="rtl">
      <style>{`
        @keyframes shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
        @keyframes float-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        .sh{background:linear-gradient(110deg,#2563eb,#7c3aed 30%,#2563eb 50%,#10b981 75%,#2563eb);background-size:400% 100%;animation:shimmer 5s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .fl{animation:float-slow 8s ease-in-out infinite}
      `}</style>

      {/* ══════════ المميزات ══════════ */}
      <section className="pt-6 pb-12 sm:pt-10 sm:pb-16 px-3 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <A>
            <div className="flex flex-col lg:flex-row-reverse items-center justify-center gap-6 lg:gap-14 mb-6 sm:mb-8">
              <BrandLogo className="w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 shrink-0" size={320} fetchPriority="high" />
              <div className="flex flex-col items-center lg:items-start gap-3 text-center lg:text-right max-w-lg">
                <div className="flex items-center gap-2 lg:self-center">
                  <p className="text-lg sm:text-2xl font-bold text-slate-800">نظام متكامل لإدارة العيادات</p>
                  <HiOutlineSparkles className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 shrink-0" aria-hidden="true" />
                </div>
                <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
                  دكتور هايبر — الشريك الطبي والإداري الذكي اللي بيخلّي كل تفصيلة في عيادتك أحسن وأسرع.
                </p>
                <div className="flex items-center gap-6 sm:gap-10 pt-1 lg:self-center">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-blue-600"><Counter target={10000} suffix="+" /></div>
                    <div className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">دواء</div>
                  </div>
                  <div className="w-px h-9 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-violet-600"><Counter target={200} suffix="+" /></div>
                    <div className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">ميزة</div>
                  </div>
                </div>
              </div>
            </div>
          </A>
          <A>
            <div className="flex items-center justify-center gap-2 mt-8 mb-6 sm:mt-12 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center">كل اللي عيادتك محتاجاه في مكان واحد</h2>
              <HiOutlineSquares2X2 className="w-7 h-7 sm:w-8 sm:h-8 text-violet-600 shrink-0" aria-hidden="true" />
            </div>
          </A>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {FEATURES.map((f, i) => (
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
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">ابدأ رحلتك مع <span className="sh">Dr Hyper Med</span></h2>
              <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
                افتح حسابك مجاناً في أقل من دقيقة، واختار الواجهة المناسبة لدورك — طبيب، سكرتارية، أو مريض.
              </p>
            </div>
          </A>

          {/* ── دليل المستخدم — بيبان قبل كروت تسجيل الدخول ── */}
          {/* قبل ما الدكتور يسجّل، بيقدر يقرا دليل مفصّل عن كل ميزات التطبيق. */}
          {/* ده بيقلّل أسئله الدعم الفنّي بنسبه كبيره وبيرفع ثقه الدكتور قبل التسجيل. */}
          <A>
            <button
              type="button"
              onClick={() => go('/user-guide')}
              className="group w-full mb-5 sm:mb-6 flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-blue-50 via-white to-indigo-50 ring-1 ring-blue-200/60 hover:ring-blue-400 hover:shadow-lg transition-all text-right active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <HiOutlineBookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">دليل المستخدم</h3>
                    <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">جديد</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-snug mt-0.5">
                    شوف كل ميزات التطبيق خطوه بخطوه قبل ما تسجّل — 10 مواضيع مرتّبه بالترتيب اللي هتستخدمه.
                  </p>
                </div>
              </div>
              <div className="shrink-0 hidden sm:flex items-center gap-1 text-blue-700 font-black text-xs group-hover:gap-2 transition-all">
                <span>افتح الدليل</span>
                <HiOutlineArrowRightEndOnRectangle className="w-4 h-4" />
              </div>
            </button>
          </A>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* طبيب */}
            <A>
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm hover:shadow-lg transition-all p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md"><FaUserDoctor className="w-4 h-4" /></div>
                  <h3 className="text-base font-black text-slate-900">للأطباء</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed flex-1">
                  أنشئ حسابك وابدأ تدير عيادتك — الروشتات، المواعيد، الحسابات، والسجلات.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => go('/signup/doctor')} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors active:scale-[0.97]">
                    <FaUserPlus className="w-3 h-3" />
                    إنشاء حساب
                  </button>
                  <button type="button" onClick={() => go('/login/doctor')} className="flex items-center gap-1.5 bg-gradient-to-l from-indigo-600 to-sky-500 hover:from-indigo-700 hover:to-sky-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.97]">
                    <HiOutlineArrowRightEndOnRectangle className="w-3.5 h-3.5" />
                    تسجيل الدخول
                  </button>
                </div>
              </div>
            </A>
            {/* سكرتارية */}
            <A delay={80}>
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm hover:shadow-lg transition-all p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md"><FaClipboardUser className="w-4 h-4" /></div>
                  <h3 className="text-base font-black text-slate-900">للسكرتارية</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed flex-1">
                  ادخل بيانات المرضى وأدر قائمة الانتظار — بإيميل الطبيب والرقم السري.
                </p>
                <button type="button" onClick={() => go('/login/secretary')} className="self-start flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors active:scale-[0.97]">
                  <HiOutlineArrowRightEndOnRectangle className="w-3.5 h-3.5" />
                  دخول السكرتارية
                </button>
              </div>
            </A>
            {/* جمهور */}
            <A delay={160}>
              <div className="bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-sm hover:shadow-lg transition-all p-5 space-y-3 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white flex items-center justify-center shadow-md"><FaUserGroup className="w-4 h-4" /></div>
                  <h3 className="text-base font-black text-slate-900">للمرضى</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed flex-1">
                  تصفّح دليل الأطباء واحجز موعدك إلكترونياً بدون اتصال.
                </p>
                <button type="button" onClick={() => go('/login/public')} className="self-start flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors active:scale-[0.97]">
                  <FaUserGroup className="w-3 h-3" />
                  تصفّح الأطباء
                </button>
              </div>
            </A>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="py-5 px-4 sm:px-6 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-800">Dr Hyper Med</span>
            <span className="text-xs text-slate-400 font-semibold">— نظام إدارة العيادات</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <FaShieldHalved className="w-3 h-3" />
            جميع البيانات مشفّرة ومحمية
          </div>
        </div>
      </footer>
    </div>
  );
};
