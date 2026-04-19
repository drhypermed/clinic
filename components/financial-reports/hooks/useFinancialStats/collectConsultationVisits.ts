/**
 * جمع زيارات الاستشارة (Collect Consultation Visits)
 *
 * يحول سجلات المرضى إلى قائمة زيارات "استشارة" منفصلة. يعالج ثلاث حالات:
 *   1. السجل استشارة فقط (`isConsultationOnly`).
 *   2. السجل به history لاستشارات متعددة (`consultationHistoryDates`).
 *   3. السجل به استشارة مضمّنة (`record.consultation.date`).
 *
 * الهدف: الحصول على قائمة أحداث استشارة قابلة للعد والتجميع بدلاً من
 * معالجة كل النماذج الثلاثة في كل `useMemo` داخل `useFinancialStats`.
 */

import type { PatientRecord } from '../../../../types';

export interface ConsultationVisit {
    id: string;
    date: string;
    serviceBasePrice?: number;
    paymentType: PatientRecord['paymentType'];
    patientSharePercent: PatientRecord['patientSharePercent'];
    discountAmount: PatientRecord['discountAmount'];
    discountPercent: PatientRecord['discountPercent'];
}

/** تحويل نص تاريخ إلى timestamp صالح أو NaN */
export const asTimestamp = (value?: string): number => {
    const parsed = Date.parse(String(value || ''));
    return Number.isFinite(parsed) ? parsed : NaN;
};

/** جمع كل زيارات الاستشارة من قائمة سجلات المرضى */
export const collectConsultationVisits = (records: PatientRecord[]): ConsultationVisit[] => {
    const visits: ConsultationVisit[] = [];
    const seenVisitIds = new Set<string>();

    const registerVisit = ({
        id,
        fallbackId,
        date,
        paymentType,
        patientSharePercent,
        discountAmount,
        discountPercent,
        serviceBasePrice,
    }: {
        id?: string;
        fallbackId: string;
        date?: string;
        serviceBasePrice?: unknown;
        paymentType: PatientRecord['paymentType'];
        patientSharePercent: PatientRecord['patientSharePercent'];
        discountAmount: PatientRecord['discountAmount'];
        discountPercent: PatientRecord['discountPercent'];
    }) => {
        const normalizedDate = String(date || '').trim();
        if (!normalizedDate) return;

        const normalizedId = String(id || '').trim() || fallbackId;
        if (!normalizedId || seenVisitIds.has(normalizedId)) return;

        seenVisitIds.add(normalizedId);
        visits.push({
            id: normalizedId,
            date: normalizedDate,
            serviceBasePrice: Number.isFinite(Number(serviceBasePrice)) ? Number(serviceBasePrice) : undefined,
            paymentType,
            patientSharePercent,
            discountAmount,
            discountPercent,
        });
    };

    records.forEach((record) => {
        if (record.isConsultationOnly) {
            registerVisit({
                id: record.id,
                fallbackId: `consultation-only:${record.id}:${record.date}`,
                date: record.date,
                serviceBasePrice: record.serviceBasePrice,
                paymentType: record.paymentType,
                patientSharePercent: record.patientSharePercent,
                discountAmount: record.discountAmount,
                discountPercent: record.discountPercent,
            });
            return;
        }

        const historyDates = Array.isArray(record.consultationHistoryDates)
            ? record.consultationHistoryDates
            : [];

        if (historyDates.length > 0) {
            // Bug #10 fix: تحقق من تطابق طول مصفوفات الاستشارات (dates ↔ prices) قبل الاستخدام.
            // لو كان فيه خلل، السعر المربوط بتاريخ معين ممكن يكون غلط.
            const pricesArray = record.consultationHistoryServiceBasePrices;
            if (Array.isArray(pricesArray) && pricesArray.length !== historyDates.length) {
                console.warn(
                    `[Financial] Mismatch in record ${record.id}: consultationHistoryDates (${historyDates.length}) vs consultationHistoryServiceBasePrices (${pricesArray.length}). Prices may misalign with dates.`
                );
            }
            historyDates.forEach((historyDate, index) => {
                registerVisit({
                    id: record.consultationHistoryRecordIds?.[index],
                    fallbackId: `${record.id}:history:${index}:${historyDate}`,
                    date: historyDate,
                    serviceBasePrice: record.consultationHistoryServiceBasePrices?.[index],
                    paymentType: record.paymentType,
                    patientSharePercent: record.patientSharePercent,
                    discountAmount: record.discountAmount,
                    discountPercent: record.discountPercent,
                });
            });
            return;
        }

        if (record.consultation?.date) {
            registerVisit({
                id: record.consultationRecordId,
                fallbackId: `${record.id}:inline:${record.consultation.date}`,
                date: record.consultation.date,
                serviceBasePrice: record.consultationServiceBasePrice,
                paymentType: record.paymentType,
                patientSharePercent: record.patientSharePercent,
                discountAmount: record.discountAmount,
                discountPercent: record.discountPercent,
            });
        }
    });

    return visits;
};
