const makeGetAccountTypeControls = require('./account-controls/getAccountTypeControls');
const makeUpdateAccountTypeControls = require('./account-controls/updateAccountTypeControls');
const makeConsumeSmartPrescriptionQuota = require('./account-controls/consumeSmartPrescriptionQuota');
const makeConsumeStorageQuota = require('./account-controls/consumeStorageQuota');
const makeConsumeBookingQuota = require('./account-controls/consumeBookingQuota');
const makeConsumeDrugToolQuota = require('./account-controls/consumeDrugToolQuota');
// ✂️ شيلنا makeConsumeTranslationQuota (2026-05) — الترجمة بقت بدون حد منفصل
const makeValidateRecordsCapacity = require('./account-controls/validateRecordsCapacity');
const makeValidateReadyPrescriptionsCapacity = require('./account-controls/validateReadyPrescriptionsCapacity');
const makeValidateMedicationCustomizationsCapacity = require('./account-controls/validateMedicationCustomizationsCapacity');
const makeValidateInsuranceCompaniesCapacity = require('./account-controls/validateInsuranceCompaniesCapacity');

module.exports = (context) => {
  return {
    getAccountTypeControls: makeGetAccountTypeControls(context),
    updateAccountTypeControls: makeUpdateAccountTypeControls(context),
    consumeSmartPrescriptionQuota: makeConsumeSmartPrescriptionQuota(context),
    consumeStorageQuota: makeConsumeStorageQuota(context),
    consumeBookingQuota: makeConsumeBookingQuota(context),
    consumeDrugToolQuota: makeConsumeDrugToolQuota(context),
    // ✂️ شيلنا consumeTranslationQuota (2026-05)
    // ─── فحص سعة السجلات على السيرفر (تشديد أمني 2026-04) ───
    validateRecordsCapacity: makeValidateRecordsCapacity(context),
    // ─── فحص سعة الروشتات الجاهزة + الأدوية المعدّلة (تشديد أمني 2026-04) ───
    validateReadyPrescriptionsCapacity: makeValidateReadyPrescriptionsCapacity(context),
    validateMedicationCustomizationsCapacity: makeValidateMedicationCustomizationsCapacity(context),
    // ─── 🆕 فحص سعة شركات التأمين 2026-04 ───
    validateInsuranceCompaniesCapacity: makeValidateInsuranceCompaniesCapacity(context),
  };
};
