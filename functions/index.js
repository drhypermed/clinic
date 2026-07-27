const { onDocumentWritten, onDocumentCreated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

if (admin.apps.length === 0) {
  let adminConfig = {};
  if (process.env.FIREBASE_CONFIG) {
    try { adminConfig = JSON.parse(process.env.FIREBASE_CONFIG); } catch (e) {}
  }
  // If we are deploying/running locally and projectId is missing, provide a fallback 
  // to prevent Admin SDK from hanging while waiting for GCP metadata server.
  if (!adminConfig.projectId) {
    adminConfig.projectId = process.env.GCLOUD_PROJECT || 'gen-lang-client-0444130146';
  }
  admin.initializeApp(adminConfig);
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
  const emailUtils = require('./src/emailUtils');
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
    onDocumentDeleted,
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
    ...emailUtils,
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
// Quota/account-control callables already enforce auth, doctor ownership/secrets,
// admin checks, and Firestore transactions. Keeping App Check optional here avoids
// blocking real doctors when reCAPTCHA/App Check is flaky on a device/network.
const ACCOUNT_CONTROLS_ENFORCE_APP_CHECK = String(process.env.ACCOUNT_CONTROLS_ENFORCE_APP_CHECK || 'false').toLowerCase() !== 'false';
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

const SECRETARY_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  enforceAppCheck: false,
};

const GUIDELINES_SEARCH_CALLABLE_OPTIONS = {
  ...SECRETARY_CALLABLE_OPTIONS,
  memory: '1GiB',
  timeoutSeconds: 180,
  concurrency: 4,
};

const ACCOUNT_CONTROLS_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  enforceAppCheck: ACCOUNT_CONTROLS_ENFORCE_APP_CHECK,
};

const SECRETARY_CRITICAL_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  minInstances: Math.min(CALLABLE_MAX_INSTANCES, CRITICAL_CALLABLE_MIN_INSTANCES),
  enforceAppCheck: false,
};

const GEMINI_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  enforceAppCheck: GEMINI_ENFORCE_APP_CHECK,
  maxInstances: Math.max(CALLABLE_MIN_INSTANCES, GEMINI_MAX_INSTANCES),
  concurrency: GEMINI_CONCURRENCY,
  timeoutSeconds: 120,
};

const EXTERNAL_BROADCAST_CALLABLE_OPTIONS = {
  ...BASE_CALLABLE_OPTIONS,
  maxInstances: Math.max(CALLABLE_MIN_INSTANCES, EXTERNAL_BROADCAST_MAX_INSTANCES),
  concurrency: EXTERNAL_BROADCAST_CONCURRENCY,
  timeoutSeconds: 540,
  memory: '1GiB',
};

exports.secretaryLogin = onCall(SECRETARY_CRITICAL_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'secretaryLogin'));
exports.secretaryLoginWithDoctorEmail = onCall(SECRETARY_CRITICAL_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'secretaryLoginWithDoctorEmail'));
exports.setSecretaryUsername = onCall(SECRETARY_CRITICAL_CALLABLE_OPTIONS, lazy('./src/functions/secretaryUsernameFunctions', 'setSecretaryUsername'));
exports.deleteAppointmentBySecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'deleteAppointmentBySecretary'));
exports.updateAppointmentBySecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'updateAppointmentBySecretary'));
exports.createAppointmentBySecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'createAppointmentBySecretary'));
exports.listRecentExamRecordsForSecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryExamRecordsFunctions', 'listRecentExamRecordsForSecretary'));
exports.searchPatientsForSecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryPatientSearchFunctions', 'searchPatientsForSecretary'));
exports.listAppointmentsForSecretary = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'listAppointmentsForSecretary'));
exports.upsertPatientAddressTemplate = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/patientAddressTemplateFunctions', 'upsertPatientAddressTemplate'));
// 🔒 2026-05-10: تجديد الـ Firebase Custom Token للسكرتيرة كل ~٥٠ دقيقة
// عشان الكتابات على Firestore تفضل تشتغل بعد ساعة (الـ token عمره ساعة).
// بدون كده، تشديد الـ rules (إزالة fallback bookingConfigExists) كان هيخلي
// السكرتيرة تفقد قدرة الإرسال للطبيب بعد أول ساعة.
exports.refreshSecretaryCustomToken = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'refreshSecretaryCustomToken'));
// 🔒 2026-05-10: قراءة metadata آمنة من bookingConfig للـlogin screen قبل الـauth.
// ضرورية بعد تشديد rule `bookingConfig.get` ليطلب auth — الـCF دي تستخدم Admin SDK.
exports.getBookingConfigPublicMetadata = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/secretaryLoginFunctions', 'getBookingConfigPublicMetadata'));

