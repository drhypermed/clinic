// ─────────────────────────────────────────────────────────────────────────────
// بطاقة طبيب قيد المراجعة (DoctorVerificationCard)
// ─────────────────────────────────────────────────────────────────────────────
// بطاقة مستقلة تعرض طلب طبيب واحد للمراجعة، تحتوي على:
//   • الهيدر: أفاتار + الاسم + التخصص + تاريخ التسجيل
//   • معلومات التواصل (واتساب + بريد)
//   • لينك مستند التحقق (أو تحذير لو غير موجود)
//   • اختيار نوع الحساب (مجاني/مميز) + مدة الاشتراك لو مميز
//   • حقل سبب الرفض (لو محتاج)
//   • أزرار الاعتماد والرفض مع loading states
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  FaArrowLeft, FaCalendarDay, FaCircleCheck, FaCircleXmark,
  FaCrown, FaEnvelope, FaFileLines, FaStethoscope,
  FaTriangleExclamation, FaWhatsapp,
} from 'react-icons/fa6';
import { LoadingText } from '../../ui/LoadingText';
import {
  ContactRow,
  DURATION_OPTIONS,
  formatRegistrationDate,
  getInitials,
  type DoctorVerificationItem,
} from './doctorVerificationHelpers';

interface DoctorVerificationCardProps {
  item: DoctorVerificationItem;
  accountType: 'free' | 'premium' | 'pro_max';
  subscriptionDuration: number;
  rejectNote: string;
  actionLoading: 'approving' | 'rejecting' | null;
  cardError: string;
  cardSuccess: string;
  onAccountTypeChange: (type: 'free' | 'premium' | 'pro_max') => void;
  onDurationChange: (duration: number) => void;
  onRejectNoteChange: (note: string) => void;
  onApprove: () => void;
  onReject: () => void;
}

