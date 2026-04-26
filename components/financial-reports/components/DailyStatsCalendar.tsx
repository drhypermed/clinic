import React from 'react';
import type { ChartDay } from '../hooks/useFinancialStats';
import { formatCurrency } from '../utils/formatters';

interface DailyStatsCalendarProps {
    currentMonthLabel: string;
    chartDays: ChartDay[];
    maxDailyIncome: number;
    selectedDayKey: string;
    currentDateKey: string;
    onSelectDay: (date: Date) => void;
    totalMonthlyExpenses: number;
}

export const DailyStatsCalendar: React.FC<DailyStatsCalendarProps> = ({
    currentMonthLabel,
    chartDays,
    maxDailyIncome,
    totalMonthlyExpenses,
}) => {
    const monthTotals = chartDays.reduce((acc, day) => ({
        exams: acc.exams + day.exams,
        consultations: acc.consultations + day.consultations,
        examsIncome: acc.examsIncome + day.examsIncome,
        consultsIncome: acc.consultsIncome + day.consultsIncome,
        interventions: acc.interventions + day.interventions,
        other: acc.other + day.other,
        income: acc.income + day.income
    }), { exams: 0, consultations: 0, examsIncome: 0, consultsIncome: 0, interventions: 0, other: 0, income: 0 });

    const netProfit = monthTotals.income - totalMonthlyExpenses;
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-700 to-brand-600">
                <span className="text-base">📅</span>
                <span className="text-sm font-black text-white">إحصائيات أيام الشهر</span>
                <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">{currentMonthLabel}</span>
            </div>

            <div className="bg-white p-4">
                <div className="bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-4 mb-4">
                    <div className="text-center mb-3">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-black text-white">
                            إجمالي الشهر {currentMonthLabel}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">الكشوفات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{monthTotals.exams}</div>
                            <div className="text-sm font-bold text-brand-100">{formatCurrency(monthTotals.examsIncome, true)}</div>
                        </div>
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">الاستشارات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{monthTotals.consultations}</div>
                            <div className="text-sm font-bold text-brand-100">{formatCurrency(monthTotals.consultsIncome, true)}</div>
                        </div>
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">التدخلات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(monthTotals.interventions, true)}</div>
                        </div>
                        <div className="bg-white/15 rounded-xl p-3 text-center">
                            <div className="text-xs text-brand-100 font-bold">دخل آخر</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(monthTotals.other, true)}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-success-500/80 rounded-xl p-3 text-center">
                            <div className="text-xs text-white font-bold">إجمالي الدخل</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(monthTotals.income, true)}</div>
                        </div>
                        <div className="bg-danger-500/80 rounded-xl p-3 text-center">
                            <div className="text-xs text-white font-bold">المصروفات</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(totalMonthlyExpenses, true)}</div>
                        </div>
                        <div className={`rounded-xl p-3 text-center ${netProfit >= 0 ? 'bg-white/20' : 'bg-danger-600/80'}`}>
                            <div className="text-xs text-white font-bold">{netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}</div>
                            <div className="text-xl sm:text-2xl font-black text-white">{formatCurrency(Math.abs(netProfit), true)}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3">
                    {chartDays.map((day, idx) => {
                        const isToday = day.date === todayKey;
                        const isFuture = day.date > todayKey;
                        const isPastOrToday = !isFuture;
                        const examsIncome = day.examsIncome;
                        const consultsIncome = day.consultsIncome;
                        const incomePercent = maxDailyIncome > 0 ? Math.round((day.income / maxDailyIncome) * 100) : 0;
                        const netDayProfit = day.income - day.expense;

                        return (
                            <div
                                key={idx}
                                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 ${
                                    isToday
                                        ? 'border-brand-400 shadow-lg ring-2 ring-brand-200'
                                        : isPastOrToday
                                            ? 'border-slate-200 shadow-md'
                                            : 'border-slate-200 opacity-50'
                                }`}
                            >
                                <div className={`px-3 py-2.5 text-center ${
                                    isToday
                                        ? 'bg-gradient-to-r from-brand-600 to-brand-700'
                                        : isPastOrToday
                                            ? 'bg-slate-700'
                                            : 'bg-slate-300'
                                }`}>
                                    <span className={`font-black text-base sm:text-lg ${isPastOrToday ? 'text-white' : 'text-slate-600'}`}>
                                        {day.dayNum} - {day.dayName}
                                    </span>
                                </div>

                                <div className={`p-3 ${isToday ? 'bg-brand-50' : 'bg-white'}`}>
                                    <div className="space-y-2 text-[11px] sm:text-xs">
                                        <div className="flex items-center justify-between gap-2 bg-brand-100 px-2 py-1.5 rounded-lg">
                                            <span className="text-brand-700 font-bold whitespace-nowrap">
                                                الكشوفات (
                                                <span className="text-brand-900" dir="ltr">{day.exams}</span>
                                                )
                                            </span>
                                            <span className="font-black text-brand-800 whitespace-nowrap text-left">
                                                {formatCurrency(examsIncome, true)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 bg-brand-50 px-2 py-1.5 rounded-lg">
                                            <span className="text-brand-700 font-bold whitespace-nowrap">
                                                الاستشارات (
                                                <span className="text-brand-900" dir="ltr">{day.consultations}</span>
                                                )
                                            </span>
                                            <span className="font-black text-brand-800 whitespace-nowrap text-left">
                                                {formatCurrency(consultsIncome, true)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 bg-slate-50 px-2 py-1.5 rounded-lg">
                                            <span className="text-slate-700 font-bold whitespace-nowrap">التدخلات</span>
                                            <span className="font-black text-slate-800 whitespace-nowrap text-left">{formatCurrency(day.interventions, true)}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 bg-brand-100 px-2 py-1.5 rounded-lg">
                                            <span className="text-brand-700 font-bold whitespace-nowrap">دخل آخر</span>
                                            <span className="font-black text-brand-800 whitespace-nowrap text-left">{formatCurrency(day.other, true)}</span>
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
                                                <span className="font-black text-success-800 whitespace-nowrap text-left">{formatCurrency(day.income, true)}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 bg-danger-50 px-2 py-1.5 rounded-lg">
                                                <span className="text-danger-700 font-bold whitespace-nowrap">المصروفات</span>
                                                <span className="font-black text-danger-800 whitespace-nowrap text-left">{formatCurrency(day.expense, true)}</span>
                                            </div>
                                            <div className={`flex items-center justify-between gap-2 p-2 rounded-lg ${netDayProfit >= 0 ? 'bg-brand-50' : 'bg-danger-100'}`}>
                                                <span className={`font-bold whitespace-nowrap ${netDayProfit >= 0 ? 'text-brand-700' : 'text-danger-700'}`}>الصافي</span>
                                                <span className={`font-black whitespace-nowrap text-left ${netDayProfit >= 0 ? 'text-brand-900' : 'text-danger-900'}`}>
                                                    {formatCurrency(netDayProfit, true)}
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

