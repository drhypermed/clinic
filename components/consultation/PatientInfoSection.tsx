import React, { useEffect, useMemo, useState } from 'react';
import type { PaymentType } from '../../types';
import { buildCairoDateWithCurrentTime, formatUserDate, formatUserTime } from '../../utils/cairoTime';

/**
 * واجهة بيانات المريض المقترحة (Basic Patient Suggestion)
 * تُستخدم لتمثيل بيانات المرضى القدامى عند البحث عنهم بالاسم أو الهاتف.
 */
export interface BasicPatientSuggestion {
  id: string;               // المعرف الفريد للمريض في Firestore
  patientName: string;      // اسم المريض
  phone?: string;           // رقم الهاتف
  ageYears?: string;        // العمر بالسنوات
  ageMonths?: string;       // العمر بالشهور
  ageDays?: string;         // العمر بالأيام
  ageText?: string;         // نص العمر المنسق (مثلاً: 5 سنوات و شهر)
  lastExamDate?: string;    // تاريخ آخر كشف طبي
  lastConsultationDate?: string; // تاريخ آخر استشارة
  patientFileNumber?: number; // رقم ملف المريض الثابت
}

const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

const normalizePhoneDigits = (value?: string): string => String(value || '').replace(/\D/g, '');

/**
 * مكون بيانات المريض الأساسية (Patient Info Section)
 * المسؤول عن جمع هوية المريض (الاسم، الهاتف، العمر) وتاريخ الزيارة.
 */

interface PatientInfoSectionProps {
  patientName: string; setPatientName: (v: string) => void;         // الاسم الحالي ودالة التحديث
  phone: string; setPhone: (v: string) => void;                     // الهاتف الحالي ودالة التحديث
  ageYears: string; setAgeYears: (v: string) => void;               // السن (سنوات) ودالة التحديث
  ageMonths: string; setAgeMonths: (v: string) => void;             // السن (شهور) ودالة التحديث
  ageDays: string; setAgeDays: (v: string) => void;                 // السن (أيام) ودالة التحديث
  patientSuggestions?: BasicPatientSuggestion[];                   // قائمة المرضى المسجلين مسبقاً للبحث
  onSelectPatientSuggestion?: (item: BasicPatientSuggestion) => void; // دالة عند اختيار مريض من المقترحات
  visitDate: string; setVisitDate: (v: string) => void;           // تاريخ الزيارة الحالي
  visitType: 'exam' | 'consultation';
  setVisitType: (v: 'exam' | 'consultation') => void;
  paymentType?: PaymentType;                             // الدفع
  setPaymentType?: (v: PaymentType) => void;            // دالة تحديث الدفع
  onReset: (e?: React.MouseEvent) => void;                        // دالة تصفير البيانات لزيارة جديدة
}