export const DoctorVerificationCard: React.FC<DoctorVerificationCardProps> = ({
  item,
  accountType,
  subscriptionDuration,
  rejectNote,
  actionLoading,
  cardError,
  cardSuccess,
  onAccountTypeChange,
  onDurationChange,
  onRejectNoteChange,
  onApprove,
  onReject,
}) => {
  const isApproving = actionLoading === 'approving';
  const isRejecting = actionLoading === 'rejecting';
  const isBusy = !!actionLoading;
  const hasSuccess = !!cardSuccess;

  return (
    <article
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        hasSuccess ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200/80'
      }`}
    >
      {/* ═══ هيدر الكارد: أفاتار + الاسم + التخصص + تاريخ (ديسكتوب) ═══ */}
      <div className="flex items-center gap-3 px-4 py-3 bg-sky-50/60 border-b border-sky-100/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white font-black text-sm shadow-sm">
          {getInitials(item.doctorName || 'د')}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-black text-slate-800 truncate">
            {item.doctorName || 'طبيب'}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FaStethoscope className="w-2.5 h-2.5 text-sky-500" />
            <span className="text-[11px] sm:text-xs font-bold text-sky-600 truncate">
              {item.doctorSpecialty || 'بدون تخصص'}
            </span>
          </div>
        </div>
        {item.createdAt && (
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shrink-0">
            <FaCalendarDay className="w-2.5 h-2.5" />
            {formatRegistrationDate(item.createdAt)}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {/* تاريخ التسجيل في الموبايل (ما يظهرش في الهيدر) */}
        {item.createdAt && (
          <div className="sm:hidden flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <FaCalendarDay className="w-2.5 h-2.5" />
            تاريخ التسجيل: {formatRegistrationDate(item.createdAt)}
          </div>
        )}

        {/* معلومات التواصل */}
        <div className="space-y-2">
          {item.doctorWhatsApp && (
            <ContactRow
              icon={<FaWhatsapp />} label="واتساب" value={item.doctorWhatsApp}
              iconBg="bg-emerald-50" iconColor="text-emerald-600" dir="ltr"
            />
          )}
          {item.doctorEmail && (
            <ContactRow
              icon={<FaEnvelope />} label="البريد" value={item.doctorEmail}
              iconBg="bg-blue-50" iconColor="text-blue-600" dir="ltr"
            />
          )}
        </div>

        {/* لينك مستند التحقق (أو تحذير لو غير موجود) */}
        {item.verificationDocUrl ? (
          <a
            href={item.verificationDocUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 transition hover:bg-blue-100/80 hover:shadow-sm group"
          >
            <div className="bg-blue-100 text-blue-600 rounded-lg p-2">
              <FaFileLines className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-blue-700">عرض مستند التحقق</p>
              <p className="text-[10px] font-bold text-blue-500">اضغط لفتح المستند في نافذة جديدة</p>
            </div>
            <FaArrowLeft className="w-3.5 h-3.5 text-blue-400 shrink-0 transition-transform group-hover:-translate-x-1" />
          </a>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
            <FaTriangleExclamation className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-sm font-bold text-amber-700">لا يوجد مستند تحقق مرفوع</span>
          </div>
        )}

        {/* اختيار نوع الحساب (مجاني/برو/برو ماكس) — 3 أزرار */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <label className="mb-2 block text-xs font-black text-slate-600">نوع الحساب</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onAccountTypeChange('free')}
              className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] sm:text-xs font-bold transition ${
                accountType !== 'premium' && accountType !== 'pro_max'
                  ? 'border-2 border-slate-600 bg-slate-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              مجاني
            </button>
            <button
              type="button"
              onClick={() => onAccountTypeChange('premium')}
              className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] sm:text-xs font-bold transition ${
                accountType === 'premium'
                  ? 'border-2 border-amber-500 bg-amber-500 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FaCrown className="w-3 h-3" />
              برو
            </button>
            <button
              type="button"
              onClick={() => onAccountTypeChange('pro_max')}
              className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] sm:text-xs font-black transition ${
                accountType === 'pro_max'
                  ? 'border-2 border-[#FF8F00] bg-gradient-to-r from-[#FFF176] via-[#FFD54F] to-[#FFB300] text-[#B45309] shadow-[0_2px_8px_rgba(255,193,7,0.45)]'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              <FaCrown className={`w-3 h-3 ${accountType === 'pro_max' ? 'text-[#E65100]' : ''}`} />
              برو ماكس
            </button>
          </div>
        </div>

        {/* مدة الاشتراك (تظهر لو برو أو برو ماكس) — الاتنين ذهبي، ماكس أعمق */}
        {(accountType === 'premium' || accountType === 'pro_max') && (
          <div className={`rounded-xl border p-3 ${
            accountType === 'pro_max'
              ? 'border-[#FFB300] bg-gradient-to-r from-[#FFF8E1] via-[#FFF3C4] to-[#FFF8E1]'
              : 'border-amber-100 bg-amber-50/60'
          }`}>
            <label className={`mb-2 block text-xs font-black ${
              accountType === 'pro_max' ? 'text-[#B45309]' : 'text-amber-700'
            }`}>
              مدة اشتراك {accountType === 'pro_max' ? 'برو ماكس' : 'برو'}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DURATION_OPTIONS.map((opt) => {
                const isActive = (subscriptionDuration || 30) === opt.value;
                // برو ماكس ذهبي لامع، برو ذهبي هادئ
                const activeClass = accountType === 'pro_max'
                  ? 'border-2 border-[#FF8F00] bg-gradient-to-r from-[#FFD54F] to-[#FFB300] text-[#B45309] shadow-[0_2px_6px_rgba(255,193,7,0.45)]'
                  : 'border-2 border-amber-500 bg-amber-500 text-white shadow-sm';
                const inactiveClass = accountType === 'pro_max'
                  ? 'border border-[#FFE082] bg-white text-[#B45309] hover:bg-[#FFF8E1]'
                  : 'border border-amber-200 bg-white text-amber-700 hover:bg-amber-50';
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onDurationChange(opt.value)}
                    className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition ${isActive ? activeClass : inactiveClass}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* حقل سبب الرفض */}
        <div>
          <input
            type="text"
            placeholder="سبب الرفض (مطلوب عند الرفض)"
            value={rejectNote}
            onChange={(e) => onRejectNoteChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-100"
          />
        </div>

        {/* رسائل الخطأ والنجاح الخاصة بالكارد */}
        {cardError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            <FaCircleXmark className="w-3 h-3 shrink-0" />
            {cardError}
          </div>
        )}
        {cardSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <FaCircleCheck className="w-3 h-3 shrink-0" />
            {cardSuccess}
          </div>
        )}

        {/* أزرار الاعتماد والرفض */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={onApprove}
            disabled={isBusy}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? (
              <LoadingText>جاري الاعتماد</LoadingText>
            ) : (
              <><FaCircleCheck className="w-3.5 h-3.5" /> اعتماد</>
            )}
          </button>
          <button
            onClick={onReject}
            disabled={isBusy}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRejecting ? (
              <LoadingText>جاري الرفض</LoadingText>
            ) : (
              <><FaCircleXmark className="w-3.5 h-3.5" /> رفض</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