// --- Push Functions ---
// ملاحظة: register/unregister بدون enforceAppCheck — السبب:
// 1) السكرتيرة بتسجّل توكن من صفحة public booking بدون Firebase Auth (بـsessionToken).
// 2) بعض المتصفحات (Safari/PWA/مع blocked reCAPTCHA) ما بتقدرش تولّد App Check token،
//    وده كان بيرجع 401 Unauthorized على أجهزة المستخدمين بدون أي سبب حقيقي.
// 3) الحماية الفعلية موجودة في الكود نفسه (auth.uid للطبيب، sessionToken للسكرتيرة،
//    secret + bookingConfig validation). App Check طبقة إضافية كنا نخسر بسببها users.
exports.registerPushToken = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'registerPushToken'));
exports.unregisterPushToken = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'unregisterPushToken'));
exports.sendAppUpdateBroadcast = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'sendAppUpdateBroadcast'));
exports.sendExternalAudienceNotificationBroadcast = onCall(EXTERNAL_BROADCAST_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'sendExternalAudienceNotificationBroadcast'));
exports.sendInAppAudienceNotificationBroadcast = onCall(EXTERNAL_BROADCAST_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'sendInAppAudienceNotificationBroadcast'));
exports.estimateAudienceSize = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/pushFunctions', 'estimateAudienceSize'));
exports.notifyDoctorOnNewAppointment = onDocumentCreated({ document: 'users/{userId}/appointments/{aptId}', region: REGION }, lazy('./src/functions/pushFunctions', 'notifyDoctorOnNewAppointment'));
// ─ إخطار الطبيب بالإيميل لما الأدمن يعتمد حسابه (verificationStatus → 'approved').
//   الـtrigger بيـreturn فوراً لو التغيير مش متعلق بالاعتماد (تكلفة شبه صفر).
exports.notifyDoctorOnApproval = onDocumentWritten(
  { document: 'users/{userId}', region: REGION },
  lazy('./src/functions/notifyDoctorOnApproval', 'notifyDoctorOnApproval')
);
exports.notifyDoctorOnSecretaryEntryRequest = onDocumentWritten({ document: 'secretaryEntryRequests/{secret}', region: REGION }, lazy('./src/functions/pushFunctions', 'notifyDoctorOnSecretaryEntryRequest'));
exports.notifySecretaryOnBookingConfigUpdate = onDocumentWritten({ document: 'bookingConfig/{secret}', region: REGION }, lazy('./src/functions/pushFunctions', 'notifySecretaryOnBookingConfigUpdate'));
// مزامنة "تم رؤية إشعار الحجز" بين كل أجهزة الطبيب — يبعث silent push يحذف
// الإشعار من درج النظام على الأجهزة الأخرى (راجع dismissedAppointmentNotifications.ts).
exports.notifyDevicesToDismissAppointmentNotification = onDocumentCreated(
  { document: 'users/{userId}/dismissedAppointmentNotifications/{appointmentId}', region: REGION },
  lazy('./src/functions/pushFunctions', 'notifyDevicesToDismissAppointmentNotification')
);
exports.retryFailedAudienceBroadcasts = onSchedule({ schedule: 'every 2 hours', timeZone: 'Africa/Cairo', region: REGION }, lazy('./src/functions/pushFunctions', 'retryFailedAudienceBroadcasts'));
exports.onDoctorAdReviewWrite = onDocumentWritten({ document: 'doctorAdReviews/{doctorId}/items/{reviewId}', region: REGION }, lazy('./src/functions/reviewFunctions', 'onDoctorAdReviewWrite'));
// ─────────────────────────────────────────────────────────────────────
// محفّزات حماية طول النص — استبدلت 3 wildcards كانت تشتغل على كل كتابة
// في القاعدة بـ 17 محفّز محدد، يقتصر على الجداول اللي فيها نص طويل من
// المستخدم. توفير ~70% من الاستدعاءات بدون فقدان أمان (الواجهة بالفعل
// بتفرض حد 1000 حرف عبر installUserTextLengthGuard في index.tsx).
//
// ⚠️ لو ضفت في المستقبل جدول جديد فيه نص طويل من المستخدم،
//    لازم تضيف سطر له هنا. لو نسيت → النصوص الطويلة هتعدي بدون قص.
//
// ⚠️ بعد النشر (deploy) Firebase هيسأل عن حذف الدوال القديمة:
//    enforceUserTextLengthTopLevel / SubLevel / NestedLevel
//    وافق على الحذف — مكانها بقى الدوال الـ17 الجديدة.
// ─────────────────────────────────────────────────────────────────────
const enforceTextLengthHandler = lazy('./src/functions/securityFunctions', 'enforceFirestoreTextLengthOnWrite');

