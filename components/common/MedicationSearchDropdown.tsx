/**
 * مكون قائمة البحث المنسدلة للأدوية (Medication Search Dropdown)
 * يعرض هذا المكون نتائج البحث عن الأدوية مع ميزات ذكية:
 * 1. فحص السلامة: تنبيه الطبيب إذا كان الدواء غير مناسب لعمر أو وزن المريض الحالي.
 * 2. المفضلة: تمييز الأدوية المفضلة لدى الطبيب.
 * 3. خيارات العرض: يدعم نمط "غني" (Rich) للروشتة ونمط "بسيط" (Simple) للإعدادات.
 */

import React from 'react';
import { Medication } from '../../types';
import { formatMinAge } from '../../utils/formatMinAge';

interface MedicationSearchDropdownProps {
    medications: Medication[]; // قائمة الأدوية المراد عرضها
    onSelect: (med: Medication) => void; // دالة عند اختيار دواء
    searchTerm?: string; // نص البحث المستخدم
    favorites?: string[]; // قائمة معرفات الأدوية المفضلة
    onToggleFavorite?: (e: React.MouseEvent, medId: string) => void; // تبديل حالة المفضلة
    currentAgeMonths?: number; // عمر المريض الحالي بالشهور (لفحص الملاءمة)
    currentWeight?: number;   // وزن المريض الحالي (لفحص الملاءمة)
    showPrice?: boolean;      // إظهار السعر
    variant?: 'default' | 'simple'; // نمط العرض (كامل أو بسيط)
}

export const MedicationSearchDropdown: React.FC<MedicationSearchDropdownProps> = ({
    medications,
    onSelect,
    searchTerm,
    favorites = [],
    onToggleFavorite,
    currentAgeMonths,
    currentWeight,
    showPrice = false,
    variant = 'default'
}) => {
    // حالة عدم العثور على نتائج
    if (!medications || medications.length === 0) {
        if (searchTerm) {
            return (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-100 px-3 py-2.5 z-50">
                    <div className="flex items-center gap-1.5" dir="rtl">
                        <span className="text-slate-500 font-bold text-sm">لم يتم العثور على نتائج للبحث "{searchTerm}"</span>
                        <span className="text-base leading-none">🤔</span>
                    </div>
                </div>
            );
        }
        return null;
    }



    /** النمط البسيط (Simple Variant) - مستلهم من بحث Google */
    if (variant === 'simple') {
        return (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-h-[280px] overflow-y-auto z-50 py-1">
                {medications.map((med, idx) => (
                    <div
                        key={med.id + idx}
                        onClick={() => onSelect(med)}
                        className="flex items-start gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer transition-colors group"
                        dir="ltr"
                    >
                        {/* أيقونة البحث */}
                        <div className="text-slate-400 group-hover:text-slate-600 pt-0.5 shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* اسم الدواء والمادة الفعالة */}
                        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-start justify-between gap-1.5">
                                <span className="font-bold text-slate-800 text-[13px] leading-snug">{med.name}</span>
                                {med.price && <span className="text-[9px] font-black text-success-700 bg-success-50 px-1.5 py-0.5 rounded border border-success-100 shrink-0">{med.price} ج.م</span>}
                            </div>
                            {med.genericName && <span className="text-[11px] text-slate-500 italic leading-snug">{med.genericName}</span>}
                            {(med.form || med.minAgeMonths) && (
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                    {med.form && <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">{med.form}</span>}
                                    {formatMinAge(med.minAgeMonths) && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-100">{formatMinAge(med.minAgeMonths)}</span>}
                                </div>
                            )}
                            {med.usage && <div className="text-[9px] text-slate-400 leading-snug mt-0.5 line-clamp-1">{med.usage}</div>}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    /** النمط الغني الافتراضي (Default Rich Variant) */
    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-brand-100 overflow-hidden max-h-[400px] overflow-y-auto z-50 ring-4 ring-black/5 custom-scrollbar">
            {/* عرض ترويسة المفضلة في حالة عدم وجود مصطلح بحث */}
            {!searchTerm && favorites.length > 0 && onToggleFavorite && (
                <div className="px-4 py-2 bg-warning-50 text-warning-600 text-xs font-bold border-b border-warning-100 flex items-center gap-2">
                    <svg className="w-4 h-4 text-warning-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    أدويتك المفضلة
                </div>
            )}

            {medications.map((med, idx) => {
                const isFav = favorites.includes(med.id);

                // فحص قيود الأمان (العمر والوزن) للمريض الحالي
                const minAge = med.minAgeMonths || 0;
                const maxAge = med.maxAgeMonths || Infinity;
                const isAgeEntered = currentAgeMonths !== undefined && Number.isFinite(currentAgeMonths) && currentAgeMonths > 0;
                const isAgeOutOfRange = isAgeEntered && (currentAgeMonths < minAge || currentAgeMonths > maxAge);

                const minWeight = med.minWeight || 0;
                const maxWeight = med.maxWeight || Infinity;
                const isWeightEntered = currentWeight !== undefined && Number.isFinite(currentWeight) && currentWeight > 0;
                const isWeightOutOfRange = isWeightEntered && (currentWeight < minWeight || currentWeight > maxWeight);

                const hasWarning = isAgeOutOfRange || isWeightOutOfRange;

                return (
                    <div
                        key={med.id + idx}
                        onClick={() => onSelect(med)}
                        className={`p-4 hover:bg-success-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all group ${isFav && searchTerm ? 'bg-warning-50/50' : ''} ${hasWarning ? 'bg-danger-50/30' : ''}`}
                        dir="ltr"
                    >
                        <div className="flex flex-col gap-1.5">
                            {/* السطر الأول: اسم الدواء وزر المفضلة */}
                            <div className="flex justify-between items-start gap-3">
                                <div className="font-black text-slate-800 text-base sm:text-lg group-hover:text-success-700 transition-colors">
                                    {med.name}
                                </div>
                                {onToggleFavorite && (
                                    <button
                                        onClick={(e) => onToggleFavorite(e, med.id)}
                                        className={`p-1.5 rounded-full transition-all active:scale-95 shrink-0 ${isFav ? 'text-warning-400 hover:text-warning-500' : 'text-slate-200 hover:text-warning-400'}`}
                                        title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                                    >
                                        {isFav ? (
                                            <svg className="w-5 h-5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* السطر الثاني: الاسم العلمي */}
                            <div className="text-xs sm:text-sm text-slate-500 font-bold italic">
                                {med.genericName}
                            </div>

                            {/* السطر الثالث: وسم البيانات (Form, Price, Warnings) */}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {hasWarning && (
                                    <span className="text-danger-600 text-[10px] sm:text-xs font-black bg-danger-100 px-2 py-1 rounded-lg border border-danger-200 flex items-center gap-1 shadow-sm">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        غير مناسب
                                    </span>
                                )}

                                {showPrice && (
                                    <span className="text-[10px] sm:text-xs font-black text-success-700 bg-success-50 px-2.5 py-1 rounded-lg border border-success-100 shadow-sm">
                                        {med.price} ج.م
                                    </span>
                                )}

                                <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold border border-slate-200 group-hover:bg-white group-hover:border-success-200 shadow-sm">
                                    {med.form}
                                </span>

                                <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg border ${isAgeEntered && currentAgeMonths < (med.minAgeMonths || 0) ? 'bg-danger-50 text-danger-600 border-danger-200' : 'bg-brand-50 text-brand-500 border-brand-100'}`}>
                                    {formatMinAge(med.minAgeMonths)}
                                </span>
                            </div>
                            {med.usage && <div className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{med.usage}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

