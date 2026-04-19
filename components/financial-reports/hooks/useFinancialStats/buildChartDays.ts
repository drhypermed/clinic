/**
 * بناء أيام الرسم البياني (Build Chart Days)
 *
 * يُستدعى من `useFinancialStats` لتوليد مصفوفة `ChartDay` لكل يوم من أيام
 * الشهر المختار. كل يوم يحتوي على:
 *   - عدد الكشوفات/الاستشارات في هذا اليوم.
 *   - دخل الكشوفات/الاستشارات (مع تطبيق الأسعار التاريخية والخصومات).
 *   - الدخل الإضافي (تداخلات + دخل آخر) من localStorage أو الـ state الحالي.
 *   - إضافات التأمين (extras).
 *   - المصروفات اليومية (manual + discount expense من الخصومات).
 *   - إجمالي الدخل.
 *
 * تُستخدم هذه البيانات في رسم الـ bar chart للإيرادات اليومية في صفحة
 * التقارير المالية.
 */

import type { ChartDay, DayStats } from '../useFinancialStats.shared';
import { parseInsuranceExtras, summarizeInsuranceExtrasByType } from '../useFinancialStats.shared';
import { buildCairoDateTime, formatUserDate, getCairoDateParts } from '../../../../utils/cairoTime';
import { formatDateKey, branchLocalKey } from '../../utils/formatters';

/** يقرا insuranceExtras من المفتاح الموحد ويفلتر على الفرع النشط */
const readInsuranceExtrasForBranch = (dayKey: string, branchId?: string): string | null => {
    const raw = localStorage.getItem(`insuranceExtra_${dayKey}`);
    if (!raw) return null;
    try {
        const all = JSON.parse(raw);
        if (!Array.isArray(all)) return null;
        const target = branchId || 'main';
        return JSON.stringify(all.filter((e: any) => (e?.branchId || 'main') === target));
    } catch {
        return null;
    }
};

interface BuildChartDaysInput {
    startOfMonth: Date;
    endOfMonth: Date;
    selectedDayKey: string;
    dailyInterventions: string;
    dailyOther: string;
    dailyExpense: string;
    monthStatsDailyBreakdown: Record<string, DayStats>;
    visitFinancialByDate: Record<string, {
        examsIncome: number;
        consultsIncome: number;
        discountExpense: number;
    }>;
    selectedDayInsuranceExtras: { interventions: number; other: number; total: number };
    branchId?: string;
}

export const buildChartDays = ({
    startOfMonth,
    endOfMonth,
    selectedDayKey,
    dailyInterventions,
    dailyOther,
    dailyExpense,
    monthStatsDailyBreakdown,
    visitFinancialByDate,
    selectedDayInsuranceExtras,
    branchId,
}: BuildChartDaysInput): ChartDay[] => {
    const days: ChartDay[] = [];
    const current = new Date(startOfMonth);

    while (current <= endOfMonth) {
        const dateStr = formatDateKey(current);
        const cairoDay = buildCairoDateTime(dateStr, '12:00');
        const dayData = monthStatsDailyBreakdown[dateStr] || { exams: 0, consultations: 0 };

        let dayInterventionsCash = 0;
        let dayOtherCash = 0;
        let dayManualExpense = 0;
        if (dateStr === selectedDayKey) {
            dayInterventionsCash = parseFloat(dailyInterventions) || 0;
            dayOtherCash = parseFloat(dailyOther) || 0;
            dayManualExpense = parseFloat(dailyExpense) || 0;
        } else {
            dayInterventionsCash = parseFloat(localStorage.getItem(`${branchLocalKey('interventionsRevenue', branchId)}_${dateStr}`) || '0') || 0;
            dayOtherCash = parseFloat(localStorage.getItem(`${branchLocalKey('otherRevenue', branchId)}_${dateStr}`) || '0') || 0;
            dayManualExpense = parseFloat(localStorage.getItem(`${branchLocalKey('dailyExpense', branchId)}_${dateStr}`) || '0') || 0;
        }

        const dayInsuranceExtras =
            dateStr === selectedDayKey
                ? selectedDayInsuranceExtras
                : summarizeInsuranceExtrasByType(parseInsuranceExtras(readInsuranceExtrasForBranch(dateStr, branchId)));

        const dayInterventions = dayInterventionsCash + dayInsuranceExtras.interventions;
        const dayOther = dayOtherCash + dayInsuranceExtras.other;
        const dayVisitFinancial = visitFinancialByDate[dateStr] || {
            examsIncome: 0,
            consultsIncome: 0,
            discountExpense: 0,
        };

        days.push({
            date: dateStr,
            dayName: formatUserDate(cairoDay, { weekday: 'short' }, 'ar-EG-u-nu-latn'),
            dayNum: getCairoDateParts(cairoDay).day,
            ...dayData,
            examsIncome: dayVisitFinancial.examsIncome,
            consultsIncome: dayVisitFinancial.consultsIncome,
            interventions: dayInterventions,
            other: dayOther,
            discountExpense: dayVisitFinancial.discountExpense,
            expense: dayManualExpense + dayVisitFinancial.discountExpense,
            income: dayVisitFinancial.examsIncome + dayVisitFinancial.consultsIncome + dayInterventions + dayOther,
        });

        current.setDate(current.getDate() + 1);
    }

    return days;
};
