/** شريط الإجراءات: يحتوي على أزرار "حفظ كمسودة" و "نشر الإعلان"؛ مثبت في أسفل الشاشة لسهولة الوصول. */
import React from 'react';

import type { DoctorAdActionsBarProps } from './types';

export const DoctorAdActionsBar: React.FC<DoctorAdActionsBarProps> = ({
  saving,
  isPublished,
  onSaveDraft,
  onPublish,
}) => {
  return (
    <div className="sticky bottom-4 z-20">
      <div className="bg-white/80 backdrop-blur-sm border border-slate-100 shadow-lg rounded-2xl p-3 flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={onSaveDraft}
          className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs disabled:opacity-60 hover:bg-slate-200 transition-colors"
        >
          حفظ كمسودة
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onPublish}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isPublished ? 'تحديث' : 'نشر'}
        </button>
      </div>
    </div>
  );
};
