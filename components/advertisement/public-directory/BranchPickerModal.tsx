/**
 * مودال اختيار الفرع — يظهر لما المريض يضغط "احجز الآن" على طبيب عنده أكثر من فرع.
 * بيعرض أسماء الفروع وعناوينها، ولما يختار فرع بنروح للفورم العام مع تحديده مسبّقاً.
 * لو الطبيب فرع واحد، الكنترولر بياخد المريض على الفورم على طول من غير ما يفتح المودال.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LuMapPin } from 'react-icons/lu';
import type { DoctorAdBranch } from '../../../types';

interface BranchPickerModalProps {
  open: boolean;
  doctorName: string;
  branches: DoctorAdBranch[];
  onClose: () => void;
  // بيتنادى لما المريض يختار فرع — الكنترولر بيكمّل ويوجّه للفورم.
  onSelectBranch: (branchId: string) => void;
}

export const BranchPickerModal: React.FC<BranchPickerModalProps> = ({
  open,
  doctorName,
  branches,
  onClose,
  onSelectBranch,
}) => {
  // إغلاق بالـEscape — UX قياسي للمودالات
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9996] bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* الهيدر بنفس هويّة الفورم العام (تدرّج teal/cyan = هويّة دليل الأطباء) */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-white leading-tight">اختر الفرع للحجز</h2>
            {doctorName && (
              <p className="text-white/90 text-xs font-bold mt-0.5 truncate">{doctorName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-white/20 text-white font-black hover:bg-white/30 transition"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          <p className="text-slate-600 text-xs font-bold mb-2">
            الطبيب عنده أكتر من فرع، اختار اللي يناسبك.
          </p>

          {branches.map((branch) => {
            // العنوان المعروض = محافظة + مدينة + تفاصيل (إن وجدت)
            const addressParts = [branch.governorate, branch.city, branch.addressDetails].filter(Boolean);
            const addressText = addressParts.join(' - ') || 'بدون عنوان';
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => onSelectBranch(branch.id)}
                className="w-full flex items-start gap-3 p-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-400 transition text-right"
              >
                <div className="w-9 h-9 shrink-0 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                  <LuMapPin className="w-4 h-4" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-800 truncate">{branch.name || 'فرع'}</div>
                  <div className="text-[11px] text-slate-600 font-bold mt-0.5 truncate">{addressText}</div>
                </div>
                <span className="shrink-0 text-brand-500 font-black text-lg leading-none">›</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
