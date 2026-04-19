// ─────────────────────────────────────────────────────────────────────────────
// قائد العمليات المالية (FinancialPanel)
// ─────────────────────────────────────────────────────────────────────────────
// المكون المركزي لإدارة التدفقات النقدية والسياسات السعرية للنظام:
//   1) محرك الإيرادات: يحسب الدخل آلياً بناءً على اشتراكات الأطباء وخططهم.
//   2) نظام التسعير المرن: يتيح تغيير أسعار الباقات لكل شهر وتتبع تاريخ التغييرات.
//   3) مراقبة المصروفات: واجهة لإدخال وتصنيف تكاليف التشغيل الشهرية.
//   4) الربحية والنمو: يستنتج صافي الربح ويعرض ملخصات سنوية.
//   5) أمان البيانات: التعديلات تتم فقط بواسطة مسؤولين مصرح لهم.
//
// بعد التقسيم: المكون ده بقى مسؤول عن العرض فقط (JSX + derived state).
//   - كل التحميل والحفظ في useFinancialData.ts
//   - حساب الإيراد النقي في revenueCalculator.ts
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import type { Totals, YearlyStats } from './types';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { LoadingText } from '../../ui/LoadingText';
import { ExpenseSection } from './ExpenseSection';
import { MonthlyRevenueTable } from './MonthlyRevenueTable';
import { PricingSection } from './PricingSection';
import { TotalsCards } from './TotalsCards';
import { ViewControls } from './ViewControls';
import { YearlyRevenueTable } from './YearlyRevenueTable';
import { FinancialViewMode } from '../../../types';
import { getCairoDateParts } from '../../../utils/cairoTime';
import { useFinancialData } from './useFinancialData';

