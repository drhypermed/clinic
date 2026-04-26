/**
 * Main Financial Reports Page.
 * Aggregates sub-components for complete financial analytics.
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Branch, PatientRecord } from '../../types';
import { financialDataService } from '../../services/financial-data';
import { useTabSync } from '../../hooks/useTabSync';

// الهوكس | Hooks

import { useFinancialData } from './hooks/useFinancialData';
import { useFinancialStats } from './hooks/useFinancialStats';
import { useFinancialNavigation } from './hooks/useFinancialNavigation';

// المكونات | Components

import { ReportsHeader, type ReportTab } from './components/ReportsHeader';
import { PriceListSection } from './components/PriceListSection';
import { DailyRevenueSection } from './components/DailyRevenueSection';
import { DailyExpensesSection } from './components/DailyExpensesSection';
import { MonthlyRevenueSection } from './components/MonthlyRevenueSection';
import { MonthlyExpensesSection } from './components/MonthlyExpensesSection';
import { NetProfitCard } from './components/NetProfitCard';
import { DailyStatsCalendar } from './components/DailyStatsCalendar';
import { YearlyStatsGrid } from './components/YearlyStatsGrid';
import { InsuranceCompaniesSection } from './components/InsuranceCompaniesSection';
import { DiscountReasonsSection } from './components/DiscountReasonsSection';
import { InsuranceClaimsSection } from './components/InsuranceClaimsSection';

// الخصائص | Props

interface FinancialReportsPageProps {
    /** سجلات المرضى */
    records: PatientRecord[];
    /** دالة الرجوع */
    onBack: () => void;
    /** معرف المستخدم */
    userId: string;
    /** الفرع النشط */
    branchId?: string;
    /** قائمة الفروع — تُمرَّر لإدارة overrides نسبة التأمين per-branch. */
    branches?: Branch[];
}

// المكون الرئيسي | Main Component

/**
 * صفحة التقارير المالية
 *
 * تعرض:
 * 1. الهيدر مع التنقل بين التبويبات واختيار التواريخ
 * 2. يومي: إيرادات اليوم + مصروفات اليوم
 * 3. شهري: مطالبات التأمين + الإيرادات + المصروفات + صافي الأرباح + تقويم الأيام
 * 4. سنوي: شبكة إحصائيات السنة
 * 5. الإعدادات: قائمة الأسعار + شركات التأمين + أسباب الخصم
 */
