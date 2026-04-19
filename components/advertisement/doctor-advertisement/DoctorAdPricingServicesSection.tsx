/** قسم الأسعار والخدمات: يتيح تحديد سعر الكشف والاستشارة (مع إمكانية إضافة خصومات) وقائمة بخدمات العيادة. */
import React from 'react';

import type { DoctorAdPricingServicesSectionProps } from './types';

export const DoctorAdPricingServicesSection: React.FC<DoctorAdPricingServicesSectionProps> = ({
  examinationPrice,
  discountedExaminationPrice,
  consultationPrice,
  discountedConsultationPrice,
  clinicServices,
  onExaminationPriceChange,
  onDiscountedExaminationPriceChange,
  onConsultationPriceChange,
  onDiscountedConsultationPriceChange,
  onServiceNameChange,
  onServicePriceChange,
  onServiceDiscountedPriceChange,
  onRemoveService,
  onAddService,
}) => {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5">
      <h3 className="text-sm font-black text-slate-700 mb-2.5 block">الأسعار والخدمات</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">سعر الكشف</label>
          <input
            value={examinationPrice}
            onChange={(event) => onExaminationPriceChange(event.target.value)}
            type="number"
            min={0}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="بالجنيه"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">سعر الخصم (للكشف)</label>
          <input
            value={discountedExaminationPrice}
            onChange={(event) => onDiscountedExaminationPriceChange(event.target.value)}
            type="number"
            min={0}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="اختياري - بالجنيه"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">سعر الاستشارة</label>
          <input
            value={consultationPrice}
            onChange={(event) => onConsultationPriceChange(event.target.value)}
            type="number"
            min={0}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="بالجنيه"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">سعر الخصم (للاستشارة)</label>
          <input
            value={discountedConsultationPrice}
            onChange={(event) => onDiscountedConsultationPriceChange(event.target.value)}
            type="number"
            min={0}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="اختياري - بالجنيه"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-bold text-slate-400 mb-2">خدمات العيادة</label>
        <div className="space-y-1.5">
          {clinicServices.map((service) => (
            <div key={service.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_auto] gap-2">
              <input
                value={service.name}
                onChange={(event) => onServiceNameChange(service.id, event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="اسم الخدمة"
              />
              <input
                value={service.price == null ? '' : String(service.price)}
                onChange={(event) => onServicePriceChange(service.id, event.target.value)}
                type="number"
                min={0}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="السعر"
              />
              <input
                value={service.discountedPrice == null ? '' : String(service.discountedPrice)}
                onChange={(event) => onServiceDiscountedPriceChange(service.id, event.target.value)}
                type="number"
                min={0}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                placeholder="الخصم"
              />
              <button
                type="button"
                onClick={() => onRemoveService(service.id)}
                className="px-3 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100 transition-colors"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={onAddService}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إضافة
          </button>
        </div>
      </div>
    </section>
  );
};
