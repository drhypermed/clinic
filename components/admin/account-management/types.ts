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

/** فئات الباقة المسعّرة (لا تشمل free لأن free مفيش له سعر). */
export type SubscriptionTier = 'premium' | 'pro_max';

/** نوع المدة المسعّرة في جدول الأسعار: شهري / ٦ شهور / سنوي. */
export type SubscriptionPlanType = 'monthly' | 'sixMonths' | 'yearly';

export interface SubscriptionPeriod {
  startDate: string;
  endDate: string;
  /** نوع التغيير: اشتراك جديد / تمديد / تعديل يدوي / تغيير خطة */
  changeType?: SubscriptionChangeType;
  /** الأدمن اللي عمل التغيير */
  modifiedBy?: string;
  /** وقت التغيير */
  modifiedAt?: string;
  // ─── الحقول التاريخية الجديدة لحفظ سعر الفترة لحظة الاشتراك ───
  // كانت ناقصة قبلاً، فالإيراد التاريخي كان يعتمد على آخر snapshot للأسعار
  // والاشتراكات بدل ما يعكس الواقع الفعلي وقت كل عملية.
  /** فئة الباقة وقت العملية (برو أو برو ماكس). */
  tier?: SubscriptionTier;
  /** نوع المدة المسعّرة (لتحديد العمود في جدول الأسعار). */
  planType?: SubscriptionPlanType;
  /** المدة الفعلية بالشهور — تحدد الـ planType + مفيدة للـ analytics. */
  durationMonths?: number;
  /** السعر الفعلي اللي ينتج عن العملية (يحتسب لحظة التنفيذ). */
  pricePaid?: number;
  /** عملة السعر (افتراضي EGP). */
  priceCurrency?: string;
  /** المصدر اللي تم جلب السعر منه — مفيد للتدقيق. */
  priceSource?: 'pricing_table' | 'admin_override' | 'unknown';
}

// ثلاث فئات: مجاني / برو (كان اسمه premium داخلياً للتوافق العكسي) / برو ماكس
// ملاحظة: `premium` ما اتغيرش في الـ storage عشان ما نكسرش الحسابات القديمة —
// بس العرض في الـ UI بقى "برو". برو ماكس فئة جديدة للأدمن يضبط مميزاتها لاحقاً.
export type AccountType = 'free' | 'premium' | 'pro_max';
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
