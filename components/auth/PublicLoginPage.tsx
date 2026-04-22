/**
 * صفحة دخول الجمهور (Public Login Page):
 * تصميم فيسبوك-style: كارد أبيض بسيط، زر أزرق عريض للدخول عبر Google.
 * الألوان موحّده مع صفحة دخول الطبيب (أزرق) بدلاً من الأخضر القديم.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/firebaseConfig';
import { AuthLayout } from './AuthLayout';
import { BrandLogo } from '../common/BrandLogo';
import { PUBLIC_AUTH_ERROR_KEY } from '../../services/auth-service';
import { LegalConsentGate } from './legal/LegalConsentGate';
import { clearAuthFlowGuardSoon, setAuthFlowGuard } from './authFlowGuard';

const LOGIN_PUBLIC_PATH = '/login/public';

export const PublicLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInGoogle, loading, error } = useAuth();
  const waitForAuthToSettle = async (maxMs = 4000) => {
    const startedAt = Date.now();
    while (auth.currentUser && Date.now() - startedAt < maxMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };
  const [localError, setLocalError] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(PUBLIC_AUTH_ERROR_KEY) || '';
  });
  const [isLegalReady, setIsLegalReady] = useState(false);

  useEffect(() => {
    const syncError = () => {
      const stored = typeof window !== 'undefined' ? (localStorage.getItem(PUBLIC_AUTH_ERROR_KEY) || '') : '';
      if (stored) setLocalError(stored);
    };
    syncError();
    window.addEventListener('storage', syncError);
    return () => window.removeEventListener('storage', syncError);
  }, []);

  const clearPublicAuthError = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PUBLIC_AUTH_ERROR_KEY);
    }
    setLocalError('');
  };

  const handleGoogleLogin = async () => {
    clearPublicAuthError();

    if (!isLegalReady) {
      const message = 'يلزم الموافقة على شروط وسياسة خصوصية الجمهور قبل تسجيل الدخول.';
      setLocalError(message);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PUBLIC_AUTH_ERROR_KEY, message);
      }
      return;
    }

    setAuthFlowGuard(LOGIN_PUBLIC_PATH);
    try {
      await signInGoogle('public');
      clearAuthFlowGuardSoon(LOGIN_PUBLIC_PATH);
      navigate('/public', { replace: true });
    } catch (err: any) {
      try {
        await auth.signOut();
      } catch {
        // Best effort.
      }
      await waitForAuthToSettle();
      const msg = err.message || 'فشل تسجيل الدخول عبر Google';
      setLocalError(msg);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PUBLIC_AUTH_ERROR_KEY, msg);
      }
      clearAuthFlowGuardSoon(LOGIN_PUBLIC_PATH, 500);
    }
  };

  const mergedError = localError || error;

  return (
    <AuthLayout>
      <div className="w-full max-w-md" dir="rtl">
        <div className="flex flex-col items-center mb-2 lg:mb-5">
          <BrandLogo className="w-36 h-36 lg:w-48 lg:h-48" size={192} fetchPriority="high" />
        </div>

        <div className="relative bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.15)] ring-1 ring-slate-200/60 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-700 to-blue-500" />
          <div className="px-6 pt-6 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">دخول الجمهور</h2>
            <p className="text-sm text-slate-600 font-semibold mt-1">للاطلاع على دليل الأطباء وحجز المواعيد.</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <LegalConsentGate
              audience="public"
              onValidityChange={(ready) => {
                setIsLegalReady(ready);
              }}
            />

            <button
              onClick={handleGoogleLogin}
              disabled={loading || !isLegalReady}
              className="w-full py-3 px-4 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-base rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.1),0_4px_12px_-4px_rgba(37,99,235,0.45)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الدخول</span>
                </>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <FcGoogle className="w-4 h-4" />
                  </span>
                  <span>دخول عبر Google</span>
                </>
              )}
            </button>

            {mergedError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-md space-y-3">
                <div className="flex items-start gap-2">
                  <FaTriangleExclamation className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                  <p className="text-rose-800 text-sm font-semibold whitespace-pre-wrap leading-relaxed">{mergedError}</p>
                </div>

                {mergedError.includes('مسجل كطبيب') && (
                  <button
                    type="button"
                    onClick={() => {
                      clearPublicAuthError();
                      navigate('/login/doctor', { replace: true });
                    }}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-md transition"
                  >
                    الانتقال إلى تسجيل دخول الأطباء
                  </button>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 text-center">
              <button
                onClick={() => {
                  clearPublicAuthError();
                  navigate('/', { replace: true });
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                ← العودة للخلف
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
