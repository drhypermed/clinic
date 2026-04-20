import React from 'react';
import { createPortal } from 'react-dom';
import { FaXmark, FaFileLines } from 'react-icons/fa6';
import type { LegalDocumentDefinition } from '../../../app/legal/types';

interface LegalDocumentModalProps {
  isOpen: boolean;
  activeDocument: LegalDocumentDefinition | null;
  onClose: () => void;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  isOpen,
  activeDocument,
  onClose,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !activeDocument) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] bg-slate-900/30 backdrop-blur-md flex items-start sm:items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl ring-1 ring-slate-200/60 bg-white/85 backdrop-blur-xl text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_30px_80px_-20px_rgba(15,23,42,0.35)]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-700 via-blue-500 to-emerald-500" />

        <div className="border-b border-slate-200 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-[0_1px_2px_rgba(15,23,42,0.1),0_4px_12px_-4px_rgba(37,99,235,0.45)]">
              <FaFileLines className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
                {activeDocument.title}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                الإصدار: {activeDocument.version} • تاريخ السريان: {activeDocument.effectiveDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="shrink-0 w-9 h-9 rounded-full ring-1 ring-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition flex items-center justify-center"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-110px)] px-5 sm:px-7 py-5 space-y-4 bg-slate-50/40">
          <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-800">
            {activeDocument.intro}
          </p>

          {activeDocument.sections.map((section) => (
            <section
              key={section.heading}
              className="rounded-xl ring-1 ring-slate-200/70 bg-white/85 backdrop-blur-sm shadow-[0_1px_2px_rgba(15,23,42,0.03)] p-4 sm:p-5"
            >
              <h4 className="text-base sm:text-lg font-black text-blue-700 mb-3">
                {section.heading}
              </h4>
              <ul className="space-y-2 text-sm sm:text-[15px] leading-relaxed text-slate-800">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 flex-shrink-0" />
                    <span className="font-semibold">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
