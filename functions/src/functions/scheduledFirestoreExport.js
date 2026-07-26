/**
 * نسخ Firestore الاحتياطية الموفّرة للتكلفة:
 * - نسخة يومية للبيانات السريرية والحسابات، مع احتفاظ 14 يوماً.
 * - نسخة كاملة أسبوعية، مع احتفاظ 56 يوماً.
 *
 * المتطلبات لتشغيله:
 *   1. تفعيل Datastore API في Google Cloud Console
 *   2. منح App Engine default service account دور "Cloud Datastore Import Export Admin"
 *      (أو استخدام service account مخصص عبر env var BACKUP_SERVICE_ACCOUNT)
 *   3. Cloud Storage bucket — إما bucket المشروع الافتراضي (تلقائي) أو
 *      مخصص عبر env var FIRESTORE_BACKUP_BUCKET
 *
 * ملاحظة: Firestore Export API هي REST API، نستخدمها عبر
 * google-auth-library + fetch (مرفقة ضمن firebase-admin).
 */

const CLINICAL_BACKUP_RETENTION_DAYS = 14;
const FULL_BACKUP_RETENTION_DAYS = 56;
const CLINICAL_BACKUP_FOLDER_PREFIX = 'firestore-backups/clinical-daily';
const FULL_BACKUP_FOLDER_PREFIX = 'firestore-backups/full-weekly';

// Firestore's managed export filters by collection-group ID. This list keeps
// clinical, financial, account, and booking data protected every day while
// excluding bulky reproducible guideline/search collections.
const CLINICAL_COLLECTION_IDS = Object.freeze([
  'users',
  'settings',
  'appointments',
  'publicBookings',
  'records',
  'branches',
  'readyPrescriptions',
  'notifications',
  'usageDaily',
  'usageMonthly',
  'monthlyPrices',
  'financialData',
  'entries',
  'insuranceCompanies',
  'discountReasons',
  'patientFileData',
  'patientSummaries',
  'secretaryPatientDirectories',
  'patients',
  'bookingConfig',
  'secretaryAuth',
  'secretaryLoginIndex',
  'secretaryUsernameIndex',
  'secretaryEntryRequests',
  'secretaryApprovedEntryIds',
  'secretaryFcmTokens',
  'secretaryEntryAlertResponse',
  'secretaryProfiles',
  'publicBookingConfig',
  'slots',
  'publicBookingLookup',
  'publicBookingClaims',
  'pending_doctors',
  'subscriptionPrices',
  'expenses',
]);

/**
 * يُنشئ export job على Firestore.
 * مرجع: https://cloud.google.com/firestore/docs/manage-data/export-import#start_a_managed_export_operation
 */
const buildExportRequestBody = ({ bucketName, exportPath, collectionIds }) => ({
  outputUriPrefix: `gs://${bucketName}/${exportPath}`,
  ...(Array.isArray(collectionIds) && collectionIds.length > 0 ? { collectionIds } : {}),
});

const triggerFirestoreExport = async ({ admin, bucketName, exportPath, collectionIds }) => {
  const projectId = admin.app().options.projectId || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;
  if (!projectId) throw new Error('Project ID not available for export');

  const accessToken = await admin.credential.applicationDefault().getAccessToken();
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildExportRequestBody({ bucketName, exportPath, collectionIds })),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Export API failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return { operationName: result?.name || '' };
};

/**
 * يحذف النسخ الأقدم من مدة الاحتفاظ المحددة من الـ bucket.
 * يبحث بالـ prefix ويفلتر حسب التاريخ الموجود في اسم المجلد.
 */
const cleanupOldBackups = async ({ admin, bucketName, folderPrefix, retentionDays }) => {
  const bucket = admin.storage().bucket(bucketName);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const [files] = await bucket.getFiles({ prefix: `${folderPrefix}/` });
  let deletedCount = 0;

  for (const file of files) {
    // الجزء النسبي: 2026-03-15/output-0 (مثلاً)
    const relativeName = file.name.slice(`${folderPrefix}/`.length);
    const match = relativeName.match(/^(\d{4})-(\d{2})-(\d{2})\//);
    if (!match) continue;
    const [, year, month, day] = match;
    const fileDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (fileDate < cutoffDate) {
      try {
        await file.delete();
        deletedCount += 1;
      } catch (err) {
        console.warn('[scheduledFirestoreExport] cleanup failed for', file.name, err?.message || err);
      }
    }
  }

  return deletedCount;
};

module.exports = (context) => {
  const { admin } = context;

  const runScheduledExport = async ({ folderPrefix, retentionDays, collectionIds, backupType }) => {
    // Bucket افتراضياً: firestorage bucket الخاص بالمشروع.
    const defaultBucket = admin.app().options.storageBucket ||
      `${admin.app().options.projectId}.firebasestorage.app`;
    const bucketName = process.env.FIRESTORE_BACKUP_BUCKET || defaultBucket;

    const nowIso = new Date().toISOString();
    const datePart = nowIso.slice(0, 10); // YYYY-MM-DD
    const exportPath = `${folderPrefix}/${datePart}`;

    let exportResult = null;
    let exportError = null;
    try {
      exportResult = await triggerFirestoreExport({ admin, bucketName, exportPath, collectionIds });
      console.log('[scheduledFirestoreExport] export started', {
        backupType, bucketName, exportPath, operationName: exportResult.operationName,
      });
    } catch (err) {
      exportError = err?.message || String(err);
      console.error('[scheduledFirestoreExport] export failed:', exportError);
    }

    // نظّف النسخ القديمة حتى لو فشل الـ export الحالي
    let cleanedCount = 0;
    try {
      cleanedCount = await cleanupOldBackups({ admin, bucketName, folderPrefix, retentionDays });
      console.log('[scheduledFirestoreExport] cleaned', cleanedCount, 'old backup files');
    } catch (cleanupErr) {
      console.warn('[scheduledFirestoreExport] cleanup error:', cleanupErr?.message || cleanupErr);
    }

    return {
      ok: !exportError,
      backupType,
      bucketName,
      exportPath,
      operationName: exportResult?.operationName || '',
      cleanedCount,
      error: exportError,
      timestamp: nowIso,
    };
  };

  const scheduledClinicalFirestoreExport = () => runScheduledExport({
    folderPrefix: CLINICAL_BACKUP_FOLDER_PREFIX,
    retentionDays: CLINICAL_BACKUP_RETENTION_DAYS,
    collectionIds: CLINICAL_COLLECTION_IDS,
    backupType: 'clinical-daily',
  });

  const scheduledFullFirestoreExport = () => runScheduledExport({
    folderPrefix: FULL_BACKUP_FOLDER_PREFIX,
    retentionDays: FULL_BACKUP_RETENTION_DAYS,
    collectionIds: null,
    backupType: 'full-weekly',
  });

  return { scheduledClinicalFirestoreExport, scheduledFullFirestoreExport };
};

module.exports.CLINICAL_COLLECTION_IDS = CLINICAL_COLLECTION_IDS;
module.exports.buildExportRequestBody = buildExportRequestBody;
