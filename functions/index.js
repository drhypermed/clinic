const { onDocumentWritten, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Define Secrets
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

/**
 * Lazy-loaded function context creator.
 * This ensures that heavy modules and factory functions are only 
 * initialized when a function is actually triggered.
 */
let memoizedContext = null;
function getFunctionContext() {
  if (memoizedContext) return memoizedContext;

  const crypto = require('crypto');
  const otpUtils = require('./src/otpUtils');
  const urlUtils = require('./src/urlUtils');
  const accountTypeConfig = require('./src/accountTypeConfig');
  const smartRxDefaults = require('./src/smartRxDefaults');
  const { createAdminCore } = require('./src/adminCore');
  const { createFcmHelpers } = require('./src/fcmHelpers');

  const ENFORCE_APP_CHECK = String(process.env.ENFORCE_APP_CHECK || 'true').toLowerCase() !== 'false';

  const core = createAdminCore({ admin, HttpsError });
  const fcm = createFcmHelpers({ admin, getDb: core.getDb });

  memoizedContext = {
    onCall,
    onSchedule,
    onDocumentWritten,
    onDocumentCreated,
    HttpsError,
    crypto,
    admin,
    ENFORCE_APP_CHECK,
    getDb: core.getDb,
    assertAdminRequest: core.assertAdminRequest,
    deleteQueryBatch: core.deleteQueryBatch,
    deleteExpiredSlotsByScan: core.deleteExpiredSlotsByScan,
    ...urlUtils,
    ...fcm,
    ...otpUtils,
    ...accountTypeConfig,
    ...smartRxDefaults,
    getSmartRxConfig: () => accountTypeConfig.getSmartRxConfig(core.getDb()),
  };

  return memoizedContext;
}

/**
 * Helper to create a lazy function handler.
 */
const lazy = (modulePath, funcName) => {
  return (...args) => {
    const context = getFunctionContext();
    const registration = require(modulePath);
    const handlers = registration(context);
    return handlers[funcName](...args);
  };
};

const ENFORCE_APP_CHECK_ROOT = String(process.env.ENFORCE_APP_CHECK || 'true').toLowerCase() !== 'false';
// App Check افتراضياً مُفعَّل على Gemini للحماية من الـ bots غير المتصفح.
// لو حصل كسر في الإنتاج، اضبط GEMINI_ENFORCE_APP_CHECK=false في functions/.env وأعد النشر.
const GEMINI_ENFORCE_APP_CHECK = String(process.env.GEMINI_ENFORCE_APP_CHECK || 'true').toLowerCase() !== 'false';
// App Check على دوال الاستهلاك (quota) - طبقة دفاع إضافية فوق quota + auth.
const ACCOUNT_CONTROLS_ENFORCE_APP_CHECK = String(process.env.ACCOUNT_CONTROLS_ENFORCE_APP_CHECK || 'true').toLowerCase() !== 'false';
const REGION = 'us-central1';

const parseScalingEnvInt = (name, fallback, min, max) => {
  const raw = process.env[name];
  const parsed = Number.parseInt(String(raw || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const CALLABLE_MIN_INSTANCES = parseScalingEnvInt('CALLABLE_MIN_INSTANCES', 0, 0, 50);
const CRITICAL_CALLABLE_MIN_INSTANCES = parseScalingEnvInt('CRITICAL_CALLABLE_MIN_INSTANCES', 0, 0, 20);
const CALLABLE_MAX_INSTANCES = Math.max(
  CALLABLE_MIN_INSTANCES,
  parseScalingEnvInt('CALLABLE_MAX_INSTANCES', 200, 1, 200)
);
const CALLABLE_CONCURRENCY = parseScalingEnvInt('CALLABLE_CONCURRENCY', 120, 1, 1000);
const GEMINI_MAX_INSTANCES = parseScalingEnvInt('GEMINI_MAX_INSTANCES', 40, 1, CALLABLE_MAX_INSTANCES);
const GEMINI_CONCURRENCY = parseScalingEnvInt('GEMINI_CONCURRENCY', 20, 1, CALLABLE_CONCURRENCY);
const EXTERNAL_BROADCAST_MAX_INSTANCES = parseScalingEnvInt('EXTERNAL_BROADCAST_MAX_INSTANCES', 80, 1, CALLABLE_MAX_INSTANCES);
const EXTERNAL_BROADCAST_CONCURRENCY = parseScalingEnvInt('EXTERNAL_BROADCAST_CONCURRENCY', 10, 1, CALLABLE_CONCURRENCY);

const BASE_CALLABLE_OPTIONS = {
  region: REGION,
  enforceAppCheck: ENFORCE_APP_CHECK_ROOT,
  minInstances: CALLABLE_MIN_INSTANCES,
  maxInstances: CALLABLE_MAX_INSTANCES,
  concurrency: CALLABLE_CONCURRENCY,
};

const CRITICAL_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  minInstances: Math.min(CALLABLE_MAX_INSTANCES, CRITICAL_CALLABLE_MIN_INSTANCES),
};

const SECRETARY_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  enforceAppCheck: false,
};

const ACCOUNT_CONTROLS_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  enforceAppCheck: ACCOUNT_CONTROLS_ENFORCE_APP_CHECK,
};

const SECRETARY_CRITICAL_CALLABLE_OPTIONS = {
  ...CRITICAL_CALLABLE_OPTIONS,
  enforceAppCheck: false,
};

const GEMINI_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  enforceAppCheck: GEMINI_ENFORCE_APP_CHECK,
  maxInstances: Math.max(CALLABLE_MIN_INSTANCES, GEMINI_MAX_INSTANCES),
  concurrency: GEMINI_CONCURRENCY,
};

