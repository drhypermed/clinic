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
import { FaArrowRight } from 'react-icons/fa6';

import type { PatientGender, PublicBookingSlot } from '../../../types';
import type { AppointmentType } from '../add-appointment-form/types';
import type { PatientSuggestionOption } from '../AddAppointmentForm';
import { PublicBookingSlotSelector } from './PublicBookingSlotSelector';
import { PublicBookingPatientFields } from './PublicBookingPatientFields';
import { PublicBookingAlerts } from './PublicBookingAlerts';
import type { BookingQuotaNotice } from '../../../types';

type PublicBookingFormCardProps = {
  configTitle?: string;
  contactInfo?: string;
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
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100"
              title="العودة للصفحة السابقة"
            >
              <FaArrowRight className="w-4 h-4" aria-hidden="true" />
              عودة
            </button>
          ) : (
            <span className="w-20 shrink-0" aria-hidden="true" />
          )}
          <h1 className="min-w-0 flex-1 text-center text-lg font-black text-slate-900">
            {configTitle?.trim() || 'حجز موعد - فورم الجمهور'}
          </h1>
          <span className="w-20 shrink-0" aria-hidden="true" />
        </div>
        {!configTitle?.trim() && (
          <p className="mt-0.5 text-center text-sm font-bold text-slate-500">اختر ميعادًا من المواعيد المتاحة وأكمل البيانات</p>
        )}
      </div>

      {contactInfo?.trim() && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm font-bold text-slate-700" dir="rtl">
            {contactInfo.trim()}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4 sm:p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الحجز</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSelectExam}
              className={`rounded-lg border px-3 py-2 text-sm font-black transition-all ${appointmentType === 'exam'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
            >
              كشف
            </button>
            <button
              type="button"
              onClick={onSelectConsultation}
              className={`rounded-lg border px-3 py-2 text-sm font-black transition-all ${appointmentType === 'consultation'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
            >
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
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-brand-500 bg-white py-3 font-black text-brand-700 shadow-sm transition-all hover:bg-brand-50 disabled:opacity-60"
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
              className="w-full rounded-lg bg-brand-600 py-3 font-black text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'جاري الحجز...' : 'حجز ميعاد عند الطبيب'}
            </button>
          )
        )}
      </form>

      <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-mono" dir="ltr"></p>
      </div>
    </div>
  );
};

