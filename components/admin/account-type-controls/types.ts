/**
 * الملف: types.ts
 * الوصف: "قاموس إعدادات الباقات". 
 * يحتوي على تعريفات الجداول والأنواع المستخدمة في التحكم في مميزات الحسابات (Free/Pro): 
 * - PlanConfig: إعدادات الباقة (الاسم، السعر، المميزات المتاحة). 
 * - FeatureFlag: مفاتيح التحكم في تفعيل أو تعطيل ميزة معينة. 
 * - DrugToolConfig: إعدادات أدوات الأدوية المتاحة لكل باقة.
 * تحدد هيكل البيانات لنموذج التحكم في أنواع الحسابات وإعدادات الخطط.
 */

import type { AccountTypeControls } from '../../../services/accountTypeControlsService';

export type AccountTypeControlsForm = AccountTypeControls;

export type LimitKey =
  // ─── free + premium (=برو) موجودين من الأول ───
  | 'freeDailyLimit'
  | 'premiumDailyLimit'
  // 🆕 (2026-05) الزر السريع "إضافة بدون تحليل" — عداد منفصل عن التحليل العميق
  | 'freeQuickAddDailyLimit'
  | 'premiumQuickAddDailyLimit'
  | 'proMaxQuickAddDailyLimit'
  // ─── سعة السجلات الطبية (حد كلي مش يومي — تغيّرت 2026-04) ───
  | 'freeRecordsMaxCount'
  | 'premiumRecordsMaxCount'
  // ─── 🆕 الأزرار الذهبية تحت الروشتة (التداخلات + الحمل/الرضاعة) — حدود يومية ───
  | 'freeInteractionToolDailyLimit'
  | 'premiumInteractionToolDailyLimit'
  | 'freePregnancyToolDailyLimit'
  | 'premiumPregnancyToolDailyLimit'
  // ─── 🆕 الكلى — اتنقلت لـ"حدود الميزات" 2026-04 ───
  | 'freeRenalToolDailyLimit'
  | 'premiumRenalToolDailyLimit'
  // ─── 🆕 أزرار تصدير الروشتة (طباعة + تنزيل + واتساب) ───
  | 'freePrescriptionPrintDailyLimit'
  | 'premiumPrescriptionPrintDailyLimit'
  | 'freePrescriptionDownloadDailyLimit'
  | 'premiumPrescriptionDownloadDailyLimit'
  | 'freePrescriptionWhatsappDailyLimit'
  | 'premiumPrescriptionWhatsappDailyLimit'
  | 'freePublicBookingDailyLimit'
  | 'premiumPublicBookingDailyLimit'
  | 'freePublicFormBookingDailyLimit'
  | 'premiumPublicFormBookingDailyLimit'
  | 'freeSecretaryEntryRequestDailyLimit'
  | 'premiumSecretaryEntryRequestDailyLimit'
  | 'freeReadyPrescriptionDailyLimit'
  | 'premiumReadyPrescriptionDailyLimit'
  | 'freeMedicalReportDailyLimit'
  | 'premiumMedicalReportDailyLimit'
  // ✂️ شيلنا حدود الترجمة (2026-05) — بقت جزء من الزرّين
  | 'freeReadyPrescriptionsMaxCount'
  | 'premiumReadyPrescriptionsMaxCount'
  | 'freeMedicationCustomizationsMaxCount'
  | 'premiumMedicationCustomizationsMaxCount'
  // ─── سعة الفروع (إعلان الطبيب) ───
  | 'freeBranchesMaxCount'
  | 'premiumBranchesMaxCount'
  // ─── 🆕 سعة شركات التأمين ───
  | 'freeInsuranceCompaniesMaxCount'
  | 'premiumInsuranceCompaniesMaxCount'
  // ─── برو ماكس (جديد) — الأدمن يضبط قيمها لاحقاً ───
  | 'proMaxDailyLimit'
  | 'proMaxRecordsMaxCount'
  | 'proMaxInteractionToolDailyLimit'
  | 'proMaxPregnancyToolDailyLimit'
  | 'proMaxRenalToolDailyLimit'
  | 'proMaxPrescriptionPrintDailyLimit'
  | 'proMaxPrescriptionDownloadDailyLimit'
  | 'proMaxPrescriptionWhatsappDailyLimit'
  | 'proMaxPublicBookingDailyLimit'
  | 'proMaxPublicFormBookingDailyLimit'
  | 'proMaxSecretaryEntryRequestDailyLimit'
  | 'proMaxReadyPrescriptionDailyLimit'
  | 'proMaxMedicalReportDailyLimit'
  | 'proMaxReadyPrescriptionsMaxCount'
  | 'proMaxMedicationCustomizationsMaxCount'
  | 'proMaxBranchesMaxCount'
  | 'proMaxInsuranceCompaniesMaxCount';

