import React from 'react';

interface PeriodNavigatorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  containerClassName?: string;
  buttonClassName?: string;
  labelClassName?: string;
}

export const PeriodNavigator: React.FC<PeriodNavigatorProps> = ({
  label,
  onPrev,
  onNext,
  containerClassName = 'flex items-center gap-2 bg-white/20 px-1 py-1 rounded-lg border border-white/10',
  buttonClassName = 'p-1 hover:bg-white/20 rounded-lg text-white transition-colors',
  labelClassName = 'bg-white/20 px-2 py-1 rounded-lg text-xs sm:text-sm font-bold text-white min-w-[72px] text-center truncate',
}) => {
  return (
    <div className={containerClassName}>
      <button onClick={onPrev} className={buttonClassName}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span className={labelClassName}>{label}</span>
      <button onClick={onNext} className={buttonClassName}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );
};
