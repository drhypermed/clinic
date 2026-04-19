
/**
 * أداة فحص التفاعلات الدوائية (Drug Interactions Tool):
 * تتيح للطبيب اختيار مجموعة من الأدوية وفحص التداخلات المحتملة بينها.
 * تستخدم الذكاء الاصطناعي (Gemini) لتحليل الميكانيكيات الحيوية والآثار السريرية لكل تفاعل.
 */
import React, { useState } from 'react';

import { Medication } from '../../types';
import { checkDrugInteractions, InteractionsResult, DrugInteraction } from '../../services/geminiDrugToolsService';
import { DrugSearchInput } from './DrugSearchInput';
import { LoadingText } from '../ui/LoadingText';

interface SelectedDrug {
    name: string;
    genericName: string;
}

export const DrugInteractions: React.FC = () => {
    const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<InteractionsResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAddDrug = (med: Medication) => {
        const drugToAdd: SelectedDrug = {
            name: med.name,
            genericName: med.genericName || med.name
        };
        const alreadyAdded = selectedDrugs.some(
            d => d.name === drugToAdd.name && d.genericName === drugToAdd.genericName
        );
        if (!alreadyAdded) {
            setSelectedDrugs(prev => [...prev, drugToAdd]);
            setResult(null);
        }
    };

    const handleRemoveDrug = (index: number) => {
        setSelectedDrugs(prev => prev.filter((_, i) => i !== index));
        setResult(null);
    };

    const handleCheckInteractions = async () => {
        if (selectedDrugs.length < 2) {
            setError('يجب اختيار دوائين على الأقل للتحقق من التفاعلات');
            return;
        }
        setIsChecking(true);
        setError(null);
        setResult(null);
        try {
            const interactionResult = await checkDrugInteractions(selectedDrugs);
            setResult(interactionResult);
        } catch (err: any) {
            setError(err.message || 'حدث خطأ في فحص التفاعلات');
        } finally {
            setIsChecking(false);
        }
    };

    const getSeverityColor = (severity: DrugInteraction['severityLevel']) => {
        switch (severity) {
            case 'minor':
                return 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white';
            case 'moderate':
                return 'bg-gradient-to-br from-orange-500 to-amber-600 text-white';
            case 'major':
                return 'bg-gradient-to-br from-red-500 to-rose-600 text-white';
            case 'contraindicated':
                return 'bg-gradient-to-br from-purple-600 to-red-600 text-white';
            default:
                return 'bg-gradient-to-br from-slate-500 to-slate-600 text-white';
        }
    };

    const getSeverityLabel = (severity: DrugInteraction['severityLevel']) => {
        switch (severity) {
            case 'minor': return 'طفيف';
            case 'moderate': return 'متوسط';
            case 'major': return 'خطير';
            case 'contraindicated': return 'ممنوع';
            default: return severity;
        }
    };

    return (
        <div className="p-3" dir="rtl">
            <div className="space-y-2">
                <div>
                    <div className="mb-2">
                        <DrugSearchInput
                            placeholder="ابحث عن دواء للإضافة..."
                            onSelect={handleAddDrug}
                            clearOnSelect
                        />
                    </div>

                    {/* Selected Drugs */}
                    {selectedDrugs.length === 0 ? (
                        <div className="rounded-xl bg-slate-50 py-6 text-center">
                            <p className="text-slate-400 font-bold text-xs">ابحث عن دواء وأضفه هنا</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedDrugs.map((drug, index) => (
                                <div
                                    key={index}
                                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-2.5 py-1.5"
                                >
                                    <span className="font-black text-xs text-white">{drug.name}</span>
                                    <button
                                        onClick={() => handleRemoveDrug(index)}
                                        className="shrink-0 text-white/60 hover:text-white transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Check Button */}
                    <button
                        onClick={handleCheckInteractions}
                        disabled={selectedDrugs.length < 2 || isChecking}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white font-black text-sm bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)] hover:shadow-lg transition-all active:scale-[0.98] disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {isChecking ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <LoadingText>جاري فحص التفاعلات</LoadingText>
                            </>
                        ) : (
                            'فحص التفاعلات الدوائية'
                        )}
                    </button>
                </div>

                {/* Error State */}
                {error && !isChecking && (
                    <div className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-2.5 text-white font-bold text-xs text-center">
                        {error}
                    </div>
                )}

                {/* Results */}
                {result && !isChecking && (
                    <div className="space-y-2">
                        {/* Overall Risk Assessment */}
                        <div className={`p-3 rounded-2xl ${
                            result.overallRisk === 'low' ? 'bg-gradient-to-br from-emerald-600 to-green-700' :
                            result.overallRisk === 'moderate' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                            result.overallRisk === 'high' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                            'bg-gradient-to-br from-red-600 to-rose-700'
                        } shadow-lg`}>
                            <h3 className="text-sm font-black text-white mb-1">
                                التقييم العام: {
                                    result.overallRisk === 'low' ? 'منخفض' :
                                    result.overallRisk === 'moderate' ? 'متوسط' :
                                    result.overallRisk === 'high' ? 'مرتفع' :
                                    'خطر شديد'
                                }
                            </h3>
                            <p className="text-xs font-bold text-white/90 leading-relaxed">{result.generalAdvice}</p>
                        </div>

                        {/* Individual Interactions */}
                        {result.interactions && result.interactions.length > 0 ? (
                            <div className="space-y-2">
                                {result.interactions.map((interaction, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-2xl ${getSeverityColor(interaction.severityLevel)} shadow-md`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <h4 className="text-xs font-black flex-1">
                                                {interaction.drug1} / {interaction.drug2}
                                            </h4>
                                            <span className="shrink-0 rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-black">
                                                {getSeverityLabel(interaction.severityLevel)}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="bg-white/15 p-2 rounded-xl">
                                                <p className="text-[10px] font-black text-white/70 mb-0.5">آلية التفاعل</p>
                                                <p className="text-[11px] font-bold text-white leading-relaxed">{interaction.mechanism}</p>
                                            </div>
                                            <div className="bg-white/15 p-2 rounded-xl">
                                                <p className="text-[10px] font-black text-white/70 mb-0.5">التأثيرات السريرية</p>
                                                <p className="text-[11px] font-bold text-white leading-relaxed">{interaction.clinicalEffects}</p>
                                            </div>
                                            <div className="bg-white/15 p-2 rounded-xl">
                                                <p className="text-[10px] font-black text-white/70 mb-0.5">التوصيات</p>
                                                <p className="text-[11px] font-bold text-white leading-relaxed">{interaction.recommendations}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-2xl py-6 text-center shadow-md">
                                <p className="text-white font-black text-sm mb-0.5">لا توجد تفاعلات كبيرة</p>
                                <p className="text-white/80 font-bold text-[11px]">لم يتم اكتشاف تفاعلات دوائية ذات أهمية سريرية</p>
                            </div>
                        )}

                        {/* References */}
                        <div className="bg-slate-50 rounded-xl p-2.5">
                            <p className="text-[10px] font-bold text-slate-400 mb-1">المراجع العلمية</p>
                            <ul className="text-[10px] text-slate-500 space-y-0.5 font-medium">
                                {result.references.map((ref, i) => (
                                    <li key={i}>• {ref}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
