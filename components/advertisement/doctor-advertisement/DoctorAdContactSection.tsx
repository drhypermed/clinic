/** قسم العنوان والتواصل: يدير المحافظة، المدينة، تفاصيل العنوان، أرقام الهاتف، وروابط التواصل الاجتماعي. */
import React from 'react';

import type { DoctorAdContactSectionProps } from './types';

export const DoctorAdContactSection: React.FC<DoctorAdContactSectionProps> = ({
  governorate,
  city,
  otherCity,
  addressDetails,
  contactPhone,
  whatsapp,
  socialLinks,
  governorates,
  cityOptions,
  isCustomCityValue,
  onGovernorateChange,
  onCityChange,
  onOtherCityChange,
  onAddressDetailsChange,
  onContactPhoneChange,
  onWhatsappChange,
  onSocialPlatformChange,
  onSocialUrlChange,
  onSocialRemove,
  onSocialAdd,
}) => {
  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5">
      <h3 className="text-sm font-black text-slate-700 mb-2.5 block">العنوان وبيانات التواصل</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">المحافظة</label>
          <select
            value={governorate}
            onChange={(event) => onGovernorateChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          >
            <option value="">اختر المحافظة</option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">المدينة</label>
          <select
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          >
            <option value="">اختر المدينة</option>
            {cityOptions.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
        </div>
        {isCustomCityValue(city) && (
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">إضافة مدينة</label>
            <input
              value={otherCity}
              onChange={(event) => onOtherCityChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
              placeholder="أضف اسم المدينة"
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">تفاصيل العنوان</label>
          <textarea
            value={addressDetails}
            onChange={(event) => onAddressDetailsChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[90px]"
            placeholder="الشارع، رقم العمارة، الدور، علامة مميزة..."
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم الهاتف</label>
          <input
            value={contactPhone}
            onChange={(event) => onContactPhoneChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم واتساب</label>
          <input
            value={whatsapp}
            onChange={(event) => onWhatsappChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1">روابط السوشيال ميديا</label>
          <div className="space-y-2">
            {socialLinks.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2">
                <select
                  value={item.platform}
                  onChange={(event) => onSocialPlatformChange(item.id, event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                >
                  <option value="">اختر المنصة</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="X">X</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
                <input
                  value={item.url}
                  onChange={(event) => onSocialUrlChange(item.id, event.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                  placeholder="https://..."
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => onSocialRemove(item.id)}
                  className="px-3 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100 transition-colors"
                >
                  حذف
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={onSocialAdd}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
