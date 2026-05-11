/**
 * PregnancyConsultationWidget — ودجت متابعه الحمل داخل كشف جديد
 *
 * نسخه مدمجه من PregnancySection بتشتغل أثناء الكشف:
 *   - بتعرض الأسبوع الحالي + ميعاد الولاده (لو LMP مسجل)
 *   - زرّ "أضف زياره النهارده" يفتح فورم سريع
 *   - لو مفيش LMP، زرّ "ابدأ متابعه الحمل" يفتح كرت الإدخال
 *
 * البيانات متشاركه مع PregnancySection (نفس وثيقه pregnancyFile__).
 * فايده الفصل: الكشف بياخد نسخه مدمجه عشان مايزحمش الواجهه؛
 * ملف المريضه بياخد النسخه الكامله مع القائمه التاريخيه.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    calculateGestationalWeek, formatGestationalAge, getTodayDateKey,
} from '../../../services/specialty-packs/gynecology';
import { normalizePatientNameForFile } from '../../../services/patient-files';
import { registerFlusher } from '../../../services/specialty-packs';
import { PregnancyCalculatorCard } from './PregnancyCalculatorCard';
import { PregnancyVisitsList } from './PregnancyVisitsList';
import { usePregnancyFile } from './usePregnancyFile';

interface PregnancyConsultationWidgetProps {
    userId?: string | null;
    /** اسم المريضه — بنبني منه nameKey بنفس normalizer ملفات المرضى */
    patientName?: string | null;
    /** تاريخ الكشف/الاستشارة المفتوح حالياً — عليه تتحسب أسابيع الحمل. */
    visitDate?: string | null;
    /**
     * مزامنه حاله الحمل + الأسبوع من LMP إلى حقول الكشف.
     * بتتنادى لما LMP يبقى متسجل: pregnant=true + الأسبوع المحسوب.
     * لو الملف مغلق (ولاده/إجهاض) → pregnant=false ولا تحديث للأسبوع.
     */
    onSyncPregnancyFromLMP?: (pregnant: boolean, gestationalAgeWeeks: number | null) => void;
}

// ─ صياغه تاريخ عربي ─
const formatDateArabic = (iso?: string | null): string => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

