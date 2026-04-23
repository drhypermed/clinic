/**
 * الملف: PricingSection.tsx
 * الوصف: إدارة أسعار الاشتراكات الشهرية لكل فئة (برو / برو ماكس).
 * لكل شهر ميلادي: 3 أسعار لبرو (شهري/6شهور/سنوي) + 3 أسعار لبرو ماكس.
 * يدعم: عرض تاريخ الأسعار، تعديل آمن مع مراجعة، تنقل بين الشهور.
 */

import React from 'react';
import { MonthlyPrices, ProMaxSubscriptionPrices, SubscriptionPrices } from './types';
import { buildCairoDateTime, formatUserDate } from '../../../utils/cairoTime';

interface PricingSectionProps {
  selectedPriceMonth: string;
  prices: SubscriptionPrices;
  proMaxPrices: ProMaxSubscriptionPrices;
  tempPrices: SubscriptionPrices;
  tempProMaxPrices: ProMaxSubscriptionPrices;
  editingPrices: boolean;
  showPriceHistory: boolean;
  allMonthlyPrices: MonthlyPrices[];
  onTogglePriceHistory: () => void;
  onStartEditingPrices: () => void;
  onCancelEditingPrices: () => void;
  onSavePrices: () => void;
  onChangeSelectedPriceMonth: (value: string) => void;
  onChangeTempPrices: (value: SubscriptionPrices) => void;
  onChangeTempProMaxPrices: (value: ProMaxSubscriptionPrices) => void;
}

/** Input وحدة لتعديل سعر واحد — يوحد الشكل لكل الحقول */
const PriceInput: React.FC<{
  value: number;
  onChange: (next: number) => void;
  tone?: 'amber' | 'gold';
}> = ({ value, onChange, tone = 'amber' }) => {
  const focusClass = tone === 'gold'
    ? 'focus:border-[#FFB300] focus:ring-[#FFE082]'
    : 'focus:border-amber-400 focus:ring-amber-100';
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className={`w-full px-3 py-2 bg-white text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 ${focusClass}`}
    />
  );
};

