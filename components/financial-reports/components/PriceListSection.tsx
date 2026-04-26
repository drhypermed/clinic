/**
 * مكون قائمة الأسعار
 * يعرض حقول إدخال سعر الكشف والاستشارة مع حفظ يدوي
 * 
 * Price list component
 * Displays fixed examination/consultation prices with explicit save
 */

import React, { useEffect, useState } from 'react';
import { formatUserDate } from '../../../utils/cairoTime';
import { financialDataService, type PriceChangeHistoryEntry } from '../../../services/financial-data';
import { LoadingText } from '../../ui/LoadingText';

// ─────────────────────────────────────────────────────────────────────────────
// الخصائص | Props
// ─────────────────────────────────────────────────────────────────────────────

interface PriceListSectionProps {
    /** معرف المستخدم لجلب سجل الأسعار */
    userId?: string;
    /** الفرع النشط */
    branchId?: string;
    /** سعر الكشف */
    examinationPrice: string;
    /** سعر الاستشارة */
    consultationPrice: string;
    /** وقت آخر تحديث للسعر الحالي */
    lastUpdatedAt?: number;
    /** تحديث الأسعار محليا */
    onPricesChange: (prices: { examinationPrice: string; consultationPrice: string }) => void;
    /** حفظ الأسعار في السحابة */
    onSave: (prices: { examinationPrice: string; consultationPrice: string }) => Promise<void> | void;
    /** حالة الحفظ */
    isSaving: boolean;
    /** رسالة خطأ حفظ الأسعار */
    saveErrorMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// المكون | Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * قسم قائمة الأسعار
 * 
 * يعرض:
 * - حقل سعر الكشف
 * - حقل سعر الاستشارة
 * - حفظ يدوي صريح عند الضغط على زر حفظ
 */
export const PriceListSection: React.FC<PriceListSectionProps> = ({
    userId,
    branchId,
    examinationPrice,
    consultationPrice,
    lastUpdatedAt,
    onPricesChange,
    onSave,
    isSaving,
    saveErrorMessage = ''
}) => {
    const [draftExamPrice, setDraftExamPrice] = useState(examinationPrice || '');
    const [draftConsultPrice, setDraftConsultPrice] = useState(consultationPrice || '');
    const [isDirty, setIsDirty] = useState(false);
    const [priceHistory, setPriceHistory] = useState<PriceChangeHistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // حماية التعديلات غير المحفوظة: لو الـ props تغيرت (مثلاً الطبيب بدّل فرع)
    // والمستخدم عنده تعديلات غير محفوظة في draft، نسأله قبل ما نستبدل التعديلات.
    useEffect(() => {
        if (isDirty) {
            const confirmed = window.confirm(
                'عندك تعديلات في الأسعار لم يتم حفظها.\n\n' +
                'اضغط "موافق" لتجاهلها وتحميل أسعار الفرع الحالي.\n\n' +
                'اضغط "إلغاء" للعودة وحفظها أولاً.'
            );
            if (!confirmed) {
                // احتفظ بالتعديلات — لا تُحدّث الـ draft
                return;
            }
            setIsDirty(false);
        }
        setDraftExamPrice(examinationPrice || '');
        setDraftConsultPrice(consultationPrice || '');
        // ملاحظة: ما بنحطش isDirty في الـ deps عشان ما نعملش loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examinationPrice, consultationPrice]);

    // تحذير المتصفح عند إغلاق الصفحة أو عمل refresh مع وجود تعديلات غير محفوظة
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Reload history after a save so new entry appears immediately
    useEffect(() => {
        if (!userId || isSaving) return;
        financialDataService.getPriceChangeHistory(userId, branchId).then(setPriceHistory).catch(() => {});
    }, [userId, isSaving, lastUpdatedAt]);

    const handleExaminationPriceChange = (value: string) => {
        setDraftExamPrice(value);
        setIsDirty(true);
    };

    const handleConsultationPriceChange = (value: string) => {
        setDraftConsultPrice(value);
        setIsDirty(true);
    };

    const handleSavePrices = async () => {
        const next = {
            examinationPrice: draftExamPrice,
            consultationPrice: draftConsultPrice,
        };

        onPricesChange(next);
        await onSave(next);
        setIsDirty(false);
    };

    const todayLabel = formatUserDate(
        new Date(),
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        'ar-EG-u-nu-latn'
    );

    const lastUpdatedLabel = Number.isFinite(Number(lastUpdatedAt)) && Number(lastUpdatedAt) > 0
        ? formatUserDate(
            new Date(Number(lastUpdatedAt)),
            { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true },
            'ar-EG-u-nu-latn'
        )
        : 'لم يتم الحفظ بعد';

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            {/* ───────────────────────────────────────────────────────
                الهيدر | Header
            ─────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-4 sm:px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        قائمة الأسعار
                    </h2>
                    <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold text-white truncate">
                            اليوم: {todayLabel}
                        </span>
                        <span className="bg-white/15 px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-white/95 truncate">
                            آخر تحديث للأسعار: {lastUpdatedLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* ───────────────────────────────────────────────────────
                حقول الإدخال | Input Fields
            ─────────────────────────────────────────────────────── */}
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* سعر الكشف */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            💉 سعر الكشف
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={draftExamPrice}
                                onChange={(e) => handleExaminationPriceChange(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all text-lg font-black text-slate-800 text-center"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                    </div>

                    {/* سعر الاستشارة */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            💬 سعر الاستشارة
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={draftConsultPrice}
                                onChange={(e) => handleConsultationPriceChange(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all text-lg font-black text-slate-800 text-center"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleSavePrices}
                        disabled={isSaving || !isDirty}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success-600 text-white text-sm font-black shadow-sm hover:bg-success-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        💾 حفظ
                    </button>
                    {isSaving && (
                        <LoadingText className="text-sm text-success-700 font-black">جاري الحفظ</LoadingText>
                    )}
                    {!isSaving && isDirty && (
                        <span className="text-xs text-warning-700 font-black">يوجد تغييرات غير محفوظة</span>
                    )}
                </div>
                {saveErrorMessage && (
                    <p className="mt-3 text-sm text-danger-700 font-bold text-right">{saveErrorMessage}</p>
                )}

                {/* سجل تغييرات الأسعار */}
                {priceHistory.length > 0 && (
                    <div className="mt-5 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowHistory(v => !v)}
                            className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-brand-600 transition-colors"
                        >
                            <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            سجل تغييرات الأسعار
                            <span className="bg-brand-100 text-brand-700 text-xs font-black px-2 py-0.5 rounded-full">{priceHistory.length}</span>
                        </button>
                        {showHistory && (
                            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                                {priceHistory.map((entry) => (
                                    <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <p className="font-bold text-slate-400">
                                                {Number.isFinite(entry.changedAt) && entry.changedAt > 0
                                                    ? formatUserDate(new Date(entry.changedAt), { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }, 'ar-EG-u-nu-latn')
                                                    : '—'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!userId) return;
                                                    if (!window.confirm('حذف هذا السجل نهائياً؟')) return;
                                                    await financialDataService.deletePriceChangeEntry(userId, entry.id).catch(() => {});
                                                    setPriceHistory(prev => prev.filter(e => e.id !== entry.id));
                                                }}
                                                className="shrink-0 rounded-lg border border-danger-200 bg-danger-50 px-2 py-0.5 text-[10px] font-black text-danger-600 hover:bg-danger-100"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-danger-50 border border-danger-100 p-2">
                                                <p className="text-[10px] font-bold text-danger-400 mb-0.5">كشف: قبل</p>
                                                <p className="font-black text-danger-700">{entry.oldExaminationPrice} ج.م</p>
                                                <p className="text-[10px] font-bold text-danger-400 mb-0.5 mt-1">استشارة: قبل</p>
                                                <p className="font-black text-danger-700">{entry.oldConsultationPrice} ج.م</p>
                                            </div>
                                            <div className="rounded-lg bg-success-50 border border-success-100 p-2">
                                                <p className="text-[10px] font-bold text-success-500 mb-0.5">كشف: بعد</p>
                                                <p className="font-black text-success-700">{entry.newExaminationPrice} ج.م</p>
                                                <p className="text-[10px] font-bold text-success-500 mb-0.5 mt-1">استشارة: بعد</p>
                                                <p className="font-black text-success-700">{entry.newConsultationPrice} ج.م</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
