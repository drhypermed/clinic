// ─────────────────────────────────────────────────────────────────────────────
// Hook تجميع مطالبات التأمين (useInsuranceClaims)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف كل منطق حساب كشف حساب شركات التأمين:
//   1) تجميع الكشوفات والاستشارات المؤمنة لكل شركة داخل الشهر المحدد
//   2) إضافة الـ extras (تداخلات + دخل آخر) من خريطة Firestore اليومية
//   3) حساب مطالبة لفترة مخصصة (computeRangeClaim) للفواتير
//   4) طباعة فاتورة شركة (handlePrintInsuranceInvoice)
//
// فصلناه من InsuranceClaimsSection.tsx (كان 560 سطر) عشان:
//   - JSX يبقى في ملف مستقل للقراءة السريعة
//   - المنطق الحسابي يبقى قابل للاختبار المستقل
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';
import type { PatientRecord } from '../../../types';
import type { DailyFinancialData } from '../../../services/financial-data';
import { usePrescriptionSettings } from '../../../hooks/usePrescriptionSettings';
import { printPatientInvoice } from '../../patient-files/invoicePrintUtils';
import type { DailyInsuranceExtraEntry } from './useFinancialData';
import {
  CompanyClaim,
  addDaysToKey,
  asTimestamp,
  createEmptyClaim,
  readInsuranceExtrasForDay,
} from '../components/insuranceClaimsHelpers';

interface UseInsuranceClaimsParams {
  userId: string;
  records: PatientRecord[];
  selectedDate: Date;
  selectedDayKey: string;
  examPrice: number;
  consultPrice: number;
  dailyInsuranceExtras?: DailyInsuranceExtraEntry[];
  /** خريطة Firestore اليومية (مفلترة بالفرع) — مصدر extras للأيام الماضية */
  yearlyDailyMap: Record<string, DailyFinancialData>;
}

