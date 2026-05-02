/**
 * الملف: constants.ts
 * الوصف: خريطة عناصر لوحة التحكم للإدارة.
 * يحتوي على:
 * 1) INITIAL_DASHBOARD_STATS: قيم البداية للإحصاءات.
 * 2) NAV_ITEMS: تعريف عناصر التنقل الجانبي وأسمائها.
 */

import { DashboardStats, NavGroup, NavItem } from './types';

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
  // عدادات ميزات الـAI الـ5 × 3 فئات (تبدأ كلها صفر، تتحدّث من Cloud Function)
  // ✂️ شيلنا الترجمة (2026-05) — بقت بدون حد منفصل
  caseAnalysisFreeCount: 0,
  caseAnalysisProCount: 0,
  caseAnalysisProMaxCount: 0,
  drugInteractionsFreeCount: 0,
  drugInteractionsProCount: 0,
  drugInteractionsProMaxCount: 0,
  pregnancySafetyFreeCount: 0,
  pregnancySafetyProCount: 0,
  pregnancySafetyProMaxCount: 0,
  renalDoseFreeCount: 0,
  renalDoseProCount: 0,
  renalDoseProMaxCount: 0,
  medicalReportFreeCount: 0,
  medicalReportProCount: 0,
  medicalReportProMaxCount: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// NAV_GROUPS: تنظيم الـsidebar في مجموعات منطقية بدل قائمة طويلة متراصة
// ─────────────────────────────────────────────────────────────────────────────
// كل مجموعة لها label يظهر كـheader في الـsidebar، وداخلها الـviews المرتبطة بها.
// هذا التنظيم يقلل التكرار البصري ويسهّل العثور على الميزات.
// ─────────────────────────────────────────────────────────────────────────────
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'الرئيسية',
    emoji: '🏠',
    items: [
      { id: 'overview', label: 'لوحة التحكم', icon: 'dashboard' },
    ],
  },
  {
    label: 'إدارة الأطباء',
    emoji: '👨‍⚕️',
    items: [
      { id: 'verification', label: 'تحقق الأطباء الجدد', icon: 'verify' },
      { id: 'accounts', label: 'إدارة الأطباء', icon: 'users' },
      { id: 'accountTypesControl', label: 'التحكم في أنواع الحساب', icon: 'accountTypesControl' },
      // ─ يضم: حظر الأطباء + الأطباء المعطّلين فقط (حظر الجمهور اتنقل لقسمه)
      { id: 'restrictedAccounts', label: 'الحسابات المقيدة', icon: 'ban' },
    ],
  },
  {
    label: 'إدارة الجمهور',
    emoji: '👥',
    items: [
      { id: 'patients', label: 'إدارة الجمهور', icon: 'patients' },
      // ─ حظر الجمهور هنا — منفصل تحت قسم الجمهور (مش مع حظر الأطباء)
      { id: 'publicBlacklist', label: 'حظر الجمهور', icon: 'publicBlacklist' },
    ],
  },
  {
    label: 'التواصل',
    emoji: '📢',
    items: [
      { id: 'externalNotifications', label: 'إرسال إشعارات', icon: 'externalNotifications' },
      { id: 'updateBroadcasts', label: 'تحديثات التطبيق', icon: 'updates' },
    ],
  },
  {
    label: 'المحتوى',
    emoji: '🎨',
    items: [
      { id: 'homeBanner', label: 'بانر الصفحة الرئيسية', icon: 'homeBanner' },
      { id: 'prescriptionFooterLine', label: 'سطر أسفل الروشتة', icon: 'prescriptionFooterLine' },
      // ─ مساعدة الطبيب في تصميم روشتته أو إعلانه — الأدمن بيدخل إيميل الطبيب
      //   ويفتح نفس شاشات الطبيب (وصول مقيّد على المستندين دول فقط)
      { id: 'doctorDesignEditor', label: 'مساعدة في تصميم الطبيب', icon: 'prescriptionFooterLine' },
    ],
  },
  {
    label: 'المالية والتقارير',
    emoji: '💰',
    items: [
      { id: 'financial', label: 'الإدارة المالية', icon: 'finance' },
      { id: 'reports', label: 'التقارير والإحصاءات', icon: 'reports' },
    ],
  },
  {
    label: 'النظام',
    emoji: '⚙️',
    items: [
      { id: 'settings', label: 'الإعدادات', icon: 'settings' },
    ],
  },
] as const;

// ─ مشتق من الـgroups: قائمة flat للـURL parsing وأي logic يحتاج كل الـviews
export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
