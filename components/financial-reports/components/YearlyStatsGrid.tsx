import React from 'react';
import type { YearlyMonthData } from '../hooks/useFinancialStats';
import { formatCurrency } from '../utils/formatters';

interface YearlyStatsGridProps {
    currentYear: number;
    yearlyStats: YearlyMonthData[];
    currentMonth: number;
    isCurrentYear: boolean;
}

export const YearlyStatsGrid: React.FC<YearlyStatsGridProps> = ({
    currentYear,
    yearlyStats,
    currentMonth,
    isCurrentYear,
}) => {
    const maxIncome = Math.max(...yearlyStats.map((month) => month.income), 1);

    const yearTotals = yearlyStats.reduce(
        (acc, month) => ({
            exams: acc.exams + month.exams,
            consultations: acc.consultations + month.consultations,
            examsIncome: acc.examsIncome + month.examsIncome,
            consultsIncome: acc.consultsIncome + month.consultsIncome,
            interventionsRevenue: acc.interventionsRevenue + month.interventionsRevenue,
            otherRevenue: acc.otherRevenue + month.otherRevenue,
            income: acc.income + month.income,
            expenses: acc.expenses + month.expenses,
            netProfit: acc.netProfit + (month.income - month.expenses)
        }),
        {
            exams: 0,
            consultations: 0,
            examsIncome: 0,
            consultsIncome: 0,
            interventionsRevenue: 0,
            otherRevenue: 0,
            income: 0,
            expenses: 0,
            netProfit: 0
        }
    );

    return (
        <div className="rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-700 to-brand-600">
                <span className="text-base">📈</span>
                <span className="text-sm font-black text-white">إحصائيات السنة</span>
                <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">سنة {currentYear}</span>
            </div>

            <div className="bg-white p-4">
                <div className="bg-brand-600 rounded-2xl p-4 mb-4">
                    <div className="text-center mb-3">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-black text-white">
                            إجمالي سنة {currentYear}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">الكشوفات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{yearTotals.exams}</div>
                            <div className="text-sm font-bold text-brand-100">{formatCurrency(yearTotals.examsIncome, true)}</div>
                        </div>

                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">الاستشارات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{yearTotals.consultations}</div>
                            <div className="text-sm font-bold text-brand-100">{formatCurrency(yearTotals.consultsIncome, true)}</div>
                        </div>

                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">التداخلات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">
                                {formatCurrency(yearTotals.interventionsRevenue, true)}
                            </div>
                        </div>

                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">دخل آخر</div>
                            <div className="text-xl sm:text-2xl font-black text-white">
                                {formatCurrency(yearTotals.otherRevenue, true)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-success-500/80 rounded-xl p-3 text-center">
                            <div className="text-xs text-white font-bold">إجمالي الدخل</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(yearTotals.income, true)}</div>
                        </div>

                        <div className="bg-danger-500/80 rounded-xl p-3 text-center">
                            <div className="text-xs text-white font-bold">المصروفات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(yearTotals.expenses, true)}</div>
                        </div>

                        <div
                            className={`rounded-xl p-3 text-center ${
                                yearTotals.netProfit >= 0 ? 'bg-white/20' : 'bg-danger-600/80'
                            }`}
                        >
                            <div className="text-xs text-white font-bold">
                                {yearTotals.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-white">
                                {formatCurrency(Math.abs(yearTotals.netProfit), true)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3">
                    {yearlyStats.map((monthData, idx) => {
                        const isPastOrCurrent = !isCurrentYear || monthData.month <= currentMonth;
                        const isCurrentMonth = isCurrentYear && monthData.month === currentMonth;
                        const netProfit = monthData.income - monthData.expenses;
                        const incomePercent = maxIncome > 0 ? Math.round((monthData.income / maxIncome) * 100) : 0;

                        return (
                            <div
                                key={idx}
                                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 ${
                                    isCurrentMonth
                                        ? 'border-brand-400 shadow-lg ring-2 ring-brand-200'
                                        : isPastOrCurrent
                                          ? 'border-slate-200 shadow-md'
                                          : 'border-slate-200 opacity-50'
                                }`}
                            >
                                <div
                                    className={`px-3 py-2.5 text-center ${
                                        isCurrentMonth
                                            ? 'bg-brand-600'
                                            : isPastOrCurrent
                                              ? 'bg-slate-700'
                                              : 'bg-slate-300'
                                    }`}
                                >
                                    <span
                                        className={`font-black text-base sm:text-lg ${
                                            isPastOrCurrent ? 'text-white' : 'text-slate-600'
                                        }`}
                                    >
                                        {monthData.label}
                                    </span>
                                </div>

                                <div className={`p-3 ${isCurrentMonth ? 'bg-brand-50' : 'bg-white'}`}>
                                    <div className="space-y-2 text-[11px] sm:text-xs">
                                        <div className="flex items-center justify-between gap-2 bg-brand-100 px-2 py-1.5 rounded-lg">
                                            <span className="text-brand-700 font-bold whitespace-nowrap">
                                                الكشوفات (
                                                <span className="text-brand-900" dir="ltr">{monthData.exams}</span>
                                                )
                                            </span>
                                            <span className="font-black text-brand-800 whitespace-nowrap text-left">
                                                {formatCurrency(monthData.examsIncome, true)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 bg-brand-50 px-2 py-1.5 rounded-lg">
                                            <span className="text-brand-700 font-bold whitespace-nowrap">
                                                الاستشارات (
                                                <span className="text-brand-900" dir="ltr">{monthData.consultations}</span>
                                                )
                                            </span>
                                            <span className="font-black text-brand-800 whitespace-nowrap text-left">
                                                {formatCurrency(monthData.consultsIncome, true)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 bg-slate-50 px-2 py-1.5 rounded-lg">
                                            <span className="text-slate-700 font-bold whitespace-nowrap">التداخلات</span>
                                            <span className="font-black text-slate-800 whitespace-nowrap text-left">
                                                {formatCurrency(monthData.interventionsRevenue, true)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 bg-brand-50 px-2 py-1.5 rounded-lg">
                                            <span className="text-brand-700 font-bold whitespace-nowrap">دخل آخر</span>
                                            <span className="font-black text-brand-800 whitespace-nowrap text-left">
                                                {formatCurrency(monthData.otherRevenue, true)}
                                            </span>
                                        </div>

                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-success-400 to-success-500 rounded-full transition-all duration-500"
                                                style={{ width: `${incomePercent}%` }}
                                            />
                                        </div>

                                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                                            <div className="flex items-center justify-between gap-2 bg-success-50 px-2 py-1.5 rounded-lg">
                                                <span className="text-success-700 font-bold whitespace-nowrap">الدخل</span>
                                                <span className="font-black text-success-800 whitespace-nowrap text-left">
                                                    {formatCurrency(monthData.income, true)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 bg-danger-50 px-2 py-1.5 rounded-lg">
                                                <span className="text-danger-700 font-bold whitespace-nowrap">المصروفات</span>
                                                <span className="font-black text-danger-800 whitespace-nowrap text-left">
                                                    {formatCurrency(monthData.expenses, true)}
                                                </span>
                                            </div>

                                            <div
                                                className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                                                    netProfit >= 0 ? 'bg-brand-100' : 'bg-danger-100'
                                                }`}
                                            >
                                                <span className={`font-bold whitespace-nowrap ${netProfit >= 0 ? 'text-brand-700' : 'text-danger-700'}`}>
                                                    الصافي
                                                </span>
                                                <span
                                                    className={`font-black whitespace-nowrap text-left ${
                                                        netProfit >= 0 ? 'text-brand-900' : 'text-danger-900'
                                                    }`}
                                                >
                                                    {formatCurrency(netProfit, true)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
