/**
 * بناء أيام الرسم البياني (Build Chart Days)
 *
 * يُستدعى من `useFinancialStats` لتوليد مصفوفة `ChartDay` لكل يوم من أيام
 * الشهر المختار. كل يوم يحتوي على:
 *   - عدد الكشوفات/الاستشارات في هذا اليوم.
 *   - دخل الكشوفات/الاستشارات (مع تطبيق الأسعار التاريخية والخصومات).
 *   - الدخل الإضافي (تداخلات + دخل آخر) من Firestore.
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
import { formatDateKey } from '../../utils/formatters';
import type { DailyFinancialData } from '../../../../services/financial-data';

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
    /** خريطة البيانات اليومية من Firestore (مفتاحها YYYY-MM-DD) — مفلترة بالفرع في طبقة الـ service */
    yearlyDailyMap: Record<string, DailyFinancialData>;
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
    yearlyDailyMap,
}: BuildChartDaysInput): ChartDay[] => {
    const days: ChartDay[] = [];
    const current = new Date(startOfMonth);

    while (current <= endOfMonth) {
        const dateStr = formatDateKey(current);
        const cairoDay = buildCairoDateTime(dateStr, '12:00');
        const dayData = monthStatsDailyBreakdown[dateStr] || { exams: 0, consultations: 0 };
        const entry = yearlyDailyMap[dateStr];

        let dayInterventionsCash = 0;
        let dayOtherCash = 0;
        let dayManualExpense = 0;
        if (dateStr === selectedDayKey) {
            dayInterventionsCash = parseFloat(dailyInterventions) || 0;
            dayOtherCash = parseFloat(dailyOther) || 0;
            dayManualExpense = parseFloat(dailyExpense) || 0;
        } else {
            dayInterventionsCash = Number(entry?.interventionsRevenue) || 0;
            dayOtherCash = Number(entry?.otherRevenue) || 0;
            dayManualExpense = Number(entry?.dailyExpense) || 0;
        }

        const dayInsuranceExtras =
            dateStr === selectedDayKey
                ? selectedDayInsuranceExtras
                : summarizeInsuranceExtrasByType(parseInsuranceExtras(
                    Array.isArray(entry?.insuranceExtras) ? JSON.stringify(entry!.insuranceExtras) : null
                ));

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
