import React from 'react';

interface DirectoryHeroSectionProps {
  stats: {
    doctors: number;
    specialties: number;
    governorates: number;
  };
}

export const DirectoryHeroSection: React.FC<DirectoryHeroSectionProps> = ({ stats }) => (
  <section className="relative overflow-hidden rounded-3xl border border-cyan-100/80 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-24px_rgba(13,148,136,0.25)] p-6 md:p-10">
    {/* Decorative blobs */}
    <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-teal-300/40 to-cyan-300/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-sky-300/30 to-emerald-300/30 blur-3xl" />

    <div className="relative text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[11px] md:text-xs font-black mb-4">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
        منصة الأطباء الأسرع نموًا في مصر
      </div>

      <h1 className="dh-hyper-animated-gradient inline-block text-4xl md:text-7xl font-black leading-none tracking-[0.08em] bg-clip-text text-transparent">
        DR HYPER
      </h1>
      <p className="mt-3 text-slate-700 font-black text-base md:text-2xl max-w-4xl mx-auto leading-relaxed">
        ابحث عن طبيبك واحجز موعدك الآن بشكل سلس وسريع
      </p>
      <p className="mt-2 text-slate-500 font-bold text-sm md:text-base max-w-2xl mx-auto">
        آلاف الأطباء المعتمدين في جميع التخصصات، حجز فوري بدون عناء
      </p>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mt-7 max-w-2xl mx-auto">
        {[
          { label: 'أطباء متاحون', value: stats.doctors, icon: '👨‍⚕️', color: 'from-teal-500 to-cyan-500' },
          { label: 'تخصصات', value: stats.specialties, icon: '🩺', color: 'from-sky-500 to-blue-500' },
          { label: 'محافظات', value: stats.governorates, icon: '📍', color: 'from-emerald-500 to-teal-500' },
        ].map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-3 md:p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />
            <span className="text-xl md:text-2xl mb-1">{icon}</span>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-0.5">{label}</p>
            <p className="text-xl md:text-3xl font-black text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
