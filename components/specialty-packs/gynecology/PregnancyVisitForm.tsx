/**
 * PregnancyVisitForm — فورم إضافه/تعديل زياره حمل
 *
 * الحقول: تاريخ، وزن الجنين، نبضه، حركته، ملاحظات السونار، ملاحظات حره.
 * الأسبوع بيتحسب تلقائياً من LMP + تاريخ الزياره (مش حقل إدخال).
 *
 * يقبل initialVisit للوضع التعديلي — لو فاضي فالمكون في وضع الإضافه.
 */

import React, { useEffect, useState } from 'react';
import {
    calculateGestationalWeek, formatGestationalAge, getTodayDateKey,
} from '../../../services/specialty-packs/gynecology';
import type { PregnancyVisit } from '../../../services/specialty-packs/gynecology';

interface PregnancyVisitFormProps {
    lmp?: string;
    defaultDateKey?: string;
    initialVisit?: PregnancyVisit;
    onSubmit: (visit: Omit<PregnancyVisit, 'id' | 'updatedAt'>) => void;
    onCancel: () => void;
    submitLabel?: string;
    /**
     * لو true، نخفي حقل وزن الأم لأنه موجود في الفايتالز
     * وبيتزامن تلقائياً عند حفظ الكشف. مفيد للودجت في صفحه الكشف.
     */
    hideVitalsOverlap?: boolean;
}