export const PatientInfoSection: React.FC<PatientInfoSectionProps> = ({
  patientName, setPatientName, phone, setPhone, ageYears, setAgeYears, ageMonths, setAgeMonths, ageDays, setAgeDays, patientSuggestions = [], onSelectPatientSuggestion, visitDate, setVisitDate, visitType, setVisitType, paymentType, setPaymentType, onReset
}) => {
  
  // تتبع الحقل النشط (اسم أم هاتف) لعرض قائمة المقترحات المناسبة أسفله
  const [activeSuggestionField, setActiveSuggestionField] = useState<'name' | 'phone' | null>(null);
  const [liveClockSeed, setLiveClockSeed] = useState<number>(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setLiveClockSeed(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  /** 
   * نظام البحث الذكي عن المرضى:
   * يقوم بمطابقة ما يكتبه الطبيب مع قاعدة بيانات المرضى القدامى بناءً على الاسم أو الهاتف.
   * يستخدم useMemo لضمان عدم إعادة الفلترة إلا عند تغير المدخلات.
   */
  const query = (activeSuggestionField === 'phone' ? phone : patientName).trim().toLocaleLowerCase();
  const visibleSuggestions = useMemo(() => {
    if (!query) return [] as BasicPatientSuggestion[];
    return patientSuggestions
      .filter((item) => {
        const name = (item.patientName || '').toLocaleLowerCase();
        const phoneValue = (item.phone || '').toLocaleLowerCase();
        return name.includes(query) || phoneValue.includes(query);
      })
      .slice(0, 5); // عرض أول 5 نتائج فقط للحفاظ على نظافة الواجهة
  }, [patientSuggestions, query]);

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

  const visitTimePreview = useMemo(() => {
    const cairoDate = buildCairoDateWithCurrentTime(visitDate, liveClockSeed);
    if (Number.isNaN(cairoDate.getTime())) return 'غير متوفر';
    return formatUserTime(cairoDate.toISOString()) || 'غير متوفر';
  }, [visitDate, liveClockSeed]);

  const visitDatePreview = useMemo(() => {
    const [yearRaw, monthRaw, dayRaw] = String(visitDate || '').split('-');
    const year = String(yearRaw || '').trim();
    const month = String(monthRaw || '').padStart(2, '0');
    const day = String(dayRaw || '').padStart(2, '0');
    if (!year || !monthRaw || !dayRaw) return 'اختر التاريخ';
    // تنسيق يدوي موحد لتجنب اختلاف شكل التاريخ بين أجهزة/متصفحات الموبايل.
    return `${day} / ${month} / ${year}`;
  }, [visitDate]);

  const fieldTitleClass = 'text-[12px] font-black text-slate-700 mb-1.5 px-1 tracking-[0.01em]';
  const normalizeAgeInput = (value: string) => value.replace(/\D/g, '').slice(0, 3);
  const ageFieldWrapperClass = 'clinic-field relative h-[44px] rounded-xl !bg-white !border-2 !border-slate-200 focus-within:!border-blue-400 hover:!border-blue-300 transition-colors dropdown-shadow';
  const ageFieldInputClass = 'w-full h-full bg-transparent border-none outline-none text-center font-black text-sm tabular-nums px-7';
  const ageFieldUnitClass = 'clinic-unit absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none';
  const ageFieldConfigs: Array<{ key: string; value: string; setValue: (v: string) => void; unit: string }> = [
    { key: 'years', value: ageYears, setValue: setAgeYears, unit: 'سنة' },
    { key: 'months', value: ageMonths, setValue: setAgeMonths, unit: 'شهر' },
    { key: 'days', value: ageDays, setValue: setAgeDays, unit: 'يوم' },
  ];

  /** إغلاق قائمة المقترحات مع مهلة بسيطة للسماح بحدث النقر (Click) بالمرور */
  const closeSuggestions = () => {
    setTimeout(() => setActiveSuggestionField(null), 120);
  };

  /** تنسيق التاريخ للعرض باللغة العربية وأرقام لاتينية */
  const formatDate = (value?: string) => {
    if (!value) return 'غير متوفر';
    return formatUserDate(value) || 'غير متوفر';
  };

  /** تطبيق بيانات المريض المختار على الحقول الحالية */
  const applySuggestion = (item: BasicPatientSuggestion) => {
    onSelectPatientSuggestion?.(item);
    setActiveSuggestionField(null);
  };

  return (
    <section
      className="clinic-section clinic-section--basic p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-right"
      dir="rtl"
      style={{ overflow: 'visible', zIndex: activeSuggestionField ? 60 : 1 }}
    >
      {/* رأس القسم مع زر "مريض جديد" لتصفير الواجهة */}
      <div className="clinic-section-header mb-4">
        <div className="clinic-section-header__group">
          <div className="clinic-section-header__bar"></div>
          <div>
            <h2 className="clinic-section-header__title">البيانات الأساسية</h2>
          </div>
        </div>
        <button
          onClick={onReset}
          className="clinic-action clinic-action--basic flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          مريض جديد
        </button>
      </div>

      <div className="grid gap-3">
        {/* الصف الأول: الاسم | التاريخ والوقت | التليفون — 3 أعمدة على الشاشات الكبيرة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
          {/* حقل إدخال اسم المريض مع خاصية الإكمال التلقائي */}
          <div className={`relative flex flex-col ${activeSuggestionField === 'name' ? 'z-[140]' : 'z-10'}`}>
            <p className={fieldTitleClass}>الاسم</p>
            <div className="relative">
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                onFocus={() => setActiveSuggestionField('name')}
                onBlur={closeSuggestions}
                className="clinic-field w-full h-[44px] px-4 rounded-2xl font-black text-slate-900 text-sm placeholder-slate-400 text-right !bg-white !border-2 !border-slate-200 focus:!border-blue-400 hover:!border-blue-300 transition-colors dropdown-shadow"
                placeholder="يفضل كتابة الاسم ثلاثي"
              />
              {activeSuggestionField === 'name' && visibleSuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[220] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                  {visibleSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applySuggestion(item)}
                      className="w-full text-right px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-black text-slate-800">{item.patientName}</div>
                        {toPositiveFileNumber(item.patientFileNumber) && (
                          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                            ملف #{toPositiveFileNumber(item.patientFileNumber)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {item.phone ? `التليفون: ${item.phone}` : 'التليفون: غير متوفر'}
                        {' · '}
                        {item.ageText ? `السن: ${item.ageText}` : 'السن: غير متوفر'}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 mt-0.5" dir="rtl">
                        آخر كشف: {formatDate(item.lastExamDate)}
                        {' · '}
                        آخر استشارة: {formatDate(item.lastConsultationDate)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {currentPatientFileNumber && (
              <div className="mt-1 text-[11px] font-black text-blue-700">رقم الملف: #{currentPatientFileNumber}</div>
            )}
          </div>

          {/* حقل التاريخ والوقت مدمجين جنباً إلى جنب */}
          <div className="flex flex-col">
            <p className={fieldTitleClass}>تاريخ ووقت الزيارة</p>
            <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2">
              <div className="clinic-field relative w-full min-w-0 h-[44px] rounded-2xl !bg-white !border-2 !border-slate-200 focus-within:!border-blue-400 hover:!border-blue-300 transition-colors dropdown-shadow overflow-hidden">
                <input
                  type="date"
                  lang="en-GB"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  aria-label="تاريخ الزيارة"
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-slate-900 text-sm font-black tabular-nums tracking-[0.03em]" dir="ltr">
                  {visitDatePreview}
                </span>
              </div>
              <div className="clinic-field h-[44px] rounded-xl !bg-blue-50 !border !border-blue-200/80 text-blue-700 flex items-center justify-center text-[11px] font-black tabular-nums pointer-events-none">
                {visitTimePreview}
              </div>
            </div>
          </div>

          {/* حقل إدخال رقم التليفون (يدعم البحث أيضاً) */}
          <div className={`relative flex flex-col ${activeSuggestionField === 'phone' ? 'z-[140]' : 'z-10'}`}>
            <p className={fieldTitleClass}>رقم التليفون</p>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setActiveSuggestionField('phone')}
                onBlur={closeSuggestions}
                className="clinic-field w-full h-[44px] px-4 rounded-2xl font-black text-slate-900 text-sm placeholder-slate-400 text-right !bg-white !border-2 !border-slate-200 focus:!border-blue-400 hover:!border-blue-300 transition-colors dropdown-shadow"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
              {activeSuggestionField === 'phone' && visibleSuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-[220] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                  {visibleSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applySuggestion(item)}
                      className="w-full text-right px-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-black text-slate-800">{item.patientName}</div>
                        {toPositiveFileNumber(item.patientFileNumber) && (
                          <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
                            ملف #{toPositiveFileNumber(item.patientFileNumber)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {item.phone ? `التليفون: ${item.phone}` : 'التليفون: غير متوفر'}
                        {' · '}
                        {item.ageText ? `السن: ${item.ageText}` : 'السن: غير متوفر'}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 mt-0.5" dir="rtl">
                        آخر كشف: {formatDate(item.lastExamDate)}
                        {' · '}
                        آخر استشارة: {formatDate(item.lastConsultationDate)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الصف الثاني: العمر | نوع الزيارة | الدفع — 3 أعمدة على الشاشات الكبيرة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
          {/* شبكة مدخلات العمر */}
          <div>
            <p className={fieldTitleClass}>العمر</p>
            <div className="grid grid-cols-3 gap-3">
              {ageFieldConfigs.map((field) => (
                <div key={field.key} className={ageFieldWrapperClass} dir="ltr">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    value={field.value}
                    onChange={(e) => field.setValue(normalizeAgeInput(e.target.value))}
                    className={ageFieldInputClass}
                    placeholder=""
                    aria-label={`العمر ${field.unit}`}
                  />
                  <span className={ageFieldUnitClass}>{field.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* نوع الزيارة */}
          <div>
            <p className={fieldTitleClass}>نوع الزيارة</p>
            <div className="clinic-field w-full h-[44px] p-1 rounded-2xl !bg-white !border-2 !border-slate-200 focus-within:!border-blue-400 hover:!border-blue-300 transition-colors dropdown-shadow">
              <div className="grid grid-cols-2 gap-1.5 h-full">
                <button
                  type="button"
                  onClick={() => setVisitType('exam')}
                  className={`clinic-toggle-btn h-full rounded-xl px-2 py-1 text-[11px] font-black transition-all ${visitType === 'exam' ? 'clinic-toggle-btn--active' : 'clinic-toggle-btn--idle'}`}
                >
                  كشف
                </button>
                <button
                  type="button"
                  onClick={() => setVisitType('consultation')}
                  className={`clinic-toggle-btn h-full rounded-xl px-2 py-1 text-[11px] font-black transition-all ${visitType === 'consultation' ? 'clinic-toggle-btn--consultation-active' : 'clinic-toggle-btn--idle'}`}
                >
                  استشارة
                </button>
              </div>
            </div>
          </div>

          {/* الدفع (يظهر إذا تم تمرير paymentType) */}
          {paymentType !== undefined && setPaymentType && (
            <div>
              <p className={fieldTitleClass}>الدفع</p>
              <div className="clinic-field w-full h-[44px] p-1 rounded-2xl !bg-white !border-2 !border-slate-200 hover:!border-blue-300 transition-colors dropdown-shadow">
                <div className="grid grid-cols-3 gap-1.5 h-full">
                  <button
                    type="button"
                    onClick={() => setPaymentType('cash')}
                    className={`clinic-toggle-btn h-full rounded-xl px-2 py-1 text-[11px] font-black transition-all ${paymentType === 'cash' ? 'clinic-toggle-btn--active scale-[1.01]' : 'clinic-toggle-btn--idle'}`}
                  >
                    💵 كاش
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('insurance')}
                    className={`clinic-toggle-btn h-full rounded-xl px-2 py-1 text-[11px] font-black transition-all ${paymentType === 'insurance' ? 'clinic-toggle-btn--insurance-active scale-[1.01]' : 'clinic-toggle-btn--idle'}`}
                  >
                    🏢 تأمين
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('discount')}
                    className={`clinic-toggle-btn h-full rounded-xl px-2 py-1 text-[11px] font-black transition-all ${paymentType === 'discount' ? 'clinic-toggle-btn--discount-active scale-[1.01]' : 'clinic-toggle-btn--idle'}`}
                  >
                    🏷️ خصم
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
