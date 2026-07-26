const cleanText = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const findPatientImageRecordReferences = async ({ userRef, imageId }) => {
  const recordsRef = userRef.collection('records');
  const [directSnapshot, consultationSnapshot] = await Promise.all([
    recordsRef.where('investigationImageIds', 'array-contains', imageId).get(),
    recordsRef.where('consultation.investigationImageIds', 'array-contains', imageId).get(),
  ]);

  const references = new Map();
  directSnapshot.docs.forEach((recordSnapshot) => {
    references.set(recordSnapshot.ref.path, {
      ref: recordSnapshot.ref,
      direct: true,
      consultation: false,
    });
  });
  consultationSnapshot.docs.forEach((recordSnapshot) => {
    const current = references.get(recordSnapshot.ref.path);
    references.set(recordSnapshot.ref.path, {
      ref: recordSnapshot.ref,
      direct: Boolean(current?.direct),
      consultation: true,
    });
  });
  return references;
};

/**
 * المصدر الوحيد لحذف صورة مريض: يمسح Storage أولًا، ثم metadata والعداد،
 * ثم ينظف مراجع السجلات. الدالة idempotent وآمنة لإعادة المحاولة.
 */
const deletePatientImageById = async ({
  admin,
  db,
  userId,
  imageId,
  onlyIfUnreferenced = false,
  requireInvestigationSource = false,
}) => {
  const userRef = db.collection('users').doc(userId);
  const imageRef = userRef.collection('patientImages').doc(imageId);
  const imageSnapshot = await imageRef.get();
  if (!imageSnapshot.exists) return { deleted: false, reason: 'not-found', cleanedRecordReferences: 0 };

  const imageData = imageSnapshot.data() || {};
  if (requireInvestigationSource && imageData.source === 'patient_file') {
    return { deleted: false, reason: 'patient-file-image', cleanedRecordReferences: 0 };
  }

  const recordReferences = await findPatientImageRecordReferences({ userRef, imageId });
  if (onlyIfUnreferenced && recordReferences.size > 0) {
    return { deleted: false, reason: 'still-referenced', cleanedRecordReferences: 0 };
  }

  const storagePath = cleanText(imageData.storagePath, 1200);
  const expectedPrefix = `patient-images/${userId}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    const error = new Error('Invalid patient image storage path');
    error.code = 'invalid-storage-path';
    throw error;
  }

  // لا نحذف metadata إذا فشل حذف الـobject؛ إبقاؤها يسمح بإعادة المحاولة ولا يخلق ملفًا يتيمًا.
  await admin.storage().bucket().file(storagePath).delete({ ignoreNotFound: true });

  let deletedMetadata = false;
  await db.runTransaction(async (transaction) => {
    const latestImageSnapshot = await transaction.get(imageRef);
    if (!latestImageSnapshot.exists) return;

    const patientFileId = cleanText(latestImageSnapshot.data()?.patientFileId, 400);
    const fileRef = userRef.collection('settings').doc(patientFileId);
    const fileSnapshot = patientFileId ? await transaction.get(fileRef) : null;

    transaction.delete(imageRef);
    deletedMetadata = true;
    if (fileSnapshot?.exists) {
      const currentCount = Math.max(0, Number(fileSnapshot.data()?.patientImageCount || 0));
      const nextCount = Math.max(0, currentCount - 1);
      transaction.set(fileRef, {
        patientImageCount: nextCount || admin.firestore.FieldValue.delete(),
        patientImagesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  });

  const cleanupResults = onlyIfUnreferenced
    ? []
    : await Promise.allSettled(Array.from(recordReferences.values()).map((entry) => {
        const update = {};
        if (entry.direct) {
          update.investigationImageIds = admin.firestore.FieldValue.arrayRemove(imageId);
        }
        if (entry.consultation) {
          update['consultation.investigationImageIds'] = admin.firestore.FieldValue.arrayRemove(imageId);
        }
        return entry.ref.update(update);
      }));

  cleanupResults.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('[deletePatientImageById] Record reference cleanup failed', {
        userId,
        imageId,
        error: result.reason,
      });
    }
  });

  return {
    deleted: deletedMetadata,
    reason: deletedMetadata ? 'deleted' : 'already-deleted',
    cleanedRecordReferences: cleanupResults.filter((result) => result.status === 'fulfilled').length,
  };
};

module.exports = {
  deletePatientImageById,
  findPatientImageRecordReferences,
};
