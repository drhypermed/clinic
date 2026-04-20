/** لوحة الحساب الشخصي: تظهر بيانات البريد الإلكتروني للمستخدم العام وإدارة تسجيل الخروج. */
import React from 'react';
import { createPortal } from 'react-dom';


interface AccountPanelModalProps {
  open: boolean;
  onClose: () => void;
  accountEmail: string;
  isTemporaryPublicAccount: boolean;
  isPublicEmailVerified: boolean;
  onOpenGoogleLogin: () => void;
  onLogout: () => void;
}

export const AccountPanelModal: React.FC<AccountPanelModalProps> = ({
  open,
  onClose,
  accountEmail,
  isTemporaryPublicAccount,
  isPublicEmailVerified,
  onOpenGoogleLogin,
  onLogout,
}) => {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] bg-slate-950/60 backdrop-blur-[2px] p-3 sm:p-4 flex items-start sm:items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm clinic-section p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h3 className="text-xl font-black text-slate-900">حسابي</h3>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500 font-black mb-1">البريد الإلكتروني</p>
          <p className="text-sm font-black text-slate-800" dir="ltr">{accountEmail || 'غير متاح'}</p>
        </div>

        <div className={`rounded-2xl border p-3 ${
          isTemporaryPublicAccount
            ? 'border-amber-200 bg-amber-50'
            : isPublicEmailVerified
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-orange-200 bg-orange-50'
        }`}>
          <p className={`text-sm font-black ${
            isTemporaryPublicAccount
              ? 'text-amber-800'
              : isPublicEmailVerified
                ? 'text-emerald-800'
                : 'text-orange-800'
          }`}>
            {isTemporaryPublicAccount
              ? 'يرجى تسجيل الدخول بجوجل لإكمال الحجز.'
              : isPublicEmailVerified
                ? 'الحساب موثق ويمكنك الحجز مباشرة.'
                : 'يرجى تسجيل الدخول بجوجل بحساب بريد موثق.'}
          </p>
        </div>

        {(isTemporaryPublicAccount || !isPublicEmailVerified) && (
          <button
            type="button"
            onClick={onOpenGoogleLogin}
            className="w-full h-10 rounded-xl border border-cyan-300 bg-cyan-50 text-cyan-800 font-black"
          >
            تسجيل الدخول بجوجل
          </button>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="w-full h-11 rounded-xl bg-red-600 text-white font-black hover:bg-red-700"
        >
          تسجيل خروج
        </button>
      </div>
    </div>,
    document.body
  );
};
