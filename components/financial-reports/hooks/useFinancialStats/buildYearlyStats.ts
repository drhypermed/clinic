/**
 * بناء إحصائيات السنة (Build Yearly Stats)
 *
 * يُستدعى من `useFinancialStats` لحساب إحصائيات تفصيلية لكل شهر من أشهر
 * السنة المختارة (عدد زيارات، دخل، مصروفات). يُستخدم الناتج في عرض
 * الـ year-overview في صفحة التقارير المالية.
 *
 * المنطق:
 *   1. لكل شهر (0..11):
 *      - حساب مجموع الدخل الإضافي (تداخلات/آخر) من خرائط Firestore أو الـ state.
 *      - قراءة المصروفات الشهرية من خريطة Firestore (إيجار/رواتب/أدوات/كهرباء/أخرى).
 *      - جمع كل records داخل الشهر (غير الاستشارة الصافية) وحساب دخل الكشف.
 *      - جمع كل consultationVisits داخل الشهر وحساب دخل الاستشارة.
 *      - جمع خصومات الأسعار (discountExpense) لإضافتها للمصروفات.
 *   2. تطبيق أسعار الكشف/الاستشارة التاريخية حسب تاريخ كل زيارة عبر
 *      `resolveBasePriceByDate`.
 */

import type { PatientRecord } from '../../../../types';
import type { YearlyMonthData } from '../useFinancialStats.shared';
import { parseInsuranceExtras, summarizeInsuranceExtrasByType } from '../useFinancialStats.shared';
import { computePaymentBreakdownForBasePrice } from '../../../../utils/paymentDiscount';
import { formatMonthLabel } from '../../utils/formatters';
import type { DailyFinancialData, MonthlyFinancialData } from '../../../../services/financial-data';
import { asTimestamp, type ConsultationVisit } from './collectConsultationVisits';

interface BuildYearlyStatsInput {
    records: PatientRecord[];
    consultationVisits: ConsultationVisit[];
    selectedYear: number;
    selectedDayKey: string;
    dailyInterventions: string;
    dailyOther: string;
    dailyExpense: string;
    selectedDayInsuranceExtras: { interventions: number; other: number; total: number };
    resolveBasePriceByDate: {
        exam: (visitTs: number) => number;
        consultation: (visitTs: number) => number;
    };
    /** خريطة البيانات اليومية من Firestore (YYYY-MM-DD) — مفلترة بالفرع */
    yearlyDailyMap: Record<string, DailyFinancialData>;
    /** خريطة المصروفات الشهرية الثابتة من Firestore (YYYY-MM) — مفلترة بالفرع */
    yearlyMonthlyMap: Record<string, MonthlyFinancialData>;
}

