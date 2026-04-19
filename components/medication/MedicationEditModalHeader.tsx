import React from 'react';

interface Props {
  isNewMedication: boolean;
  medicationName: string;
  onClose: () => void;
}

export const MedicationEditModalHeader: React.FC<Props> = ({ isNewMedication, medicationName, onClose }) => (
  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-5 flex justify-between items-start border-b border-slate-700">
    <div className="flex flex-col gap-1">
      <h3 className="text-xl font-black tracking-tight leading-tight">
        {isNewMedication ? 'إضافة دواء جديد' : 'تعديل معلومات الدواء'}
      </h3>
      <p className="text-[11px] text-emerald-200 font-semibold uppercase tracking-[0.2em] opacity-90">
        {medicationName}
      </p>
    </div>
    <button
      onClick={onClose}
      className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-all active:scale-90 border border-white/15"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);
