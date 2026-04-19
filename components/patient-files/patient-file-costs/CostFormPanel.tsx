/**
 * CostFormPanel:
 * نموذج إضافة/تعديل تكلفة كاش (تداخلات أو دخل آخر) — مكوّن عرض خالص.
 */
import React from 'react';

interface Props {
  editingCostId: string | null;
  costFormDate: string;
  costFormAmount: string;
  costFormType: 'interventions' | 'other';
  costFormNote: string;
  setCostFormDate: (v: string) => void;
  setCostFormAmount: (v: string) => void;
  setCostFormType: (v: 'interventions' | 'other') => void;
  setCostFormNote: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const CostFormPanel: React.FC<Props> = ({
  editingCostId,
  costFormDate,
  costFormAmount,
  costFormType,
  costFormNote,
  setCostFormDate,
  setCostFormAmount,
  setCostFormType,
  setCostFormNote,
  onCancel,
  onSave,
}) => (
  <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 space-y-2">
    <div className="text-[11px] font-black text-teal-700">
      {editingCostId ? 'تعديل تكلفة كاش' : 'إضافة تكلفة كاش'}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2">
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">التاريخ</label>
        <input
          type="date"
          value={costFormDate}
          onChange={(e) => setCostFormDate(e.target.value)}
          dir="ltr"
          className="w-full rounded-lg border border-teal-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">المبلغ (ج.م)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={costFormAmount}
          onChange={(e) => setCostFormAmount(e.target.value)}
          placeholder="0.00"
          dir="ltr"
          className="w-full rounded-lg border border-teal-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">النوع</label>
        <select
          value={costFormType}
          onChange={(e) => setCostFormType(e.target.value as 'interventions' | 'other')}
          className="w-full rounded-lg border border-teal-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
        >
          <option value="interventions">التداخلات</option>
          <option value="other">دخل آخر</option>
        </select>
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">ملاحظة (اختياري)</label>
        <input
          type="text"
          value={costFormNote}
          onChange={(e) => setCostFormNote(e.target.value)}
          placeholder="وصف التكلفة..."
          className="w-full rounded-lg border border-teal-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
        />
      </div>
    </div>
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-black text-slate-500 hover:bg-slate-50"
      >
        إلغاء
      </button>
      <button
        type="button"
        onClick={onSave}
        className="rounded-lg bg-teal-600 px-4 py-1.5 text-[11px] font-black text-white hover:bg-teal-700"
      >
        {editingCostId ? 'حفظ التعديل' : 'حفظ'}
      </button>
    </div>
  </div>
);
