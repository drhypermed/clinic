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
        <div ref={alertRef} className="flex items-start gap-2.5 rounded-xl border border-danger-200 bg-danger-50 p-3 scroll-mt-24">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-500 text-white">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-danger-700 text-sm font-black">{formError}</p>
        </div>
      )}

      {bookingQuotaNotice && (
        <div ref={alertRef} className="rounded-xl border-2 border-amber-200 bg-gradient-to-l from-amber-50 to-amber-100/50 p-4 scroll-mt-24">
          <p className="text-amber-900 text-sm font-black">{bookingQuotaNotice.message}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {bookingQuotaNotice.whatsappUrl ? (
              <a
                href={bookingQuotaNotice.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-md shadow-emerald-200/50 transition-all duration-200 hover:shadow-lg"
              >
                💬 تواصل واتساب
              </a>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
