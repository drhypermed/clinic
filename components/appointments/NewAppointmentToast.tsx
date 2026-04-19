import React from 'react';
import { hasAppointmentTypeHint, isConsultationAppointment } from '../../utils/appointmentType';
import { formatUserDate, formatUserTime } from '../../utils/cairoTime';
import type { SecretaryVitalsInput } from '../../types';
import { SecretaryVitalsPills } from '../common/SecretaryVitalsPills';

/**
 * الملف: NewAppointmentToast.tsx
 * الوصف: شريط إشعار "موعد خارجي جديد". 
 * هذا المكون هو حلقة الوصل اللحظية؛ فعندما يقوم شخص ما (سكرتير أو مريض في منزله) 
 * بحجز موعد، يظهر هذا التنبيه فوراً في أعلى صفحة الطبيب لإبلاغه بوجود مريض جديد 
 * انضم للقائمة، مع عرض بيانات المريض ونوع الحجز دون الحاجة لتحديث الصفحة.
 */

interface NewAppointmentToastData {
  patientName: string;
  age?: string;
  visitReason?: string;
  dateTime: string;
  source: 'secretary' | 'public';
  appointmentType?: 'exam' | 'consultation';
  secretaryVitals?: SecretaryVitalsInput;
}

interface NewAppointmentToastProps {
  toast: NewAppointmentToastData;
  onClose: () => void;
}

export const NewAppointmentToast: React.FC<NewAppointmentToastProps> = ({ toast, onClose }) => {
  const isConsultation = isConsultationAppointment(toast);

  return (
  <div
    className="fixed top-3 left-0 right-0 z-[9999] mx-auto w-full max-w-2xl px-2 sm:top-4 sm:px-4 animate-fadeIn"
    aria-live="polite"
    dir="rtl"
  >
    <div
      className={`rounded-2xl shadow-xl border-2 p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3 ${
        toast.source === 'secretary' ? 'bg-white border-violet-400' : 'bg-white border-amber-400'
      }`}
    >
      {/* أيقونة التنبيه ملونة حسب المصدر */}
      <span
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
          toast.source === 'secretary' ? 'bg-violet-100' : 'bg-amber-100'
        }`}
      >
        <svg className={`w-5 h-5 ${toast.source === 'secretary' ? 'text-violet-600' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>

      {/* تفاصيل الموعد الجديد */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-slate-800 text-xs sm:text-sm leading-snug">
          مصدر الحجز: {toast.source === 'secretary' ? 'حجز من السكرتارية' : 'حجز من الفورم العام'}
        </p>
        <p className="font-bold text-slate-700 text-xs sm:text-sm mt-0.5">اسم المريض: {toast.patientName}</p>
        <p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">السن: {(toast.age || '').trim() || 'غير متوفر'}</p>
        {toast.visitReason && (<p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">سبب الزيارة: {toast.visitReason}</p>)}
        <SecretaryVitalsPills vitals={toast.secretaryVitals} compact className="mt-2" />
        {hasAppointmentTypeHint(toast) && (
          <p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">نوع الحجز: {isConsultation ? 'استشارة' : 'كشف'}</p>
        )}
        <p className="text-[11px] sm:text-xs font-bold text-slate-600 mt-0.5">
          موعد الزيارة:{' '}
          {formatUserDate(toast.dateTime, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }, 'ar-EG')}{' '}
          - {formatUserTime(toast.dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
        </p>
      </div>

      {/* زر الإغلاق */}
      <button onClick={onClose} className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 text-slate-500 shrink-0 self-start" title="إغلاق">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  </div>
  );
};
