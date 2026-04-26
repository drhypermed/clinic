import React from 'react';
import { formatAgeForStorage, parseAgeFromStorage, getAgeUnitLabel, type AgeUnit } from './utils';

/**
 * الملف: AgeUnitInput.tsx
 * الوصف: مكون إدخال السن "الموحد". 
 * يُستخدم هذا المكون لضمان إدخال عمر المريض بطريقة صحيحة (رقم + وحدة زمنية). 
 * يدعم المكون الوحدات الثلاث: (سنة، شهر، يوم)، ويقوم بتحليل القيمة المخزنة 
 * وتنسيقها تلقائياً لضمان توحيد البيانات في قاعدة البيانات (مثل: "30 سنة").
 */

interface AgeUnitInputProps {
  /** القيمة المخزنة الحالية (مثلاً: "25 سنة") */
  ageString: string;
  /** وظيفة تُستدعى عند تغيير السن أو الوحدة */
  onAgeChange: (ageString: string) => void;
  /** أنماط CSS المخصصة للحاوية */
  className?: string;
  /** أنماط CSS المخصصة لحقل الرقم */
  inputClassName?: string;
  /** أنماط CSS المخصصة لقائمة اختيار الوحدة */
  selectClassName?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const AgeUnitInput: React.FC<AgeUnitInputProps> = ({
  ageString,
  onAgeChange,
  className = '',
  inputClassName = '',
  selectClassName = '',
  placeholder = '0',
  disabled = false,
}) => {
  // تحليل النص المخزن إلى قيمة رقمية ووحدة (مثلاً: 25 و 'year')
  const { value, unit } = parseAgeFromStorage(ageString);

  // معالجة تغيير القيمة الرقمية (منع إدخال الرموز غير الرقمية)
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 5); // حد أقصى 5 خانات
    onAgeChange(formatAgeForStorage(v, unit));
  };

  // معالجة تغيير وحدة السن (سنة/شهر/يوم)
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const u = e.target.value as AgeUnit;
    onAgeChange(formatAgeForStorage(value, u));
  };

  return (
    <div className={`flex flex-wrap items-stretch gap-2 ${className}`} dir="rtl">
      {/* حقل القوة الرقمية */}
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleValueChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-800 font-bold transition-all text-center ${inputClassName}`}
      />
      {/* قائمة اختيار وحدة السن */}
      <select
        value={unit}
        onChange={handleUnitChange}
        disabled={disabled}
        className={`px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-slate-800 font-bold cursor-pointer shrink-0 ${selectClassName}`}
        aria-label="وحدة السن"
      >
        <option value="year">{getAgeUnitLabel('year')}</option>
        <option value="month">{getAgeUnitLabel('month')}</option>
        <option value="day">{getAgeUnitLabel('day')}</option>
      </select>
    </div>
  );
};
