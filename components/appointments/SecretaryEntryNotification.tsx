import React from 'react';
import { hasAppointmentTypeHint, isConsultationAppointment } from '../../utils/appointmentType';

/**
 * الملف: SecretaryEntryNotification.tsx
 * الوصف: نافذة "طلب دخول مريض" التي تظهر للطبيب.
 * يُعتبر هذا المكون هو قلب التواصل اللحظي بين السكرتير والطبيب؛
 * فعندما يكون المريض جاهزاً في الخارج، ترسل السكرتارية هذا الطلب،
 * ويظهر للطبيب نافذة منبثقة ملونة بالبنفسجي (Violet) تحتوي على:
 * - بيانات المريض الجاهز للدخول.
 * - زر "دخول" (Approve) للسماح له بالدخول فوراً.
 * - زر "انتظار" (Reject) لإخبار السكرتير بالانتظار لفترة أطول.
 */

interface SecretaryEntryRequest {
  appointmentId: string;
  patientName: string;
  age?: string;
  visitReason?: string;
  appointmentType?: 'exam' | 'consultation';
  createdAt: string;
  /** جنس المريض — لو ذكر/أنثى يظهر في الإشعار */
  gender?: 'male' | 'female';
  /** حامل؟ للإناث 18-50 */
  pregnant?: boolean;
  /** مرضعة؟ للإناث 18-50 */
  breastfeeding?: boolean;
}

interface SecretaryEntryNotificationProps {
  request: SecretaryEntryRequest;
  onApprove: () => void;
  onReject: () => void;
}

export const SecretaryEntryNotification: React.FC<SecretaryEntryNotificationProps> = ({
  request,
  onApprove,
  onReject,
}) => {
  const isConsultation = isConsultationAppointment(request);

  return (
  <div
    className="fixed top-2 left-0 right-0 z-[9999] mx-auto w-full max-w-2xl px-2 sm:top-4 sm:px-4 animate-fadeIn"
    aria-live="polite"
    dir="rtl"
  >
    <div className="bg-white rounded-2xl shadow-xl border-2 border-violet-400 p-3 sm:p-4 w-full">
      <div className="grid grid-cols-[auto_1fr] items-start gap-2.5 sm:gap-3 min-w-0">
        {/* أيقونة الجرس للتنبيه */}
        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </span>

        {/* بيانات طلب الدخول */}
        <div className="min-w-0 text-right">
          <p className="font-black text-slate-800 text-sm sm:text-base leading-snug">السكرتارية تطلب دخول حالة:</p>
          <p className="font-bold text-slate-700 text-sm sm:text-base leading-snug mt-0.5">{request.patientName}</p>

          {/* Badges للنوع + الحمل + الرضاعة (لو موجودين) — سطر ملون يلفت نظر الطبيب */}
          {(request.gender || typeof request.pregnant === 'boolean' || typeof request.breastfeeding === 'boolean') && (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {request.gender === 'male' && (
                <span className="rounded-full border border-sky-300 bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">ذكر</span>
              )}
              {request.gender === 'female' && (
                <span className="rounded-full border border-pink-300 bg-pink-100 px-2 py-0.5 text-[10px] font-black text-pink-800">أنثى</span>
              )}
              {request.pregnant === true && (
                <span className="rounded-full border border-pink-400 bg-pink-200 px-2 py-0.5 text-[10px] font-black text-pink-900">🤰 حامل</span>
              )}
              {request.breastfeeding === true && (
                <span className="rounded-full border border-pink-400 bg-pink-200 px-2 py-0.5 text-[10px] font-black text-pink-900">🤱 مرضعة</span>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm font-bold text-slate-500 leading-snug mt-0.5">السن: {(request.age || '').trim() || 'غير متوفر'}</p>
          {request.visitReason && (<p className="text-xs sm:text-sm font-bold text-slate-500 leading-snug mt-0.5">سبب الزيارة: {request.visitReason}</p>)}
          {hasAppointmentTypeHint(request) && (
            <p className="text-xs sm:text-sm font-bold text-slate-500 leading-snug mt-0.5">نوع الحجز: {isConsultation ? 'استشارة' : 'كشف'}</p>
          )}
        </div>
      </div>

      {/* أزرار الموافقة أو الرفض (الانتظار) */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button onClick={onApprove} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm w-full shadow-lg transition-transform active:scale-95">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          دخول
        </button>
        <button onClick={onReject} className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm w-full shadow-lg transition-transform active:scale-95">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          انتظار
        </button>
      </div>
    </div>
  </div>
  );
};
