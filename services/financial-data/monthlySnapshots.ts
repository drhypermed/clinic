// ─────────────────────────────────────────────────────────────────────────────
// Monthly Snapshots — لقطات إقفال شهري للتقارير المالية
// ─────────────────────────────────────────────────────────────────────────────
// الفكرة: بمجرد ما شهر يخلص ويعدّي عليه 28 يوم، نحفظ "لقطة" ثابتة لأرقامه
// (إيرادات، مصروفات، عدد كشوف، إلخ). كده مش لازم نقرأ آلاف السجلات في كل مرة
// الطبيب يفتح تقارير شهر قديم — قراءة واحدة من الـsnapshot كفاية.
//
// مهم: السلوك ده "إقفال محاسبي" — الأرقام بتتجمد في الـsnapshot. لو الطبيب عدّل
// سجل قديم بعد كده، الـsnapshot ما يتأثرش. لو حابب يحدّث الأرقام، يعدلها يدوياً
// عبر UI التقارير.
//
// **هذه المرحلة (Phase A)**: snapshots بتتبني تلقائياً وتتحفظ. الـuseFinancialStats
// لسه بيقرأ من السجلات الخام. التحويل للقراءة من snapshots في مرحلة منفصلة
// عشان نتأكد إن الأرقام مطابقة قبل الاعتماد عليها.
// ─────────────────────────────────────────────────────────────────────────────

import { collection, doc, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocsCacheFirst } from '../firestore/cacheFirst';
import { branchDocKey } from './normalizers';
import type { DailyFinancialData, MonthlyFinancialData } from './types';
import type { PatientRecord } from '../../app/drug-catalog/types/patient';
import { collectConsultationVisits } from '../../components/financial-reports/hooks/useFinancialStats/collectConsultationVisits';
import { buildVisitFinancialByDate } from '../../components/financial-reports/hooks/useFinancialStats/buildVisitFinancialByDate';

/** الفترة السماحية بعد نهاية الشهر قبل ما يصبح eligible للإقفال (28 يوم). */
const SNAPSHOT_GRACE_DAYS = 28;

/**
 * نسخة منطق الـsnapshot — لو غيّرنا طريقة الحساب لاحقاً (إضافة/تعديل قيم)،
 * نزوّد الرقم ده فيتم regenerate تلقائياً للشهور القديمة.
 *
 * v2 (2026-05): أضفنا dailyBreakdown عشان التقارير تقدر تقرأ تفاصيل اليوم
 * من snapshot بدل ما تلف على السجلات الخام للشهور المغلقة.
 *
 * v3 (2026-05): إصلاح bug إن snapshots كانت تُحفظ بأصفار في حقول
 * interventions/other/expenses للشهور اللي سنتها مش في yearlyDailyMap
 * المحمّلة لحظة الإقفال. v3 بيتجاهل كل v2 ويعيد بناءها بقيم صحيحة بعد
 * تحميل maps السنة المعنية.
 */
const SNAPSHOT_VERSION = 3;

/**
 * تفصيل أرقام يوم واحد داخل snapshot — يكفي لـuseFinancialStats عشان
 * تبني chartDays و selectedDayStats للشهر المغلق بدون قراءة records.
 */
export interface MonthlySnapshotDailyEntry {
    exams: number;
    consultations: number;
    examsIncome: number;
    consultsIncome: number;
    collectedCash: number;
    insuranceClaims: number;
    discountExpense: number;
    interventionsRevenue: number;
    otherRevenue: number;
    insuranceExtrasTotal: number;
    dailyExpense: number;
}

/**
 * هيكل الـsnapshot المخزن في Firestore.
 * المسار: `users/{uid}/financialData/monthlySnapshots/entries/{branchKey}__{YYYY-MM}`
 */
export interface MonthlySnapshot {
    /** YYYY-MM */
    monthKey: string;
    /** branchId الفرع (`main` أو معرّف فرع) */
    branchId: string;
    /** نسخة logic الـsnapshot — تتغير لو حصل تعديل في الـcomputation */
    version: number;

    // ─── الأعداد ─────────────────────────────
    examsCount: number;
    consultationsCount: number;

