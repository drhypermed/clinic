import type { AccountTypeControls } from '../../../services/accountTypeControlsService';
import { DEFAULT_CONTROLS } from '../../../services/account-type-controls/defaults';
import type { LimitKey, MessageKey, WhatsappMessageKey } from './types';

// نفس DEFAULT_CONTROLS من services (المصدر الوحيد للحقيقة).
export const DEFAULT_FORM: AccountTypeControls = DEFAULT_CONTROLS;

export const LIMIT_KEYS: LimitKey[] = [
  'freeDailyLimit', 'premiumDailyLimit', 'plusDailyLimit',
  'freeQuickAddDailyLimit', 'premiumQuickAddDailyLimit', 'plusQuickAddDailyLimit', 'proMaxQuickAddDailyLimit',
  'freeRecordsMaxCount', 'premiumRecordsMaxCount', 'plusRecordsMaxCount',
  'freePublicBookingDailyLimit', 'premiumPublicBookingDailyLimit', 'plusPublicBookingDailyLimit',
  'freeSecretaryEntryRequestDailyLimit', 'premiumSecretaryEntryRequestDailyLimit', 'plusSecretaryEntryRequestDailyLimit',
  'freeReadyPrescriptionDailyLimit', 'premiumReadyPrescriptionDailyLimit', 'plusReadyPrescriptionDailyLimit',
  'freeMedicalReportDailyLimit', 'premiumMedicalReportDailyLimit', 'plusMedicalReportDailyLimit',
  'freeInteractionToolDailyLimit', 'premiumInteractionToolDailyLimit', 'plusInteractionToolDailyLimit',
  'freePregnancyToolDailyLimit', 'premiumPregnancyToolDailyLimit', 'plusPregnancyToolDailyLimit',
  'freeRenalToolDailyLimit', 'premiumRenalToolDailyLimit', 'plusRenalToolDailyLimit',
  'freeGuidelinesChatDailyLimit', 'premiumGuidelinesChatDailyLimit', 'plusGuidelinesChatDailyLimit',
  'freeReadyPrescriptionsMaxCount', 'premiumReadyPrescriptionsMaxCount', 'plusReadyPrescriptionsMaxCount',
  'freeMedicationCustomizationsMaxCount', 'premiumMedicationCustomizationsMaxCount', 'plusMedicationCustomizationsMaxCount',
  'freeBranchesMaxCount', 'premiumBranchesMaxCount', 'plusBranchesMaxCount',
  'freeInsuranceCompaniesMaxCount', 'premiumInsuranceCompaniesMaxCount', 'plusInsuranceCompaniesMaxCount',
  'proMaxDailyLimit', 'proMaxRecordsMaxCount', 'proMaxPublicBookingDailyLimit',
  'proMaxSecretaryEntryRequestDailyLimit', 'proMaxReadyPrescriptionDailyLimit', 'proMaxMedicalReportDailyLimit',
  'proMaxInteractionToolDailyLimit', 'proMaxPregnancyToolDailyLimit', 'proMaxRenalToolDailyLimit',
  'proMaxGuidelinesChatDailyLimit', 'proMaxReadyPrescriptionsMaxCount', 'proMaxMedicationCustomizationsMaxCount',
  'proMaxBranchesMaxCount', 'proMaxInsuranceCompaniesMaxCount',
];

export const DRUG_TOOLS_LIMIT_KEYS: Array<
  | 'freeInteractionToolDailyLimit' | 'premiumInteractionToolDailyLimit' | 'plusInteractionToolDailyLimit'
  | 'proMaxInteractionToolDailyLimit' | 'freeRenalToolDailyLimit' | 'premiumRenalToolDailyLimit'
  | 'plusRenalToolDailyLimit' | 'proMaxRenalToolDailyLimit' | 'freePregnancyToolDailyLimit'
  | 'premiumPregnancyToolDailyLimit' | 'plusPregnancyToolDailyLimit' | 'proMaxPregnancyToolDailyLimit'
> = [
  'freeInteractionToolDailyLimit', 'premiumInteractionToolDailyLimit', 'plusInteractionToolDailyLimit',
  'proMaxInteractionToolDailyLimit', 'freeRenalToolDailyLimit', 'premiumRenalToolDailyLimit',
  'plusRenalToolDailyLimit', 'proMaxRenalToolDailyLimit', 'freePregnancyToolDailyLimit',
  'premiumPregnancyToolDailyLimit', 'plusPregnancyToolDailyLimit', 'proMaxPregnancyToolDailyLimit',
];

