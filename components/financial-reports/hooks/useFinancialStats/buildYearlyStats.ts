/**
 * بناء إحصائيات السنة (Build Yearly Stats)
 *
 * يُستدعى من `useFinancialStats` لحساب إحصائيات تفصيلية لكل شهر من أشهر
 * السنة المختارة (عدد زيارات، دخل، مصروفات). يُستخدم الناتج في عرض
 * الـ year-overview في صفحة التقارير المالية.
 *
 * المنطق:
 *   1. لكل شهر (0..11):
 *      - حساب مجموع الدخل الإضافي (تداخلات/آخر) من localStorage أو الـ state.
 *      - قراءة المصروفات الشهرية من localStorage (إيجار/رواتب/أدوات/كهرباء/أخرى).
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
import { formatMonthLabel, branchLocalKey } from '../../utils/formatters';

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
    branchId?: string;
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
    branchId,
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
            const extrasSummary =
                dayKey === selectedDayKey
                    ? selectedDayInsuranceExtras
                    : summarizeInsuranceExtrasByType(parseInsuranceExtras(readInsuranceExtrasForBranch(dayKey, branchId)));

            if (dayKey === selectedDayKey) {
                monthInt += (parseFloat(dailyInterventions) || 0) + extrasSummary.interventions;
                monthOther += (parseFloat(dailyOther) || 0) + extrasSummary.other;
                monthDailyExpenses += parseFloat(dailyExpense) || 0;
            } else {
                monthInt += (parseFloat(localStorage.getItem(`${branchLocalKey('interventionsRevenue', branchId)}_${dayKey}`) || '0') || 0) + extrasSummary.interventions;
                monthOther += (parseFloat(localStorage.getItem(`${branchLocalKey('otherRevenue', branchId)}_${dayKey}`) || '0') || 0) + extrasSummary.other;
                monthDailyExpenses += parseFloat(localStorage.getItem(`${branchLocalKey('dailyExpense', branchId)}_${dayKey}`) || '0') || 0;
            }
        }

        const mRent = parseFloat(localStorage.getItem(`${branchLocalKey('rentExpense', branchId)}_${mKey}`) || '0') || 0;
        const mSalaries = parseFloat(localStorage.getItem(`${branchLocalKey('salariesExpense', branchId)}_${mKey}`) || '0') || 0;
        const mTools = parseFloat(localStorage.getItem(`${branchLocalKey('toolsExpense', branchId)}_${mKey}`) || '0') || 0;
        const mElectricity = parseFloat(localStorage.getItem(`${branchLocalKey('electricityExpense', branchId)}_${mKey}`) || '0') || 0;
        const mOtherExp = parseFloat(localStorage.getItem(`${branchLocalKey('otherExpense', branchId)}_${mKey}`) || '0') || 0;

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