export type MessageKey =
  | 'freeAnalysisLimitMessage'
  | 'premiumAnalysisLimitMessage'
  // 🆕 رسائل الزر السريع "إضافة بدون تحليل"
  | 'freeQuickAddLimitMessage'
  | 'premiumQuickAddLimitMessage'
  | 'proMaxQuickAddLimitMessage'
  // ─── رسائل سعة السجلات الطبية ───
  | 'freeRecordsCapacityMessage'
  | 'premiumRecordsCapacityMessage'
  | 'freePublicBookingLimitMessage'
  | 'premiumPublicBookingLimitMessage'
  | 'freePublicFormBookingLimitMessage'
  | 'premiumPublicFormBookingLimitMessage'
  | 'freeSecretaryEntryRequestLimitMessage'
  | 'premiumSecretaryEntryRequestLimitMessage'
  | 'freeReadyPrescriptionDailyLimitMessage'
  | 'premiumReadyPrescriptionDailyLimitMessage'
  | 'freeMedicalReportLimitMessage'
  | 'premiumMedicalReportLimitMessage'
  // ✂️ شيلنا رسائل الترجمة (2026-05)
  // ─── 🆕 الأزرار الذهبية تحت الروشتة (التداخلات + الحمل/الرضاعة) ───
  | 'freeInteractionToolLimitMessage'
  | 'premiumInteractionToolLimitMessage'
  | 'freePregnancyToolLimitMessage'
  | 'premiumPregnancyToolLimitMessage'
  // ─── 🆕 الكلى ───
  | 'freeRenalToolLimitMessage'
  | 'premiumRenalToolLimitMessage'
  // ─── 🆕 أزرار تصدير الروشتة ───
  | 'freePrescriptionPrintLimitMessage'
  | 'premiumPrescriptionPrintLimitMessage'
  | 'freePrescriptionDownloadLimitMessage'
  | 'premiumPrescriptionDownloadLimitMessage'
  | 'freePrescriptionWhatsappLimitMessage'
  | 'premiumPrescriptionWhatsappLimitMessage'
  | 'freeReadyPrescriptionsCapacityMessage'
  | 'premiumReadyPrescriptionsCapacityMessage'
  | 'freeMedicationCustomizationsCapacityMessage'
  | 'premiumMedicationCustomizationsCapacityMessage'
  // ─── سعة الفروع ───
  | 'freeBranchesCapacityMessage'
  | 'premiumBranchesCapacityMessage'
  // ─── 🆕 سعة شركات التأمين ───
  | 'freeInsuranceCompaniesCapacityMessage'
  | 'premiumInsuranceCompaniesCapacityMessage'
  // ─── برو ماكس ───
  | 'proMaxAnalysisLimitMessage'
  | 'proMaxRecordsCapacityMessage'
  | 'proMaxPublicBookingLimitMessage'
  | 'proMaxPublicFormBookingLimitMessage'
  | 'proMaxSecretaryEntryRequestLimitMessage'
  | 'proMaxReadyPrescriptionDailyLimitMessage'
  | 'proMaxMedicalReportLimitMessage'
  | 'proMaxInteractionToolLimitMessage'
  | 'proMaxPregnancyToolLimitMessage'
  | 'proMaxRenalToolLimitMessage'
  | 'proMaxPrescriptionPrintLimitMessage'
  | 'proMaxPrescriptionDownloadLimitMessage'
  | 'proMaxPrescriptionWhatsappLimitMessage'
  | 'proMaxReadyPrescriptionsCapacityMessage'
  | 'proMaxMedicationCustomizationsCapacityMessage'
  | 'proMaxBranchesCapacityMessage'
  | 'proMaxInsuranceCompaniesCapacityMessage';

