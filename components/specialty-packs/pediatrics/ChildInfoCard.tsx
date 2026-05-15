/**
 * ChildInfoCard — كرت بيانات الطفل الأساسيه
 *
 * فيه إدخالين فقط:
 *   1. تاريخ الميلاد — أساس حساب العمر وكل التطعيمات
 *   2. الجنس — مهم بصرياً (ولد/بنت)
 *
 * بيعرض العمر المحسوب تلقائي من تاريخ الميلاد بصيغه عربيه ودّيه.
 */

import React from 'react';
import {
    formatChildAge, getTodayDateKey,
} from '../../../services/specialty-packs/pediatrics';
import type { ChildSex } from '../../../services/specialty-packs/pediatrics';

interface ChildInfoCardProps {
    dateOfBirth?: string;
    sex?: ChildSex;
    onChangeDateOfBirth: (value: string) => void;
    onChangeSex: (value: ChildSex) => void;
}

export const ChildInfoCard: React.FC<ChildInfoCardProps> = ({
    dateOfBirth, sex, onChangeDateOfBirth, onChangeSex,
}) => {
    const ageLabel = formatChildAge(dateOfBirth, getTodayDateKey());

    return (
        <div className="bg-white rounded-2xl border border-sky-200/80 shadow-sm p-3 sm:p-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3 min-w-0">
                <div className="bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-lg p-1.5 shrink-0 shadow-sm">
                    <span aria-hidden className="text-base">👶</span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-800">
                    بيانات الطفل
                </h3>
                {ageLabel && (
                    <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] sm:text-xs font-black text-sky-700">
                        العمر: {ageLabel}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* ─ تاريخ الميلاد ─ */}
                <div>
                    <label className="block text-[11px] sm:text-xs font-black text-slate-600 mb-1">
                        تاريخ الميلاد
                    </label>
                    <input
                        type="date"
                        value={dateOfBirth || ''}
                        max={getTodayDateKey()}
                        onChange={(e) => onChangeDateOfBirth(e.target.value)}
                        className="w-full h-10 rounded-xl border-2 border-sky-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-sky-400 hover:border-sky-300 focus:outline-none transition-colors"
                        aria-label="تاريخ الميلاد"
                    />
                    {/* ملاحظه: تنبيه للدكتور إن السن في الكشف هيتحدث تلقائي من التاريخ ده */}
                    <p className="mt-1 text-[10px] text-sky-700 font-bold">
                        ملاحظة: السن (سنوات/شهور/أيام) في الكشف هيتحدث تلقائياً من التاريخ ده.
                    </p>
                </div>

                {/* ─ الجنس ─ */}
                <div>
                    <label className="block text-[11px] sm:text-xs font-black text-slate-600 mb-1">
                        الجنس
                    </label>
                    <div className="flex gap-1.5">
                        {[
                            { v: '', label: 'مش مسجل' },
                            { v: 'male', label: 'ولد' },
                            { v: 'female', label: 'بنت' },
                        ].map(({ v, label }) => (
                            <button
                                key={v || 'none'}
                                type="button"
                                onClick={() => onChangeSex(v as ChildSex)}
                                className={`flex-1 px-2 py-1.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                                    sex === v
                                        ? 'bg-sky-100 border-sky-400 text-sky-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {!dateOfBirth && (
                <p className="mt-2 text-[10px] sm:text-[11px] text-slate-500">
                    سجل تاريخ الميلاد عشان تظهر حسابات العمر والتطعيمات تلقائياً.
                </p>
            )}
        </div>
    );
};