// 1) بيانات الطبيب الأساسية (سيرة، عنوان، مؤهلات)
exports.enforceTextLengthOnUserDoc = onDocumentWritten({ document: 'users/{userId}', region: REGION }, enforceTextLengthHandler);
// 2) سجلات المرضى — أطول حقل في التطبيق (تاريخ، ملاحظات الكشف)
exports.enforceTextLengthOnRecord = onDocumentWritten({ document: 'users/{userId}/records/{recordId}', region: REGION }, enforceTextLengthHandler);
// أي سجل يُحذف من أي شاشة أو من الصيانة يطلق تنظيف صور فحوصاته من Storage.
// الصور التي ما زال سجل آخر يشير إليها لا تُحذف حتى لا نكسر سجلًا باقياً.
exports.cleanupPatientImagesOnRecordDelete = onDocumentDeleted(
  { document: 'users/{userId}/records/{recordId}', region: REGION },
  lazy('./src/functions/patientRecordImageCleanupFunctions', 'cleanupPatientImagesOnRecordDelete')
);
// شبكة أمان أخيرة: أي حذف لمستند metadata، حتى لو جاء من مسار صيانة أو نسخة قديمة
// من الواجهة، يحذف ملف Storage الفعلي بالمسار المحفوظ في المستند المحذوف.
exports.cleanupPatientImageObjectOnMetadataDelete = onDocumentDeleted(
  { document: 'users/{userId}/patientImages/{imageId}', region: REGION },
  lazy('./src/functions/patientImageMetadataCleanupFunctions', 'cleanupPatientImageObjectOnMetadataDelete')
);
// 3) المواعيد — قد تحتوي ملاحظات
exports.enforceTextLengthOnAppointment = onDocumentWritten({ document: 'users/{userId}/appointments/{aptId}', region: REGION }, enforceTextLengthHandler);
// 4) الروشتات الجاهزة — نصوص دواء وتعليمات
exports.enforceTextLengthOnReadyPrescription = onDocumentWritten({ document: 'users/{userId}/readyPrescriptions/{presetId}', region: REGION }, enforceTextLengthHandler);
// 5) ملفات المرضى — أسماء وملاحظات
exports.enforceTextLengthOnPatientFile = onDocumentWritten({ document: 'users/{userId}/patientFileData/{fileId}', region: REGION }, enforceTextLengthHandler);
// 6) الفروع — أسماء وعناوين
exports.enforceTextLengthOnBranch = onDocumentWritten({ document: 'users/{userId}/branches/{branchId}', region: REGION }, enforceTextLengthHandler);
// 7) شركات التأمين — أسماء وأوصاف
exports.enforceTextLengthOnInsuranceCompany = onDocumentWritten({ document: 'users/{userId}/insuranceCompanies/{companyId}', region: REGION }, enforceTextLengthHandler);
// 8) أسباب الخصم — أوصاف
exports.enforceTextLengthOnDiscountReason = onDocumentWritten({ document: 'users/{userId}/discountReasons/{reasonId}', region: REGION }, enforceTextLengthHandler);
// 9) الحجوزات العامة — أسماء مرضى وملاحظات
exports.enforceTextLengthOnPublicBooking = onDocumentWritten({ document: 'users/{userId}/publicBookings/{bookingId}', region: REGION }, enforceTextLengthHandler);
// 10) الإشعارات — نصوص رسائل
exports.enforceTextLengthOnNotification = onDocumentWritten({ document: 'users/{userId}/notifications/{notificationId}', region: REGION }, enforceTextLengthHandler);
// 11) إعدادات الحجز — معلومات العيادة وجداول
exports.enforceTextLengthOnBookingConfig = onDocumentWritten({ document: 'bookingConfig/{secret}', region: REGION }, enforceTextLengthHandler);
// 12) شركات التأمين المرآة (السكرتيرة بتقرأها بالـ secret)
exports.enforceTextLengthOnBookingInsurance = onDocumentWritten({ document: 'bookingConfig/{secret}/insuranceCompanies/{companyId}', region: REGION }, enforceTextLengthHandler);
// 13) أسباب الخصم المرآة (السكرتيرة بتقرأها بالـ secret)
exports.enforceTextLengthOnBookingDiscount = onDocumentWritten({ document: 'bookingConfig/{secret}/discountReasons/{reasonId}', region: REGION }, enforceTextLengthHandler);
// 14) إعدادات الحجز العام (الواجهة العامة للمرضى)
exports.enforceTextLengthOnPublicBookingConfig = onDocumentWritten({ document: 'publicBookingConfig/{secret}', region: REGION }, enforceTextLengthHandler);
// 15) إعلانات الأطباء — وصف وعناوين
exports.enforceTextLengthOnDoctorAd = onDocumentWritten({ document: 'doctorAds/{doctorId}', region: REGION }, enforceTextLengthHandler);
// 16) تقييمات المرضى للأطباء — نصوص تعليقات
exports.enforceTextLengthOnDoctorAdReview = onDocumentWritten({ document: 'doctorAdReviews/{doctorId}/items/{reviewId}', region: REGION }, enforceTextLengthHandler);
// 17) طلبات تسجيل أطباء جدد — بيانات السيرة الذاتية
exports.enforceTextLengthOnPendingDoctor = onDocumentWritten({ document: 'pending_doctors/{doctorId}', region: REGION }, enforceTextLengthHandler);

