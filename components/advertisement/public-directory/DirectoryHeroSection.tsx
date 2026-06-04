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
  <section className="relative overflow-hidden rounded-3xl border border-brand-100/80 bg-white shadow-[0_20px_50px_-24px_rgba(37,99,235,0.25)] p-4 md:p-6">
    {/* keyframes الـshimmer — اتغيّرت ألوانه لـblue/indigo عشان توحيد الجمهور
        مع هويّة الطبيب (blue) بناءً على طلب المالك. */}
    <style>{`
      @keyframes dh-shimmer{0%{background-position:200% 50%}100%{background-position:-200% 50%}}
      .dh-sh{background:linear-gradient(110deg,#1d4ed8,#2563eb 30%,#1d4ed8 50%,#4f46e5 75%,#1d4ed8);background-size:400% 100%;animation:dh-shimmer 5s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    `}</style>

    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-brand-700 via-brand-500 to-brand-700" />

    <div className="relative grid grid-cols-1 lg:grid-cols-[auto,1fr] items-center gap-4 lg:gap-6">
      {/* الشعار = نفس BrandLogo اللي في الصفحة التعريفية (مع glow). */}
      <div className="mx-auto lg:mx-0 rounded-3xl border border-brand-100 bg-brand-50/60 p-2 shadow-inner">
        <BrandLogo
          className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48"
          size={192}
          fetchPriority="high"
        />
      </div>

      <div className="text-center lg:text-right">
        {/* "دليل الأطباء وحجز المواعيد" + sparkle */}
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1">
          <p className="text-xs sm:text-sm font-black text-brand-800">دليل الأطباء وحجز المواعيد</p>
          <HiOutlineSparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 shrink-0" aria-hidden="true" />
        </div>

        {/* اسم Dr Hyper بشكله المتأنّق المتحرّك — مطابق للصفحة التعريفية */}
        <h1 className="dh-sh mt-3 inline-block text-4xl sm:text-6xl md:text-7xl font-black leading-none tracking-normal">
          Dr Hyper
        </h1>

        <p className="mt-3 text-slate-700 text-sm sm:text-base font-bold max-w-2xl leading-relaxed">
          اوصل لدكتورك واحجز موعدك في دقيقتين بدون انتظار ولا تليفونات.
        </p>
      </div>
    </div>
  </section>
);
