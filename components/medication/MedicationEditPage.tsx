import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Medication } from '../../types';
import { useMedications } from '../../hooks/medications';
import { useMedicationSearch } from '../../hooks/medications/useMedicationSearch';
import { MedicationEditModal } from './MedicationEditModal';
import { medicationCustomizationService } from '../../services/medicationCustomizationService';
import { useAuth } from '../../hooks/useAuth';

/**
 * صفحة إدارة وتعديل الأدوية (Medication Edit Page)
 * هذه هي الواجهة الرئيسية التي تسمح للطبيب بالتحكم الكامل في قاعدة بيانات الأدوية الخاصة به.
 * الميزات الرئيسية:
 * 1. محرك بحث ذكي للأدوية يدعم الترتيب والأولويات (Ranking).
 * 2. عرض قائمة فرعية بالأدوية التي قام الطبيب بتعديلها أو إضافتها حديثاً.
 * 3. إمكانية إضافة دواء جديد تماماً من الصفر.
 * 4. تكامل لحظي (Real-time) مع Firestore لرصد التعديلات.
 */

interface MedicationEditPageProps {
    onBack: () => void;                         // دالة الرجوع للخلف
    onShowNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const MedicationEditPage: React.FC<MedicationEditPageProps> = ({
    onBack,
    onShowNotification
}) => {
    const { user } = useAuth();
    const medications = useMedications();
    const { search } = useMedicationSearch();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showModifiedModal, setShowModifiedModal] = useState(false);
    
    // مجموعة لإبقاء معرّفات الأدوية المعدلة محدثة لمقارنتها في البحث
    const [customizedIds, setCustomizedIds] = useState<Set<string>>(new Set());

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    /** رصد التعديلات في الوقت الفعلي لتحديد الأدوية "المعدلة" بعلامة مميزة في البحث */
    useEffect(() => {
        if (!user?.uid) return;
        const unsubscribe = medicationCustomizationService.subscribeToCustomizations(user.uid, (customs) => {
            setCustomizedIds(new Set(Object.keys(customs)));
        });
        return () => unsubscribe();
    }, [user?.uid]);

    /** إغلاق قائمة نتائج البحث عند النقر خارج صندوق البحث */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // البحث الموحد عبر hook مشتركة لتقليل الازدواجية بين الصفحات.
    const filteredMeds = useMemo(() => search(searchTerm), [search, searchTerm]);

    /** قائمة الأدوية التي تم تخصيصها فقط لعرضها في النافذة المنبثقة للأدوية المعدلة */
    const modifiedMedications = useMemo(() => {
        return medications.filter((m) => customizedIds.has(m.id));
    }, [medications, customizedIds]);

    const handleSelectMed = (med: Medication) => {
        setSelectedMed(med);
        setIsOpen(false);
        setSearchTerm('');
        setShowEditModal(true);
    };

    /** تهيئة البيانات لإضافة دواء جديد تماماً */
    const handleAddNewMedication = () => {
        const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newMed: any = {
            id: newId,
            name: '',
            genericName: '',
            concentration: '',
            price: 0,
            usage: '',
            timing: '',
            instructions: '',
            warnings: [],
            minAgeMonths: 0,
            maxAgeMonths: 0,
            minWeight: 0,
            maxWeight: 0,
            category: 'General',
            form: '',
            matchKeywords: [],
            isNew: true // علامة لتمييز الأدوية المضافة حديثاً في واجهات التعديل
        };
        setSelectedMed(newMed);
        setShowEditModal(true);
    };

    const handleEditSave = () => {
        setShowEditModal(false);
        setSelectedMed(null);
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setSelectedMed(null);
    };

