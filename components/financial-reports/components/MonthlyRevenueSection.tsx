import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface MonthlyRevenueSectionProps {
    currentMonthLabel: string;
    examsIncome: number;
    examsCount: number;
    consultsIncome: number;
    consultationsCount: number;
    interventionsLabel: string;
    interventionsIncome: number;
    otherLabel: string;
    otherIncome: number;
    totalIncome: number;
    collectedCash?: number;
    insuranceClaims?: number;
}

export const MonthlyRevenueSection: React.FC<MonthlyRevenueSectionProps> = ({
    currentMonthLabel,
    examsIncome,
    examsCount,
    consultsIncome,
    consultationsCount,
    interventionsLabel,
    interventionsIncome,
    otherLabel,
    otherIncome,
    totalIncome,
    collectedCash,
    insuranceClaims,
}) => {
    // المسميات بتوصل مُنظّفة من services/financial-data/labels.ts (auto-migration)
    const displayInterventionsLabel = (interventionsLabel || '').trim() || 'التداخلات';
    const displayOtherLabel = (otherLabel || '').trim() || 'دخل آخر';

    return (
        <div className="rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-600">
                <span className="text-base">💰</span>
                <span className="text-sm font-black text-white">الإيرادات الشهرية</span>
                <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">{currentMonthLabel}</span>
            </div>

            <div className="bg-white p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">الكشوفات</label>
                        <div className="bg-blue-50 rounded-xl border-2 border-blue-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-blue-700 text-center break-words">
                                {formatCurrency(examsIncome)}
                            </div>
                            <div className="text-xs text-center text-blue-500 font-bold mt-1">
                                {examsCount} كشف
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">الاستشارات</label>
                        <div className="bg-indigo-50 rounded-xl border-2 border-indigo-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-indigo-700 text-center break-words">
                                {formatCurrency(consultsIncome)}
                            </div>
                            <div className="text-xs text-center text-indigo-500 font-bold mt-1">
                                {consultationsCount} استشارة
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">{displayInterventionsLabel}</label>
                        <div className="bg-purple-50 rounded-xl border-2 border-purple-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-purple-700 text-center break-words">
                                {formatCurrency(interventionsIncome)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700">{displayOtherLabel}</label>
                        <div className="bg-teal-50 rounded-xl border-2 border-teal-100 p-3 flex-1 flex flex-col justify-center">
                            <div className="text-base sm:text-lg font-black text-teal-700 text-center break-words">
                                {formatCurrency(otherIncome)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl p-3">
                        <span className="font-bold text-white">💰 إجمالي الدخل الشهري</span>
                        <span className="text-base sm:text-xl font-black text-white break-words">
                            {formatCurrency(totalIncome)}
                        </span>
                    </div>
                    {totalIncome > 0 && (collectedCash !== undefined || insuranceClaims !== undefined) && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl px-3 py-2.5">
                                <span className="text-sm font-bold text-white">💵 نقد محصّل</span>
                                <span className="text-sm font-black text-white">{formatCurrency(collectedCash ?? totalIncome)}</span>
                            </div>
                            {(insuranceClaims ?? 0) > 0 && (
                                <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl px-3 py-2.5">
                                    <span className="text-sm font-bold text-white">🏢 مطالبات تأمين</span>
                                    <span className="text-sm font-black text-white">{formatCurrency(insuranceClaims ?? 0)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

