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
        <p className="text-amber-600 font-bold text-sm">لا توجد مواعيد متاحة حاليًا. يرجى المحاولة لاحقًا.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
          {slots.map((slot) => (
            <label
              key={slot.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white border border-transparent hover:border-amber-200 cursor-pointer transition-all"
            >
              <input
                type="radio"
                name="slot"
                value={slot.id}
                checked={selectedSlotId === slot.id}
                onChange={() => onSelectSlot(slot.id)}
                className="w-4 h-4 text-amber-600"
              />
              <span className="font-bold text-slate-700 text-sm">{formatSlotLabel(slot.dateTime)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

