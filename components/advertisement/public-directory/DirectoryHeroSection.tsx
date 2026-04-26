import React from 'react';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { BrandLogo } from '../../common/BrandLogo';

/**
 * Hero دليل الأطباء — اتوحّد مع Hero الصفحة التعريفية للجمهور (PatientLandingPage)
 * بناءً على طلب المالك:
 *   • شعار Dr Hyper بنفس الـglow + lighting effect.
 *   • اسم "Dr Hyper" بالـshimmer animation (.dh-sh) بألوان blue/indigo (موحّده مع الطبيب).
 *   • نفس الـgradient في الخلفيّه (blue-50/40 → white).
 *   • شيلت كروت الإحصائيّات (أطباء/تخصصات/محافظات) — كانت مكرّره ومش محتاجه.
 */
export const DirectoryHeroSection: React.FC = () => (
  <section className="relative overflow-hidden rounded-3xl border border-brand-100/80 bg-gradient-to-b from-brand-50/40 to-white shadow-[0_20px_50px_-24px_rgba(37,99,235,0.25)] p-6 md:p-10">
    {/* keyframes الـshimmer — اتغيّرت ألوانه لـblue/indigo عشان توحيد الجمهور
        مع هويّة الطبيب (blue) بناءً على طلب المالك. */}
    <style>{`
      @keyframes dh-shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
      .dh-sh{background:linear-gradient(110deg,#1d4ed8,#2563eb 30%,#1d4ed8 50%,#4f46e5 75%,#1d4ed8);background-size:400% 100%;animation:dh-shimmer 5s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    `}</style>

    {/* بلوبات الخلفيّه الزخرفيّه — اتوحّدت بـblue/indigo */}
    <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-brand-300/40 to-brand-300/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-brand-300/30 to-brand-300/30 blur-3xl" />

    <div className="relative flex flex-col items-center gap-3 text-center">
      {/* الشعار = نفس BrandLogo اللي في الصفحة التعريفية (مع glow). */}
      <BrandLogo
        className="w-32 h-32 sm:w-40 sm:h-40"
        size={160}
        fetchPriority="high"
      />

      {/* "دليل الأطباء وحجز المواعيد" + sparkle */}
      <div className="flex items-center gap-2">
        <p className="text-sm sm:text-lg font-bold text-slate-800">دليل الأطباء وحجز المواعيد</p>
        <HiOutlineSparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 shrink-0" aria-hidden="true" />
      </div>

      {/* اسم Dr Hyper بشكله المتأنّق المتحرّك — مطابق للصفحة التعريفية */}
      <h1 className="dh-sh inline-block text-4xl sm:text-6xl md:text-7xl font-black leading-none tracking-[0.06em]">
        Dr Hyper
      </h1>

      <p className="text-slate-600 text-sm sm:text-base font-semibold max-w-xl leading-relaxed">
        لاقي دكتورك واحجز موعدك في دقيقتين بدون انتظار ولا تليفونات.
      </p>
    </div>
  </section>
);
