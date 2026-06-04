/**
 * الملف: PublicBookingStatusViews.tsx
 * الوصف: "واجهات الحالات الاستثنائية".
 * يحتوي الملف على مكونات بسيطة تظهر للمريض في ظروف معينة:
 * - LoadingView: شاشة الانتظار أثناء جلب البيانات.
 * - InvalidLinkView: تظهر إذا كان الرابط معطلاً أو غير صحيح.
 *
 * ملحوظة: شاشة LoginRequiredView لم تعد مستخدمة بعد توحيد منطق الحجز —
 * دلوقتي زر "سجّل دخول بـ Google" بيظهر داخل الفورم نفسه عند الضغط على
 * "احجز" إذا كان الطبيب فعّل اشتراط جوجل من إعدادات الحجز العام.
 */
import React from 'react';

export const PublicBookingLoadingView: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
        </div>
        <p className="text-sm font-black text-slate-500 animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
};

export const PublicBookingInvalidLinkView: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </div>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-lg font-black text-slate-800">رابط غير صالح</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">هذا الرابط غير صالح أو منتهي الصلاحية. يرجى التواصل مع العيادة للحصول على رابط حجز جديد.</p>
        </div>
      </div>
    </div>
  );
};
