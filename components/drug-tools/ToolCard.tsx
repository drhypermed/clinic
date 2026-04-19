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
}

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  icon,
  description,
  tone,
  onClick,
  badgeLabel,
}) => (
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
