/**
 * شاشة حجب موقع الجمهور (Public Site Blocked Screen)
 * ───────────────────────────────────────────────────────────────────
 * بتظهر بدل PatientLandingPage لما الأدمن يقفل الموقع من اللوحة.
 * بسيطة جداً: شعار + عنوان + رسالة من الأدمن.
 *
 * 🆕 (2026-05) لو فيه إيميلات مسموحة في القائمة، بنعرض زرار "تسجيل الدخول" عشان
 * أصحاب الإيميلات اللي ضافهم الأدمن يقدروا يدخلوا (بعد الدخول، الفحص بيمشي
 * مرة تانية وبيشوفوا الموقع لو إيميلهم متطابق).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BrandLogo } from '../common/BrandLogo';
import type { PublicSiteControl } from '../../services/firestore/publicSiteControl';

interface PublicSiteBlockedScreenProps {
  settings: PublicSiteControl;
}

/**
 * يدعم سطور جديدة (\n) + bold بسيط (**نص**) عشان الأدمن يقدر يكتب رسالة
 * منسّقة من غير ما نخلي الـtextarea تقبل HTML خام (XSS protection).
 */
const renderMessage = (raw: string): React.ReactNode => {
  // تنظيف أي HTML tags خام (defensive — التكسانس بيدخل بـtext فقط)
  const sanitized = raw.replace(/<[^>]*>/g, '');
  return sanitized.split('\n').map((line, lineIdx) => {
    // bold: **نص** → <strong>نص</strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={lineIdx} className="text-base sm:text-lg leading-9 text-slate-700 font-bold">
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partIdx} className="font-black text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <React.Fragment key={partIdx}>{part}</React.Fragment>;
        })}
      </p>
    );
  });
};

export const PublicSiteBlockedScreen: React.FC<PublicSiteBlockedScreenProps> = ({ settings }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // نعرض زر الدخول لو فيه إيميلات مسموحة + المستخدم مش مسجّل دخول حالياً.
  // لو المستخدم مسجّل وإيميله مش في القائمة، الزر مش هيفيد — بنعرض رسالة بدلاً منه.
  const hasAllowlist = settings.allowedEmails.length > 0;
  const isSignedInButNotAllowed = Boolean(user?.email) && hasAllowlist;

  const handleLogin = () => {
    navigate('/login/public');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-8"
    >
      <div className="w-full max-w-2xl rounded-3xl border border-brand-200 bg-white/90 backdrop-blur-sm shadow-[0_20px_60px_-30px_rgba(2,6,23,0.4)] px-6 py-10 sm:px-10 sm:py-12 text-center">
        {settings.showLogo && (
          <div className="flex justify-center mb-6">
            <BrandLogo className="w-32 h-32 sm:w-40 sm:h-40" size={160} glow />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-snug">
          {settings.blockTitle}
        </h1>

        <div className="space-y-3 mb-2">
          {renderMessage(settings.blockMessage)}
        </div>

        {/* زر الدخول للمستخدمين المسموحين — يظهر لو فيه إيميلات في القائمة
            والمستخدم مش مسجّل دخول. */}
        {hasAllowlist && !user?.email && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm font-bold text-slate-600 mb-3">
              لو إيميلك ضمن المدعوّين، سجّل دخول للمتابعة:
            </p>
            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-success-600 hover:from-brand-700 hover:to-success-700 text-white font-black px-6 py-3 text-sm shadow-md transition"
            >
              تسجيل الدخول
            </button>
          </div>
        )}

        {/* المستخدم مسجّل دخول لكن إيميله مش في القائمة */}
        {isSignedInButNotAllowed && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500" dir="ltr">
              {user?.email}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              هذا الحساب غير مسموح له بالدخول حالياً.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