    // ─── الإيرادات من السجلات ────────────────
    examsIncome: number;          // فواتير الكشوف (بعد الخصم/قبل التحصيل)
    consultsIncome: number;       // فواتير الاستشارات
    collectedCash: number;        // الكاش المحصّل فعلاً (مش بما فيه التأمين)
    insuranceClaims: number;      // مطالبات التأمين
    discountExpense: number;      // قيمة الخصومات (تُحسب كمصروف)

    // ─── الإيرادات الإضافية من dailyEntries ──
    interventionsRevenue: number;  // التداخلات (يدوي)
    otherRevenue: number;          // دخل آخر (يدوي)
    insuranceExtrasTotal: number;  // مطالبات التأمين الإضافية (مش من الكشوف)

    // ─── المصروفات من monthlyEntries ─────────
    rentExpense: number;
    salariesExpense: number;
    toolsExpense: number;
    electricityExpense: number;
    otherExpense: number;

    // ─── المصروفات اليومية المُجمَّعة ──────────
    dailyExpensesTotal: number;

    // ─── إجماليات محسوبة (cache) ─────────────
    totalRevenue: number;          // examsIncome + consultsIncome + interventionsRevenue + otherRevenue + insuranceExtrasTotal
    totalExpenses: number;         // كل المصروفات + discountExpense
    netProfit: number;             // totalRevenue - totalExpenses

    // ─── تفصيل يومي (v2+) ─────────────────────
    /**
     * خريطة dateKey (YYYY-MM-DD) → أرقام اليوم. تسمح للتقارير ترسم charts
     * يومية + تعرض إحصائيات يوم محدد بدون ما تلف على records للشهر المغلق.
     * snapshots v1 ما عندهاش هذا الحقل.
     */
    dailyBreakdown?: Record<string, MonthlySnapshotDailyEntry>;

    // ─── Metadata ────────────────────────────
    closedAt: number;              // وقت إنشاء الـsnapshot
    closedAutomatically: boolean;  // true لو تم تلقائياً، false لو يدوياً
    recordsCountAtClose: number;   // عدد السجلات وقت الإقفال (للـvalidation)
    manuallyEdited: boolean;       // true لو الطبيب عدّل الأرقام يدوياً
    lastModifiedAt: number;        // آخر تعديل (تلقائي أو يدوي)
}

/**
 * يحدّد لو الشهر "eligible" للإقفال — يعني عدّى عليه ≥28 يوم بعد نهايته.
 * مثال: شهر أبريل 2026 (يخلص 30 أبريل) → eligible من 29 مايو 2026.
 *
 * الشهر الحالي والشهر السابق المباشر (في الـ28 يوم الأولى) **ليسا** eligible —
 * لأن الطبيب ممكن لسه يكتب فيهم سجلات أو يعدّل.
 */
const isMonthEligibleForClose = (monthKey: string, now: Date = new Date()): boolean => {
    const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
    if (!match) return false;
    const year = parseInt(match[1], 10);
    const monthOneIndexed = parseInt(match[2], 10);
    if (monthOneIndexed < 1 || monthOneIndexed > 12) return false;
    // أول لحظة في الشهر التالي:
    // monthOneIndexed لو = 4 (أبريل)، الشهر التالي = مايو = month index 4 في JS Date.
    const nextMonthStart = new Date(year, monthOneIndexed, 1, 0, 0, 0, 0);
    const eligibilityDate = new Date(nextMonthStart);
    eligibilityDate.setDate(eligibilityDate.getDate() + SNAPSHOT_GRACE_DAYS);
    return now.getTime() >= eligibilityDate.getTime();
};

/**
 * يبني monthKey بصيغة YYYY-MM من كائن Date.
 */
const formatMonthKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

