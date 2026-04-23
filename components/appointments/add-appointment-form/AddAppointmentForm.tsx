import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PatientSuggestionOption } from './types';
import { RecentExamPatientOption } from './types';
import { AgeUnitInput } from '../AgeUnitInput';
import { ConsultationCandidatesPanel } from './ConsultationCandidatesPanel';
import { PatientSuggestionsDropdown } from './PatientSuggestionsDropdown';
import { getVisiblePatientSuggestions, normalizePhoneDigits, toPositiveFileNumber } from './helpers';
import { sanitizeExternalHttpUrl } from './securityUtils';
import type { AddAppointmentFormProps } from './types';
import type { CustomBox } from '../../../types';
import { parseAgeToYearsMonthsDays } from '../utils';
// دوال هوية المريض: قرار سؤال الحمل/الرضاعة
import {
  bestGuessAgeYears,
  shouldAskFertilityQuestions,
} from '../../../utils/patientIdentity';
import {
  computeSecretaryBmiValue,
  isSecretaryFieldEnabled,
  isSecretaryVitalKey,
  isSecretaryVitalEnabled,
  normalizeSecretaryVitalValue,
  normalizeSecretaryVitalFieldDefinitions,
  toSecretaryCustomFieldId,
  toSecretaryVitalSignConfigs,
} from '../../../utils/secretaryVitals';
import { InsurancePaymentSelector } from '../../prescription/InsurancePaymentSelector';

/**
 * الملف: AddAppointmentForm.tsx
 * الوصف: هذا هو "النموذج الذكي" لإضافة المواعيد يدوياً من داخل واجهة الطبيب. 
 * يتميز هذا النموذج بـ: 
 * - دعم البحث اللحظي والاقتراحات للمرضى المسجلين مسبقاً (Auto-suggest). 
 * - لوحة مخصصة لاختيار مرشحي الاستشارات (المرضى الذين يستحقون استشارة مجانية أو مخفضة). 
 * - التحقق التلقائي من توفر "كوتا" الحجز قبل الحفظ. 
 * - واجهة مرنة تتغير ألوانها وخصائصها بناءً على نوع الموعد (كشف vs استشارة).
 */

