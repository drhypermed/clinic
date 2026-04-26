/**
 * PatientCard — بطاقة عرض مريض واحد في قسم الدخل اليومي
 *
 * مستخرجة من `DailyRevenueSection.tsx` لتقليل حجمه.
 * تعرض: label + sublabel + amount + patientName + note + أزرار edit/delete.
 */

import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface PatientCardProps {
    label: string;
    sublabel?: string;
    amount: number;
    patientName?: string;
    note?: string;
    isInsurance?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
    label,
    sublabel,
    amount,
    patientName,
    note,
    isInsurance,
    onEdit,
    onDelete,
}) => (
    <div className={`rounded-xl border p-2.5 ${
        isInsurance ? 'bg-brand-50/50 border-brand-100' : 'bg-white border-slate-100'
    }`}>
        <div className="flex items-start justify-between gap-1">
            <p className={`text-[10px] font-bold truncate flex-1 min-w-0 ${
                isInsurance ? 'text-brand-600' : 'text-slate-500'
            }`}>
                {label}{sublabel ? <span className="font-normal opacity-70"> &middot; {sublabel}</span> : null}
            </p>
            {(onEdit || onDelete) && (
                <div className="flex items-center gap-1 shrink-0">
                    {onEdit && (
                        <button onClick={onEdit} className="w-5 h-5 rounded-md bg-brand-50 hover:bg-brand-100 flex items-center justify-center transition-colors" title="تعديل">
                            <svg className="w-3 h-3 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={onDelete} className="w-5 h-5 rounded-md bg-danger-50 hover:bg-danger-100 flex items-center justify-center transition-colors" title="حذف">
                            <svg className="w-3 h-3 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
        <p className="text-sm font-black text-slate-800 mt-0.5">{formatCurrency(amount)} <span className="text-[10px] font-bold opacity-60">ج.م</span></p>
        {(patientName || note) && (
            <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{note ? `${note} · ` : ''}{patientName ?? ''}</p>
        )}
    </div>
);

interface RevenueSectionProps {
    emoji?: string;
    title: React.ReactNode;
    children: React.ReactNode;
}

/** حاوية قسم دخل (عنوان أزرق + محتوى أبيض) */
export const RevenueSection: React.FC<RevenueSectionProps> = ({ emoji, title, children }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-brand-700 to-brand-600">
            {emoji && <span className="text-base">{emoji}</span>}
            <div className="text-sm font-black text-white flex-1 min-w-0">{title}</div>
        </div>
        <div className="p-3 space-y-2">
            {children}
        </div>
    </div>
);
