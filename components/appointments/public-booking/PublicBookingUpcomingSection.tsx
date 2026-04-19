/**
 * قسم "المواعيد القادمة" — مجمعة بالأيام بنفس تصميم DayGroup عند الطبيب.
 */
import React, { useMemo, useState } from 'react';
import { isConsultationAppointment } from '../../../utils/appointmentType';
import { getSourceBadgeStyle, getSourceLabel } from './helpers';
import type { TodayAppointment } from '../../../types';
import { buildCairoDateTime, formatUserDate, formatUserTime } from '../../../utils/cairoTime';

type DayGroup = { dateStr: string; fullDate: string; appointments: TodayAppointment[] };

type Props = {
  upcomingAppointments: TodayAppointment[];
  onEditAppointment: (apt: TodayAppointment) => void;
  onRemoveAppointment: (id: string) => void;
};

export const PublicBookingUpcomingSection: React.FC<Props> = ({
  upcomingAppointments,
  onEditAppointment,
  onRemoveAppointment,
}) => {
  const dayGroups = useMemo((): DayGroup[] => {
    const groups: Record<string, TodayAppointment[]> = {};
    [...upcomingAppointments]
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .forEach((apt) => {
        const dt = new Date(apt.dateTime);
        const dayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        if (!groups[dayStr]) groups[dayStr] = [];
        groups[dayStr].push(apt);
      });
    return Object.keys(groups).sort().map((dateStr) => ({
      dateStr,
      fullDate: formatUserDate(buildCairoDateTime(dateStr, '12:00'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      appointments: groups[dateStr],
    }));
  }, [upcomingAppointments]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1 pb-1">
        <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
        <h3 className="text-sm font-black text-amber-800">المواعيد القادمة</h3>
        {upcomingAppointments.length > 0 && (
          <span className="mr-auto text-[11px] font-black bg-amber-100 text-amber-700 rounded-full px-2.5 py-0.5 border border-amber-200">
            {upcomingAppointments.length} موعد
          </span>
        )}
      </div>

      {dayGroups.length === 0 ? (
        <div className="dh-day-shell rounded-2xl border text-center py-10 text-slate-400">
          <p className="text-sm font-bold">لا توجد مواعيد قادمة</p>
        </div>
      ) : (
        dayGroups.map((group) => (
          <UpcomingDayGroupCard key={group.dateStr} group={group} onEdit={onEditAppointment} onRemove={onRemoveAppointment} />
        ))
      )}
    </div>
  );
};

// ==================== DayGroup (أزرق — نفس تصميم الطبيب) ====================
const UpcomingDayGroupCard: React.FC<{
  group: DayGroup;
  onEdit: (apt: TodayAppointment) => void;
  onRemove: (id: string) => void;
}> = ({ group, onEdit, onRemove }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="dh-day-shell rounded-2xl border overflow-hidden">
      <button type="button" onClick={() => setIsOpen((v) => !v)}
        className="dh-day-head w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white hover:brightness-110 transition-colors">
        <div className="font-black text-sm sm:text-base leading-relaxed text-right break-words">{group.fullDate}</div>
        <div className="w-full sm:w-auto shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">{group.appointments.length} موعد</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black transition-colors ${isOpen ? 'bg-white text-blue-700 border-white' : 'bg-white/20 text-white border-white/40'}`}>
            {isOpen ? 'طي' : 'عرض'}
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="bg-slate-50/50 p-4 sm:p-5 space-y-2">
          {group.appointments.map((apt) => (
            <UpcomingCard key={apt.id} apt={apt} onEdit={onEdit} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
};

const UpcomingCard: React.FC<{ apt: TodayAppointment; onEdit: (a: TodayAppointment) => void; onRemove: (id: string) => void }> = ({ apt, onEdit, onRemove }) => {
  const isConsultation = isConsultationAppointment(apt);
  return (
    <div className="dh-patient-shell rounded-2xl border overflow-hidden">
      <div className="p-3 space-y-2 text-right" dir="rtl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-black text-slate-900 text-sm">{apt.patientName || 'بدون اسم'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${isConsultation ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-teal-100 text-teal-700 border-teal-200'}`}>
            {isConsultation ? 'استشارة' : 'كشف'}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getSourceBadgeStyle(apt.source)}`}>
            {getSourceLabel(apt.source)}
          </span>
          <span className="border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 rounded-full">
            {formatUserTime(apt.dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
          </span>
        </div>
        {apt.phone && <p className="text-[11px] font-bold text-slate-500" dir="ltr">{apt.phone}</p>}
        {apt.visitReason && <p className="text-[11px] font-bold text-slate-500">{apt.visitReason}</p>}
        <div className="flex items-center gap-2 pt-1">
          <button type="button" onClick={() => onEdit(apt)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            تعديل
          </button>
          <button type="button" onClick={() => onRemove(apt.id)} className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all" title="حذف">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
