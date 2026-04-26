/** قسم العنوان وأرقام الفرع: يدير المحافظة، المدينة، العنوان، وأرقام التواصل والواتساب. */
import React from 'react';

interface DoctorAdContactSectionProps {
  // بيانات الفرع
  governorate: string;
  city: string;
  otherCity: string;
  addressDetails: string;
  contactPhone: string;
  whatsapp: string;
  // قوائم الاختيار
  governorates: readonly string[];
  cityOptions: string[];
  isCustomCityValue: (value: string) => boolean;
  // الأحداث
  onGovernorateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onOtherCityChange: (value: string) => void;
  onAddressDetailsChange: (value: string) => void;
  onContactPhoneChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
}

export const DoctorAdContactSection: React.FC<DoctorAdContactSectionProps> = ({
  governorate,
  city,
  otherCity,
  addressDetails,
  contactPhone,
  whatsapp,
  governorates,
  cityOptions,
  isCustomCityValue,
  onGovernorateChange,
  onCityChange,
  onOtherCityChange,
  onAddressDetailsChange,
  onContactPhoneChange,
  onWhatsappChange,
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
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
          >
            <option value="">اختر المحافظة</option>
            {governorates.map((gov) => (
              <option key={gov} value={gov}>{gov}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">المدينة</label>
          <select
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
          >
            <option value="">اختر المدينة</option>
            {cityOptions.map((cityOption) => (
              <option key={cityOption} value={cityOption}>{cityOption}</option>
            ))}
          </select>
        </div>
        {isCustomCityValue(city) && (
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">أخرى</label>
            <input
              value={otherCity}
              onChange={(event) => onOtherCityChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
              placeholder="اكتب اسم المدينة"
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">تفاصيل العنوان</label>
          <textarea
            value={addressDetails}
            onChange={(event) => onAddressDetailsChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all min-h-[90px]"
            placeholder="الشارع، رقم العمارة، الدور، علامة مميزة..."
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم الهاتف</label>
          <input
            value={contactPhone}
            onChange={(event) => onContactPhoneChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">رقم واتساب</label>
          <input
            value={whatsapp}
            onChange={(event) => onWhatsappChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
        </div>
      </div>
    </section>
  );
};
