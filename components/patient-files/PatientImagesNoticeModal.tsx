import React from 'react';

interface PatientImagesNoticeModalProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  tone?: 'pro' | 'limit' | 'error';
}

export const PatientImagesNoticeModal: React.FC<PatientImagesNoticeModalProps> = ({
  open,
  title,
  message,
  onClose,
  tone = 'pro',
}) => {
  const titleId = React.useId();
  if (!open) return null;
  const colors = tone === 'limit'
    ? 'from-amber-500 to-orange-500'
    : tone === 'error'
      ? 'from-rose-500 to-red-600'
      : 'from-violet-600 to-indigo-700';

  return (
    <div className="fixed inset-0 z-[11000] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" dir="rtl" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-[1.75rem] bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[1.75rem] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors} text-white shadow-lg`}>
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.5M3 16.5l4.6-4.6a2 2 0 0 1 2.8 0l2.1 2.1 1.1-1.1a2 2 0 0 1 2.8 0l4.6 4.6M8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /></svg>
        </div>
        <h3 id={titleId} className="text-lg font-black text-slate-900">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{message}</p>
        <button type="button" onClick={onClose} className={`mt-5 w-full rounded-2xl bg-gradient-to-r ${colors} px-4 py-3 text-sm font-black text-white shadow-md transition active:scale-[0.98]`}>
          حسناً، فهمت
        </button>
      </div>
    </div>
  );
};
