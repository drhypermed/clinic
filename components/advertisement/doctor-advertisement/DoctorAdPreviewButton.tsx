import React from 'react';
import { LuEye } from 'react-icons/lu';

interface DoctorAdPreviewButtonProps {
  onClick: () => void;
}

export const DoctorAdPreviewButton: React.FC<DoctorAdPreviewButtonProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-lg bg-[linear-gradient(135deg,#0891b2,#059669)] p-4 text-lg font-black text-white shadow-[0_20px_42px_-26px_rgba(5,150,105,0.95)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(8,145,178,0.95)]"
  >
    <span className="flex items-center justify-center gap-3">
      <LuEye className="h-6 w-6" aria-hidden="true" />
      معاينة كما يراها الجمهور
    </span>
  </button>
);
