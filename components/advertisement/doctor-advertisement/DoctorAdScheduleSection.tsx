/** قسم مواعيد العيادة: يتيح إضافة وحذف فترات العمل اليومية للطبيب مع إضافة ملاحظات لكل فترة. */
import React from 'react';

import type { DoctorAdScheduleSectionProps } from './types';

export const DoctorAdScheduleSection: React.FC<DoctorAdScheduleSectionProps> = ({
  clinicSchedule,
  newScheduleDay,
  newScheduleFrom,
  newScheduleTo,
  newScheduleNotes,
  daysOfWeek,
  formatTimeWithPeriod,
  onNewScheduleDayChange,
  onNewScheduleFromChange,
  onNewScheduleToChange,
  onNewScheduleNotesChange,
  onAddScheduleRow,
  onRemoveScheduleRow,
}) => {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5">
      <h3 className="text-sm font-black text-slate-700 mb-2.5 block">مواعيد العيادة</h3>
      <div className="grid grid-cols-1 md:grid-cols-[130px_1fr_1fr_1.5fr_auto] gap-2 items-center">
        <select
          value={newScheduleDay}
          onChange={(event) => onNewScheduleDayChange(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
        >
          <option value="">اختر اليوم</option>
          {daysOfWeek.map((dayOption) => (
            <option key={dayOption} value={dayOption}>
              {dayOption}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={newScheduleFrom}
          onChange={(event) => onNewScheduleFromChange(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
        />
        <input
          type="time"
          value={newScheduleTo}
          onChange={(event) => onNewScheduleToChange(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
        />
        <input
          value={newScheduleNotes}
          onChange={(event) => onNewScheduleNotesChange(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          placeholder="ملاحظات (اختياري)"
        />
        <button
          type="button"
          onClick={onAddScheduleRow}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          إضافة
        </button>
      </div>
      <div className="space-y-1.5">
        {clinicSchedule.map((row) => (
          <div key={row.id} className="grid grid-cols-1 md:grid-cols-[130px_1fr_1fr_1.5fr_auto] gap-2 items-center">
            <div className="rounded-xl border border-slate-200 px-3 py-2.5 font-bold text-slate-700 text-sm bg-slate-50">
              {row.day}</div>
            <div className="rounded-xl border border-slate-200 px-3 py-2 font-semibold bg-slate-50 text-slate-700">
              {formatTimeWithPeriod(row.from)}
            </div>
            <div className="rounded-xl border border-slate-200 px-3 py-2 font-semibold bg-slate-50 text-slate-700">
              {formatTimeWithPeriod(row.to)}
            </div>
            <div className="rounded-xl border border-slate-200 px-3 py-2 font-semibold bg-slate-50 text-slate-700">
              {row.notes?.trim() || '-'}
            </div>
            <button
              type="button"
              onClick={() => onRemoveScheduleRow(row.id)}
              className="px-3 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100 transition-colors"
            >
              حذف
            </button>
          </div>
        ))}
        {clinicSchedule.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs font-semibold text-slate-600 text-center bg-slate-50">
            لا توجد مواعيد مضافة بعد.
          </div>
        )}
      </div>
    </section>
  );
};
