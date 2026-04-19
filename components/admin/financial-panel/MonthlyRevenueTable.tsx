/**
 * الملف: MonthlyRevenueTable.tsx
 * الوصف: "الدليل التفصيلي للتدفق الشهري". 
 * جدول بيانات مالي يغطي كافة شهور السنة المختارة: 
 * 1. تحليل مبيعات الباقات: عدد الاشتراكات (شهري/6 أشهر/سنوي) لكل شهر. 
 * 2. مقارنة الأداء: ربط الإيراد بالمصروف الشهري لاستخراج صافي ربح دقيق لكل فترة. 
 * 3. التفاعل المرئي: تلوين الأرباح والخسائر لتسهيل التمييز البصري السريع. 
 * 4. أسماء الشهور العربية: عرض التواريخ بأسماء الشهور المحلية لراحة المستخدم الإداري.
 */

import React from 'react';
import { MonthlyExpense, RevenueData } from './types';
import { buildCairoDateTime, formatUserDate } from '../../../utils/cairoTime';

interface MonthlyRevenueTableProps {
  revenueData: RevenueData[];
  expenses: MonthlyExpense[];
}

export const MonthlyRevenueTable: React.FC<MonthlyRevenueTableProps> = ({ revenueData, expenses }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-right text-slate-700 font-bold">الشهر</th>
              <th className="px-6 py-4 text-center text-slate-700 font-bold" colSpan={3}>
                عدد الاشتراكات
              </th>
              <th className="px-6 py-4 text-right text-slate-700 font-bold">الإيرادات</th>
              <th className="px-6 py-4 text-right text-slate-700 font-bold">المصروفات</th>
              <th className="px-6 py-4 text-right text-slate-700 font-bold">صافي الربح</th>
            </tr>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-2 text-right text-slate-400 font-bold text-sm"></th>
              <th className="px-4 py-2 text-center text-blue-600 font-bold text-sm">شهري</th>
              <th className="px-4 py-2 text-center text-emerald-600 font-bold text-sm">6 أشهر</th>
              <th className="px-4 py-2 text-center text-purple-600 font-bold text-sm">سنوي</th>
              <th className="px-6 py-2 text-right text-slate-400 font-bold text-sm"></th>
              <th className="px-6 py-2 text-right text-slate-400 font-bold text-sm"></th>
              <th className="px-6 py-2 text-right text-slate-400 font-bold text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {revenueData.map((item) => {
              const expense = expenses.find((exp) => exp.month === item.month);
              const netProfit = item.revenue - (expense?.amount || 0);
              const monthName = formatUserDate(buildCairoDateTime(`${item.month}-01`, '12:00'), {
                month: 'long',
              }, 'ar-EG');

              return (
                <tr key={item.month} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-800 font-bold">{monthName}</td>
                  <td className="px-4 py-4 text-blue-600 font-bold text-center">{item.monthlyCount}</td>
                  <td className="px-4 py-4 text-emerald-600 font-bold text-center">{item.sixMonthsCount}</td>
                  <td className="px-4 py-4 text-purple-600 font-bold text-center">{item.yearlyCount}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">{item.revenue.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-6 py-4 text-red-500 font-bold">{(expense?.amount || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td className={`px-6 py-4 font-bold ${netProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                    {netProfit.toLocaleString('ar-EG')} ج.م
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