    return (
        <div data-no-reveal dir="rtl" className="px-3 py-3 sm:px-5 sm:py-4 space-y-3">

            {/* شريط العنوان والإجراءات */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-wrap items-center justify-between gap-2 dh-stagger-1">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                    رجوع
                </button>

                <h1 className="text-sm font-black text-slate-700">تعديل معلومات الأدوية</h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddNewMedication}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white font-black text-xs bg-gradient-to-r from-brand-600 to-brand-700 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        إضافة دواء
                    </button>

                    <button
                        onClick={() => setShowModifiedModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-warning-200 bg-warning-50 text-xs font-bold text-warning-700 hover:bg-warning-100 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        المعدلة ({modifiedMedications.length})
                    </button>
                </div>
            </div>

            {/* قسم البحث */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 dh-stagger-2">
                <p className="text-xs font-bold text-slate-400 mb-2">البحث وتحرير الأدوية</p>

                {/* صندوق البحث الديناميكي */}
                <div className="relative" ref={searchContainerRef}>
                    <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                            placeholder="ابحث باسم الدواء أو الاسم العلمي أو الاستخدام..."
                            className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-9 py-2.5 font-medium text-slate-800 placeholder-slate-400 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(''); searchInputRef.current?.focus(); }}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-danger-400 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* قائمة نتائج البحث المنبثقة */}
                    {isOpen && filteredMeds.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[60vh] overflow-y-auto z-[60] custom-scrollbar">
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 tracking-wider">
                                نتائج البحث ({filteredMeds.length})
                            </div>
                            {filteredMeds.map((med, idx) => (
                                <button
                                    key={`${med.id}-${idx}`}
                                    onClick={() => handleSelectMed(med)}
                                    className="w-full p-3 text-left hover:bg-brand-50 border-b border-slate-100 last:border-b-0 transition-colors group"
                                    dir="ltr"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="hidden sm:flex w-9 h-9 rounded-xl bg-brand-100 text-brand-700 items-center justify-center shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-black text-slate-900 text-sm truncate">{med.name}</h3>
                                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                                    {med.price} EGP
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{med.genericName}</p>
                                            <div className="mt-1 flex items-center gap-2 text-[10px] font-bold">
                                                {(med as any).isNew ? (
                                                    <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">مضاف</span>
                                                ) : customizedIds.has(med.id) ? (
                                                    <span className="bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">معدل</span>
                                                ) : null}
                                                {med.form && <span className="text-slate-400 truncate">{med.form}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* حالة عدم وجود نتائج */}
                    {isOpen && searchTerm && filteredMeds.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6 text-center z-[60]">
                            <div className="text-3xl mb-2 opacity-60">🤔</div>
                            <div className="text-slate-700 font-black text-sm mb-1">لم يتم العثور على نتائج</div>
                            <div className="text-slate-400 text-xs font-bold">جرب البحث باسم آخر أو جزء من الاسم العلمي.</div>
                        </div>
                    )}

                    {/* طبقة إغلاق القائمة */}
                    {isOpen && (
                        <div className="fixed inset-0 z-[59] bg-transparent" onClick={() => setIsOpen(false)} />
                    )}
                </div>
            </div>

            {/* نافذة عرض الأدوية المعدلة مسبقاً — portaled إلى body للهروب من stacking context الأب */}
            {showModifiedModal && createPortal(
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); setShowModifiedModal(false); } }}
                    onClick={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); setShowModifiedModal(false); } }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[86dvh] sm:my-auto border border-slate-200"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* رأس النافذة — متناسق مع باقي المودالات */}
                        <div className="bg-white px-5 py-4 flex justify-between items-start gap-3 border-b border-slate-200 shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-warning-50 text-warning-600 shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </span>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <h3 className="text-lg font-bold tracking-tight leading-tight text-slate-900">الأدوية المعدلة</h3>
                                    <p className="text-[11px] text-slate-500 font-semibold">{modifiedMedications.length} دواء مخصص</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModifiedModal(false)}
                                aria-label="إغلاق"
                                className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition-colors active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* قائمة الأدوية المعدلة */}
                        <div className="p-3 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 space-y-2">
                            {modifiedMedications.length > 0 ? (
                                modifiedMedications.map((med) => (
                                    <button
                                        key={med.id}
                                        onClick={() => { handleSelectMed(med); setShowModifiedModal(false); }}
                                        className="w-full text-right p-3.5 bg-white rounded-xl border border-slate-200 hover:border-success-400 hover:bg-success-50/30 transition-colors group flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 flex items-center justify-center shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-success-700 transition-colors">
                                                    {med.name}
                                                </h4>
                                                {(med as any).isNew ? (
                                                    <span className="bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        مضاف
                                                    </span>
                                                ) : (
                                                    <span className="bg-warning-50 text-warning-700 border border-warning-100 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        معدل
                                                    </span>
                                                )}
                                            </div>
                                            {med.genericName && (
                                                <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">{med.genericName}</p>
                                            )}
                                            {med.form && (
                                                <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">{med.form}</p>
                                            )}
                                        </div>
                                        <svg className="w-4 h-4 text-slate-300 group-hover:text-success-600 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 mb-3">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-700 text-sm font-bold">لا توجد أدوية معدلة</p>
                                    <p className="text-slate-500 text-xs mt-1">ستظهر هنا الأدوية بعد تعديلها أو إضافتها.</p>
                                </div>
                            )}
                        </div>

                        {/* تذييل */}
                        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                            <button
                                onClick={() => setShowModifiedModal(false)}
                                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition-colors active:scale-[0.98] text-sm"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* عرض نافذة التعديل الفعلية عند اختيار دواء */}
            {showEditModal && selectedMed && (
                <MedicationEditModal
                    medication={selectedMed}
                    onClose={handleEditClose}
                    onSave={handleEditSave}
                    onShowNotification={onShowNotification}
                />
            )}
        </div>
    );
};