export const LIMIT_MESSAGE_KEYS: MessageKey[] = [
  'freeAnalysisLimitMessage', 'premiumAnalysisLimitMessage', 'plusAnalysisLimitMessage',
  'freeQuickAddLimitMessage', 'premiumQuickAddLimitMessage', 'plusQuickAddLimitMessage', 'proMaxQuickAddLimitMessage',
  'freeRecordsCapacityMessage', 'premiumRecordsCapacityMessage', 'plusRecordsCapacityMessage',
  'freePublicBookingLimitMessage', 'premiumPublicBookingLimitMessage', 'plusPublicBookingLimitMessage',
  'freeSecretaryEntryRequestLimitMessage', 'premiumSecretaryEntryRequestLimitMessage', 'plusSecretaryEntryRequestLimitMessage',
  'freeReadyPrescriptionDailyLimitMessage', 'premiumReadyPrescriptionDailyLimitMessage', 'plusReadyPrescriptionDailyLimitMessage',
  'freeMedicalReportLimitMessage', 'premiumMedicalReportLimitMessage', 'plusMedicalReportLimitMessage',
  'freeInteractionToolLimitMessage', 'premiumInteractionToolLimitMessage', 'plusInteractionToolLimitMessage',
  'freePregnancyToolLimitMessage', 'premiumPregnancyToolLimitMessage', 'plusPregnancyToolLimitMessage',
  'freeRenalToolLimitMessage', 'premiumRenalToolLimitMessage', 'plusRenalToolLimitMessage',
  'freeGuidelinesChatLimitMessage', 'premiumGuidelinesChatLimitMessage', 'plusGuidelinesChatLimitMessage',
  'freeReadyPrescriptionsCapacityMessage', 'premiumReadyPrescriptionsCapacityMessage', 'plusReadyPrescriptionsCapacityMessage',
  'freeMedicationCustomizationsCapacityMessage', 'premiumMedicationCustomizationsCapacityMessage', 'plusMedicationCustomizationsCapacityMessage',
  'freeBranchesCapacityMessage', 'premiumBranchesCapacityMessage', 'plusBranchesCapacityMessage',
  'freeInsuranceCompaniesCapacityMessage', 'premiumInsuranceCompaniesCapacityMessage', 'plusInsuranceCompaniesCapacityMessage',
  'proMaxAnalysisLimitMessage', 'proMaxRecordsCapacityMessage', 'proMaxPublicBookingLimitMessage',
  'proMaxSecretaryEntryRequestLimitMessage', 'proMaxReadyPrescriptionDailyLimitMessage', 'proMaxMedicalReportLimitMessage',
  'proMaxInteractionToolLimitMessage', 'proMaxPregnancyToolLimitMessage', 'proMaxRenalToolLimitMessage',
  'proMaxGuidelinesChatLimitMessage', 'proMaxReadyPrescriptionsCapacityMessage',
  'proMaxMedicationCustomizationsCapacityMessage', 'proMaxBranchesCapacityMessage',
  'proMaxInsuranceCompaniesCapacityMessage',
];

export const WHATSAPP_MESSAGE_KEYS: WhatsappMessageKey[] = [
  'freeAnalysisWhatsappMessage', 'premiumAnalysisWhatsappMessage', 'plusAnalysisWhatsappMessage',
  'freeQuickAddWhatsappMessage', 'premiumQuickAddWhatsappMessage', 'plusQuickAddWhatsappMessage', 'proMaxQuickAddWhatsappMessage',
  'freeRecordsCapacityWhatsappMessage', 'premiumRecordsCapacityWhatsappMessage', 'plusRecordsCapacityWhatsappMessage',
  'freePublicBookingWhatsappMessage', 'premiumPublicBookingWhatsappMessage', 'plusPublicBookingWhatsappMessage',
  'freeSecretaryEntryRequestWhatsappMessage', 'premiumSecretaryEntryRequestWhatsappMessage', 'plusSecretaryEntryRequestWhatsappMessage',
  'freeReadyPrescriptionWhatsappMessage', 'premiumReadyPrescriptionWhatsappMessage', 'plusReadyPrescriptionWhatsappMessage',
  'freeMedicalReportWhatsappMessage', 'premiumMedicalReportWhatsappMessage', 'plusMedicalReportWhatsappMessage',
  'freeInteractionToolWhatsappMessage', 'premiumInteractionToolWhatsappMessage', 'plusInteractionToolWhatsappMessage',
  'freePregnancyToolWhatsappMessage', 'premiumPregnancyToolWhatsappMessage', 'plusPregnancyToolWhatsappMessage',
  'freeRenalToolWhatsappMessage', 'premiumRenalToolWhatsappMessage', 'plusRenalToolWhatsappMessage',
  'freeGuidelinesChatWhatsappMessage', 'premiumGuidelinesChatWhatsappMessage', 'plusGuidelinesChatWhatsappMessage',
  'freeReadyPrescriptionsCapacityWhatsappMessage', 'premiumReadyPrescriptionsCapacityWhatsappMessage',
  'plusReadyPrescriptionsCapacityWhatsappMessage', 'freeMedicationCustomizationsCapacityWhatsappMessage',
  'premiumMedicationCustomizationsCapacityWhatsappMessage', 'plusMedicationCustomizationsCapacityWhatsappMessage',
  'freeBranchesCapacityWhatsappMessage', 'premiumBranchesCapacityWhatsappMessage', 'plusBranchesCapacityWhatsappMessage',
  'freeInsuranceCompaniesCapacityWhatsappMessage', 'premiumInsuranceCompaniesCapacityWhatsappMessage',
  'plusInsuranceCompaniesCapacityWhatsappMessage', 'proMaxAnalysisWhatsappMessage',
  'proMaxRecordsCapacityWhatsappMessage', 'proMaxPublicBookingWhatsappMessage',
  'proMaxSecretaryEntryRequestWhatsappMessage', 'proMaxReadyPrescriptionWhatsappMessage',
  'proMaxMedicalReportWhatsappMessage', 'proMaxInteractionToolWhatsappMessage',
  'proMaxPregnancyToolWhatsappMessage', 'proMaxRenalToolWhatsappMessage',
  'proMaxGuidelinesChatWhatsappMessage', 'proMaxReadyPrescriptionsCapacityWhatsappMessage',
  'proMaxMedicationCustomizationsCapacityWhatsappMessage', 'proMaxBranchesCapacityWhatsappMessage',
  'proMaxInsuranceCompaniesCapacityWhatsappMessage',
];
