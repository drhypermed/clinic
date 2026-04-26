
import React from 'react';

interface DailyExpensesSectionProps {
    formattedSelectedDay: string;
    expenseValue: string;
    onUpdateExpense: (value: string) => void;
    discountExpense: number;
    totalDailyExpenses: number;
}

export const DailyExpensesSection: React.FC<DailyExpensesSectionProps> = ({
    formattedSelectedDay,
    expenseValue,
    onUpdateExpense,
    discountExpense,
    totalDailyExpenses,
}) => {
    return (
        <div className="rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-danger-600 to-danger-500">
                <span className="text-base">💸</span>
                <span className="text-sm font-black text-white">مصروفات اليوم</span>
                <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">{formattedSelectedDay}</span>
            </div>

            <div className="bg-white p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-danger-50 rounded-2xl p-4 border border-danger-100">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">💸</span>
                            <span className="text-base sm:text-lg font-black text-danger-800">مصروفات اليوم</span>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-danger-600">أدخل المبلغ</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={expenseValue}
                                    onChange={(e) => onUpdateExpense(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2 rounded-xl border-2 border-danger-200 focus:border-danger-500 focus:ring-2 focus:ring-danger-500/20 transition-all text-base font-black text-slate-800 text-center bg-white"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                    ج.م
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-warning-50 rounded-2xl p-4 border border-warning-100">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏷️</span>
                            <span className="text-base sm:text-lg font-black text-warning-800">خصومات اليوم</span>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-warning-600">محسوبة تلقائياً</label>
                            <div className="relative">
                                <div className="w-full px-3 py-2 rounded-xl border-2 border-warning-200 bg-warning-100/70 text-base font-black text-warning-900 text-center">
                                    {discountExpense.toFixed(2)}
                                </div>
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-warning-700 font-bold text-xs">
                                    ج.م
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-danger-50 rounded-xl p-3 border border-danger-200">
                        <span className="font-bold text-danger-700">💰 إجمالي مصروفات اليوم (يدوي + خصم)</span>
                        <span className="text-base sm:text-xl font-black text-danger-700 break-words">
                            {totalDailyExpenses.toFixed(2)} ج.م
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

