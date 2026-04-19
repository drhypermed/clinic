import React from 'react';
import { AlternativeMed } from '../../types';
import { ModalOverlay } from '../ui/ModalOverlay';

/**
 * الملف: AlternativesModal.tsx
 * الوصف: هذا المكون مسؤول عن نافذة "البدائل الدوائية".
 * عندما يكتشف النظام دواءً له بدائل (نفس الاسم العلمي والتركيز)، يظهر زر "بدائل".
 * تعرض هذه النافذة قائمة بتلك البدائل مع أسعارها، لتمكين الطبيب من اختيار
 * الدواء الأنسب لميزانية المريض أو المتوفر في الصيدليات.
 */

interface AlternativesModalProps {
    isOpen: boolean;       // حالة فتح النافذة
    onClose: () => void;    // وظيفة الإغلاق
    alternatives: AlternativeMed[]; // قائمة البدائل الممررة من قاعدة البيانات بالاشتراك مع خوارزمية البحث
    onSelect: (alt: AlternativeMed) => void; // وظيفة يتم استدعاؤها عند اختيار بديل لاستبدال الدواء الحالي به
}

export const AlternativesModal: React.FC<AlternativesModalProps> = ({ isOpen, onClose, alternatives, onSelect }) => {
    return (
        <ModalOverlay
            isOpen={isOpen}
            onClose={onClose}
            backdropClass="bg-black/60"
            noPrint
            animateIn="none"
            contentClassName="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn flex flex-col max-h-[85vh]"
        >
            {/* رأس النافذة */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg">Select Alternative / اختر البديل</h3>
                <button onClick={onClose} className="text-white hover:text-red-300 font-bold px-2 text-xl">✕</button>
            </div>

            {/* قائمة البدائل */}
            <div className="overflow-y-auto p-2 flex-1">
                {alternatives.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 font-bold">لا توجد بدائل مقترحة حالياً.</div>
                ) : (
                    alternatives.map((alt, i) => (
                        <div
                            key={i}
                            onClick={() => onSelect(alt)}
                            className="p-4 border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors group flex flex-col gap-1"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {/* اسم البراند التجاري */}
                                    <div className="font-black text-slate-800 text-lg group-hover:text-blue-700 uppercase leading-tight">{alt.name}</div>
                                    {/* الاسم العلمي (Scientific Name) أسفل الاسم التجاري مباشرة */}
                                    <div className="text-[11px] text-blue-600 font-bold italic mb-1">({alt.scientificName})</div>
                                    {/* تفاصيل الشكل الدوائي والتركيز والجرعة الافتراضية */}
                                    <div className="text-xs text-slate-500 font-bold">{alt.form} • {alt.concentration} • {alt.dosage}</div>
                                </div>
                                {/* عرض السعر في القائمة للبديل */}
                                <div className="font-black text-emerald-600 text-base bg-emerald-50 px-3 py-1 rounded shrink-0">
                                    {alt.price > 0 ? `${alt.price} EGP` : 'Price in List'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* تذييل النافذة (زر الإلغاء) */}
            <div className="p-3 bg-slate-50 text-center shrink-0 border-t border-slate-100">
                <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 font-bold">Cancel</button>
            </div>
        </ModalOverlay>
    );
};
