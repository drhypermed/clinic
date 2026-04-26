/**
 * بانل "حسابي" — يعرض اسم المستخدم ورقم تليفونه وبريده الإلكتروني،
 * ويسمح بتعديل الاسم والتليفون وحفظهم في users/{uid}.publicProfile.
 *
 * الاسم الافتراضي = displayName من جوجل أو الجزء قبل @ في الإيميل (الكنترولر بيدير ده).
 * الإيميل غير قابل للتعديل لأنه مرتبط بحساب جوجل.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LoadingText } from '../../ui/LoadingText';

interface AccountPanelModalProps {
  open: boolean;
  onClose: () => void;
  accountEmail: string;
  accountName: string;
  accountPhone: string;
  accountSaving: boolean;
  accountSaveError: string;
  isTemporaryPublicAccount: boolean;
  isPublicEmailVerified: boolean;
  onOpenGoogleLogin: () => void;
  onLogout: () => void;
  // بيرجع true لو الحفظ نجح — بنغلق البانل بعدها.
  onSaveProfile: (name: string, phone: string) => Promise<boolean>;
}

export const AccountPanelModal: React.FC<AccountPanelModalProps> = ({
  open,
  onClose,
  accountEmail,
  accountName,
  accountPhone,
  accountSaving,
  accountSaveError,
  isTemporaryPublicAccount,
  isPublicEmailVerified,
  onOpenGoogleLogin,
  onLogout,
  onSaveProfile,
}) => {
  // نُسَخ محلّيه قابلة للتعديل — بنزامنها مع props لمّا البانل يتفتح.
  const [name, setName] = useState(accountName);
  const [phone, setPhone] = useState(accountPhone);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (open) {
      setName(accountName);
      setPhone(accountPhone);
      setSavedFlash(false);
    }
  }, [open, accountName, accountPhone]);

  if (!open) return null;

  const dirty = name.trim() !== accountName.trim() || phone.trim() !== accountPhone.trim();
  const canSave = dirty && !accountSaving && !isTemporaryPublicAccount;

  const handleSave = async () => {
    if (!canSave) return;
    const ok = await onSaveProfile(name, phone);
    if (ok) {
      setSavedFlash(true);
      // بنخفي رسالة "تم الحفظ" بعد 1.5 ثانية بدون ما نقفل البانل (المستخدم
      // يقدر يكمّل تعديل أو يقفل بنفسه).
      setTimeout(() => setSavedFlash(false), 1500);
    }
  };

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

        {/* الاسم — قابل للتعديل */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك بالكامل"
            maxLength={60}
            disabled={accountSaving || isTemporaryPublicAccount}
            className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-400 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {/* رقم التليفون — قابل للتعديل (أرقام فقط) */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600">رقم التليفون</label>
          <input
            type="tel"
            value={phone}
            // أرقام إنجليزية فقط (نحوّل العربية تلقائياً) + علامات +/مسافة/شرطة
            onChange={(e) => {
              const v = e.target.value
                .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
                .replace(/[^\d+\s-]/g, '');
              setPhone(v);
            }}
            placeholder="01xxxxxxxxx"
            maxLength={20}
            dir="ltr"
            disabled={accountSaving || isTemporaryPublicAccount}
            className="w-full h-11 px-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-800 focus:outline-none focus:border-brand-400 disabled:bg-slate-50 disabled:text-slate-400 text-left"
          />
        </div>

        {/* الإيميل — للقراءة فقط (مرتبط بحساب جوجل) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500 font-black mb-1">البريد الإلكتروني</p>
          <p className="text-sm font-black text-slate-800 truncate" dir="ltr">{accountEmail || 'غير متاح'}</p>
        </div>

        {/* رسائل الحالة */}
        {accountSaveError && (
          <div className="rounded-xl border border-danger-200 bg-danger-50 p-2.5 text-xs font-bold text-danger-700">
            {accountSaveError}
          </div>
        )}
        {savedFlash && (
          <div className="rounded-xl border border-success-200 bg-success-50 p-2.5 text-xs font-bold text-success-700">
            تم حفظ بياناتك
          </div>
        )}

        {/* زر الحفظ — Disabled لو مفيش تغيير أو لو الحساب ضيف */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={`w-full h-11 rounded-xl font-black text-sm transition-all ${
            canSave
              ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:brightness-105 shadow'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {accountSaving ? <LoadingText>جاري الحفظ</LoadingText> : 'حفظ التعديلات'}
        </button>

        {/* حالة التحقق */}
        <div className={`rounded-2xl border p-3 ${
          isTemporaryPublicAccount
            ? 'border-warning-200 bg-warning-50'
            : isPublicEmailVerified
              ? 'border-success-200 bg-success-50'
              : 'border-warning-200 bg-warning-50'
        }`}>
          <p className={`text-sm font-black ${
            isTemporaryPublicAccount
              ? 'text-warning-800'
              : isPublicEmailVerified
                ? 'text-success-800'
                : 'text-warning-800'
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
            className="w-full h-10 rounded-xl border border-brand-300 bg-brand-50 text-brand-800 font-black"
          >
            تسجيل الدخول بجوجل
          </button>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="w-full h-11 rounded-xl bg-danger-600 text-white font-black hover:bg-danger-700"
        >
          تسجيل خروج
        </button>
      </div>
    </div>,
    document.body
  );
};
