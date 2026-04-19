import React from 'react';

/**
 * مكون شاشة التحميل (Loading State Screen Component)
 * تصميم بسيط وموحّد: دائرة زرقاء بتلف في منتصف الشاشة على خلفية الصفحة الطبيعية،
 * بحيث تكون شاشة التحميل متناسقة مع باقي الصفحات ولا تغطي السياق البصري بصورة/بلور.
 */

interface LoadingStateScreenProps {
  message?: string; // رسالة اختيارية تظهر أسفل الدائرة (مثلاً: "جاري التحميل")
}

export const LoadingStateScreen: React.FC<LoadingStateScreenProps> = ({ message }) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center gap-4 p-4"
      dir="rtl"
      role="status"
      aria-live="polite"
      style={{
        // نفس تدرّج السبلاش — عشان التنقل بين السبلاش والـ loading يبقى ناعم
        // بدون ومضة شاشة بيضاء.
        background: 'radial-gradient(ellipse at top, #eaf4ff 0%, #ffffff 55%, #f6fbff 100%)',
      }}
    >
      {/* الدائرة الزرقاء الدوّارة */}
      <div className="relative w-14 h-14" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-[3px] border-blue-100" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-500 animate-spin" />
      </div>

      {/* الرسالة (إن وجدت) */}
      {message && (
        <p className="text-sm sm:text-base font-bold text-slate-600 tracking-tight text-center">
          {message}
        </p>
      )}
    </div>
  );
};