// --- Cleanup Functions ---
exports.runCleanupNow = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/cleanupFunctions', 'runCleanupNow'));
// نجمع أعمال الصيانة اليومية في Scheduler job واحدة لتقليل التكلفة الثابتة.
// المنفذ يشغّل كل خطوة حتى لو فشلت خطوة أخرى، ثم يرفع خطأً مجمعًا للمراقبة.
exports.dailyMaintenance = onSchedule(
  { schedule: '0 03 * * *', timeZone: 'Africa/Cairo', region: REGION, timeoutSeconds: 540 },
  lazy('./src/functions/maintenanceSchedulerFunctions', 'dailyMaintenance')
);
// 🆕 (2026-05) تنظيف سجلات المرضى — شهرياً (يوم 1 من كل شهر الساعة 4:00 الفجر).
// المدد حسب الباقة: مجاني = سنة، Plus = سنتان، برو = 3 سنين، برو ماكس = 5 سنين.
// (سياسة الاحتفاظ Retention Policy — موضّحة للأطباء في دليل الاستخدام).
// تغيرنا من daily لـ monthly عشان نوفر ~95% من قراءات users + iterations
// (الفرونت إند مش محتاج cleanup يومي مع retention طويل بالسنين).
// timeoutSeconds=540 (9 دقايق) لأن المسح بيلف على كل الأطباء.
// أعمال الاحتفاظ بالحسابات والسجلات تعمل شهريًا داخل job واحدة.
exports.monthlyMaintenance = onSchedule(
  { schedule: '0 04 1 * *', timeZone: 'Africa/Cairo', region: REGION, timeoutSeconds: 540 },
  lazy('./src/functions/maintenanceSchedulerFunctions', 'monthlyMaintenance')
);
// المسح الكامل لكل الأطباء مرة واحدة يومياً الساعة 12:00 منتصف الليل (وقت قاهرة).
// كان كل 6 ساعات — تم تقليله لـ24 ساعة لتوفير ~75% من قراءات المسح.
// كل العدّادات (روشتات/طباعات/إيرادات/AI/تقارير) تتحدّث في نفس التوقيت.
// الأدمن يقدر يضغط "تحديث الآن" أي وقت لقراءة فورية بدون انتظار.
exports.refreshAdminDashboardAggregatesNow = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/dashboardAggregationFunctions', 'refreshAdminDashboardAggregatesNow')
);
exports.syncAdminDashboardUserCounter = onDocumentWritten(
  { document: 'users/{userId}', region: REGION },
  lazy('./src/functions/dashboardCounterFunctions', 'syncAdminDashboardUserCounter')
);

