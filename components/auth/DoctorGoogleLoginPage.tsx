/**
 * صفحة تسجيل دخول الطبيب عبر جوجل (Doctor Google Login Page):
 * تصميم فيسبوك-style: كارد أبيض بسيط، زر أزرق عريض للدخول عبر Google.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaTriangleExclamation, FaUserPlus } from 'react-icons/fa6';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from './AuthLayout';
import { BrandLogo } from '../common/BrandLogo';
import { LegalConsentGate } from './legal/LegalConsentGate';
import { clearAuthFlowGuardSoon, setAuthFlowGuard } from './authFlowGuard';
import { useHideBootSplash } from '../../hooks/useHideBootSplash';

const LOGIN_DOCTOR_PATH = '/login/doctor';

export const DoctorGoogleLoginPage: React.FC = () => {
  useHideBootSplash('doctor-login-mounted');
  const navigate = useNavigate();
  const { loading, error, clearError, signInGoogle } = useAuth();

  const [loginError, setLoginError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isLegalReady, setIsLegalReady] = useState(false);

  const ERROR_KEYS = [
    'blacklist_message',
    'blacklist_error',
    'public_role_error',
    'duplicate_account_error',
    'not_found_error',
    'rejection_error',
  ];

  useEffect(() => {
    const readStoredErrors = () => {
      let firstError = '';
      for (const key of ERROR_KEYS) {
        const value = localStorage.getItem(key);
        if (value && !firstError) firstError = value;
        localStorage.removeItem(key);
      }
      if (firstError) setLoginError(firstError);
    };
    readStoredErrors();

    const syncError = () => readStoredErrors();
    window.addEventListener('storage', syncError);
    return () => window.removeEventListener('storage', syncError);
  }, []);

  const handleGoogleLogin = async () => {
    setLoginError('');
    clearError();
    localStorage.removeItem('blacklist_message');

    if (!isLegalReady) {
      setLoginError('يلزم الموافقة على شروط وسياسة خصوصية الأطباء قبل تسجيل الدخول.');
      return;
    }

    setAuthFlowGuard(LOGIN_DOCTOR_PATH);
    setIsChecking(true);

    try {
      await signInGoogle('doctor');
      clearAuthFlowGuardSoon(LOGIN_DOCTOR_PATH);
    } catch (err: any) {
      setLoginError(err?.message || 'فشل تسجيل الدخول عبر Google');
      clearAuthFlowGuardSoon(LOGIN_DOCTOR_PATH);
    } finally {
      setIsChecking(false);
    }
  };

  const mergedError = loginError || error;

  return (
    <AuthLayout>
      <div className="w-full max-w-md" dir="rtl">
        <div className="flex flex-col items-center mb-2 lg:mb-5">
          <BrandLogo className="w-36 h-36 lg:w-48 lg:h-48" size={192} fetchPriority="high" />
        </div>

        <div className="relative bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.15)] ring-1 ring-slate-200/60 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-700 to-blue-500" />
          <div className="px-6 pt-6 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">تسجيل دخول الطبيب</h2>
            <p className="text-sm text-slate-600 font-semibold mt-1">سجّل الدخول بحسابك في Google للمتابعة.</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {mergedError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-md">
                <div className="flex items-start gap-2">
                  <FaTriangleExclamation className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                  <div className="text-rose-800 text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                    {mergedError}
                  </div>
                </div>
              </div>
            )}

            {mergedError?.includes('لم يتم العثور على حساب') && (
              <button
                type="button"
                onClick={() => navigate('/signup/doctor', { replace: true })}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-md transition"
              >
                <FaUserPlus className="w-5 h-5" />
                الذهاب لإنشاء حساب جديد
              </button>
            )}

            {mergedError?.includes('حساب جمهور') && (
              <button
                type="button"
                onClick={() => navigate('/login/public', { replace: true })}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-md transition"
              >
                الذهاب لتسجيل دخول الجمهور
              </button>
            )}

            <LegalConsentGate
              audience="doctor"
              onValidityChange={(ready) => {
                setIsLegalReady(ready);
              }}
            />

            <button
              type="button"
              onClick={() => {
                clearError();
                void handleGoogleLogin();
              }}
              disabled={loading || isChecking || !isLegalReady}
              className="w-full py-3 px-4 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-base rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.1),0_4px_12px_-4px_rgba(37,99,235,0.45)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {loading || isChecking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جارٍ تسجيل الدخول</span>
                </>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <FcGoogle className="w-4 h-4" />
                  </span>
                  <span>تسجيل دخول بـ Google</span>
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-200 text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate('/signup/doctor', { replace: true })}
                className="text-sm font-bold text-blue-700 hover:underline"
              >
                ليس لديك حساب؟ إنشاء حساب جديد
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/', { replace: true })}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  ← العودة للخلف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
