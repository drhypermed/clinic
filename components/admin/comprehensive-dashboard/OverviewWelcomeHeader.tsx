// ─────────────────────────────────────────────────────────────────────────────
// هيدر الترحيب في لوحة الأدمن (OverviewWelcomeHeader)
// ─────────────────────────────────────────────────────────────────────────────
// القسم الأعلى في OverviewSection:
//   • تحية متغيرة (صباح الخير / مساء الخير) حسب الساعة
//   • ساعة حية (تتحدث كل دقيقة بدون ما تجبر الصفحة على re-render زائد)
//   • التاريخ بالعربي الكامل (اليوم، الشهر، السنة)
//   • زر تحديث الإحصاءات
//   • شارة "لوحة الإدارة"
//
// فصلناه في ملف مستقل عشان الـ state الخاص بالساعة الحية ما يسببش re-render
// للمكون الأب، ولتبسيط OverviewSection.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaArrowsRotate, FaClock, FaShieldHalved } from 'react-icons/fa6';
import { formatUserDate, formatUserTime, getUserHour } from '../../../utils/cairoTime';

interface OverviewWelcomeHeaderProps {
  /** دالة اختيارية لتحديث الإحصاءات يدوياً */
  onRefresh?: () => void | Promise<void>;
  /** هل عملية التحديث شغالة (لعرض spinner وتعطيل الزر) */
  refreshing?: boolean;
}

export const OverviewWelcomeHeader: React.FC<OverviewWelcomeHeaderProps> = ({
  onRefresh,
  refreshing = false,
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  /**
   * ساعة حية: نحسب الفرق للدقيقة الجاية بدل ما نعمل tick كل ثانية،
   * عشان الـ re-render يحصل مرة واحدة كل دقيقة (أوفر).
   * مع cleanup للـ timeout والـ interval عند إلغاء المكون.
   */
  React.useEffect(() => {
    let intervalId: number | undefined;
    const tick = () => setCurrentTime(new Date());
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 60_000);
    }, msToNextMinute);
    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  const hour = getUserHour(currentTime);
  const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير';
  const dateStr = formatUserDate(
    currentTime,
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    'ar-EG'
  );
  const timeStr = formatUserTime(currentTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG');

  return (
    <div className="flex items-center justify-between gap-3 dh-stagger-1">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-800 tracking-tight leading-tight">
          {greeting}
        </h1>
        <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[11px] sm:text-xs font-medium">
          <FaClock className="w-2.5 h-2.5 shrink-0" />
          <span className="font-numeric font-bold text-slate-600">{timeStr}</span>
          <span className="opacity-50">·</span>
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <button
            onClick={() => { void onRefresh(); }}
            disabled={refreshing}
            title="تحديث الإحصاءات الآن"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowsRotate className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'جاري التحديث' : 'تحديث'}</span>
          </button>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-blue-700">
          <FaShieldHalved className="w-3 h-3" />
          <span className="hidden sm:inline">لوحة الإدارة</span>
          <span className="sm:hidden">أدمن</span>
        </span>
      </div>
    </div>
  );
};
