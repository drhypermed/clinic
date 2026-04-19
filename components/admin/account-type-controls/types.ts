/**
 * الملف: types.ts
 * الوصف: "قاموس إعدادات الباقات". 
 * يحتوي على تعريفات الجداول والأنواع المستخدمة في التحكم في مميزات الحسابات (Free/Premium): 
 * - PlanConfig: إعدادات الباقة (الاسم، السعر، المميزات المتاحة). 
 * - FeatureFlag: مفاتيح التحكم في تفعيل أو تعطيل ميزة معينة. 
 * - DrugToolConfig: إعدادات أدوات الأدوية المتاحة لكل باقة.
 * تحدد هيكل البيانات لنموذج التحكم في أنواع الحسابات وإعدادات الخطط.
 */

import type { AccountTypeControls } from '../../../services/accountTypeControlsService';

export type AccountTypeControlsForm = AccountTypeControls;

export type LimitKey =
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
  | 'premiumMedicationCustomizationsMaxCount';

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
  | 'premiumMedicationCustomizationsCapacityMessage';

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
  | 'premiumMedicationCustomizationsCapacityWhatsappMessage';

export type PlanConfig = {
  name: 'مجاني' | 'مميز';
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
};