const EXTERNAL_BROADCAST_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  maxInstances: Math.max(CALLABLE_MIN_INSTANCES, EXTERNAL_BROADCAST_MAX_INSTANCES),
  concurrency: EXTERNAL_BROADCAST_CONCURRENCY,
  timeoutSeconds: 540,
  memory: '1GiB',
};

// --- Public OTP Functions ---
exports.sendPublicEmailOtpCode = onCall(CRITICAL_CALLABLE_OPTIONS, lazy('./src/functions/publicOtpFunctions', 'sendPublicEmailOtpCode'));
exports.verifyPublicEmailOtpCode = onCall(CRITICAL_CALLABLE_OPTIONS, lazy('./src/functions/publicOtpFunctions', 'verifyPublicEmailOtpCode'));
exports.secretaryLoginWithDoctorEmail = onCall(SECRETARY_CRITICAL_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'secretaryLoginWithDoctorEmail'));
exports.deleteAppointmentBySecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'deleteAppointmentBySecretary'));
exports.updateAppointmentBySecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'updateAppointmentBySecretary'));
exports.createAppointmentBySecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'createAppointmentBySecretary'));
exports.listRecentExamRecordsForSecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryExamRecordsFunctions', 'listRecentExamRecordsForSecretary'));
exports.listAppointmentsForSecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'listAppointmentsForSecretary'));

