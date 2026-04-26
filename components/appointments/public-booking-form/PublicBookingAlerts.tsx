/**
 * الملف: PublicBookingAlerts.tsx
 * الوصف: مكون "تنبيهات الحجز". 
 * مسؤول عن إظهار الرسائل التحذيرية للمريض في حالتين: 
 * 1. خطأ في البيانات (Validation Error): مثل نسيان الاسم أو الموبايل. 
 * 2. تجاوز حد الحجز (Quota Exceeded): عندما تصل العيادة للحد الأقصى 
 *    من الحجوزات المسموحة، يوفر المكون رسالة شرح مع زر "تواصل واتساب" 
 *    ليتمكن المريض من طلب استثناء أو حجز يدوي.
 */
import React from 'react';

import type { BookingQuotaNotice } from './types';

type PublicBookingAlertsProps = {
  formError: string | null;
  bookingQuotaNotice: BookingQuotaNotice | null;
  alertRef: React.RefObject<HTMLDivElement | null>;
};

export const PublicBookingAlerts: React.FC<PublicBookingAlertsProps> = ({
  formError,
  bookingQuotaNotice,
  alertRef,
}) => {
  return (
    <>
      {formError && !bookingQuotaNotice && (
        <p ref={alertRef} className="text-danger-600 text-sm font-bold flex items-center gap-1 scroll-mt-24">
          <span className="w-4 h-4 rounded-full bg-danger-500 flex items-center justify-center text-white text-xs">!</span>
          {formError}
        </p>
      )}

      {bookingQuotaNotice && (
        <div ref={alertRef} className="rounded-xl border border-warning-300 bg-warning-50 p-3 scroll-mt-24">
          <p className="text-warning-900 text-xs font-black">{bookingQuotaNotice.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {bookingQuotaNotice.whatsappUrl ? (
              <a
                href={bookingQuotaNotice.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-600 hover:bg-success-700 text-white text-xs font-black"
              >
                تواصل واتساب
              </a>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
