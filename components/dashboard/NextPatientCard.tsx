// ─────────────────────────────────────────────────────────────────────────────
// بطاقة المريض التالي في لوحة الطبيب (NextPatientCard)
// ─────────────────────────────────────────────────────────────────────────────
// بطاقة مميزة (تدرج تركوازي) تظهر المريض اللي عليه الدور:
//   - اسم المريض والعمر وسبب الزيارة
//   - شارة "استشارة" لو كانت استشارة
//   - وقت الموعد (مع تنسيق عربي)
//   - القياسات اللي سجلتها السكرتارية (ضغط، نبض، درجة حرارة ...)
//   - زر "ابدأ الكشف" ينقل الطبيب لتبويب الروشتة
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaStethoscope, FaUser } from 'react-icons/fa6';
import type { ClinicAppointment } from '../../types';

interface NextPatientCardProps {
  appointment: ClinicAppointment;
  onStartExam: () => void;
}

export const NextPatientCard: React.FC<NextPatientCardProps> = ({ appointment, onStartExam }) => {
  // تنسيق الوقت بالعربي مع fallback لو التاريخ غلط
  const time = React.useMemo(() => {
    try {
      return new Date(appointment.dateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  }, [appointment.dateTime]);

  const isConsultation = appointment.appointmentType === 'consultation';

  return (
    <div className="relative bg-gradient-to-bl from-teal-500 via-teal-600 to-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-[0_4px_24px_-4px_rgba(13,148,136,0.4)] overflow-hidden">
      {/* عناصر زخرفية — دوائر مبهمة خلفية */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-white/[0.05] rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-teal-300/10 rounded-full blur-3xl" />
      <div className="absolute top-4 left-4 w-20 h-20 border border-white/[0.06] rounded-full" />
      <div className="absolute bottom-8 right-8 w-32 h-32 border border-white/[0.04] rounded-full" />

      <div className="relative z-10">
        {/* الهيدر: أيقونة مريض + تسمية + الوقت */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <FaUser className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-teal-100 uppercase tracking-widest">المريض التالي</span>
          </div>
          <span className="text-[11px] sm:text-xs font-bold font-numeric text-white bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">{time}</span>
        </div>

        {/* اسم المريض والتفاصيل */}
        <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5 truncate">{appointment.patientName}</h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-teal-200/80 font-medium">
          {appointment.age && <span className="bg-white/10 rounded-full px-2 py-0.5">{appointment.age}</span>}
          {isConsultation && <span className="bg-violet-400/30 text-violet-100 px-2.5 py-0.5 rounded-full font-bold border border-violet-300/20">استشارة</span>}
          {appointment.visitReason && <span className="truncate opacity-80">{appointment.visitReason}</span>}
        </div>

        {/* قياسات السكرتارية لو موجودة */}
        {appointment.secretaryVitals && Object.keys(appointment.secretaryVitals).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(appointment.secretaryVitals).map(([key, val]) => {
              if (!val || (typeof val === 'string' && !val.trim())) return null;
              return (
                <span key={key} className="bg-white/10 text-teal-100 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/[0.08]">
                  {String(val)}
                </span>
              );
            })}
          </div>
        )}

        {/* زر "ابدأ الكشف" */}
        <button
          onClick={onStartExam}
          className="group mt-5 w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white text-teal-700 hover:bg-teal-50 active:bg-teal-100 px-6 py-3 rounded-xl font-black text-sm shadow-[0_4px_12px_-2px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_-2px_rgba(0,0,0,0.2)] transition-all duration-200"
        >
          <FaStethoscope className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
          ابدأ الكشف
        </button>
      </div>
    </div>
  );
};