export const FinancialReportsPage: React.FC<FinancialReportsPageProps> = ({
    records,
    onBack,
    userId,
    branchId,
    branches,
}) => {
    // التبويب النشط | Active Tab (متزامن مع URL ?tab=...)
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = React.useState<ReportTab>(
        () => {
            const urlTab = searchParams.get('tab');
            const valid: ReportTab[] = ['daily', 'monthly', 'yearly', 'settings'];
            return urlTab && valid.includes(urlTab as ReportTab) ? urlTab as ReportTab : 'daily';
        },
    );
    const { setTabWithUrl } = useTabSync<ReportTab>(
        'tab', activeTab, setActiveTab, 'daily',
        ['daily', 'monthly', 'yearly', 'settings'] as const,
    );

    // التنقل | Navigation
    const navigation = useFinancialNavigation();

    // السنة المحددة | Selected Year
    const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

    // البيانات | Data
    const financialData = useFinancialData({
        userId,
        selectedDate: navigation.selectedDate,
        selectedDay: navigation.selectedDay,
        branchId,
    });

    // تحميل الأسعار الثابتة (غير شهرية)
    const [fixedPrices, setFixedPrices] = React.useState<{ examinationPrice?: string; consultationPrice?: string; updatedAt?: number }>({});
    const [isSavingPrices, setIsSavingPrices] = React.useState(false);
    const [priceSaveError, setPriceSaveError] = React.useState('');

    React.useEffect(() => {
        if (!userId) {
            setFixedPrices({});
            return;
        }

        let isDisposed = false;

        financialDataService.getPrices(userId, branchId).then((prices) => {
            if (isDisposed) return;
            setFixedPrices({
                examinationPrice: prices.examinationPrice || '',
                consultationPrice: prices.consultationPrice || '',
                updatedAt: prices.updatedAt,
            });
        }).catch(() => {});

        const unsubscribe = financialDataService.subscribeToPrices(userId, (prices) => {
            if (isDisposed) return;
            setFixedPrices({
                examinationPrice: prices.examinationPrice || '',
                consultationPrice: prices.consultationPrice || '',
                updatedAt: prices.updatedAt,
            });
        }, undefined, branchId);

        return () => {
            isDisposed = true;
            unsubscribe();
        };
    }, [userId, branchId]);

    // Migration: تثبيت أسعار الكشوفات القديمة بالسعر الحالي (يتم مرة واحدة لكل فرع)
    React.useEffect(() => {
        if (!userId) return;
        const exam = parseFloat(fixedPrices.examinationPrice || '0') || 0;
        const consult = parseFloat(fixedPrices.consultationPrice || '0') || 0;
        if (exam <= 0 && consult <= 0) return;
        financialDataService.migratePriceSnapshots(userId, branchId, exam, consult).catch(err => {
            console.warn('[PriceSnapshot] migration failed:', err?.message || err);
        });
    }, [userId, branchId, fixedPrices.examinationPrice, fixedPrices.consultationPrice]);

    const handlePricesChange = (prices: { examinationPrice: string; consultationPrice: string }) => {
        setFixedPrices((prev) => ({
            ...prev,
            examinationPrice: prices.examinationPrice,
            consultationPrice: prices.consultationPrice,
        }));
    };

    const saveFixedPrices = async (prices: { examinationPrice: string; consultationPrice: string }) => {
        if (!userId) return;
        try {
            setIsSavingPrices(true);
            setPriceSaveError('');
            await financialDataService.saveFixedPricesWithHistory(userId, prices, branchId);
        } catch (error) {
            setPriceSaveError('تعذر حفظ الأسعار الآن. لم يتم تطبيق التغيير. حاول مرة أخرى.');
        } finally {
            setIsSavingPrices(false);
        }
    };

    // الإحصائيات | Statistics
    const stats = useFinancialStats({
        records,
        selectedDate: navigation.selectedDate,
        selectedDay: navigation.selectedDay,
        selectedYear,
        examPrice: parseFloat(fixedPrices.examinationPrice || '0') || 0,
        consultPrice: parseFloat(fixedPrices.consultationPrice || '0') || 0,
        dailyInterventions: financialData.dailyRevenue.interventions,
        dailyOther: financialData.dailyRevenue.other,
        dailyExpense: financialData.dailyExpense,
        monthlyExpenses: financialData.monthlyExpenses,
        lastSyncTime: financialData.lastSyncTime,
        userId,
        branchId,
        dailyInsuranceExtras: financialData.dailyInsuranceExtras,
        yearlyDailyMap: financialData.yearlyDailyMap,
        yearlyMonthlyMap: financialData.yearlyMonthlyMap,
    });

    // العرض | Render
    return (
        <div dir="rtl">
            {/* الهيدر | Header */}
            <div className="dh-stagger-1"><ReportsHeader
                onBack={onBack}
                activeTab={activeTab}
                onTabChange={setTabWithUrl}
                selectedYear={navigation.selectedDate.getFullYear()}
                selectedMonth={navigation.selectedDate.getMonth()}
                onJumpToYearMonth={navigation.jumpToYearMonth}
                selectedDayStr={navigation.selectedDayKey}
                onSetDay={navigation.setDayFromString}
                selectedStatsYear={selectedYear}
                currentYear={new Date().getFullYear()}
                onSetStatsYear={setSelectedYear}
            /></div>

            {/* المحتوى | Content */}
            <div data-no-reveal className="px-3 py-3 sm:px-5 sm:py-4 space-y-3 dh-stagger-2">

                {/* تبويب: اليومي | Daily Tab */}
                {activeTab === 'daily' && (
                    <>
                        <DailyRevenueSection
                            formattedSelectedDay={navigation.formattedSelectedDay}
                            selectedDayKey={navigation.selectedDayKey}
                            selectedDayExamBreakdowns={stats.selectedDayExamBreakdowns}
                            selectedDayConsultBreakdowns={stats.selectedDayConsultBreakdowns}
                            interventionsValue={financialData.dailyRevenue.interventions}
                            interventionsLabel={financialData.labels.interventionsLabel}
                            onUpdateInterventionsLabel={(val) => financialData.updateLabel('interventionsLabel', val)}
                            otherValue={financialData.dailyRevenue.other}
                            otherLabel={financialData.labels.otherRevenueLabel}
                            onUpdateOtherLabel={(val) => financialData.updateLabel('otherRevenueLabel', val)}
                            totalDailyRevenue={stats.dailyCollectedCash}
                            dailyInsuranceTotal={Math.max(0, stats.dailyTotalRevenue - stats.dailyCollectedCash)}
                            dailyInsuranceExtras={financialData.dailyInsuranceExtras}
                            userId={userId}
                            branchId={branchId}
                            yearlyDailyMap={financialData.yearlyDailyMap}
                        />
                        <DailyExpensesSection
                            formattedSelectedDay={navigation.formattedSelectedDay}
                            expenseValue={financialData.dailyExpense}
                            onUpdateExpense={financialData.updateDailyExpense}
                            discountExpense={stats.dailyDiscountExpense}
                            totalDailyExpenses={(parseFloat(financialData.dailyExpense || '0') || 0) + stats.dailyDiscountExpense}
                        />
                    </>
                )}

                {/* تبويب: الشهري | Monthly Tab */}
                {activeTab === 'monthly' && (
                    <>
                        <InsuranceClaimsSection
                            userId={userId}
                            currentMonthLabel={navigation.monthLabel}
                            records={records}
                            selectedDate={navigation.selectedDate}
                            selectedDayKey={navigation.selectedDayKey}
                            examPrice={parseFloat(fixedPrices.examinationPrice || '0') || 0}
                            consultPrice={parseFloat(fixedPrices.consultationPrice || '0') || 0}
                            dailyInsuranceExtras={financialData.dailyInsuranceExtras}
                            yearlyDailyMap={financialData.yearlyDailyMap}
                        />
                        <MonthlyRevenueSection
                            currentMonthLabel={navigation.monthLabel}
                            examsIncome={stats.examsIncome}
                            examsCount={stats.monthStats.exams}
                            consultsIncome={stats.consultsIncome}
                            consultationsCount={stats.monthStats.consultations}
                            interventionsLabel={financialData.labels.interventionsLabel}
                            interventionsIncome={stats.monthlyAdditionalRevenue.interventions}
                            otherLabel={financialData.labels.otherRevenueLabel}
                            otherIncome={stats.monthlyAdditionalRevenue.other}
                            totalIncome={stats.totalIncome}
                            collectedCash={stats.collectedCash}
                            insuranceClaims={stats.insuranceClaims}
                        />
                        <MonthlyExpensesSection
                            currentMonthLabel={navigation.monthLabel}
                            rentExpense={financialData.monthlyExpenses.rentExpense}
                            onUpdateRent={(val) => financialData.updateMonthlyExpense('rentExpense', val)}
                            salariesExpense={financialData.monthlyExpenses.salariesExpense}
                            onUpdateSalaries={(val) => financialData.updateMonthlyExpense('salariesExpense', val)}
                            toolsExpense={financialData.monthlyExpenses.toolsExpense}
                            onUpdateTools={(val) => financialData.updateMonthlyExpense('toolsExpense', val)}
                            electricityExpense={financialData.monthlyExpenses.electricityExpense}
                            onUpdateElectricity={(val) => financialData.updateMonthlyExpense('electricityExpense', val)}
                            otherExpense={financialData.monthlyExpenses.otherExpense}
                            onUpdateOther={(val) => financialData.updateMonthlyExpense('otherExpense', val)}
                            monthlyDailyExpenses={stats.monthlyDailyExpenses}
                            monthlyDiscountExpense={stats.monthlyDiscountExpense}
                            totalExpenses={stats.totalExpenses}
                        />
                        <NetProfitCard
                            totalIncome={stats.totalIncome}
                            totalExpenses={stats.totalExpenses}
                            currentMonthLabel={navigation.monthLabel}
                        />
                        <DailyStatsCalendar
                            currentMonthLabel={navigation.monthLabel}
                            chartDays={stats.chartDays}
                            maxDailyIncome={stats.maxDailyIncome}
                            selectedDayKey={navigation.selectedDayKey}
                            currentDateKey={navigation.currentDateKey}
                            onSelectDay={navigation.setSelectedDay}
                            totalMonthlyExpenses={stats.totalExpenses}
                        />
                    </>
                )}

                {/* تبويب: السنوي | Yearly Tab */}
                {activeTab === 'yearly' && (
                    <YearlyStatsGrid
                        currentYear={selectedYear}
                        yearlyStats={stats.yearlyStats}
                        currentMonth={new Date().getMonth()}
                        isCurrentYear={selectedYear === new Date().getFullYear()}
                    />
                )}

                {/* تبويب: الإعدادات | Settings Tab */}
                {activeTab === 'settings' && (
                    <>
                        <PriceListSection
                            userId={userId}
                            branchId={branchId}
                            examinationPrice={fixedPrices.examinationPrice || ''}
                            consultationPrice={fixedPrices.consultationPrice || ''}
                            lastUpdatedAt={fixedPrices.updatedAt}
                            onPricesChange={handlePricesChange}
                            onSave={saveFixedPrices}
                            isSaving={isSavingPrices}
                            saveErrorMessage={priceSaveError}
                        />
                        <InsuranceCompaniesSection userId={userId} branches={branches} activeBranchId={branchId} />
                        <DiscountReasonsSection userId={userId} />
                    </>
                )}

            </div>
        </div>
    );
};
