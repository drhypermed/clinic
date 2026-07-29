import { describe, expect, it } from 'vitest';
import { buildChartDays } from '../../../components/financial-reports/hooks/useFinancialStats/buildChartDays';
import { buildYearlyStats } from '../../../components/financial-reports/hooks/useFinancialStats/buildYearlyStats';
import { applyYearlySnapshotsToYearlyStats } from '../../../components/financial-reports/hooks/applySnapshotToStats';
import { sumDirectPaymentTotals } from '../../../utils/paymentMethods';
import type { PatientRecord } from '../../../types';
import type { MonthlySnapshot } from '../../../services/financial-data/monthlySnapshots';
import {
  createEmptyExpenseBreakdown,
  sumExpenseBreakdown,
} from '../../../components/financial-reports/utils/expenseBreakdown';

describe('financial report payment breakdown aggregation', () => {
  it('keeps a day payment breakdown equal to its displayed income', () => {
    const [day] = buildChartDays({
      startOfMonth: new Date(2026, 0, 1),
      endOfMonth: new Date(2026, 0, 1),
      selectedDayKey: '2026-01-02',
      dailyInterventions: '0',
      dailyOther: '0',
      dailyExpense: '0',
      monthStatsDailyBreakdown: {
        '2026-01-01': { exams: 1, consultations: 1 },
      },
      visitFinancialByDate: {
        '2026-01-01': {
          examsIncome: 400,
          consultsIncome: 300,
          discountExpense: 0,
          directPaymentTotals: {
            cash: 400,
            instapay: 0,
            wallet: 0,
            bank_transfer: 300,
          },
          insuranceClaims: 0,
        },
      },
      selectedDayInsuranceExtras: { interventions: 0, other: 0, total: 0 },
      yearlyDailyMap: {
        '2026-01-01': {
          interventionsRevenue: 100,
          otherRevenue: 50,
          cashCostItems: [
            { paymentType: 'wallet', amount: 100 },
            { paymentType: 'instapay', amount: 50 },
          ],
          insuranceExtras: [
            { type: 'other', amount: 70 },
          ],
        },
      },
    });

    expect(day.income).toBe(920);
    expect(day.directPaymentTotals).toEqual({
      cash: 400,
      instapay: 50,
      wallet: 100,
      bank_transfer: 300,
    });
    expect(day.insuranceClaims).toBe(70);
    expect(sumDirectPaymentTotals(day.directPaymentTotals) + day.insuranceClaims).toBe(day.income);
  });

  it('aggregates visit, additional-revenue, and insurance methods per month', () => {
    const records = [{
      id: 'exam-1',
      patientName: 'Patient',
      date: '2026-01-01T10:00:00.000Z',
      serviceBasePrice: 400,
      paymentType: 'cash',
    }] as PatientRecord[];

    const months = buildYearlyStats({
      records,
      consultationVisits: [{
        id: 'consult-1',
        date: '2026-01-02T10:00:00.000Z',
        serviceBasePrice: 200,
        paymentType: 'wallet',
        patientSharePercent: undefined,
        discountAmount: undefined,
        discountPercent: undefined,
      }],
      selectedYear: 2026,
      selectedDayKey: '2026-07-29',
      dailyInterventions: '0',
      dailyOther: '0',
      dailyExpense: '0',
      selectedDayInsuranceExtras: { interventions: 0, other: 0, total: 0 },
      resolveBasePriceByDate: {
        exam: () => 0,
        consultation: () => 0,
      },
      yearlyDailyMap: {
        '2026-01-03': {
          interventionsRevenue: 150,
          dailyExpense: 70,
          cashCostItems: [{ paymentType: 'instapay', amount: 150 }],
          insuranceExtras: [{ type: 'other', amount: 50 }],
        },
      },
      yearlyMonthlyMap: {
        '2026-01': {
          rentExpense: 100,
          salariesExpense: 200,
          toolsExpense: 300,
          electricityExpense: 400,
          otherExpense: 500,
        },
      },
    });

    const january = months[0];
    expect(january.income).toBe(800);
    expect(january.directPaymentTotals).toEqual({
      cash: 400,
      instapay: 150,
      wallet: 200,
      bank_transfer: 0,
    });
    expect(january.insuranceClaims).toBe(50);
    expect(sumDirectPaymentTotals(january.directPaymentTotals) + january.insuranceClaims).toBe(january.income);
    expect(january.expenseBreakdown).toEqual({
      rent: 100,
      salaries: 200,
      tools: 300,
      electricity: 400,
      daily: 70,
      other: 500,
      discounts: 0,
    });
    expect(sumExpenseBreakdown(january.expenseBreakdown)).toBe(january.expenses);
  });

  it('preserves payment methods when a closed month is read from its snapshot', () => {
    const [january] = applyYearlySnapshotsToYearlyStats([{
      month: 0,
      label: 'يناير 2026',
      exams: 0,
      consultations: 0,
      examsIncome: 0,
      consultsIncome: 0,
      interventionsRevenue: 0,
      otherRevenue: 0,
      expenses: 0,
      income: 0,
      directPaymentTotals: { cash: 0, instapay: 0, wallet: 0, bank_transfer: 0 },
      insuranceClaims: 0,
      expenseBreakdown: createEmptyExpenseBreakdown(),
    }], 2026, {
      '2026-01': {
        monthKey: '2026-01',
        examsCount: 1,
        consultationsCount: 1,
        examsIncome: 500,
        consultsIncome: 200,
        interventionsRevenue: 100,
        otherRevenue: 50,
        insuranceExtrasTotal: 50,
        insuranceClaims: 300,
        collectedCash: 400,
        directPaymentTotals: {
          cash: 300,
          instapay: 100,
          wallet: 100,
          bank_transfer: 50,
        },
        rentExpense: 100,
        salariesExpense: 200,
        toolsExpense: 300,
        electricityExpense: 400,
        dailyExpensesTotal: 500,
        otherExpense: 600,
        discountExpense: 50,
        totalExpenses: 2150,
      } as MonthlySnapshot,
    });

    expect(january.income).toBe(900);
    expect(january.directPaymentTotals).toEqual({
      cash: 300,
      instapay: 100,
      wallet: 100,
      bank_transfer: 50,
    });
    expect(january.insuranceClaims).toBe(350);
    expect(sumDirectPaymentTotals(january.directPaymentTotals) + january.insuranceClaims).toBe(january.income);
    expect(january.expenseBreakdown).toEqual({
      rent: 100,
      salaries: 200,
      tools: 300,
      electricity: 400,
      daily: 500,
      other: 600,
      discounts: 50,
    });
    expect(sumExpenseBreakdown(january.expenseBreakdown)).toBe(january.expenses);
  });

  it('splits daily expenses from visit discounts without changing the total', () => {
    const [day] = buildChartDays({
      startOfMonth: new Date(2026, 0, 1),
      endOfMonth: new Date(2026, 0, 1),
      selectedDayKey: '2026-01-01',
      dailyInterventions: '0',
      dailyOther: '0',
      dailyExpense: '125',
      monthStatsDailyBreakdown: {},
      visitFinancialByDate: {
        '2026-01-01': {
          examsIncome: 0,
          consultsIncome: 0,
          discountExpense: 25,
          directPaymentTotals: {
            cash: 0,
            instapay: 0,
            wallet: 0,
            bank_transfer: 0,
          },
          insuranceClaims: 0,
        },
      },
      selectedDayInsuranceExtras: { interventions: 0, other: 0, total: 0 },
      yearlyDailyMap: {},
    });

    expect(day.expense).toBe(150);
    expect(day.expenseBreakdown).toEqual({
      rent: 0,
      salaries: 0,
      tools: 0,
      electricity: 0,
      daily: 125,
      other: 0,
      discounts: 25,
    });
    expect(sumExpenseBreakdown(day.expenseBreakdown)).toBe(day.expense);
  });
});