export type WhatsappMessageKey =
  | 'freeAnalysisWhatsappMessage'
  | 'premiumAnalysisWhatsappMessage'
  // 🆕 رسائل واتساب الزر السريع "إضافة بدون تحليل"
  | 'freeQuickAddWhatsappMessage'
  | 'premiumQuickAddWhatsappMessage'
  | 'proMaxQuickAddWhatsappMessage'
  // ─── رسائل واتساب سعة السجلات الطبية ───
  | 'freeRecordsCapacityWhatsappMessage'
  | 'premiumRecordsCapacityWhatsappMessage'
  | 'freePublicBookingWhatsappMessage'
  | 'premiumPublicBookingWhatsappMessage'
  | 'freePublicFormBookingWhatsappMessage'
  | 'premiumPublicFormBookingWhatsappMessage'
  | 'freeSecretaryEntryRequestWhatsappMessage'
  | 'premiumSecretaryEntryRequestWhatsappMessage'
  | 'freeReadyPrescriptionWhatsappMessage'
  | 'premiumReadyPrescriptionWhatsappMessage'
  | 'freeMedicalReportWhatsappMessage'
  | 'premiumMedicalReportWhatsappMessage'
  // ✂️ شيلنا رسائل واتساب الترجمة (2026-05)
  // ─── 🆕 الأزرار الذهبية تحت الروشتة ───
  | 'freeInteractionToolWhatsappMessage'
  | 'premiumInteractionToolWhatsappMessage'
  | 'freePregnancyToolWhatsappMessage'
  | 'premiumPregnancyToolWhatsappMessage'
  // ─── 🆕 الكلى ───
  | 'freeRenalToolWhatsappMessage'
  | 'premiumRenalToolWhatsappMessage'
  // ─── 🆕 أزرار تصدير الروشتة (واتساب رسالة) ───
  | 'freePrescriptionPrintWhatsappMessage'
  | 'premiumPrescriptionPrintWhatsappMessage'
  | 'freePrescriptionDownloadWhatsappMessage'
  | 'premiumPrescriptionDownloadWhatsappMessage'
  | 'freePrescriptionWhatsappWhatsappMessage'
  | 'premiumPrescriptionWhatsappWhatsappMessage'
  | 'freeReadyPrescriptionsCapacityWhatsappMessage'
  | 'premiumReadyPrescriptionsCapacityWhatsappMessage'
  | 'freeMedicationCustomizationsCapacityWhatsappMessage'
  | 'premiumMedicationCustomizationsCapacityWhatsappMessage'
  // ─── سعة الفروع ───
  | 'freeBranchesCapacityWhatsappMessage'
  | 'premiumBranchesCapacityWhatsappMessage'
  // ─── 🆕 سعة شركات التأمين ───
  | 'freeInsuranceCompaniesCapacityWhatsappMessage'
  | 'premiumInsuranceCompaniesCapacityWhatsappMessage'
  // ─── برو ماكس ───
  | 'proMaxAnalysisWhatsappMessage'
  | 'proMaxRecordsCapacityWhatsappMessage'
  | 'proMaxPublicBookingWhatsappMessage'
  | 'proMaxPublicFormBookingWhatsappMessage'
  | 'proMaxSecretaryEntryRequestWhatsappMessage'
  | 'proMaxReadyPrescriptionWhatsappMessage'
  | 'proMaxMedicalReportWhatsappMessage'
  | 'proMaxInteractionToolWhatsappMessage'
  | 'proMaxPregnancyToolWhatsappMessage'
  | 'proMaxRenalToolWhatsappMessage'
  | 'proMaxPrescriptionPrintWhatsappMessage'
  | 'proMaxPrescriptionDownloadWhatsappMessage'
  | 'proMaxPrescriptionWhatsappWhatsappMessage'
  | 'proMaxReadyPrescriptionsCapacityWhatsappMessage'
  | 'proMaxMedicationCustomizationsCapacityWhatsappMessage'
  | 'proMaxBranchesCapacityWhatsappMessage'
  | 'proMaxInsuranceCompaniesCapacityWhatsappMessage';

export type PlanConfig = {
  // الأسماء التجارية في الـ UI: "مجاني" / "برو" / "برو ماكس"
  name: 'مجاني' | 'برو' | 'برو ماكس';
  limitLabel: string;
  messageLabel: string;
  whatsappLabel: string;
  whatsappPreviewLabel: string;
  messagePlaceholder?: string;
  whatsappPlaceholder?: string;
  limitKey: LimitKey;
  messageKey: MessageKey;
  whatsappMessageKey: WhatsappMessageKey;
};

export type GroupConfig = {
  id: string;
  title: string;
  free: PlanConfig;
  premium: PlanConfig;
  // برو ماكس اختياري — مش كل الجروبات لسه محدد ليها حدود خاصة
  proMax?: PlanConfig;
};
