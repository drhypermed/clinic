/** نافذة حث المستخدم على الدخول: تظهر عند محاولة الحجز بدون حساب؛ توفر زر الدخول عبر Google. */
import React from 'react';


interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
  authError: string;
  authInfo: string;
  authWorking: boolean;
  onGoogleLogin: () => void;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  open,
  onClose,
  authError,
  authInfo,
  authWorking,
  onGoogleLogin,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[63] bg-slate-950/65 backdrop-blur-[2px] p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md clinic-section p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-xl font-black text-slate-900">الحجز يتطلب تسجيل الدخول</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-black"
          >
            ×
          </button>
        </div>

        <p className="text-sm font-bold text-slate-600 mb-3">
          تسجيل الدخول متاح فقط عبر Google.
        </p>

        {authError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 mb-3">
            <p className="text-sm font-black text-red-700">{authError}</p>
          </div>
        )}

        {authInfo && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 mb-3">
            <p className="text-sm font-black text-emerald-700">{authInfo}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={authWorking}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-black disabled:opacity-60 flex items-center justify-center gap-3"
        >
          <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.4 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z" />
            <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-3 4.9-5.8 6.3l.1-.1 6.1 5.2C35.3 39.8 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          <span>{authWorking ? 'جارٍ التنفيذ' : 'تسجيل الدخول بجوجل'}</span>
        </button>
      </div>
    </div>
  );
};
