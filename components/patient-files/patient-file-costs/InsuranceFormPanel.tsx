/**
 * InsuranceFormPanel:
 * نموذج إضافة/تعديل مطالبة تأمين (شركة + رقم كارنيه + كود موافقة) — عرض خالص.
 */
import React from 'react';
import type { InsuranceCompany } from '../../../services/insuranceService';

interface Props {
  editingInsId: string | null;
  insuranceCompanies: InsuranceCompany[];
  insFormCompanyId: string;
  insFormDate: string;
  insFormAmount: string;
  insFormType: 'interventions' | 'other';
  insFormMembership: string;
  insFormApproval: string;
  insFormNote: string;
  setInsFormCompanyId: (v: string) => void;
  setInsFormDate: (v: string) => void;
  setInsFormAmount: (v: string) => void;
  setInsFormType: (v: 'interventions' | 'other') => void;
  setInsFormMembership: (v: string) => void;
  setInsFormApproval: (v: string) => void;
  setInsFormNote: (v: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const InsuranceFormPanel: React.FC<Props> = ({
  editingInsId,
  insuranceCompanies,
  insFormCompanyId,
  insFormDate,
  insFormAmount,
  insFormType,
  insFormMembership,
  insFormApproval,
  insFormNote,
  setInsFormCompanyId,
  setInsFormDate,
  setInsFormAmount,
  setInsFormType,
  setInsFormMembership,
  setInsFormApproval,
  setInsFormNote,
  onCancel,
  onSave,
}) => (
  <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 space-y-2">
    <div className="text-[11px] font-black text-violet-700">
      {editingInsId ? 'تعديل مطالبة تأمين' : 'إضافة مطالبة تأمين'}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="col-span-2">
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">شركة التأمين</label>
        <select
          value={insFormCompanyId}
          onChange={(e) => setInsFormCompanyId(e.target.value)}
          className="w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-violet-500 focus:outline-none"
        >
          <option value="">-- اختر الشركة --</option>
          {insuranceCompanies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {insuranceCompanies.length === 0 && (
          <p className="mt-0.5 text-[10px] text-violet-400">
            أضف شركات التأمين من قسم التقارير المالية أولاً
          </p>
        )}
      </div>
      <div className="col-span-2">
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">التاريخ</label>
        <input
          type="date"
          value={insFormDate}
          onChange={(e) => setInsFormDate(e.target.value)}
          dir="ltr"
          className="w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-violet-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">المبلغ (ج.م)</label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={insFormAmount}
          onChange={(e) => setInsFormAmount(e.target.value)}
          placeholder="0.00"
          dir="ltr"
          className="w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-violet-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">النوع</label>
        <select
          value={insFormType}
          onChange={(e) => setInsFormType(e.target.value as 'interventions' | 'other')}
          className="w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-violet-500 focus:outline-none"
        >
          <option value="interventions">التداخلات</option>
          <option value="other">دخل آخر</option>
        </select>
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">رقم الكارنيه</label>
        <input
          type="text"
          value={insFormMembership}
          onChange={(e) => setInsFormMembership(e.target.value)}
          placeholder="اختياري"
          className="w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-violet-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">كود الموافقة</label>
        <input
          type="text"
          value={insFormApproval}
          onChange={(e) => setInsFormApproval(e.target.value)}
          placeholder="اختياري"
          className="w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-violet-500 focus:outline-none"
        />
      </div>
      <div className="col-span-2">
        <label className="mb-0.5 block text-[10px] font-black text-slate-500">ملاحظة (اختياري)</label>
        <input
          type="text"
          value={insFormNote}
          onChange={(e) => setInsFormNote(e.target.value)}
          placeholder="تفاصيل إضافية..."
          className="w-full rounded-lg border border-violet-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-violet-500 focus:outline-none"
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
        className="rounded-lg bg-violet-600 px-4 py-1.5 text-[11px] font-black text-white hover:bg-violet-700"
      >
        {editingInsId ? 'حفظ التعديل' : 'حفظ'}
      </button>
    </div>
  </div>
);
