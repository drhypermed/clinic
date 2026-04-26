// ─────────────────────────────────────────────────────────────────────────────
// Hook إدارة بيانات اللوحة المالية (useFinancialData)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف كل المنطق الـ stateful للوحة المالية:
//   1) تحميل ملخص السنة من settings/adminDashboardStats (للسنة الحالية فقط).
//   2) تحميل أسعار الاشتراكات الخاصة بشهر معين.
//   3) تحميل كل الأسعار التاريخية (لعرض "سجل الأسعار").
//   4) تحميل المصروفات الشهرية.
//   5) حساب الإيراد (يفوّض لـ computeRevenueFromDoctors).
//   6) حفظ الأسعار (مع تأكيد + تحقق من الصلاحيات).
//   7) حفظ مصروف جديد (مع تأكيد).
//
// ليه نفصله عن المكون؟
//   - المكون بقى JSX خالص (سهل القراءة والاختبار البصري).
//   - المنطق الـ stateful له مكان واحد (سهل الصيانة).
//   - لو عايزين نستخدم نفس البيانات في مكان تاني (مثلاً widget ملخص)،
//     نستدعي الـ hook مباشرة.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst } from '../../../services/firestore/cacheFirst';
import { getDoctorUsersQuery } from '../../../services/firestore/profileRoles';
import { getCairoDateParts } from '../../../utils/cairoTime';
import type {
  FinancialViewMode,
  MonthlyExpense,
  MonthlyPrices,
  NewExpenseInput,
  ProMaxSubscriptionPrices,
  RevenueData,
  SubscriptionPrices,
} from '../../../types';
import {
  isValidMonthDocId,
  mapFinancialActionError,
  normalizeMonthDocId,
  sanitizeExpenseDescription,
  sanitizePrices,
  sanitizeProMaxPrices,
} from './securityUtils';
import { computeRevenueFromDoctors } from './revenueCalculator';

/** السنة التي بدأت المنصة فيها عمليات مالية فعلية (قبلها فاضي). */
const FINANCIAL_START_YEAR = 2026;
const SUMMARY_COLLECTION = 'settings';
const SUMMARY_DOC_ID = 'adminDashboardStats';

/** شكل ملخص السنة الحالية المخزن مركزياً (تحديث السنة الحالية فوري عبر Cloud Function). */
interface CurrentYearSummarySnapshot {
  totalRevenue: number;
  // عدادات باقة برو
  monthlyCount: number;
  sixMonthsCount: number;
  yearlyCount: number;
  // عدادات باقة برو ماكس + إيراد منفصل
  // كانت ناقصة من الملخص — كل عداد برو ماكس كان يظهر صفر في العرض السنوي
  // للسنة الحالية لأن الواجهة ما كانتش بتقرأها رغم وجودها في الملخص.
  proMaxMonthlyCount: number;
  proMaxSixMonthsCount: number;
  proMaxYearlyCount: number;
  proMaxRevenue: number;
}

interface UseFinancialDataParams {
  /** هل المستخدم الحالي أدمن (يتحكم في تفعيل التحميلات والحفظ) */
  isAdminUser: boolean;
  /** السنة المعروضة حالياً في اللوحة */
  selectedYear: number;
  /** طريقة عرض البيانات (شهرية / سنوية) */
  viewMode: FinancialViewMode;
  /** الشهر المحدد لعرض/تعديل الأسعار الخاصة به */
  selectedPriceMonth: string;
}

