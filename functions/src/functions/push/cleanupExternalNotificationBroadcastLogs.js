const LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
// احتفظ بـ rollouts التحديث لـ 90 يوماً (تاريخ deploy مفيد أطول من بثوث الإشعارات).
const ROLLOUT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const DELETE_BATCH_SIZE = 500;

module.exports = (context) => {
  const { getDb } = context;

  const cleanupCollection = async ({
    collectionName,
    nowMs,
    fallbackCutoffMs,
  }) => {
    const db = getDb();
    let deletedCount = 0;

    while (true) {
      const querySnapshot = await db
        .collection(collectionName)
        .where('expiresAtMs', '<=', nowMs)
        .orderBy('expiresAtMs', 'asc')
        .limit(DELETE_BATCH_SIZE)
        .get();

      if (querySnapshot.empty) {
        // Backward compatibility for old docs missing expiresAtMs.
        const fallbackSnapshot = await db
          .collection(collectionName)
          .where('createdAtMs', '<=', fallbackCutoffMs)
          .orderBy('createdAtMs', 'asc')
          .limit(DELETE_BATCH_SIZE)
          .get();

        if (fallbackSnapshot.empty) break;

        const fallbackBatch = db.batch();
        fallbackSnapshot.docs.forEach((docSnap) => fallbackBatch.delete(docSnap.ref));
        await fallbackBatch.commit();
        deletedCount += fallbackSnapshot.size;
        if (fallbackSnapshot.size < DELETE_BATCH_SIZE) break;
        continue;
      }

      const batch = db.batch();
      querySnapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
      deletedCount += querySnapshot.size;

      if (querySnapshot.size < DELETE_BATCH_SIZE) break;
    }

    return deletedCount;
  };

  /**
   * تنظيف بسيط عبر createdAtMs (بدون fallback) — للمجموعات التي لا تحتوي
   * على expiresAtMs مثل appUpdateRollouts.
   */
  const cleanupByCreatedAt = async ({ collectionName, cutoffMs }) => {
    const db = getDb();
    let deletedCount = 0;

    while (true) {
      const snapshot = await db
        .collection(collectionName)
        .where('createdAtMs', '<=', cutoffMs)
        .orderBy('createdAtMs', 'asc')
        .limit(DELETE_BATCH_SIZE)
        .get();

      if (snapshot.empty) break;

      const batch = db.batch();
      snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
      deletedCount += snapshot.size;

      if (snapshot.size < DELETE_BATCH_SIZE) break;
    }

    return deletedCount;
  };

  const cleanupExternalNotificationBroadcastLogs = async () => {
    const nowMs = Date.now();
    const fallbackCutoffMs = nowMs - LOG_RETENTION_MS;
    const rolloutCutoffMs = nowMs - ROLLOUT_RETENTION_MS;

    const [externalDeletedCount, inAppDeletedCount, rolloutDeletedCount] = await Promise.all([
      cleanupCollection({
        collectionName: 'externalNotificationBroadcasts',
        nowMs,
        fallbackCutoffMs,
      }),
      cleanupCollection({
        collectionName: 'inAppNotificationBroadcasts',
        nowMs,
        fallbackCutoffMs,
      }),
      // U4: تنظيف تلقائي لسجل تحديثات التطبيق (90 يوم).
      cleanupByCreatedAt({
        collectionName: 'appUpdateRollouts',
        cutoffMs: rolloutCutoffMs,
      }),
    ]);

    const deletedCount = externalDeletedCount + inAppDeletedCount + rolloutDeletedCount;

    console.log('[cleanupExternalNotificationBroadcastLogs] done', {
      externalDeletedCount,
      inAppDeletedCount,
      rolloutDeletedCount,
      deletedCount,
      fallbackCutoffMs,
      rolloutCutoffMs,
    });

    return {
      ok: true,
      externalDeletedCount,
      inAppDeletedCount,
      rolloutDeletedCount,
      deletedCount,
      fallbackCutoffMs,
      rolloutCutoffMs,
    };
  };

  return cleanupExternalNotificationBroadcastLogs;
};
