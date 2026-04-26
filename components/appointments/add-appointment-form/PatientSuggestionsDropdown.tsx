import React from 'react';
import type { PatientSuggestionOption } from './types';
import { buildPatientSuggestionDisplayModel } from './helpers';
import { PatientContactActions } from '../../common/PatientContactActions';

/**
 * قائمة الاقتراحات التلقائية للمرضى (Patient Suggestions Dropdown)
 * تظهر أسفل حقل "اسم المريض" أو "رقم التليفون" أثناء الكتابة.
 * وظيفتها:
 * 1. مساعدة الطبيب في العثور على مريض مسجل مسبقاً بسرعة.
 * 2. عرض بيانات موجزة (السن، التليفون، تواريخ آخر زيارات) للتأكد من هوية المريض.
 * 3. ملء بيانات النموذج تلقائياً بمجرد النقر على الاقتراح.
 */

interface PatientSuggestionsDropdownProps {
  suggestions: PatientSuggestionOption[];
  onApplySuggestion: (candidate: PatientSuggestionOption) => void;
}

export const PatientSuggestionsDropdown: React.FC<PatientSuggestionsDropdownProps> = ({
  suggestions,
  onApplySuggestion,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 z-[220] mt-1 w-auto max-w-full rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
      {suggestions.map((candidate) => {
        const display = buildPatientSuggestionDisplayModel(candidate);
        return (
        <div
          key={candidate.id}
          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
        >
          <button
            type="button"
            // منع فقدان التركيز (Blur) من المدخل عند النقر على الاقتراح
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApplySuggestion(candidate)}
            className="w-full text-right px-4 py-3 block"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 text-sm font-black text-slate-800 break-words leading-5">
                {display.patientName}
              </div>
              {display.fileNumber && (
                <span className="shrink-0 rounded-full border border-brand-200 bg-brand-100 px-2 py-0.5 text-[10px] font-black text-brand-700">
                  ملف #{display.fileNumber}
                </span>
              )}
            </div>

            <div className="mt-1.5 space-y-0.5">
              {display.lines.map((line) => (
                <div key={line.key} className={`text-[11px] leading-5 ${line.key === 'fileNumber' ? 'text-brand-700' : 'text-slate-600'}`}>
                  <span className="font-black">{line.label}: </span>
                  <span className="font-bold">{line.value}</span>
                </div>
              ))}
            </div>
          </button>

          {candidate.phone && (
            <div className="px-4 pb-2" onMouseDown={(e) => e.preventDefault()}>
              <PatientContactActions phone={candidate.phone} compact />
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};
