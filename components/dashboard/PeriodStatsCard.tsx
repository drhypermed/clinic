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
// خريطة الألوان — قاعدة جديدة: أزرق متدرج فقط أو أخضر متدرج فقط (مفيش mix)
//   - الأرقام كلها text-slate-900 (تباين قوي على الأبيض)
//   - blue = الأرقام المحايدة + معلومات (كشوف/استشارات/تأمين)
//   - emerald = القيم المالية الموجبة (تداخلات/دخل/إيراد)
//   - rose = استثناء دلالي للسالب فقط (مصروفات) — لأن الأخضر بيدل على الموجب
const COLOR_MAP: Record<string, { bg: string; icon: string }> = {
  slate:   { bg: 'bg-blue-50',     icon: 'text-blue-700' },     // محايد → أزرق فاتح (كشوف/استشارات)
  teal:    { bg: 'bg-emerald-50',  icon: 'text-emerald-700' },  // تداخلات → أخضر فقط
  emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-700' },  // إيراد → أخضر أعمق شوية
  rose:    { bg: 'bg-rose-50',     icon: 'text-rose-600' },     // مصروفات (سالب) — استثناء دلالي
  sky:     { bg: 'bg-blue-50',     icon: 'text-blue-700' },     // تأمين → أزرق فقط
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

/** عنصر إحصائي صغير — أيقونة ملونة + قيمة رقمية بتباين قوي (slate-900). */
const MiniStat: React.FC<MiniStatProps> = ({ icon, label, value, color, isMoney, className = '' }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.slate;
  return (
    // border صلب بدل /80 الشفاف
    <div className={`group rounded-xl border border-blue-200 bg-white p-2.5 sm:p-3 hover:border-blue-400 hover:shadow-sm transition-all duration-200 ${className}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`${c.bg} ${c.icon} rounded-lg p-1.5`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-2.5 h-2.5 sm:w-3 sm:h-3' })}
        </div>
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      </div>
      {/* الأرقام كلها slate-900 لتباين عالي */}
      <div className="text-base sm:text-lg font-black font-numeric text-slate-900 tracking-tight leading-none">
        {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        {isMoney && <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 mr-0.5">ج.م</span>}
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
  // الموجب: أخضر متدرج فقط (emerald-only). السالب: أحمر دلالي (rose).
  const gradient = isPositive
    ? 'from-emerald-100 via-emerald-50 to-emerald-50 border-emerald-300/80'
    : 'from-rose-100 via-rose-50 to-red-50 border-rose-300/80';
  const iconGradient = isPositive
    ? 'from-emerald-500 to-emerald-700'
    : 'from-rose-500 to-red-600';
  // الأرقام slate-900 للتباين العالي، اللون يتلون على التسمية فقط (أوضح دلاليًا)
  const accentText = isPositive ? 'text-emerald-700' : 'text-rose-700';
  return (
    // padding أكبر + ظل أوضح عشان يتميّز بصرياً عن MiniStat العادي
    <div className={`col-span-2 rounded-xl border bg-gradient-to-l ${gradient} p-3.5 sm:p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-sm`}>
            <FaScaleBalanced className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${accentText}`}>
            صافي الربح
          </span>
        </div>
        {/* الرقم أكبر من MiniStat بدرجة متوسطة (xl→2xl) — يبان أهم بدون ما يبقى فاقع */}
        <div className="text-xl sm:text-2xl font-black font-numeric text-slate-900 tracking-tight leading-none">
          {fmtMoney(value)}
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 mr-1">ج.م</span>
        </div>
      </div>
    </div>
  );
};

/* ═════════════════════ PERIOD CARD ═════════════════════ */
/** بيانات الفترة (يوم/شهر/سنة) — مستخدمة كـ props لـ PeriodCard. */
interface PeriodData {
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
  // iconFrom/iconTo اختيارية — لو مش متوفرة بنرجع للـaccent.
  // فائدتها: لما الـheader نفسه dark، الأيقونة لازم تكون بدرجة مختلفة (مضيئة) عشان تتباين.
  iconFrom?: string;
  iconTo?: string;
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
  iconFrom, iconTo,
  headerBg, headerBorder, headerText, data, fmtMoney, labels, className = '',
}) => {
  const interventionsLabel = labels?.interventionsLabel || 'التداخلات';
  const otherRevenueLabel = labels?.otherRevenueLabel || 'دخل آخر';
  // gradient الأيقونة: لو فيه override بنستخدمه (للـheader الغامق)، وإلا نرجع للـaccent العادي
  const iconBgFrom = iconFrom || accentFrom;
  const iconBgTo = iconTo || accentTo;
  return (
    // كرت أبيض صريح بـborder خفيف بـtint blue (بدل white/70 الباهت اللي كان بيختفي على الخلفية)
    <div className={`group bg-white rounded-2xl border border-blue-100 shadow-[0_2px_6px_rgba(8,112,184,0.06),0_8px_24px_-4px_rgba(8,112,184,0.10)] overflow-hidden hover:shadow-[0_2px_6px_rgba(8,112,184,0.06),0_14px_36px_-6px_rgba(8,112,184,0.16)] transition-shadow duration-300 ${className}`}>
      {/* شريط اللون العلوي — هوية كل كرت (blue-only أو emerald-only) */}
      <div className={`h-1.5 bg-gradient-to-l ${accentFrom} ${accentTo}`} />
      <div className={`flex items-center gap-2.5 px-4 py-3 ${headerBg} border-b ${headerBorder}`}>
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconBgFrom} ${iconBgTo} flex items-center justify-center shadow-sm`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3 h-3 text-white' })}
        </div>
        <h2 className={`text-xs sm:text-sm font-black ${headerText}`}>{title}</h2>
      </div>
      <div className="p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3">
        {/* محايد (slate) للأعداد العادية — الإيراد/المصروفات بس هما اللي ملونين دلالياً */}
        <MiniStat icon={<FaStethoscope />} label="كشوفات" value={data.exams} color="slate" />
        <MiniStat icon={<FaUserGroup />} label="استشارات" value={data.consults} color="slate" />
        <MiniStat icon={<FaSyringe />} label={interventionsLabel} value={fmtMoney(data.interventions)} color="teal" isMoney />
        <MiniStat icon={<FaSackDollar />} label={otherRevenueLabel} value={fmtMoney(data.other)} color="slate" isMoney />
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
