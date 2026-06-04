/**
 * الملف: PublicBookingFormCard.tsx
 * الوصف: "بطاقة الحجز" المركزية. 
 * تجمع هذه البطاقة المكونات الفرعية (اختيار الموعد + بيانات المريض) في إطار 
 * بصري واحد يتميز بـ:
 * - ترويسة هادئة وأزرار واضحة مناسبة لاستخدام الجمهور على الموبايل.
 * - توزيع منطقي للخطوات (نوع الحجز -> الموعد -> البيانات). 
 * - عرض رسائل الخطأ والتنبيهات (Alerts) بشكل مدمج داخل البطاقة.
 */
import React from 'react';
import { FaArrowRight, FaStethoscope, FaCommentMedical } from 'react-icons/fa6';

import type { PatientGender, PublicBookingSlot } from '../../../types';
import type { AppointmentType } from '../add-appointment-form/types';
import type { PatientSuggestionOption } from '../AddAppointmentForm';
import { PublicBookingSlotSelector } from './PublicBookingSlotSelector';
import { PublicBookingPatientFields } from './PublicBookingPatientFields';
import { PublicBookingAlerts } from './PublicBookingAlerts';
import type { BookingQuotaNotice } from '../../../types';
import { PublicDoctorAvatar } from './PublicDoctorAvatar';

