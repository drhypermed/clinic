const makeGetAccountTypeControls = require('./account-controls/getAccountTypeControls');
const makeUpdateAccountTypeControls = require('./account-controls/updateAccountTypeControls');
const makeConsumeSmartPrescriptionQuota = require('./account-controls/consumeSmartPrescriptionQuota');
const makeConsumeStorageQuota = require('./account-controls/consumeStorageQuota');
const makeConsumeBookingQuota = require('./account-controls/consumeBookingQuota');
const makeConsumeDrugToolQuota = require('./account-controls/consumeDrugToolQuota');

module.exports = (context) => {
  return {
    getAccountTypeControls: makeGetAccountTypeControls(context),
    updateAccountTypeControls: makeUpdateAccountTypeControls(context),
    consumeSmartPrescriptionQuota: makeConsumeSmartPrescriptionQuota(context),
    consumeStorageQuota: makeConsumeStorageQuota(context),
    consumeBookingQuota: makeConsumeBookingQuota(context),
    consumeDrugToolQuota: makeConsumeDrugToolQuota(context),
  };
};
