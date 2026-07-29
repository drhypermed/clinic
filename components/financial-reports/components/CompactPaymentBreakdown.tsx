import React from 'react';
import type { DirectPaymentTotals } from '../../../utils/paymentMethods';
import {
    DIRECT_PAYMENT_TYPES,
    getPaymentMethodShortLabel,
} from '../../../utils/paymentMethods';
import { formatCurrency } from '../utils/formatters';

interface CompactPaymentBreakdownProps {
    directPaymentTotals: DirectPaymentTotals;
    insuranceClaims?: number;
    tone?: 'light' | 'dark';
    className?: string;
}

/**
 * سطر صغير موحّد لتفصيل إجمالي الدخل حسب وسيلة الدفع.
 * نخفي الطرق ذات القيمة صفر لتظل كروت اليوم/الشهر مختصرة وواضحة.
 */
export const CompactPaymentBreakdown: React.FC<CompactPaymentBreakdownProps> = ({
    directPaymentTotals,
    insuranceClaims = 0,
    tone = 'light',
    className = '',
}) => {
    const entries = DIRECT_PAYMENT_TYPES
        .map<{ key: string; label: string; amount: number }>((type) => ({
            key: type,
            label: getPaymentMethodShortLabel(type),
            amount: Number(directPaymentTotals?.[type]) || 0,
        }))
        .filter((entry) => entry.amount > 0);

    const normalizedInsuranceClaims = Number(insuranceClaims) || 0;
    if (normalizedInsuranceClaims > 0) {
        entries.push({
            key: 'insurance',
            label: 'تأمين',
            amount: normalizedInsuranceClaims,
        });
    }

    if (entries.length === 0) return null;

    const textClass = tone === 'dark' ? 'text-white/85' : 'text-slate-500';
    const amountClass = tone === 'dark' ? 'text-white' : 'text-slate-700';

    return (
        <div
            className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[9px] leading-4 sm:text-[10px] ${textClass} ${className}`}
            aria-label="تفصيل الدخل حسب طريقة الدفع"
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