// ─────────────────────────────────────────────────────────────────────
// عدّاد إحصائيات الطبيب (المرحلة 1 من خطة التوسع — scale-optimization-plan.md)
// ─────────────────────────────────────────────────────────────────────
// الهدف: إحصائيات صفحة السجلات (كشوفات اليوم/الشهر، مرضى فريدين) محسوبة سلفاً
// في users/{uid}/stats/summary بدل ما الواجهة تعدّها كل فتحة من كل السجلات.
//
// path-scoped (مش wildcard) — آمن من ناحية التكلفة عند الـ1000 طبيب.
// قابل للتقييد على UIDs محددة عبر env STATS_COUNTER_DOCTOR_UID_ALLOWLIST.
exports.syncDoctorStatsSummary = onDocumentWritten(
  { document: 'users/{userId}/records/{recordId}', region: REGION },
  lazy('./src/functions/perDoctorStatsCounter', 'syncDoctorStatsSummary')
);

// إعادة حساب إحصائيات الطبيب من الصفر (callable) — للتأهيل الأولي أو
// تصحيح أي drift في الأرقام. لوحة الأدمن في ScaleToolsPanel بتستدعيها بزرار.
exports.recomputeDoctorStats = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/perDoctorStatsReconcile', 'recomputeDoctorStats')
);

// ─────────────────────────────────────────────────────────────────────
// عدّاد ملخصات المرضى (المرحلة 2 من خطة التوسع)
// ─────────────────────────────────────────────────────────────────────
// الهدف: ملخص لكل مريض في users/{uid}/patientSummaries/{fileNameKey}
// بدل ما الواجهة تجمع آلاف السجلات لتكوين قائمة المرضى.
//
// path-scoped (نفس الـtrigger على records/{recordId} — مسموح وجود triggers
// متعددة على نفس الـpath، Firebase تشغّلهم بشكل مستقل).
exports.syncPatientSummary = onDocumentWritten(
  { document: 'users/{userId}/records/{recordId}', region: REGION },
  lazy('./src/functions/perPatientSummariesCounter', 'syncPatientSummary')
);

