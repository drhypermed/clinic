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
import { FaCalendarCheck } from 'react-icons/fa6';
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
      <label className="block text-xs font-bold text-slate-500 mb-1.5">المواعيد المتاحة</label>
      {slotsLoading ? (
        <p className="text-slate-500 font-bold text-sm"><LoadingText>جاري تحميل المواعيد</LoadingText></p>
      ) : slots.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600">
          لا توجد مواعيد متاحة حاليًا. يرجى المحاولة لاحقًا.
        </div>
      ) : (
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
          {slots.map((slot) => (
            <label
              key={slot.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                selectedSlotId === slot.id
                  ? 'border-brand-500 bg-white shadow-sm'
                  : 'border-transparent hover:border-brand-200 hover:bg-white'
              }`}
            >
              <input
                type="radio"
                name="slot"
                value={slot.id}
                checked={selectedSlotId === slot.id}
                onChange={() => onSelectSlot(slot.id)}
                className="h-4 w-4 text-brand-600"
              />
              <FaCalendarCheck className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
              <span className="text-sm font-bold text-slate-700">{formatSlotLabel(slot.dateTime)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

