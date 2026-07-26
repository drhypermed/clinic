const { deletePatientImageById } = require('../patientImageStore');

const normalizeImageIds = (value) => (
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item && !item.includes('/'))
    : []
);

const extractRecordImageIds = (recordData) => Array.from(new Set([
  ...normalizeImageIds(recordData?.investigationImageIds),
  ...normalizeImageIds(recordData?.consultation?.investigationImageIds),
]));

module.exports = (context) => {
  const { admin, getDb } = context;
  const deleteImageById = context.deletePatientImageById || deletePatientImageById;

  const cleanupPatientImagesOnRecordDelete = async (event) => {
    const userId = String(event?.params?.userId || '').trim();
    const recordId = String(event?.params?.recordId || '').trim();
    const recordData = event?.data?.data?.() || {};
    const imageIds = extractRecordImageIds(recordData);
    if (!userId || imageIds.length === 0) return { deleted: 0, skipped: 0 };

    const db = getDb();
    let deleted = 0;
    let skipped = 0;
    const failures = [];

    // التنفيذ المتتابع يقلل ضغط Storage/Firestore، والحد الأقصى أصلًا 50 صورة للمريض.
    for (const imageId of imageIds) {
      try {
        const result = await deleteImageById({
          admin,
          db,
          userId,
          imageId,
          onlyIfUnreferenced: true,
          requireInvestigationSource: true,
        });
        if (result.deleted) deleted += 1;
        else skipped += 1;
      } catch (error) {
        failures.push({ imageId, message: String(error?.message || error) });
      }
    }

    if (failures.length > 0) {
      console.error('[cleanupPatientImagesOnRecordDelete] Some image objects could not be deleted', {
        userId,
        recordId,
        failures,
      });
      throw new Error(`Failed to delete ${failures.length} patient image object(s)`);
    }

    console.log('[cleanupPatientImagesOnRecordDelete] Record image cleanup complete', {
      userId,
      recordId,
      candidates: imageIds.length,
      deleted,
      skipped,
    });
    return { deleted, skipped };
  };

  return { cleanupPatientImagesOnRecordDelete };
};

module.exports.extractRecordImageIds = extractRecordImageIds;
