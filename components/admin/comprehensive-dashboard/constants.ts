/**
 * الملف: constants.ts
 * الوصف: خريطة عناصر لوحة التحكم للإدارة.
 * يحتوي على:
 * 1) INITIAL_DASHBOARD_STATS: قيم البداية للإحصاءات.
 * 2) NAV_ITEMS: تعريف عناصر التنقل الجانبي وأسمائها.
 */

import { DashboardStats, NavItem } from './types';

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalDoctors: 0,
  pendingDoctors: 0,
  approvedDoctors: 0,
  rejectedDoctors: 0,
  totalPatients: 0,
  doctorBlacklisted: 0,
  publicBlacklisted: 0,
  totalBlacklisted: 0,
  activeSubscriptions: 0,
  freeDocsCount: 0,
  premiumDocsCount: 0,
  proMaxDocsCount: 0,
  totalSmartRxFree: 0,
  totalSmartRxPro: 0,
  totalSmartRxProMax: 0,
  totalPrintsFree: 0,
  totalPrintsPro: 0,
  totalPrintsProMax: 0,
  homeBannerItems: 0,
  footerContacts: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
};

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'overview', label: 'لوحة التحكم', icon: 'dashboard' },
  { id: 'verification', label: 'تحقق الأطباء الجدد', icon: 'verify' },
  { id: 'accounts', label: 'إدارة الأطباء', icon: 'users' },
  { id: 'accountTypesControl', label: 'التحكم في أنواع الحساب', icon: 'accountTypesControl' },
  { id: 'financial', label: 'الإدارة المالية', icon: 'finance' },
  { id: 'blacklist', label: 'قائمة الحظر', icon: 'ban' },
  { id: 'disabledAccounts', label: 'الحسابات المعطّلة', icon: 'ban' },
  { id: 'externalNotifications', label: 'إرسال إشعارات', icon: 'externalNotifications' },
  { id: 'updateBroadcasts', label: 'تحديثات التطبيق', icon: 'updates' },
  { id: 'patients', label: 'إدارة الجمهور', icon: 'patients' },
  { id: 'publicBlacklist', label: 'حظر الجمهور', icon: 'publicBlacklist' },
  { id: 'reports', label: 'التقارير والإحصاءات', icon: 'reports' },
  { id: 'homeBanner', label: 'بانر الصفحة الرئيسية', icon: 'homeBanner' },
  { id: 'prescriptionFooterLine', label: 'سطر أسفل الروشتة', icon: 'prescriptionFooterLine' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings' },
] as const;
