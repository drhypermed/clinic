/**
 * حساب تفاصيل مالية لكل يوم (Visit Financial By Date)
 *
 * يُستدعى من `useFinancialStats` لحساب — لكل يوم ضمن الشهر المختار —
 * التفاصيل المالية التالية:
 *   - `examsIncome`     : إجمالي دخل الكشوفات (بعد تطبيق السعر الفعلي).
 *   - `consultsIncome`  : إجمالي دخل الاستشارات.
 *   - `collectedCash`   : الكاش المحصل فعلياً (بعد الخصومات/حصة المريض).
 *   - `insuranceClaims` : المطالبات التأمينية المستحقة من شركات التأمين.
 *   - `discountExpense` : قيمة الخصومات المُحتسبة كمصروف.
 *
 * يُستخدم هذا الـ map لاحقاً في `chartDays` و `monthlyVisitFinancialTotals`.
 */

import type { PatientRecord } from '../../../../types';
import { computePaymentBreakdownForBasePrice } from '../../../../utils/paymentDiscount';
import { formatDateKey } from '../../utils/formatters';
import { asTimestamp, type ConsultationVisit } from './collectConsultationVisits';

export interface VisitFinancialDayEntry {
    examsIncome: number;
    consultsIncome: number;
    collectedCash: number;
    insuranceClaims: number;
    discountExpense: number;
}

interface BuildVisitFinancialByDateInput {
    records: PatientRecord[];
    consultationVisits: ConsultationVisit[];
    startTs: number;
    endTs: number;
    resolveBasePriceByDate: {
        exam: (visitTs: number) => number;
        consultation: (visitTs: number) => number;
    };
}

export const buildVisitFinancialByDate = ({
    records,
    consultationVisits,
    startTs,
    endTs,
    resolveBasePriceByDate,
}: BuildVisitFinancialByDateInput): Record<string, VisitFinancialDayEntry> => {
    const byDay: Record<string, VisitFinancialDayEntry> = {};

    const ensureDay = (dayKey: string) => {
        if (!byDay[dayKey]) {
            byDay[dayKey] = {
                examsIncome: 0,
                consultsIncome: 0,
                collectedCash: 0,
                insuranceClaims: 0,
                discountExpense: 0,
            };
        }
        return byDay[dayKey];
    };

    records.forEach((record) => {
        if (record.isConsultationOnly) return;
        const recTs = asTimestamp(record.date);
        if (!Number.isFinite(recTs) || recTs < startTs || recTs > endTs) return;

        const explicitBasePrice = Number(record.serviceBasePrice);
        const effectiveBasePrice = Number.isFinite(explicitBasePrice) && explicitBasePrice > 0
            ? explicitBasePrice
            : resolveBasePriceByDate.exam(recTs);

        const dayKey = formatDateKey(new Date(record.date));
        const breakdown = computePaymentBreakdownForBasePrice({
            basePrice: effectiveBasePrice,
            paymentType: record.paymentType,
            patientSharePercent: record.patientSharePercent,
            discountAmount: record.discountAmount,
            discountPercent: record.discountPercent,
        });

        const day = ensureDay(dayKey);
        day.examsIncome += breakdown.billedIncome;
        day.collectedCash += breakdown.collectedCash;
        day.insuranceClaims += breakdown.insuranceClaims;
        day.discountExpense += breakdown.discountAmount;
    });

    consultationVisits.forEach((visit) => {
        const consultTs = asTimestamp(visit.date);
        if (!Number.isFinite(consultTs) || consultTs < startTs || consultTs > endTs) return;

        const explicitBasePrice = Number(visit.serviceBasePrice);
        const effectiveBasePrice = Number.isFinite(explicitBasePrice) && explicitBasePrice > 0
            ? explicitBasePrice
            : resolveBasePriceByDate.consultation(consultTs);

        const dayKey = formatDateKey(new Date(visit.date));
        const breakdown = computePaymentBreakdownForBasePrice({
            basePrice: effectiveBasePrice,
            paymentType: visit.paymentType,
            patientSharePercent: visit.patientSharePercent,
            discountAmount: visit.discountAmount,
            discountPercent: visit.discountPercent,
        });

        const day = ensureDay(dayKey);
        day.consultsIncome += breakdown.billedIncome;
        day.collectedCash += breakdown.collectedCash;
        day.insuranceClaims += breakdown.insuranceClaims;
        day.discountExpense += breakdown.discountAmount;
    });

    return byDay;
};
