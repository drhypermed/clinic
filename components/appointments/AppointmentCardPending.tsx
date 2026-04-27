import React from 'react';
import type { ClinicAppointment } from '../../types';
import { toLocalDateStr } from './utils';
import { isConsultationAppointment } from '../../utils/appointmentType';
import { formatUserTime } from '../../utils/cairoTime';
import { PatientContactActions } from '../common/PatientContactActions';
import { SecretaryVitalsPills } from '../common/SecretaryVitalsPills';
import { FirstVisitBadge } from './FirstVisitBadge';

interface AppointmentCardPendingProps {
  apt: ClinicAppointment;
  patientFileNumber?: number;
  now: number;
  todayStr: string;
  queueOrder?: number;
  approvedEntryAppointmentIds: string[];
  sentEntryForIds: Set<string>;
  secretaryApprovedEntryIds: string[];
  secretaryEntryAlertResponse: { status: 'approved' | 'rejected'; appointmentId: string; respondedAt: string } | null;
  entrySendingId: string | null;
  onSendEntryRequest: (apt: ClinicAppointment) => void;
  onOpenExam: (apt: ClinicAppointment) => void;
  onOpenConsultation: (apt: ClinicAppointment) => void;
  onEditAppointment?: (apt: ClinicAppointment) => void;
  onRemoveAppointment: (id: string) => void;
}

const getSourceLabel = (source?: ClinicAppointment['source']) => {
  if (source === 'secretary') return 'سكرتارية';
  if (source === 'public') return 'جمهور';
  return 'عيادة';
};

const getSourceBadge = (source?: ClinicAppointment['source']) => {
  if (source === 'public') return 'bg-warning-100 text-warning-800 border-warning-300';
  if (source === 'secretary') return 'bg-slate-100 text-slate-800 border-slate-300';
  return 'bg-brand-100 text-brand-800 border-brand-300';
};

