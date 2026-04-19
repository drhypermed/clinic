/**
 * الملف: types.ts
 * الوصف: "قاموس بيانات إدارة الحسابات" للمسؤولين (Admins). 
 * يحتوي على تعريفات الجداول والأنواع المستخدمة في إدارة حسابات الأطباء: 
 * - DoctorAccount: بيانات الطبيب الأساسية (الاسم، البريد، الهاتف). 
 * - AccountStatus: حالة الحساب (نشط، موقوف، بانتظار التحقق). 
 * - SubscriptionData: بيانات الاشتراك وتاريخ الانتهاء. 
 * - AccountManagementState: الحالة العامة للوحة التحكم.
 */

export type SubscriptionChangeType = 'new' | 'extension' | 'manual_edit' | 'plan_switch';

export interface SubscriptionPeriod {
  startDate: string;
  endDate: string;
  /** نوع التغيير: اشتراك جديد / تمديد / تعديل يدوي / تغيير خطة */
  changeType?: SubscriptionChangeType;
  /** الأدمن اللي عمل التغيير */
  modifiedBy?: string;
  /** وقت التغيير */
  modifiedAt?: string;
}

export type AccountType = 'free' | 'premium';
export type SubscriptionUnit = 'day' | 'week' | 'month' | 'year' | 'hour';
export type EditMode = 'duration' | 'dates';

export interface ApprovedDoctor {
  id: string;
  uid?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorEmail?: string;
  doctorWhatsApp?: string;
  accountType?: AccountType;
  premiumExpiryDate?: string;
  premiumStartDate?: string;
  subscriptionHistory?: SubscriptionPeriod[];
  verificationStatus?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  isAccountDisabled?: boolean;
  disabledReason?: string;
  disabledAt?: string;
  createdAt?: string;
  existsInDoctors?: boolean;
  usageStats?: Record<string, number>;
  usageStatsByPlan?: {
    free?: Record<string, number>;
    premium?: Record<string, number>;
  };
}

export interface SmartFilter {
  searchTerm: string;
  verificationStatus: string;
  sortBy: string;
  specialty: string;
  subscriptionType: string;
}

export interface ActionModalState {
  type: 'disable' | 'enable' | 'delete';
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
}
