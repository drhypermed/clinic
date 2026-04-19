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
  | 'accounts'
  | 'accountTypesControl'
  | 'financial'
  | 'blacklist'
  | 'disabledAccounts'
  | 'externalNotifications'
  | 'updateBroadcasts'
  | 'publicBlacklist'
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
  premiumDocsCount: number;
  totalSmartRxFree: number;
  totalSmartRxPremium: number;
  totalPrintsFree: number;
  totalPrintsPremium: number;
  homeBannerItems: number;
  footerContacts: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
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
