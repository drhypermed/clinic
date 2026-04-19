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
  <div className="p-5 bg-white border-t border-slate-100 flex flex-col-reverse md:flex-row justify-between gap-3">
    <button
      onClick={onReset}
      disabled={loading}
      className={`${
        isNewMedication ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
      } font-black py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 text-sm disabled:opacity-50`}
    >
      {isNewMedication ? 'حذف الدواء' : 'العودة للافتراضي'}
    </button>
    <div className="flex gap-3">
      <button
        onClick={onClose}
        className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-black py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 text-sm"
      >
        إلغاء
      </button>
      <button
        onClick={onSave}
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-6 rounded-xl shadow-md transition-all active:scale-95 text-sm disabled:opacity-50"
      >
        {loading ? 'جاري الحفظ' : 'حفظ التعديلات'}
      </button>
    </div>
  </div>
);
