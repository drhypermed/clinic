/**
 * GrowthEntriesList — قائمه قياسات النمو + إضافه/تعديل/حذف
 *
 * بنعرض القياسات كجدول مدمج:
 *   التاريخ | العمر | وزن | طول | محيط الرأس | الفرق عن السابق | إجراءات
 *
 * الفرق عن القياس السابق بيتلوّن (أخضر=زياده، أحمر=نقصان، رمادي=ثابت).
 */

import React, { useMemo, useState } from 'react';
import {
    calculateDelta, formatChildAge,
} from '../../../services/specialty-packs/pediatrics';
import type { GrowthEntry } from '../../../services/specialty-packs/pediatrics';
import { GrowthEntryForm } from './GrowthEntryForm';

interface GrowthEntriesListProps {
    dateOfBirth?: string;
    entries: GrowthEntry[];
    disabled?: boolean;
    onAdd: (entry: Omit<GrowthEntry, 'id' | 'updatedAt'>) => void;
    onUpdate: (id: string, patch: Partial<GrowthEntry>) => void;
    onDelete: (id: string) => void;
}

const formatDate = (iso?: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

// أيقونه اتجاه + لون
const DELTA_STYLE = {
    up: { icon: '↑', cls: 'text-success-700 bg-success-50 border-success-200' },
    down: { icon: '↓', cls: 'text-danger-700 bg-danger-50 border-danger-200' },
    flat: { icon: '→', cls: 'text-slate-700 bg-slate-50 border-slate-200' },
} as const;

const renderDeltaBadge = (
    prev: string | undefined,
    curr: string | undefined,
    unit: string,
) => {
    const d = calculateDelta(prev, curr);
    if (!d) return null;
    const style = DELTA_STYLE[d.direction];
    const sign = d.delta > 0 ? '+' : '';
    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${style.cls}`}
        >
            {style.icon} {sign}
            {d.delta.toFixed(d.delta % 1 === 0 ? 0 : 1)}
            {unit}
        </span>
    );
};

export const GrowthEntriesList: React.FC<GrowthEntriesListProps> = ({
    dateOfBirth, entries, disabled, onAdd, onUpdate, onDelete,
}) => {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const editingEntry = useMemo(
        () => entries.find((e) => e.id === editingId) || null,
        [editingId, entries],
    );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-800">
                    قياسات النمو ({entries.length})
                </h4>
                {!adding && !editingEntry && !disabled && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 px-3 py-1.5 text-xs font-black text-white shadow-sm hover:from-sky-600 hover:to-sky-800 transition"
                    >
                        + إضافه قياس
                    </button>
                )}
            </div>

            {adding && (
                <GrowthEntryForm
                    dateOfBirth={dateOfBirth}
                    onSubmit={(e) => {
                        onAdd(e);
                        setAdding(false);
                    }}
                    onCancel={() => setAdding(false)}
                    submitLabel="حفظ القياس"
                />
            )}

            {editingEntry && (
                <GrowthEntryForm
                    dateOfBirth={dateOfBirth}
                    initialEntry={editingEntry}
                    onSubmit={(patch) => {
                        onUpdate(editingEntry.id, patch);
                        setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    submitLabel="حفظ التعديلات"
                />
            )}

            {entries.length === 0 && !adding && (
                <div className="rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/30 p-4 text-center text-xs font-bold text-slate-500">
                    مفيش قياسات لسه — اضغط "إضافه قياس" لتسجيل أول قياس.
                </div>
            )}

            {entries.length > 0 && (
                <ul className="space-y-2">
                    {entries.map((entry, idx) => {
                        if (entry.id === editingId) return null;
                        // القياس السابق (الأحدث منه — لأن القائمه من الأحدث للأقدم)
                        // الفرق بيظهر كـ"current - previous" يعني نشوف زياده/نقصان من السابق للحالي
                        const previousEntry = entries[idx + 1];
                        const ageLabel = formatChildAge(dateOfBirth, entry.dateKey);
                        return (
                            <li
                                key={entry.id}
                                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] font-black text-sky-700">
                                            {formatDate(entry.dateKey)}
                                        </span>
                                        {ageLabel && (
                                            <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                {ageLabel}
                                            </span>
                                        )}
                                    </div>
                                    {!disabled && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(entry.id)}
                                                className="text-[11px] font-bold text-brand-600 hover:text-brand-800 px-2 py-0.5 rounded"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const ok = window.confirm('هل تريد حذف هذا القياس؟');
                                                    if (ok) onDelete(entry.id);
                                                }}
                                                className="text-[11px] font-bold text-danger-600 hover:text-danger-800 px-2 py-0.5 rounded"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs">
                                    {entry.weightKg && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-500">وزن:</span>
                                            <span className="font-black text-slate-800">{entry.weightKg} كجم</span>
                                            {previousEntry && renderDeltaBadge(previousEntry.weightKg, entry.weightKg, 'كجم')}
                                        </div>
                                    )}
                                    {entry.heightCm && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-500">طول:</span>
                                            <span className="font-black text-slate-800">{entry.heightCm} سم</span>
                                            {previousEntry && renderDeltaBadge(previousEntry.heightCm, entry.heightCm, 'سم')}
                                        </div>
                                    )}
                                    {entry.headCircCm && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-500">محيط رأس:</span>
                                            <span className="font-black text-slate-800">{entry.headCircCm} سم</span>
                                            {previousEntry && renderDeltaBadge(previousEntry.headCircCm, entry.headCircCm, 'سم')}
                                        </div>
                                    )}
                                </div>

                                {entry.notes && (
                                    <p className="mt-2 pt-2 border-t border-slate-100 text-[11px] sm:text-xs text-slate-700">
                                        <span className="font-bold text-slate-500">ملاحظات: </span>
                                        {entry.notes}
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
