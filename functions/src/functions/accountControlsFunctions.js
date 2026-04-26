const makeGetAccountTypeControls = require('./account-controls/getAccountTypeControls');
const makeUpdateAccountTypeControls = require('./account-controls/updateAccountTypeControls');
const makeConsumeSmartPrescriptionQuota = require('./account-controls/consumeSmartPrescriptionQuota');
const makeConsumeStorageQuota = require('./account-controls/consumeStorageQuota');
const makeConsumeBookingQuota = require('./account-controls/consumeBookingQuota');
const makeConsumeDrugToolQuota = require('./account-controls/consumeDrugToolQuota');
const makeConsumeTranslationQuota = require('./account-controls/consumeTranslationQuota');
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
    // ─── الترجمة الذكية للروشتة (جديد — كانت بتشتغل بدون حد قبل كده) ───
    consumeTranslationQuota: makeConsumeTranslationQuota(context),
    // ─── فحص سعة السجلات على السيرفر (تشديد أمني 2026-04) ───
    validateRecordsCapacity: makeValidateRecordsCapacity(context),
    // ─── فحص سعة الروشتات الجاهزة + الأدوية المعدّلة (تشديد أمني 2026-04) ───
    validateReadyPrescriptionsCapacity: makeValidateReadyPrescriptionsCapacity(context),
    validateMedicationCustomizationsCapacity: makeValidateMedicationCustomizationsCapacity(context),
    // ─── 🆕 فحص سعة شركات التأمين 2026-04 ───
    validateInsuranceCompaniesCapacity: makeValidateInsuranceCompaniesCapacity(context),
  };
};
