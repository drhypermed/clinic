const { loadUnifiedDoctorProfile } = require('../profileStore');
const { deletePatientImageById } = require('../patientImageStore');

const MAX_PATIENT_IMAGES = 50;
const MAX_PATIENT_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_SOURCES = new Set(['patient_file', 'investigations']);

const cleanText = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const positiveInteger = (value, max) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > max) return 0;
  return parsed;
};

const requireAuthenticatedDoctor = async ({
  request,
  db,
  resolveDoctorAccountType,
  HttpsError,
  requireProMax = true,
}) => {
  const userId = request?.auth?.uid;
  if (!userId) throw new HttpsError('unauthenticated', 'Authentication required');

  const doctorProfile = await loadUnifiedDoctorProfile({ db, userId });
  if (!doctorProfile.exists) throw new HttpsError('not-found', 'Doctor account not found');

  const accountType = resolveDoctorAccountType(doctorProfile.mergedData);
  if (requireProMax && accountType !== 'pro_max') {
    throw new HttpsError('permission-denied', 'PATIENT_IMAGES_REQUIRE_PRO_MAX', { accountType });
  }
  return userId;
};

module.exports = (context) => {
  const {
    HttpsError,
    admin,
    getDb,
    resolveDoctorAccountType,
  } = context;

  const reservePatientImageUpload = async (request) => {
    const db = getDb();
    const userId = await requireAuthenticatedDoctor({ request, db, resolveDoctorAccountType, HttpsError });
    const data = request?.data || {};

    const patientFileId = cleanText(data.patientFileId, 400);
    const patientFileNameKey = cleanText(data.patientFileNameKey, 500);
    const originalName = cleanText(data.originalName, 180) || 'patient-image';
    const contentType = cleanText(data.contentType, 40).toLowerCase();
    const source = ALLOWED_SOURCES.has(data.source) ? data.source : 'patient_file';
    const patientFileNumber = positiveInteger(data.patientFileNumber, 1000000000);
    const width = positiveInteger(data.width, 100000);
    const height = positiveInteger(data.height, 100000);
    const originalSizeBytes = positiveInteger(data.originalSizeBytes, 1024 * 1024 * 1024);
    const compressedSizeBytes = positiveInteger(data.compressedSizeBytes, MAX_PATIENT_IMAGE_BYTES - 1);

    if (!patientFileId || patientFileId.includes('/') || !patientFileNameKey || !patientFileNumber
      || !width || !height || !originalSizeBytes || !compressedSizeBytes
      || !ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new HttpsError('invalid-argument', 'Invalid patient image metadata');
    }

    const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const userRef = db.collection('users').doc(userId);
    const fileRef = userRef.collection('settings').doc(patientFileId);
    const imageRef = userRef.collection('patientImages').doc();
    const uploadedAtMs = Date.now();
    const storagePath = `patient-images/${userId}/${patientFileId}/${imageRef.id}.${extension}`;

    const metadata = {
      id: imageRef.id,
      patientFileId,
      patientFileNameKey,
      originalName,
      storagePath,
      contentType,
      width,
      height,
      originalSizeBytes,
      compressedSizeBytes,
      uploadedAtMs,
      status: 'uploading',
      source,
    };

    await db.runTransaction(async (transaction) => {
      const fileSnap = await transaction.get(fileRef);
      const currentCount = Math.max(0, Number(fileSnap.data()?.patientImageCount || 0));
      if (currentCount >= MAX_PATIENT_IMAGES) {
        throw new HttpsError('resource-exhausted', 'PATIENT_IMAGES_LIMIT_REACHED', {
          limit: MAX_PATIENT_IMAGES,
          used: currentCount,
        });
      }

      transaction.set(fileRef, {
        patientFileNumber,
        patientFileNameKey,
        patientImageCount: currentCount + 1,
        patientImagesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.create(imageRef, {
        ...metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { image: metadata };
  };

  const finalizePatientImageUpload = async (request) => {
    const db = getDb();
    const userId = await requireAuthenticatedDoctor({ request, db, resolveDoctorAccountType, HttpsError });
    const imageId = cleanText(request?.data?.imageId, 200);
    if (!imageId || imageId.includes('/')) throw new HttpsError('invalid-argument', 'Invalid image id');

    const imageRef = db.collection('users').doc(userId).collection('patientImages').doc(imageId);
    await db.runTransaction(async (transaction) => {
      const imageSnap = await transaction.get(imageRef);
      if (!imageSnap.exists) throw new HttpsError('not-found', 'Patient image reservation not found');
      if (imageSnap.data()?.status === 'ready') return;
      if (imageSnap.data()?.status !== 'uploading') {
        throw new HttpsError('failed-precondition', 'Patient image reservation is not uploadable');
      }
      transaction.update(imageRef, {
        status: 'ready',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return { ok: true };
  };

  const deletePatientImage = async (request) => {
    const db = getDb();
    // الحذف يظل متاحًا حتى لو تغيّرت باقة الطبيب، كي يقدر دائمًا يمسح بياناته
    // وملفات التخزين نهائيًا. قيد Pro Max يخص إضافة صور جديدة فقط.
    const userId = await requireAuthenticatedDoctor({
      request,
      db,
      resolveDoctorAccountType,
      HttpsError,
      requireProMax: false,
    });
    const imageId = cleanText(request?.data?.imageId, 200);
    if (!imageId || imageId.includes('/')) throw new HttpsError('invalid-argument', 'Invalid image id');

    try {
      const result = await deletePatientImageById({ admin, db, userId, imageId });
      console.log('[deletePatientImage] Permanent deletion complete', {
        userId,
        imageId,
        deleted: result.deleted,
        reason: result.reason,
        cleanedRecordReferences: result.cleanedRecordReferences,
      });
      return { ok: true, ...result };
    } catch (error) {
      console.error('[deletePatientImage] Permanent deletion failed', { userId, imageId, error });
      if (error?.code === 'invalid-storage-path') {
        throw new HttpsError('failed-precondition', 'Invalid patient image storage path');
      }
      throw new HttpsError('internal', 'Unable to delete patient image permanently');
    }
  };

  return {
    reservePatientImageUpload,
    finalizePatientImageUpload,
    deletePatientImage,
  };
};

module.exports.MAX_PATIENT_IMAGES = MAX_PATIENT_IMAGES;