export const FinancialPanel: React.FC = () => {
  const { user } = useAuth();
  const isAdminUser = useIsAdmin(user);

  // توقيت القاهرة لتحديد الشهر الحالي بدقة (لا UTC)
  const cairoNowParts = getCairoDateParts(new Date());
  const currentMonth = `${cairoNowParts.year}-${String(cairoNowParts.month).padStart(2, '0')}`;

  // ── حالة الواجهة (UI-only state) ──
  const [selectedPriceMonth, setSelectedPriceMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState(() => {
    // السنة الافتراضية هي الحالية (أو 2026 كحد أدنى)
    const year = cairoNowParts.year;
    return Math.max(year, 2026);
  });
  const [viewMode, setViewMode] = useState<FinancialViewMode>('yearly');

  // ── استيراد كل البيانات والعمليات من الـ hook ──
  const {
    prices, tempPrices, setTempPrices, editingPrices, setEditingPrices,
    allMonthlyPrices, showPriceHistory, setShowPriceHistory,
    expenses, newExpense, setNewExpense,
    revenueData, currentYearSummary, doctorsMissingExpiry,
    loading,
    currentCalendarYear, financialStartYear,
    savePrices, saveExpense,
  } = useFinancialData({ isAdminUser, selectedYear, viewMode, selectedPriceMonth });

  // ── قيم مستنتجة من البيانات (derived) — خفيفة جداً، تبقى في المكون ──

  /** حساب إجماليات السنة: الإيراد، المصروفات، الربح الصافي. */
  const getTotals = (): Totals => {
    // للسنة الحالية في العرض السنوي: استخدم الملخص المخزن (أسرع وأدق)
    const canUseSummaryTotals =
      selectedYear === currentCalendarYear && viewMode === 'yearly' && !!currentYearSummary;
    const totalRevenue = canUseSummaryTotals
      ? currentYearSummary?.totalRevenue || 0
      : revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalExpenses = expenses
      .filter((expense) => expense.month.startsWith(selectedYear.toString()))
      .reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return { totalRevenue, totalExpenses, netProfit };
  };

  /** إحصائيات سنوية تفصيلية (عدد الاشتراكات لكل خطة + الأرقام المالية). */
  const getYearlyStats = (): YearlyStats => {
    const canUseSummaryTotals =
      selectedYear === currentCalendarYear && viewMode === 'yearly' && !!currentYearSummary;
    const monthlyCount = canUseSummaryTotals
      ? currentYearSummary?.monthlyCount || 0
      : revenueData.reduce((sum, item) => sum + item.monthlyCount, 0);
    const sixMonthsCount = canUseSummaryTotals
      ? currentYearSummary?.sixMonthsCount || 0
      : revenueData.reduce((sum, item) => sum + item.sixMonthsCount, 0);
    const yearlyCount = canUseSummaryTotals
      ? currentYearSummary?.yearlyCount || 0
      : revenueData.reduce((sum, item) => sum + item.yearlyCount, 0);
    const totalRevenue = canUseSummaryTotals
      ? currentYearSummary?.totalRevenue || 0
      : revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalExpenses = expenses
      .filter((expense) => expense.month.startsWith(selectedYear.toString()))
      .reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return { monthlyCount, sixMonthsCount, yearlyCount, totalRevenue, totalExpenses, netProfit };
  };

  // مصفوفة السنوات المتاحة للاختيار (من بداية العمليات لغاية السنة الحالية)
  const availableYears = Array.from(
    { length: currentCalendarYear - financialStartYear + 1 },
    (_, index) => financialStartYear + index
  );

  const totals = getTotals();
  const yearlyStats = getYearlyStats();

  // ── حالات المنع: رسالة أمان أو تحميل ──

  if (!isAdminUser) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-200">
        غير مصرح لك بالوصول إلى الإدارة المالية.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-white text-xl"><LoadingText>جاري التحميل</LoadingText></div>
      </div>
    );
  }

  // ── الواجهة الرئيسية ──

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-black text-white mb-8 dh-stagger-1">💰 الإدارة المالية</h2>

      <div className="dh-stagger-2"><PricingSection
        selectedPriceMonth={selectedPriceMonth}
        prices={prices}
        tempPrices={tempPrices}
        editingPrices={editingPrices}
        showPriceHistory={showPriceHistory}
        allMonthlyPrices={allMonthlyPrices}
        onTogglePriceHistory={() => setShowPriceHistory((prev) => !prev)}
        onStartEditingPrices={() => setEditingPrices(true)}
        onCancelEditingPrices={() => {
          setEditingPrices(false);
          setTempPrices(prices);
        }}
        onSavePrices={savePrices}
        onChangeSelectedPriceMonth={setSelectedPriceMonth}
        onChangeTempPrices={setTempPrices}
      /></div>

      <div className="dh-stagger-3"><ExpenseSection
        newExpense={newExpense}
        onChangeNewExpense={setNewExpense}
        onSaveExpense={saveExpense}
      /></div>

      <div className="dh-stagger-4"><TotalsCards totals={totals} selectedYear={selectedYear} /></div>

      {/* تحذير للأدمن: بيانات اشتراك ناقصة قد تؤثر على دقة الإيراد */}
      {doctorsMissingExpiry > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
          ⚠️ يوجد {doctorsMissingExpiry.toLocaleString('ar-EG')} طبيب Premium في سنة {selectedYear} ببيانات اشتراك ناقصة (بدون تاريخ انتهاء). تم استبعادهم من حساب الإيراد لهذه السنة. يُرجى تصحيح بياناتهم من "إدارة الأطباء".
        </div>
      )}

      <div className="dh-stagger-5"><ViewControls
        selectedYear={selectedYear}
        availableYears={availableYears}
        viewMode={viewMode}
        onChangeSelectedYear={setSelectedYear}
        onChangeViewMode={setViewMode}
      /></div>

      {viewMode === 'monthly' && (
        <div className="dh-stagger-6">
          <MonthlyRevenueTable revenueData={revenueData} expenses={expenses} />
        </div>
      )}

      {viewMode === 'yearly' && (
        <div className="dh-stagger-6">
          <YearlyRevenueTable selectedYear={selectedYear} yearlyStats={yearlyStats} />
        </div>
      )}
    </div>
  );
};