export const AddAppointmentForm: React.FC<AddAppointmentFormProps> = ({
  patientName, onPatientNameChange, age, onAgeChange, phone, onPhoneChange,
  gender = '', onGenderChange,
  pregnant = null, onPregnantChange,
  breastfeeding = null, onBreastfeedingChange,
  dateStr, onDateStrChange, timeStr, onTimeStrChange, visitReason, onVisitReasonChange,
  secretaryVitals = {}, secretaryVitalFields = [], secretaryVitalsVisibility, onSecretaryVitalsChange,
  todayStr, timeMin, saving, formError, bookingQuotaNotice, onSubmit,
  appointmentType = 'exam', onAppointmentTypeChange, consultationCandidates = [],
  selectedConsultationCandidateId, onSelectConsultationCandidate,
  patientSuggestions = [], onSelectPatientSuggestion,
  canLoadMoreConsultationCandidates = false, onLoadMoreConsultationCandidates,
  submitLabel, hideTopHeader = false, isOpen = true, onToggleOpen,
  bookingSecret,
  userId, activeBranchId, paymentType = 'cash', onPaymentTypeChange,
  insuranceCompanyId = '', onInsuranceCompanyIdChange,
  insuranceCompanyName = '', onInsuranceCompanyNameChange,
  insuranceApprovalCode = '', onInsuranceApprovalCodeChange,
  insuranceMembershipId = '', onInsuranceMembershipIdChange,
  patientSharePercent = 0, onPatientSharePercentChange,
  discountAmount = 0, onDiscountAmountChange,
  discountPercent = 0, onDiscountPercentChange,
  discountReasonId = '', onDiscountReasonIdChange,
  discountReasonLabel = '',
  onDiscountReasonLabelChange,
  discountReasons,
  insuranceCompanies: propInsuranceCompanies,
}) => {
  const detailsStartRef = useRef<HTMLDivElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const [activeSuggestionField, setActiveSuggestionField] = useState<'name' | 'phone' | null>(null);
  const isConsultationMode = appointmentType === 'consultation';

  // قرار ظهور سؤال الحمل/الرضاعة: أنثى + سن 18-50 (من السن المدخل)
  const effectiveAgeYears = useMemo(() => {
    const ageParts = parseAgeToYearsMonthsDays(age);
    return bestGuessAgeYears({ ageParts, ageText: age });
  }, [age]);
  const askFertility = shouldAskFertilityQuestions(gender || '', effectiveAgeYears);

  // التمرير التلقائي للتنبيهات عند حدوث خطأ أو تنبيه كوتا
  useEffect(() => {
    if (!bookingQuotaNotice && !formError) return;
    if (!alertRef.current) return;
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [bookingQuotaNotice, formError]);

  /** 
   * حساب الاقتراحات (Suggestions Logic). 
   * يقوم المكون بتصفية قائمة المرضى المسجلين مسبقاً لعرض الأقرب لما 
   * يكتبه المستخدم حالياً، سواءً كان يكتب الاسم أو رقم الهاتف.
   */
  const visiblePatientSuggestions = useMemo(
    () => getVisiblePatientSuggestions(patientSuggestions, activeSuggestionField, patientName, phone),
    [patientSuggestions, activeSuggestionField, patientName, phone]
  );

  const currentPatientFileNumber = useMemo(() => {
    const normalizedName = String(patientName || '').trim().toLocaleLowerCase();
    if (!normalizedName) return undefined;

    const normalizedPhone = normalizePhoneDigits(phone);
    const byName = patientSuggestions.filter(
      (item) => String(item.patientName || '').trim().toLocaleLowerCase() === normalizedName
    );
    if (byName.length === 0) return undefined;

    const exactPhoneMatch = normalizedPhone
      ? byName.find((item) => normalizePhoneDigits(item.phone) === normalizedPhone)
      : undefined;
    const selected = exactPhoneMatch || byName[0];
    return toPositiveFileNumber(selected?.patientFileNumber);
  }, [patientSuggestions, patientName, phone]);

  // تطهير رابط الواتساب الخاص بالكوتا لضمان الأمان
  const quotaWhatsappHref = useMemo(
    () => sanitizeExternalHttpUrl(bookingQuotaNotice?.whatsappUrl),
    [bookingQuotaNotice?.whatsappUrl]
  );

  // عند اختيار مريض من قائمة مرشحي الاستشارة
  const handleSelectCandidate = (candidate: RecentExamPatientOption) => {
    onSelectConsultationCandidate?.(candidate);
    requestAnimationFrame(() => {
      detailsStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const closeSuggestions = () => {
    setTimeout(() => setActiveSuggestionField(null), 120);
  };

  const secretaryVitalsConfig = useMemo(
    () => toSecretaryVitalSignConfigs(undefined, {
      visibility: secretaryVitalsVisibility,
      fieldDefinitions: secretaryVitalFields,
    }),
    [secretaryVitalFields, secretaryVitalsVisibility]
  );

  const normalizedSecretaryFieldDefinitions = useMemo(
    () => normalizeSecretaryVitalFieldDefinitions(secretaryVitalFields),
    [secretaryVitalFields]
  );

  const enabledSecretaryFields = useMemo(
    () =>
      normalizedSecretaryFieldDefinitions.filter((field) =>
        isSecretaryFieldEnabled(secretaryVitalsVisibility, field.id, field.key)
      ),
    [normalizedSecretaryFieldDefinitions, secretaryVitalsVisibility]
  );

  const secretaryCustomBoxes = useMemo<CustomBox[]>(
    () =>
      enabledSecretaryFields
        .filter((field) => field.kind === 'customBox')
        .map((field, index) => ({
          id: field.id,
          label: String(field.labelAr || field.label || '').trim() || `حقل ${index + 1}`,
          enabled: true,
          order: field.order,
          value: '',
        })),
    [enabledSecretaryFields]
  );

  const readSecretaryFieldValue = (fieldId: string, customBoxId?: string): string => {
    const normalizedFieldId = String(fieldId || '').trim();
    if (!normalizedFieldId) return '';

    const normalizedCustomBoxId = String(customBoxId || '').trim();
    const maybeCustomFieldId = normalizedCustomBoxId ? toSecretaryCustomFieldId(normalizedCustomBoxId) : '';

    return normalizeSecretaryVitalValue(
      secretaryVitals?.[normalizedFieldId] ??
        (maybeCustomFieldId ? secretaryVitals?.[maybeCustomFieldId] : undefined) ??
        (normalizedCustomBoxId ? secretaryVitals?.[normalizedCustomBoxId] : undefined)
    );
  };

  const secretaryCustomBoxValues = useMemo(() => {
    const values: Record<string, string> = {};
    enabledSecretaryFields.forEach((field) => {
      if (field.kind !== 'customBox') return;
      const fieldValue = readSecretaryFieldValue(field.id, field.customBoxId);
      if (fieldValue) values[field.id] = fieldValue;
    });
    return values;
  }, [enabledSecretaryFields, secretaryVitals]);

  // خريطة القيم الحالية لكل حقل قياسات — تُستخدم لعرض القيم في الفورم
  const secretaryFieldValues = useMemo(() => {
    const values: Record<string, string> = {};
    enabledSecretaryFields.forEach((field) => {
      const fieldId = field.kind === 'vital' && field.key ? field.key : field.id;
      values[fieldId] = readSecretaryFieldValue(field.id, field.customBoxId);
    });
    return values;
  }, [enabledSecretaryFields, secretaryVitals]);

  const shouldShowSecretaryVitalsFields =
    enabledSecretaryFields.length > 0 && typeof onSecretaryVitalsChange === 'function';

  useEffect(() => {
    if (!onSecretaryVitalsChange) return;
    if (!isSecretaryVitalEnabled(secretaryVitalsVisibility, 'bmi')) return;

    const computedBmi = computeSecretaryBmiValue(secretaryVitals?.weight, secretaryVitals?.height);
    const currentBmi = normalizeSecretaryVitalValue(secretaryVitals?.bmi);
    if (computedBmi === currentBmi) return;

    const nextVitals = { ...(secretaryVitals || {}) };
    if (computedBmi) {
      nextVitals.bmi = computedBmi;
    } else {
      delete nextVitals.bmi;
    }
    onSecretaryVitalsChange(nextVitals);
  }, [
    onSecretaryVitalsChange,
    secretaryVitals,
    secretaryVitals?.bmi,
    secretaryVitals?.height,
    secretaryVitals?.weight,
    secretaryVitalsVisibility,
  ]);

  const resolveSecretaryVitalStorageKey = (fieldId: string): string => {
    const normalized = String(fieldId || '').trim();
    if (!normalized) return '';
    if (isSecretaryVitalKey(normalized)) return normalized;
    if (normalized.startsWith('vital:')) {
      const rawKey = normalized.slice('vital:'.length);
      return isSecretaryVitalKey(rawKey) ? rawKey : normalized;
    }
    return normalized;
  };

  const updateSecretaryVital = (fieldId: string, nextValue: string) => {
    if (!onSecretaryVitalsChange) return;
    const normalizedFieldId = String(fieldId || '').trim();
    if (!normalizedFieldId) return;

    const storageKey = resolveSecretaryVitalStorageKey(normalizedFieldId);
    if (!storageKey || storageKey === 'bmi') return;

    const normalizedValue = normalizeSecretaryVitalValue(nextValue);
    const nextVitals = { ...(secretaryVitals || {}) };
    if (normalizedValue) {
      nextVitals[storageKey] = normalizedValue;
    } else {
      delete nextVitals[storageKey];
    }

    if (storageKey !== normalizedFieldId) {
      delete nextVitals[normalizedFieldId];
    }

    onSecretaryVitalsChange(nextVitals);
  };

  const updateSecretaryVitalFromVitalsSection = (field: string, nextValue: string) => {
    if (
      field !== 'bp' &&
      field !== 'pulse' &&
      field !== 'temp' &&
      field !== 'rbs' &&
      field !== 'spo2' &&
      field !== 'rr'
    ) {
      return;
    }

    updateSecretaryVital(field, nextValue);
  };

  const applyPatientSuggestion = (candidate: PatientSuggestionOption) => {
    onSelectPatientSuggestion?.(candidate);
    setActiveSuggestionField(null);
  };

  // تغيير مظهر الحقول بناءً على نوع الحجز (ألوان التيل للاستشارة)
  const fieldClass = isConsultationMode
    ? 'w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-bold transition-all'
    : 'w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold transition-all';

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-visible">
      {!hideTopHeader && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between gap-2 text-right rounded-t-2xl"
        >
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            حجز موعد جديد
          </h3>
          <span className="text-white/90">
            {isOpen ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>}
          </span>
        </button>
      )}

      {isOpen && (
        <form noValidate onSubmit={onSubmit} className={`p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${isConsultationMode ? 'bg-gradient-to-b from-emerald-50/40 via-white to-white' : ''}`}>
          
          {/* اختيار نوع الحجز */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الحجز</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onAppointmentTypeChange?.('exam')} className={`px-3 py-2 rounded-xl border text-sm font-black transition-all ${appointmentType === 'exam' ? 'bg-gradient-to-r from-blue-700 to-blue-500 text-white border-blue-600 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>كشف</button>
              <button type="button" onClick={() => onAppointmentTypeChange?.('consultation')} className={`px-3 py-2 rounded-xl border text-sm font-black transition-all ${appointmentType === 'consultation' ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-700 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>استشارة</button>
            </div>
          </div>

          {/* لوحة مرشحي الاستشارات - تظهر فقط في وضع الاستشارة */}
          {appointmentType === 'consultation' && (
            <ConsultationCandidatesPanel
              consultationCandidates={consultationCandidates}
              selectedConsultationCandidateId={selectedConsultationCandidateId}
              onSelectCandidate={handleSelectCandidate}
              canLoadMoreConsultationCandidates={canLoadMoreConsultationCandidates}
              onLoadMoreConsultationCandidates={onLoadMoreConsultationCandidates}
            />
          )}

          {/* حقول بيانات المريض */}
          <div ref={detailsStartRef} className={`sm:col-span-2 lg:col-span-1 relative ${activeSuggestionField === 'name' ? 'z-[140]' : 'z-10'}`}>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم المريض</label>
            <input type="text" value={patientName} onChange={(e) => onPatientNameChange(e.target.value)} onFocus={() => setActiveSuggestionField('name')} onBlur={closeSuggestions} placeholder="الاسم الكامل" className={fieldClass} dir="rtl" />
            {currentPatientFileNumber && (
              <div className="mt-1 text-[11px] font-black text-indigo-700">رقم الملف: #{currentPatientFileNumber}</div>
            )}
            {activeSuggestionField === 'name' && <PatientSuggestionsDropdown suggestions={visiblePatientSuggestions} onApplySuggestion={applyPatientSuggestion} />}
          </div>

          <div className="sm:col-span-1 lg:col-span-1 relative">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">السن</label>
            <AgeUnitInput
              ageString={age}
              onAgeChange={onAgeChange}
              placeholder="مثال: 30"
              inputClassName="focus:ring-teal-500"
              selectClassName="focus:ring-teal-500"
            />
          </div>

          {/* النوع: بعد السن مباشرة عشان قرار سؤال الحمل/الرضاعة يبقى جنبه منطقياً */}
          {onGenderChange && (
            <div className="sm:col-span-1 lg:col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-1.5">النوع</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onGenderChange('male')}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-black transition-all ${
                    gender === 'male'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  أنثى
                </button>
              </div>
            </div>
          )}

          {/* الحمل/الرضاعة — تحت النوع مباشرة على كل الشاشات (موبايل/تابلت/ديسكتوب) */}
          {askFertility && (onPregnantChange || onBreastfeedingChange) && (
            <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-pink-200 bg-pink-50/50 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onPregnantChange && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">هل هي حامل؟</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onPregnantChange(true)}
                        className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                          pregnant === true
                            ? 'bg-pink-600 text-white border-pink-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-pink-50'
                        }`}
                      >
                        نعم، حامل
                      </button>
                      <button
                        type="button"
                        onClick={() => onPregnantChange(false)}
                        className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                          pregnant === false
                            ? 'bg-slate-700 text-white border-slate-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        لا
                      </button>
                    </div>
                  </div>
                )}
                {onBreastfeedingChange && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">هل هي مرضعة؟</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onBreastfeedingChange(true)}
                        className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                          breastfeeding === true
                            ? 'bg-pink-600 text-white border-pink-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-pink-50'
                        }`}
                      >
                        نعم، مرضعة
                      </button>
                      <button
                        type="button"
                        onClick={() => onBreastfeedingChange(false)}
                        className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${
                          breastfeeding === false
                            ? 'bg-slate-700 text-white border-slate-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        لا
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`sm:col-span-2 lg:col-span-1 relative ${activeSuggestionField === 'phone' ? 'z-[140]' : 'z-10'}`}>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">رقم التليفون (اختياري)</label>
            <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)} onFocus={() => setActiveSuggestionField('phone')} onBlur={closeSuggestions} placeholder="01xxxxxxxxx" className={fieldClass} dir="ltr" />
            {activeSuggestionField === 'phone' && <PatientSuggestionsDropdown suggestions={visiblePatientSuggestions} onApplySuggestion={applyPatientSuggestion} />}
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">التاريخ والوقت</label>
            <div className="flex flex-col sm:flex-row gap-2">
               <input
                 type="date"
                 value={dateStr}
                 min={todayStr}
                 onChange={(e) => onDateStrChange(e.target.value)}
                 className={`${fieldClass} py-2 sm:w-auto sm:flex-1 min-w-0`}
               />
               {/* ملاحظة: لا نضيف min على حقل الوقت — لو مرّت دقائق بين فتح الفورم والضغط
                    على حفظ، الـ JS handler يتولى auto-adjust للوقت الحالي بدلاً من حظر
                    الإرسال بـ HTML5 validation. (_timeMin) محفوظ كـ prop للتوافق فقط. */}
               <input
                 type="time"
                 value={timeStr}
                 onChange={(e) => onTimeStrChange(e.target.value)}
                 className={`${fieldClass} py-2 sm:w-auto sm:flex-1 min-w-0`}
               />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">ملاحظات أو سبب الزيارة (اختياري)</label>
            <input type="text" value={visitReason} onChange={(e) => onVisitReasonChange(e.target.value)} placeholder="مثال: متابعة سكر، كشف جديد..." className={fieldClass} dir="rtl" />
          </div>

          {shouldShowSecretaryVitalsFields && (
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">القياسات والعلامات الحيوية</label>
              {/* الموبايل: عمودان فاسحان للإدخال — 3 على التابلت — 4 على الشاشات الكبيرة */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 sm:gap-x-3 gap-y-4">
                {enabledSecretaryFields.map((field) => {
                  const fieldId = field.kind === 'vital' && field.key ? field.key : field.id;
                  const isBmi = field.key === 'bmi';
                  // الضغط هو الحقل الوحيد اللي يسمح بالحروف والرموز (مثال: "120/80")
                  // باقي الحقول (نبض، حرارة، سكر، أكسجين، تنفس، طول، وزن...) أرقام فقط
                  const isBp = field.key === 'bp';
                  const currentValue = secretaryFieldValues[fieldId] || '';
                  return (
                    <div key={fieldId} className="flex flex-col">
                      <p className="text-[12px] font-black text-slate-700 mb-1.5 px-1">{field.labelAr || field.label}</p>
                      <input
                        // استخدام type="text" دايماً عشان المتصفح ما يمنعش الأرقام العربية أو الرموز
                        // والفلترة الحقيقية تحصل في onChange حسب نوع الحقل
                        type="text"
                        // inputMode بيحدد شكل الكيبورد على الموبايل: رقمي للقياسات، نصي للضغط
                        inputMode={isBp || isBmi ? 'text' : 'decimal'}
                        readOnly={isBmi}
                        value={currentValue}
                        onChange={(e) => {
                          if (isBmi) return;
                          // الضغط: أي حاجة (أرقام + حروف + / -)
                          // الباقي: أرقام إنجليزية أو عربية + نقطة عشرية فقط
                          const rawValue = e.target.value;
                          const nextValue = isBp
                            ? rawValue
                            : rawValue.replace(/[^0-9٠-٩.]/g, '');
                          if (field.kind === 'vital' && field.key) {
                            updateSecretaryVitalFromVitalsSection(field.key, nextValue);
                          } else {
                            updateSecretaryVital(fieldId, nextValue);
                          }
                        }}
                        placeholder={field.unit || '...'}
                        className={`w-full h-[44px] px-2 rounded-xl font-bold text-center text-sm outline-none transition-all ${
                          isBmi
                            ? 'bg-slate-50 border-2 border-slate-200 text-slate-500 cursor-not-allowed'
                            : isConsultationMode
                              ? 'bg-emerald-50/40 border-2 border-emerald-200 text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 hover:border-emerald-300'
                              : 'bg-blue-50/30 border-2 border-blue-200 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 hover:border-blue-300'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* قسم التأمين - يظهر فقط إذا كان هناك userId (سكرتير بستخدم نفس الدوكتور userId) */}
          {userId && onPaymentTypeChange && (
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">الدفع</label>
              <InsurancePaymentSelector
                userId={userId}
                bookingSecret={bookingSecret}
                activeBranchId={activeBranchId}
                visitDate={dateStr}
                visitType={appointmentType}
                paymentType={paymentType}
                setPaymentType={onPaymentTypeChange}
                insuranceCompanyId={insuranceCompanyId}
                setInsuranceCompanyId={(value) => onInsuranceCompanyIdChange?.(value)}
                insuranceCompanyName={insuranceCompanyName}
                setInsuranceCompanyName={(value) => onInsuranceCompanyNameChange?.(value)}
                insuranceApprovalCode={insuranceApprovalCode}
                setInsuranceApprovalCode={(value) => onInsuranceApprovalCodeChange?.(value)}
                insuranceMembershipId={insuranceMembershipId}
                setInsuranceMembershipId={(value) => onInsuranceMembershipIdChange?.(value)}
                patientSharePercent={patientSharePercent}
                setPatientSharePercent={(value) => onPatientSharePercentChange?.(value)}
                discountAmount={discountAmount}
                setDiscountAmount={(value) => onDiscountAmountChange?.(value)}
                discountPercent={discountPercent}
                setDiscountPercent={(value) => onDiscountPercentChange?.(value)}
                discountReasonId={discountReasonId}
                discountReasonLabel={discountReasonLabel}
                setDiscountReasonId={(value) => onDiscountReasonIdChange?.(value)}
                setDiscountReasonLabel={(value) => onDiscountReasonLabelChange?.(value)}
                discountReasons={discountReasons}
                insuranceCompanies={propInsuranceCompanies}
              />
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button type="submit" disabled={saving} className={`px-5 py-2.5 rounded-xl text-white font-black shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 bg-gradient-to-r ${isConsultationMode ? 'from-emerald-600 to-teal-500' : 'from-blue-700 to-blue-500'}`}>
              {saving ? 'جاري الحفظ' : (submitLabel || 'إضافة الموعد')}
            </button>
            {formError && !bookingQuotaNotice && (
              <span ref={alertRef} className="text-red-600 text-sm font-bold flex items-center gap-1 scroll-mt-24">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {formError}
              </span>
            )}
          </div>

          {/* تنبيه تجاوز حصة الحجز (Quota) */}
          {bookingQuotaNotice && (
            <div ref={alertRef} className="sm:col-span-2 lg:col-span-4 rounded-xl border border-amber-300 bg-amber-50 p-3 scroll-mt-24">
              <p className="text-amber-900 text-sm font-black">{bookingQuotaNotice.message}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {quotaWhatsappHref && (
                  <a href={quotaWhatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black">
                    تواصل واتساب لتجديد الاشتراك
                  </a>
                )}
              </div>
            </div>
          )}
        </form>
      )}
    </section>
  );
};
