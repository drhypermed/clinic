/**
 * useFinancialStats — hook التقارير المالية الرئيسي
 *
 * يجمع هذا الـ hook كل الحسابات المالية المعروضة في `FinancialReportsPage`:
 *   - إحصائيات الشهر والسنة والأسعار التاريخية.
 *   - تفصيل كل زيارة (كشف/استشارة) حسب اليوم مع تطبيق الخصومات.
 *   - ملخص الدخل الإضافي والمصروفات والتأمين.
 *
 * تم فصل الحسابات الثقيلة إلى `useFinancialStats/*`:
 *   - `collectConsultationVisits`  : تحويل السجلات إلى زيارات استشارة.
 *   - `buildVisitFinancialByDate`  : إعداد تفصيل مالي لكل يوم.
 *   - `buildChartDays`             : أيام الرسم البياني الشهري.
 *   - `buildYearlyStats`           : إحصائيات كل أشهر السنة.
 *
 * الـ hook نفسه يركّز الآن على:
 *   1. جلب سجل تغيير الأسعار من الـ backend.
 *   2. بناء `resolveBasePriceByDate` الذي يُرجع السعر التاريخي لأي تاريخ.
 *   3. توزيع الحسابات عبر الـ helpers الفرعية.
 *   4. تلخيص النتائج في object واحد يستهلكه `FinancialReportsPage`.
 */

import { useMemo, useState, useEffect } from 'react';
import type { PatientRecord } from '../../../types';
import { formatDateKey, branchLocalKey } from '../utils/formatters';

/**
 * تقرا insuranceExtras من المفتاح الموحد وتفلتر على الفرع النشط.
 * كل extra جواه `branchId` (أو 'main' للعناصر القديمة).
 */
const readInsuranceExtrasForBranch = (dayKey: string, branchId?: string): string | null => {
    const raw = localStorage.getItem(`insuranceExtra_${dayKey}`);
    if (!raw) return null;
    try {
        const all = JSON.parse(raw);
        if (!Array.isArray(all)) return null;
        const target = branchId || 'main';
        const filtered = all.filter((e: any) => (e?.branchId || 'main') === target);
        return JSON.stringify(filtered);
    } catch {
        return null;
    }
};
import { financialDataService, type PriceChangeHistoryEntry } from '../../../services/financial-data';
import { computePaymentBreakdownForBasePrice } from '../../../utils/paymentDiscount';
import {
    type DayStats,
    type PatientDailyBreakdown,
    type UseFinancialStatsProps,
    type UseFinancialStatsReturn,
    parseInsuranceExtras,
    summarizeInsuranceExtrasByType,
} from './useFinancialStats.shared';
export type { ChartDay, YearlyMonthData } from './useFinancialStats.shared';

import { asTimestamp, collectConsultationVisits } from './useFinancialStats/collectConsultationVisits';
import { buildVisitFinancialByDate } from './useFinancialStats/buildVisitFinancialByDate';
import { buildChartDays } from './useFinancialStats/buildChartDays';
import { buildYearlyStats } from './useFinancialStats/buildYearlyStats';

