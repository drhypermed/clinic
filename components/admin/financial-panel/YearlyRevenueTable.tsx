/**
 * الملف: YearlyRevenueTable.tsx
 * الوصف: "ميزان المراجعة السنوي". 
 * يعرض ملخصاً مالياً مجمعاً لكافة شهور السنة المختارة: 
 * 1. تجميع الأداء: عرض إجمالي الاشتراكات والنمو المالي السنوي في صف واحد. 
 * 2. الكفاءة المالية: حساب المصاريف الكلية وصافي الربح السنوي للمساعدة في التقييم السريع. 
 * 3. الاتساق البصري: يتبع نفس تصميم الجدول الشهري لضمان سهولة الفهم والمقارنة.
 */

import React from 'react';
import { YearlyStats } from './types';

interface YearlyRevenueTableProps {
  selectedYear: number;
  yearlyStats: YearlyStats;
}

export const YearlyRevenueTable: React.FC<YearlyRevenueTableProps> = ({ selectedYear, yearlyStats }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-right text-slate-700 font-bold">السنة</th>
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
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-6 py-4 text-slate-800 font-bold">{selectedYear}</td>
              <td className="px-4 py-4 text-blue-600 font-bold text-center">{yearlyStats.monthlyCount}</td>
              <td className="px-4 py-4 text-emerald-600 font-bold text-center">{yearlyStats.sixMonthsCount}</td>
              <td className="px-4 py-4 text-purple-600 font-bold text-center">{yearlyStats.yearlyCount}</td>
              <td className="px-6 py-4 text-emerald-600 font-bold">{yearlyStats.totalRevenue.toLocaleString('ar-EG')} ج.م</td>
              <td className="px-6 py-4 text-red-500 font-bold">{yearlyStats.totalExpenses.toLocaleString('ar-EG')} ج.م</td>
              <td className={`px-6 py-4 font-bold ${yearlyStats.netProfit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                {yearlyStats.netProfit.toLocaleString('ar-EG')} ج.م
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
