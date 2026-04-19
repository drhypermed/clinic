/**
 * مكون طلب إذن الإشعارات (Notification Permission Prompt):
 * يظهر هذا المكون كشريط سفلي (Toast-like) ليطلب من المستخدم تفعيل الإشعارات.
 * الهدف: ضمان وصول تنبيهات المواعيد والدخول للطبيب والسكرتارية في الوقت الفعلي.
 */
import React from 'react';


interface NotificationPermissionPromptProps {
  open: boolean;
  title: string;
  description: string;
  enableLabel: string;
  onEnable: () => void;
  onLater: () => void;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  open,
  title,
  description,
  enableLabel,
  onEnable,
  onLater,
}) => {
  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10020] w-[min(94vw,33rem)]" dir="rtl">
      <div className="rounded-2xl border border-blue-200 bg-white shadow-[0_24px_50px_-28px_rgba(2,6,23,0.8)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-900 font-black text-sm sm:text-base">{title}</p>
            <p className="text-slate-600 font-bold text-xs sm:text-sm mt-1 leading-relaxed">{description}</p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onLater}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
              >
                لاحقًا
              </button>
              <button
                type="button"
                onClick={onEnable}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-black hover:bg-blue-700 transition-colors"
              >
                {enableLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

