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
import { applyMonthSnapshotToStats, applyYearlySnapshotsToYearlyStats } from './hooks/applySnapshotToStats';
import type { MonthlySnapshot, DailyFinancialData, MonthlyFinancialData } from '../../services/financial-data';

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
    /** سجلات المرضى — في paginated mode بيكون 50 سجل بس، نستخدم fetchByDateRange
     *  لجلب سجلات السنة المعروضة قبل ما نحسب الأرقام. */
    records: PatientRecord[];
    /** الـflag لـpagination — لو مفعّل، نقرا سجلات السنة من السيرفر صراحة. */
    recordsPagingEnabled?: boolean;
    /** هل records تحتوي كل التاريخ؟ في legacy = true دايماً. */
    recordsFullyLoaded?: boolean;
    /** تحميل كل السجلات (fallback). */
    onEnsureFullRecordsLoaded?: () => Promise<void>;
    /** جلب سجلات نطاق تاريخ من السيرفر — التقارير بتستخدمه لتحميل سجلات سنة
     *  معروضة فقط بدل ما تجبر تحميل كل التاريخ. لو متاحة، السلوك الجديد بيوفّر
     *  في تكلفة Firestore. لو غير متاحة، نرجع للـensureFullRecordsLoaded القديم. */
    onFetchRecordsByDateRange?: (startMs: number, endMs: number) => Promise<number>;
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
    recordsPagingEnabled = false,
    recordsFullyLoaded = true,
    onEnsureFullRecordsLoaded,
    onFetchRecordsByDateRange,
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

    // ─── تحميل سجلات السنة المعروضة (paginated mode فقط) ───────────────
    // لو الـpagination مفعّل، records محملة 50 سجل فقط — مش كافي لحساب التقارير
    // المالية. لازم نجيب سجلات السنة المعروضة (سنة الـmonthly tab + سنة الـyearly
    // tab لو مختلفة) من السيرفر.
    //
    // الـfallback: لو fetchRecordsByDateRange غير متاحة، نستخدم ensureFullRecordsLoaded
    // القديمة (تحميل كل التاريخ). كده لو الـapp في legacy mode، السلوك ما يتأثرش.
    React.useEffect(() => {
        if (!userId) return;
        if (!recordsPagingEnabled) return; // legacy = records كاملة بالفعل
        if (onFetchRecordsByDateRange) {
            const yearOfMonth = navigation.selectedDate.getFullYear();
            const yearsToFetch = new Set<number>([yearOfMonth, selectedYear]);
            for (const year of yearsToFetch) {
                const startMs = new Date(year, 0, 1, 0, 0, 0, 0).getTime();
                const endMs = new Date(year + 1, 0, 1, 0, 0, 0, 0).getTime() - 1;
                void onFetchRecordsByDateRange(startMs, endMs);
            }
            return;
        }
        // Fallback لو الـcallback الجديد ما اتمررش — نحمّل كل التاريخ
        if (!recordsFullyLoaded && onEnsureFullRecordsLoaded) {
            void onEnsureFullRecordsLoaded();
        }
    }, [
        userId,
        recordsPagingEnabled,
        recordsFullyLoaded,
        navigation.selectedDate,
        selectedYear,
        onFetchRecordsByDateRange,
        onEnsureFullRecordsLoaded,
    ]);

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

    // ─── تحميل maps السنة الإضافية | Extra-Year Maps ──────────────────
    // useFinancialData بيحمّل yearlyDailyMap/Map للسنة بتاعة navigation.selectedDate
    // فقط. لكن tab "السنوي" ممكن يكون عارض سنة مختلفة (selectedYear). محتاجين
    // الـmaps للسنتين عشان:
    //   1. yearlyStats للـtab السنوي تطلع صح بدل صفر.
    //   2. snapshots الشهور المغلقة للسنة الإضافية تتعمل بأرقام صحيحة.
    const [extraDailyMap, setExtraDailyMap] = React.useState<Record<string, DailyFinancialData>>({});
    const [extraMonthlyMap, setExtraMonthlyMap] = React.useState<Record<string, MonthlyFinancialData>>({});

    React.useEffect(() => {
        if (!userId) return;
        const dateYear = navigation.selectedDate.getFullYear();
        // لو السنتين متطابقتين، useFinancialData بيغطّي = ما نحتاجش extra fetch.
        if (selectedYear === dateYear) {
            setExtraDailyMap({});
            setExtraMonthlyMap({});
            return;
        }
        let cancelled = false;
        Promise.all([
            financialDataService.getYearlyDailyEntries(userId, selectedYear, branchId),
            financialDataService.getYearlyMonthlyEntries(userId, selectedYear, branchId),
        ]).then(([daily, monthly]) => {
            if (cancelled) return;
            setExtraDailyMap(daily || {});
            setExtraMonthlyMap(monthly || {});
        }).catch(() => {
            if (cancelled) return;
            setExtraDailyMap({});
            setExtraMonthlyMap({});
        });
        return () => { cancelled = true; };
    }, [userId, branchId, selectedYear, navigation.selectedDate]);

    // دمج maps السنة الأساسية مع maps السنة الإضافية. الترتيب: extra الأول
    // عشان maps السنة الحالية (financialData) تكون الأحدث وتطغى لو فيه تداخل.
    const mergedYearlyDailyMap = React.useMemo(
        () => ({ ...extraDailyMap, ...financialData.yearlyDailyMap }),
        [extraDailyMap, financialData.yearlyDailyMap],
    );
    const mergedYearlyMonthlyMap = React.useMemo(
        () => ({ ...extraMonthlyMap, ...financialData.yearlyMonthlyMap }),
        [extraMonthlyMap, financialData.yearlyMonthlyMap],
    );

    // الإحصائيات الـlive | Live Statistics (محسوبة من records + maps المدمجة)
    const liveStats = useFinancialStats({
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
        yearlyDailyMap: mergedYearlyDailyMap,
        yearlyMonthlyMap: mergedYearlyMonthlyMap,
    });

    // ─── snapshots الشهور المغلقة | Closed-Month Snapshots ─────────────
    // بنقرا snapshots للسنة المعروضة (للـyearlyStats) + snapshot الشهر المعروض
    // (للـmonthly view). لو الشهر مغلق، الأرقام تيجي من snapshot الثابت بدل
    // ما تتحسب من records — كده تلقائياً "ينفصل عن السجلات" حسب التصميم.
    // التكلفة: ≤12 قراءة لكل سنة معروضة (قراءة واحدة لكل شهر مغلق).
    const [yearlySnapshots, setYearlySnapshots] = React.useState<Record<string, MonthlySnapshot>>({});

    React.useEffect(() => {
        if (!userId) return;
        const targetBranch = branchId || 'main';
        const yearOfMonth = navigation.selectedDate.getFullYear();
        const yearsToLoad = new Set<number>([yearOfMonth, selectedYear]);
        let cancelled = false;
        Promise.all(
            Array.from(yearsToLoad).map((y) =>
                financialDataService.getMonthlySnapshotsForYear(userId, y, targetBranch),
            ),
        ).then((results) => {
            if (cancelled) return;
            const merged: Record<string, MonthlySnapshot> = {};
            results.forEach((r) => Object.assign(merged, r));
            setYearlySnapshots(merged);
        }).catch(() => { if (!cancelled) setYearlySnapshots({}); });
        return () => { cancelled = true; };
    }, [userId, branchId, navigation.selectedDate, selectedYear, financialData.lastSyncTime]);

    // ─── إقفال شهري تلقائي | Auto-close ──────────────────────────────
    // لما السجلات وmaps تتحمّل، بنلف على الشهور اللي عدّى عليها 28 يوم بعد
    // نهايتها ولسه ما عندهاش snapshot (أو عندها snapshot قديم بـversion
    // أقل) ونحسب أرقامها ونحفظها. كده الجلسة الجاية ما تحتاجش حساب من records.
    //
    // مهم: بنمرّر loadedMapYears = السنتين اللي maps محمّلة لهم. الإقفال
    // هيتم فقط لشهور هذه السنوات — لمنع كتابة snapshot بأصفار للسنوات اللي
    // maps ما تغطيهاش (interventions/expenses هتطلع zero).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => {
        if (!userId || !records?.length) return;
        const targetBranch = branchId || 'main';
        const examPrice = parseFloat(fixedPrices.examinationPrice || '0') || 0;
        const consultPrice = parseFloat(fixedPrices.consultationPrice || '0') || 0;
        const dateYear = navigation.selectedDate.getFullYear();
        const loadedMapYears = Array.from(new Set<number>([dateYear, selectedYear]));
        // ندّي وقت للـmaps يتحمّلوا قبل ما نحسب (3.5s).
        const timer = window.setTimeout(() => {
            void financialDataService.ensureSnapshotsForClosedMonths({
                userId,
                branchId: targetBranch,
                records,
                yearlyDailyMap: mergedYearlyDailyMap,
                yearlyMonthlyMap: mergedYearlyMonthlyMap,
                examPrice,
                consultPrice,
                loadedMapYears,
            }).catch((err) => {
                console.warn('[FinancialReports] auto-close snapshots failed:', err);
            });
        }, 3500);
        return () => window.clearTimeout(timer);
    }, [
        userId,
        branchId,
        records?.length,
        // نشغّل لما selectedYear يتغيّر (الطبيب فتح تقارير سنة تانية → maps
        // الإضافية اتحمّلت → الفرصة لإقفال شهور دي السنة).
        selectedYear,
        // قصداً نتجاهل mergedMaps/fixedPrices كـdeps — الـsetTimeout(3500)
        // بيدّي فرصة كافية لتحميل الـmaps قبل الإقفال.
    ]);

    // ─── تطبيق snapshots على stats ────────────────────────────────────
    // لو الشهر المعروض حالياً عنده snapshot، نستبدل أرقام الشهر/اليوم بقيمه.
    // كمان نطبّق snapshots على yearlyStats (الشهور المغلقة من السنة المعروضة).
    const currentMonthKey = React.useMemo(() => {
        const d = navigation.selectedDate;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }, [navigation.selectedDate]);
    const currentMonthSnapshot = yearlySnapshots[currentMonthKey];

    const stats = React.useMemo(() => {
        let result = liveStats;
        if (currentMonthSnapshot) {
            result = applyMonthSnapshotToStats(result, currentMonthSnapshot, navigation.selectedDayKey);
        }
        if (Object.keys(yearlySnapshots).length > 0) {
            result = {
                ...result,
                yearlyStats: applyYearlySnapshotsToYearlyStats(
                    result.yearlyStats,
                    selectedYear,
                    yearlySnapshots,
                ),
            };
        }
        return result;
    }, [liveStats, currentMonthSnapshot, yearlySnapshots, navigation.selectedDayKey, selectedYear]);

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
