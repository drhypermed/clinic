/**
 * شاشة اختيار الفرع في فورم الحجز العام.
 * تظهر للمريض قبل شاشة المواعيد إذا كان الطبيب عنده أكثر من فرع نشط.
 *
 * المعلومات المعروضة لكل فرع: الاسم، العنوان، عدد المواعيد المتاحة الآن.
 * عرض العدد بيساعد المريض يقرر — لو فرع مفيهوش مواعيد متاحة دلوقتي،
 * المريض يشوف ده فوراً ومايضيّعش وقته يدخل عليه ويرجع.
 */
import React from 'react';
import { FaArrowRight, FaCircleCheck, FaLocationDot, FaTriangleExclamation } from 'react-icons/fa6';
import type { PublicBookingSlot, PublicBranchInfo } from '../../../types';
import { DEFAULT_BRANCH_ID } from '../../../services/firestore/branches';

type BranchSelectorScreenProps = {
  branches: PublicBranchInfo[];
  slots: PublicBookingSlot[]; // كل السلوتس المتاحة (قبل الفلترة بفرع) — عشان نعد المواعيد لكل فرع
  doctorName?: string;
  clinicTitle?: string;
  onBack?: () => void;
  onSelect: (branchId: string) => void;
};

export const BranchSelectorScreen: React.FC<BranchSelectorScreenProps> = ({
  branches,
  slots,
  doctorName,
  clinicTitle,
  onBack,
  onSelect,
}) => {
  // احسب عدد المواعيد المتاحة في كل فرع — لتعرض للمريض في الكارت
  // ملاحظة: مفيش فلترة لمواعيد المريض الحالي هنا (لأن الاختيار بيحصل قبل ما نعرف هو مين)،
  // فالعدد ده تقريبي للحالة العامة — مفيد عشان يرشد المريض للفرع اللي عنده مواعيد.
  const slotCountByBranch = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const slot of slots) {
      const key = slot.branchId || DEFAULT_BRANCH_ID;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [slots]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-100"
                title="العودة للصفحة السابقة"
              >
                <FaArrowRight className="w-4 h-4" aria-hidden="true" />
                عودة
              </button>
            ) : (
              <span className="w-20 shrink-0" aria-hidden="true" />
            )}
            <h1 className="min-w-0 flex-1 text-center text-xl font-black text-slate-900 sm:text-2xl">اختر الفرع للحجز</h1>
            <span className="w-20 shrink-0" aria-hidden="true" />
          </div>
          {(doctorName || clinicTitle) && (
            <p className="mt-1 text-center text-sm font-bold text-slate-500">
              {doctorName || clinicTitle}
            </p>
          )}
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm font-bold text-slate-600">
            الطبيب لديه أكثر من فرع. اختر الفرع المناسب لك قبل اختيار الموعد.
          </p>

          <div className="space-y-2">
            {branches.map((branch) => {
              // عدد المواعيد المتاحة في الفرع — لتقرير المريض
              const slotCount = slotCountByBranch[branch.id] || 0;
              const hasSlots = slotCount > 0;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => onSelect(branch.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg border p-4 text-right transition ${
                    hasSlots
                      ? 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-white'
                      : 'border-warning-200 bg-warning-50 hover:border-warning-300 hover:bg-warning-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-black text-slate-800">{branch.name}</div>
                    {branch.address && (
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-600">
                        <FaLocationDot className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span>{branch.address}</span>
                      </div>
                    )}
                    {/* مؤشر عدد المواعيد المتاحة — يساعد المريض يختار */}
                    <div className="mt-2">
                      {hasSlots ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          <FaCircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          {slotCount} موعد متاح
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                          <FaTriangleExclamation className="h-3.5 w-3.5" aria-hidden="true" />
                          لا توجد مواعيد متاحة حالياً
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-brand-500 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
