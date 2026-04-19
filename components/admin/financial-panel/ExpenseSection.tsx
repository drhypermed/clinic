/**
 * الملف: ExpenseSection.tsx
 * الوصف: "مدخل التكاليف التشغيلية". 
 * واجهة مخصصة لتسجيل وتوثيق مصروفات النظام: 
 * 1. تسجيل البيانات: إدخال الشهر، المبلغ، ووصف المصروف (مثل سيرفرات، رواتب، إعلانات). 
 * 2. الربط المالي: يتم ربط المصروفات آلياً بحسابات الأرباح الشهرية والسنوية. 
 * 3. سهولة الاستخدام: نموذج مبسط وسريع لضمان دقة البيانات المالية المدخلة من قبل المسؤول.
 */

import React from 'react';
import { NewExpenseInput } from './types';

interface ExpenseSectionProps {
  newExpense: NewExpenseInput;
  onChangeNewExpense: (value: NewExpenseInput) => void;
  onSaveExpense: () => void;
}

export const ExpenseSection: React.FC<ExpenseSectionProps> = ({
  newExpense,
  onChangeNewExpense,
  onSaveExpense,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 border-t-4 border-purple-400">
      <h3 className="text-lg font-bold text-slate-800 mb-4">إضافة مصروف شهري</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-slate-600 text-sm font-bold mb-2 block">الشهر</label>
          <input
            type="month"
            value={newExpense.month}
            onChange={(e) => onChangeNewExpense({ ...newExpense, month: e.target.value })}
            className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="text-slate-600 text-sm font-bold mb-2 block">المبلغ (ج.م)</label>
          <input
            type="number"
            value={newExpense.amount || ''}
            onChange={(e) =>
              onChangeNewExpense({
                ...newExpense,
                amount: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-slate-600 text-sm font-bold mb-2 block">الوصف</label>
          <input
            type="text"
            value={newExpense.description}
            onChange={(e) => onChangeNewExpense({ ...newExpense, description: e.target.value })}
            className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
            placeholder="مثال: إيجار - رواتب"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={onSaveExpense}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg shadow-sm transition"
          >
            حفظ المصروف
          </button>
        </div>
      </div>
    </div>
  );
};
