/**
 * الملف: PublicBookingConfigErrorScreen.tsx
 * الوصف: "شاشة معالجة أخطاء التهيئة". 
 * تظهر هذه الشاشة في الحالات التي يتعذر فيها النظام من جلب بيانات العيادة: 
 * - مثل وجود خطأ في الرابط (Invalid Link). 
 * - أو مشاكل في اتصال الإنترنت (Network Error). 
 * - توفر للمستخدم وسائل للتعافي؛ مثل أزرار "تحديث الصفحة" أو "إعادة المحاولة". 
 * - تعرض نصوصاً إرشادية باللغة العربية لشرح طبيعة المشكلة وكيفية حلها.
 */
import React from 'react';

/**
 * الخصائص الخاصة بشاشة خطأ الإعدادات
 * توفر خيارات للمستخدم لتحديث الصفحة أو إعادة المحاولة
 */
type PublicBookingConfigErrorScreenProps = {
  onReloadPage: () => void;
  onRetry: () => void;
};

/**
 * مكون "شاشة خطأ التحميل" (PublicBookingConfigErrorScreen)
 * تظهر هذه الشاشة عندما يفشل التطبيق في العثور على بيانات الطبيب أو العيادة المرتبطة بالرابط
 */
export const PublicBookingConfigErrorScreen: React.FC<PublicBookingConfigErrorScreenProps> = ({
  onReloadPage,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4">
        {/* أيقونة تحذير بسيطة */}
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-black text-slate-800">تعذر تحميل البيانات</h2>
        <p className="text-slate-600 font-bold text-sm">لم يتم العثور على بيانات العيادة أو الطبيب.</p>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          قد يكون الرابط غير صالح، أو أن الطبيب لم يقم بإعداد صفحة السكرتارية بعد.
          <br />
          يرجى التأكد من صحة الرابط أو التواصل مع الطبيب لتحديث الإعدادات.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          {/* زر تحديث الصفحة بالكامل */}
          <button
            type="button"
            onClick={onReloadPage}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            تحديث الصفحة
          </button>
          {/* زر إعادة محاولة جلب البيانات برمجياً دون تحديث الصفحة */}
          <button
            type="button"
            onClick={onRetry}
            className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    </div>
  );
};
