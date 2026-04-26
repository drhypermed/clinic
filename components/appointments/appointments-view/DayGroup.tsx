import React, { useState } from 'react';
import type { ClinicAppointment } from '../../../types';
import { buildCairoDateTime, formatUserDate } from '../../../utils/cairoTime';

interface DayGroupProps {
  dateStr: string;
  appointments: ClinicAppointment[];
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'blue' | 'green';
  /** @deprecated no longer used — kept for backward compatibility */
  badgeColor?: string;
  /** @deprecated no longer used — kept for backward compatibility */
  titleColor?: string;
}

export const DayGroup: React.FC<DayGroupProps> = ({
  dateStr,
  appointments,
  children,
  defaultOpen = false,
  variant = 'blue',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const dateObj = buildCairoDateTime(dateStr, '12:00');
  const fullDate = formatUserDate(
    dateObj,
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );

  const shellClass = variant === 'green' ? 'dh-day-shell-green rounded-2xl border overflow-hidden' : 'dh-day-shell rounded-2xl border overflow-hidden';
  const headClass = variant === 'green' ? 'dh-day-head-green w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white hover:brightness-110 transition-colors' : 'dh-day-head w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white hover:brightness-110 transition-colors';

  return (
    <div className={shellClass}>
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className={headClass}
      >
        <div className="font-black text-sm sm:text-base leading-relaxed text-right break-words">
          {fullDate}
        </div>
        <div className="w-full sm:w-auto shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">
            {appointments.length} موعد
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black transition-colors ${isOpen ? 'bg-white text-brand-700 border-white' : 'bg-white/20 text-white border-white/40'}`}>
            {isOpen ? 'طي' : 'عرض'}
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="bg-slate-50/50 p-4 sm:p-5 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};
