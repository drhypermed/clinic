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
  // ─── السعة القصوى لتخزين السجلات الطبية (حد كلي مش يومي — تغيّرت 2026-04 ───
  freeRecordsMaxCount: number;
  premiumRecordsMaxCount: number;
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
  // ─── حدود الترجمة الذكية للروشتة (Smart RX Translation) — ميزة AI كانت بتشتغل بدون حد ───
  freeTranslationDailyLimit: number;
  premiumTranslationDailyLimit: number;
  // السعة القصوى لتخزين الروشتات الجاهزة في الحساب
  freeReadyPrescriptionsMaxCount: number;
  premiumReadyPrescriptionsMaxCount: number;
  // السعة القصوى لتخزين الأدوية المعدلة
  freeMedicationCustomizationsMaxCount: number;
  premiumMedicationCustomizationsMaxCount: number;
  // ─── السعة القصوى لعدد الفروع في حساب الطبيب (إعلان الطبيب) ───
  freeBranchesMaxCount: number;
  premiumBranchesMaxCount: number;
  // ─── 🆕 السعة القصوى لعدد شركات التأمين 2026-04 ───
  freeInsuranceCompaniesMaxCount: number;
  premiumInsuranceCompaniesMaxCount: number;
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
  // ─── رسائل تجاوز سعة السجلات الطبية ───
  freeRecordsCapacityMessage: string;
  premiumRecordsCapacityMessage: string;
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
  // ─── رسائل تجاوز حد الترجمة الذكية ───
  freeTranslationLimitMessage: string;
  premiumTranslationLimitMessage: string;
  freeReadyPrescriptionsCapacityMessage: string;
  premiumReadyPrescriptionsCapacityMessage: string;
  freeMedicationCustomizationsCapacityMessage: string;
  premiumMedicationCustomizationsCapacityMessage: string;
  // ─── رسائل تجاوز سعة الفروع ───
  freeBranchesCapacityMessage: string;
  premiumBranchesCapacityMessage: string;
  // ─── 🆕 رسائل تجاوز سعة شركات التأمين ───
  freeInsuranceCompaniesCapacityMessage: string;
  premiumInsuranceCompaniesCapacityMessage: string;
  // ─── 🆕 رفع الصور: لو false (الافتراضي) → الحساب المجاني يشوف مودال
  //     "ترقية للـPro" بدل ما يقدر يرفع صورة. الـPro/ProMax مش متأثرين.
  //     الاستثناء الوحيد: صورة الترخيص في إنشاء حساب (مش بتمر بهذا الفحص).
  freeImageUploadsEnabled: boolean;
  freeImageUploadsUpgradeMessage: string;
  freeImageUploadsUpgradeWhatsappMessage: string;
  // بيانات التواصل (واتساب)
  whatsappNumber: string;
  freeAnalysisWhatsappMessage: string;
  premiumAnalysisWhatsappMessage: string;
  // ─── رسائل واتساب لسعة السجلات الطبية ───
  freeRecordsCapacityWhatsappMessage: string;
  premiumRecordsCapacityWhatsappMessage: string;
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
  // ─── رسائل واتساب الترجمة الذكية ───
  freeTranslationWhatsappMessage: string;
  premiumTranslationWhatsappMessage: string;
  freeReadyPrescriptionsCapacityWhatsappMessage: string;
  premiumReadyPrescriptionsCapacityWhatsappMessage: string;
  freeMedicationCustomizationsCapacityWhatsappMessage: string;
  premiumMedicationCustomizationsCapacityWhatsappMessage: string;
  // ─── رسائل واتساب لتجاوز سعة الفروع ───
  freeBranchesCapacityWhatsappMessage: string;
  premiumBranchesCapacityWhatsappMessage: string;
  // ─── 🆕 رسائل واتساب لسعة شركات التأمين ───
  freeInsuranceCompaniesCapacityWhatsappMessage: string;
  premiumInsuranceCompaniesCapacityWhatsappMessage: string;
  // صلاحيات الأدوات الطبية المتخصصة
  interactionToolPremiumOnly: boolean;
  renalToolPremiumOnly: boolean;
  pregnancyToolPremiumOnly: boolean;
  interactionToolLockedMessage: string;
  renalToolLockedMessage: string;
  pregnancyToolLockedMessage: string;
  // ─── 🆕 رسائل تجاوز الحد اليومي للأزرار الذهبية تحت الروشتة (التداخلات + الحمل/الرضاعة) ───
  // ─ اتنقلوا من قسم "أدوات الأدوية" لقسم "حدود الميزات" — كحدود يومية ـ
  freeInteractionToolLimitMessage: string;
  premiumInteractionToolLimitMessage: string;
  freeInteractionToolWhatsappMessage: string;
  premiumInteractionToolWhatsappMessage: string;
  freePregnancyToolLimitMessage: string;
  premiumPregnancyToolLimitMessage: string;
  freePregnancyToolWhatsappMessage: string;
  premiumPregnancyToolWhatsappMessage: string;
  // ─── 🆕 الكلى — اتنقلت لقسم "حدود الميزات" زي التداخلات والحمل (2026-04) ─
  freeRenalToolLimitMessage: string;
  premiumRenalToolLimitMessage: string;
  freeRenalToolWhatsappMessage: string;
  premiumRenalToolWhatsappMessage: string;
  // ─── 🆕 أزرار تصدير الروشتة (طباعة + تنزيل + واتساب) — حدود يومية 2026-04 ───
  freePrescriptionPrintDailyLimit: number;
  premiumPrescriptionPrintDailyLimit: number;
  freePrescriptionPrintLimitMessage: string;
  premiumPrescriptionPrintLimitMessage: string;
  freePrescriptionPrintWhatsappMessage: string;
  premiumPrescriptionPrintWhatsappMessage: string;
  freePrescriptionDownloadDailyLimit: number;
  premiumPrescriptionDownloadDailyLimit: number;
  freePrescriptionDownloadLimitMessage: string;
  premiumPrescriptionDownloadLimitMessage: string;
  freePrescriptionDownloadWhatsappMessage: string;
  premiumPrescriptionDownloadWhatsappMessage: string;
  freePrescriptionWhatsappDailyLimit: number;
  premiumPrescriptionWhatsappDailyLimit: number;
  freePrescriptionWhatsappLimitMessage: string;
  premiumPrescriptionWhatsappLimitMessage: string;
  freePrescriptionWhatsappWhatsappMessage: string;
  premiumPrescriptionWhatsappWhatsappMessage: string;
  // وسوم وملصقات الترقية
  premiumTagLabel: string;
  whatsappUrl: string;

  // ═══ فئة "برو ماكس" الجديدة — كل الحقول optional لأن الأدمن بيضبطها لاحقاً ═══
  proMaxDailyLimit?: number;
  proMaxRecordsMaxCount?: number;
  proMaxPublicBookingDailyLimit?: number;
  proMaxPublicFormBookingDailyLimit?: number;
  proMaxSecretaryEntryRequestDailyLimit?: number;
  proMaxReadyPrescriptionDailyLimit?: number;
  proMaxMedicalReportDailyLimit?: number;
  proMaxTranslationDailyLimit?: number;
  proMaxReadyPrescriptionsMaxCount?: number;
  proMaxMedicationCustomizationsMaxCount?: number;
  proMaxBranchesMaxCount?: number;
  proMaxInsuranceCompaniesMaxCount?: number;
  proMaxInteractionToolDailyLimit?: number;
  proMaxRenalToolDailyLimit?: number;
  proMaxPregnancyToolDailyLimit?: number;
  // ─── 🆕 برو ماكس: رسائل التداخلات + الحمل/الرضاعة ───
  proMaxInteractionToolLimitMessage?: string;
  proMaxInteractionToolWhatsappMessage?: string;
  proMaxPregnancyToolLimitMessage?: string;
  proMaxPregnancyToolWhatsappMessage?: string;
  // ─── 🆕 برو ماكس: رسائل الكلى ─
  proMaxRenalToolLimitMessage?: string;
  proMaxRenalToolWhatsappMessage?: string;
  // ─── 🆕 برو ماكس: أزرار تصدير الروشتة ─
  proMaxPrescriptionPrintDailyLimit?: number;
  proMaxPrescriptionPrintLimitMessage?: string;
  proMaxPrescriptionPrintWhatsappMessage?: string;
  proMaxPrescriptionDownloadDailyLimit?: number;
  proMaxPrescriptionDownloadLimitMessage?: string;
  proMaxPrescriptionDownloadWhatsappMessage?: string;
  proMaxPrescriptionWhatsappDailyLimit?: number;
  proMaxPrescriptionWhatsappLimitMessage?: string;
  proMaxPrescriptionWhatsappWhatsappMessage?: string;
  proMaxAnalysisLimitMessage?: string;
  proMaxRecordsCapacityMessage?: string;
  proMaxPublicBookingLimitMessage?: string;
  proMaxPublicFormBookingLimitMessage?: string;
  proMaxSecretaryEntryRequestLimitMessage?: string;
  proMaxReadyPrescriptionDailyLimitMessage?: string;
  proMaxMedicalReportLimitMessage?: string;
  proMaxTranslationLimitMessage?: string;
  proMaxReadyPrescriptionsCapacityMessage?: string;
  proMaxMedicationCustomizationsCapacityMessage?: string;
  proMaxBranchesCapacityMessage?: string;
  proMaxInsuranceCompaniesCapacityMessage?: string;
  proMaxAnalysisWhatsappMessage?: string;
  proMaxRecordsCapacityWhatsappMessage?: string;
  proMaxPublicBookingWhatsappMessage?: string;
  proMaxPublicFormBookingWhatsappMessage?: string;
  proMaxSecretaryEntryRequestWhatsappMessage?: string;
  proMaxReadyPrescriptionWhatsappMessage?: string;
  proMaxMedicalReportWhatsappMessage?: string;
  proMaxTranslationWhatsappMessage?: string;
  proMaxReadyPrescriptionsCapacityWhatsappMessage?: string;
  proMaxMedicationCustomizationsCapacityWhatsappMessage?: string;
  proMaxBranchesCapacityWhatsappMessage?: string;
  proMaxInsuranceCompaniesCapacityWhatsappMessage?: string;
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

