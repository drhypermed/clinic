// ─────────────────────────────────────────────────────────────────────────────
// صف موعد واحد في جدول مواعيد اليوم (AppointmentRow)
// ─────────────────────────────────────────────────────────────────────────────
// صف صغير في قائمة مواعيد اليوم يعرض:
//   - وقت الموعد (شارة ملونة)
//   - اسم المريض (مشطوب لو الكشف اتعمل)
//   - شارة "استشارة" لو applicable
//   - العمر + سبب الزيارة
//   - حالة الموعد (تم / بانتظار) كشارة
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaCircleCheck, FaHourglassHalf } from 'react-icons/fa6';
import type { ClinicAppointment } from '../../types';

export const AppointmentRow: React.FC<{ appointment: ClinicAppointment }> = ({ appointment }) => {
  const time = React.useMemo(() => {
    try {
      return new Date(appointment.dateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }, [appointment.dateTime]);

  const isDone = !!appointment.examCompletedAt;
  const isConsultation = appointment.appointmentType === 'consultation';

  // إخفاء visitReason لو نصّه = نوع الموعد (تكرار غير مفيد).
  // مثال: شارة "استشارة" بنفسجيّه + visitReason="استشارة" = نفس الكلمه مرتين.
  const trimmedReason = (appointment.visitReason || '').trim();
  const typeLabel = isConsultation ? 'استشارة' : 'كشف';
  const showReason = trimmedReason.length > 0 && trimmedReason !== typeLabel;

  return (
    <div className={`group flex items-center gap-3 px-4 sm:px-5 py-3.5 ${isDone ? 'bg-slate-50/30' : 'hover:bg-slate-50/60'} transition-all duration-150`}>
      {/* شارة الوقت (رمادي إذا اكتمل، تركوازي لو لسه في الانتظار) */}
      <span className={`text-[11px] sm:text-xs font-bold font-numeric px-2.5 py-1.5 rounded-lg shrink-0 min-w-[52px] text-center transition-colors ${isDone ? 'bg-slate-100/80 text-slate-400' : 'bg-teal-50 text-teal-700 group-hover:bg-teal-100/80'}`}>
        {time}
      </span>

      {/* اسم المريض + التفاصيل */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] sm:text-sm font-bold truncate ${isDone ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}`}>
          {appointment.patientName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isConsultation && (
            <span className="text-[9px] sm:text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full">استشارة</span>
          )}
          {appointment.age && (
            <span className={`text-[10px] sm:text-[11px] ${isDone ? 'text-slate-300' : 'text-slate-400'}`}>{appointment.age}</span>
          )}
          {showReason && (
            <span className={`text-[10px] sm:text-[11px] ${isDone ? 'text-slate-300' : 'text-slate-400'} truncate`}>
              {appointment.age ? '· ' : ''}{trimmedReason}
            </span>
          )}
        </div>
      </div>

      {/* شارة الحالة (تم/بانتظار) */}
      {isDone ? (
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 border border-emerald-100/60">
          <FaCircleCheck className="w-2.5 h-2.5" />تم
        </span>
      ) : (
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 border border-amber-100/60">
          <FaHourglassHalf className="w-2.5 h-2.5" />بانتظار
        </span>
      )}
    </div>
  );
};
