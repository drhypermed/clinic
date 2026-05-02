import React from 'react';

export interface ToolTone {
  gradient: string;
  shadow: string;
}

interface ToolCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  tone: ToolTone;
  onClick: () => void | Promise<void>;
  badgeLabel?: string;
  // ذهبي بريميوم: نفس مظهر الأزرار اللامعة في شاشة كشف جديد
  // (gold-premium-btn + halo + shimmer من apple-exam-shell.part4.css).
  // لما يبقى true بنتجاهل tone.gradient/tone.shadow ونستخدم الستايل الذهبي الموحد.
  premiumGold?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  icon,
  description,
  tone,
  onClick,
  badgeLabel,
  premiumGold = false,
}) => {
  // المسار الذهبي البريميوم — مطابق لأزرار التداخلات/الحمل في كشف جديد
  if (premiumGold) {
    return (
      <div className="relative w-full">
        <span className="gold-premium-halo rounded-2xl" aria-hidden />
        <button
          onClick={() => {
            void onClick();
          }}
          className="gold-premium-btn relative w-full rounded-2xl p-3 text-right transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          dir="rtl"
        >
          <span className="gold-premium-shimmer rounded-2xl" aria-hidden />
          <div className="relative z-10 flex items-center gap-3">
            {/* الأيقونة: خلفيه بيضاء شفافه + ring فاتح زي الأزرار في كشف جديد */}
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white/30 ring-1 ring-white/50 shadow-inner flex items-center justify-center text-warning-950 text-lg">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                {/* لون النص داكن (warning-950) عشان يبان على الخلفيه الذهبيه */}
                <h3 className="text-sm font-black text-warning-950 truncate">{title}</h3>
                {badgeLabel && (
                  <span className="shrink-0 rounded-lg bg-white/40 px-2 py-0.5 text-[10px] font-black text-warning-950 ring-1 ring-white/50">
                    {badgeLabel}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-warning-900/80 mt-0.5 line-clamp-1">{description}</p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // المسار العادي — gradient عبر prop tone (الأخضر للـ edit مثلاً)
  return (
    <button
      onClick={() => {
        void onClick();
      }}
      className={`group w-full rounded-2xl p-3 text-right transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${tone.gradient} ${tone.shadow}`}
      dir="rtl"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-white truncate">{title}</h3>
            {badgeLabel && (
              <span className="shrink-0 rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-black text-white">
                {badgeLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] font-bold text-white/70 mt-0.5 line-clamp-1">{description}</p>
        </div>
      </div>
    </button>
  );
};
