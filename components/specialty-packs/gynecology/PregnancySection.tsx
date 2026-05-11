/**
 * PregnancySection — قسم متابعه الحمل داخل ملف المريضه
 *
 * بيتعرض داخل PatientFileDetailsModal لو الباكدج مفعّل + تخصص الطبيبه نسا.
 * بيلمّ ٣ أجزاء:
 *   1. حاسبه الحمل (LMP → الأسبوع + EDD).
 *   2. شريط حاله الإغلاق (لو الحمل مغلق).
 *   3. قائمه الزيارات + فورم الإضافه/التعديل.
 *
 * الحفظ التلقائي بيتعمل من usePregnancyFile (debounce 800ms).
 */

import React from 'react';
import { LoadingText } from '../../ui/LoadingText';
import { PregnancyCalculatorCard } from './PregnancyCalculatorCard';
import { PregnancyVisitsList } from './PregnancyVisitsList';
import { usePregnancyFile } from './usePregnancyFile';
import type { PregnancyClosureType } from '../../../services/specialty-packs/gynecology';

interface PregnancySectionProps {
    userId?: string | null;
    patientFileNameKey?: string | null;
}

const CLOSURE_LABEL: Record<PregnancyClosureType, string> = {
    delivery: 'تمت الولاده',
    miscarriage: 'إجهاض',
    other: 'أخرى',
};

export const PregnancySection: React.FC<PregnancySectionProps> = ({
    userId, patientFileNameKey,
}) => {
    const {
        file, loading, error, isSaving,
        setLMP, addVisit, updateVisit, deleteVisit,
        closePregnancy, reopenPregnancy,
    } = usePregnancyFile({ userId, patientFileNameKey });

    if (!userId || !patientFileNameKey) {
        return (
            <div className="rounded-xl border border-warning-200 bg-warning-50 p-3 text-xs font-bold text-warning-700">
                مفيش ملف مريضه نشط — افتح ملف مريضه عشان تشوف متابعه الحمل.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="rounded-xl border border-pink-200 bg-pink-50/30 p-4 text-center">
                <LoadingText>جاري تحميل ملف الحمل</LoadingText>
            </div>
        );
    }

    const isClosed = Boolean(file.closedAt);

    return (
        <div className="space-y-3">
            {/* ─ مؤشر الحفظ التلقائي ─ */}
            {(isSaving || error) && (
                <div
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                        error
                            ? 'bg-danger-50 border border-danger-200 text-danger-700'
                            : 'bg-pink-50 border border-pink-200 text-pink-700'
                    }`}
                >
                    {error ? `فشل الحفظ: ${error}` : 'جاري حفظ ملف الحمل تلقائياً...'}
                </div>
            )}

            {/* ─ شريط حاله الإغلاق ─ */}
            {isClosed && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-slate-300 bg-slate-100 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span aria-hidden className="text-lg">🔒</span>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-slate-700">
                                ملف الحمل ده مغلق
                            </p>
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                                النوع: {file.closureType ? CLOSURE_LABEL[file.closureType] : '—'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={reopenPregnancy}
                        className="inline-flex items-center rounded-lg border border-slate-400 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        إعاده فتح
                    </button>
                </div>
            )}

            {/* ─ حاسبه الحمل ─ */}
            <PregnancyCalculatorCard
                lmp={file.lastMenstrualPeriod}
                edd={file.estimatedDueDate}
                onChangeLMP={setLMP}
                closed={isClosed}
            />

            {/* ─ قائمه الزيارات ─ */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
                <PregnancyVisitsList
                    lmp={file.lastMenstrualPeriod}
                    visits={file.visits}
                    disabled={isClosed}
                    onAdd={addVisit}
                    onUpdate={updateVisit}
                    onDelete={deleteVisit}
                />
            </div>

            {/* ─ أزرار إغلاق الملف (تظهر بس لو مفتوح وفيه LMP محدد) ─ */}
            {!isClosed && file.lastMenstrualPeriod && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
                    <p className="text-xs font-black text-slate-700 mb-2">
                        إنهاء متابعه الحمل
                    </p>
                    <p className="text-[11px] text-slate-500 mb-2.5">
                        لو الحمل خلص، اضغط النوع المناسب. تقدر تعيد فتح الملف لاحقاً.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const ok = window.confirm('تأكيد إغلاق الملف بنوع "تمت الولاده"؟');
                                if (ok) closePregnancy('delivery');
                            }}
                            className="inline-flex items-center rounded-lg border-2 border-success-300 bg-success-50 px-3 py-1.5 text-xs font-bold text-success-700 hover:bg-success-100 transition"
                        >
                            تمت الولاده
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const ok = window.confirm('تأكيد إغلاق الملف بنوع "إجهاض"؟');
                                if (ok) closePregnancy('miscarriage');
                            }}
                            className="inline-flex items-center rounded-lg border-2 border-warning-300 bg-warning-50 px-3 py-1.5 text-xs font-bold text-warning-700 hover:bg-warning-100 transition"
                        >
                            إجهاض
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const ok = window.confirm('تأكيد إغلاق الملف بنوع "أخرى"؟');
                                if (ok) closePregnancy('other');
                            }}
                            className="inline-flex items-center rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                            أخرى
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// تصدير افتراضي للـlazy import
export default PregnancySection;
