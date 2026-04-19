import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface MonthlyExpensesSectionProps {
    currentMonthLabel: string;
    rentExpense: string;
    onUpdateRent: (value: string) => void;
    salariesExpense: string;
    onUpdateSalaries: (value: string) => void;
    toolsExpense: string;
    onUpdateTools: (value: string) => void;
    electricityExpense: string;
    onUpdateElectricity: (value: string) => void;
    otherExpense: string;
    onUpdateOther: (value: string) => void;
    monthlyDailyExpenses: number;
    monthlyDiscountExpense: number;
    totalExpenses: number;
}

export const MonthlyExpensesSection: React.FC<MonthlyExpensesSectionProps> = ({
    currentMonthLabel,
    rentExpense,
    onUpdateRent,
    salariesExpense,
    onUpdateSalaries,
    toolsExpense,
    onUpdateTools,
    electricityExpense,
    onUpdateElectricity,
    otherExpense,
    onUpdateOther,
    monthlyDailyExpenses,
    monthlyDiscountExpense,
    totalExpenses,
}) => {
    return (
        <div className="rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-600 to-rose-500">
                <span className="text-base">💸</span>
                <span className="text-sm font-black text-white">المصروفات الشهرية</span>
                <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">{currentMonthLabel}</span>
            </div>

            <div className="bg-white p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            🏠 الإيجار
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={rentExpense}
                                onChange={(e) => onUpdateRent(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-base sm:text-lg font-black text-slate-800 text-center"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            👥 المرتبات
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={salariesExpense}
                                onChange={(e) => onUpdateSalaries(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-base sm:text-lg font-black text-slate-800 text-center"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            🔧 الأدوات
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={toolsExpense}
                                onChange={(e) => onUpdateTools(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-base sm:text-lg font-black text-slate-800 text-center"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            💡 الكهرباء
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={electricityExpense}
                                onChange={(e) => onUpdateElectricity(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-base sm:text-lg font-black text-slate-800 text-center"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            📦 أخرى
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={otherExpense}
                                onChange={(e) => onUpdateOther(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all text-base sm:text-lg font-black text-slate-800 text-center"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            📝 مصروفات أيام منفردة
                        </label>
                        <div className="relative">
                            <div className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-base sm:text-lg font-black text-slate-800 text-center break-words">
                                {formatCurrency(monthlyDailyExpenses)}
                            </div>
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 text-center">
                            محسوب تلقائياً من المصروفات اليومية
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            🏷️ خصومات الزيارات
                        </label>
                        <div className="relative">
                            <div className="w-full px-3 py-3 rounded-xl border-2 border-amber-200 bg-amber-100 text-base sm:text-lg font-black text-amber-900 text-center break-words">
                                {formatCurrency(monthlyDiscountExpense)}
                            </div>
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-700 font-bold text-xs">
                                ج.م
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 text-center">
                            محسوبة تلقائياً من المدفوعات بنوع خصم
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-rose-600 to-rose-500 rounded-xl p-3">
                        <span className="font-bold text-white">💰 إجمالي المصروفات الشهرية</span>
                        <span className="text-base sm:text-xl font-black text-white break-words">
                            {formatCurrency(totalExpenses)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