// ─ React.memo: قائمة المواعيد طويلة (10-50 موعد) في صفحة المواعيد، وكل re-render
//   كان يعيد render كل البطاقات. الـmemo يخفّض ده لـbatches خفيفة.
const AppointmentCardPendingComponent: React.FC<AppointmentCardPendingProps> = ({
  apt, patientFileNumber, now, todayStr, queueOrder, approvedEntryAppointmentIds, sentEntryForIds,
  secretaryApprovedEntryIds, secretaryEntryAlertResponse, entrySendingId,
  onSendEntryRequest, onOpenExam, onOpenConsultation, onEditAppointment, onRemoveAppointment,
}) => {
  const aptTime = new Date(apt.dateTime).getTime();
  const isPast = aptTime < now;
  const isToday = toLocalDateStr(new Date(apt.dateTime)) === todayStr;
  const isConsultation = isConsultationAppointment(apt);
  const typeLabel = isConsultation ? 'استشارة' : 'كشف';
  const normalizedDiscountAmount = Number(apt.discountAmount || 0) || 0;
  const normalizedDiscountPercent = Number(apt.discountPercent || 0) || 0;
  const discountReasonSummary = String(apt.discountReasonLabel || '').trim();
  const discountBadgeText =
    normalizedDiscountPercent > 0
      ? `${normalizedDiscountPercent}%`
      : (normalizedDiscountAmount > 0 ? `${normalizedDiscountAmount.toFixed(2)} ج.م` : '');

  return (
    <li className="dh-patient-shell rounded-2xl border overflow-hidden">
      <div className="p-3 space-y-2 text-right" dir="rtl">

        {/* Row 1: queue badge + name + file# */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {typeof queueOrder === 'number' && queueOrder > 0 && (
            <span className="inline-flex items-center rounded-full border border-brand-300 bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-800 shrink-0">
              رقم {queueOrder}
            </span>
          )}
          <span className="font-black text-slate-900 text-sm leading-tight">{apt.patientName || 'مريض بدون اسم'}</span>
          {typeof patientFileNumber === 'number' && patientFileNumber > 0 && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500">
              #{patientFileNumber}
            </span>
          )}
        </div>

        {/* Row 2: type + source + time + payment badges */}
        <div className="flex flex-wrap items-center gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${isConsultation ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-brand-100 text-brand-700 border-brand-200'}`}>
            {typeLabel}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getSourceBadge(apt.source)}`}>
            {getSourceLabel(apt.source)}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700">
            {formatUserTime(apt.dateTime, { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isToday && (
            <span className="rounded-full border border-danger-200 bg-danger-100 px-2 py-0.5 text-[10px] font-black text-danger-800">اليوم</span>
          )}
          {apt.paymentType === 'insurance' && (
            <span className="rounded-full border border-brand-200 bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-800">
              تأمين {apt.insuranceCompanyName ? `(${apt.insuranceCompanyName})` : ''}
            </span>
          )}
          {apt.paymentType === 'discount' && (
            <span className="rounded-full border border-warning-200 bg-warning-100 px-2 py-0.5 text-[10px] font-black text-warning-800">
              خصم {discountBadgeText ? `(${discountBadgeText})` : ''}
            </span>
          )}
          {apt.paymentType === 'discount' && discountReasonSummary && (
            <span className="rounded-full border border-warning-200 bg-warning-50 px-2 py-0.5 text-[10px] font-bold text-warning-800">
              {discountReasonSummary}
            </span>
          )}
          {isPast && (
            <span className="rounded-full border border-warning-200 bg-warning-50 px-2 py-0.5 text-[10px] font-black text-warning-700">⚠️ فات الموعد</span>
          )}
          <FirstVisitBadge isFirstVisit={apt.isFirstVisit} />
          {/* الجنس + الحمل + الرضاعة — تظهر لو السكرتاريه دخلتها عشان الطبيب يعرفها من الكارت مباشرة */}
          {apt.gender === 'male' && (
            <span className="rounded-full border border-brand-300 bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-800">ذكر</span>
          )}
          {apt.gender === 'female' && (
            <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-800">أنثى</span>
          )}
          {apt.pregnant === true && (
            <span className="rounded-full border border-slate-400 bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-900">🤰 حامل</span>
          )}
          {apt.breastfeeding === true && (
            <span className="rounded-full border border-slate-400 bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-900">🤱 مرضعة</span>
          )}
        </div>

        {/* Row 3: age + visit reason */}
        {((apt.age || '').trim() || apt.visitReason) && (
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
            {(apt.age || '').trim() ? <span>السن: {apt.age}{apt.visitReason ? ' · ' : ''}</span> : null}
            {apt.visitReason ? <span>سبب: {apt.visitReason}</span> : null}
          </p>
        )}

        {/* Row 4: phone + contact icons */}
        {apt.phone && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-600" dir="ltr">{apt.phone}</span>
            <PatientContactActions phone={apt.phone} compact />
          </div>
        )}

        <SecretaryVitalsPills vitals={apt.secretaryVitals} compact />

        {/* Row 5: action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {(approvedEntryAppointmentIds.includes(apt.id) || secretaryApprovedEntryIds.includes(apt.id)) ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success-100 text-success-700 font-bold text-[11px] border border-success-200">تمت الموافقة</span>
          ) : sentEntryForIds.has(apt.id) ? (
            secretaryEntryAlertResponse?.appointmentId === apt.id && secretaryEntryAlertResponse?.status === 'rejected' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-warning-100 text-warning-700 font-bold text-[11px] border border-warning-200">غير موجود</span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success-100 text-success-700 font-bold text-[11px] border border-success-200">تم إرسال الطلب</span>
            )
          ) : (
            <button
              type="button"
              onClick={() => onSendEntryRequest(apt)}
              disabled={entrySendingId === apt.id}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-60"
            >
              {entrySendingId === apt.id ? 'جاري الإرسال' : 'دخول'}
            </button>
          )}

          {!isConsultation && (
            <button onClick={() => onOpenExam(apt)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-success-600 hover:bg-success-700 text-white font-bold text-xs shadow-md transition-all">فتح الكشف</button>
          )}

          {isConsultation && (
            <button onClick={() => onOpenConsultation(apt)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all">فتح الاستشارة</button>
          )}

          {onEditAppointment && (
            <button onClick={() => onEditAppointment(apt)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all">تعديل</button>
          )}

          <button
            onClick={() => onRemoveAppointment(apt.id)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-danger-50 hover:text-danger-600 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
};

export const AppointmentCardPending = React.memo(AppointmentCardPendingComponent);


