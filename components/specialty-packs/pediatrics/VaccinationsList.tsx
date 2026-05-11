/**
 * VaccinationsList — قائمه التطعيمات المصريه + متابعتها لكل طفل
 *
 * بنعرض كل تطعيم من الجدول الرسمي مع:
 *   - حالته (مستحق/جاي/متأخر) بناء على عمر الطفل
 *   - حالته المسجله (اتاخد/مُتخطى/مُعلق) لو الدكتور سجل
 *   - زرار سريع: "اتاخد النهارده" أو "تعديل التاريخ"
 *
 * النية: الدكتور يفتح الصفحه، يبص قدامه على اللي متأخر/مستحق، ويضغط زرار واحد.
 */

import React, { useMemo, useState } from 'react';
import {
    calculateAgeInMonths, calculateVaccinationTiming,
    EGYPTIAN_VACCINATION_SCHEDULE, getTodayDateKey,
    type VaccinationTiming, type VaccineScheduleItem,
} from '../../../services/specialty-packs/pediatrics';
import type {
    VaccinationRecord, VaccinationStatus,
} from '../../../services/specialty-packs/pediatrics';

interface VaccinationsListProps {
    dateOfBirth?: string;
    vaccinations: Record<string, VaccinationRecord>;
    disabled?: boolean;
    onUpdate: (scheduleId: string, patch: Partial<VaccinationRecord>) => void;
    onSetStatus: (
        scheduleId: string,
        status: VaccinationStatus,
        givenDate?: string,
    ) => void;
}

