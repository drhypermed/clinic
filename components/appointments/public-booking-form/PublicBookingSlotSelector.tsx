/**
 * الملف: PublicBookingSlotSelector.tsx
 * الوصف: مكون "مختص اختيار الموعد". 
 * يعرض هذا المكون قائمة المواعيد المتاحة (Slots) التي حددها الطبيب مسبقاً. 
 * يتميز بصرياً بـ: 
 * - استخدام أزرار راديو (Radio Buttons) مخفية داخل بطاقات صغيرة سهلة الضغط على الموبايل. 
 * - تمييز الموعد المختار بحدود برتقالية (Amber Border). 
 * - معالجة حالات "عدم وجود مواعيد" برسالة تنبيه واضحة للمريض.
 */
import React from 'react';
import { FaCalendarCheck, FaRegCalendarXmark } from 'react-icons/fa6';
import { LoadingText } from '../../ui/LoadingText';

import type { PublicBookingSlot } from '../../../types';

type PublicBookingSlotSelectorProps = {
  slotsLoading: boolean;
  slots: PublicBookingSlot[];
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  formatSlotLabel: (dateTime: string) => string;
};

export const PublicBookingSlotSelector: React.FC<PublicBookingSlotSelectorProps> = ({
  slotsLoading,
  slots,
  selectedSlotId,
  onSelectSlot,
  formatSlotLabel,
}) => {
  return (
    <div>
      <label className="block text-xs font-black text-slate-500 mb-2 tracking-wide">المواعيد المتاحة</label>
      {slotsLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-slate-500 font-bold text-sm"><LoadingText>جاري تحميل المواعيد</LoadingText></p>
        </div>
      ) : slots.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <FaRegCalendarXmark className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-600">لا توجد مواعيد متاحة حاليًا</p>
            <p className="mt-0.5 text-xs font-bold text-slate-400">يرجى المحاولة لاحقًا أو التواصل مع العيادة.</p>
          </div>
        </div>
      ) : (
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
          {slots.map((slot) => (
            <label
              key={slot.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition-all duration-200 ${
                selectedSlotId === slot.id
                  ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-100/30'
                  : 'border-transparent bg-white hover:border-brand-200 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="slot"
                value={slot.id}
                checked={selectedSlotId === slot.id}
                onChange={() => onSelectSlot(slot.id)}
                className="h-4 w-4 text-brand-600 accent-brand-600"
              />
              <FaCalendarCheck className={`h-4 w-4 shrink-0 transition-colors ${selectedSlotId === slot.id ? 'text-brand-600' : 'text-slate-300'}`} aria-hidden="true" />
              <span className={`text-sm font-bold transition-colors ${selectedSlotId === slot.id ? 'text-brand-800' : 'text-slate-600'}`}>{formatSlotLabel(slot.dateTime)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
