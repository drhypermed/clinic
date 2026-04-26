/**
 * الملف: MonthlyRevenueTable.tsx
 * الوصف: "الدليل التفصيلي للتدفق الشهري".
 * جدول بيانات مالي يغطي كافة شهور السنة المختارة:
 * 1. تحليل مبيعات الباقات: عدد اشتراكات برو (3 أعمدة) + برو ماكس (3 أعمدة) لكل شهر.
 * 2. مقارنة الأداء: ربط الإيراد بالمصروف الشهري لاستخراج صافي ربح دقيق لكل فترة.
 * 3. ظهور برو ماكس: صف مساهمة شهرية خفيف أسفل الجدول لو فيه اشتراكات برو ماكس.
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
  // هل فيه أي اشتراك برو ماكس في أي شهر؟ لعرض ستريب الاستخلاص في الأسفل
  const hasAnyProMax = revenueData.some(
    (item) =>
      (item.proMaxMonthlyCount || 0) +
        (item.proMaxSixMonthsCount || 0) +
        (item.proMaxYearlyCount || 0) >
      0
  );
  // الإجمالي الكلي لإيرادات برو ماكس عبر كل شهور السنة المعروضة
  const totalProMaxRevenue = revenueData.reduce((sum, item) => sum + (item.proMaxRevenue || 0), 0);
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-right text-slate-700 font-bold align-middle">الشهر</th>
              {/* مجموعة برو (3 أعمدة) */}
              <th colSpan={3} className="px-4 py-2 text-center text-warning-700 font-black border-b border-slate-100 bg-warning-50/40">اشتراكات برو</th>
              {/* مجموعة برو ماكس (3 أعمدة) */}
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
            {revenueData.map((item) => {
              const expense = expenses.find((exp) => exp.month === item.month);
              const netProfit = item.revenue - (expense?.amount || 0);
              const monthName = formatUserDate(buildCairoDateTime(`${item.month}-01`, '12:00'), {
                month: 'long',
              }, 'ar-EG');

              return (
                <tr key={item.month} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800 font-bold">{monthName}</td>
                  {/* برو */}
                  <td className="px-3 py-3 text-brand-600 font-bold text-center">{item.monthlyCount}</td>
                  <td className="px-3 py-3 text-success-600 font-bold text-center">{item.sixMonthsCount}</td>
                  <td className="px-3 py-3 text-slate-600 font-bold text-center">{item.yearlyCount}</td>
                  {/* برو ماكس */}
                  <td className="px-3 py-3 text-brand-600 font-bold text-center bg-[#FFFDE7]/50">{item.proMaxMonthlyCount || 0}</td>
                  <td className="px-3 py-3 text-success-600 font-bold text-center bg-[#FFFDE7]/50">{item.proMaxSixMonthsCount || 0}</td>
                  <td className="px-3 py-3 text-slate-600 font-bold text-center bg-[#FFFDE7]/50">{item.proMaxYearlyCount || 0}</td>
                  <td className="px-4 py-3 text-success-600 font-bold">{item.revenue.toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-4 py-3 text-danger-500 font-bold">{(expense?.amount || 0).toLocaleString('ar-EG')} ج.م</td>
                  <td className={`px-4 py-3 font-bold ${netProfit >= 0 ? 'text-brand-600' : 'text-danger-600'}`}>
                    {netProfit.toLocaleString('ar-EG')} ج.م
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ستريب لعرض مساهمة برو ماكس في الإيرادات — يظهر فقط لو فيه اشتراكات برو ماكس */}
      {hasAnyProMax && (
        <div className="border-t border-[#FFE082] bg-gradient-to-r from-[#FFFDE7] via-[#FFF8E1] to-[#FFFDE7] px-4 py-2 flex items-center justify-between text-xs sm:text-sm">
          <span className="font-black text-[#B45309]">مساهمة برو ماكس في إيرادات السنة:</span>
          <span className="font-black text-[#B45309]">
            {totalProMaxRevenue.toLocaleString('ar-EG')} ج.م
            {totalRevenue > 0 && (
              <span className="ml-2 text-[#E65100]">
                ({Math.round((totalProMaxRevenue / totalRevenue) * 100)}%)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
