
/**
 * أداة الأمان في الحمل والرضاعة (Pregnancy & Breastfeeding Safety):
 * توفر معلومات دقيقة حول تصنيفات FDA للأدوية وتأثيرها على الأجنة والرضع.
 * تهدف لمساعدة الأطباء في اتخاذ قرارات آمنة للأمهات دون الحاجة للبحث اليدوي المطول.
 */
import React, { useState } from 'react';

import { Medication } from '../../types';
import { checkPregnancySafety, PregnancySafetyResult } from '../../services/geminiDrugToolsService';
import { DrugSearchInput } from './DrugSearchInput';

export const PregnancySafety: React.FC = () => {
    const [selectedDrug, setSelectedDrug] = useState<Medication | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [safetyResult, setSafetyResult] = useState<PregnancySafetyResult | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleSelectDrug = (med: Medication) => {
        setSelectedDrug(med);
        setSearchValue(med.name);
        setSafetyResult(null);
        setSearchError(null);
    };

    const handleSearch = async () => {
        const drugToSearch = selectedDrug?.name || searchValue.trim();
        if (!drugToSearch) {
            setSearchError('الرجاء إدخال اسم الدواء');
            return;
        }
        setIsSearching(true);
        setSearchError(null);
        setSafetyResult(null);
        try {
            const result = await checkPregnancySafety(
                drugToSearch,
                selectedDrug?.genericName
            );
            setSafetyResult(result);
        } catch (error: any) {
            setSearchError(error.message || 'حدث خطأ أثناء البحث');
        } finally {
            setIsSearching(false);
        }
    };

    const getRiskGradient = (risk: string) => {
        switch (risk.toLowerCase()) {
            case 'safe':
                return 'bg-gradient-to-br from-emerald-600 to-green-700 text-white';
            case 'caution':
                return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white';
            case 'unsafe':
                return 'bg-gradient-to-br from-red-500 to-rose-600 text-white';
            default:
                return 'bg-gradient-to-br from-slate-500 to-slate-600 text-white';
        }
    };

    const getCategoryGradient = (category: string) => {
        if (category.includes('A')) return 'bg-gradient-to-r from-emerald-600 to-green-700 text-white';
        if (category.includes('B')) return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
        if (category.includes('C')) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
        if (category.includes('D')) return 'bg-gradient-to-r from-orange-500 to-red-600 text-white';
        if (category.includes('X')) return 'bg-gradient-to-r from-red-600 to-rose-700 text-white';
        return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    };

    return (
        <div className="p-3" dir="rtl">
            {/* Search Row */}
            <div className="mb-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <DrugSearchInput
                            placeholder="ابحث عن دواء..."
                            value={searchValue}
                            onValueChange={(val) => {
                                setSearchValue(val);
                                setSelectedDrug(null);
                            }}
                            onSelect={handleSelectDrug}
                            onSubmit={handleSearch}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || (!selectedDrug && !searchValue.trim())}
                        className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-black text-sm bg-gradient-to-br from-blue-500 to-cyan-600 shadow-[0_8px_20px_-8px_rgba(6,182,212,0.5)] hover:shadow-lg transition-all active:scale-[0.98] disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {isSearching ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <span>بحث</span>
                        )}
                    </button>
                </div>

                {selectedDrug && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-3 py-1 text-xs font-black text-white">{selectedDrug.name}</span>
                        <button
                            onClick={() => { setSelectedDrug(null); setSearchValue(''); setSafetyResult(null); }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {searchError && (
                <div className="mb-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-2.5 text-white font-bold text-xs text-center">
                    {searchError}
                </div>
            )}

            {/* Results */}
            {safetyResult && !isSearching && (
                <div className="space-y-2">
                    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 rounded-2xl p-3 shadow-md">
                        <p className="font-black text-sm text-white" dir="ltr">{safetyResult.drugName}</p>
                        {safetyResult.genericName && (
                            <p className="text-[11px] font-bold text-white/70 mt-0.5" dir="ltr">{safetyResult.genericName}</p>
                        )}
                    </div>

                    {/* Pregnancy Category */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400">أمان الحمل</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black ${getCategoryGradient(safetyResult.pregnancyCategory)}`}>
                                فئة {safetyResult.pregnancyCategory}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                                <p className="text-[9px] font-black text-white/70 mb-0.5">الثلث الأول</p>
                                <p className="text-[10px] font-bold text-white leading-snug">{safetyResult.pregnancySafety.trimester1}</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-2 rounded-xl">
                                <p className="text-[9px] font-black text-white/70 mb-0.5">الثلث الثاني</p>
                                <p className="text-[10px] font-bold text-white leading-snug">{safetyResult.pregnancySafety.trimester2}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-xl">
                                <p className="text-[9px] font-black text-white/70 mb-0.5">الثلث الثالث</p>
                                <p className="text-[10px] font-bold text-white leading-snug">{safetyResult.pregnancySafety.trimester3}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                            <p className="text-[10px] font-black text-slate-400 mb-0.5">التوصية العامة</p>
                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{safetyResult.pregnancySafety.overall}</p>
                        </div>
                    </div>

                    {/* Breastfeeding Safety */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400">أمان الرضاعة</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black ${getRiskGradient(safetyResult.breastfeedingSafety.riskLevel)}`}>
                                {safetyResult.breastfeedingSafety.riskLevel === 'safe' ? 'آمن' :
                                    safetyResult.breastfeedingSafety.riskLevel === 'caution' ? 'بحذر' :
                                        safetyResult.breastfeedingSafety.riskLevel === 'unsafe' ? 'غير آمن' : 'غير معروف'}
                            </span>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-md">
                            <p className="text-[10px] font-black text-white/70 mb-0.5">التقييم</p>
                            <p className="text-[11px] font-bold text-white leading-relaxed">{safetyResult.breastfeedingSafety.safety}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-2.5 rounded-xl shadow-md">
                            <p className="text-[10px] font-black text-white/70 mb-0.5">انتقال الدواء للبن الأم</p>
                            <p className="text-[11px] font-bold text-white leading-relaxed">{safetyResult.breastfeedingSafety.milkTransfer}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                            <p className="text-[10px] font-black text-slate-400 mb-0.5">التوصيات</p>
                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{safetyResult.breastfeedingSafety.recommendations}</p>
                        </div>
                    </div>

                    {safetyResult.clinicalNotes && safetyResult.clinicalNotes.length > 0 && (
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-2.5 shadow-md">
                            <p className="text-[10px] font-black text-white/70 mb-1">ملاحظات سريرية هامة</p>
                            <ul className="space-y-1">
                                {safetyResult.clinicalNotes.map((note, i) => (
                                    <li key={i} className="text-white font-bold text-[11px] flex items-start gap-1">
                                        <span className="text-white/60 mt-0.5 shrink-0">•</span>
                                        <span>{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-xl p-2">
                        <p className="text-[9px] text-slate-400 text-center font-bold">
                            المراجع: {safetyResult.references.join(' • ')}
                        </p>
                    </div>
                </div>
            )}

            {!safetyResult && !isSearching && !searchError && (
                <div className="rounded-xl bg-slate-50 py-8 text-center">
                    <p className="text-slate-400 font-bold text-xs">ابحث عن دواء للتحقق من أمانه خلال الحمل والرضاعة</p>
                </div>
            )}
        </div>
    );
};
