// ─────────────────────────────────────────────────────────────────────────────
// applySnapshotToStats — استبدال أرقام useFinancialStats بقيم snapshot المغلق
// ─────────────────────────────────────────────────────────────────────────────
// الهدف: لما الشهر المعروض يكون "مغلق" (مر عليه 28 يوم بعد نهايته وحُفظ
// snapshot)، نستبدل القيم المحسوبة من السجلات الخام بالقيم الثابتة من
// الـsnapshot. كده:
//   1. الأرقام تفضل ثابتة حتى لو الطبيب عدّل سجل قديم.
//   2. مش لازم نقرأ كل السجلات — قراءة snapshot واحد كافية.
//
// الـapproach: post-processing بدون ما نعدّل useFinancialStats نفسه. نأخذ
// نتيجته (المحسوبة من records) ونـoverride الحقول الشهرية من snapshot. الحقول
// اليومية (chartDays, selectedDayStats) بنبنيها من snapshot.dailyBreakdown.
// ─────────────────────────────────────────────────────────────────────────────

import type { MonthlySnapshot, MonthlySnapshotDailyEntry } from '../../../services/financial-data/monthlySnapshots';
import type {
    UseFinancialStatsReturn,
    YearlyMonthData,
    ChartDay,
} from './useFinancialStats.shared';

/** أسماء أيام الأسبوع بالعربي للـchartDays. */
const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** entry فاضي = أصفار في كل الحقول (لو اليوم ما فيهوش بيانات في snapshot). */
const EMPTY_DAY_ENTRY: MonthlySnapshotDailyEntry = {
    exams: 0,
    consultations: 0,
    examsIncome: 0,
    consultsIncome: 0,
    collectedCash: 0,
    insuranceClaims: 0,
    discountExpense: 0,
    interventionsRevenue: 0,
    otherRevenue: 0,
    insuranceExtrasTotal: 0,
    dailyExpense: 0,
};