export const PricingSection: React.FC<PricingSectionProps> = ({
  selectedPriceMonth,
  prices,
  proMaxPrices,
  tempPrices,
  tempProMaxPrices,
  editingPrices,
  showPriceHistory,
  allMonthlyPrices,
  onTogglePriceHistory,
  onStartEditingPrices,
  onCancelEditingPrices,
  onSavePrices,
  onChangeSelectedPriceMonth,
  onChangeTempPrices,
  onChangeTempProMaxPrices,
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

      {/* ═══ أسعار باقة برو ═══ */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" /></svg>
            باقة برو
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50/40 rounded-xl border border-amber-100 p-4">
            <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك شهري</label>
            {editingPrices ? (
              <PriceInput value={tempPrices.monthly} onChange={(v) => onChangeTempPrices({ ...tempPrices, monthly: v })} />
            ) : (
              <p className="text-2xl font-black text-slate-800">{prices.monthly} ج.م</p>
            )}
          </div>
          <div className="bg-amber-50/40 rounded-xl border border-amber-100 p-4">
            <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك 6 شهور</label>
            {editingPrices ? (
              <PriceInput value={tempPrices.sixMonths} onChange={(v) => onChangeTempPrices({ ...tempPrices, sixMonths: v })} />
            ) : (
              <p className="text-2xl font-black text-slate-800">{prices.sixMonths} ج.م</p>
            )}
          </div>
          <div className="bg-amber-50/40 rounded-xl border border-amber-100 p-4">
            <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك سنوي</label>
            {editingPrices ? (
              <PriceInput value={tempPrices.yearly} onChange={(v) => onChangeTempPrices({ ...tempPrices, yearly: v })} />
            ) : (
              <p className="text-2xl font-black text-slate-800">{prices.yearly} ج.م</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ أسعار باقة برو ماكس (ذهبي لامع) ═══ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFF176] via-[#FFD54F] to-[#FFB300] border border-[#FF8F00] text-[#B45309] text-xs font-black shadow-[0_1px_3px_rgba(255,193,7,0.4)]">
            <svg className="w-3 h-3 text-[#E65100]" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" /></svg>
            باقة برو ماكس
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFF8E1] rounded-xl border border-[#FFE082] p-4">
            <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك شهري</label>
            {editingPrices ? (
              <PriceInput tone="gold" value={tempProMaxPrices.monthly} onChange={(v) => onChangeTempProMaxPrices({ ...tempProMaxPrices, monthly: v })} />
            ) : (
              <p className="text-2xl font-black text-[#B45309]">{proMaxPrices.monthly} ج.م</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFF8E1] rounded-xl border border-[#FFE082] p-4">
            <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك 6 شهور</label>
            {editingPrices ? (
              <PriceInput tone="gold" value={tempProMaxPrices.sixMonths} onChange={(v) => onChangeTempProMaxPrices({ ...tempProMaxPrices, sixMonths: v })} />
            ) : (
              <p className="text-2xl font-black text-[#B45309]">{proMaxPrices.sixMonths} ج.م</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFF8E1] rounded-xl border border-[#FFE082] p-4">
            <label className="text-slate-600 text-sm font-bold mb-2 block">اشتراك سنوي</label>
            {editingPrices ? (
              <PriceInput tone="gold" value={tempProMaxPrices.yearly} onChange={(v) => onChangeTempProMaxPrices({ ...tempProMaxPrices, yearly: v })} />
            ) : (
              <p className="text-2xl font-black text-[#B45309]">{proMaxPrices.yearly} ج.م</p>
            )}
          </div>
        </div>
      </div>

      {showPriceHistory && allMonthlyPrices.length > 0 && (
        <div className="mt-6">
          <h4 className="text-base font-bold text-slate-700 mb-3">تاريخ الأسعار</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th rowSpan={2} className="px-3 py-2 text-right text-slate-700 font-bold align-middle">الشهر</th>
                  <th colSpan={3} className="px-3 py-1.5 text-center text-amber-700 font-black border-b border-slate-100 bg-amber-50/40">باقة برو</th>
                  <th colSpan={3} className="px-3 py-1.5 text-center text-[#B45309] font-black bg-gradient-to-r from-[#FFFDE7] to-[#FFF8E1]">باقة برو ماكس</th>
                </tr>
                <tr>
                  <th className="px-3 py-1.5 text-right text-slate-600 font-bold">شهري</th>
                  <th className="px-3 py-1.5 text-right text-slate-600 font-bold">6 شهور</th>
                  <th className="px-3 py-1.5 text-right text-slate-600 font-bold">سنوي</th>
                  <th className="px-3 py-1.5 text-right text-slate-600 font-bold">شهري</th>
                  <th className="px-3 py-1.5 text-right text-slate-600 font-bold">6 شهور</th>
                  <th className="px-3 py-1.5 text-right text-slate-600 font-bold">سنوي</th>
                </tr>
              </thead>
              <tbody>
                {allMonthlyPrices.map(({ month, prices: p, proMaxPrices: pm }) => (
                  <tr key={month} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-800 font-bold">
                      {formatUserDate(buildCairoDateTime(`${month}-01`, '12:00'), {
                        year: 'numeric',
                        month: 'long',
                      }, 'ar-EG')}
                    </td>
                    <td className="px-3 py-2 text-amber-700">{p.monthly}</td>
                    <td className="px-3 py-2 text-amber-700">{p.sixMonths}</td>
                    <td className="px-3 py-2 text-amber-700">{p.yearly}</td>
                    <td className="px-3 py-2 text-[#B45309]">{pm?.monthly ?? '—'}</td>
                    <td className="px-3 py-2 text-[#B45309]">{pm?.sixMonths ?? '—'}</td>
                    <td className="px-3 py-2 text-[#B45309]">{pm?.yearly ?? '—'}</td>
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
