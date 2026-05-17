/**
 * الملف: PublicBookingStatusViews.tsx
 * الوصف: "واجهات الحالات الاستثنائية".
 * يحتوي الملف على مكونات بسيطة تظهر للمريض في ظروف معينة:
 * - LoadingView: شاشة الانتظار أثناء جلب البيانات.
 * - InvalidLinkView: تظهر إذا كان الرابط معطلاً أو غير صحيح.
 *
 * ملحوظة: LoginRequiredView القديم اتشال بعد توحيد منطق الحجز —
 * دلوقتي زر "سجّل دخول بـ Google" بيظهر داخل الفورم نفسه عند الضغط على
 * "احجز" إذا كان الطبيب فعّل اشتراط جوجل من إعدادات الحجز العام.
 */
import React from 'react';
import { LoadingText } from '../../ui/LoadingText';


export const PublicBookingLoadingView: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="text-slate-600 font-bold"><LoadingText>جاري التحميل</LoadingText></div>
    </div>
  );
};

export const PublicBookingInvalidLinkView: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-700 font-bold">رابط غير صالح أو منتهي الصلاحية.</p>
      </div>
    </div>
  );
};
