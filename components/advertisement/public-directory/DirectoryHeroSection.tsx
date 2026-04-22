import React from 'react';
// أيقونات Lucide — بديل موحّد للإيموجي (بتبان نفس الشكل على كل الأجهزه)
import { LuUsersRound, LuStethoscope, LuMapPin } from 'react-icons/lu';

interface DirectoryHeroSectionProps {
  stats: {
    doctors: number;
    specialties: number;
    governorates: number;
  };
}

// مصفوفة ثابته خارج الكومبوننت — الأيقونه دلوقتي Component مش string
// كل كرت فيه: تسميته + أيقونه Lucide + تدرّج لوني مميّز للشريط العلوي + تدرّج خفيف لخلفية الأيقونه
const HERO_STATS = [
  {
    key: 'doctors',
    label: 'أطباء متاحون',
    Icon: LuUsersRound,           // مجموعه أطباء = مستخدمين متعدّدين
    topBar: 'from-teal-500 to-cyan-500',
    iconBg: 'from-teal-50 to-cyan-50',
    iconColor: 'text-teal-600',
  },
  {
    key: 'specialties',
    label: 'تخصصات',
    Icon: LuStethoscope,          // السمّاعه = رمز التخصّص الطبّي الكلاسيكي
    // توحيد: نقلت اللون من عائلة sky/blue (كانت غريبه عن هويّة العلامه) لعائلة cyan
    topBar: 'from-cyan-500 to-cyan-600',
    iconBg: 'from-cyan-50 to-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    key: 'governorates',
    label: 'محافظات',
    Icon: LuMapPin,               // دبّوس الخريطه = تغطيه جغرافيه
    topBar: 'from-emerald-500 to-teal-500',
    iconBg: 'from-emerald-50 to-teal-50',
    iconColor: 'text-emerald-600',
  },
] as const;

export const DirectoryHeroSection: React.FC<DirectoryHeroSectionProps> = ({ stats }) => (
  <section className="relative overflow-hidden rounded-3xl border border-cyan-100/80 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_-24px_rgba(13,148,136,0.25)] p-6 md:p-10">
    {/* بلوبات الخلفيّه الزخرفيّه — اتوحّدت عائلة الألوان (شيلت sky وخلّيتها كلها داخل teal/cyan/emerald) */}
    <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-teal-300/40 to-cyan-300/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-300/30 to-emerald-300/30 blur-3xl" />

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
        {HERO_STATS.map(({ key, label, Icon, topBar, iconBg, iconColor }) => {
          // القيم مرتبطه بترتيب الـkey في stats (doctors / specialties / governorates)
          const value = stats[key as keyof typeof stats];
          return (
            <div
              key={key}
              className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-3 md:p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all"
            >
              {/* الشريط الملوّن العلوي — يحدّد هويّة الكرت */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${topBar}`} />
              {/* دايره خلفيه ناعمه حوالين الأيقونه — بتدّي شكل "محترف" بدل الإيموجي العائم */}
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${iconBg} flex items-center justify-center mb-1.5`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} strokeWidth={2} />
              </div>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 mb-0.5">{label}</p>
              <p className="text-xl md:text-3xl font-black text-slate-800">{value}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