// إعادة حساب ملخصات المرضى من الصفر (callable) — للتأهيل الأولي أو تصحيح drift.
exports.recomputePatientSummaries = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/perPatientSummariesReconcile', 'recomputePatientSummaries')
);
// One-time/repair rebuild of the compact branch-scoped directory used by the
// secretary autocomplete. It scans records only when explicitly requested.
exports.recomputeSecretaryPatientDirectory = onCall(
  BASE_CALLABLE_OPTIONS,
  lazy('./src/functions/secretaryPatientDirectoryFunctions', 'recomputeSecretaryPatientDirectory')
);
// مباعدة عن refreshAdminDashboardAggregates بـ5 دقائق لتفادي الكتابة المتزامنة
// على settings/adminDashboardStats. الاثنان الآن مرة واحدة يومياً الساعة 12:05 ص.
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
// One-shot migration للسكرتيرات اللي عندها بيانات في المسار القديم.
// الأدمن يستدعيها مرة من ScaleToolsPanel، النتيجة: تقرير {migrated, errors, ...}.
exports.migrateLegacySecretaryPaths = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/migrateLegacySecretaryPaths', 'migrateLegacySecretaryPaths'));
exports.setPublicAccountDisabled = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/publicAccountFunctions', 'setPublicAccountDisabled'));
exports.deletePublicAccount = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/publicAccountFunctions', 'deletePublicAccount'));
// ⚠️ TEMPORARY: One-time cleanup of legacy plain-text booking password field.
// Delete this line + the file cleanupLegacyBookingPasswordPlain.js after running once.
exports.cleanupLegacyBookingPasswordPlain = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/cleanupLegacyBookingPasswordPlain', 'cleanupLegacyBookingPasswordPlain'));

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
// ✂️ شيلنا exports.consumeTranslationQuota (2026-05) — Firebase هيشيلها من production في الـdeploy التالي
// ─── فحص سعة السجلات على السيرفر — تشديد أمني 2026-04 ───
exports.validateRecordsCapacity = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'validateRecordsCapacity'));
// ─── فحص سعة الروشتات الجاهزة + الأدوية المعدّلة على السيرفر — تشديد أمني 2026-04 ───
exports.validateReadyPrescriptionsCapacity = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'validateReadyPrescriptionsCapacity'));
exports.validateMedicationCustomizationsCapacity = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'validateMedicationCustomizationsCapacity'));
// ─── 🆕 فحص سعة شركات التأمين 2026-04 ───
exports.validateInsuranceCompaniesCapacity = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'validateInsuranceCompaniesCapacity'));
// ─── 🆕 إنشاء فرع على السيرفر 2026-05 (تشديد أمني كامل) ───
//   كان قبل: الواجهة تكتب الفرع مباشرة → طبيب فاهم تقنياً يقدر يتحايل.
//   دلوقتي: الواجهة ممنوعة من create (firestore.rules ترفض) — السيرفر بس
//   يقدر يكتب فرع جديد عبر هذه الدالة (atomic: فحص + إنشاء bookingConfig + كتابة).
exports.createBranch = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/accountControlsFunctions', 'createBranch'));

// Patient image metadata is mutated only on the trusted server. Storage accepts
// an upload after this server creates an exact, capacity-checked reservation.
exports.reservePatientImageUpload = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/patientImageFunctions', 'reservePatientImageUpload'));
exports.finalizePatientImageUpload = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/patientImageFunctions', 'finalizePatientImageUpload'));
exports.deletePatientImage = onCall(ACCOUNT_CONTROLS_CALLABLE_OPTIONS, lazy('./src/functions/patientImageFunctions', 'deletePatientImage'));

// --- Subscription Functions ---
exports.runExpiredSubscriptionsCheckNow = onCall(BASE_CALLABLE_OPTIONS, lazy('./src/functions/subscriptionFunctions', 'runExpiredSubscriptionsCheckNow'));

// --- Guidelines Search Functions ---
exports.searchGuidelineIndex = onCall({
  ...GUIDELINES_SEARCH_CALLABLE_OPTIONS,
  secrets: [GEMINI_API_KEY],
}, lazy('./src/functions/guidelinesSearchFunction', 'searchGuidelineIndex'));
exports.listGuidelineBooks = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/guidelinesSearchFunction', 'listGuidelineBooks'));
exports.getGuidelineBookText = onCall(SECRETARY_CALLABLE_OPTIONS, lazy('./src/functions/guidelinesSearchFunction', 'getGuidelineBookText'));

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
