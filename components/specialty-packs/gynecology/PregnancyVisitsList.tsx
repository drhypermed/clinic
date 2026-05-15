/**
 * PregnancyVisitsList — قائمه زيارات الحمل + إضافه/تعديل/حذف
 *
 * بنعرض كل زياره ككرت فيه: التاريخ، الأسبوع، الوزن، النبض، الحركه، الملاحظات.
 * تعديل = نفس الفورم بحقول معبّاه. حذف بيطلب تأكيد.
 */

import React, { useMemo, useState } from 'react';
import {
    formatGestationalAge,
    type PregnancyVisit,
} from '../../../services/specialty-packs/gynecology';
import { PregnancyVisitForm } from './PregnancyVisitForm';

interface PregnancyVisitsListProps {
    lmp?: string;
    defaultDateKey?: string;
    visits: PregnancyVisit[];
    disabled?: boolean;
    hideVitalsOverlap?: boolean;
    onAdd?: (visit: Omit<PregnancyVisit, 'id' | 'updatedAt'>) => void;
    onUpdate?: (id: string, patch: Partial<PregnancyVisit>) => void;
    onDelete?: (id: string) => void;
}

const formatDate = (iso?: string): string => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
};

const MOVEMENT_LABEL: Record<NonNullable<PregnancyVisit['fetalMovement']>, string> = {
    '': '',
    normal: 'حركه طبيعيه',
    decreased: 'حركه قليله',
    absent: 'حركه غايبه',
};

export const PregnancyVisitsList: React.FC<PregnancyVisitsListProps> = ({
    lmp, defaultDateKey, visits, disabled, hideVitalsOverlap = false, onAdd, onUpdate, onDelete,
}) => {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const editingVisit = useMemo(
        () => visits.find((v) => v.id === editingId) || null,
        [editingId, visits],
    );

    return (
        <div className="space-y-3">
            {/* ─ ترويسه + زر إضافه ─ */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-800">
                    زيارات الحمل ({visits.length})
                </h4>
                {!adding && !editingVisit && !disabled && onAdd && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-700 px-3 py-1.5 text-xs font-black text-white shadow-sm hover:from-pink-600 hover:to-pink-800 transition"
                    >
                        + إضافه زياره
                    </button>
                )}
            </div>

            {/* ─ فورم الإضافه ─ */}
            {adding && (
                <PregnancyVisitForm
                    lmp={lmp}
                    defaultDateKey={defaultDateKey}
                    hideVitalsOverlap={hideVitalsOverlap}
                    onSubmit={(visit) => {
                        onAdd?.(visit);
                        setAdding(false);
                    }}
                    onCancel={() => setAdding(false)}
                    submitLabel="حفظ الزياره"
                />
            )}

            {/* ─ فورم التعديل ─ */}
            {editingVisit && onUpdate && (
                <PregnancyVisitForm
                    lmp={lmp}
                    initialVisit={editingVisit}
                    hideVitalsOverlap={hideVitalsOverlap}
                    onSubmit={(patch) => {
                        onUpdate(editingVisit.id, patch);
                        setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    submitLabel="حفظ التعديلات"
                />
            )}

            {/* ─ قائمه الزيارات ─ */}
            {visits.length === 0 && !adding && (
                <div className="rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 p-4 text-center text-xs font-bold text-slate-500">
                    {disabled
                        ? 'مفيش زيارات حمل مسجله لسه. الزيارات الجديده تتسجل من كشف جديد.'
                        : onAdd
                            ? 'مفيش زيارات حمل لسه — اضغط "إضافه زياره" لتسجيل أول زياره.'
                            : 'مفيش زيارات حمل مسجله لسه.'}
                </div>
            )}

            {visits.length > 0 && (
                <ul className="space-y-2">
                    {visits.map((v) => {
                        if (v.id === editingId) return null;
                        const ageLabel = v.gestationalWeek
                            ? `${v.gestationalWeek} أسبوع`
                            : formatGestationalAge(lmp, v.dateKey);
                        const movementText = v.fetalMovement
                            ? MOVEMENT_LABEL[v.fetalMovement]
                            : '';
                        return (
                            <li
                                key={v.id}
                                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                            >
                                {/* ─ صف عناوين ─ */}
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="inline-flex items-center rounded-full bg-pink-50 border border-pink-200 px-2 py-0.5 text-[11px] font-black text-pink-700">
                                            {formatDate(v.dateKey)}
                                        </span>
                                        {ageLabel && (
                                            <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                {ageLabel}
                                            </span>
                                        )}
                                    </div>
                                    {!disabled && (onUpdate || onDelete) && (
                                        <div className="flex items-center gap-1">
                                            {onUpdate && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(v.id)}
                                                    className="text-[11px] font-bold text-brand-600 hover:text-brand-800 px-2 py-0.5 rounded"
                                                >
                                                    تعديل
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const ok = window.confirm(
                                                            'هل تريد حذف هذه الزياره؟ لا يمكن التراجع.',
                                                        );
                                                        if (ok) onDelete(v.id);
                                                    }}
                                                    className="text-[11px] font-bold text-danger-600 hover:text-danger-800 px-2 py-0.5 rounded"
                                                >
                                                    حذف
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* ─ القياسات ─ */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs">
                                    {v.fetalWeight && (
                                        <div>
                                            <span className="font-bold text-slate-500">وزن الجنين: </span>
                                            <span className="font-black text-slate-800">
                                                {v.fetalWeight} جم
                                            </span>
                                        </div>
                                    )}
                                    {v.fetalHeartRate && (
                                        <div>
                                            <span className="font-bold text-slate-500">نبض: </span>
                                            <span className="font-black text-slate-800">
                                                {v.fetalHeartRate} BPM
                                            </span>
                                        </div>
                                    )}
                                    {movementText && (
                                        <div>
                                            <span className="font-bold text-slate-500">حركه: </span>
                                            <span className="font-black text-slate-800">
                                                {movementText}
                                            </span>
                                        </div>
                                    )}
                                    {v.maternalWeight && (
                                        <div>
                                            <span className="font-bold text-slate-500">وزن الأم: </span>
                                            <span className="font-black text-slate-800">
                                                {v.maternalWeight} كجم
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* ─ ملاحظات السونار + الزياره ─ */}
                                {(v.ultrasoundNotes || v.notes) && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                        {v.ultrasoundNotes && (
                                            <p className="text-[11px] sm:text-xs text-slate-700">
                                                <span className="font-bold text-slate-500">سونار: </span>
                                                {v.ultrasoundNotes}
                                            </p>
                                        )}
                                        {v.notes && (
                                            <p className="text-[11px] sm:text-xs text-slate-700">
                                                <span className="font-bold text-slate-500">ملاحظات: </span>
                                                {v.notes}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
