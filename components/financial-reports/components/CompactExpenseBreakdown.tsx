import React from 'react';
import {
    EXPENSE_BREAKDOWN_KEYS,
    type ExpenseBreakdown,
} from '../utils/expenseBreakdown';
import { formatCurrency } from '../utils/formatters';

interface CompactExpenseBreakdownProps {
    expenseBreakdown: ExpenseBreakdown;
    tone?: 'light' | 'dark';
    className?: string;
}

const EXPENSE_LABELS: Record<keyof ExpenseBreakdown, string> = {
    rent: 'إيجار',
    salaries: 'مرتبات',
    tools: 'أدوات',
    electricity: 'كهرباء',
    daily: 'يومية',
    other: 'أخرى',
    discounts: 'خصومات',
};

/** سطر صغير موحّد لتفصيل المصروفات مع إخفاء البنود ذات القيمة صفر. */
export const CompactExpenseBreakdown: React.FC<CompactExpenseBreakdownProps> = ({
    expenseBreakdown,
    tone = 'light',
    className = '',
}) => {
    const entries = EXPENSE_BREAKDOWN_KEYS
        .map((key) => ({
            key,
            label: EXPENSE_LABELS[key],
            amount: Number(expenseBreakdown?.[key]) || 0,
        }))
        .filter((entry) => entry.amount > 0);

    if (entries.length === 0) return null;

    const textClass = tone === 'dark' ? 'text-white/85' : 'text-slate-500';
    const amountClass = tone === 'dark' ? 'text-white' : 'text-slate-700';

    return (
        <div
            className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[9px] leading-4 sm:text-[10px] ${textClass} ${className}`}
            aria-label="تفصيل المصروفات حسب النوع"
        >
            {entries.map((entry) => (
                <span key={entry.key} className="inline-flex items-center gap-1 whitespace-nowrap font-bold">
                    <span>{entry.label}</span>
                    <span className={`font-black ${amountClass}`}>{formatCurrency(entry.amount, true)}</span>
                </span>
            ))}
        </div>
    );
};
