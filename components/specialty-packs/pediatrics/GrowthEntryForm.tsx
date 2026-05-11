/**
 * GrowthEntryForm — فورم إدخال قياس نمو (وزن + طول + محيط رأس)
 *
 * نفس نمط فورم زياره الحمل: حقول اختياريه كلها ما عدا التاريخ.
 * لو الـinitialEntry موجود → وضع تعديل، وإلا وضع إضافه.
 */

import React, { useEffect, useState } from 'react';
import {
    getTodayDateKey, formatChildAge,
} from '../../../services/specialty-packs/pediatrics';
import type { GrowthEntry } from '../../../services/specialty-packs/pediatrics';

interface GrowthEntryFormProps {
    /** تاريخ ميلاد الطفل — للعرض ودي وقت إدخال القياس */
    dateOfBirth?: string;
    /** قياس قائم لو في وضع تعديل */
    initialEntry?: GrowthEntry;
    onSubmit: (entry: Omit<GrowthEntry, 'id' | 'updatedAt'>) => void;
    onCancel: () => void;
    submitLabel?: string;
    /**
     * لو true، نخفي حقول الوزن والطول لأنها موجوده في الفايتالز
     * وبتتزامن تلقائياً عند حفظ الكشف. مفيد للودجت في صفحه الكشف.
     */
    hideVitalsOverlap?: boolean;
}

export const GrowthEntryForm: React.FC<GrowthEntryFormProps> = ({
    dateOfBirth, initialEntry, onSubmit, onCancel, submitLabel = 'حفظ القياس',
    hideVitalsOverlap = false,
}) => {
    const [dateKey, setDateKey] = useState(initialEntry?.dateKey || getTodayDateKey());
    const [weightKg, setWeightKg] = useState(initialEntry?.weightKg || '');
    const [heightCm, setHeightCm] = useState(initialEntry?.heightCm || '');
    const [headCircCm, setHeadCircCm] = useState(initialEntry?.headCircCm || '');

    useEffect(() => {
        if (!initialEntry) return;
        setDateKey(initialEntry.dateKey);
        setWeightKg(initialEntry.weightKg || '');
        setHeightCm(initialEntry.heightCm || '');
        setHeadCircCm(initialEntry.headCircCm || '');
    }, [initialEntry]);

    // العمر وقت القياس — يساعد الدكتور يتأكد من التاريخ
    const ageAtMeasurement = formatChildAge(dateOfBirth, dateKey);

    const handleSubmit = () => {
        if (!dateKey) return;
        onSubmit({
            dateKey,
            weightKg: weightKg.trim() || undefined,
            heightCm: heightCm.trim() || undefined,
            headCircCm: headCircCm.trim() || undefined,
        });
    };

    return (
        <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/50 p-3 sm:p-4 space-y-3">
            {/* صف 1: تاريخ + عمر محسوب */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                        تاريخ القياس
                    </label>
                    <input
                        type="date"
                        value={dateKey}
                        onChange={(e) => setDateKey(e.target.value)}
                        className="w-full h-10 rounded-xl border-2 border-sky-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-sky-400 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                        العمر وقت القياس
                    </label>
                    <div className="h-10 rounded-xl border-2 border-dashed border-sky-200 bg-white px-3 flex items-center text-sm font-black text-sky-700">
                        {ageAtMeasurement || (dateOfBirth ? '—' : 'سجل تاريخ الميلاد أولاً')}
                    </div>
                </div>
            </div>

            {/* صف 2: وزن + طول — يختفي في وضع الكشف لأنه موجود في الفايتالز */}
            {!hideVitalsOverlap && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                            الوزن (كجم)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            placeholder="مثلاً 8.5"
                            className="w-full h-10 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-sky-400 hover:border-sky-300 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                            الطول (سم)
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            placeholder="مثلاً 72"
                            className="w-full h-10 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-sky-400 hover:border-sky-300 focus:outline-none transition-colors"
                        />
                    </div>
                </div>
            )}
            {hideVitalsOverlap && (
                <p className="text-[10px] text-sky-700 font-bold rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-1.5">
                    💡 الوزن والطول بيتسجلوا في الفايتالز فوق ومنهم بيتنقلوا تلقائياً لجدول النمو عند حفظ الكشف. هنا سجل بس محيط الرأس + ملاحظات.
                </p>
            )}

            {/* صف 3: محيط الرأس */}
            <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                    محيط الرأس (سم) — اختياري، مهم تحت السنتين
                </label>
                <input
                    type="text"
                    inputMode="decimal"
                    value={headCircCm}
                    onChange={(e) => setHeadCircCm(e.target.value)}
                    placeholder="مثلاً 45"
                    className="w-full h-10 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-sky-400 hover:border-sky-300 focus:outline-none transition-colors max-w-xs"
                />
            </div>

            {/* أزرار */}
            <div className="flex flex-wrap gap-2 pt-1">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!dateKey}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:from-sky-600 hover:to-sky-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitLabel}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                    إلغاء
                </button>
            </div>
        </div>
    );
};
