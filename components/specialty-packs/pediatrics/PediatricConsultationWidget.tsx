/**
 * PediatricConsultationWidget — ودجت الأطفال داخل كشف جديد
 *
 * نسخه مدمجه بتشتغل أثناء الكشف:
 *   - بتعرض عمر الطفل + آخر قياس (وزن/طول)
 *   - تنبيه لو فيه تطعيم متأخر/مستحق
 *   - زرّ "أضف قياس النهارده" يفتح فورم سريع
 *
 * البيانات متشاركه مع PediatricSection — نفس وثيقه pediatricFile__.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    calculateAgeInDays, calculateAgeInMonths, calculateVaccinationTiming,
    EGYPTIAN_VACCINATION_SCHEDULE, formatChildAge, getTodayDateKey,
    SCHEDULE_BY_ID,
} from '../../../services/specialty-packs/pediatrics';
import { normalizePatientNameForFile } from '../../../services/patient-files';
import { registerFlusher } from '../../../services/specialty-packs';
import { usePediatricFile } from './usePediatricFile';

interface PediatricConsultationWidgetProps {
    userId?: string | null;
    patientName?: string | null;
    /**
     * مزامنه السن — يتنادى لما الـDOB يكون متسجل عشان نملي حقول السن في الكشف.
     * بنبعت السن مقسّم سنوات/شهور/أيام بصيغه string جاهزه للـinput.
     */
    onSyncAgeFromDOB?: (years: string, months: string, days: string) => void;
}

/** قسمه عمر بالأيام إلى سنوات + شهور + أيام (للحقول الموجوده في الكشف) */
const splitAgeFromDays = (totalDays: number): { years: string; months: string; days: string } => {
    if (totalDays < 0) return { years: '', months: '', days: '' };
    const years = Math.floor(totalDays / 365.25);
    const afterYears = totalDays - Math.floor(years * 365.25);
    const months = Math.floor(afterYears / 30.4375);
    const days = Math.max(0, Math.floor(afterYears - months * 30.4375));
    return { years: String(years), months: String(months), days: String(days) };
};

const formatDate = (iso?: string): string => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

