/**
 * الملف: PricingSection.tsx
 * الوصف: "مهندس السياسات السعرية". 
 * الجزء المسؤول عن التحكم في خطط أسعار الدكتور المميز: 
 * 1. التسعير المتغير: إمكانية تحديد أسعار مختلفة للفترات (1، 6، 12 شهر) لكل شهر ميلادي. 
 * 2. تتبع التاريخ (Price History): عرض سجل تاريخي لتغير الأسعار عبر الزمن لضمان الشفافية. 
 * 3. تعديل آمن: نظام تحرير يسمح بمراجعة الأسعار قبل حفظها نهائياً لتقليل الخطأ البشري. 
 * 4. واجهة تفاعلية: سهولة التنقل بين الشهور المختلفة لتحديد العروض أو الأسعار الموسمية.
 */

import React from 'react';
import { MonthlyPrices, SubscriptionPrices } from './types';
import { buildCairoDateTime, formatUserDate } from '../../../utils/cairoTime';

interface PricingSectionProps {
  selectedPriceMonth: string;
  prices: SubscriptionPrices;
  tempPrices: SubscriptionPrices;
  editingPrices: boolean;
  showPriceHistory: boolean;
  allMonthlyPrices: MonthlyPrices[];
  onTogglePriceHistory: () => void;
  onStartEditingPrices: () => void;
  onCancelEditingPrices: () => void;
  onSavePrices: () => void;
  onChangeSelectedPriceMonth: (value: string) => void;
  onChangeTempPrices: (value: SubscriptionPrices) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  selectedPriceMonth,
  prices,
  tempPrices,
  editingPrices,
  showPriceHistory,
  allMonthlyPrices,
  onTogglePriceHistory,
  onStartEditingPrices,
  onCancelEditingPrices,
  onSavePrices,
  onChangeSelectedPriceMonth,
  onChangeTempPrices,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 border-t-4 border-blue-500">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-slate-800">أسعار الاشتراكات</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onTogglePriceHistory}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 text-sm transition"
          >
            {showPriceHistory ? 'إخفاء التاريخ' : 'عرض التاريخ'}
          </button>
          {!editingPrices ? (
            <button
              onClick={onStartEditingPrices}
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg text-sm shadow-sm transition"
            >
              تعديل الأسعار
            </button>
          ) : (
            <>
              <button
                onClick={onSavePrices}
                className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg text-sm shadow-sm transition"
              >
                حفظ
              </button>
              <button
                onClick={onCancelEditingPrices}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg border border-red-200 text-sm transition"
              >
                إلغاء
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-slate-600 text-sm font-bold mb-2 block">الشهر المراد تحديد أسعاره:</label>
        <input
          type="month"
          value={selectedPriceMonth}
          onChange={(e) => onChangeSelectedPriceMonth(e.target.value)}
          className="px-4 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100"
        />
        <span className="text-slate-500 text-sm mr-3">
          {formatUserDate(buildCairoDateTime(`${selectedPriceMonth}-01`, '12:00'), {
            year: 'numeric',
            month: 'long',
          }, 'ar-EG')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك شهري</label>
          {editingPrices ? (
            <input
              type="number"
              value={tempPrices.monthly}
              onChange={(e) =>
                onChangeTempPrices({
                  ...tempPrices,
                  monthly: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none"
            />
          ) : (
            <p className="text-2xl font-black text-slate-800">{prices.monthly} ج.م</p>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك 6 شهور</label>
          {editingPrices ? (
            <input
              type="number"
              value={tempPrices.sixMonths}
              onChange={(e) =>
                onChangeTempPrices({
                  ...tempPrices,
                  sixMonths: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none"
            />
          ) : (
            <p className="text-2xl font-black text-slate-800">{prices.sixMonths} ج.م</p>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك سنوي</label>
          {editingPrices ? (
            <input
              type="number"
              value={tempPrices.yearly}
              onChange={(e) =>
                onChangeTempPrices({
                  ...tempPrices,
                  yearly: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none"
            />
          ) : (
            <p className="text-2xl font-black text-slate-800">{prices.yearly} ج.م</p>
          )}
        </div>
      </div>

      {showPriceHistory && allMonthlyPrices.length > 0 && (
        <div className="mt-6">
          <h4 className="text-base font-bold text-slate-700 mb-3">تاريخ الأسعار</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-right text-slate-700 font-bold">الشهر</th>
                  <th className="px-4 py-2 text-right text-slate-700 font-bold">شهري</th>
                  <th className="px-4 py-2 text-right text-slate-700 font-bold">6 شهور</th>
                  <th className="px-4 py-2 text-right text-slate-700 font-bold">سنوي</th>
                </tr>
              </thead>
              <tbody>
                {allMonthlyPrices.map(({ month, prices: p }) => (
                  <tr key={month} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800 font-bold">
                      {formatUserDate(buildCairoDateTime(`${month}-01`, '12:00'), {
                        year: 'numeric',
                        month: 'long',
                      }, 'ar-EG')}
                    </td>
                    <td className="px-4 py-2 text-blue-600">{p.monthly} ج.م</td>
                    <td className="px-4 py-2 text-emerald-600">{p.sixMonths} ج.م</td>
                    <td className="px-4 py-2 text-purple-600">{p.yearly} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