/** نتيجة فحص سعة السجلات (Records Capacity) — server-side بدلاً من client-side */
export interface RecordsCapacityResult {
  accountType: 'free' | 'premium' | 'pro_max';
  limit: number;
  used: number;
  remaining: number;
  whatsappNumber: string;
  whatsappUrl: string;
  limitReachedMessage: string;
  whatsappMessage: string;
}

/** نفس شكل النتيجة لباقي فحوصات السعة (روشتات جاهزة + أدوية معدّلة) */
export interface CapacityCheckResult {
  accountType: 'free' | 'premium' | 'pro_max';
  limit: number;
  used: number;
  remaining: number;
  whatsappNumber: string;
  whatsappUrl: string;
  limitReachedMessage: string;
  whatsappMessage: string;
}

/** نتيجة فحص كوتة الترجمة الذكية للروشتة (Smart RX Translation) */
export interface TranslationQuotaResult {
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

// ─ recordSave اتشال 2026-04 — السجلات بقت "حد كلي" بفحص client-side ─
// ─ 🆕 ضفنا تصدير الروشتة (طباعة + تنزيل + واتساب) كـserver-side quotas 2026-04 ─
export type StorageQuotaFeature =
  | 'readyPrescriptionSave'
  | 'medicalReportPrint'
  | 'prescriptionPrint'
  | 'prescriptionDownload'
  | 'prescriptionWhatsapp';

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
