import React from 'react';
import { createPortal } from 'react-dom';

interface CropperModalFrameProps {
  title: string;
  subtitle: string;
  cropperContent: React.ReactNode;
  controlsContent: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
}

export const CropperModalFrame: React.FC<CropperModalFrameProps> = ({
  title,
  subtitle,
  cropperContent,
  controlsContent,
  onSave,
  onCancel,
}) => {
  return createPortal(
    <div className="fixed inset-0 z-[9995] flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {cropperContent}
        <div className="p-6 space-y-4">
          {controlsContent}
          <div className="flex gap-3">
            <button onClick={onSave} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition">
              💾 حفظ التصميم
            </button>
            <button onClick={onCancel} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