export const PediatricConsultationWidget: React.FC<PediatricConsultationWidgetProps> = ({
    userId, patientName, onSyncAgeFromDOB,
}) => {
    const nameKey = useMemo(
        () => normalizePatientNameForFile(patientName || ''),
        [patientName],
    );
    const {
        file, loading, error, isSaving,
        setDateOfBirth, setVaccinationStatus,
        flush,
    } = usePediatricFile({ userId, patientFileNameKey: nameKey || null });

    // نسجّل الـflush في الـbus عشان زرار "حفظ الكشف" يقدر يجبر الحفظ
    // قبل ما الـauto-sync يقرا داتا قديمه.
    useEffect(() => registerFlusher(flush), [flush]);

    const [expanded, setExpanded] = useState(false);

    // ─ مزامنه السن من DOB → حقول الكشف ─
    // المفتاح "patient|dob" بيشمل اسم المريض عشان لو ٢ أطفال
    // عندهم نفس تاريخ الميلاد، الـsync يشتغل للاتنين بشكل منفصل.
    const lastSyncedKeyRef = useRef<string>('');
    useEffect(() => {
        if (!onSyncAgeFromDOB) return;
        const dob = file.dateOfBirth || '';
        if (!dob) return;
        const stateKey = `${nameKey}|${dob}`;
        if (stateKey === lastSyncedKeyRef.current) return;
        const days = calculateAgeInDays(dob, getTodayDateKey());
        if (days === null) return;
        const { years, months, days: d } = splitAgeFromDays(days);
        onSyncAgeFromDOB(years, months, d);
        lastSyncedKeyRef.current = stateKey;
    }, [nameKey, file.dateOfBirth, onSyncAgeFromDOB]);

    // ⚠️ كل الـhooks لازم تتنادى قبل أي return شرطي عشان مايبقاش
    //   "Rendered more hooks than during the previous render" لما المريض يتكتب.
    const currentAgeMonths = calculateAgeInMonths(file.dateOfBirth, getTodayDateKey());

    // تطعيمات متأخره/مستحقه — للتنبيه السريع (لازم تتحسب بشكل غير شرطي)
    const dueOrOverdueIds = useMemo(() => {
        if (currentAgeMonths === null) return [];
        return EGYPTIAN_VACCINATION_SCHEDULE
            .filter((item) => {
                const record = file.vaccinations[item.id];
                if (record?.status === 'given' || record?.status === 'skipped') return false;
                const timing = calculateVaccinationTiming(item.ageMonths, currentAgeMonths);
                return timing === 'overdue' || timing === 'due';
            })
            .map((item) => item.id);
    }, [currentAgeMonths, file.vaccinations]);

    // ← مفيش early return — الـwidget يظهر دايماً، حتى من غير اسم مريض
    //   (لما الاسم مكتوبش، نعرض empty state وداخل الـwidget نطلب الإدخال)
    const hasNameKey = Boolean(nameKey);
    const hasDOB = Boolean(file.dateOfBirth);
    const ageLabel = formatChildAge(file.dateOfBirth, getTodayDateKey());
    const latestGrowth = file.growthEntries[0];

    return (
        <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50/70 to-white shadow-sm overflow-hidden">
            {/* شريط الترويسه المدمج */}
            <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="w-full px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2 hover:bg-sky-50/50 transition-colors text-right"
            >
                <span aria-hidden className="text-lg shrink-0">👶</span>
                <span className="text-sm font-black text-sky-700 shrink-0">
                    متابعه الطفل
                </span>

                {!hasNameKey ? (
                    <span className="text-[11px] font-bold text-slate-500">
                        اكتب اسم الطفل في الكشف عشان نحمّل ملفه
                    </span>
                ) : loading ? (
                    <span className="text-[11px] font-bold text-slate-500">
                        جاري التحميل...
                    </span>
                ) : !hasDOB ? (
                    <span className="text-[11px] font-bold text-slate-500">
                        لسه ما اتسجلش تاريخ الميلاد — اضغط للبدء
                    </span>
                ) : (
                    <>
                        <span className="inline-flex items-center rounded-full bg-sky-100 border border-sky-200 px-2 py-0.5 text-[11px] font-black text-sky-700">
                            {ageLabel}
                        </span>
                        {latestGrowth && (
                            <>
                                {latestGrowth.weightKg && (
                                    <span className="hidden sm:inline-flex items-center text-[11px] font-bold text-slate-600">
                                        وزن: {latestGrowth.weightKg} كجم
                                    </span>
                                )}
                                {latestGrowth.heightCm && (
                                    <span className="hidden sm:inline-flex items-center text-[11px] font-bold text-slate-600">
                                        طول: {latestGrowth.heightCm} سم
                                    </span>
                                )}
                            </>
                        )}
                        {dueOrOverdueIds.length > 0 && (
                            <span className="inline-flex items-center rounded-full bg-danger-50 border border-danger-200 px-2 py-0.5 text-[11px] font-black text-danger-700">
                                🔔 {dueOrOverdueIds.length} تطعيم مستحق
                            </span>
                        )}
                    </>
                )}

                <span className="ml-auto text-[11px] font-bold text-sky-600">
                    {expanded ? '▲ إخفاء' : '▼ عرض'}
                </span>
            </button>

            {/* المحتوى الموسّع */}
            {expanded && (
                <div className="border-t border-sky-200 p-3 sm:p-4 space-y-3 bg-white">
                    {/* لو مفيش اسم مريض، نعرض instruction بسيطه */}
                    {!hasNameKey && (
                        <div className="rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/30 p-3 text-center text-xs font-bold text-slate-600">
                            👶 لتفعيل متابعه الطفل، اكتب اسم الطفل في حقل "اسم المريض" بالأعلى.
                        </div>
                    )}

                    {hasNameKey && (isSaving || error) && (
                        <div
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                                error
                                    ? 'bg-danger-50 border border-danger-200 text-danger-700'
                                    : 'bg-sky-50 border border-sky-200 text-sky-700'
                            }`}
                        >
                            {error ? `فشل الحفظ: ${error}` : 'جاري حفظ ملف الطفل...'}
                        </div>
                    )}

                    {/* تاريخ ميلاد سريع لو مش موجود — يظهر فقط لو فيه اسم */}
                    {hasNameKey && !hasDOB && (
                        <div className="rounded-xl border-2 border-sky-200 bg-sky-50/50 p-3">
                            <label className="block text-[11px] font-black text-slate-700 mb-1">
                                تاريخ ميلاد الطفل
                            </label>
                            <input
                                type="date"
                                max={getTodayDateKey()}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full max-w-xs h-10 rounded-xl border-2 border-sky-200 bg-white px-3 text-sm font-bold focus:border-sky-400 focus:outline-none"
                            />
                            <p className="mt-1 text-[10px] text-slate-500">
                                💡 بعد التسجيل، السن في الكشف هيتحدث تلقائياً + هتظهر الحسابات والتطعيمات.
                            </p>
                        </div>
                    )}

                    {/* تنبيه تطعيمات متأخره/مستحقه */}
                    {hasDOB && dueOrOverdueIds.length > 0 && (
                        <div className="rounded-xl border-2 border-warning-200 bg-warning-50 p-3 space-y-2">
                            <p className="text-xs font-black text-warning-700">
                                التطعيمات اللي محتاجه قرار:
                            </p>
                            <ul className="space-y-1.5">
                                {dueOrOverdueIds.slice(0, 5).map((id) => {
                                    const item = SCHEDULE_BY_ID[id];
                                    if (!item) return null;
                                    return (
                                        <li key={id} className="flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-black text-slate-800 flex-1 min-w-0">
                                                {item.shortName} <span className="text-slate-500">({item.ageLabel})</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setVaccinationStatus(id, 'given', getTodayDateKey())}
                                                className="inline-flex items-center rounded-lg bg-success-600 text-white px-2 py-0.5 text-[10px] font-black hover:bg-success-700 transition"
                                            >
                                                ✓ اتاخد
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setVaccinationStatus(id, 'skipped')}
                                                className="inline-flex items-center rounded-lg bg-white border border-slate-300 text-slate-600 px-2 py-0.5 text-[10px] font-bold hover:bg-slate-50 transition"
                                            >
                                                تخطّى
                                            </button>
                                        </li>
                                    );
                                })}
                                {dueOrOverdueIds.length > 5 && (
                                    <li className="text-[10px] text-slate-500 italic">
                                        +{dueOrOverdueIds.length - 5} تاني — افتح ملف الطفل لكل التفاصيل
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* آخر قياس */}
                    {hasDOB && latestGrowth && (
                        <div className="rounded-xl border border-sky-200 bg-white p-3">
                            <p className="text-[11px] font-bold text-slate-500 mb-1">
                                آخر قياس بتاريخ {formatDate(latestGrowth.dateKey)}:
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span className="text-slate-500">وزن: </span>
                                    <span className="font-black text-slate-800">
                                        {latestGrowth.weightKg ? `${latestGrowth.weightKg} كجم` : '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500">طول: </span>
                                    <span className="font-black text-slate-800">
                                        {latestGrowth.heightCm ? `${latestGrowth.heightCm} سم` : '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500">رأس: </span>
                                    <span className="font-black text-slate-800">
                                        {latestGrowth.headCircCm ? `${latestGrowth.headCircCm} سم` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* بدل ما نسأل الدكتور يضيف قياس يدوي — التذكير إن الفايتالز بتشتغل تلقائي */}
                    {hasDOB && (
                        <div className="rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/40 px-3 py-2.5">
                            <p className="text-[11px] text-sky-700 font-bold leading-relaxed">
                                💡 سجل الوزن والطول ومحيط الرأس في الفايتالز فوق. عند حفظ الكشف، كل القياسات تنتقل تلقائياً لجدول النمو الطولي للطفل بتاريخ الكشف.
                            </p>
                        </div>
                    )}

                    {hasDOB && (
                        <p className="text-[10px] sm:text-[11px] text-slate-500 text-center pt-1">
                            للتطعيمات الكامله وكل القياسات السابقه، افتح ملف الطفل من "ملفات المرضى".
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