export const useFinancialData = ({
  isAdminUser,
  selectedYear,
  viewMode,
  selectedPriceMonth,
}: UseFinancialDataParams) => {
  // استخدام توقيت القاهرة (لا UTC) لتفادي عرض الشهر التالي خطأً في آخر ساعتين من كل شهر.
  const cairoNowParts = getCairoDateParts(new Date());
  const currentCalendarYear = cairoNowParts.year;

  // ── حالة الأسعار: برو + برو ماكس بشكل منفصل ──
  const [prices, setPrices] = useState<SubscriptionPrices>({ monthly: 0, sixMonths: 0, yearly: 0 });
  const [tempPrices, setTempPrices] = useState<SubscriptionPrices>(prices);
  const [proMaxPrices, setProMaxPrices] = useState<ProMaxSubscriptionPrices>({ monthly: 0, sixMonths: 0, yearly: 0 });
  const [tempProMaxPrices, setTempProMaxPrices] = useState<ProMaxSubscriptionPrices>(proMaxPrices);
  const [editingPrices, setEditingPrices] = useState(false);
  const [allMonthlyPrices, setAllMonthlyPrices] = useState<MonthlyPrices[]>([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false);

  // ── حالة المصروفات ──
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [newExpense, setNewExpense] = useState<NewExpenseInput>({ month: '', amount: 0, description: '' });

  // ── حالة الإيراد ──
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [currentYearSummary, setCurrentYearSummary] = useState<CurrentYearSummarySnapshot | null>(null);
  // عدد أطباء Pro في السنة المختارة ببيانات ناقصة (بلا premiumExpiryDate).
  // يُعرض كتحذير حتى يعرف الأدمن أن الأرقام قد لا تعكس الواقع.
  const [doctorsMissingExpiry, setDoctorsMissingExpiry] = useState(0);

  const [loading, setLoading] = useState(true);

  // ───────────────────────────────────────────────────────────────────────────
  // دوال التحميل — كلها تتحقق من الصلاحيات أولاً
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * تحميل ملخص السنة الحالية من settings/adminDashboardStats.
   * يرجع null إذا لم نكن في السنة الحالية (لأن الملخص المخزن للسنة الحالية فقط).
   */
  const loadCurrentYearSummary = async (): Promise<CurrentYearSummarySnapshot | null> => {
    if (!isAdminUser || selectedYear !== currentCalendarYear) {
      setCurrentYearSummary(null);
      return null;
    }

    try {
      const summarySnap = await getDocCacheFirst(doc(db, SUMMARY_COLLECTION, SUMMARY_DOC_ID));
      if (!summarySnap.exists()) {
        setCurrentYearSummary(null);
        return null;
      }

      const raw = summarySnap.data() as Record<string, unknown>;
      const summaryYear = Number(raw?.countersCurrentYear ?? raw?.currentYear);
      // لو الملخص لسنة مختلفة عن السنة الحالية (نادراً) تجاهله
      if (Number.isFinite(summaryYear) && summaryYear !== currentCalendarYear) {
        setCurrentYearSummary(null);
        return null;
      }

      const toSafeCount = (value: unknown): number =>
        Number.isFinite(Number(value)) ? Number(value) : 0;

      const nextSummary: CurrentYearSummarySnapshot = {
        totalRevenue: toSafeCount(raw?.totalRevenue),
        monthlyCount: toSafeCount(raw?.monthlyPlansCount),
        sixMonthsCount: toSafeCount(raw?.sixMonthsPlansCount),
        yearlyCount: toSafeCount(raw?.yearlyPlansCount),
        // عدادات برو ماكس — موجودة في الملخص لكن كانت محذوفة من القراءة قبل الإصلاح
        proMaxMonthlyCount: toSafeCount(raw?.proMaxMonthlyPlansCount),
        proMaxSixMonthsCount: toSafeCount(raw?.proMaxSixMonthsPlansCount),
        proMaxYearlyCount: toSafeCount(raw?.proMaxYearlyPlansCount),
        proMaxRevenue: toSafeCount(raw?.proMaxRevenue),
      };

      setCurrentYearSummary(nextSummary);
      return nextSummary;
    } catch (error) {
      console.warn('Error loading current year summary:', error);
      setCurrentYearSummary(null);
      return null;
    }
  };

  /** تحميل أسعار الاشتراك لشهر محدد (الشكل: YYYY-MM). */
  const loadPricesForMonth = async (month: string) => {
    if (!isAdminUser) return;

    const normalizedMonth = normalizeMonthDocId(month);
    const zero = { monthly: 0, sixMonths: 0, yearly: 0 };
    if (!isValidMonthDocId(normalizedMonth)) {
      setPrices(zero);
      setTempPrices(zero);
      setProMaxPrices(zero);
      setTempProMaxPrices(zero);
      return;
    }

    try {
      const pricesDoc = await getDocCacheFirst(doc(db, 'subscriptionPrices', normalizedMonth));
      if (pricesDoc.exists()) {
        const raw = pricesDoc.data() as SubscriptionPrices & { proMaxPrices?: ProMaxSubscriptionPrices };
        const data = sanitizePrices(raw);
        const proMaxData = sanitizeProMaxPrices(raw.proMaxPrices);
        setPrices(data);
        setTempPrices(data);
        setProMaxPrices(proMaxData);
        setTempProMaxPrices(proMaxData);
      } else {
        setPrices(zero);
        setTempPrices(zero);
        setProMaxPrices(zero);
        setTempProMaxPrices(zero);
      }
    } catch (error) {
      console.warn('Error loading prices for month:', error);
    }
  };

  /** تحميل كل الأسعار التاريخية (لعرض "سجل الأسعار" في الواجهة). */
  const loadAllPrices = async () => {
    if (!isAdminUser) return;

    try {
      const pricesSnap = await getDocsCacheFirst(query(collection(db, 'subscriptionPrices')));
      const allPrices: MonthlyPrices[] = [];
      pricesSnap.forEach((snapshotDoc) => {
        if (!isValidMonthDocId(snapshotDoc.id)) return;
        const raw = snapshotDoc.data() as SubscriptionPrices & { proMaxPrices?: ProMaxSubscriptionPrices };
        allPrices.push({
          month: snapshotDoc.id,
          prices: sanitizePrices(raw),
          proMaxPrices: raw.proMaxPrices ? sanitizeProMaxPrices(raw.proMaxPrices) : undefined,
        });
      });
      // الأحدث أولاً
      allPrices.sort((a, b) => b.month.localeCompare(a.month));
      setAllMonthlyPrices(allPrices);
    } catch (error) {
      console.warn('Error loading all prices:', error);
    }
  };

  /** تحميل المصروفات الشهرية من Firestore. */
  const loadExpenses = async () => {
    if (!isAdminUser) return;

    try {
      const expensesSnap = await getDocsCacheFirst(query(collection(db, 'expenses')));
      const expensesData: MonthlyExpense[] = [];
      expensesSnap.forEach((snapshotDoc) => {
        if (!isValidMonthDocId(snapshotDoc.id)) return;
        const data = snapshotDoc.data() as Omit<MonthlyExpense, 'month'>;
        expensesData.push({
          month: snapshotDoc.id,
          amount: Number.isFinite(data.amount) ? data.amount : 0,
          description: sanitizeExpenseDescription(data.description || ''),
        });
      });
      expensesData.sort((a, b) => b.month.localeCompare(a.month));
      setExpenses(expensesData);
    } catch (error) {
      console.warn('Error loading expenses:', error);
    }
  };

  /**
   * حساب الإيراد الشهري للسنة المختارة.
   * للسنة الحالية في العرض السنوي: نستخدم الملخص المخزن مسبقاً (يُحدَّث عبر Cloud Function).
   * لأي سنة تاريخية: نحسب من قاعدة الأطباء مباشرة.
   */
  const calculateRevenue = async (summarySnapshot: CurrentYearSummarySnapshot | null) => {
    if (!isAdminUser) return;

    try {
      // حالة خاصة: السنة الحالية في العرض السنوي — لا نحتاج تفاصيل شهرية
      if (selectedYear === currentCalendarYear && viewMode === 'yearly' && summarySnapshot) {
        const revenueArray: RevenueData[] = [];
        for (let month = 1; month <= 12; month += 1) {
          const monthStr = `${selectedYear}-${String(month).padStart(2, '0')}`;
          revenueArray.push({
            month: monthStr,
            revenue: 0,
            monthlyCount: 0,
            sixMonthsCount: 0,
            yearlyCount: 0,
          });
        }
        setRevenueData(revenueArray);
        return;
      }

      // غير ذلك: نحمل الأطباء + الأسعار، ثم نستدعي الحاسبة النقية.
      // ملاحظة: للسنوات القديمة لازم نشمل الأطباء اللي رجعوا free لكن عندهم
      // subscriptionHistory (اشتراكات سابقة). لذلك نشيل فلتر accountType للـ
      // historical years ونعتمد على cache + الفلتر داخل الـ calculator.
      // للسنة الحالية + monthly view: نفلتر بـ accountType لتقليل القراءات.
      const isHistorical = selectedYear < currentCalendarYear;
      const doctorsQuery = isHistorical
        ? getDoctorUsersQuery()
        : getDoctorUsersQuery(where('accountType', 'in', ['premium', 'pro_max']));
      const doctorUsersSnap = await getDocsCacheFirst(doctorsQuery);
      const doctors = doctorUsersSnap.docs.map(
        (snapshotDoc) => snapshotDoc.data() as Record<string, any>
      );

      const pricesSnap = await getDocsCacheFirst(query(collection(db, 'subscriptionPrices')));
      // خريطة مركبة: لكل شهر { prices: برو, proMaxPrices: برو ماكس }
      const pricesByMonth: Record<string, { prices: SubscriptionPrices; proMaxPrices?: ProMaxSubscriptionPrices }> = {};
      pricesSnap.forEach((snapshotDoc) => {
        if (!isValidMonthDocId(snapshotDoc.id)) return;
        const raw = snapshotDoc.data() as SubscriptionPrices & { proMaxPrices?: ProMaxSubscriptionPrices };
        pricesByMonth[snapshotDoc.id] = {
          prices: sanitizePrices(raw),
          proMaxPrices: raw.proMaxPrices ? sanitizeProMaxPrices(raw.proMaxPrices) : undefined,
        };
      });

      const { revenueData: computed, doctorsMissingExpiry: missing } = computeRevenueFromDoctors({
        doctors,
        pricesByMonth,
        selectedYear,
      });

      setRevenueData(computed);
      setDoctorsMissingExpiry(missing);
    } catch (error) {
      console.warn('Error calculating revenue:', error);
    }
  };

  /** دالة التحميل الرئيسية — تستدعى عند تغيير السنة أو طريقة العرض. */
  const loadData = async () => {
    if (!isAdminUser) return;
    setLoading(true);
    try {
      const summarySnapshot = await loadCurrentYearSummary();
      await Promise.all([
        loadPricesForMonth(selectedPriceMonth),
        loadAllPrices(),
        loadExpenses(),
        calculateRevenue(summarySnapshot),
      ]);
    } catch (error) {
      console.warn('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // دوال الكتابة (Save Operations)
  // ───────────────────────────────────────────────────────────────────────────

  /** حفظ الأسعار المعدَّلة للشهر المحدد (مع تأكيد). */
  const savePrices = async () => {
    if (!isAdminUser) {
      alert('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    const normalizedMonth = normalizeMonthDocId(selectedPriceMonth);
    if (!isValidMonthDocId(normalizedMonth)) {
      alert('❌ صيغة الشهر غير صحيحة');
      return;
    }

    const safePrices = sanitizePrices(tempPrices);
    const safeProMaxPrices = sanitizeProMaxPrices(tempProMaxPrices);

    // تأكيد قبل الكتابة فوق الأسعار الحالية — يعرض الأسعار الجديدة للفئتين.
    const confirmMessage =
      `هل تريد حفظ أسعار شهر ${normalizedMonth}؟\n\n` +
      `═══ باقة برو ═══\n` +
      `• شهري: ${safePrices.monthly.toLocaleString('ar-EG')} ج.م\n` +
      `• 6 شهور: ${safePrices.sixMonths.toLocaleString('ar-EG')} ج.م\n` +
      `• سنوي: ${safePrices.yearly.toLocaleString('ar-EG')} ج.م\n\n` +
      `═══ باقة برو ماكس ═══\n` +
      `• شهري: ${safeProMaxPrices.monthly.toLocaleString('ar-EG')} ج.م\n` +
      `• 6 شهور: ${safeProMaxPrices.sixMonths.toLocaleString('ar-EG')} ج.م\n` +
      `• سنوي: ${safeProMaxPrices.yearly.toLocaleString('ar-EG')} ج.م\n\n` +
      `سيتم استبدال الأسعار الحالية لهذا الشهر.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      // نحفظ في نفس document: أسعار برو في الحقول الأساسية + proMaxPrices كحقل داخلي
      await setDoc(doc(db, 'subscriptionPrices', normalizedMonth), {
        ...safePrices,
        proMaxPrices: safeProMaxPrices,
      });
      setPrices(safePrices);
      setProMaxPrices(safeProMaxPrices);
      setEditingPrices(false);
      await loadAllPrices();
      alert('✅ تم حفظ الأسعار بنجاح');
    } catch (error: unknown) {
      console.error('Error saving prices:', error);
      alert(`❌ ${mapFinancialActionError(error, 'حدث خطأ في حفظ الأسعار')}`);
    }
  };

  /** حفظ مصروف جديد للشهر المحدد (سيستبدل أي مصروف سابق لنفس الشهر). */
  const saveExpense = async () => {
    if (!isAdminUser) {
      alert('غير مصرح لك بتنفيذ هذا الإجراء.');
      return;
    }

    const normalizedMonth = normalizeMonthDocId(newExpense.month);
    if (!isValidMonthDocId(normalizedMonth) || newExpense.amount <= 0) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    const safeAmount = Number.isFinite(newExpense.amount) ? newExpense.amount : 0;
    const safeDescription = sanitizeExpenseDescription(newExpense.description);

    // تأكيد قبل حفظ/استبدال مصروف الشهر (ملاحظة: يوجد مستند واحد لكل شهر).
    const confirmMessage =
      `هل تريد حفظ مصروف شهر ${normalizedMonth}؟\n\n` +
      `• المبلغ: ${safeAmount.toLocaleString('ar-EG')} ج.م\n` +
      `• الوصف: ${safeDescription || '(بدون وصف)'}\n\n` +
      `إن كان هناك مصروف محفوظ مسبقاً لهذا الشهر، سيتم استبداله.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await setDoc(doc(db, 'expenses', normalizedMonth), {
        amount: safeAmount,
        description: safeDescription,
      });
      setNewExpense({ month: '', amount: 0, description: '' });
      await loadExpenses();
      await calculateRevenue(currentYearSummary);
      alert('✅ تم حفظ المصروف بنجاح');
    } catch (error: unknown) {
      console.error('Error saving expense:', error);
      alert(`❌ ${mapFinancialActionError(error, 'حدث خطأ في حفظ المصروف')}`);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Effects — إعادة التحميل عند تغيير المدخلات
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAdminUser) {
      setLoading(false);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, viewMode, isAdminUser]);

  useEffect(() => {
    if (!isAdminUser) return;
    loadPricesForMonth(selectedPriceMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPriceMonth, isAdminUser]);

  return {
    // بيانات أسعار برو
    prices,
    tempPrices,
    setTempPrices,
    // بيانات أسعار برو ماكس
    proMaxPrices,
    tempProMaxPrices,
    setTempProMaxPrices,
    editingPrices,
    setEditingPrices,
    allMonthlyPrices,
    showPriceHistory,
    setShowPriceHistory,
    // بيانات المصروفات
    expenses,
    newExpense,
    setNewExpense,
    // بيانات الإيراد
    revenueData,
    currentYearSummary,
    doctorsMissingExpiry,
    // حالة التحميل
    loading,
    // معلومات تقويمية للعرض
    currentCalendarYear,
    financialStartYear: FINANCIAL_START_YEAR,
    // عمليات الكتابة
    savePrices,
    saveExpense,
  };
};
