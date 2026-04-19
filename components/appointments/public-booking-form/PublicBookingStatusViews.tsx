/**
 * الملف: PublicBookingStatusViews.tsx
 * الوصف: "واجهات الحالات الاستثنائية". 
 * يحتوي الملف على مجموعة مكونات بسيطة تظهر للمريض في ظروف معينة: 
 * - LoadingView: شاشة الانتظار أثناء جلب البيانات. 
 * - InvalidLinkView: تظهر إذا كان الرابط معطلاً أو غير صحيح. 
 * - LoginRequiredView: شاشة "تسجيل الدخول" التي تفرض على المريض استخدام 
 *   حساب جوجل لضمان هوية الحاجز ومنع الحجوزات الوهمية.
 */
import React from 'react';
import { LoadingText } from '../../ui/LoadingText';


export const PublicBookingLoadingView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-slate-600 font-bold"><LoadingText>جاري التحميل</LoadingText></div>
    </div>
  );
};

export const PublicBookingInvalidLinkView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <p className="text-slate-700 font-bold">رابط غير صالح أو منتهي الصلاحية.</p>
      </div>
    </div>
  );
};

export const PublicBookingLoginRequiredView: React.FC<{ onLogin: () => void; loading?: boolean }> = ({ onLogin, loading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">تسجيل الدخول مطلوب</h2>
          <p className="text-slate-500 text-sm font-bold">يرجى تسجيل الدخول بحساب جوجل لتتمكن من حجز موعد في هذه العيادة.</p>
        </div>
        <button
          onClick={onLogin}
          disabled={loading}
          className="w-full py-4 px-6 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.35 11.1H12v2.9h5.33c-.23 1.47-1.77 4.3-5.33 4.3-3.2 0-5.8-2.64-5.8-5.9s2.6-5.9 5.8-5.9c1.82 0 3.04.77 3.74 1.44l2.55-2.46C16.96 3.6 14.72 2.5 12 2.5 7.58 2.5 4 6.08 4 10.5S7.58 18.5 12 18.5c4.62 0 7.68-3.25 7.68-7.83 0-.53-.06-.93-.13-1.57z" />
              </svg>
              <span>الدخول عبر Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

