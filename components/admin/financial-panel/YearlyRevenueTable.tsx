/**
 * الملف: YearlyRevenueTable.tsx
 * الوصف: ميزان سنوي مجمّع بـ 6 أعمدة عدد اشتراكات (3 لبرو + 3 لبرو ماكس)
 * وإيرادات + مصروفات + صافي ربح. الصف الثاني تحت "برو ماكس" يعرض الإيرادات
 * المستقلة لبرو ماكس عشان الأدمن يعرف مساهمتها في الإجمالي.
 */

import React from 'react';
import { YearlyStats } from './types';

interface YearlyRevenueTableProps {
  selectedYear: number;
  yearlyStats: YearlyStats;
}

export const YearlyRevenueTable: React.FC<YearlyRevenueTableProps> = ({ selectedYear, yearlyStats }) => {
  const totalProMaxCount =
    (yearlyStats.proMaxMonthlyCount || 0) +
    (yearlyStats.proMaxSixMonthsCount || 0) +
    (yearlyStats.proMaxYearlyCount || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-right text-slate-700 font-bold align-middle">السنة</th>
              <th colSpan={3} className="px-4 py-2 text-center text-warning-700 font-black border-b border-slate-100 bg-warning-50/40">اشتراكات برو</th>
              <th colSpan={3} className="px-4 py-2 text-center text-[#B45309] font-black border-b border-slate-100 bg-gradient-to-r from-[#FFFDE7] to-[#FFF8E1]">اشتراكات برو ماكس</th>
              <th rowSpan={2} className="px-4 py-3 text-right text-slate-700 font-bold align-middle">الإيرادات</th>
              <th rowSpan={2} className="px-4 py-3 text-right text-slate-700 font-bold align-middle">المصروفات</th>
              <th rowSpan={2} className="px-4 py-3 text-right text-slate-700 font-bold align-middle">صافي الربح</th>
            </tr>
            <tr className="border-b border-slate-100">
              <th className="px-3 py-1.5 text-center text-brand-600 font-bold">شهري</th>
              <th className="px-3 py-1.5 text-center text-success-600 font-bold">6 أشهر</th>
              <th className="px-3 py-1.5 text-center text-slate-600 font-bold">سنوي</th>
              <th className="px-3 py-1.5 text-center text-brand-600 font-bold">شهري</th>
              <th className="px-3 py-1.5 text-center text-success-600 font-bold">6 أشهر</th>
              <th className="px-3 py-1.5 text-center text-slate-600 font-bold">سنوي</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-800 font-bold">{selectedYear}</td>
              {/* برو */}
              <td className="px-3 py-3 text-brand-600 font-bold text-center">{yearlyStats.monthlyCount}</td>
              <td className="px-3 py-3 text-success-600 font-bold text-center">{yearlyStats.sixMonthsCount}</td>
              <td className="px-3 py-3 text-slate-600 font-bold text-center">{yearlyStats.yearlyCount}</td>
              {/* برو ماكس */}
              <td className="px-3 py-3 text-brand-600 font-bold text-center bg-[#FFFDE7]/50">{yearlyStats.proMaxMonthlyCount || 0}</td>
              <td className="px-3 py-3 text-success-600 font-bold text-center bg-[#FFFDE7]/50">{yearlyStats.proMaxSixMonthsCount || 0}</td>
              <td className="px-3 py-3 text-slate-600 font-bold text-center bg-[#FFFDE7]/50">{yearlyStats.proMaxYearlyCount || 0}</td>
              <td className="px-4 py-3 text-success-600 font-bold">{yearlyStats.totalRevenue.toLocaleString('ar-EG')} ج.م</td>
              <td className="px-4 py-3 text-danger-500 font-bold">{yearlyStats.totalExpenses.toLocaleString('ar-EG')} ج.م</td>
              <td className={`px-4 py-3 font-bold ${yearlyStats.netProfit >= 0 ? 'text-brand-600' : 'text-danger-600'}`}>
                {yearlyStats.netProfit.toLocaleString('ar-EG')} ج.م
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ستريب لعرض مساهمة برو ماكس في الإيرادات — يظهر فقط لو فيه اشتراكات برو ماكس */}
      {totalProMaxCount > 0 && (
        <div className="border-t border-[#FFE082] bg-gradient-to-r from-[#FFFDE7] via-[#FFF8E1] to-[#FFFDE7] px-4 py-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="font-black text-[#B45309]">مساهمة برو ماكس في الإيرادات:</span>
          <span className="font-black text-[#B45309]">
            {(yearlyStats.proMaxRevenue || 0).toLocaleString('ar-EG')} ج.م
            {yearlyStats.totalRevenue > 0 && (
              <span className="ml-2 text-[#E65100]">
                ({Math.round(((yearlyStats.proMaxRevenue || 0) / yearlyStats.totalRevenue) * 100)}%)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
