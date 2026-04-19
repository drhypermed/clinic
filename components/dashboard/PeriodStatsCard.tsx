// ─────────────────────────────────────────────────────────────────────────────
// بطاقات الإحصائيات الدورية في لوحة الطبيب (PeriodStatsCard)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - MiniStat: عنصر إحصائية صغيرة (أيقونة + تسمية + قيمة رقمية)
//   - NetProfitStat: عنصر مميز لصافي الربح (أخضر للموجب، وردي للسالب)
//   - PeriodCard: بطاقة كاملة تجمع 7 إحصائيات لفترة زمنية (يوم/شهر/سنة)
//   - COLOR_MAP: خريطة الألوان الموحدة لكل MiniStat
//
// فصلناها من Dashboard.tsx عشان الملف كان 676 سطر.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  FaMoneyBillWave, FaReceipt, FaScaleBalanced,
  FaShieldHalved, FaStethoscope, FaUserGroup,
  FaSyringe, FaSackDollar,
} from 'react-icons/fa6';

/* ═════════════════════ COLOR MAP ═════════════════════ */
/** خريطة الألوان لكل نوع إحصائية — بنستخدمها لتوحيد شكل MiniStat في كل الفلترات. */
const COLOR_MAP: Record<string, { bg: string; text: string; icon: string; glow: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: 'text-blue-500',    glow: 'shadow-blue-100/50' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  icon: 'text-violet-500',  glow: 'shadow-violet-100/50' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500', glow: 'shadow-emerald-100/50' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: 'text-amber-500',   glow: 'shadow-amber-100/50' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-700',     icon: 'text-sky-500',     glow: 'shadow-sky-100/50' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    icon: 'text-teal-500',    glow: 'shadow-teal-100/50' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    icon: 'text-rose-500',    glow: 'shadow-rose-100/50' },
};

/* ═════════════════════ MINI STAT ═════════════════════ */
interface MiniStatProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  color: string;
  isMoney?: boolean;
  className?: string;
}

/** عنصر إحصائي صغير — يظهر مع أيقونة ملونة وقيمة رقمية (أحياناً بوحدة "ج.م"). */
const MiniStat: React.FC<MiniStatProps> = ({ icon, label, value, color, isMoney, className = '' }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div className={`group rounded-xl border border-slate-100/80 bg-white/60 p-2.5 sm:p-3 hover:border-slate-200/80 hover:shadow-sm transition-all duration-200 ${className}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`${c.bg} ${c.icon} rounded-lg p-1.5 shadow-sm ${c.glow}`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-2.5 h-2.5 sm:w-3 sm:h-3' })}
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-base sm:text-lg font-black font-numeric ${c.text} tracking-tight leading-none`}>
        {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        {isMoney && <span className="text-[9px] sm:text-[10px] font-bold opacity-50 mr-0.5">ج.م</span>}
      </div>
    </div>
  );
};

/* ═════════════════════ NET PROFIT STAT ═════════════════════ */
/**
 * صافي الربح — يغطي عمودين (col-span-2) ويتغير لونه حسب الإشارة:
 *   - موجب: أخضر (emerald/teal)
 *   - سالب: وردي (rose/red)
 */
