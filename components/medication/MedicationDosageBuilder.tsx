import React from 'react';
import { MedicationCustomization } from '../../types';

type DosageCondition = NonNullable<MedicationCustomization['dosageConditions']>[number];

interface Props {
  dosageConditions: MedicationCustomization['dosageConditions'];
  onChange: (conditions: DosageCondition[]) => void;
}

const subFieldClass =
  'w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors';

export const MedicationDosageBuilder: React.FC<Props> = ({ dosageConditions, onChange }) => {
  const conditions = dosageConditions || [];

  const addCondition = () => {
    onChange([
      ...conditions,
      { condition: 'جرعة جديدة', text: '', minWeight: undefined, maxWeight: undefined, minAgeMonths: undefined, maxAgeMonths: undefined, ageUnit: 'months' },
    ]);
  };

  const removeCondition = (idx: number) => {
    const next = [...conditions];
    next.splice(idx, 1);
    onChange(next);
  };

  const updateCondition = (idx: number, patch: Partial<DosageCondition>) => {
    const next = conditions.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange(next);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </span>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider truncate">
            جدول الجرعات (حسب الوزن/العمر)
          </h4>
        </div>
        <button
          type="button"
          onClick={addCondition}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors active:scale-[0.98] shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          إضافة
        </button>
      </div>

      <div className="p-3 sm:p-4 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
        {conditions.length > 0 ? (
          conditions.map((condition, idx) => (
            <div key={idx} className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  الجرعة #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCondition(idx)}
                  aria-label="حذف الجرعة"
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors active:scale-90"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Weight range */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 text-center">
                    الوزن (كجم)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={condition.minWeight ?? ''}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        updateCondition(idx, { minWeight: Number.isFinite(n) ? n : undefined });
                      }}
                      className={subFieldClass}
                      placeholder="من"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="number"
                      value={condition.maxWeight ?? ''}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        updateCondition(idx, { maxWeight: Number.isFinite(n) ? n : undefined });
                      }}
                      className={subFieldClass}
                      placeholder="إلى"
                    />
                  </div>
                </div>

                {/* Age range */}
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">العمر</label>
                    <select
                      value={condition.ageUnit || 'months'}
                      onChange={(e) => updateCondition(idx, { ageUnit: e.target.value as 'days' | 'months' | 'years' })}
                      className="text-[10px] font-bold bg-white border border-slate-300 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="days">أيام</option>
                      <option value="months">شهور</option>
                      <option value="years">سنوات</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={condition.minAgeMonths !== undefined ? (
                        condition.ageUnit === 'years' ? parseFloat((condition.minAgeMonths / 12).toFixed(2)) :
                          condition.ageUnit === 'days' ? parseFloat((condition.minAgeMonths * 30).toFixed(0)) :
                            condition.minAgeMonths
                      ) : ''}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        const val = Number.isFinite(n) ? n : undefined;
                        let months = val;
                        if (val !== undefined) {
                          if (condition.ageUnit === 'years') months = val * 12;
                          else if (condition.ageUnit === 'days') months = val / 30;
                        }
                        updateCondition(idx, { minAgeMonths: months });
                      }}
                      className={subFieldClass}
                      placeholder="من"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                      type="number"
                      value={condition.maxAgeMonths !== undefined ? (
                        condition.ageUnit === 'years' ? parseFloat((condition.maxAgeMonths / 12).toFixed(2)) :
                          condition.ageUnit === 'days' ? parseFloat((condition.maxAgeMonths * 30).toFixed(0)) :
                            condition.maxAgeMonths
                      ) : ''}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        const val = Number.isFinite(n) ? n : undefined;
                        let months = val;
                        if (val !== undefined) {
                          if (condition.ageUnit === 'years') months = val * 12;
                          else if (condition.ageUnit === 'days') months = val / 30;
                        }
                        updateCondition(idx, { maxAgeMonths: months });
                      }}
                      className={subFieldClass}
                      placeholder="إلى"
                    />
                  </div>
                </div>
              </div>

              {/* Dosage text */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">نص الجرعة</label>
                <textarea
                  value={condition.text || ''}
                  onChange={(e) => updateCondition(idx, { text: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none leading-relaxed transition-colors"
                  placeholder="مثال: ملعقة صغيرة 5 مل ثلاث مرات يومياً"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-slate-700 text-sm font-bold">لا توجد جرعات مخصصة</div>
            <div className="text-slate-500 text-xs mt-1">اضغط "إضافة" لبناء منطق الحساب الخاص بك.</div>
          </div>
        )}
      </div>
      <div className="px-4 py-2.5 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 bg-slate-50">
        النظام سيختار الجرعة المناسبة تلقائياً بناءً على تطابق وزن المريض وعمره مع النطاقات المحددة.
      </div>
    </div>
  );
};
