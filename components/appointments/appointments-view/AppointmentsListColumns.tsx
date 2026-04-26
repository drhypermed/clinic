import React, { useState } from 'react';
import type { AppointmentDayGroup, ClinicAppointment } from '../../../types';
import type { SecretaryEntryAlertResponse } from './types';
import { AppointmentCardPending } from '../AppointmentCardPending';
import { AppointmentCardCompleted } from '../AppointmentCardCompleted';
import { DayGroup } from './DayGroup';

interface AppointmentsListColumnsProps {
  todayPending: ClinicAppointment[];
  futurePendingGroups: AppointmentDayGroup[];
  completedGroups: AppointmentDayGroup[];
  todayDateMeta: { dayName: string; fullDate: string };
  now: number;
  todayStr: string;
  approvedEntryAppointmentIds: string[];
  sentEntryForIds: Set<string>;
  secretaryApprovedEntryIds: string[];
  secretaryEntryAlertResponse: SecretaryEntryAlertResponse | null;
  entrySendingId: string | null;
  onSendEntryRequest: (apt: ClinicAppointment) => void;
  onOpenExam: (apt: ClinicAppointment) => void;
  onOpenConsultation: (apt: ClinicAppointment) => void;
  onEditAppointment: (apt: ClinicAppointment) => void;
  onRemoveAppointment: (id: string) => void;
  resolvePatientFileNumberForAppointment: (apt: ClinicAppointment) => number | undefined;
}

export const AppointmentsListColumns: React.FC<AppointmentsListColumnsProps> = ({
  todayPending, futurePendingGroups, completedGroups, todayDateMeta: _todayDateMeta, now, todayStr,
  approvedEntryAppointmentIds, sentEntryForIds, secretaryApprovedEntryIds,
  secretaryEntryAlertResponse, entrySendingId, onSendEntryRequest, onOpenExam,
  onOpenConsultation, onEditAppointment, onRemoveAppointment, resolvePatientFileNumberForAppointment,
}) => {
  const renderPendingCard = (apt: ClinicAppointment, queueOrder?: number) => (    <AppointmentCardPending
      key={apt.id}
      apt={apt}
      patientFileNumber={resolvePatientFileNumberForAppointment(apt)}
      now={now}
      todayStr={todayStr}
      queueOrder={queueOrder}
      approvedEntryAppointmentIds={approvedEntryAppointmentIds}
      sentEntryForIds={sentEntryForIds}
      secretaryApprovedEntryIds={secretaryApprovedEntryIds}
      secretaryEntryAlertResponse={secretaryEntryAlertResponse}
      entrySendingId={entrySendingId}
      onSendEntryRequest={onSendEntryRequest}
      onOpenExam={onOpenExam}
      onOpenConsultation={onOpenConsultation}
      onEditAppointment={onEditAppointment}
      onRemoveAppointment={onRemoveAppointment}
    />
  );

  const hasAnyPending = todayPending.length > 0 || futurePendingGroups.length > 0;
  const hasAnyCompleted = completedGroups.length > 0;

  const COMPLETED_DAYS_PAGE_SIZE = 5;
  const [completedDaysLimit, setCompletedDaysLimit] = useState(COMPLETED_DAYS_PAGE_SIZE);

  const visibleCompletedGroups = completedGroups.slice(0, completedDaysLimit);
  const hasMoreCompletedDays = completedGroups.length > completedDaysLimit;
  const remainingDays = completedGroups.length - completedDaysLimit;

  if (!hasAnyPending && !hasAnyCompleted) {
    return (
      <div className="dh-day-shell rounded-2xl border text-center py-12 text-slate-500">
        <p className="text-sm font-bold">لا توجد مواعيد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
      {/* Pending column — blue */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 px-1 pb-1">
          <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse shrink-0" />
          <h3 className="text-sm font-black text-brand-800">المواعيد المنتظرة</h3>
        </div>
        {todayPending.length > 0 && (
          <DayGroup dateStr={todayStr} appointments={todayPending} defaultOpen variant="blue">
            {todayPending.map((apt, idx) => renderPendingCard(apt, idx + 1))}
          </DayGroup>
        )}
        {futurePendingGroups.map((group) => (
          <DayGroup key={group.date} dateStr={group.date} appointments={group.appointments} variant="blue">
            {group.appointments.map((apt) => renderPendingCard(apt))}
          </DayGroup>
        ))}
        {!hasAnyPending && (
          <div className="dh-day-shell rounded-2xl border text-center py-10 text-slate-400">
            <p className="text-sm font-bold">لا توجد مواعيد منتظرة</p>
          </div>
        )}
      </div>

      {/* Completed column — green */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 px-1 pb-1">
          <div className="w-5 h-5 rounded-full bg-success-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-sm font-black text-success-800">المواعيد المنفذة</h3>
        </div>
        {visibleCompletedGroups.map((group) => (
          <DayGroup key={group.date} dateStr={group.date} appointments={group.appointments} variant="green">
            {group.appointments.map((apt) => (
              <AppointmentCardCompleted
                key={apt.id}
                apt={apt}
                patientFileNumber={resolvePatientFileNumberForAppointment(apt)}
                onRemoveAppointment={onRemoveAppointment}
              />
            ))}
          </DayGroup>
        ))}
        {hasMoreCompletedDays && (
          <button
            type="button"
            onClick={() => setCompletedDaysLimit((prev) => prev + COMPLETED_DAYS_PAGE_SIZE)}
            className="w-full py-3 rounded-2xl bg-white/80 border border-slate-100 font-bold text-slate-600 text-sm shadow-sm hover:shadow-md hover:bg-white transition-all active:scale-[0.99]"
          >
            تحميل المزيد ({remainingDays} {remainingDays === 1 ? 'يوم' : 'أيام'} متبقية)
          </button>
        )}
        {!hasAnyCompleted && (
          <div className="dh-day-shell-green rounded-2xl border text-center py-10 text-slate-400">
            <p className="text-sm font-bold">تاريخ المواعيد فارغ</p>
          </div>
        )}
      </div>
    </div>
  );
};

