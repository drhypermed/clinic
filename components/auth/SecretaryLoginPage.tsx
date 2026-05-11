/**
 * صفحة تسجيل دخول السكرتارية (Secretary Login Page):
 * تصميم فيسبوك-style: كارد أبيض بسيط، حقول واضحة، زر أزرق عريض.
 * الألوان موحّده مع باقي صفحات الدخول (أزرق) بدلاً من الأخضر القديم.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { AuthLayout } from './AuthLayout';
import { BrandLogo } from '../common/BrandLogo';
import {
  getSecretaryLoginErrorMessage,
  getAmbiguousBranchesFromError,
  secretaryLogin,
  type AmbiguousBranchOption,
} from '../../services/secretaryLoginService';

const SECRETARY_LAST_SECRET_KEY = 'dh_secretary_last_secret';
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const inputBase =
  'w-full h-12 px-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-base font-semibold placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 hover:border-slate-400 transition';

const labelBase = 'block text-sm font-bold text-slate-900 mb-1.5';

export const SecretaryLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [doctorEmail, setDoctorEmail] = useState('');
  const [secretaryPassword, setSecretaryPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // قائمة الفروع المطابقة لما كلمة السر متكررة بين فرعين أو أكثر.
  // null = حالة عادية. array غير فاضي = نعرض اختيار فرع بدل الفورم.
  const [ambiguousBranches, setAmbiguousBranches] = useState<AmbiguousBranchOption[] | null>(null);

  // دالة موحّدة للـlogin — تُستدعى من submit العادي ومن اختيار الفرع.
  // preferredBranchId يُمرَّر بس لما السكرتارية تختار من قائمة الـambiguous.
  const performLogin = async (preferredBranchId?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await secretaryLogin({
        doctorEmail: doctorEmail.trim().toLowerCase(),
        secretaryPassword,
        preferredBranchId,
      });

      localStorage.setItem(`sec_auth_${data.secret}`, data.sessionToken);
      if (data.userId) {
        localStorage.setItem(`sec_auth_uid_${data.userId}`, data.sessionToken);
      }
      localStorage.setItem(`sec_branch_${data.secret}`, data.branchId);
      localStorage.setItem(SECRETARY_LAST_SECRET_KEY, data.secret);
      navigate(`/book/s/${data.secret}`, { replace: true });
    } catch (err: unknown) {
      // فحص أولاً: هل ده ambiguous-password (كلمة سر متكررة بين فروع)؟
      const branches = getAmbiguousBranchesFromError(err);
      if (branches && branches.length > 0) {
        setAmbiguousBranches(branches);
        setError('');
      } else {
        setAmbiguousBranches(null);
        setError(getSecretaryLoginErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

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

    await performLogin();
  };

  // لما السكرتارية تختار فرع من قائمة الـambiguous → نعيد الـlogin بالفرع المحدد.
  const handleBranchPick = async (branchId: string) => {
    setAmbiguousBranches(null);
    await performLogin(branchId);
  };

  // لو السكرتارية ضغطت "رجوع" من شاشة اختيار الفرع.
  const handleBackFromBranchPicker = () => {
    setAmbiguousBranches(null);
    setError('');
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md" dir="rtl">
        <div className="flex flex-col items-center mb-2 lg:mb-5">
          <BrandLogo className="w-36 h-36 lg:w-48 lg:h-48" size={192} fetchPriority="high" />
        </div>

        <div className="relative bg-white rounded-2xl shadow-card ring-1 ring-slate-200/60 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-brand-700 to-brand-500" />
          <div className="px-6 pt-6 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {ambiguousBranches ? 'اختيار الفرع' : 'دخول السكرتارية'}
            </h2>
            <p className="text-sm text-slate-600 font-semibold mt-1">
              {ambiguousBranches
                ? 'كلمة السر متطابقة لأكتر من فرع. اضغط على الفرع الصحيح.'
                : 'سجّل بإيميل الطبيب والرقم السرّي.'}
            </p>
          </div>

          {ambiguousBranches ? (
            <div className="px-6 py-5 space-y-3">
              {ambiguousBranches.map((branch) => (
                <button
                  key={branch.branchId}
                  type="button"
                  onClick={() => handleBranchPick(branch.branchId)}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white border-2 border-slate-300 hover:border-brand-600 hover:bg-brand-50 text-slate-900 font-bold text-base rounded-lg shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed text-right active:scale-[0.99]"
                >
                  {branch.branchName}
                </button>
              ))}

              <div className="pt-3 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={handleBackFromBranchPicker}
                  disabled={loading}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  ← رجوع لتسجيل الدخول
                </button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSecretaryLogin} className="px-6 py-5 space-y-4">
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-300 rounded-md">
                <div className="flex items-start gap-2">
                  <FaTriangleExclamation className="w-5 h-5 flex-shrink-0 text-danger-600 mt-0.5" />
                  <p className="text-danger-800 text-sm font-semibold leading-relaxed">{error}</p>
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
              className="w-full py-3 px-4 bg-gradient-to-b from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-black text-base rounded-lg shadow-cta transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
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
          )}
        </div>
      </div>
    </AuthLayout>
  );
};
