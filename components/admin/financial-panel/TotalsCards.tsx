/**
 * الملف: TotalsCards.tsx
 * الوصف: "خلاصة الميزانية السنوية". 
 * عرض بصري مكثف للحالة المالية خلال العام المختار: 
 * - بطاقة الإيرادات: إجمالي الأموال الداخلة من جميع الاشتراكات. 
 * - بطاقة المصروفات: إجمالي المبالغ المنفقة على التشغيل. 
 * - بطاقة صافي الربح: النتيجة النهائية (أزرق للربح، رمادي للخسارة) مع توضيح الحالة. 
 * - تنسيق محلي: عرض الأرقام بتنسيق العملة المصرية (ج.م) لسهولة المتابعة الإدارية.
 */

import React from 'react';
import { Totals } from './types';

interface TotalsCardsProps {
  totals: Totals;
  selectedYear: number;
}

export const TotalsCards: React.FC<TotalsCardsProps> = ({ totals, selectedYear }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-success-600 to-success-700 rounded-xl p-6 shadow-lg">
        <h4 className="text-white text-lg font-bold mb-2">💰 إجمالي الإيرادات</h4>
        <p className="text-4xl font-black text-white">{totals.totalRevenue.toLocaleString('ar-EG')} ج.م</p>
        <p className="text-success-100 text-sm mt-2">للعام {selectedYear}</p>
      </div>

      <div className="bg-gradient-to-br from-danger-600 to-danger-700 rounded-xl p-6 shadow-lg">
        <h4 className="text-white text-lg font-bold mb-2">💸 إجمالي المصروفات</h4>
        <p className="text-4xl font-black text-white">{totals.totalExpenses.toLocaleString('ar-EG')} ج.م</p>
        <p className="text-danger-100 text-sm mt-2">للعام {selectedYear}</p>
      </div>

      <div
        className={`bg-gradient-to-br ${
          totals.netProfit >= 0 ? 'from-brand-600 to-brand-700' : 'from-gray-600 to-gray-700'
        } rounded-xl p-6 shadow-lg`}
      >
        <h4 className="text-white text-lg font-bold mb-2">📊 صافي الربح</h4>
        <p className="text-4xl font-black text-white">{totals.netProfit.toLocaleString('ar-EG')} ج.م</p>
        <p className="text-brand-100 text-sm mt-2">{totals.netProfit >= 0 ? 'ربح' : 'خسارة'}</p>
      </div>
    </div>
  );
};