const formatDate = (iso?: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

// ─ تنسيق التوقيت ─
const TIMING_STYLE: Record<VaccinationTiming, { label: string; cls: string }> = {
    overdue: { label: 'متأخر', cls: 'bg-danger-50 border-danger-200 text-danger-700' },
    due: { label: 'مستحق دلوقتي', cls: 'bg-warning-50 border-warning-200 text-warning-700' },
    upcoming: { label: 'بدري', cls: 'bg-slate-50 border-slate-200 text-slate-600' },
};

// ─ تنسيق الحاله المسجله ─
const STATUS_STYLE: Record<VaccinationStatus, { label: string; cls: string }> = {
    pending: { label: 'لسه ما اتاخدش', cls: 'bg-slate-50 border-slate-200 text-slate-600' },
    given: { label: 'اتاخد', cls: 'bg-success-50 border-success-300 text-success-700' },
    skipped: { label: 'مُتخطى', cls: 'bg-slate-100 border-slate-300 text-slate-600' },
};

interface VaccineRowProps {
    item: VaccineScheduleItem;
    record?: VaccinationRecord;
    timing: VaccinationTiming;
    disabled: boolean;
    onSetStatus: VaccinationsListProps['onSetStatus'];
    onUpdate: VaccinationsListProps['onUpdate'];
}

const VaccineRow: React.FC<VaccineRowProps> = ({
    item, record, timing, disabled, onSetStatus, onUpdate,
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const status = record?.status || 'pending';
    const isGiven = status === 'given';
    const isSkipped = status === 'skipped';

    return (
        <li className={`rounded-xl border-2 p-3 shadow-sm transition-colors ${
            isGiven ? 'bg-success-50/40 border-success-200' :
            isSkipped ? 'bg-slate-50 border-slate-200' :
            timing === 'overdue' ? 'bg-danger-50/30 border-danger-200' :
            timing === 'due' ? 'bg-warning-50/30 border-warning-200' :
            'bg-white border-slate-200'
        }`}>
            {/* السطر الأساسي */}
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-sm font-black text-slate-800">
                            {item.shortName}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                            ({item.ageLabel})
                        </span>
                        {!isGiven && !isSkipped && (
                            <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${TIMING_STYLE[timing].cls}`}>
                                {TIMING_STYLE[timing].label}
                            </span>
                        )}
                        <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[status].cls}`}>
                            {STATUS_STYLE[status].label}
                            {isGiven && record?.givenDate && ` · ${formatDate(record.givenDate)}`}
                        </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        {item.vaccine}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                        بيحمي من: {item.protectsAgainst}
                    </p>
                </div>
            </div>

            {/* أزرار سريعه */}
            {!disabled && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                    {!isGiven && (
                        <button
                            type="button"
                            onClick={() => onSetStatus(item.id, 'given', getTodayDateKey())}
                            className="inline-flex items-center rounded-lg bg-success-600 text-white px-2.5 py-1 text-[11px] font-black hover:bg-success-700 transition"
                        >
                            ✓ اتاخد النهارده
                        </button>
                    )}
                    {isGiven && (
                        <button
                            type="button"
                            onClick={() => onSetStatus(item.id, 'pending')}
                            className="inline-flex items-center rounded-lg bg-white border border-slate-300 text-slate-700 px-2.5 py-1 text-[11px] font-bold hover:bg-slate-50 transition"
                        >
                            رجّع لمعلق
                        </button>
                    )}
                    {!isSkipped && (
                        <button
                            type="button"
                            onClick={() => onSetStatus(item.id, 'skipped')}
                            className="inline-flex items-center rounded-lg bg-white border border-slate-300 text-slate-600 px-2.5 py-1 text-[11px] font-bold hover:bg-slate-50 transition"
                        >
                            تخطّى
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowDetails((p) => !p)}
                        className="inline-flex items-center rounded-lg bg-white border border-slate-300 text-slate-600 px-2.5 py-1 text-[11px] font-bold hover:bg-slate-50 transition mr-auto"
                    >
                        {showDetails ? '▲ إخفاء التفاصيل' : '▼ تفاصيل إضافيه'}
                    </button>
                </div>
            )}

            {/* تفاصيل ممتده */}
            {showDetails && !disabled && (
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
                    {isGiven && (
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 mb-1">
                                تاريخ الإعطاء
                            </label>
                            <input
                                type="date"
                                value={record?.givenDate || ''}
                                onChange={(e) => onUpdate(item.id, { givenDate: e.target.value })}
                                className="w-full max-w-xs h-9 rounded-lg border-2 border-slate-200 bg-white px-2 text-xs font-bold focus:border-sky-400 focus:outline-none"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                            رقم التشغيله (Batch)
                        </label>
                        <input
                            type="text"
                            value={record?.batchNumber || ''}
                            onChange={(e) => onUpdate(item.id, { batchNumber: e.target.value })}
                            placeholder="اختياري"
                            className="w-full max-w-xs h-9 rounded-lg border-2 border-slate-200 bg-white px-2 text-xs font-bold focus:border-sky-400 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                            ملاحظات
                        </label>
                        <textarea
                            rows={2}
                            value={record?.notes || ''}
                            onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
                            maxLength={300}
                            placeholder="مثلاً: تم التأجيل بسبب حراره"
                            className="w-full rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-sky-400 focus:outline-none resize-none"
                        />
                    </div>
                </div>
            )}
        </li>
    );
};

export const VaccinationsList: React.FC<VaccinationsListProps> = ({
    dateOfBirth, vaccinations, disabled, onUpdate, onSetStatus,
}) => {
    // عمر الطفل بالشهور النهارده
    const currentAgeMonths = useMemo(
        () => calculateAgeInMonths(dateOfBirth, getTodayDateKey()),
        [dateOfBirth],
    );

    // تجميع التطعيمات: المتأخره + المستحقه أعلى، الباقي تحت
    const sortedSchedule = useMemo(() => {
        return [...EGYPTIAN_VACCINATION_SCHEDULE].sort((a, b) => a.ageMonths - b.ageMonths);
    }, []);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-800">
                    التطعيمات (جدول وزاره الصحه)
                </h4>
                {!dateOfBirth && (
                    <span className="text-[10px] sm:text-[11px] font-bold text-warning-700 bg-warning-50 border border-warning-200 rounded-full px-2 py-0.5">
                        سجل تاريخ الميلاد لمعرفه الموعد
                    </span>
                )}
            </div>

            <ul className="space-y-2">
                {sortedSchedule.map((item) => {
                    const record = vaccinations[item.id];
                    const timing = calculateVaccinationTiming(item.ageMonths, currentAgeMonths);
                    return (
                        <VaccineRow
                            key={item.id}
                            item={item}
                            record={record}
                            timing={timing}
                            disabled={Boolean(disabled)}
                            onSetStatus={onSetStatus}
                            onUpdate={onUpdate}
                        />
                    );
                })}
            </ul>
        </div>
    );
};