export const useInsuranceClaims = ({
  userId,
  records,
  selectedDate,
  selectedDayKey,
  examPrice,
  consultPrice,
  dailyInsuranceExtras = [],
  yearlyDailyMap,
}: UseInsuranceClaimsParams) => {
  const { settings: rxSettings } = usePrescriptionSettings(userId || null);

  // Bug #11 fix: الكشوفات الجديدة بتحفظ سعرها جواها (serviceBasePrice).
  // القديمة تستخدم السعر الحالي كـ fallback عن طريق الدالتين دول.
  const resolveBasePriceByDate = useMemo(() => ({
    exam: (_visitTs?: number) => Math.max(0, examPrice || 0),
    consultation: (_visitTs?: number) => Math.max(0, consultPrice || 0),
  }), [examPrice, consultPrice]);

  // Bug #6 fix: نهاية الشهر = بداية الشهر التالي - 1 ms
  const { startTs, endTs } = useMemo(() => {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const nextMonthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1, 0, 0, 0, 0);
    const end = new Date(nextMonthStart.getTime() - 1);
    return { startTs: start.getTime(), endTs: end.getTime() };
  }, [selectedDate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // تجميع المطالبات الشهرية لكل شركة
  // ═══════════════════════════════════════════════════════════════════════════
  const { claims, totalCompanyShare } = useMemo(() => {
    const claimsMap: Record<string, CompanyClaim> = {};
    let totalCS = 0;

    records.forEach((record) => {
      // نعد فقط السجلات المؤمنة اللي فيها اسم شركة
      if (record.paymentType !== 'insurance' || !record.insuranceCompanyName) return;

      const recDate = new Date(record.date);
      const recTs = recDate.getTime();
      const inMonth = recTs >= startTs && recTs <= endTs;
      if (!inMonth) return;

      const companyName = record.insuranceCompanyName;
      const sharePercent = record.patientSharePercent ?? 0;

      if (!claimsMap[companyName]) {
        claimsMap[companyName] = createEmptyClaim(companyName);
      }
      const claim = claimsMap[companyName];

      // ── حساب الكشف الأساسي ──
      if (!record.isConsultationOnly) {
        claim.examsCount++;
        claim.totalCases++;
        const examTs = asTimestamp(record.date);
        const explicitExamBasePrice = Number(record.serviceBasePrice);
        const billed = Number.isFinite(explicitExamBasePrice) && explicitExamBasePrice >= 0
          ? explicitExamBasePrice
          : resolveBasePriceByDate.exam(examTs);
        const patientShare = Math.round((billed * sharePercent) / 100);
        const cs = billed - patientShare;
        claim.totalBilled += billed;
        claim.companyShare += cs;
        claim.examsCompanyShare += cs;
        totalCS += cs;
      }

      // ── حساب الاستشارات المؤمنة (يدعم المنفصلة + التاريخية) ──
      const addConsultationClaim = (visitDate: string, explicitBasePrice?: unknown) => {
        const consultTs = asTimestamp(visitDate);
        if (!Number.isFinite(consultTs) || consultTs < startTs || consultTs > endTs) return;

        const parsedExplicit = Number(explicitBasePrice);
        const billed = Number.isFinite(parsedExplicit) && parsedExplicit >= 0
          ? parsedExplicit
          : resolveBasePriceByDate.consultation(consultTs);

        claim.consultationsCount++;
        claim.totalCases++;
        const patientShare = Math.round((billed * sharePercent) / 100);
        const cs = billed - patientShare;
        claim.totalBilled += billed;
        claim.companyShare += cs;
        claim.consultsCompanyShare += cs;
        totalCS += cs;
      };

      if (record.isConsultationOnly) {
        addConsultationClaim(record.date, record.serviceBasePrice);
      } else {
        const historyDates = Array.isArray(record.consultationHistoryDates)
          ? record.consultationHistoryDates
          : [];

        if (historyDates.length > 0) {
          historyDates.forEach((historyDate, index) => {
            addConsultationClaim(historyDate, record.consultationHistoryServiceBasePrices?.[index]);
          });
        } else if (record.consultation?.date) {
          addConsultationClaim(record.consultation.date, record.consultationServiceBasePrice);
        }
      }
    });

    // ── جمع الـ extras (تداخلات + دخل آخر) لكل يوم في الشهر ──
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
      const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // لليوم المحدد: نستخدم البيانات اللي جاية من prop (محدثة لحظياً)
      // لباقي الأيام: نقرأ من خريطة Firestore (مفلترة بالفرع أصلاً في الـ doc)
      const extras = dayKey === selectedDayKey
        ? dailyInsuranceExtras
        : readInsuranceExtrasForDay(dayKey, yearlyDailyMap);

      extras.forEach((extra) => {
        if (!claimsMap[extra.companyName]) {
          claimsMap[extra.companyName] = createEmptyClaim(extra.companyName);
        }
        const companyClaim = claimsMap[extra.companyName];
        companyClaim.insuranceExtrasCount++;
        companyClaim.insuranceExtrasTotal += extra.amount;
        if (extra.type === 'interventions') {
          companyClaim.interventionsExtrasCount++;
          companyClaim.interventionsExtrasTotal += extra.amount;
        } else {
          companyClaim.otherExtrasCount++;
          companyClaim.otherExtrasTotal += extra.amount;
        }
        totalCS += extra.amount;
      });
    }

    // ترتيب تنازلي حسب إجمالي المطالبة (الشركة الأكبر أولاً)
    const sortedClaims = Object.values(claimsMap).sort(
      (a, b) => (b.companyShare + b.insuranceExtrasTotal) - (a.companyShare + a.insuranceExtrasTotal),
    );

    return { claims: sortedClaims, totalCompanyShare: totalCS };
  }, [records, startTs, endTs, selectedDate, selectedDayKey, dailyInsuranceExtras, resolveBasePriceByDate, yearlyDailyMap]);

  // ═══════════════════════════════════════════════════════════════════════════
  // حالة فاتورة الشركة (فترة مخصصة)
  // ═══════════════════════════════════════════════════════════════════════════
  const [invoiceCompany, setInvoiceCompany] = useState<string | null>(null);
  const [invoiceDateFrom, setInvoiceDateFrom] = useState('');
  const [invoiceDateTo, setInvoiceDateTo] = useState('');

  /** فتح فورم الفاتورة لشركة — يضبط الفترة الافتراضية للشهر الحالي. */
  const openInvoiceForCompany = useCallback((companyName: string) => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    const firstDay = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`;
    setInvoiceDateFrom(firstDay);
    setInvoiceDateTo(lastDay);
    // toggle: لو نفس الشركة مفتوحة، نقفلها
    setInvoiceCompany((prev) => (prev === companyName ? null : companyName));
  }, [selectedDate]);

  /** حساب مطالبة لشركة محددة داخل فترة مخصصة — يستخدم في الفاتورة. */
  const computeRangeClaim = useCallback((companyName: string, fromKey: string, toKey: string): CompanyClaim => {
    const rangeStart = new Date(fromKey + 'T00:00:00').getTime();
    const rangeEnd = new Date(toKey + 'T23:59:59.999').getTime();
    const claim = createEmptyClaim(companyName);

    if (!Number.isFinite(rangeStart) || !Number.isFinite(rangeEnd)) return claim;

    records.forEach((record) => {
      if (record.paymentType !== 'insurance' || record.insuranceCompanyName !== companyName) return;
      const recTs = new Date(record.date).getTime();
      if (recTs < rangeStart || recTs > rangeEnd) return;

      const sharePercent = record.patientSharePercent ?? 0;

      if (!record.isConsultationOnly) {
        claim.examsCount++;
        claim.totalCases++;
        const examTs = asTimestamp(record.date);
        const explicit = Number(record.serviceBasePrice);
        const billed = Number.isFinite(explicit) && explicit >= 0 ? explicit : resolveBasePriceByDate.exam(examTs);
        const patientShare = Math.round((billed * sharePercent) / 100);
        const cs = billed - patientShare;
        claim.totalBilled += billed;
        claim.companyShare += cs;
        claim.examsCompanyShare += cs;
      }

      const addConsult = (visitDate: string, explicitBase?: unknown) => {
        const consultTs = asTimestamp(visitDate);
        if (!Number.isFinite(consultTs) || consultTs < rangeStart || consultTs > rangeEnd) return;
        const parsed = Number(explicitBase);
        const billed = Number.isFinite(parsed) && parsed >= 0 ? parsed : resolveBasePriceByDate.consultation(consultTs);
        claim.consultationsCount++;
        claim.totalCases++;
        const patientShare = Math.round((billed * sharePercent) / 100);
        const cs = billed - patientShare;
        claim.totalBilled += billed;
        claim.companyShare += cs;
        claim.consultsCompanyShare += cs;
      };

      if (record.isConsultationOnly) {
        addConsult(record.date, record.serviceBasePrice);
      } else {
        const histDates = Array.isArray(record.consultationHistoryDates) ? record.consultationHistoryDates : [];
        if (histDates.length > 0) {
          histDates.forEach((hd, i) => addConsult(hd, record.consultationHistoryServiceBasePrices?.[i]));
        } else if (record.consultation?.date) {
          addConsult(record.consultation.date, record.consultationServiceBasePrice);
        }
      }
    });

    // ── extras في الفترة (inclusive) ──
    let dayKey = fromKey;
    while (dayKey <= toKey) {
      // لليوم المحدد: البيانات من prop (محدثة لحظياً)، لغيره: من خريطة Firestore
      const extras = dayKey === selectedDayKey
        ? dailyInsuranceExtras
        : readInsuranceExtrasForDay(dayKey, yearlyDailyMap);

      extras.forEach((extra) => {
        if (extra.companyName !== companyName) return;
        claim.insuranceExtrasCount++;
        claim.insuranceExtrasTotal += extra.amount;
        if (extra.type === 'interventions') {
          claim.interventionsExtrasCount++;
          claim.interventionsExtrasTotal += extra.amount;
        } else {
          claim.otherExtrasCount++;
          claim.otherExtrasTotal += extra.amount;
        }
      });
      dayKey = addDaysToKey(dayKey, 1);
    }

    return claim;
  }, [records, resolveBasePriceByDate, selectedDayKey, dailyInsuranceExtras, yearlyDailyMap]);

  /** طباعة فاتورة شركة عن الفترة المحددة حالياً (invoiceDateFrom → invoiceDateTo). */
  const handlePrintInsuranceInvoice = useCallback((companyName: string) => {
    if (!invoiceDateFrom || !invoiceDateTo) return;
    const claim = computeRangeClaim(companyName, invoiceDateFrom, invoiceDateTo);
    const grandTotal = claim.companyShare + claim.insuranceExtrasTotal;
    if (grandTotal <= 0 && claim.totalCases === 0) return;

    const formatRange = () => {
      try {
        const from = new Date(invoiceDateFrom + 'T00:00:00').toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Cairo' });
        const to = new Date(invoiceDateTo + 'T00:00:00').toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Cairo' });
        return `${from} — ${to}`;
      } catch {
        return `${invoiceDateFrom} → ${invoiceDateTo}`;
      }
    };

    // بنود الفاتورة — نضيف فقط الأنواع اللي فيها عناصر
    const items: { description: string; amount: number }[] = [];
    if (claim.examsCount > 0) {
      items.push({ description: `كشوفات (${claim.examsCount} كشف)`, amount: claim.examsCompanyShare });
    }
    if (claim.consultationsCount > 0) {
      items.push({ description: `استشارات (${claim.consultationsCount} استشارة)`, amount: claim.consultsCompanyShare });
    }
    if (claim.interventionsExtrasCount > 0) {
      items.push({ description: `تداخلات (${claim.interventionsExtrasCount} بند)`, amount: claim.interventionsExtrasTotal });
    }
    if (claim.otherExtrasCount > 0) {
      items.push({ description: `دخل آخر (${claim.otherExtrasCount} بند)`, amount: claim.otherExtrasTotal });
    }

    if (items.length === 0) return;

    printPatientInvoice(
      {
        patientName: companyName,
        items,
        discount: 0,
        notes: `كشف حساب للفترة: ${formatRange()}  •  إجمالي الحالات: ${claim.totalCases}`,
      },
      rxSettings,
    );
  }, [invoiceDateFrom, invoiceDateTo, computeRangeClaim, rxSettings]);

  return {
    // بيانات المطالبات الشهرية
    claims,
    totalCompanyShare,
    // حالة الفاتورة
    invoiceCompany,
    invoiceDateFrom,
    invoiceDateTo,
    setInvoiceDateFrom,
    setInvoiceDateTo,
    // الإجراءات
    openInvoiceForCompany,
    handlePrintInsuranceInvoice,
  };
};
