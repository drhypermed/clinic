/**
 * خدمة البيانات المالية (Financial Data Service) — الواجهة الموحّدة
 *
 * هذا الملف يعمل كـ aggregator يجمع كل الوظائف الموزعة على modules فرعية
 * ويُصدّرها كـ object واحد `financialDataService` للحفاظ على التوافق مع
 * جميع المستهلكين الحاليين في التطبيق.
 *
 * البنية الداخلية للوحدة:
 *   - `types.ts`              : واجهات البيانات (DailyFinancialData, ...).
 *   - `normalizers.ts`        : تحويلات الأرقام/التواريخ/الأخطاء.
 *   - `bookingConfigMirror.ts`: مزامنة مرآة الأسعار لنظام السكرتارية.
 *   - `dailyEntries.ts`       : عمليات البيانات المالية اليومية.
 *   - `monthlyEntries.ts`     : عمليات المصروفات الشهرية الثابتة.
 *   - `labels.ts`             : مسميات بنود الدخل القابلة للتخصيص.
 *   - `prices.ts`             : أسعار الكشف/الاستشارة (ثابتة + شهرية + bySecret).
 *   - `priceHistory.ts`       : سجل تغييرات الأسعار.
 */

import { syncAllMonthlyPricesToBookingConfig } from './bookingConfigMirror';
import {
    getAllDailyEntriesForMonth,
    getDailyData,
    getYearlyDailyEntries,
    saveDailyData,
    subscribeToDailyData,
} from './dailyEntries';
import {
    getLabels,
    saveLabels,
    subscribeToLabels,
} from './labels';
import {
    getMonthlyData,
    getYearlyMonthlyEntries,
    saveMonthlyData,
    subscribeToMonthlyData,
} from './monthlyEntries';
import {
    deletePriceChangeEntry,
    getPriceChangeHistory,
} from './priceHistory';
import { migratePriceSnapshots } from './priceSnapshotMigration';
import {
    getMonthlyPrices,
    getMonthlyPricesBySecret,
    getPrices,
    getPricesBySecret,
    saveFixedPricesWithHistory,
    saveMonthlyPrices,
    savePrices,
    subscribeToMonthlyPrices,
    subscribeToPrices,
    subscribeToPricesBySecret,
} from './prices';
// Monthly snapshots — لقطات إقفال الشهور (>28 يوم بعد نهاية الشهر).
// بنحفظ أرقام الشهر الثابتة مرة واحدة فيتجمدوا — التقارير المالية بتقرا منها
// بدل ما تحسب من records آلاف المرات. توفير ضخم في تكلفة Firestore.
import {
    ensureSnapshotsForClosedMonths,
    getMonthlySnapshotsForYear,
} from './monthlySnapshots';

export type {
    DailyFinancialData,
    MonthlyFinancialData,
    PriceChangeHistoryEntry,
} from './types';
export type { MonthlySnapshot } from './monthlySnapshots';

/** الواجهة الموحّدة لخدمة البيانات المالية */
export const financialDataService = {
    // Booking config backfill
    syncAllMonthlyPricesToBookingConfig,

    // Daily entries
    getDailyData,
    saveDailyData,
    subscribeToDailyData,
    getAllDailyEntriesForMonth,
    getYearlyDailyEntries,

    // Monthly entries
    getMonthlyData,
    saveMonthlyData,
    subscribeToMonthlyData,
    getYearlyMonthlyEntries,

    // Labels
    saveLabels,
    getLabels,
    subscribeToLabels,

    // Prices — Legacy / Fixed
    savePrices,
    saveFixedPricesWithHistory,
    getPrices,
    subscribeToPrices,

    // Prices — Monthly overrides
    saveMonthlyPrices,
    getMonthlyPrices,
    subscribeToMonthlyPrices,

    // Prices — By Secret (booking mirror)
    getMonthlyPricesBySecret,
    getPricesBySecret,
    subscribeToPricesBySecret,

    // Price change history
    getPriceChangeHistory,
    deletePriceChangeEntry,

    // Price snapshot migration (للتعويض عن الكشوفات القديمة بدون serviceBasePrice)
    migratePriceSnapshots,

    // Monthly snapshots — إقفال شهري + قراءة لقطات السنة
    ensureSnapshotsForClosedMonths,
    getMonthlySnapshotsForYear,
};
