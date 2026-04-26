/**
 * هيدر التقارير المالية — مدمج مع التبويبات وأدوات الاختيار الذكي
 *
 * يتضمن:
 * - زر العودة + عنوان الصفحة
 * - تبويبات (يومي / شهري / سنوي / الإعدادات)
 * - منتقي تاريخ ذكي يتغير حسب التبويب النشط
 */

import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// الأنواع | Types
// ─────────────────────────────────────────────────────────────────────────────

export type ReportTab = 'daily' | 'monthly' | 'yearly' | 'settings';

// ─────────────────────────────────────────────────────────────────────────────
// الخصائص | Props
// ─────────────────────────────────────────────────────────────────────────────

interface ReportsHeaderProps {
    onBack: () => void;

    // التبويب النشط | Active tab
    activeTab: ReportTab;
    onTabChange: (tab: ReportTab) => void;

    // للتبويب الشهري (من useFinancialNavigation)
    selectedYear: number;
    selectedMonth: number;              // 0-11
    onJumpToYearMonth: (year: number, month: number) => void;

    // للتبويب اليومي
    selectedDayStr: string;             // YYYY-MM-DD
    onSetDay: (dateStr: string) => void;

    // للتبويب السنوي (إحصائيات السنة — selectedYear المنفصل)
    selectedStatsYear: number;
    currentYear: number;
    onSetStatsYear: (year: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// الثوابت | Constants
// ─────────────────────────────────────────────────────────────────────────────

const ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const TABS: { key: ReportTab; label: string; icon: string }[] = [
    { key: 'daily',    label: 'يومي',      icon: '📅' },
    { key: 'monthly',  label: 'شهري',      icon: '📆' },
    { key: 'yearly',   label: 'سنوي',      icon: '📈' },
    { key: 'settings', label: 'الإعدادات', icon: '⚙️' },
];

// ─────────────────────────────────────────────────────────────────────────────
// المكون | Component
// ─────────────────────────────────────────────────────────────────────────────

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
    onBack,
    activeTab,
    onTabChange,
    selectedYear,
    selectedMonth,
    onJumpToYearMonth,
    selectedDayStr,
    onSetDay,
    selectedStatsYear,
    currentYear,
    onSetStatsYear,
}) => {
    const yearOptions = React.useMemo(
        () => Array.from({ length: Math.max(1, currentYear - 2019) }, (_, i) => currentYear - i),
        [currentYear]
    );

    const todayStr = React.useMemo(
        () => new Date().toISOString().split('T')[0],
        []
    );

    return (
        // توحيد مع الصفحات النظيفه (سجلات المرضى، ملفات المرضى): خلفيه بيضاء
        // بدل التدرّج الأزرق اللي كان بيخلّي الصفحه دي مختلفه عن باقي التطبيق.
        <div className="sticky top-0 z-10" dir="rtl">
            <div className="bg-white border-b border-slate-200 mx-2 rounded-b-2xl">

                {/* ── الشريط العلوي ────────────────────────────────── */}
                <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between gap-2 flex-wrap">

                    {/* العنوان — أيقونه رماديّه فاتحه + نص غامق */}
                    <div className="flex items-center gap-2 min-w-0 shrink-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h1 className="text-sm sm:text-base font-black text-slate-900">التقارير المالية</h1>
                    </div>

                    {/* منتقيات التاريخ — حدود رماديّه بدل البيضا على أزرق */}
                    <div className="flex items-center gap-1.5 flex-wrap">

                        {/* منتقي اليوم — التبويب اليومي */}
                        {activeTab === 'daily' && (
                            <input
                                type="date"
                                value={selectedDayStr}
                                max={todayStr}
                                onChange={(e) => onSetDay(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium
                                           text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                           outline-none cursor-pointer"
                            />
                        )}

                        {/* منتقي الشهر + السنة — التبويب الشهري */}
                        {activeTab === 'monthly' && (
                            <>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => onJumpToYearMonth(selectedYear, Number(e.target.value))}
                                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold
                                               text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                               outline-none cursor-pointer"
                                >
                                    {ARABIC_MONTHS.map((name, idx) => {
                                        const isFuture =
                                            selectedYear === currentYear && idx > new Date().getMonth();
                                        return (
                                            <option key={idx} value={idx} disabled={isFuture} className="text-slate-800 bg-white">
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>

                                <select
                                    value={selectedYear}
                                    onChange={(e) => onJumpToYearMonth(Number(e.target.value), selectedMonth)}
                                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold
                                               text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                               outline-none cursor-pointer"
                                >
                                    {yearOptions.map((y) => (
                                        <option key={y} value={y} className="text-slate-800 bg-white">{y}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {/* منتقي السنة — التبويب السنوي */}
                        {activeTab === 'yearly' && (
                            <select
                                value={selectedStatsYear}
                                onChange={(e) => onSetStatsYear(Number(e.target.value))}
                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold
                                           text-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                                           outline-none cursor-pointer"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y} className="text-slate-800 bg-white">{y}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* ── شريط التبويبات — التاب النشط أزرق، الباقي رمادي ─── */}
                <div className="flex px-2 pb-2 gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`flex-1 min-w-[64px] flex items-center justify-center gap-1 px-2 py-1.5
                                        font-black transition-all rounded-xl whitespace-nowrap
                                        ${activeTab === tab.key
                                    ? 'bg-brand-600 text-white shadow-sm text-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs'
                                }`}
                        >
                            <span className="text-sm leading-none">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
