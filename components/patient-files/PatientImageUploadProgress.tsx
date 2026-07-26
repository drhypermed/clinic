import React from 'react';
import type { PatientImageUploadPhase } from '../../services/patient-files/images';

interface PatientImageUploadProgressProps {
  current: number;
  total: number;
  percent: number;
  phase: PatientImageUploadPhase;
}

const phaseLabels: Record<PatientImageUploadPhase, string> = {
  compressing: 'جاري ضغط الصورة',
  reserving: 'جاري تجهيز الرفع',
  uploading: 'جاري رفع الصورة للسحابة',
  finalizing: 'جاري حفظ الصورة في ملف المريض',
  completed: 'اكتمل الرفع',
};

export const PatientImageUploadProgress: React.FC<PatientImageUploadProgressProps> = ({
  current,
  total,
  percent,
  phase,
}) => {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className="mt-3 rounded-xl border border-sky-200 bg-white p-3 shadow-sm" aria-live="polite">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-black text-sky-900">
        <span className="flex min-w-0 items-center gap-2">
          <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" aria-hidden="true" />
          <span className="truncate">{phaseLabels[phase]} · الصورة {current} من {total}</span>
        </span>
        <span className="shrink-0 tabular-nums">{safePercent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="تقدم رفع صورة المريض"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
        className="h-2.5 overflow-hidden rounded-full bg-sky-100"
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-sky-500 to-cyan-400 transition-[width] duration-200 ease-out"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
};
