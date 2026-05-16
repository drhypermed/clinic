/**
 * شاشة اختيار الفرع في فورم الحجز العام.
 * تظهر للمريض قبل شاشة المواعيد إذا كان الطبيب عنده أكثر من فرع نشط.
 *
 * المعلومات المعروضة لكل فرع: الاسم، العنوان، عدد المواعيد المتاحة الآن.
 * عرض العدد بيساعد المريض يقرر — لو فرع مفيهوش مواعيد متاحة دلوقتي،
 * المريض يشوف ده فوراً ومايضيّعش وقته يدخل عليه ويرجع.
 */
import React from 'react';
import type { PublicBookingSlot, PublicBranchInfo } from '../../../types';
import { DEFAULT_BRANCH_ID } from '../../../services/firestore/branches';

type BranchSelectorScreenProps = {
  branches: PublicBranchInfo[];
  slots: PublicBookingSlot[]; // كل السلوتس المتاحة (قبل الفلترة بفرع) — عشان نعد المواعيد لكل فرع
  doctorName?: string;
  clinicTitle?: string;
  onSelect: (branchId: string) => void;
};

export const BranchSelectorScreen: React.FC<BranchSelectorScreenProps> = ({
  branches,
  slots,
  doctorName,
  clinicTitle,
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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5">
          <h1 className="text-xl sm:text-2xl font-black text-white">اختر الفرع للحجز</h1>
          {(doctorName || clinicTitle) && (
            <p className="text-white/90 text-sm font-bold mt-1">
              {doctorName || clinicTitle}
            </p>
          )}
        </div>

        <div className="p-5 space-y-3">
          <p className="text-slate-600 text-sm font-bold">
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
                  className={`w-full flex items-start justify-between gap-3 p-4 rounded-xl border-2 transition text-right ${
                    hasSlots
                      ? 'border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-400'
                      : 'border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-black text-slate-800">{branch.name}</div>
                    {branch.address && (
                      <div className="text-sm text-slate-600 font-bold mt-1">
                        📍 {branch.address}
                      </div>
                    )}
                    {/* مؤشر عدد المواعيد المتاحة — يساعد المريض يختار */}
                    <div className="mt-2">
                      {hasSlots ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          ✅ {slotCount} موعد متاح
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                          ⚠️ لا توجد مواعيد متاحة حالياً
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
