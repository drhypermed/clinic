const makeRegisterPushToken = require('./push/registerPushToken');
const makeUnregisterPushToken = require('./push/unregisterPushToken');
const makeNotifyDoctorOnNewAppointment = require('./push/notifyDoctorOnNewAppointment');
const makeNotifyDoctorOnSecretaryEntryRequest = require('./push/notifyDoctorOnSecretaryEntryRequest');
const makeNotifySecretaryOnBookingConfigUpdate = require('./push/notifySecretaryOnBookingConfigUpdate');
const makeSendAppUpdateBroadcast = require('./push/sendAppUpdateBroadcast');
const makeSendExternalAudienceNotificationBroadcast = require('./push/sendExternalAudienceNotificationBroadcast');
const makeSendInAppAudienceNotificationBroadcast = require('./push/sendInAppAudienceNotificationBroadcast');
const makeEstimateAudienceSize = require('./push/estimateAudienceSize');
const makeRetryFailedAudienceBroadcasts = require('./push/retryFailedAudienceBroadcasts');
const makeCleanupExternalNotificationBroadcastLogs = require('./push/cleanupExternalNotificationBroadcastLogs');

module.exports = (context) => {
  const sharedContext = {
    ...context,
    // Keep push delivery as near-real-time as possible while avoiding stale queued notifications.
    HIGH_URGENCY_HEADERS: Object.freeze({ Urgency: 'high', TTL: '60' }),
  };

  return {
    registerPushToken: makeRegisterPushToken(sharedContext),
    unregisterPushToken: makeUnregisterPushToken(sharedContext),
    notifyDoctorOnNewAppointment: makeNotifyDoctorOnNewAppointment(sharedContext),
    notifyDoctorOnSecretaryEntryRequest: makeNotifyDoctorOnSecretaryEntryRequest(sharedContext),
    notifySecretaryOnBookingConfigUpdate: makeNotifySecretaryOnBookingConfigUpdate(sharedContext),
    sendAppUpdateBroadcast: makeSendAppUpdateBroadcast(sharedContext),
    sendExternalAudienceNotificationBroadcast: makeSendExternalAudienceNotificationBroadcast(sharedContext),
    sendInAppAudienceNotificationBroadcast: makeSendInAppAudienceNotificationBroadcast(sharedContext),
    estimateAudienceSize: makeEstimateAudienceSize(sharedContext),
    retryFailedAudienceBroadcasts: makeRetryFailedAudienceBroadcasts(sharedContext),
    cleanupExternalNotificationBroadcastLogs: makeCleanupExternalNotificationBroadcastLogs(sharedContext),
  };
};
