/**
 * الملف: PublicBookingPatientFields.tsx
 * الوصف: نموذج "حقول بيانات المريض". 
 * يحتوي على الحقول الأساسية التي يملأها المريض (الاسم، السن، الموبايل، السبب). 
 * يتميز بـ: 
 * - دعم خاص للبحث اللحظي برقم الهاتف؛ حيث يعرض للمريض بياناته السابقة 
 *   بمجرد كتابة رقمه المسجل مسبقاً (Smart Lookup). 
 * - التحقق من أطوال النصوص (Max Length) لمنع إدخال بيانات ضخمة غير مبررة. 
 * - استخدام مكون AgeUnitInput لتوحيد تنسيق العمر.
 */
import React, { useMemo } from 'react';

import { AgeUnitInput } from '../AgeUnitInput';
import type { PatientSuggestionOption } from '../AddAppointmentForm';
import type { AppointmentType } from '../AddAppointmentForm';
import { formatUserDate } from '../../../utils/cairoTime';
import type { PatientGender } from '../../../types';
import { parseAgeToYearsMonthsDays } from '../utils';
// قرار سؤال الحمل/الرضاعة
import {
  bestGuessAgeYears,
  shouldAskFertilityQuestions,
} from '../../../utils/patientIdentity';

type PublicBookingPatientFieldsProps = {
  selectedSlotId: string;
  appointmentType: AppointmentType;
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
  maxAgeLength: number;
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
};

export const PublicBookingPatientFields: React.FC<PublicBookingPatientFieldsProps> = ({
  selectedSlotId,
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
}) => {
  // قرار ظهور الحمل/الرضاعة: أنثى + 18-50 سنة (من السن المدخل)
  // ملاحظة: hooks لازم تكون قبل أي early return عشان يفضل ترتيبها ثابت بين renders
  const effectiveAgeYears = useMemo(() => {
    const ageParts = parseAgeToYearsMonthsDays(age);
    return bestGuessAgeYears({ ageParts, ageText: age });
  }, [age]);
  const askFertility = shouldAskFertilityQuestions(gender, effectiveAgeYears);

  if (!selectedSlotId) return null;

  return (
    <>
      <div className="relative">
        <label className="block text-xs font-bold text-slate-500 mb-1.5">رقم التليفون</label>
        <input
          type="tel"
          value={phone}
          onFocus={onPhoneFocus}
          onBlur={onPhoneBlur}
          onChange={(e) => onPhoneChange(e.target.value)}
          maxLength={maxPhoneLength}
          placeholder="01xxxxxxxxx"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-bold"
          dir="ltr"
        />
        {latestPhoneForName && normalizePhone(phone) !== normalizePhone(latestPhoneForName.phone) && (
          <button
            type="button"
            onClick={() => applyPhoneSuggestion(latestPhoneForName)}
            className="mt-1 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800"
          >
            أحدث رقم لهذا الاسم: {normalizePhone(latestPhoneForName.phone)}
          </button>
        )}
        {activeSuggestionField === 'phone' && phoneSuggestionOptions.length > 0 && (
          <div className="mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto">
            {phoneSuggestionOptions.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyPhoneSuggestion(item)}
                className="w-full text-right px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-amber-50"
              >
                <div className="text-sm font-black text-slate-800">{item.patientName}</div>
                <div className="text-xs font-bold text-slate-600">{normalizePhone(item.phone)}{item.age ? ` · السن: ${item.age}` : ''}</div>
                {item.lastExamDate && (
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                    آخر كشف: {formatUserDate(item.lastExamDate, undefined, 'ar-EG-u-nu-latn')}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم المريض</label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => onPatientNameChange(e.target.value)}
          maxLength={maxNameLength}
          placeholder="الاسم الكامل"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-bold"
          dir="rtl"
        />
      </div>

      {/* السن ثم النوع في صف واحد على الشاشات الأكبر من الموبايل (بدون فراغات) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">السن</label>
          <AgeUnitInput
            ageString={age}
            onAgeChange={onAgeChange}
            placeholder="0"
            inputClassName="focus:ring-amber-500 focus:border-amber-500"
            selectClassName="focus:ring-amber-500"
          />
        </div>
        {/* النوع بعد السن مباشرة — ثابت للمريض، ينتقل تلقائي في الحجوزات القادمة */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">النوع</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onGenderChange('male')}
              className={`px-3 py-2.5 rounded-xl border text-sm font-black transition-all ${
                gender === 'male'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ذكر
            </button>
            <button
              type="button"
              onClick={() => onGenderChange('female')}
              className={`px-3 py-2.5 rounded-xl border text-sm font-black transition-all ${
                gender === 'female'
                  ? 'bg-pink-600 text-white border-pink-700 shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              أنثى
            </button>
          </div>
        </div>
      </div>

      {/* حمل/رضاعة — مباشرة تحت النوع، يظهر بس للإناث 18-50 */}
      {askFertility && (
        <div className="rounded-2xl border border-pink-200 bg-pink-50/60 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">هل حضرتك حامل؟</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onPregnantChange(true)}
                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                    pregnant === true ? 'bg-pink-600 text-white border-pink-700' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  نعم، حامل
                </button>
                <button
                  type="button"
                  onClick={() => onPregnantChange(false)}
                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                    pregnant === false ? 'bg-slate-700 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  لا
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">هل حضرتك مرضعة؟</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onBreastfeedingChange(true)}
                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                    breastfeeding === true ? 'bg-pink-600 text-white border-pink-700' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  نعم، مرضعة
                </button>
                <button
                  type="button"
                  onClick={() => onBreastfeedingChange(false)}
                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                    breastfeeding === false ? 'bg-slate-700 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  لا
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-500">سبب الزيارة</label>
          <span className="text-[10px] font-bold text-slate-400">
            {visitReason.length}/{maxReasonLength}
          </span>
        </div>
        <input
          type="text"
          value={visitReason}
          onChange={(e) => onVisitReasonChange(e.target.value)}
          maxLength={maxReasonLength}
          placeholder="مثال: كشف دوري، متابعة..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 font-bold"
          dir="rtl"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1.5">هل هي أول زيارة؟</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onIsFirstVisitChange(true)}
            className={`px-3 py-2 rounded-xl border text-sm font-black transition-all ${isFirstVisit === true
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
          >
            نعم، أول زيارة
          </button>
          <button
            type="button"
            onClick={() => onIsFirstVisitChange(false)}
            className={`px-3 py-2 rounded-xl border text-sm font-black transition-all ${isFirstVisit === false
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
          >
            لا، زرت من قبل
          </button>
        </div>
      </div>

    </>
  );
};
