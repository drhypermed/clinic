export {
  getAccountTypeControls,
  updateAccountTypeControls,
} from './account-type-controls/controls';

export {
  consumeSmartPrescriptionQuota,
  consumeStorageQuota,
  consumeBookingQuota,
  consumeDrugToolQuota,
  validateRecordsCapacity,
  validateReadyPrescriptionsCapacity,
  validateMedicationCustomizationsCapacity,
  validateInsuranceCompaniesCapacity,
  // ─── 🆕 إنشاء فرع على السيرفر 2026-05 (تشديد أمني كامل — atomic) ───
  //   استبدل validateBranchesCapacity — الفحص + الإنشاء في عملية واحدة.
  createBranchOnServer,
} from './account-type-controls/quotas';
export type { CreateBranchInput, CreateBranchResult } from './account-type-controls/quotas';

export type {
  AccountTypeControls,
  SmartPrescriptionQuotaResult,
  StorageQuotaFeature,
  StorageQuotaResult,
  BookingQuotaFeature,
  BookingQuotaResult,
  DrugToolQuotaFeature,
  DrugToolQuotaResult,
  RecordsCapacityResult,
  CapacityCheckResult,
  SmartQuotaLimitErrorDetails,
} from './account-type-controls/types';
