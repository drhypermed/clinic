
/**
 * أداة ضبط جرعات الكلى (Renal Dose Adjustment):
 * تقوم بحساب معدل ترشيح الكلى (CrCl) باستخدام معادلة Cockcroft-Gault.
 * تقترح التعديلات اللازمة للجرعات بناءً على حالة وظائف الكلى للمريض والدواء المختار.
 */
import React, { useState } from 'react';

import { calculateRenalDoseAdjustment } from '../../services/geminiDrugToolsService';
import { DrugSearchInput } from './DrugSearchInput';
import { LoadingText } from '../ui/LoadingText';

export const RenalDoseAdjustment: React.FC = () => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [age, setAge] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [scr, setScr] = useState<string>('');
    const [drugName, setDrugName] = useState<string>('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateCrCl = () => {
        const a = parseFloat(age);
        const w = parseFloat(weight);
        const s = parseFloat(scr);
        if (!Number.isFinite(a) || !Number.isFinite(w) || !Number.isFinite(s) || a <= 0 || w <= 0 || s <= 0) return null;
        let value = ((140 - a) * w) / (72 * s);
        if (gender === 'female') value *= 0.85;
        return Math.round(value * 10) / 10;
    };

    const handleCalculate = async () => {
        const calculatedCrCl = calculateCrCl();
        if (!calculatedCrCl || !drugName.trim()) {
            setError("يرجى إدخال جميع البيانات المطلوبة (السن، الوزن، الكرياتينين، واسم الدواء)");
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const aiResult = await calculateRenalDoseAdjustment(drugName, calculatedCrCl, {
                age: parseFloat(age),
                weight: parseFloat(weight),
                gender,
                scr: parseFloat(scr)
            });
            setResult(aiResult);
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-3" dir="rtl">
            <div className="space-y-2">
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1">النوع</label>
                            <div className="flex rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setGender('male')}
                                    className={`flex-1 py-2 text-xs font-black transition-all ${gender === 'male' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                                >ذكر</button>
                                <button
                                    onClick={() => setGender('female')}
                                    className={`flex-1 py-2 text-xs font-black transition-all ${gender === 'female' ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                                >أنثى</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1">السن (سنة)</label>
                            <input
                                type="number"
                                value={age}
                                onChange={e => setAge(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-slate-800 placeholder-slate-400 text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                placeholder="60"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1">الوزن (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-slate-800 placeholder-slate-400 text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                placeholder="75"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 mb-1">S. Cr (mg/dL)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={scr}
                                onChange={e => setScr(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold text-red-600 placeholder-slate-400 text-center focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                placeholder="1.2"
                            />
                        </div>
                    </div>

                    {(age && weight && scr) && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 rounded-xl flex items-center justify-between shadow-md" dir="ltr">
                            <span className="text-white/80 font-bold text-xs">CrCl (Cockcroft-Gault):</span>
                            <span className="text-lg font-black text-white">{calculateCrCl()} <span className="text-[10px] font-bold text-white/70">ml/min</span></span>
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-1">اسم الدواء / المادة الفعالة</label>
                        <DrugSearchInput
                            placeholder="مثال: Meropenem, Ciprofloxacin..."
                            value={drugName}
                            onValueChange={setDrugName}
                            onSelect={(med) => setDrugName(med.name)}
                        />
                    </div>

                    <button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white font-black text-sm bg-gradient-to-br from-emerald-600 to-green-700 shadow-[0_8px_20px_-8px_rgba(5,150,105,0.5)] hover:shadow-lg transition-all active:scale-[0.98] disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <LoadingText>جاري التحليل</LoadingText>
                            </>
                        ) : 'حساب وتحليل الجرعة'}
                    </button>

                    {error && (
                        <div className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-2.5 text-white font-bold text-xs text-center">
                            {error}
                        </div>
                    )}
                </div>

                {!result ? (
                    <div className="rounded-xl bg-slate-50 py-8 text-center">
                        <p className="font-bold text-xs text-slate-400">أدخل البيانات واضغط تحليل لعرض التوصيات</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className={`p-3 rounded-2xl shadow-md ${
                            result.status === 'normal' ? 'bg-gradient-to-br from-emerald-600 to-green-700' :
                            result.status === 'adjust' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                            'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                            <p className="font-black text-sm text-white mb-1">
                                {result.status === 'normal' && 'الجرعة المعتادة (لا حاجة للتعديل)'}
                                {result.status === 'adjust' && 'يوصى بتعديل الجرعة'}
                                {result.status === 'avoid' && 'يفضل تجنب الدواء'}
                            </p>
                            <p className="font-bold text-white/90 text-xs leading-relaxed">{result.recommendation}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-3 shadow-md">
                            <p className="text-[10px] font-black text-white/70 mb-1">التفاصيل العلمية</p>
                            <p className="text-[11px] font-bold text-white leading-relaxed">{result.reasoning}</p>
                            {result.reference && (
                                <p className="text-[10px] text-white/60 mt-2 pt-2 border-t border-white/20 font-bold">المصدر: {result.reference}</p>
                            )}
                        </div>

                        {result.criticalNote && (
                            <div className="p-2.5 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl text-white font-bold text-xs shadow-md">
                                {result.criticalNote}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
