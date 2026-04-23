import React from 'react';
import type { ClinicAppointment } from '../../types';
import { isConsultationAppointment } from '../../utils/appointmentType';
import { formatUserDate, formatUserTime } from '../../utils/cairoTime';
import { PatientContactActions } from '../common/PatientContactActions';
import { SecretaryVitalsPills } from '../common/SecretaryVitalsPills';

interface AppointmentCardCompletedProps {
  apt: ClinicAppointment;
  patientFileNumber?: number;
  onRemoveAppointment: (id: string) => void;
}

const getSourceLabel = (source?: ClinicAppointment['source']) => {
  if (source === 'secretary') return 'سكرتارية';
  if (source === 'public') return 'جمهور';
  return 'عيادة';
};

const getSourceBadge = (source?: ClinicAppointment['source']) => {
  if (source === 'public') return 'bg-amber-100 text-amber-800 border-amber-300';
  if (source === 'secretary') return 'bg-violet-100 text-violet-800 border-violet-300';
  return 'bg-cyan-100 text-cyan-800 border-cyan-300';
};

export const AppointmentCardCompleted: React.FC<AppointmentCardCompletedProps> = ({
  apt,
  patientFileNumber,
  onRemoveAppointment,
}) => {
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

        {/* Row 1: name + file# */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-black text-slate-900 text-sm leading-tight">{apt.patientName || 'مريض بدون اسم'}</span>
          {typeof patientFileNumber === 'number' && patientFileNumber > 0 && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500">
              #{patientFileNumber}
            </span>
          )}
        </div>

        {/* Row 2: type + source + time + payment badges */}
        <div className="flex flex-wrap items-center gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${isConsultation ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-teal-100 text-teal-700 border-teal-200'}`}>
            {typeLabel}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${getSourceBadge(apt.source)}`}>
            {getSourceLabel(apt.source)}
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            {formatUserTime(apt.dateTime, { hour: '2-digit', minute: '2-digit' })}
          </span>
          {apt.paymentType === 'insurance' && (
            <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800">
              تأمين {apt.insuranceCompanyName ? `(${apt.insuranceCompanyName})` : ''}
            </span>
          )}
          {apt.paymentType === 'discount' && (
            <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
              خصم {discountBadgeText ? `(${discountBadgeText})` : ''}
            </span>
          )}
          {apt.paymentType === 'discount' && discountReasonSummary && (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800">
              {discountReasonSummary}
            </span>
          )}
          {/* الجنس + الحمل + الرضاعة — تظهر لو كانت محفوظة على الموعد */}
          {apt.gender === 'male' && (
            <span className="rounded-full border border-sky-300 bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">ذكر</span>
          )}
          {apt.gender === 'female' && (
            <span className="rounded-full border border-pink-300 bg-pink-100 px-2 py-0.5 text-[10px] font-black text-pink-800">أنثى</span>
          )}
          {apt.pregnant === true && (
            <span className="rounded-full border border-pink-400 bg-pink-200 px-2 py-0.5 text-[10px] font-black text-pink-900">🤰 حامل</span>
          )}
          {apt.breastfeeding === true && (
            <span className="rounded-full border border-pink-400 bg-pink-200 px-2 py-0.5 text-[10px] font-black text-pink-900">🤱 مرضعة</span>
          )}
        </div>

        {/* Row 3: execution time */}
        {apt.examCompletedAt && (
          <p className="text-[11px] font-bold text-emerald-700">
            تم التنفيذ: {formatUserDate(apt.examCompletedAt, { year: 'numeric', month: 'short', day: 'numeric' })}
            {' · '}
            {formatUserTime(apt.examCompletedAt, { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {/* Row 4: visit reason */}
        {apt.visitReason && (
          <p className="text-[11px] font-bold text-slate-500">سبب: {apt.visitReason}</p>
        )}

        {/* Row 5: phone + contact icons */}
        {apt.phone && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-600" dir="ltr">{apt.phone}</span>
            <PatientContactActions phone={apt.phone} compact />
          </div>
        )}

        <SecretaryVitalsPills vitals={apt.secretaryVitals} compact />

        {/* Delete button */}
        <div className="flex justify-start pt-0.5">
          <button
            type="button"
            onClick={() => onRemoveAppointment(apt.id)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
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


