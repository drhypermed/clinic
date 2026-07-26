const runMaintenanceSteps = async (steps, logPrefix) => {
  const results = [];

  for (const [name, handler] of steps) {
    const startedAt = Date.now();
    try {
      const value = await handler();
      results.push({ name, ok: true, durationMs: Date.now() - startedAt, value });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${logPrefix} ${name} failed:`, message);
      results.push({ name, ok: false, durationMs: Date.now() - startedAt, error: message });
    }
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    const error = new Error(`${logPrefix} ${failed.length}/${results.length} step(s) failed: ${failed.map((item) => item.name).join(', ')}`);
    error.results = results;
    throw error;
  }

  return { ok: true, completed: results.length, results };
};

const isSundayInCairo = (date = new Date()) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Cairo',
  weekday: 'short',
}).format(date) === 'Sun';

const getBackupStepForDate = ({ backups, date = new Date() }) => (
  isSundayInCairo(date)
    ? ['scheduledFullFirestoreExport', backups.scheduledFullFirestoreExport]
    : ['scheduledClinicalFirestoreExport', backups.scheduledClinicalFirestoreExport]
);

module.exports = (context) => {
  const cleanup = require('./cleanupFunctions')(context);
  const push = require('./pushFunctions')(context);
  const subscriptions = require('./subscriptionFunctions')(context);
  const dashboardAggregation = require('./dashboardAggregationFunctions')(context);
  const dashboardCounters = require('./dashboardCounterFunctions')(context);
  const backups = require('./scheduledFirestoreExport')(context);

  const dailyMaintenance = () => runMaintenanceSteps([
    // Start the managed export first; the API returns as soon as the operation
    // is queued. Sunday uses the full backup instead of creating two exports.
    getBackupStepForDate({ backups }),
    ['checkExpiredProSubscriptions', subscriptions.checkExpiredProSubscriptions],
    ['cleanupOldCompletedAppointments', cleanup.cleanupOldCompletedAppointments],
    ['cleanupOldErrorLogs', cleanup.cleanupOldErrorLogs],
    ['cleanupOldUsageEvents', cleanup.cleanupOldUsageEvents],
    ['cleanupOldDismissedAppointmentNotifications', cleanup.cleanupOldDismissedAppointmentNotifications],
    ['cleanupExternalNotificationBroadcastLogs', push.cleanupExternalNotificationBroadcastLogs],
    ['refreshAdminDashboardAggregates', dashboardAggregation.refreshAdminDashboardAggregates],
    ['materializeAdminDashboardSummary', dashboardCounters.materializeAdminDashboardSummary],
  ], '[dailyMaintenance]');

  const monthlyMaintenance = () => runMaintenanceSteps([
    ['cleanupOldPatientRecords', cleanup.cleanupOldPatientRecords],
    ['disableInactiveFreeAccounts', cleanup.disableInactiveFreeAccounts],
    ['deleteAbandonedDisabledAccounts', cleanup.deleteAbandonedDisabledAccounts],
  ], '[monthlyMaintenance]');

  return { dailyMaintenance, monthlyMaintenance };
};

module.exports.runMaintenanceSteps = runMaintenanceSteps;
module.exports.getBackupStepForDate = getBackupStepForDate;
module.exports.isSundayInCairo = isSundayInCairo;
