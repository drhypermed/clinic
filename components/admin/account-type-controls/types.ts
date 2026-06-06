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

  | 'plusDailyLimit'
  // 🆕 (2026-05) الزر السريع "إضافة بدون تحليل" — عداد منفصل عن التحليل العميق
  | 'freeQuickAddDailyLimit'
  | 'premiumQuickAddDailyLimit'

  | 'plusQuickAddDailyLimit'
  | 'proMaxQuickAddDailyLimit'
  // ─── سعة السجلات الطبية (حد كلي مش يومي — تغيّرت 2026-04) ───
  | 'freeRecordsMaxCount'
  | 'premiumRecordsMaxCount'

  | 'plusRecordsMaxCount'
  // ─── 🆕 الأزرار الذهبية تحت الروشتة (التداخلات + الحمل/الرضاعة) — حدود يومية ───
  | 'freeInteractionToolDailyLimit'
  | 'premiumInteractionToolDailyLimit'

  | 'plusInteractionToolDailyLimit'
  | 'freePregnancyToolDailyLimit'
  | 'premiumPregnancyToolDailyLimit'

  | 'plusPregnancyToolDailyLimit'
  // ─── 🆕 الكلى — اتنقلت لـ"حدود الميزات" 2026-04 ───
  | 'freeRenalToolDailyLimit'
  | 'premiumRenalToolDailyLimit'

  | 'plusRenalToolDailyLimit'
  | 'freeGuidelinesChatDailyLimit'
  | 'premiumGuidelinesChatDailyLimit'

  | 'plusGuidelinesChatDailyLimit'
  | 'freePublicBookingDailyLimit'
  | 'premiumPublicBookingDailyLimit'

  | 'plusPublicBookingDailyLimit'
  | 'freeSecretaryEntryRequestDailyLimit'
  | 'premiumSecretaryEntryRequestDailyLimit'

  | 'plusSecretaryEntryRequestDailyLimit'
  | 'freeReadyPrescriptionDailyLimit'
  | 'premiumReadyPrescriptionDailyLimit'

  | 'plusReadyPrescriptionDailyLimit'
  | 'freeMedicalReportDailyLimit'
  | 'premiumMedicalReportDailyLimit'

  | 'plusMedicalReportDailyLimit'
  // ✂️ شيلنا حدود الترجمة (2026-05) — بقت جزء من الزرّين
  | 'freeReadyPrescriptionsMaxCount'
  | 'premiumReadyPrescriptionsMaxCount'

  | 'plusReadyPrescriptionsMaxCount'
  | 'freeMedicationCustomizationsMaxCount'
  | 'premiumMedicationCustomizationsMaxCount'

  | 'plusMedicationCustomizationsMaxCount'
  // ─── سعة الفروع (إعلان الطبيب) ───
  | 'freeBranchesMaxCount'
  | 'premiumBranchesMaxCount'

  | 'plusBranchesMaxCount'
  // ─── 🆕 سعة شركات التأمين ───
  | 'freeInsuranceCompaniesMaxCount'
  | 'premiumInsuranceCompaniesMaxCount'

  | 'plusInsuranceCompaniesMaxCount'
  // ─── برو ماكس (جديد) — الأدمن يضبط قيمها لاحقاً ───
  | 'proMaxDailyLimit'
  | 'proMaxRecordsMaxCount'
  | 'proMaxInteractionToolDailyLimit'
  | 'proMaxPregnancyToolDailyLimit'
  | 'proMaxRenalToolDailyLimit'
  | 'proMaxGuidelinesChatDailyLimit'
  | 'proMaxPublicBookingDailyLimit'
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

  | 'plusAnalysisLimitMessage'
  // 🆕 رسائل الزر السريع "إضافة بدون تحليل"
  | 'freeQuickAddLimitMessage'
  | 'premiumQuickAddLimitMessage'

  | 'plusQuickAddLimitMessage'
  | 'proMaxQuickAddLimitMessage'
  // ─── رسائل سعة السجلات الطبية ───
  | 'freeRecordsCapacityMessage'
  | 'premiumRecordsCapacityMessage'

  | 'plusRecordsCapacityMessage'
  | 'freePublicBookingLimitMessage'
  | 'premiumPublicBookingLimitMessage'

  | 'plusPublicBookingLimitMessage'
  | 'freeSecretaryEntryRequestLimitMessage'
  | 'premiumSecretaryEntryRequestLimitMessage'

  | 'plusSecretaryEntryRequestLimitMessage'
  | 'freeReadyPrescriptionDailyLimitMessage'
  | 'premiumReadyPrescriptionDailyLimitMessage'

  | 'plusReadyPrescriptionDailyLimitMessage'
  | 'freeMedicalReportLimitMessage'
  | 'premiumMedicalReportLimitMessage'

  | 'plusMedicalReportLimitMessage'
  // ✂️ شيلنا رسائل الترجمة (2026-05)
  // ─── 🆕 الأزرار الذهبية تحت الروشتة (التداخلات + الحمل/الرضاعة) ───
  | 'freeInteractionToolLimitMessage'
  | 'premiumInteractionToolLimitMessage'

  | 'plusInteractionToolLimitMessage'
  | 'freePregnancyToolLimitMessage'
  | 'premiumPregnancyToolLimitMessage'

  | 'plusPregnancyToolLimitMessage'
  // ─── 🆕 الكلى ───
  | 'freeRenalToolLimitMessage'
  | 'premiumRenalToolLimitMessage'

  | 'plusRenalToolLimitMessage'
  | 'freeGuidelinesChatLimitMessage'
  | 'premiumGuidelinesChatLimitMessage'

  | 'plusGuidelinesChatLimitMessage'
  | 'freeReadyPrescriptionsCapacityMessage'
  | 'premiumReadyPrescriptionsCapacityMessage'

  | 'plusReadyPrescriptionsCapacityMessage'
  | 'freeMedicationCustomizationsCapacityMessage'
  | 'premiumMedicationCustomizationsCapacityMessage'

  | 'plusMedicationCustomizationsCapacityMessage'
  // ─── سعة الفروع ───
  | 'freeBranchesCapacityMessage'
  | 'premiumBranchesCapacityMessage'

  | 'plusBranchesCapacityMessage'
  // ─── 🆕 سعة شركات التأمين ───
  | 'freeInsuranceCompaniesCapacityMessage'
  | 'premiumInsuranceCompaniesCapacityMessage'

  | 'plusInsuranceCompaniesCapacityMessage'
  // ─── برو ماكس ───
  | 'proMaxAnalysisLimitMessage'
  | 'proMaxRecordsCapacityMessage'
  | 'proMaxPublicBookingLimitMessage'
  | 'proMaxSecretaryEntryRequestLimitMessage'
  | 'proMaxReadyPrescriptionDailyLimitMessage'
  | 'proMaxMedicalReportLimitMessage'
  | 'proMaxInteractionToolLimitMessage'
  | 'proMaxPregnancyToolLimitMessage'
  | 'proMaxRenalToolLimitMessage'
  | 'proMaxGuidelinesChatLimitMessage'
  | 'proMaxReadyPrescriptionsCapacityMessage'
  | 'proMaxMedicationCustomizationsCapacityMessage'
  | 'proMaxBranchesCapacityMessage'
  | 'proMaxInsuranceCompaniesCapacityMessage';

