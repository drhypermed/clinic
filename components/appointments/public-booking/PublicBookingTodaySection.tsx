/**
 * قسم "مواعيد اليوم" فقط — يعرض مواعيد اليوم الحالي مع أزرار الإدخال والتعديل والحذف.
 */
import React from 'react';
import { isConsultationAppointment } from '../../../utils/appointmentType';
import { getSourceBadgeStyle, getSourceIcon, getSourceLabel } from './helpers';
import type { TodayAppointment } from '../../../types';
import { formatUserTime } from '../../../utils/cairoTime';
import { PatientContactActions } from '../../common/PatientContactActions';
import { SecretaryVitalsPills } from '../../common/SecretaryVitalsPills';
import { FirstVisitBadge } from '../FirstVisitBadge';

type PublicBookingTodaySectionProps = {
  sortedTodayAppointments: TodayAppointment[];
  todayDateMeta: { dayName: string; fullDate: string };
  approvedEntryAppointmentIds: string[];
  secretaryApprovedEntryIds: string[];
  pendingEntryAppointmentId: string | null;
  entryRequestSendingId: string | null;
  onRequestEntryNow: (apt: TodayAppointment) => void;
  onEditAppointment: (apt: TodayAppointment) => void;
  onRemoveTodayAppointment: (appointmentId: string) => void;
};

export const PublicBookingTodaySection: React.FC<PublicBookingTodaySectionProps> = ({
  sortedTodayAppointments,
  todayDateMeta,
  approvedEntryAppointmentIds,
  secretaryApprovedEntryIds,
  pendingEntryAppointmentId,
  entryRequestSendingId,
  onRequestEntryNow,
  onEditAppointment,
  onRemoveTodayAppointment,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1 pb-1 flex-wrap">
        <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse shrink-0" />
        <h3 className="text-sm font-black text-brand-800">مواعيد اليوم</h3>
        <span className="text-xs font-bold text-slate-400">{todayDateMeta.dayName} - {todayDateMeta.fullDate}</span>
        {sortedTodayAppointments.length > 0 && (
          <span className="mr-auto text-[11px] font-black bg-brand-100 text-brand-700 rounded-full px-2.5 py-0.5 border border-brand-200">
            {sortedTodayAppointments.length} موعد
          </span>
        )}
      </div>

      {sortedTodayAppointments.length === 0 ? (
        <div className="dh-day-shell rounded-2xl border text-center py-10 text-slate-400">
          <p className="text-sm font-bold">لا توجد مواعيد اليوم</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTodayAppointments.map((apt, idx) => {
            const isConsultation = isConsultationAppointment(apt);
            const sourceLabel = getSourceLabel(apt.source);
            const sourceBadgeStyle = getSourceBadgeStyle(apt.source);
            const sourceIcon = getSourceIcon(apt.source);
            const isApproved = approvedEntryAppointmentIds.includes(apt.id) || secretaryApprovedEntryIds.includes(apt.id);
            const isPending = pendingEntryAppointmentId === apt.id;

            return (
              <div key={apt.id} className="dh-patient-shell rounded-2xl border overflow-hidden">
                <div className="p-3 space-y-2 text-right">
                  {/* الدور + الاسم */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full border border-brand-300 bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-800">#{idx + 1}</span>
                    <span className="font-black text-slate-900 text-sm">{apt.patientName}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${sourceBadgeStyle}`}>
                      <span aria-hidden="true">{sourceIcon}</span><span>{sourceLabel}</span>
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 ${isConsultation ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-brand-100 text-brand-700 border-brand-200'}`}>
                      {isConsultation ? 'استشارة' : 'كشف'}
                    </span>
                    <span className="border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 rounded-full">
                      {formatUserTime(apt.dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
                    </span>
                    <FirstVisitBadge isFirstVisit={apt.isFirstVisit} />
                  </div>

                  {/* التفاصيل */}
                  <div className="text-[11px] font-bold text-slate-500 leading-relaxed space-y-0.5">
                    <p>السن: {(apt.age || '').trim() || 'غير متوفر'}</p>
                    {apt.phone && <p dir="ltr" className="text-right">رقم الموبايل: {apt.phone}</p>}
                    {apt.visitReason && <p>سبب الزيارة: {apt.visitReason}</p>}
                  </div>

                  <SecretaryVitalsPills vitals={apt.secretaryVitals} compact className="mt-1" />
                  {apt.phone && <div className="mt-1"><PatientContactActions phone={apt.phone} compact /></div>}

                  {/* الأكشنز */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success-100 text-success-700 font-bold text-[11px] border border-success-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        تم الدخول
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-warning-100 text-warning-700 font-bold text-[11px] border border-warning-200">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        بانتظار الرد
                      </span>
                    ) : (
                      <button type="button" onClick={() => onRequestEntryNow(apt)} disabled={entryRequestSendingId === apt.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-60">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        {entryRequestSendingId === apt.id ? 'جاري الإرسال' : 'إدخال الآن'}
                      </button>
                    )}
                    <button type="button" onClick={() => onEditAppointment(apt)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      تعديل
                    </button>
                    <button type="button" onClick={() => onRemoveTodayAppointment(apt.id)} className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 transition-all" title="حذف">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