export const buildYearlyStats = ({
    records,
    consultationVisits,
    selectedYear,
    selectedDayKey,
    dailyInterventions,
    dailyOther,
    dailyExpense,
    selectedDayInsuranceExtras,
    resolveBasePriceByDate,
    yearlyDailyMap,
    yearlyMonthlyMap,
}: BuildYearlyStatsInput): YearlyMonthData[] => {
    const months: YearlyMonthData[] = [];

    for (let m = 0; m < 12; m++) {
        const monthStart = new Date(selectedYear, m, 1);
        // Bug #6 fix: نهاية الشهر = بداية الشهر التالي ناقص 1 مللي ثانية
        const nextMonthStart = new Date(selectedYear, m + 1, 1, 0, 0, 0, 0);
        const monthEnd = new Date(nextMonthStart.getTime() - 1);
        const mStartTs = monthStart.getTime();
        const mEndTs = monthEnd.getTime();
        const mKey = `${selectedYear}-${String(m + 1).padStart(2, '0')}`;

        const lastDayOfMonth = new Date(selectedYear, m + 1, 0).getDate();
        let monthInt = 0;
        let monthOther = 0;
        let monthDailyExpenses = 0;

        for (let d = 1; d <= lastDayOfMonth; d++) {
            const dayKey = `${selectedYear}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const entry = yearlyDailyMap[dayKey];
            const extrasSummary =
                dayKey === selectedDayKey
                    ? selectedDayInsuranceExtras
                    : summarizeInsuranceExtrasByType(parseInsuranceExtras(
                        Array.isArray(entry?.insuranceExtras) ? JSON.stringify(entry!.insuranceExtras) : null
                    ));

            if (dayKey === selectedDayKey) {
                monthInt += (parseFloat(dailyInterventions) || 0) + extrasSummary.interventions;
                monthOther += (parseFloat(dailyOther) || 0) + extrasSummary.other;
                monthDailyExpenses += parseFloat(dailyExpense) || 0;
            } else {
                monthInt += (Number(entry?.interventionsRevenue) || 0) + extrasSummary.interventions;
                monthOther += (Number(entry?.otherRevenue) || 0) + extrasSummary.other;
                monthDailyExpenses += Number(entry?.dailyExpense) || 0;
            }
        }

        const monthlyEntry = yearlyMonthlyMap[mKey];
        const mRent = Number(monthlyEntry?.rentExpense) || 0;
        const mSalaries = Number(monthlyEntry?.salariesExpense) || 0;
        const mTools = Number(monthlyEntry?.toolsExpense) || 0;
        const mElectricity = Number(monthlyEntry?.electricityExpense) || 0;
        const mOtherExp = Number(monthlyEntry?.otherExpense) || 0;

        let exams = 0;
        let consultations = 0;
        let monthExamIncome = 0;
        let monthConsultIncome = 0;
        let monthDiscountExpense = 0;

        records.forEach((record) => {
            if (record.isConsultationOnly) return;
            const recTs = asTimestamp(record.date);
            if (!Number.isFinite(recTs) || recTs < mStartTs || recTs > mEndTs) return;

            exams += 1;
            const explicitBasePrice = Number(record.serviceBasePrice);
            const effectiveBasePrice = Number.isFinite(explicitBasePrice) && explicitBasePrice > 0
                ? explicitBasePrice
                : resolveBasePriceByDate.exam(recTs);
            const breakdown = computePaymentBreakdownForBasePrice({
                basePrice: effectiveBasePrice,
                paymentType: record.paymentType,
                patientSharePercent: record.patientSharePercent,
                discountAmount: record.discountAmount,
                discountPercent: record.discountPercent,
            });
            monthExamIncome += breakdown.billedIncome;
            monthDiscountExpense += breakdown.discountAmount;
        });

        consultationVisits.forEach((visit) => {
            const consultTs = asTimestamp(visit.date);
            if (!Number.isFinite(consultTs) || consultTs < mStartTs || consultTs > mEndTs) return;

            consultations += 1;
            const explicitBasePrice = Number(visit.serviceBasePrice);
            const effectiveBasePrice = Number.isFinite(explicitBasePrice) && explicitBasePrice > 0
                ? explicitBasePrice
                : resolveBasePriceByDate.consultation(consultTs);
            const breakdown = computePaymentBreakdownForBasePrice({
                basePrice: effectiveBasePrice,
                paymentType: visit.paymentType,
                patientSharePercent: visit.patientSharePercent,
                discountAmount: visit.discountAmount,
                discountPercent: visit.discountPercent,
            });
            monthConsultIncome += breakdown.billedIncome;
            monthDiscountExpense += breakdown.discountAmount;
        });

        const monthExpenses = mRent + mSalaries + mTools + mElectricity + mOtherExp + monthDailyExpenses + monthDiscountExpense;

        months.push({
            month: m,
            label: formatMonthLabel(monthStart),
            exams,
            consultations,
            examsIncome: monthExamIncome,
            consultsIncome: monthConsultIncome,
            interventionsRevenue: monthInt,
            otherRevenue: monthOther,
            expenses: monthExpenses,
            income: monthExamIncome + monthConsultIncome + monthInt + monthOther,
        });
    }

    return months;
};
