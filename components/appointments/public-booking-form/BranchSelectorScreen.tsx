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
import { PublicDoctorAvatar } from './PublicDoctorAvatar';

type BranchSelectorScreenProps = {
  branches: PublicBranchInfo[];
  slots: PublicBookingSlot[]; // كل السلوتس المتاحة (قبل الفلترة بفرع) — عشان نعد المواعيد لكل فرع
  doctorName?: string;
  doctorProfileImage?: string;
  clinicTitle?: string;
  onBack?: () => void;
  onSelect: (branchId: string) => void;
};

export const BranchSelectorScreen: React.FC<BranchSelectorScreenProps> = ({
  branches,
  slots,
  doctorName,
  doctorProfileImage,
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
        {/* ─── Hero header ─── */}
        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-l from-emerald-700 via-sky-700 to-brand-700 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 text-sm font-black text-white backdrop-blur-sm transition-all hover:bg-white/20"
                title="العودة للصفحة السابقة"
              >
                <FaArrowRight className="w-4 h-4" aria-hidden="true" />
                عودة
              </button>
            ) : (
              <span className="w-20 shrink-0" aria-hidden="true" />
            )}
            <h1 className="min-w-0 flex-1 text-center text-lg font-black text-white sm:text-xl">اختر الفرع للحجز</h1>
            <span className="w-20 shrink-0" aria-hidden="true" />
          </div>
          {(doctorName || clinicTitle) && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <PublicDoctorAvatar imageUrl={doctorProfileImage} name={doctorName || clinicTitle} size="md" />
              <p className="min-w-0 truncate text-sm font-bold text-white/80">
                {doctorName || clinicTitle}
              </p>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm font-bold text-slate-500">
            الطبيب لديه أكثر من فرع. اختر الفرع المناسب لك قبل اختيار الموعد.
          </p>

          <div className="space-y-3">
            {branches.map((branch) => {
              // عدد المواعيد المتاحة في الفرع — لتقرير المريض
              const slotCount = slotCountByBranch[branch.id] || 0;
              const hasSlots = slotCount > 0;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => onSelect(branch.id)}
                  className={`group flex w-full items-start justify-between gap-3 rounded-lg border-2 p-4 text-right transition-all duration-200 ${
                    hasSlots
                      ? 'border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/30 hover:shadow-md hover:shadow-brand-100/30'
                      : 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:bg-amber-100/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-black text-slate-800 group-hover:text-brand-800 transition-colors">{branch.name}</div>
                    {branch.address && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-500">
                        <FaLocationDot className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                        <span>{branch.address}</span>
                      </div>
                    )}
                    {/* مؤشر عدد المواعيد المتاحة — يساعد المريض يختار */}
                    <div className="mt-2.5">
                      {hasSlots ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                          <FaCircleCheck className="h-3 w-3" aria-hidden="true" />
                          {slotCount} موعد متاح
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
                          <FaTriangleExclamation className="h-3 w-3" aria-hidden="true" />
                          لا توجد مواعيد متاحة حالياً
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500 transition-all group-hover:bg-brand-100 group-hover:text-brand-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
