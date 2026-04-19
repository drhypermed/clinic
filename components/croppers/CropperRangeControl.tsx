import React from 'react';

interface CropperRangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accentClassName: string;
  renderValue?: (value: number) => React.ReactNode;
}

export const CropperRangeControl: React.FC<CropperRangeControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  accentClassName,
  renderValue,
}) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold text-slate-600 whitespace-nowrap">{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${accentClassName}`}
      />
      <span className="text-xs text-slate-500 w-10">
        {renderValue ? renderValue(value) : `${value}%`}
      </span>
    </div>
  );
};
