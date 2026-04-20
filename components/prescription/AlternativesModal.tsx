import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlternativeMed } from '../../types';

/**
 * الملف: AlternativesModal.tsx
 * الوصف: هذا المكون مسؤول عن نافذة "البدائل الدوائية".
 * عندما يكتشف النظام دواءً له بدائل (نفس الاسم العلمي والتركيز)، يظهر زر "بدائل".
 * تعرض هذه النافذة قائمة بتلك البدائل مع أسعارها، لتمكين الطبيب من اختيار
 * الدواء الأنسب لميزانية المريض أو المتوفر في الصيدليات.
 *
 * ملاحظة فنية مهمة:
 * المكون الأم (PrescriptionPreview) يستخدم `transform: scale()` و `zoom` لمعاينة
 * الروشتة، وهذا يكسر `position: fixed` للعناصر المتحدرة. لذا نستخدم `createPortal`
 * لتركيب المودال مباشرة على `document.body` ليتمركز بشكل صحيح كباقي مودالات التطبيق.
 */

interface AlternativesModalProps {
    isOpen: boolean;
    onClose: () => void;
    alternatives: AlternativeMed[];
    onSelect: (alt: AlternativeMed) => void;
}

export const AlternativesModal: React.FC<AlternativesModalProps> = ({ isOpen, onClose, alternatives, onSelect }) => {
    // إغلاق عبر مفتاح ESC
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modal = (
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn no-print"
            onMouseDown={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); onClose(); } }}
            onClick={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); onClose(); } }}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[85dvh] sm:my-auto border border-slate-200"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* رأس النافذة */}
                <div className="bg-white px-5 py-4 flex justify-between items-start gap-3 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <h3 className="text-lg font-bold tracking-tight leading-tight text-slate-900">اختر البديل</h3>
                            <p className="text-[11px] text-slate-500 font-semibold">Select Alternative</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="إغلاق"
                        className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-colors active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* قائمة البدائل */}
                <div className="overflow-y-auto custom-scrollbar p-3 flex-1 bg-slate-50 space-y-2">
                    {alternatives.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 mb-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-slate-700 text-sm font-bold">لا توجد بدائل مقترحة حالياً</p>
                            <p className="text-slate-500 text-xs mt-1">لم نجد أدوية بنفس الاسم العلمي والتركيز.</p>
                        </div>
                    ) : (
                        alternatives.map((alt, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => onSelect(alt)}
                                className="w-full text-right p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-colors group flex items-start gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-900 text-base group-hover:text-emerald-700 uppercase leading-tight truncate">
                                        {alt.name}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-semibold italic mt-0.5 truncate">
                                        {alt.scientificName}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {alt.form && (
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                                                {alt.form}
                                            </span>
                                        )}
                                        {alt.concentration && (
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                                                {alt.concentration}
                                            </span>
                                        )}
                                    </div>
                                    {alt.dosage && (
                                        <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                                            {alt.dosage}
                                        </p>
                                    )}
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1">
                                    <div className="font-bold text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                                        {alt.price > 0 ? `${alt.price} EGP` : 'السعر في القائمة'}
                                    </div>
                                    <svg className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* تذييل النافذة (زر الإلغاء) */}
                <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] text-sm"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};
