/**
 * صفحة تسجيل دخول السكرتارية (Secretary Login Page):
 * تصميم فيسبوك-style: كارد أبيض بسيط، حقول واضحة، زر أخضر عريض.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { AuthLayout } from './AuthLayout';
import { BrandLogo } from '../common/BrandLogo';
import {
  getSecretaryLoginErrorMessage,
  secretaryLogin,
} from '../../services/secretaryLoginService';

const SECRETARY_LAST_SECRET_KEY = 'dh_secretary_last_secret';
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const inputBase =
  'w-full h-12 px-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-base font-semibold placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 hover:border-slate-400 transition';

const labelBase = 'block text-sm font-bold text-slate-900 mb-1.5';

export const SecretaryLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctorEmail, setDoctorEmail] = useState('');
  const [secretaryPassword, setSecretaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSecretaryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = doctorEmail.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      setError('يرجى إدخال بريد إلكتروني صحيح للطبيب');
      return;
    }

    if (!secretaryPassword.trim()) {
      setError('يرجى إدخال الرقم السري');
      return;
    }

    setLoading(true);
    try {
      const data = await secretaryLogin({
        doctorEmail: normalizedEmail,
        secretaryPassword,
      });

      localStorage.setItem(`sec_auth_${data.secret}`, data.sessionToken);
      if (data.userId) {
        localStorage.setItem(`sec_auth_uid_${data.userId}`, data.sessionToken);
      }
      // حفظ الفرع المربوط بـ session السكرتارية
      localStorage.setItem(`sec_branch_${data.secret}`, data.branchId);
      localStorage.setItem(SECRETARY_LAST_SECRET_KEY, data.secret);
      navigate(`/book/s/${data.secret}`, { replace: true });
    } catch (err: unknown) {
      setError(getSecretaryLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md" dir="rtl">
        <div className="flex flex-col items-center mb-2 lg:mb-5">
          <BrandLogo className="w-36 h-36 lg:w-48 lg:h-48" size={192} fetchPriority="high" />
        </div>

        <div className="relative bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.15)] ring-1 ring-slate-200/60 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-600 to-teal-500" />
          <div className="px-6 pt-6 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">دخول السكرتارية</h2>
            <p className="text-sm text-slate-600 font-semibold mt-1">سجّل بإيميل الطبيب والرقم السرّي.</p>
          </div>

          <form onSubmit={handleSecretaryLogin} className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-md">
                <div className="flex items-start gap-2">
                  <FaTriangleExclamation className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                  <p className="text-rose-800 text-sm font-semibold leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="doctorEmail" className={labelBase}>
                إيميل الطبيب
              </label>
              <input
                id="doctorEmail"
                type="email"
                value={doctorEmail}
                onChange={(e) => {
                  setDoctorEmail(e.target.value);
                  setError('');
                }}
                className={`${inputBase} text-left`}
                placeholder="doctor@mail.com"
                dir="ltr"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="secretaryPassword" className={labelBase}>
                الرقم السري للسكرتارية
              </label>
              <input
                id="secretaryPassword"
                type="password"
                value={secretaryPassword}
                onChange={(e) => {
                  setSecretaryPassword(e.target.value);
                  setError('');
                }}
                className={`${inputBase} text-left`}
                placeholder="••••••••"
                dir="ltr"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-base rounded-lg shadow-[0_1px_2px_rgba(15,23,42,0.1),0_4px_12px_-4px_rgba(5,150,105,0.45)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جارٍ تسجيل الدخول</span>
                </>
              ) : (
                <span>دخول السكرتارية</span>
              )}
            </button>

            <div className="pt-3 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => navigate('/', { replace: true })}
                disabled={loading}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                ← العودة للرئيسية
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};
