/**
 * الملف: PublicBookingLoginScreen.tsx
 * الوصف: "بوابة الدخول الآمنة" للسكرتارية. 
 * بما أن بيانات المرضى والمواعيد حساسة، يتم حماية واجهة السكرتاريا بشاشة دخول: 
 * - تطلب إيميل الطبيب (لتعريف العيادة) وكلمة السر (للتأكد من الهوية). 
 * - تتميز بتصميم بسيط يركز على حقول الإدخال مع أيقونات أمان. 
 * - توفر تغذية راجعة فورية في حال كان الخطأ في كلمة السر أو الإيميل.
 */
import React from 'react';

/**
 * الخصائص الخاصة بشاشة تسجيل دخول السكرتارية
 * تتطلب إيميل الطبيب وكلمة السر المخصصة للسكرتارية
 */
type PublicBookingLoginScreenProps = {
  doctorEmailInput: string;
  onDoctorEmailInputChange: (value: string) => void;
  passwordInput: string;
  authError: string;
  onPasswordInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

/**
 * مكون "شاشة تسجيل الدخول" (PublicBookingLoginScreen)
 * واجهة بسيطة وآمنة تظهر للسكرتارية قبل السماح لهم بالوصول لبيانات المواعيد
 */
export const PublicBookingLoginScreen: React.FC<PublicBookingLoginScreenProps> = ({
  doctorEmailInput,
  onDoctorEmailInputChange,
  passwordInput,
  authError,
  onPasswordInputChange,
  onSubmit,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-100">
        <div className="text-center mb-6">
          {/* أيقونة القفل للدلالة على الأمان */}
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">الدخول محمي بكلمة مرور</h2>
          <p className="text-slate-500 text-sm mt-2">يرجى إدخال إيميل الطبيب وكلمة المرور المعينة من قبله للمتابعة.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            {/* حقل إدخال إيميل الطبيب (نظام التعريف الأساسي) */}
            <input
              type="email"
              value={doctorEmailInput}
              onChange={(e) => onDoctorEmailInputChange(e.target.value)}
              placeholder="إيميل الطبيب"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-center text-lg placeholder:tracking-normal font-sans mb-4"
              dir="ltr"
              autoFocus
            />
          </div>
          <div>
            {/* حقل إدخال كلمة المرور السرية للسكرتارية */}
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => onPasswordInputChange(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-center text-lg tracking-widest placeholder:tracking-normal font-sans"
              dir="ltr"
            />
          </div>
          {/* عرض رسالة خطأ في حال كانت البيانات غير صحيحة */}
          {authError && (
            <p className="text-danger-500 text-sm font-bold text-center bg-danger-50 py-2 rounded-lg border border-danger-100">
              {authError}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md"
          >
            دخول
          </button>
          <div className="pt-4 mt-2 border-t border-slate-50 text-center" />
        </form>
      </div>
    </div>
  );
};