/** المعطيات اللازمة لحساب snapshot. كلها مُمرَّرة من الـcaller (مش بنقرأ Firestore هنا). */
interface ComputeMonthlySnapshotInput {
    monthKey: string;
    branchId: string;
    /** كل سجلات الطبيب — ستُفلتر داخلياً للشهر والفرع المطلوبين */
    records: PatientRecord[];
    /** خريطة dailyEntries للسنة — لـinterventions/otherRevenue/dailyExpense/insuranceExtras */
    yearlyDailyMap: Record<string, DailyFinancialData>;
    /** بيانات monthlyExpenses لهذا الشهر */
    monthlyExpenses: MonthlyFinancialData;
    /** أسعار الكشف/الاستشارة الحالية (fallback لو السجل ما فيهوش serviceBasePrice) */
    examPrice: number;
    consultPrice: number;
    closedAutomatically: boolean;
}

/**
 * يحسب snapshot من البيانات الخام بنفس logic الـuseFinancialStats.
 * **pure function** — مش بيقرأ ولا يكتب. النتيجة جاهزة للحفظ.
 */
const computeMonthlySnapshot = ({
    monthKey,
    branchId,
    records,
    yearlyDailyMap,
    monthlyExpenses,
    examPrice,
    consultPrice,
    closedAutomatically,
}: ComputeMonthlySnapshotInput): MonthlySnapshot => {
    // فلترة السجلات لهذا الفرع. السجلات بدون branchId نعتبرها main.
    const branchRecords = records.filter((r) => (r.branchId || 'main') === branchId);

    // نطاق الشهر بالميلي ثانية
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const monthZeroIndexed = parseInt(monthStr, 10) - 1;
    const startTs = new Date(year, monthZeroIndexed, 1, 0, 0, 0, 0).getTime();
    const endTs = new Date(year, monthZeroIndexed + 1, 1, 0, 0, 0, 0).getTime() - 1;

    // helper لحل سعر الزيارة (نفس فكرة useFinancialStats)
    const resolveBasePriceByDate = {
        exam: () => Math.max(0, examPrice || 0),
        consultation: () => Math.max(0, consultPrice || 0),
    };

    // dailyBreakdown — هيتبني تدريجياً مع عدّ كل سجل/زيارة/يوم.
    const dailyBreakdown: Record<string, MonthlySnapshotDailyEntry> = {};
    const ensureDay = (dateKey: string): MonthlySnapshotDailyEntry => {
        if (!dailyBreakdown[dateKey]) {
            dailyBreakdown[dateKey] = {
                exams: 0,
                consultations: 0,
                examsIncome: 0,
                consultsIncome: 0,
                collectedCash: 0,
                insuranceClaims: 0,
                discountExpense: 0,
                interventionsRevenue: 0,
                otherRevenue: 0,
                insuranceExtrasTotal: 0,
                dailyExpense: 0,
            };
        }
        return dailyBreakdown[dateKey];
    };

    // عد الكشوف داخل الشهر/الفرع + توزيعها على dailyBreakdown
    let examsCount = 0;
    branchRecords.forEach((record) => {
        if (record.isConsultationOnly) return;
        const recTs = Date.parse(String(record.date || ''));
        if (!Number.isFinite(recTs) || recTs < startTs || recTs > endTs) return;
        examsCount += 1;
        const dayKey = String(record.date || '').slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) ensureDay(dayKey).exams += 1;
    });

    // الاستشارات (يستخدم نفس helper الـuseFinancialStats للـdedup السليم)
    const consultationVisits = collectConsultationVisits(branchRecords);
    let consultationsCount = 0;
    consultationVisits.forEach((visit) => {
        const visitTs = Date.parse(String(visit.date || ''));
        if (!Number.isFinite(visitTs) || visitTs < startTs || visitTs > endTs) return;
        consultationsCount += 1;
        const dayKey = String(visit.date || '').slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) ensureDay(dayKey).consultations += 1;
    });

    // التفاصيل المالية لكل يوم (نفس helper اللي بيستخدمه useFinancialStats)
    const visitFinancialByDate = buildVisitFinancialByDate({
        records: branchRecords,
        consultationVisits,
        startTs,
        endTs,
        resolveBasePriceByDate,
    });

    let examsIncome = 0;
    let consultsIncome = 0;
    let collectedCash = 0;
    let insuranceClaims = 0;
    let discountExpense = 0;
    Object.entries(visitFinancialByDate).forEach(([dateKey, day]) => {
        examsIncome += day.examsIncome;
        consultsIncome += day.consultsIncome;
        collectedCash += day.collectedCash;
        insuranceClaims += day.insuranceClaims;
        discountExpense += day.discountExpense;
        // نضع نفس القيم في dailyBreakdown للاستخدام في chartDays/selectedDay
        const entry = ensureDay(dateKey);
        entry.examsIncome += day.examsIncome;
        entry.consultsIncome += day.consultsIncome;
        entry.collectedCash += day.collectedCash;
        entry.insuranceClaims += day.insuranceClaims;
        entry.discountExpense += day.discountExpense;
    });

    // الإيرادات الإضافية من dailyEntries (interventions, other، insuranceExtras)
    let interventionsRevenue = 0;
    let otherRevenue = 0;
    let insuranceExtrasTotal = 0;
    let dailyExpensesTotal = 0;
    const monthEntriesPrefix = monthKey + '-'; // YYYY-MM-
    Object.entries(yearlyDailyMap).forEach(([dateKey, entry]) => {
        if (!dateKey.startsWith(monthEntriesPrefix)) return;
        const intervVal = Number(entry.interventionsRevenue) || 0;
        const otherVal = Number(entry.otherRevenue) || 0;
        const expenseVal = Number(entry.dailyExpense) || 0;
        interventionsRevenue += intervVal;
        otherRevenue += otherVal;
        dailyExpensesTotal += expenseVal;
        let dayInsuranceExtras = 0;
        if (Array.isArray(entry.insuranceExtras)) {
            entry.insuranceExtras.forEach((extra: any) => {
                const amount = Number(extra?.amount) || 0;
                dayInsuranceExtras += amount;
            });
        }
        insuranceExtrasTotal += dayInsuranceExtras;
        // نضيف القيم اليومية للـbreakdown
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
            const dayEntry = ensureDay(dateKey);
            dayEntry.interventionsRevenue += intervVal;
            dayEntry.otherRevenue += otherVal;
            dayEntry.dailyExpense += expenseVal;
            dayEntry.insuranceExtrasTotal += dayInsuranceExtras;
        }
    });

    // المصروفات الشهرية الثابتة
    const rentExpense = Number(monthlyExpenses.rentExpense) || 0;
    const salariesExpense = Number(monthlyExpenses.salariesExpense) || 0;
    const toolsExpense = Number(monthlyExpenses.toolsExpense) || 0;
    const electricityExpense = Number(monthlyExpenses.electricityExpense) || 0;
    const otherExpense = Number(monthlyExpenses.otherExpense) || 0;

    // الإجماليات
    const totalRevenue = examsIncome + consultsIncome + interventionsRevenue + otherRevenue + insuranceExtrasTotal;
    const totalExpenses = rentExpense + salariesExpense + toolsExpense + electricityExpense + otherExpense
        + dailyExpensesTotal + discountExpense;
    const netProfit = totalRevenue - totalExpenses;

    const now = Date.now();

    return {
        monthKey,
        branchId,
        version: SNAPSHOT_VERSION,
        examsCount,
        consultationsCount,
        examsIncome,
        consultsIncome,
        collectedCash,
        insuranceClaims,
        discountExpense,
        interventionsRevenue,
        otherRevenue,
        insuranceExtrasTotal,
        rentExpense,
        salariesExpense,
        toolsExpense,
        electricityExpense,
        otherExpense,
        dailyExpensesTotal,
        totalRevenue,
        totalExpenses,
        netProfit,
        dailyBreakdown,
        closedAt: now,
        closedAutomatically,
        recordsCountAtClose: branchRecords.length,
        manuallyEdited: false,
        lastModifiedAt: now,
    };
};

