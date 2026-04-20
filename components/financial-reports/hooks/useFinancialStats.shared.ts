import type { PatientRecord } from '../../../types';
import type { DailyFinancialData, MonthlyFinancialData } from '../../../services/financial-data';
import type { DailyInsuranceExtraEntry } from './useFinancialData';

export interface DayStats {
    exams: number;           // عدد الكشوفات
    consultations: number;   // عدد الاستشارات
}
export interface MonthStats {
    exams: number;
    consultations: number;
    dailyBreakdown: Record<string, DayStats>;  // تفصيل يومي
    collectedCash: number;     // ما تم تحصيله نقداً (كاش + حصة المريض من التأمين)
    insuranceClaims: number;   // مطالبات التأمين (حصة الشركات المتبقية)
}
export interface ChartDay {
    date: string;           // YYYY-MM-DD
    dayName: string;        // اسم اليوم (السبت، الأحد، ...)
    dayNum: number;         // رقم اليوم (1-31)
    exams: number;
    consultations: number;
    examsIncome: number;
    consultsIncome: number;
    interventions: number;  // إيرادات التداخلات
    other: number;          // إيرادات أخرى
    expense: number;        // مصروفات اليوم
    discountExpense: number;
    income: number;         // إجمالي الدخل
}
export interface YearlyMonthData {
    month: number;                  // 0-11
    label: string;                  // اسم الشهر
    exams: number;
    consultations: number;
    examsIncome: number;
    consultsIncome: number;
    interventionsRevenue: number;
    otherRevenue: number;
    expenses: number;
    income: number;
}
export const parseInsuranceExtras = (raw: string | null): DailyInsuranceExtraEntry[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as DailyInsuranceExtraEntry[]) : [];
    } catch {
        return [];
    }
};
const roundMoney = (v: number) => Math.round(v * 100) / 100;
export const summarizeInsuranceExtrasByType = (extras: DailyInsuranceExtraEntry[]) => {
    let interventions = 0;
    let other = 0;
    extras.forEach((extra) => {
        const amount = Number(extra?.amount) || 0;
        if (extra?.type === 'interventions') interventions += amount;
        else other += amount;
    });
    interventions = roundMoney(interventions);
    other = roundMoney(other);
    return {
        interventions,
        other,
        total: roundMoney(interventions + other)
    };
};
export interface UseFinancialStatsProps {
    records: PatientRecord[];
    selectedDate: Date;         // الشهر المحدد
    selectedDay: Date;          // اليوم المحدد
    selectedYear: number;       // السنة المحددة للإحصائيات السنوية
    examPrice: number;          // سعر الكشف
    consultPrice: number;       // سعر الاستشارة
    dailyInterventions: string; // إيرادات التداخلات اليومية
    dailyOther: string;         // إيرادات أخرى يومية
    dailyExpense: string;       // مصروفات يومية
    monthlyExpenses: {          // المصروفات الشهرية
        rentExpense: string;
        salariesExpense: string;
        toolsExpense: string;
        electricityExpense: string;
        otherExpense: string;
    };
    lastSyncTime: number;       // لتحديث الإحصائيات عند المزامنة
    userId: string;             // معرف المستخدم لتحميل الأسعار
    branchId?: string;          // الفرع النشط لفلترة سجل الأسعار
    dailyInsuranceExtras?: DailyInsuranceExtraEntry[]; // إضافات التأمين اليومية الحالية
    /** خريطة بيانات Firestore اليومية لسنة selectedDate — مُمرّرة من useFinancialData. */
    yearlyDailyMap: Record<string, DailyFinancialData>;
    /** خريطة بيانات Firestore الشهرية لسنة selectedDate — مُمرّرة من useFinancialData. */
    yearlyMonthlyMap: Record<string, MonthlyFinancialData>;
}
export interface PatientDailyBreakdown {
    patientName: string;
    cashAmount: number;
    insuranceAmount: number;
    companyName?: string;
}
export interface UseFinancialStatsReturn {
    monthStats: MonthStats;
    selectedDayStats: DayStats;
    selectedDayExamBreakdowns: PatientDailyBreakdown[];
    selectedDayConsultBreakdowns: PatientDailyBreakdown[];
    monthlyAdditionalRevenue: {
        interventions: number;
        other: number;
        total: number;
    };
    monthlyDailyExpenses: number;
    chartDays: ChartDay[];
    maxDailyIncome: number;
    yearlyStats: YearlyMonthData[];
    dailyExamsIncome: number;
    dailyConsultsIncome: number;
    dailyTotalRevenue: number;
    dailyCollectedCash: number; // النقد المحصل فعلياً اليوم (كاش + حصة المريض)
    dailyDiscountExpense: number;
    examsIncome: number;
    consultsIncome: number;
    totalIncome: number;       // إجمالي الفواتير (كاش + تأمين)
    collectedCash: number;     // النقد المحصّل فعلياً
    insuranceClaims: number;   // مطالبات التأمين عند الشركات
    monthlyDiscountExpense: number;
    totalExpenses: number;
}


