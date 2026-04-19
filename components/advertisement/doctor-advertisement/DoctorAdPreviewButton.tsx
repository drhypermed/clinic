/** زر المعاينة: يفتح نافذة منبثقة تظهر للطبيب كيف سيبدو إعلانه للجمهور النهائي قبل النشر. */
import React from 'react';


interface DoctorAdPreviewButtonProps {
  onClick: () => void;
}

export const DoctorAdPreviewButton: React.FC<DoctorAdPreviewButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 font-black text-lg"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      👁️ معاينة كما يراها الجمهور
    </button>
  );
};
