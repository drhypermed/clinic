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
  | 'freeRecordDailyLimit'
  | 'premiumRecordDailyLimit'
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
  | 'freeReadyPrescriptionsMaxCount'
  | 'premiumReadyPrescriptionsMaxCount'
  | 'freeMedicationCustomizationsMaxCount'
  | 'premiumMedicationCustomizationsMaxCount'
  // ─── برو ماكس (جديد) — الأدمن يضبط قيمها لاحقاً ───
  | 'proMaxDailyLimit'
  | 'proMaxRecordDailyLimit'
  | 'proMaxPublicBookingDailyLimit'
  | 'proMaxPublicFormBookingDailyLimit'
  | 'proMaxSecretaryEntryRequestDailyLimit'
  | 'proMaxReadyPrescriptionDailyLimit'
  | 'proMaxMedicalReportDailyLimit'
  | 'proMaxReadyPrescriptionsMaxCount'
  | 'proMaxMedicationCustomizationsMaxCount';

export type MessageKey =
  | 'freeAnalysisLimitMessage'
  | 'premiumAnalysisLimitMessage'
  | 'freeRecordLimitMessage'
  | 'premiumRecordLimitMessage'
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
  | 'freeReadyPrescriptionsCapacityMessage'
  | 'premiumReadyPrescriptionsCapacityMessage'
  | 'freeMedicationCustomizationsCapacityMessage'
  | 'premiumMedicationCustomizationsCapacityMessage'
  // ─── برو ماكس ───
  | 'proMaxAnalysisLimitMessage'
  | 'proMaxRecordLimitMessage'
  | 'proMaxPublicBookingLimitMessage'
  | 'proMaxPublicFormBookingLimitMessage'
  | 'proMaxSecretaryEntryRequestLimitMessage'
  | 'proMaxReadyPrescriptionDailyLimitMessage'
  | 'proMaxMedicalReportLimitMessage'
  | 'proMaxReadyPrescriptionsCapacityMessage'
  | 'proMaxMedicationCustomizationsCapacityMessage';

export type WhatsappMessageKey =
  | 'freeAnalysisWhatsappMessage'
  | 'premiumAnalysisWhatsappMessage'
  | 'freeRecordWhatsappMessage'
  | 'premiumRecordWhatsappMessage'
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
  | 'freeReadyPrescriptionsCapacityWhatsappMessage'
  | 'premiumReadyPrescriptionsCapacityWhatsappMessage'
  | 'freeMedicationCustomizationsCapacityWhatsappMessage'
  | 'premiumMedicationCustomizationsCapacityWhatsappMessage'
  // ─── برو ماكس ───
  | 'proMaxAnalysisWhatsappMessage'
  | 'proMaxRecordWhatsappMessage'
  | 'proMaxPublicBookingWhatsappMessage'
  | 'proMaxPublicFormBookingWhatsappMessage'
  | 'proMaxSecretaryEntryRequestWhatsappMessage'
  | 'proMaxReadyPrescriptionWhatsappMessage'
  | 'proMaxMedicalReportWhatsappMessage'
  | 'proMaxReadyPrescriptionsCapacityWhatsappMessage'
  | 'proMaxMedicationCustomizationsCapacityWhatsappMessage';

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
