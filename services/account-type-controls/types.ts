/**
 * أنواع بيانات التحكم في الحساب (Account Type Controls Types)
 * هذا الملف يعرف الهياكل البرمجية المسؤولة عن حدود الاستخدام (Quotas):
 * 1. حدود الاستخدام اليومي للتحليل الذكي وحفظ السجلات.
 * 2. حدود الحجز العام وطلبات السكرتارية.
 * 3. سعة التخزين للأدوية والروشتات الجاهزة.
 * 4. الرسائل التنبيهية وروابط التواصل عند الوصول للحد الأقصى.
 */

export interface AccountTypeControls {
  // حدود التحليل الذكي للروشتة
  freeDailyLimit: number;
  premiumDailyLimit: number;
  // حدود حفظ السجلات الطبية
  freeRecordDailyLimit: number;
  premiumRecordDailyLimit: number;
  // حدود المواعيد المضافة يدوياً
  freePublicBookingDailyLimit: number;
  premiumPublicBookingDailyLimit: number;
  // حدود الحجز عبر فورم الجمهور
  freePublicFormBookingDailyLimit: number;
  premiumPublicFormBookingDailyLimit: number;
  // حدود طلبات السكرتارية
  freeSecretaryEntryRequestDailyLimit: number;
  premiumSecretaryEntryRequestDailyLimit: number;
  // حدود حفظ الروشتات الجاهزة يومياً
  freeReadyPrescriptionDailyLimit: number;
  premiumReadyPrescriptionDailyLimit: number;
  // حدود طباعة التقرير الطبي للحالة يومياً
  freeMedicalReportDailyLimit: number;
  premiumMedicalReportDailyLimit: number;
  // السعة القصوى لتخزين الروشتات الجاهزة في الحساب
  freeReadyPrescriptionsMaxCount: number;
  premiumReadyPrescriptionsMaxCount: number;
  // السعة القصوى لتخزين الأدوية المعدلة
  freeMedicationCustomizationsMaxCount: number;
  premiumMedicationCustomizationsMaxCount: number;
  // حدود أدوات التفاعل الدوائي والوظائف الكلوية والحمل
  freeInteractionToolDailyLimit: number;
  premiumInteractionToolDailyLimit: number;
  freeRenalToolDailyLimit: number;
  premiumRenalToolDailyLimit: number;
  freePregnancyToolDailyLimit: number;
  premiumPregnancyToolDailyLimit: number;
  // رسائل التنبيه عند الوصول للحد الأقصى
  freeAnalysisLimitMessage: string;
  premiumAnalysisLimitMessage: string;
  freeRecordLimitMessage: string;
  premiumRecordLimitMessage: string;
  freePublicBookingLimitMessage: string;
  premiumPublicBookingLimitMessage: string;
  freePublicFormBookingLimitMessage: string;
  premiumPublicFormBookingLimitMessage: string;
  freeSecretaryEntryRequestLimitMessage: string;
  premiumSecretaryEntryRequestLimitMessage: string;
  freeReadyPrescriptionDailyLimitMessage: string;
  premiumReadyPrescriptionDailyLimitMessage: string;
  freeMedicalReportLimitMessage: string;
  premiumMedicalReportLimitMessage: string;
  freeReadyPrescriptionsCapacityMessage: string;
  premiumReadyPrescriptionsCapacityMessage: string;
  freeMedicationCustomizationsCapacityMessage: string;
  premiumMedicationCustomizationsCapacityMessage: string;
  // بيانات التواصل (واتساب)
  whatsappNumber: string;
  freeAnalysisWhatsappMessage: string;
  premiumAnalysisWhatsappMessage: string;
  freeRecordWhatsappMessage: string;
  premiumRecordWhatsappMessage: string;
  freePublicBookingWhatsappMessage: string;
  premiumPublicBookingWhatsappMessage: string;
  freePublicFormBookingWhatsappMessage: string;
  premiumPublicFormBookingWhatsappMessage: string;
  freeSecretaryEntryRequestWhatsappMessage: string;
  premiumSecretaryEntryRequestWhatsappMessage: string;
  freeReadyPrescriptionWhatsappMessage: string;
  premiumReadyPrescriptionWhatsappMessage: string;
  freeMedicalReportWhatsappMessage: string;
  premiumMedicalReportWhatsappMessage: string;
  freeReadyPrescriptionsCapacityWhatsappMessage: string;
  premiumReadyPrescriptionsCapacityWhatsappMessage: string;
  freeMedicationCustomizationsCapacityWhatsappMessage: string;
  premiumMedicationCustomizationsCapacityWhatsappMessage: string;
  // صلاحيات الأدوات الطبية المتخصصة
  interactionToolPremiumOnly: boolean;
  renalToolPremiumOnly: boolean;
  pregnancyToolPremiumOnly: boolean;
  interactionToolLockedMessage: string;
  renalToolLockedMessage: string;
  pregnancyToolLockedMessage: string;
  // وسوم وملصقات الترقية
  premiumTagLabel: string;
  whatsappUrl: string;