// --- Push Functions ---
exports.registerPushToken = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'registerPushToken'));
exports.unregisterPushToken = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'unregisterPushToken'));
exports.sendAppUpdateBroadcast = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'sendAppUpdateBroadcast'));
exports.sendExternalAudienceNotificationBroadcast = onCall(EXTERNAL_BROADCAST_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'sendExternalAudienceNotificationBroadcast'));
exports.sendInAppAudienceNotificationBroadcast = onCall(EXTERNAL_BROADCAST_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'sendInAppAudienceNotificationBroadcast'));
exports.estimateAudienceSize = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'estimateAudienceSize'));
exports.notifyDoctorOnNewAppointment = onDocumentCreated({ document: 'users/{userId}/appointments/{aptId}', region: REGION }, lazy('./src/functions/pushFunctions', 'notifyDoctorOnNewAppointment'));
exports.notifyDoctorOnSecretaryEntryRequest = onDocumentWritten({ document: 'secretaryEntryRequests/{secret}', region: REGION }, lazy('./src/functions/pushFunctions', 'notifyDoctorOnSecretaryEntryRequest'));
exports.notifySecretaryOnBookingConfigUpdate = onDocumentWritten({ document: 'bookingConfig/{secret}', region: REGION }, lazy('./src/functions/pushFunctions', 'notifySecretaryOnBookingConfigUpdate'));
exports.cleanupExternalNotificationBroadcastLogs = onSchedule({ schedule: 'every day 03:30', timeZone: 'Africa/Cairo', region: REGION }, lazy('./src/functions/pushFunctions', 'cleanupExternalNotificationBroadcastLogs'));
exports.retryFailedAudienceBroadcasts = onSchedule({ schedule: 'every 30 minutes', timeZone: 'Africa/Cairo', region: REGION }, lazy('./src/functions/pushFunctions', 'retryFailedAudienceBroadcasts'));
exports.onDoctorAdReviewWrite = onDocumentWritten({ document: 'doctorAdReviews/{doctorId}/items/{reviewId}', region: REGION }, lazy('./src/functions/reviewFunctions', 'onDoctorAdReviewWrite'));
exports.enforceUserTextLengthTopLevel = onDocumentWritten(
  { document: '{collectionId}/{docId}', region: REGION },
  lazy('./src/functions/securityFunctions', 'enforceFirestoreTextLengthOnWrite')
);
exports.enforceUserTextLengthSubLevel = onDocumentWritten(
  { document: '{collectionId}/{docId}/{subCollectionId}/{subDocId}', region: REGION },
  lazy('./src/functions/securityFunctions', 'enforceFirestoreTextLengthOnWrite')
);
exports.enforceUserTextLengthNestedLevel = onDocumentWritten(
  { document: '{collectionId}/{docId}/{subCollectionId}/{subDocId}/{nestedCollectionId}/{nestedDocId}', region: REGION },
  lazy('./src/functions/securityFunctions', 'enforceFirestoreTextLengthOnWrite')
);

// --- Cleanup Functions ---
exports.runCleanupNow = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/cleanupFunctions', 'runCleanupNow'));
exports.cleanupCompletedAppointments = onSchedule(
  { schedule: 'every day 02:00', timeZone: 'Africa/Cairo', region: REGION },
  lazy('./src/functions/cleanupFunctions', 'cleanupOldCompletedAppointments')
);
// تنظيف سجلات الأخطاء الأقدم من 30 يوم — كل يوم الساعة 3 الفجر
exports.cleanupOldErrorLogs = onSchedule(
  { schedule: 'every day 03:00', timeZone: 'Africa/Cairo', region: REGION },
  lazy('./src/functions/cleanupFunctions', 'cleanupOldErrorLogs')
);
// تنظيف أحداث تتبع الاستخدام الأقدم من 90 يوم — كل يوم الساعة 3:15 الفجر
exports.cleanupOldUsageEvents = onSchedule(
  { schedule: 'every day 03:15', timeZone: 'Africa/Cairo', region: REGION },
  lazy('./src/functions/cleanupFunctions', 'cleanupOldUsageEvents')
);
exports.refreshAdminDashboardAggregates = onSchedule(
  { schedule: '0 */6 * * *', timeZone: 'Africa/Cairo', region: REGION },
  lazy('./src/functions/dashboardAggregationFunctions', 'refreshAdminDashboardAggregates')
);
exports.refreshAdminDashboardAggregatesNow = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/dashboardAggregationFunctions', 'refreshAdminDashboardAggregatesNow')
);
exports.syncAdminDashboardUserCounter = onDocumentWritten(
  { document: 'users/{userId}', region: REGION },
  lazy('./src/functions/dashboardCounterFunctions', 'syncAdminDashboardUserCounter')
);
// B2: مباعدة عن refreshAdminDashboardAggregates (تعمل كل ٦ ساعات على الساعات 0,6,12,18).
// هذه تعمل بعدها بـ ٥ دقائق لتفادي الكتابة المتزامنة على settings/adminDashboardStats.
exports.materializeAdminDashboardSummary = onSchedule(
  { schedule: '5 */6 * * *', timeZone: 'Africa/Cairo', region: REGION },
  lazy('./src/functions/dashboardCounterFunctions', 'materializeAdminDashboardSummary')
);
exports.materializeAdminDashboardSummaryNow = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/dashboardCounterFunctions', 'materializeAdminDashboardSummaryNow')
);
exports.initializeAdminDashboardCounterBaseline = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/dashboardCounterFunctions', 'initializeAdminDashboardCounterBaseline')
);