/** يحفظ snapshot في Firestore. internal — استخدم ensureSnapshotsForClosedMonths. */
const saveMonthlySnapshot = async (
    userId: string,
    snapshot: MonthlySnapshot,
): Promise<void> => {
    if (!userId || !snapshot.monthKey) return;
    const docRef = doc(
        db,
        'users', userId,
        'financialData', 'monthlySnapshots',
        'entries', branchDocKey(snapshot.monthKey, snapshot.branchId),
    );
    await setDoc(docRef, snapshot, { merge: true });
};

/**
 * يقرأ كل الـsnapshots الموجودة للطبيب — للـauto-close logic عشان ما نكررش.
 *
 * **مهم**: snapshots بـversion أقل من SNAPSHOT_VERSION الحالي لا تُحسب — يعني
 * هتتعاد كتابتها لما الـauto-close يشتغل. ده يضمن إن أي تحسين في logic الـsnapshot
 * (مثلاً إضافة dailyBreakdown في v2) يطبَّق تلقائياً على الـsnapshots القديمة.
 */
const getExistingSnapshotMonthKeys = async (
    userId: string,
    branchId?: string,
): Promise<Set<string>> => {
    if (!userId) return new Set();
    try {
        const entriesRef = collection(
            db,
            'users', userId,
            'financialData', 'monthlySnapshots',
            'entries',
        );
        // نلتقط كل وثائق الفرع الحالي بسهولة عبر `branchId` field داخل الـsnapshot نفسه.
        const targetBranch = branchId || 'main';
        const snap = await getDocsCacheFirst(query(entriesRef, where('branchId', '==', targetBranch)));
        const keys = new Set<string>();
        snap.forEach((d) => {
            const data = d.data() as Partial<MonthlySnapshot>;
            if (!data.monthKey) return;
            // snapshots قديمة بـversion أقل = نتجاهلها عشان تتعاد كتابتها بـlogic جديد.
            const version = Number(data.version) || 0;
            if (version < SNAPSHOT_VERSION) return;
            keys.add(data.monthKey);
        });
        return keys;
    } catch (err) {
        console.warn('[monthlySnapshots] getExistingSnapshotMonthKeys failed:', err);
        return new Set();
    }
};

