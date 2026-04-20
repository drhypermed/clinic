import React from 'react';

interface Props {
  isNewMedication: boolean;
  medicationName: string;
  onClose: () => void;
}

export const MedicationEditModalHeader: React.FC<Props> = ({ isNewMedication, medicationName, onClose }) => (
  <div className="bg-white px-5 sm:px-6 py-4 flex justify-between items-start gap-3 border-b border-slate-200">
    <div className="flex items-start gap-2.5 min-w-0 flex-1">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
        {isNewMedication ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-tight text-slate-900">
          {isNewMedication ? 'إضافة دواء جديد' : 'تعديل معلومات الدواء'}
        </h3>
        <p className="text-xs text-slate-500 font-semibold truncate">
          {medicationName}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      aria-label="إغلاق"
      className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-colors active:scale-95"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);