// --- Admin Functions ---
exports.deleteDoctorAccount = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/adminFunctions', 'deleteDoctorAccount'));
exports.setDoctorAccountDisabled = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/adminFunctions', 'setDoctorAccountDisabled'));
exports.setPublicAccountDisabled = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/publicAccountFunctions', 'setPublicAccountDisabled'));
exports.deletePublicAccount = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/publicAccountFunctions', 'deletePublicAccount'));
// ⚠️ TEMPORARY: One-time cleanup of legacy plain-text booking password field.
// Delete this line + the file cleanupLegacyBookingPasswordPlain.js after running once.
exports.cleanupLegacyBookingPasswordPlain = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/cleanupLegacyBookingPasswordPlain', 'cleanupLegacyBookingPasswordPlain'));

// نسخ احتياطي يومي لـ Firestore → Cloud Storage، مع تنظيف النسخ > 30 يوم.
exports.scheduledFirestoreExport = onSchedule(
  { schedule: '30 02 * * *', timeZone: 'Africa/Cairo', region: REGION, timeoutSeconds: 540 },
  lazy('./src/functions/scheduledFirestoreExport', 'scheduledFirestoreExport')
);
exports.generateGeminiContent = onCall({ 
  ...GEMINI_CALLABLE_OPTIONS,
  secrets: [GEMINI_API_KEY]
}, lazy('./src/functions/adminFunctions', 'generateGeminiContent'));

// --- Account Controls Functions ---
exports.getAccountTypeControls = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'getAccountTypeControls'));
exports.updateAccountTypeControls = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'updateAccountTypeControls'));
exports.consumeSmartPrescriptionQuota = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'consumeSmartPrescriptionQuota'));
exports.consumeStorageQuota = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'consumeStorageQuota'));
exports.consumeBookingQuota = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'consumeBookingQuota'));
exports.consumeDrugToolQuota = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'consumeDrugToolQuota'));

// --- Subscription Functions ---
exports.checkExpiredPremiumSubscriptions = onSchedule({ schedule: 'every day 02:00', timeZone: 'Africa/Cairo', region: REGION }, lazy('./src/functions/subscriptionFunctions', 'checkExpiredPremiumSubscriptions'));
exports.runExpiredSubscriptionsCheckNow = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/subscriptionFunctions', 'runExpiredSubscriptionsCheckNow'));

// --- SEO Functions (sitemap + robots) ---
// الـresponse مكاشّش على CDN لـ24 ساعه — الـFirestore reads تقريباً = 1 في اليوم.
// minInstances = 0 (مفيش warm instance — SEO ميحتاجش سرعه لحظيّه، الكاش بيتولّى).
const { createSitemapHandler, robotsHandler } = require('./src/seo');
const SEO_REQUEST_OPTIONS = {
  region: REGION,
  memory: '256MiB',
  timeoutSeconds: 30,
  minInstances: 0,
  maxInstances: 5,
  concurrency: 80,
};
exports.sitemap = onRequest(SEO_REQUEST_OPTIONS, createSitemapHandler(admin));
exports.robots = onRequest(SEO_REQUEST_OPTIONS, robotsHandler);