/** يبني chartDays من snapshot.dailyBreakdown — يدّي يوم لكل تاريخ في الشهر. */
const buildChartDaysFromSnapshot = (snapshot: MonthlySnapshot): ChartDay[] => {
    const [yearStr, monthStr] = snapshot.monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const monthZeroIndexed = parseInt(monthStr, 10) - 1;
    if (!Number.isFinite(year) || !Number.isFinite(monthZeroIndexed)) return [];
    const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
    const breakdown = snapshot.dailyBreakdown || {};

    const days: ChartDay[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`;
        const entry = breakdown[dateKey] || EMPTY_DAY_ENTRY;
        const dateObj = new Date(year, monthZeroIndexed, d);
        const income = entry.examsIncome
            + entry.consultsIncome
            + entry.interventionsRevenue
            + entry.otherRevenue
            + entry.insuranceExtrasTotal;
        days.push({
            date: dateKey,
            dayName: ARABIC_WEEKDAYS[dateObj.getDay()] || '',
            dayNum: d,
            exams: entry.exams,
            consultations: entry.consultations,
            examsIncome: entry.examsIncome,
            consultsIncome: entry.consultsIncome,
            interventions: entry.interventionsRevenue,
            other: entry.otherRevenue,
            expense: entry.dailyExpense,
            discountExpense: entry.discountExpense,
            income,
        });
    }
    return days;
};

/**
 * يطبّق snapshot الشهر المعروض على نتيجة useFinancialStats.
 *
 * - بنستبدل: monthStats, monthlyAdditionalRevenue, monthlyDailyExpenses,
 *   examsIncome, consultsIncome, totalIncome, collectedCash, insuranceClaims,
 *   monthlyDiscountExpense, totalExpenses, chartDays, selectedDayStats,
 *   dailyExamsIncome, dailyConsultsIncome, dailyTotalRevenue, dailyCollectedCash,
 *   dailyDiscountExpense.
 * - بنترك فاضي: selectedDayExamBreakdowns, selectedDayConsultBreakdowns
 *   (snapshot ما عندوش per-patient breakdown — الـUI بيعرض رسالة بدلاً منها).
 * - yearlyStats بنعدله بـapplyYearlySnapshotsToYearlyStats منفصلة.
 */
export const applyMonthSnapshotToStats = (
    liveStats: UseFinancialStatsReturn,
    snapshot: MonthlySnapshot,
    selectedDayKey: string,
): UseFinancialStatsReturn => {
    const breakdown = snapshot.dailyBreakdown || {};
    const selectedDayEntry = breakdown[selectedDayKey] || EMPTY_DAY_ENTRY;

    // chartDays من snapshot
    const chartDays = buildChartDaysFromSnapshot(snapshot);
    const maxDailyIncome = Math.max(...chartDays.map((d) => d.income), 1);

    // monthStats: نبني dailyBreakdown مبسط من snapshot
    const dailyBreakdownForMonth: Record<string, { exams: number; consultations: number }> = {};
    Object.entries(breakdown).forEach(([dateKey, entry]) => {
        dailyBreakdownForMonth[dateKey] = { exams: entry.exams, consultations: entry.consultations };
    });

    // إجمالي insuranceClaims = مطالبات الكشوف + insuranceExtras اليدوية
    const totalInsuranceClaims = snapshot.insuranceClaims + snapshot.insuranceExtrasTotal;

    // إجمالي collectedCash للشهر = collectedCash من الكشوف + interventionsRevenue + otherRevenue
    // (الإيرادات اليدوية كاش بطبيعتها)
    const totalCollectedCash = snapshot.collectedCash + snapshot.interventionsRevenue + snapshot.otherRevenue;

    // إجمالي اليوم المحدد
    const dailyCash = selectedDayEntry.collectedCash
        + selectedDayEntry.interventionsRevenue
        + selectedDayEntry.otherRevenue;
    const dailyTotalRevenue = selectedDayEntry.examsIncome
        + selectedDayEntry.consultsIncome
        + selectedDayEntry.interventionsRevenue
        + selectedDayEntry.otherRevenue
        + selectedDayEntry.insuranceExtrasTotal;

    return {
        ...liveStats,
        monthStats: {
            exams: snapshot.examsCount,
            consultations: snapshot.consultationsCount,
            dailyBreakdown: dailyBreakdownForMonth,
            collectedCash: totalCollectedCash,
            insuranceClaims: totalInsuranceClaims,
        },
        selectedDayStats: {
            exams: selectedDayEntry.exams,
            consultations: selectedDayEntry.consultations,
        },
        // breakdowns تفصيلية لمرضى يوم محدد — snapshot ما عندوش هذه التفاصيل.
        // الـUI ممكن يعرض رسالة "البيانات التفصيلية متاحة بالشهور المفتوحة فقط".
        selectedDayExamBreakdowns: [],
        selectedDayConsultBreakdowns: [],
        monthlyAdditionalRevenue: {
            interventions: snapshot.interventionsRevenue,
            other: snapshot.otherRevenue,
            total: snapshot.interventionsRevenue + snapshot.otherRevenue + snapshot.insuranceExtrasTotal,
        },
        monthlyDailyExpenses: snapshot.dailyExpensesTotal,
        chartDays,
        maxDailyIncome,
        // yearlyStats بيتم تعديله منفصلاً عبر applyYearlySnapshotsToYearlyStats.
        // يعني نسيبه على ما هو من liveStats هنا.
        yearlyStats: liveStats.yearlyStats,
        dailyExamsIncome: selectedDayEntry.examsIncome,
        dailyConsultsIncome: selectedDayEntry.consultsIncome,
        dailyTotalRevenue,
        dailyCollectedCash: dailyCash,
        dailyDiscountExpense: selectedDayEntry.discountExpense,
        examsIncome: snapshot.examsIncome,
        consultsIncome: snapshot.consultsIncome,
        totalIncome: snapshot.totalRevenue,
        collectedCash: totalCollectedCash,
        insuranceClaims: totalInsuranceClaims,
        monthlyDiscountExpense: snapshot.discountExpense,
        totalExpenses: snapshot.totalExpenses,
    };
};

/**
 * يستبدل أرقام yearlyStats للشهور اللي عندها snapshot. الشهور اللي ما عندهاش
 * snapshot (مفتوحة أو لم تُغلق بعد) تفضل بقيمها الـlive من records.
 */
export const applyYearlySnapshotsToYearlyStats = (
    yearlyStats: YearlyMonthData[],
    selectedYear: number,
    yearlySnapshots: Record<string, MonthlySnapshot>,
): YearlyMonthData[] => {
    if (!yearlyStats?.length) return yearlyStats;
    return yearlyStats.map((monthRow) => {
        // monthRow.month = 0-11
        const monthKey = `${selectedYear}-${String(monthRow.month + 1).padStart(2, '0')}`;
        const snapshot = yearlySnapshots[monthKey];
        if (!snapshot) return monthRow;
        const totalIncome = snapshot.examsIncome
            + snapshot.consultsIncome
            + snapshot.interventionsRevenue
            + snapshot.otherRevenue
            + snapshot.insuranceExtrasTotal;
        return {
            ...monthRow,
            exams: snapshot.examsCount,
            consultations: snapshot.consultationsCount,
            examsIncome: snapshot.examsIncome,
            consultsIncome: snapshot.consultsIncome,
            interventionsRevenue: snapshot.interventionsRevenue,
            otherRevenue: snapshot.otherRevenue,
            expenses: snapshot.totalExpenses,
            income: totalIncome,
        };
    });
};
