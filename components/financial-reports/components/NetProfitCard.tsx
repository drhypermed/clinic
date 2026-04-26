/**
 * مكون صافي الأرباح الشهرية
 * يعرض صافي الأرباح (الدخل - المصروفات)
 * 
 * Net profit card component
 * Displays net profit (income - expenses)
 */

import React from 'react';
import { formatCurrency } from '../utils/formatters';

// ─────────────────────────────────────────────────────────────────────────────
// الخصائص | Props
// ─────────────────────────────────────────────────────────────────────────────

interface NetProfitCardProps {
    /** إجمالي الدخل */
    totalIncome: number;
    /** إجمالي المصروفات */
    /** إجمالي المصروفات */
    totalExpenses: number;
    /** اسم الشهر الحالي */
    currentMonthLabel: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// المكون | Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * بطاقة صافي الأرباح الشهرية
 * 
 * يعرض:
 * - صافي الربح (أو الخسارة)
 * - لون أخضر للربح، أحمر للخسارة
 */
export const NetProfitCard: React.FC<NetProfitCardProps> = ({
    totalIncome,
    totalExpenses,
    currentMonthLabel,
}) => {
    const netProfit = totalIncome - totalExpenses;
    const isProfit = netProfit >= 0;

    return (
        <div className="rounded-2xl shadow-sm overflow-hidden">
            <div className={`flex items-center gap-2 px-4 py-3 ${
                isProfit ? 'bg-gradient-to-r from-brand-700 to-brand-600' : 'bg-gradient-to-r from-danger-600 to-danger-500'
            }`}>
                <span className="text-base">📊</span>
                <span className="text-sm font-black text-white">صافي الأرباح الشهرية</span>
                <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">{currentMonthLabel}</span>
            </div>

            <div className="bg-white p-4">
                <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white ${
                    isProfit ? 'bg-gradient-to-br from-brand-600 to-brand-700' : 'bg-gradient-to-br from-danger-600 to-danger-700'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="font-bold text-sm">{isProfit ? 'ربح' : 'خسارة'} الشهر</span>
                    </div>
                    <div className="text-2xl sm:text-4xl font-black mb-1 tracking-tight break-words">
                        {formatCurrency(netProfit)}
                    </div>
                    <div className="text-xs text-white/70 font-medium mt-1">
                        دخل {formatCurrency(totalIncome)} &mdash; مصروفات {formatCurrency(totalExpenses)}
                    </div>
                </div>
            </div>
        </div>
    );
};
