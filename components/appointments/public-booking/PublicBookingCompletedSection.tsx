/**
 * قسم "المواعيد المنفذة" — مجمعة بالأيام بتصميم أخضر (dh-day-shell-green) بالضبط زي واجهة الطبيب.
 */
import React, { useMemo, useState } from 'react';
import { isConsultationAppointment } from '../../../utils/appointmentType';
import { getSourceBadgeStyle, getSourceLabel } from './helpers';
import type { TodayAppointment } from '../../../types';
import { buildCairoDateTime, formatUserDate, formatUserTime } from '../../../utils/cairoTime';
import { PatientContactActions } from '../../common/PatientContactActions';
import { SecretaryVitalsPills } from '../../common/SecretaryVitalsPills';

type DayGroup = { dateStr: string; fullDate: string; appointments: TodayAppointment[] };

type Props = {
  completedAppointments: TodayAppointment[];
  onRemoveAppointment: (id: string) => void;
};

export const PublicBookingCompletedSection: React.FC<Props> = ({
  completedAppointments,
  onRemoveAppointment,
}) => {
  const dayGroups = useMemo((): DayGroup[] => {
    const groups: Record<string, TodayAppointment[]> = {};
    [...completedAppointments]
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .forEach((apt) => {
        const dt = new Date(apt.dateTime);
        const dayStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        if (!groups[dayStr]) groups[dayStr] = [];
        groups[dayStr].push(apt);
      });
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((dateStr) => ({
        dateStr,
        fullDate: formatUserDate(buildCairoDateTime(dateStr, '12:00'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        appointments: groups[dateStr],
      }));
  }, [completedAppointments]);

  const DAYS_PAGE_SIZE = 5;
  const [daysLimit, setDaysLimit] = useState(DAYS_PAGE_SIZE);
  const visibleGroups = dayGroups.slice(0, daysLimit);
  const hasMore = dayGroups.length > daysLimit;
  const remaining = dayGroups.length - daysLimit;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1 pb-1">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-sm font-black text-emerald-800">المواعيد المنفذة</h3>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="dh-day-shell-green rounded-2xl border text-center py-10 text-slate-400">
          <p className="text-sm font-bold">تاريخ المواعيد فارغ</p>
        </div>
      ) : (
        visibleGroups.map((group) => (
          <CompletedDayGroupCard key={group.dateStr} group={group} onRemove={onRemoveAppointment} />
        ))
      )}

      {hasMore && (
        <button type="button" onClick={() => setDaysLimit((p) => p + DAYS_PAGE_SIZE)}
          className="w-full py-3 rounded-2xl bg-white/80 border border-slate-100 font-bold text-slate-600 text-sm shadow-sm hover:shadow-md hover:bg-white transition-all active:scale-[0.99]">
          تحميل المزيد ({remaining} {remaining === 1 ? 'يوم' : 'أيام'} متبقية)
        </button>
      )}
    </div>
  );
};

// ==================== DayGroup أخضر ====================
const CompletedDayGroupCard: React.FC<{ group: DayGroup; onRemove: (id: string) => void }> = ({ group, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dh-day-shell-green rounded-2xl border overflow-hidden">
      <button type="button" onClick={() => setIsOpen((v) => !v)}
        className="dh-day-head-green w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white hover:brightness-110 transition-colors">
        <div className="font-black text-sm sm:text-base leading-relaxed text-right break-words">{group.fullDate}</div>
        <div className="w-full sm:w-auto shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">{group.appointments.length} موعد</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black transition-colors ${isOpen ? 'bg-white text-emerald-700 border-white' : 'bg-white/20 text-white border-white/40'}`}>
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
            <CompletedCard key={apt.id} apt={apt} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== كارت منفذ ====================
const CompletedCard: React.FC<{ apt: TodayAppointment; onRemove: (id: string) => void }> = ({ apt, onRemove }) => {
  const isConsultation = isConsultationAppointment(apt);
  const normalizedDiscountAmount = Number(apt.discountAmount || 0) || 0;
  const normalizedDiscountPercent = Number(apt.discountPercent || 0) || 0;
  const discountReasonSummary = String(apt.discountReasonLabel || '').trim();
  const discountBadgeText = normalizedDiscountPercent > 0 ? `${normalizedDiscountPercent}%` : (normalizedDiscountAmount > 0 ? `${normalizedDiscountAmount.toFixed(2)} ج.م` : '');

  return (
    <div className="dh-patient-shell rounded-2xl border overflow-hidden">
      <div className="p-3 space-y-2 text-right" dir="rtl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-black text-slate-900 text-sm leading-tight">{apt.patientName || 'مريض بدون اسم'}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${isConsultation ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-teal-100 text-teal-700 border-teal-200'}`}>
            {isConsultation ? 'استشارة' : 'كشف'}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getSourceBadgeStyle(apt.source)}`}>
            {getSourceLabel(apt.source)}
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            {formatUserTime(apt.dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
          </span>
          {apt.paymentType === 'insurance' && (
            <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800">
              تأمين {apt.insuranceCompanyName ? `(${apt.insuranceCompanyName})` : ''}
            </span>
          )}
          {normalizedDiscountAmount > 0 || normalizedDiscountPercent > 0 ? (
            <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
              خصم {discountBadgeText ? `(${discountBadgeText})` : ''}
            </span>
          ) : null}
          {discountReasonSummary && (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800">{discountReasonSummary}</span>
          )}
        </div>

        {apt.examCompletedAt && (
          <p className="text-[11px] font-bold text-emerald-700">
            تم التنفيذ: {formatUserDate(apt.examCompletedAt, { year: 'numeric', month: 'short', day: 'numeric' }, 'ar-EG')}
            {' · '}
            {formatUserTime(apt.examCompletedAt, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
          </p>
        )}

        {apt.visitReason && <p className="text-[11px] font-bold text-slate-500">سبب: {apt.visitReason}</p>}

        {apt.phone && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-600" dir="ltr">{apt.phone}</span>
            <PatientContactActions phone={apt.phone} compact />
          </div>
        )}

        <SecretaryVitalsPills vitals={apt.secretaryVitals} compact />

        <div className="flex justify-start pt-0.5">
          <button type="button" onClick={() => onRemove(apt.id)} className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