export const PregnancyVisitForm: React.FC<PregnancyVisitFormProps> = ({
    lmp, defaultDateKey, initialVisit, onSubmit, onCancel, submitLabel = 'إضافه الزياره',
    hideVitalsOverlap = false,
}) => {
    const [dateKey, setDateKey] = useState(initialVisit?.dateKey || defaultDateKey || getTodayDateKey());
    const [fetalWeight, setFetalWeight] = useState(initialVisit?.fetalWeight || '');
    const [fetalHeartRate, setFetalHeartRate] = useState(initialVisit?.fetalHeartRate || '');
    const [fetalMovement, setFetalMovement] = useState<PregnancyVisit['fetalMovement']>(
        initialVisit?.fetalMovement || '',
    );
    const [maternalWeight, setMaternalWeight] = useState(initialVisit?.maternalWeight || '');
    const [ultrasoundNotes, setUltrasoundNotes] = useState(initialVisit?.ultrasoundNotes || '');
    const [notes, setNotes] = useState(initialVisit?.notes || '');

    // لو الـinitialVisit اتغيّر (مثلاً فتحنا تعديل لزياره مختلفه) نزامن الحقول
    useEffect(() => {
        if (!initialVisit) return;
        setDateKey(initialVisit.dateKey);
        setFetalWeight(initialVisit.fetalWeight || '');
        setFetalHeartRate(initialVisit.fetalHeartRate || '');
        setFetalMovement(initialVisit.fetalMovement || '');
        setMaternalWeight(initialVisit.maternalWeight || '');
        setUltrasoundNotes(initialVisit.ultrasoundNotes || '');
        setNotes(initialVisit.notes || '');
    }, [initialVisit]);

    useEffect(() => {
        if (initialVisit) return;
        if (!defaultDateKey) return;
        setDateKey(defaultDateKey);
    }, [defaultDateKey, initialVisit]);

    // الأسبوع المحسوب — يظهر للدكتوره وقت إدخال التاريخ
    const week = calculateGestationalWeek(lmp, dateKey);
    const ageLabel = formatGestationalAge(lmp, dateKey);

    const handleSubmit = () => {
        if (!dateKey) return;
        onSubmit({
            dateKey,
            gestationalWeek: week || undefined,
            fetalWeight: fetalWeight.trim() || undefined,
            fetalHeartRate: fetalHeartRate.trim() || undefined,
            fetalMovement,
            maternalWeight: maternalWeight.trim() || undefined,
            ultrasoundNotes: ultrasoundNotes.trim() || undefined,
            notes: notes.trim() || undefined,
        });
    };

    return (
        <div className="rounded-2xl border-2 border-pink-200 bg-pink-50/50 p-3 sm:p-4 space-y-3">
            {/* ─ صف 1: تاريخ (يختفي في الكشف) + الأسبوع المحسوب ─ */}
            {!hideVitalsOverlap ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                            تاريخ الزياره
                        </label>
                        <input
                            type="date"
                            value={dateKey}
                            onChange={(e) => setDateKey(e.target.value)}
                            className="w-full h-10 rounded-xl border-2 border-pink-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-pink-400 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                            الأسبوع وقت الزياره (محسوب)
                        </label>
                        <div className="h-10 rounded-xl border-2 border-dashed border-pink-200 bg-white px-3 flex items-center text-sm font-black text-pink-700">
                            {ageLabel || (lmp ? '—' : 'حدد LMP أولاً')}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                        الأسبوع وقت الكشف (محسوب من LMP وتاريخ الكشف)
                    </label>
                    <div className="h-10 rounded-xl border-2 border-dashed border-pink-200 bg-white px-3 flex items-center text-sm font-black text-pink-700 max-w-xs">
                        {ageLabel || (lmp ? '—' : 'حدد LMP أولاً')}
                    </div>
                </div>
            )}

            {/* ─ صف 2: وزن + نبض ─ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                        وزن الجنين (جرام)
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={fetalWeight}
                        onChange={(e) => setFetalWeight(e.target.value)}
                        placeholder="مثلاً 1500"
                        className="w-full h-10 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-pink-400 hover:border-pink-300 focus:outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                        نبض الجنين (BPM)
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={fetalHeartRate}
                        onChange={(e) => setFetalHeartRate(e.target.value)}
                        placeholder="140"
                        className="w-full h-10 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-pink-400 hover:border-pink-300 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* ─ وزن الأم — يختفي في وضع الكشف لأن الفايتالز فيها الوزن ─ */}
            {!hideVitalsOverlap && (
                <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                        وزن الأم (كجم)
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={maternalWeight}
                        onChange={(e) => setMaternalWeight(e.target.value)}
                        placeholder="مثلاً 68.5"
                        className="w-full max-w-xs h-10 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 focus:border-pink-400 hover:border-pink-300 focus:outline-none transition-colors"
                    />
                </div>
            )}
            {hideVitalsOverlap && (
                <p className="text-[10px] text-pink-700 font-bold rounded-lg bg-pink-50 border border-pink-200 px-2.5 py-1.5">
                    💡 وزن الأم بيتسجل في الفايتالز فوق. ملاحظات السونار والزياره تكتبها في "ملاحظات الكشف" تحت — مفيش حقول مكرره هنا. سجل بس وزن الجنين ونبضه وحركته.
                </p>
            )}

            {/* ─ حركه الجنين ─ */}
            <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5">
                    حركه الجنين
                </label>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { v: '', label: 'مش مذكور' },
                        { v: 'normal', label: 'طبيعيه' },
                        { v: 'decreased', label: 'قليله' },
                        { v: 'absent', label: 'غايبه' },
                    ].map(({ v, label }) => (
                        <button
                            key={v || 'none'}
                            type="button"
                            onClick={() => setFetalMovement(v as PregnancyVisit['fetalMovement'])}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-2 transition-colors ${
                                fetalMovement === v
                                    ? 'bg-pink-100 border-pink-400 text-pink-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─ ملاحظات السونار + الزياره — تختفي في الكشف (موجوده في ملاحظات الكشف العاديه) ─ */}
            {!hideVitalsOverlap && (
                <>
                    <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                            ملاحظات السونار
                        </label>
                        <textarea
                            rows={2}
                            value={ultrasoundNotes}
                            onChange={(e) => setUltrasoundNotes(e.target.value)}
                            placeholder="مثلاً: BPD مناسب للأسبوع، السائل طبيعي..."
                            maxLength={500}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-pink-400 focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">
                            ملاحظات الزياره
                        </label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="أي ملاحظات إضافيه..."
                            maxLength={500}
                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-pink-400 focus:outline-none transition-colors resize-none"
                        />
                    </div>
                </>
            )}

            {/* ─ أزرار الإجراءات ─ */}
            <div className="flex flex-wrap gap-2 pt-1">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!dateKey}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-700 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:from-pink-600 hover:to-pink-800 disabled:opacity-60 disabled:cursor-not-allowed"
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
