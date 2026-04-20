import React from 'react';

interface Props {
  isNewMedication: boolean;
  loading: boolean;
  onReset: () => void;
  onClose: () => void;
  onSave: () => void;
}

export const MedicationEditModalFooter: React.FC<Props> = ({
  isNewMedication,
  loading,
  onReset,
  onClose,
  onSave,
}) => (
  <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
    <button
      onClick={onReset}
      disabled={loading}
      className={`${
        isNewMedication
          ? 'bg-white hover:bg-red-50 border-red-200 text-red-600'
          : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
      } border font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
    >
      {isNewMedication ? 'حذف الدواء' : 'العودة للافتراضي'}
    </button>
    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
      <button
        onClick={onClose}
        disabled={loading}
        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] text-sm disabled:opacity-50 w-full sm:w-auto"
      >
        إلغاء
      </button>
      <button
        onClick={onSave}
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
            </svg>
            جاري الحفظ
          </>
        ) : (
          'حفظ التعديلات'
        )}
      </button>
    </div>
  </div>
);
