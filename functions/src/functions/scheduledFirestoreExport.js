/**
 * scheduledFirestoreExport — نسخ احتياطي تلقائي يومي لـ Firestore.
 *
 * يصدّر كل Firestore إلى مجلد `gs://{bucket}/firestore-backups/YYYY-MM-DD/` يومياً.
 * وينظف تلقائياً النسخ الأقدم من 30 يوماً لتوفير تكلفة Storage.
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

const BACKUP_RETENTION_DAYS = 30;
const BACKUP_FOLDER_PREFIX = 'firestore-backups';

/**
 * يُنشئ export job على Firestore.
 * مرجع: https://cloud.google.com/firestore/docs/manage-data/export-import#start_a_managed_export_operation
 */
const triggerFirestoreExport = async ({ admin, bucketName, exportPath }) => {
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
    body: JSON.stringify({
      outputUriPrefix: `gs://${bucketName}/${exportPath}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Export API failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return { operationName: result?.name || '' };
};

/**
 * يحذف النسخ الأقدم من BACKUP_RETENTION_DAYS من الـ bucket.
 * يبحث بالـ prefix ويفلتر حسب التاريخ الموجود في اسم المجلد.
 */
const cleanupOldBackups = async ({ admin, bucketName }) => {
  const bucket = admin.storage().bucket(bucketName);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - BACKUP_RETENTION_DAYS);

  const [files] = await bucket.getFiles({ prefix: `${BACKUP_FOLDER_PREFIX}/` });
  let deletedCount = 0;

  for (const file of files) {
    // اسم الملف: firestore-backups/2026-03-15/output-0 (مثلاً)
    const match = file.name.match(/^firestore-backups\/(\d{4})-(\d{2})-(\d{2})\//);
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

  const scheduledFirestoreExport = async () => {
    // Bucket افتراضياً: firestorage bucket الخاص بالمشروع.
    const defaultBucket = admin.app().options.storageBucket ||
      `${admin.app().options.projectId}.firebasestorage.app`;
    const bucketName = process.env.FIRESTORE_BACKUP_BUCKET || defaultBucket;

    const nowIso = new Date().toISOString();
    const datePart = nowIso.slice(0, 10); // YYYY-MM-DD
    const exportPath = `${BACKUP_FOLDER_PREFIX}/${datePart}`;

    let exportResult = null;
    let exportError = null;
    try {
      exportResult = await triggerFirestoreExport({ admin, bucketName, exportPath });
      console.log('[scheduledFirestoreExport] export started', {
        bucketName, exportPath, operationName: exportResult.operationName,
      });
    } catch (err) {
      exportError = err?.message || String(err);
      console.error('[scheduledFirestoreExport] export failed:', exportError);
    }

    // نظّف النسخ القديمة حتى لو فشل الـ export الحالي
    let cleanedCount = 0;
    try {
      cleanedCount = await cleanupOldBackups({ admin, bucketName });
      console.log('[scheduledFirestoreExport] cleaned', cleanedCount, 'old backup files');
    } catch (cleanupErr) {
      console.warn('[scheduledFirestoreExport] cleanup error:', cleanupErr?.message || cleanupErr);
    }

    return {
      ok: !exportError,
      bucketName,
      exportPath,
      operationName: exportResult?.operationName || '',
      cleanedCount,
      error: exportError,
      timestamp: nowIso,
    };
  };

  return { scheduledFirestoreExport };
};