export const PregnancyConsultationWidget: React.FC<PregnancyConsultationWidgetProps> = ({
    userId, patientName, visitDate, onSyncPregnancyFromLMP,
}) => {
    const nameKey = useMemo(
        () => normalizePatientNameForFile(patientName || ''),
        [patientName],
    );
    const {
        file, loading, error, isSaving,
        setLMP, addVisit, updateVisit, deleteVisit, flush,
    } = usePregnancyFile({ userId, patientFileNameKey: nameKey || null });

    // تسجيل الـflush في الباص — قبل ما السجل يتحفظ، الـwidget يخلص حفظه أولاً
    useEffect(() => registerFlusher(flush), [flush]);

    const [expanded, setExpanded] = useState(false);
    const effectiveVisitDate = visitDate || getTodayDateKey();

    // ─ مزامنه حاله الحمل من LMP → حقول الكشف ─
    // المفتاح فيه اسم المريضه (nameKey) عشان لو ٢ مريضات عندهم نفس LMP،
    // الـsync يشتغل لكل واحده بشكل منفصل.
    const lastSyncedKeyRef = useRef<string>('');
    useEffect(() => {
        if (!onSyncPregnancyFromLMP) return;
        if (!nameKey) return; // مفيش مريضه = مفيش مزامنه
        const lmp = file.lastMenstrualPeriod || '';
        const closed = Boolean(file.closedAt);
        const week = lmp && !closed
            ? calculateGestationalWeek(lmp, effectiveVisitDate)
            : null;
        const stateKey = `${nameKey}|${lmp}|${closed ? '1' : '0'}|${effectiveVisitDate}|${week ?? ''}`;
        if (stateKey === lastSyncedKeyRef.current) return;
        if (lmp && !closed) {
            onSyncPregnancyFromLMP(true, week);
        } else if (closed) {
            onSyncPregnancyFromLMP(false, null);
        }
        // لو مفيش LMP أصلاً → ما نلمسش حقول الكشف (الدكتورة ممكن تكون سجلتها يدوياً)
        lastSyncedKeyRef.current = stateKey;
    }, [nameKey, file.lastMenstrualPeriod, file.closedAt, effectiveVisitDate, onSyncPregnancyFromLMP]);

    // الـwidget يظهر دايماً (حتى من غير اسم مريضه) — empty state بدل null
    const hasNameKey = Boolean(nameKey);

    const isClosed = Boolean(file.closedAt);
    const lmp = file.lastMenstrualPeriod;
    const hasLMP = Boolean(lmp);

    // الأسبوع وقت الزيارة المفتوحة + آخر زياره (للعرض المدمج)
    const visitAgeLabel = formatGestationalAge(lmp, effectiveVisitDate);
    const latestVisit = file.visits[0]; // مرتبه من الأحدث

    return (
        <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50/70 to-white shadow-sm overflow-hidden">
            {/* ─ شريط الترويسه المدمج ─ */}
            <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="w-full px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2 hover:bg-pink-50/50 transition-colors text-right"
            >
                <span aria-hidden className="text-lg shrink-0">🤰</span>
                <span className="text-sm font-black text-pink-700 shrink-0">
                    متابعه الحمل
                </span>

                {!hasNameKey ? (
                    <span className="text-[11px] font-bold text-slate-500">
                        اكتب اسم المريضه في الكشف عشان نحمّل ملفها
                    </span>
                ) : loading ? (
                    <span className="text-[11px] font-bold text-slate-500">
                        جاري التحميل...
                    </span>
                ) : !hasLMP ? (
                    <span className="text-[11px] font-bold text-slate-500">
                        لسه ما اتسجلش LMP — اضغط للبدء
                    </span>
                ) : isClosed ? (
                    <span className="text-[11px] font-bold text-slate-500">
                        ملف الحمل مغلق
                    </span>
                ) : (
                    <>
                        <span className="inline-flex items-center rounded-full bg-pink-100 border border-pink-200 px-2 py-0.5 text-[11px] font-black text-pink-700">
                            {visitAgeLabel}
                        </span>
                        <span className="hidden sm:inline-flex items-center text-[11px] font-bold text-slate-600">
                            EDD: {formatDateArabic(file.estimatedDueDate)}
                        </span>
                        {latestVisit && (
                            <span className="inline-flex items-center text-[11px] font-bold text-slate-500">
                                · آخر زياره: {formatDateArabic(latestVisit.dateKey)}
                            </span>
                        )}
                    </>
                )}

                <span className="ml-auto text-[11px] font-bold text-pink-600">
                    {expanded ? '▲ إخفاء' : '▼ عرض'}
                </span>
            </button>

            {/* ─ المحتوى الموسّع ─ */}
            {expanded && (
                <div className="border-t border-pink-200 p-3 sm:p-4 space-y-3 bg-white">
                    {/* لو مفيش اسم مريضه، نعرض instruction بسيطه */}
                    {!hasNameKey && (
                        <div className="rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 p-3 text-center text-xs font-bold text-slate-600">
                            🤰 لتفعيل متابعه الحمل، اكتب اسم المريضه في حقل "اسم المريض" بالأعلى.
                        </div>
                    )}

                    {/* مؤشر الحفظ التلقائي — فقط لو فيه اسم */}
                    {hasNameKey && (isSaving || error) && (
                        <div
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                error
                                    ? 'bg-danger-50 border border-danger-200 text-danger-700'
                                    : 'bg-pink-50 border border-pink-200 text-pink-700'
                            }`}
                        >
                            {error ? `فشل الحفظ: ${error}` : 'جاري حفظ ملف الحمل...'}
                        </div>
                    )}

                    {/* حاسبه الحمل (LMP + EDD) — تظهر فقط لو فيه اسم مريضه */}
                    {hasNameKey && (
                        <PregnancyCalculatorCard
                            lmp={file.lastMenstrualPeriod}
                            edd={file.estimatedDueDate}
                            onChangeLMP={setLMP}
                            closed={isClosed}
                        />
                    )}

                    {hasNameKey && hasLMP && !isClosed && (
                        <div className="rounded-2xl border border-pink-100 bg-white p-3 sm:p-4">
                            <PregnancyVisitsList
                                lmp={file.lastMenstrualPeriod}
                                defaultDateKey={effectiveVisitDate}
                                visits={file.visits}
                                disabled={isClosed}
                                onAdd={addVisit}
                                onUpdate={updateVisit}
                                onDelete={deleteVisit}
                            />
                        </div>
                    )}

                    {hasNameKey && hasLMP && !isClosed && (
                        <div className="rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/40 px-3 py-2.5">
                            <p className="text-[11px] text-pink-700 font-bold leading-relaxed">
                                وزن الأم يتسجل من الفايتالز فوق، وتفاصيل زيارة الحمل هنا تتحفظ قبل حفظ السجل وتظهر داخل سجل الكشف التاريخي.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