/**
 * يقرأ كل snapshots سنة معينة (للقراءة في useFinancialStats — استبدال
 * الحساب من records للشهور المغلقة).
 */
export const getMonthlySnapshotsForYear = async (
    userId: string,
    year: number,
    branchId?: string,
): Promise<Record<string, MonthlySnapshot>> => {
    if (!userId || !year) return {};
    try {
        const entriesRef = collection(
            db,
            'users', userId,
            'financialData', 'monthlySnapshots',
            'entries',
        );
        const targetBranch = branchId || 'main';
        const snap = await getDocsCacheFirst(query(entriesRef, where('branchId', '==', targetBranch)));
        const yearPrefix = `${year}-`;
        const out: Record<string, MonthlySnapshot> = {};
        snap.forEach((d) => {
            const data = d.data() as MonthlySnapshot;
            if (!data?.monthKey || !data.monthKey.startsWith(yearPrefix)) return;
            const version = Number(data.version) || 0;
            if (version < SNAPSHOT_VERSION) return;
            out[data.monthKey] = data;
        });
        return out;
    } catch (err) {
        console.warn('[monthlySnapshots] getMonthlySnapshotsForYear failed:', err);
        return {};
    }
};

/** المعطيات لـ`ensureSnapshotsForClosedMonths`. */
interface EnsureSnapshotsInput {
    userId: string;
    branchId: string;
    records: PatientRecord[];
    yearlyDailyMap: Record<string, DailyFinancialData>;
    yearlyMonthlyMap: Record<string, MonthlyFinancialData>;
    examPrice: number;
    consultPrice: number;
    /**
     * السنوات اللي الـmaps المُمرَّرة (yearlyDailyMap + yearlyMonthlyMap) بتغطيها.
     * الإقفال هيتم بس لشهور هذه السنوات — لمنع كتابة snapshot بصفر للسنوات
     * اللي records تغطيها لكن maps لأ (interventions/expenses هتطلع zero).
     * مرّر السنوات المحمَّلة فعلاً (مثلاً [2026] أو [2025, 2026]).
     */
    loadedMapYears: number[];
    /** الآن — للـtesting (قابل للتجاوز). الافتراضي = الوقت الحقيقي. */
    now?: Date;
}