export type WhatsappMessageKey =
  | 'freeAnalysisWhatsappMessage'
  | 'premiumAnalysisWhatsappMessage'

  | 'plusAnalysisWhatsappMessage'
  // 🆕 رسائل واتساب الزر السريع "إضافة بدون تحليل"
  | 'freeQuickAddWhatsappMessage'
  | 'premiumQuickAddWhatsappMessage'

  | 'plusQuickAddWhatsappMessage'
  | 'proMaxQuickAddWhatsappMessage'
  // ─── رسائل واتساب سعة السجلات الطبية ───
  | 'freeRecordsCapacityWhatsappMessage'
  | 'premiumRecordsCapacityWhatsappMessage'

  | 'plusRecordsCapacityWhatsappMessage'
  | 'freePublicBookingWhatsappMessage'
  | 'premiumPublicBookingWhatsappMessage'

  | 'plusPublicBookingWhatsappMessage'
  | 'freeSecretaryEntryRequestWhatsappMessage'
  | 'premiumSecretaryEntryRequestWhatsappMessage'

  | 'plusSecretaryEntryRequestWhatsappMessage'
  | 'freeReadyPrescriptionWhatsappMessage'
  | 'premiumReadyPrescriptionWhatsappMessage'

  | 'plusReadyPrescriptionWhatsappMessage'
  | 'freeMedicalReportWhatsappMessage'
  | 'premiumMedicalReportWhatsappMessage'

  | 'plusMedicalReportWhatsappMessage'
  // ✂️ شيلنا رسائل واتساب الترجمة (2026-05)
  // ─── 🆕 الأزرار الذهبية تحت الروشتة ───
  | 'freeInteractionToolWhatsappMessage'
  | 'premiumInteractionToolWhatsappMessage'

  | 'plusInteractionToolWhatsappMessage'
  | 'freePregnancyToolWhatsappMessage'
  | 'premiumPregnancyToolWhatsappMessage'

  | 'plusPregnancyToolWhatsappMessage'
  // ─── 🆕 الكلى ───
  | 'freeRenalToolWhatsappMessage'
  | 'premiumRenalToolWhatsappMessage'

  | 'plusRenalToolWhatsappMessage'
  | 'freeGuidelinesChatWhatsappMessage'
  | 'premiumGuidelinesChatWhatsappMessage'

  | 'plusGuidelinesChatWhatsappMessage'
  | 'freeReadyPrescriptionsCapacityWhatsappMessage'
  | 'premiumReadyPrescriptionsCapacityWhatsappMessage'

  | 'plusReadyPrescriptionsCapacityWhatsappMessage'
  | 'freeMedicationCustomizationsCapacityWhatsappMessage'
  | 'premiumMedicationCustomizationsCapacityWhatsappMessage'

  | 'plusMedicationCustomizationsCapacityWhatsappMessage'
  // ─── سعة الفروع ───
  | 'freeBranchesCapacityWhatsappMessage'
  | 'premiumBranchesCapacityWhatsappMessage'

  | 'plusBranchesCapacityWhatsappMessage'
  // ─── 🆕 سعة شركات التأمين ───
  | 'freeInsuranceCompaniesCapacityWhatsappMessage'
  | 'premiumInsuranceCompaniesCapacityWhatsappMessage'

  | 'plusInsuranceCompaniesCapacityWhatsappMessage'
  // ─── برو ماكس ───
  | 'proMaxAnalysisWhatsappMessage'
  | 'proMaxRecordsCapacityWhatsappMessage'
  | 'proMaxPublicBookingWhatsappMessage'
  | 'proMaxSecretaryEntryRequestWhatsappMessage'
  | 'proMaxReadyPrescriptionWhatsappMessage'
  | 'proMaxMedicalReportWhatsappMessage'
  | 'proMaxInteractionToolWhatsappMessage'
  | 'proMaxPregnancyToolWhatsappMessage'
  | 'proMaxRenalToolWhatsappMessage'
  | 'proMaxGuidelinesChatWhatsappMessage'
  | 'proMaxReadyPrescriptionsCapacityWhatsappMessage'
  | 'proMaxMedicationCustomizationsCapacityWhatsappMessage'
  | 'proMaxBranchesCapacityWhatsappMessage'
  | 'proMaxInsuranceCompaniesCapacityWhatsappMessage';

export type PlanConfig = {
  // الأسماء التجارية في الـ UI: "مجاني" / "برو" / "برو ماكس"
  name: string;
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
  plus?: PlanConfig;
  // برو ماكس اختياري — مش كل الجروبات لسه محدد ليها حدود خاصة
  proMax?: PlanConfig;
};