  // ═══ فئة "برو ماكس" الجديدة — كل الحقول optional لأن الأدمن بيضبطها لاحقاً ═══
  proMaxDailyLimit?: number;
  proMaxRecordDailyLimit?: number;
  proMaxPublicBookingDailyLimit?: number;
  proMaxPublicFormBookingDailyLimit?: number;
  proMaxSecretaryEntryRequestDailyLimit?: number;
  proMaxReadyPrescriptionDailyLimit?: number;
  proMaxMedicalReportDailyLimit?: number;
  proMaxReadyPrescriptionsMaxCount?: number;
  proMaxMedicationCustomizationsMaxCount?: number;
  proMaxInteractionToolDailyLimit?: number;
  proMaxRenalToolDailyLimit?: number;
  proMaxPregnancyToolDailyLimit?: number;
  proMaxAnalysisLimitMessage?: string;
  proMaxRecordLimitMessage?: string;
  proMaxPublicBookingLimitMessage?: string;
  proMaxPublicFormBookingLimitMessage?: string;
  proMaxSecretaryEntryRequestLimitMessage?: string;
  proMaxReadyPrescriptionDailyLimitMessage?: string;
  proMaxMedicalReportLimitMessage?: string;
  proMaxReadyPrescriptionsCapacityMessage?: string;
  proMaxMedicationCustomizationsCapacityMessage?: string;
  proMaxAnalysisWhatsappMessage?: string;
  proMaxRecordWhatsappMessage?: string;
  proMaxPublicBookingWhatsappMessage?: string;
  proMaxPublicFormBookingWhatsappMessage?: string;
  proMaxSecretaryEntryRequestWhatsappMessage?: string;
  proMaxReadyPrescriptionWhatsappMessage?: string;
  proMaxMedicalReportWhatsappMessage?: string;
  proMaxReadyPrescriptionsCapacityWhatsappMessage?: string;
  proMaxMedicationCustomizationsCapacityWhatsappMessage?: string;
  proMaxTagLabel?: string;
}

/** نتيجة فحص الكوتة للتحليل الذكي للروشتة */
export interface SmartPrescriptionQuotaResult {
  accountType: 'free' | 'premium' | 'pro_max';
  limit: number;
  used: number;
  remaining: number;
  dayKey: string;
  whatsappNumber: string;
  whatsappUrl: string;
  limitReachedMessage: string;
  whatsappMessage: string;
}

export type StorageQuotaFeature = 'recordSave' | 'readyPrescriptionSave' | 'medicalReportPrint';

/** نتيجة فحص الكوتة لعمليات التخزين (سجلات/روشتات جاهزة) */
export interface StorageQuotaResult {
  accountType: 'free' | 'premium' | 'pro_max';
  feature: StorageQuotaFeature;
  limit: number;
  used: number;
  remaining: number;
  dayKey: string;
  whatsappNumber: string;
  whatsappUrl: string;
  limitReachedMessage: string;
  whatsappMessage: string;
}

export type BookingQuotaFeature = 'publicBooking' | 'publicFormBooking' | 'secretaryEntryRequest';

/** نتيجة فحص الكوتة لعمليات الحجز والمواعيد */
export interface BookingQuotaResult {
  accountType: 'free' | 'premium' | 'pro_max';
  feature: BookingQuotaFeature;
  limit: number;
  used: number;
  remaining: number;
  dayKey: string;
  whatsappNumber: string;
  whatsappUrl: string;
  limitReachedMessage: string;
  whatsappMessage: string;
}

export type DrugToolQuotaFeature = 'interactionTool' | 'renalTool' | 'pregnancyTool';

/** نتيجة فحص الكوتة للأدوات الدوائية */
export interface DrugToolQuotaResult {
  accountType: 'free' | 'premium' | 'pro_max';
  feature: DrugToolQuotaFeature;
  limit: number;
  used: number;
  remaining: number;
  dayKey: string;
  whatsappNumber: string;
  whatsappUrl: string;
  limitReachedMessage: string;
  whatsappMessage: string;
}

/** هيكل تفاصيل خطأ تجاوز الحد (Quota Limit Error) */
export interface SmartQuotaLimitErrorDetails {
  accountType: 'free' | 'premium' | 'pro_max';
  limit: number;
  used: number;
  remaining: number;
  dayKey: string;
  whatsappNumber: string;
  whatsappUrl: string;
  limitReachedMessage?: string;
  whatsappMessage?: string;
}
