module.exports = (context) => {
  const {
    HttpsError,
    getDb,
    assertAdminRequest,
  } = context;

  const VALID_AUDIENCES = new Set([
    'public',
    'doctors',
    'secretaries',
    'doctor_secretaries',
    'all',
  ]);

  const sendAppUpdateBroadcast = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const targetAudience = String(request?.data?.targetAudience || '').trim().toLowerCase();

    if (!VALID_AUDIENCES.has(targetAudience)) {
      throw new HttpsError('invalid-argument', 'INVALID_TARGET_AUDIENCE');
    }

    const db = getDb();
    const now = new Date();
    const nowIso = now.toISOString();
    const nowMs = now.getTime();
    const resultText = 'تم تنفيذ إعادة تحميل فورية للفئة المستهدفة: المتصل الآن يتم تحديثه فورًا، وغير المتصل عند أول فتح.';

    const rolloutRef = db.collection('appUpdateRollouts').doc();
    const rolloutId = rolloutRef.id;

    await rolloutRef.set({
      id: rolloutId,
      type: 'silent_app_update_rollout',
      status: 'sent',
      targetAudience,
      createdAt: nowIso,
      createdAtMs: nowMs,
      sentAt: nowIso,
      sentAtMs: nowMs,
      createdBy: adminEmail,
      executionMode: 'silent_reload',
      resultText,
      reloadBehavior: {
        onlineClients: 'immediate',
        offlineClients: 'on_next_open',
      },
      channels: {
        pushExternal: false,
        inApp: false,
        silentForceUpdate: true,
      },
    }, { merge: true });

    return {
      ok: true,
      broadcastId: rolloutId,
      targetAudience,
      tokenCount: 0,
      successCount: 0,
      failureCount: 0,
      failedBatchesCount: 0,
      resultText,
    };
  };

  return sendAppUpdateBroadcast;
};