type PublicBookingFormCardProps = {
  configTitle?: string;
  contactInfo?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorProfileImage?: string;
  branchName?: string;
  branchAddress?: string;
  appointmentType: AppointmentType;
  onSelectExam: () => void;
  onSelectConsultation: () => void;
  slotsLoading: boolean;
  slots: PublicBookingSlot[];
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  formatSlotLabel: (dateTime: string) => string;
  phone: string;
  patientName: string;
  age: string;
  gender: PatientGender | '';
  pregnant: boolean | null;
  breastfeeding: boolean | null;
  visitReason: string;
  isFirstVisit: boolean | null;
  activeSuggestionField: 'name' | 'phone' | null;
  phoneSuggestionOptions: PatientSuggestionOption[];
  latestPhoneForName: PatientSuggestionOption | null;
  maxPhoneLength: number;
  maxNameLength: number;
  maxReasonLength: number;
  onPhoneFocus: () => void;
  onPhoneBlur: () => void;
  onPhoneChange: (value: string) => void;
  onPatientNameChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onGenderChange: (value: PatientGender | '') => void;
  onPregnantChange: (value: boolean | null) => void;
  onBreastfeedingChange: (value: boolean | null) => void;
  onVisitReasonChange: (value: string) => void;
  onIsFirstVisitChange: (value: boolean) => void;
  applyPhoneSuggestion: (item: PatientSuggestionOption) => void;
  normalizePhone: (value?: string) => string;
  formError: string | null;
  bookingQuotaNotice: BookingQuotaNotice | null;
  alertRef: React.RefObject<HTMLDivElement | null>;
  submitting: boolean;
  // ─── دعم تسجيل الدخول بعد ملء الفورم ───
  // لو المريض غير مسجل والطبيب طالب جوجل → زر "سجّل دخول بـ Google وأكمل الحجز".
  // غير كده (المريض مسجل، أو الطبيب مش طالب جوجل) → زر submit عادي.
  isLoggedIn?: boolean;
  requireGoogleSignIn?: boolean;
  onBack?: () => void;
  onLoginToBook?: (selectedSlotId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const PublicBookingFormCard: React.FC<PublicBookingFormCardProps> = ({
  configTitle,
  contactInfo,
  doctorName,
  doctorSpecialty,
  doctorProfileImage,
  branchName,
  branchAddress,
  appointmentType,
  onSelectExam,
  onSelectConsultation,
  slotsLoading,
  slots,
  selectedSlotId,
  onSelectSlot,
  formatSlotLabel,
  phone,
  patientName,
  age,
  gender,
  pregnant,
  breastfeeding,
  visitReason,
  isFirstVisit,
  activeSuggestionField,
  phoneSuggestionOptions,
  latestPhoneForName,
  maxPhoneLength,
  maxNameLength,
  maxReasonLength,
  onPhoneFocus,
  onPhoneBlur,
  onPhoneChange,
  onPatientNameChange,
  onAgeChange,
  onGenderChange,
  onPregnantChange,
  onBreastfeedingChange,
  onVisitReasonChange,
  onIsFirstVisitChange,
  applyPhoneSuggestion,
  normalizePhone,
  formError,
  bookingQuotaNotice,
  alertRef,
  submitting,
  isLoggedIn = true,
  requireGoogleSignIn = false,
  onBack,
  onLoginToBook,
  onSubmit,
}) => {
  // الـ Google button يظهر فقط لو الطبيب طالب جوجل والمريض غير مسجّل دخول
  const showGoogleButton = requireGoogleSignIn && !isLoggedIn;
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
      {/* ─── Hero header with gradient ─── */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-l from-emerald-700 via-sky-700 to-brand-700 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/25 bg-white/10 text-[0px] text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto sm:gap-2 sm:px-3 sm:text-sm sm:font-black"
              title="العودة للصفحة السابقة"
            >
              <FaArrowRight className="w-4 h-4" aria-hidden="true" />
              عودة
            </button>
          ) : (
            <span className="w-9 shrink-0 sm:w-20" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-start gap-3">
              <PublicDoctorAvatar imageUrl={doctorProfileImage} name={doctorName || configTitle} size="lg" />
              <div className="min-w-0 flex-1 text-right">
                <h1 className="whitespace-pre-wrap break-words text-base font-black leading-snug text-white sm:text-xl">
                  {configTitle?.trim() || 'حجز موعد'}
                </h1>
                {(doctorName?.trim() || doctorSpecialty?.trim()) && (
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-xs font-bold leading-relaxed text-white/80 sm:text-sm">
                    {[doctorName?.trim(), doctorSpecialty?.trim()].filter(Boolean).join(' — ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {!configTitle?.trim() && (
          <p className="mt-3 text-right text-sm font-bold text-white/70">اختر ميعادًا من المواعيد المتاحة وأكمل البيانات</p>
        )}
      </div>

      {contactInfo?.trim() && (
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
          <p className="max-h-24 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-right text-xs font-bold leading-relaxed text-slate-600 shadow-inner sm:text-sm" dir="rtl">
            {contactInfo.trim()}
          </p>
        </div>
      )}

      {branchName?.trim() && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-right text-sm font-black text-emerald-900">
                {branchName.trim()}
              </p>
              {branchAddress?.trim() && (
                <p className="mt-0.5 text-right text-xs font-bold text-emerald-700/80">
                  {branchAddress.trim()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-5">
        {/* ─── Appointment type selector ─── */}
        <div>
          <label className="block text-xs font-black text-slate-500 mb-2 tracking-wide">نوع الحجز</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onSelectExam}
              className={`group flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-3 text-sm font-black transition-all duration-200 ${appointmentType === 'exam'
                ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-200/50'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700'
                }`}
            >
              <FaStethoscope className={`h-4 w-4 transition-transform group-hover:scale-110 ${appointmentType === 'exam' ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} aria-hidden="true" />
              كشف
            </button>
            <button
              type="button"
              onClick={onSelectConsultation}
              className={`group flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-3 text-sm font-black transition-all duration-200 ${appointmentType === 'consultation'
                ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-200/50'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700'
                }`}
            >
              <FaCommentMedical className={`h-4 w-4 transition-transform group-hover:scale-110 ${appointmentType === 'consultation' ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} aria-hidden="true" />
              استشارة
            </button>
          </div>
        </div>

        <PublicBookingSlotSelector
          slotsLoading={slotsLoading}
          slots={slots}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          formatSlotLabel={formatSlotLabel}
        />

        <PublicBookingPatientFields
          selectedSlotId={selectedSlotId}
          appointmentType={appointmentType}
          phone={phone}
          patientName={patientName}
          age={age}
          gender={gender}
          pregnant={pregnant}
          breastfeeding={breastfeeding}
          visitReason={visitReason}
          isFirstVisit={isFirstVisit}
          activeSuggestionField={activeSuggestionField}
          phoneSuggestionOptions={phoneSuggestionOptions}
          latestPhoneForName={latestPhoneForName}
          maxPhoneLength={maxPhoneLength}
          maxNameLength={maxNameLength}
          maxReasonLength={maxReasonLength}
          onPhoneFocus={onPhoneFocus}
          onPhoneBlur={onPhoneBlur}
          onPhoneChange={onPhoneChange}
          onPatientNameChange={onPatientNameChange}
          onAgeChange={onAgeChange}
          onGenderChange={onGenderChange}
          onPregnantChange={onPregnantChange}
          onBreastfeedingChange={onBreastfeedingChange}
          onVisitReasonChange={onVisitReasonChange}
          onIsFirstVisitChange={onIsFirstVisitChange}
          applyPhoneSuggestion={applyPhoneSuggestion}
          normalizePhone={normalizePhone}
        />

        <PublicBookingAlerts formError={formError} bookingQuotaNotice={bookingQuotaNotice} alertRef={alertRef} />

        {slots.length > 0 && !slotsLoading && (
          showGoogleButton ? (
            // الطبيب طالب جوجل والمريض غير مسجّل → زر Google login ثم يكمل الحجز
            <button
              type="button"
              disabled={submitting}
              onClick={() => onLoginToBook?.(selectedSlotId)}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-brand-400 bg-white py-3.5 font-black text-brand-700 shadow-lg shadow-brand-100/50 transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:shadow-xl disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                  <span>جاري تسجيل الدخول والحجز...</span>
                </>
              ) : (
                <>
                  {/* Google Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.35 11.1H12v2.9h5.33c-.23 1.47-1.77 4.3-5.33 4.3-3.2 0-5.8-2.64-5.8-5.9s2.6-5.9 5.8-5.9c1.82 0 3.04.77 3.74 1.44l2.55-2.46C16.96 3.6 14.72 2.5 12 2.5 7.58 2.5 4 6.08 4 10.5S7.58 18.5 12 18.5c4.62 0 7.68-3.25 7.68-7.83 0-.53-.06-.93-.13-1.57z" />
                  </svg>
                  <span>سجّل دخول بـ Google وأكمل الحجز</span>
                </>
              )}
            </button>
          ) : (
            // غير ذلك (مسجّل، أو الطبيب مش طالب جوجل) → submit عادي
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-brand-600 py-3.5 font-black text-white shadow-lg shadow-brand-300/40 transition-all duration-200 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-400/30 disabled:opacity-60 active:scale-[0.98]"
            >
              {submitting ? 'جاري الحجز...' : 'حجز ميعاد عند الطبيب'}
            </button>
          )
        )}
      </form>

      <div className="bg-gradient-to-l from-slate-50 to-slate-100/50 p-3 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-mono" dir="ltr"></p>
      </div>
    </div>
  );
};