/**
 * يضمن إن كل شهر eligible للإقفال (>28 يوم بعد نهايته) عنده snapshot محفوظ.
 *
 * - بيلف على شهور آخر 7 سنين (84 شهر).
 * - بيتجاهل الشهور اللي عندها snapshot بالـversion الحالي (مش بيكتب فوقها).
 * - بيتجاهل أي شهر سنته **مش محملة في records** — لمنع كتابة snapshot صفر
 *   لشهر records ما تحملش له.
 * - بيتجاهل أي شهر سنته **مش في loadedMapYears** — لمنع كتابة snapshot
 *   بـinterventions/expenses=0 لما yearlyDailyMap/Map ما يغطّيش السنة دي.
 *   الإقفال يحصل بس لما الـcaller يضمن إن الـmaps محمّلة.
 * - non-blocking: لو فشل في شهر، بنكمل لباقي الشهور.
 */
export const ensureSnapshotsForClosedMonths = async ({
    userId,
    branchId,
    records,
    yearlyDailyMap,
    yearlyMonthlyMap,
    examPrice,
    consultPrice,
    loadedMapYears,
    now = new Date(),
}: EnsureSnapshotsInput): Promise<void> => {
    if (!userId) return;
    if (!Array.isArray(loadedMapYears) || loadedMapYears.length === 0) return;

    // نلف على آخر 84 شهر (7 سنين) — يكفي لمعظم الأطباء حتى الأقدم.
    // ملاحظة: snapshots بتتراكم تدريجياً بمرور الوقت — لو الطبيب لسه ما فتحش
    // تقارير سنة معينة، snapshots شهورها هتتم لما يفتحها أول مرة.
    const monthsToCheck: string[] = [];
    const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let i = 0; i < 84; i++) {
        cursor.setMonth(cursor.getMonth() - 1);
        monthsToCheck.push(formatMonthKey(cursor));
    }

    // فلترة الـeligible فقط (>28 يوم بعد نهاية الشهر)
    const eligibleMonths = monthsToCheck.filter((mk) => isMonthEligibleForClose(mk, now));
    if (eligibleMonths.length === 0) return;

    // السنوات اللي records تغطيها (للفرع الحالي).
    const branchRecords = records.filter((r) => (r.branchId || 'main') === branchId);
    const loadedRecordYears = new Set<number>();
    for (const record of branchRecords) {
        const isoDate = String(record.date || '');
        const year = parseInt(isoDate.slice(0, 4), 10);
        if (Number.isFinite(year) && year > 1900) {
            loadedRecordYears.add(year);
        }
    }
    const allowedMapYearsSet = new Set(loadedMapYears);

    // اقرأ الـsnapshots الموجودة (بـversion الحالي) عشان ما نكتبش فوقها.
    // snapshots بـversion أقدم بتُتجاهل في getExistingSnapshotMonthKeys فيتعاد
    // كتابتها هنا تلقائياً = إصلاح snapshots المعطوبة من v2.
    const existingKeys = await getExistingSnapshotMonthKeys(userId, branchId);
    const monthsNeedingClose = eligibleMonths.filter((mk) => {
        if (existingKeys.has(mk)) return false;
        const monthYear = parseInt(mk.slice(0, 4), 10);
        // لازم records وmaps الاتنين يغطّوا السنة دي عشان الـsnapshot يطلع كامل.
        return loadedRecordYears.has(monthYear) && allowedMapYearsSet.has(monthYear);
    });
    if (monthsNeedingClose.length === 0) return;

    // احسب وحفظ snapshot لكل شهر ناقص
    for (const monthKey of monthsNeedingClose) {
        try {
            const monthlyExpenses = yearlyMonthlyMap[monthKey] || {};
            const snapshot = computeMonthlySnapshot({
                monthKey,
                branchId,
                records,
                yearlyDailyMap,
                monthlyExpenses,
                examPrice,
                consultPrice,
                closedAutomatically: true,
            });
            await saveMonthlySnapshot(userId, snapshot);
        } catch (err) {
            console.warn(`[monthlySnapshots] failed to close month ${monthKey}:`, err);
        }
    }
};
