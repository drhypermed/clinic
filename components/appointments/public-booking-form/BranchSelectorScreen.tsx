/**
 * شاشة اختيار الفرع في فورم الحجز العام.
 * تظهر للمريض قبل شاشة المواعيد إذا كان الطبيب عنده أكثر من فرع نشط.
 */
import React from 'react';
import type { PublicBranchInfo } from '../../../types';

type BranchSelectorScreenProps = {
  branches: PublicBranchInfo[];
  doctorName?: string;
  clinicTitle?: string;
  onSelect: (branchId: string) => void;
};

export const BranchSelectorScreen: React.FC<BranchSelectorScreenProps> = ({
  branches,
  doctorName,
  clinicTitle,
  onSelect,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
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
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => onSelect(branch.id)}
                className="w-full flex items-start justify-between gap-3 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition text-right"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black text-slate-800">{branch.name}</div>
                  {branch.address && (
                    <div className="text-sm text-slate-600 font-bold mt-1">
                      📍 {branch.address}
                    </div>
                  )}
                </div>
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
