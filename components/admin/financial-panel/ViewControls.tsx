/**
 * الملف: ViewControls.tsx
 * الوصف: "محول عرض التقارير المالية". 
 * مكون توجيهي يمنح المسؤول المرونة في استعراض البيانات: 
 * 1. اختيار النطاق الزمني: التبديل الفوري بين العرض الشهري (التفصيلي) والسنوي (المجمل). 
 * 2. الملاحة التاريخية: قائمة منسدلة لاختيار السنة المالية المراد تحليلها من الأرشيف. 
 * 3. التغذية الراجعة البصرية: تمييز الوضع النشط حالياً لتسهيل تجربة المستخدم.
 */

import React from 'react';
import { FinancialViewMode } from './types';

interface ViewControlsProps {
  selectedYear: number;
  availableYears: number[];
  viewMode: FinancialViewMode;
  onChangeSelectedYear: (value: number) => void;
  onChangeViewMode: (value: FinancialViewMode) => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  selectedYear,
  availableYears,
  viewMode,
  onChangeSelectedYear,
  onChangeViewMode,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
      <div className="flex gap-3 items-center">
        <label className="text-slate-700 font-bold text-sm">السنة:</label>
        <select
          value={selectedYear}
          onChange={(e) => onChangeSelectedYear(parseInt(e.target.value, 10))}
          className="px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none text-sm font-bold"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChangeViewMode('monthly')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
            viewMode === 'monthly'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-200/60'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          شهري
        </button>
        <button
          onClick={() => onChangeViewMode('yearly')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
            viewMode === 'yearly'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-200/60'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          سنوي
        </button>
      </div>
    </div>
  );
};