export const useFinancialStats = ({
    records,
    selectedDate,
    selectedDay,
    selectedYear,
    examPrice,
    consultPrice,
    dailyInterventions,
    dailyOther,
    dailyExpense,
    monthlyExpenses,
    lastSyncTime,
    userId,
    branchId,
    dailyInsuranceExtras = []
}: UseFinancialStatsProps): UseFinancialStatsReturn => {
    const selectedDayKey = formatDateKey(selectedDay);
    const [priceChangeHistory, setPriceChangeHistory] = useState<PriceChangeHistoryEntry[]>([]);

    useEffect(() => {
        let isDisposed = false;
        if (!userId) {
            setPriceChangeHistory([]);
            return;
        }

        financialDataService.getPriceChangeHistory(userId, branchId).then((history) => {
            if (isDisposed) return;
            setPriceChangeHistory(history);
        }).catch(() => {
            if (isDisposed) return;
            setPriceChangeHistory([]);
        });

        return () => {
            isDisposed = true;
        };
    }, [userId, examPrice, consultPrice, lastSyncTime, branchId]);

    // الكشوفات الجديدة بتحفظ سعرها جواها (serviceBasePrice). الكشوفات القديمة
    // بدون هذا الحقل تستخدم السعر الحالي كـ fallback. سجل priceHistory للعرض فقط.
    const resolveBasePriceByDate = useMemo(() => ({
        exam: (_visitTs?: number) => Math.max(0, examPrice || 0),
        consultation: (_visitTs?: number) => Math.max(0, consultPrice || 0),
    }), [examPrice, consultPrice]);

    const { startOfMonth, endOfMonth, startTs, endTs } = useMemo(() => {
        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        // Bug #6 fix: نهاية الشهر = أول لحظة في الشهر اللي بعده ناقص 1 مللي ثانية (بدل 23:59:59.999).
        // ده بيضمن إن أي سجل في اللحظة الأخيرة من الشهر يتحسب بدون مشاكل تقريب.
        const nextMonthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1, 0, 0, 0, 0);
        const end = new Date(nextMonthStart.getTime() - 1);
        return {
            startOfMonth: start,
            endOfMonth: end,
            startTs: start.getTime(),
            endTs: end.getTime()
        };
    }, [selectedDate]);

    const consultationVisits = useMemo(() => collectConsultationVisits(records), [records]);

    const monthStats = useMemo(() => {
        const dailyExams: Record<string, DayStats> = {};
        let monthExams = 0;
        let monthConsultations = 0;
        records.forEach(record => {
            if (record.isConsultationOnly) return;
            const recTs = asTimestamp(record.date);
            if (!Number.isFinite(recTs) || recTs < startTs || recTs > endTs) return;

            const dateKey = formatDateKey(new Date(record.date));
            if (!dailyExams[dateKey]) {
                dailyExams[dateKey] = { exams: 0, consultations: 0 };
            }
            dailyExams[dateKey].exams++;
            monthExams++;
        });

        consultationVisits.forEach((visit) => {
            const consultTs = asTimestamp(visit.date);
            if (!Number.isFinite(consultTs) || consultTs < startTs || consultTs > endTs) return;

            const consultDateKey = formatDateKey(new Date(visit.date));
            if (!dailyExams[consultDateKey]) {
                dailyExams[consultDateKey] = { exams: 0, consultations: 0 };
            }
            dailyExams[consultDateKey].consultations++;
            monthConsultations++;
        });
        return {
            exams: monthExams,
            consultations: monthConsultations,
            dailyBreakdown: dailyExams,
            collectedCash: 0,   // يُحسب لاحقاً بعد حساب الأسعار
            insuranceClaims: 0, // يُحسب لاحقاً
        };
    }, [records, consultationVisits, startTs, endTs]);

    const selectedDayStats = useMemo(() => {
        let exams = 0;
        records.forEach(r => {
            if (r.isConsultationOnly) return;
            const rDate = formatDateKey(new Date(r.date));
            if (rDate === selectedDayKey) exams++;
        });

        const consultations = consultationVisits.reduce((count, visit) => {
            const consultDay = formatDateKey(new Date(visit.date));
            return consultDay === selectedDayKey ? count + 1 : count;
        }, 0);

        return { exams, consultations };
    }, [records, consultationVisits, selectedDayKey]);

    const selectedDayPatientBreakdowns = useMemo(() => {
        const exams: PatientDailyBreakdown[] = [];
        const consults: PatientDailyBreakdown[] = [];

        records.forEach((record) => {
            if (record.isConsultationOnly) return;
            const dayKey = formatDateKey(new Date(record.date));
            if (dayKey !== selectedDayKey) return;

            const recTs = asTimestamp(record.date);
            const explicitBasePrice = Number(record.serviceBasePrice);
            const effectiveBasePrice = Number.isFinite(explicitBasePrice) && explicitBasePrice > 0
                ? explicitBasePrice : resolveBasePriceByDate.exam(recTs);
            const breakdown = computePaymentBreakdownForBasePrice({
                basePrice: effectiveBasePrice,
                paymentType: record.paymentType,
                patientSharePercent: record.patientSharePercent,
                discountAmount: record.discountAmount,
                discountPercent: record.discountPercent,
            });
            exams.push({ patientName: record.patientName, cashAmount: breakdown.collectedCash, insuranceAmount: breakdown.insuranceClaims, companyName: record.insuranceCompanyName });
        });

        const seenConsultIds = new Set<string>();
        records.forEach((record) => {
            const processConsult = (visitDate: string, explicitBasePrice: unknown, key: string) => {
                if (seenConsultIds.has(key)) return;
                const dayKey = formatDateKey(new Date(visitDate));
                if (dayKey !== selectedDayKey) return;
                seenConsultIds.add(key);
                const consultTs = asTimestamp(visitDate);
                const parsed = Number(explicitBasePrice);
                const effectiveBasePrice = Number.isFinite(parsed) && parsed > 0
                    ? parsed : resolveBasePriceByDate.consultation(consultTs);
                const breakdown = computePaymentBreakdownForBasePrice({
                    basePrice: effectiveBasePrice,
                    paymentType: record.paymentType,
                    patientSharePercent: record.patientSharePercent,
                    discountAmount: record.discountAmount,
                    discountPercent: record.discountPercent,
                });
                consults.push({ patientName: record.patientName, cashAmount: breakdown.collectedCash, insuranceAmount: breakdown.insuranceClaims, companyName: record.insuranceCompanyName });
            };

            if (record.isConsultationOnly) {
                processConsult(record.date, record.serviceBasePrice, record.id);
                return;
            }
            const historyDates = Array.isArray(record.consultationHistoryDates) ? record.consultationHistoryDates : [];
            if (historyDates.length > 0) {
                historyDates.forEach((histDate, index) => {
                    const key = record.consultationHistoryRecordIds?.[index] || `${record.id}:history:${index}:${histDate}`;
                    processConsult(histDate, record.consultationHistoryServiceBasePrices?.[index], key);
                });
            } else if (record.consultation?.date) {
                const key = record.consultationRecordId || `${record.id}:inline:${record.consultation.date}`;
                processConsult(record.consultation.date, record.consultationServiceBasePrice, key);
            }
        });

        return { exams, consults };
    }, [records, selectedDayKey, resolveBasePriceByDate]);

    const selectedDayInsuranceExtras = useMemo(
        () => summarizeInsuranceExtrasByType(dailyInsuranceExtras),
        [dailyInsuranceExtras]
    );

    const monthlyAdditionalRevenueCash = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        let totalInterventions = 0;
        let totalOther = 0;
        for (let d = 1; d <= lastDay; d++) {
            const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (dayKey === selectedDayKey) {
                totalInterventions += parseFloat(dailyInterventions) || 0;
                totalOther += parseFloat(dailyOther) || 0;
            } else {
                totalInterventions += parseFloat(localStorage.getItem(`${branchLocalKey('interventionsRevenue', branchId)}_${dayKey}`) || '0') || 0;
                totalOther += parseFloat(localStorage.getItem(`${branchLocalKey('otherRevenue', branchId)}_${dayKey}`) || '0') || 0;
            }
        }
        return {
            interventions: totalInterventions,
            other: totalOther,
            total: totalInterventions + totalOther
        };
    }, [dailyInterventions, dailyOther, selectedDayKey, selectedDate, branchId]);

    const monthlyAdditionalRevenue = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        let totalInterventions = 0;
        let totalOther = 0;
        for (let d = 1; d <= lastDay; d++) {
            const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const cashInterventions =
                dayKey === selectedDayKey
                    ? (parseFloat(dailyInterventions) || 0)
                    : (parseFloat(localStorage.getItem(`${branchLocalKey('interventionsRevenue', branchId)}_${dayKey}`) || '0') || 0);
            const cashOther =
                dayKey === selectedDayKey
                    ? (parseFloat(dailyOther) || 0)
                    : (parseFloat(localStorage.getItem(`${branchLocalKey('otherRevenue', branchId)}_${dayKey}`) || '0') || 0);
            const extrasSummary =
                dayKey === selectedDayKey
                    ? selectedDayInsuranceExtras
                    : summarizeInsuranceExtrasByType(parseInsuranceExtras(readInsuranceExtrasForBranch(dayKey, branchId)));
            totalInterventions += cashInterventions + extrasSummary.interventions;
            totalOther += cashOther + extrasSummary.other;
        }
        return {
            interventions: totalInterventions,
            other: totalOther,
            total: totalInterventions + totalOther
        };
    }, [dailyInterventions, dailyOther, selectedDate, selectedDayKey, selectedDayInsuranceExtras, branchId]);

    const monthlyInsuranceExtrasTotal = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        let total = 0;
        for (let d = 1; d <= lastDay; d++) {
            const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const extrasSummary =
                dayKey === selectedDayKey
                    ? selectedDayInsuranceExtras
                    : summarizeInsuranceExtrasByType(parseInsuranceExtras(readInsuranceExtrasForBranch(dayKey, branchId)));
            total += extrasSummary.total;
        }
        return total;
    }, [selectedDate, selectedDayKey, selectedDayInsuranceExtras, branchId]);

    const monthlyDailyExpenses = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        let total = 0;
        for (let d = 1; d <= lastDay; d++) {
            const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (dayKey === selectedDayKey) {
                total += parseFloat(dailyExpense) || 0;
            } else {
                total += parseFloat(localStorage.getItem(`${branchLocalKey('dailyExpense', branchId)}_${dayKey}`) || '0') || 0;
            }
        }
        return total;
    }, [dailyExpense, selectedDayKey, selectedDate, branchId]);

    const visitFinancialByDate = useMemo(
        () => buildVisitFinancialByDate({
            records,
            consultationVisits,
            startTs,
            endTs,
            resolveBasePriceByDate,
        }),
        [records, consultationVisits, resolveBasePriceByDate, startTs, endTs]
    );

    const monthlyVisitFinancialTotals = useMemo(() => {
        const summary = {
            monthExamsIncome: 0,
            monthConsultsIncome: 0,
            monthCollectedCash: 0,
            monthInsuranceClaims: 0,
            monthDiscountExpense: 0,
            selectedDayExamsIncome: 0,
            selectedDayConsultsIncome: 0,
            selectedDayCollectedCash: 0,
            selectedDayDiscountExpense: 0,
        };

        Object.values(visitFinancialByDate).forEach((day) => {
            summary.monthExamsIncome += day.examsIncome;
            summary.monthConsultsIncome += day.consultsIncome;
            summary.monthCollectedCash += day.collectedCash;
            summary.monthInsuranceClaims += day.insuranceClaims;
            summary.monthDiscountExpense += day.discountExpense;
        });

        const selectedDayFinancial = visitFinancialByDate[selectedDayKey];
        if (selectedDayFinancial) {
            summary.selectedDayExamsIncome = selectedDayFinancial.examsIncome;
            summary.selectedDayConsultsIncome = selectedDayFinancial.consultsIncome;
            summary.selectedDayCollectedCash = selectedDayFinancial.collectedCash;
            summary.selectedDayDiscountExpense = selectedDayFinancial.discountExpense;
        }

        return summary;
    }, [visitFinancialByDate, selectedDayKey]);

    const chartDays = useMemo(
        () => buildChartDays({
            startOfMonth,
            endOfMonth,
            selectedDayKey,
            dailyInterventions,
            dailyOther,
            dailyExpense,
            monthStatsDailyBreakdown: monthStats.dailyBreakdown,
            visitFinancialByDate,
            selectedDayInsuranceExtras,
            branchId,
        }),
        [
            monthStats.dailyBreakdown,
            startOfMonth,
            endOfMonth,
            dailyInterventions,
            dailyOther,
            dailyExpense,
            selectedDayInsuranceExtras,
            selectedDayKey,
            visitFinancialByDate,
            branchId,
        ]
    );

    const maxDailyIncome = Math.max(...chartDays.map((d) => d.income), 1);

    const yearlyStats = useMemo(
        () => buildYearlyStats({
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
        }),
        [
            records,
            consultationVisits,
            selectedYear,
            resolveBasePriceByDate,
            dailyInterventions,
            dailyOther,
            dailyExpense,
            selectedDayInsuranceExtras,
            selectedDayKey,
            branchId,
        ]
    );

    const dailyExamsIncome = monthlyVisitFinancialTotals.selectedDayExamsIncome;
    const dailyConsultsIncome = monthlyVisitFinancialTotals.selectedDayConsultsIncome;
    const dailyTotalRevenue =
        (parseFloat(dailyInterventions) || 0) +
        (parseFloat(dailyOther) || 0) +
        selectedDayInsuranceExtras.total +
        dailyExamsIncome +
        dailyConsultsIncome;

    const examsIncome = monthlyVisitFinancialTotals.monthExamsIncome;
    const consultsIncome = monthlyVisitFinancialTotals.monthConsultsIncome;
    const totalIncome = examsIncome + consultsIncome + monthlyAdditionalRevenue.total;

    const collectedCash = monthlyAdditionalRevenueCash.total + monthlyVisitFinancialTotals.monthCollectedCash;
    const insuranceClaims = monthlyInsuranceExtrasTotal + monthlyVisitFinancialTotals.monthInsuranceClaims;
    const monthlyDiscountExpense = monthlyVisitFinancialTotals.monthDiscountExpense;

    const totalExpenses =
        (parseFloat(monthlyExpenses.rentExpense) || 0) +
        (parseFloat(monthlyExpenses.salariesExpense) || 0) +
        (parseFloat(monthlyExpenses.toolsExpense) || 0) +
        (parseFloat(monthlyExpenses.electricityExpense) || 0) +
        (parseFloat(monthlyExpenses.otherExpense) || 0) +
        monthlyDailyExpenses +
        monthlyDiscountExpense;

    const dailyCollectedCash =
        (parseFloat(dailyInterventions) || 0) +
        (parseFloat(dailyOther) || 0) +
        monthlyVisitFinancialTotals.selectedDayCollectedCash;

    const dailyDiscountExpense = monthlyVisitFinancialTotals.selectedDayDiscountExpense;

    return {
        monthStats,
        selectedDayStats,
        selectedDayExamBreakdowns: selectedDayPatientBreakdowns.exams,
        selectedDayConsultBreakdowns: selectedDayPatientBreakdowns.consults,
        monthlyAdditionalRevenue,
        monthlyDailyExpenses,
        chartDays,
        maxDailyIncome,
        yearlyStats,
        dailyExamsIncome,
        dailyConsultsIncome,
        dailyTotalRevenue,
        dailyCollectedCash,
        dailyDiscountExpense,
        examsIncome,
        consultsIncome,
        totalIncome,
        collectedCash,
        insuranceClaims,
        monthlyDiscountExpense,
        totalExpenses
    };
};