const NetProfitStat: React.FC<{ value: number; fmtMoney: (n: number) => string }> = ({ value, fmtMoney }) => {
  const isPositive = value >= 0;
  const gradient = isPositive
    ? 'from-emerald-50 via-emerald-50 to-teal-50 border-emerald-200/70'
    : 'from-rose-50 via-rose-50 to-red-50 border-rose-200/70';
  const iconGradient = isPositive
    ? 'from-emerald-400 to-teal-600'
    : 'from-rose-400 to-red-600';
  const textColor = isPositive ? 'text-emerald-700' : 'text-rose-700';
  return (
    <div className={`col-span-2 rounded-xl border bg-gradient-to-l ${gradient} p-3 sm:p-3.5 shadow-sm`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-sm`}>
            <FaScaleBalanced className="w-3 h-3 text-white" />
          </div>
          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${textColor}`}>
            صافي الربح
          </span>
        </div>
        <div className={`text-base sm:text-lg font-black font-numeric ${textColor} tracking-tight leading-none`}>
          {fmtMoney(value)}
          <span className="text-[9px] sm:text-[10px] font-bold opacity-50 mr-0.5">ج.م</span>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════ PERIOD CARD ═════════════════════ */
/** بيانات الفترة (يوم/شهر/سنة) — مستخدمة كـ props لـ PeriodCard. */
export interface PeriodData {
  exams: number;
  consults: number;
  revenue: number;
  expenses: number;
  insurance: number;
  interventions: number;
  other: number;
}

interface PeriodCardProps {
  icon: React.ReactElement;
  title: string;
  accentFrom?: string;
  accentTo?: string;
  headerBg: string;
  headerBorder: string;
  headerIcon: string;
  headerText: string;
  data: PeriodData;
  fmtMoney: (n: number) => string;
  labels?: { interventionsLabel: string; otherRevenueLabel: string };
  className?: string;
}

/**
 * بطاقة إحصائيات كاملة لفترة زمنية (يوم/شهر/سنة):
 *   - شريط لون علوي + هيدر (عنوان + أيقونة)
 *   - شبكة 2×4 من MiniStat:
 *     كشوفات، استشارات، تداخلات، دخل آخر، إيراد، مصروفات، صافي الربح
 *   - لو في مطالبات تأمين > 0: تُعرض كعنصر إضافي بعرض كامل
 */
export const PeriodCard: React.FC<PeriodCardProps> = ({
  icon, title, accentFrom = 'from-teal-400', accentTo = 'to-teal-600',
  headerBg, headerBorder, headerText, data, fmtMoney, labels, className = '',
}) => {
  const interventionsLabel = labels?.interventionsLabel || 'التداخلات';
  const otherRevenueLabel = labels?.otherRevenueLabel || 'دخل آخر';
  return (
    <div className={`group bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_-4px_rgba(0,0,0,0.08)] transition-shadow duration-300 ${className}`}>
      {/* شريط اللون العلوي */}
      <div className={`h-1 bg-gradient-to-l ${accentFrom} ${accentTo}`} />
      <div className={`flex items-center gap-2.5 px-4 py-3 ${headerBg} border-b ${headerBorder}`}>
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${accentFrom} ${accentTo} flex items-center justify-center shadow-sm`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3 h-3 text-white' })}
        </div>
        <h2 className={`text-xs sm:text-sm font-black ${headerText}`}>{title}</h2>
      </div>
      <div className="p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">
        <MiniStat icon={<FaStethoscope />} label="كشوفات" value={data.exams} color="blue" />
        <MiniStat icon={<FaUserGroup />} label="استشارات" value={data.consults} color="violet" />
        <MiniStat icon={<FaSyringe />} label={interventionsLabel} value={fmtMoney(data.interventions)} color="teal" isMoney />
        <MiniStat icon={<FaSackDollar />} label={otherRevenueLabel} value={fmtMoney(data.other)} color="sky" isMoney />
        <MiniStat icon={<FaMoneyBillWave />} label="إجمالي الإيراد" value={fmtMoney(data.revenue)} color="emerald" isMoney />
        <MiniStat icon={<FaReceipt />} label="المصروفات" value={fmtMoney(data.expenses)} color="rose" isMoney />
        <NetProfitStat value={data.revenue - data.expenses} fmtMoney={fmtMoney} />
        {data.insurance > 0 && (
          <MiniStat icon={<FaShieldHalved />} label="مطالبات التأمين" value={fmtMoney(data.insurance)} color="sky" isMoney className="col-span-2" />
        )}
      </div>
    </div>
  );
};
