const cleanText = (value, maxLength) => (
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
);

const getDeletedImageStoragePath = ({ userId, imageData }) => {
  const storagePath = cleanText(imageData?.storagePath, 1200);
  return storagePath.startsWith(`patient-images/${userId}/`) ? storagePath : '';
};

module.exports = (context) => {
  const { admin } = context;

  const cleanupPatientImageObjectOnMetadataDelete = async (event) => {
    const userId = cleanText(event?.params?.userId, 200);
    const imageId = cleanText(event?.params?.imageId, 200);
    const imageData = event?.data?.data?.() || {};
    const storagePath = getDeletedImageStoragePath({ userId, imageData });

    if (!userId || !imageId || imageId.includes('/') || !storagePath) {
      console.error('[cleanupPatientImageObjectOnMetadataDelete] Unsafe deleted metadata', {
        userId,
        imageId,
      });
      return { deleted: false, reason: 'invalid-metadata' };
    }

    // الحذف الأساسي يمسح الـobject أولًا. ignoreNotFound يجعل هذا المحفّز
    // شبكة أمان idempotent لأي مسار حذف metadata مباشرة أو لأي تنفيذ مكرر.
    await admin.storage().bucket().file(storagePath).delete({ ignoreNotFound: true });
    console.log('[cleanupPatientImageObjectOnMetadataDelete] Storage object removed', {
      userId,
      imageId,
      storagePath,
    });
    return { deleted: true };
  };

  return { cleanupPatientImageObjectOnMetadataDelete };
};

module.exports.getDeletedImageStoragePath = getDeletedImageStoragePath;

