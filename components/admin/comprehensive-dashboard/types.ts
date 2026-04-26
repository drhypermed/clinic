/**
 * الملف: types.ts
 * الوصف: "قاموس هيكل لوحة التحكم". 
 * يحتوي على تعريفات الجداول والأنواع المستخدمة في بناء لوحة الإدارة الشاملة: 
 * - AdminStats: إحصائيات النظام العامة (عدد الأطباء، المرضى، العمليات). 
 * - DashboardState: الحالة العامة للوحة التحكم (التبويب النشط، التحميل، الأخطاء). 
 * - StatCardProps: تعريف واجهة عرض بطاقات الإحصائيات السريعة.
 * تحدد هيكل البيانات للأقسام، الإحصائيات المجمعة، وعناصر التنقل في لوحة الإدارة.
 */

import type { User } from 'firebase/auth';

export type AdminView =
  | 'overview'
  | 'verification'
  | 'patients'
  | 'publicBlacklist'      // ─ حظر الجمهور — تحت قسم "إدارة الجمهور" (منفصل)
  | 'accounts'
  | 'accountTypesControl'
  | 'financial'
  | 'restrictedAccounts'   // ─ حظر الأطباء + المعطّلين فقط (2 tabs بعد فصل الجمهور)
  | 'externalNotifications'
  | 'updateBroadcasts'
  | 'reports'
  | 'homeBanner'
  | 'prescriptionFooterLine'
  | 'settings';

export interface DashboardStats {
  totalDoctors: number;
  pendingDoctors: number;
  approvedDoctors: number;
  rejectedDoctors: number;
  totalPatients: number;
  doctorBlacklisted: number;
  publicBlacklisted: number;
  totalBlacklisted: number;
  activeSubscriptions: number;
  freeDocsCount: number;
  premiumDocsCount: number;       // عدد حسابات برو (premium)
  proMaxDocsCount: number;        // عدد حسابات برو ماكس (جديد)
  totalSmartRxFree: number;
  totalSmartRxPro: number;        // تحليلات الحسابات المدفوعة (برو + برو ماكس)
  totalSmartRxProMax: number;     // تحليلات برو ماكس فقط (جديد)
  totalPrintsFree: number;
  totalPrintsPro: number;
  totalPrintsProMax: number;      // طباعات برو ماكس فقط (جديد)
  homeBannerItems: number;
  footerContacts: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;

  // ═══ عدادات استهلاك ميزات الذكاء الاصطناعي (6 ميزات × 3 فئات = 18 حقل) ═══
  // تحليل الحالة (Case Analysis)
  caseAnalysisFreeCount: number;
  caseAnalysisProCount: number;
  caseAnalysisProMaxCount: number;
  // الترجمة الذكية (Smart RX Translation)
  translationFreeCount: number;
  translationProCount: number;
  translationProMaxCount: number;
  // فحص التداخلات الدوائية
  drugInteractionsFreeCount: number;
  drugInteractionsProCount: number;
  drugInteractionsProMaxCount: number;
  // أمان الحمل والرضاعة
  pregnancySafetyFreeCount: number;
  pregnancySafetyProCount: number;
  pregnancySafetyProMaxCount: number;
  // تعديل جرعات الكلى
  renalDoseFreeCount: number;
  renalDoseProCount: number;
  renalDoseProMaxCount: number;
  // طباعة تقرير طبي بالـAI
  medicalReportFreeCount: number;
  medicalReportProCount: number;
  medicalReportProMaxCount: number;

  // ═══ Reports aggregates — السيرفر بيـscan الأطباء كل 6 ساعات ويخزّن النتائج هنا
  //     عشان ReportsSection ما يحتاجش يقرا كل وثائق الأطباء كل فتحة (وفر ضخم في الـreads)
  monthlySignups?: Array<{ month: string; newDoctors: number }>;
  specialtyBreakdown?: Array<{ specialty: string; count: number }>;
  topDoctorsByActivity?: Array<{ name: string; email: string; totalActions: number }>;
}

export interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export interface AdminListItem {
  email: string;
  addedBy?: string;
  createdAt?: string;
  isRoot?: boolean;
}

export interface NavItem {
  id: AdminView;
  label: string;
  icon: string;
}

/**
 * مجموعة عناصر تنقل تحت header مشترك في الـsidebar.
 * Example: { label: 'إدارة الأطباء', items: [verification, accounts, ...] }
 */
export interface NavGroup {
  /** عنوان المجموعة الظاهر للمستخدم (مثال: "إدارة الأطباء") */
  label: string;
  /** اختياري — emoji أو رمز يظهر بجانب الـlabel */
  emoji?: string;
  /** الـnavigation items داخل المجموعة */
  items: readonly NavItem[];
}
