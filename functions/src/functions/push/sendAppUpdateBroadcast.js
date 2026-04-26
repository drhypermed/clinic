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

  // عدد السجلات اللي بنحتفظ بيهم في السحابة. أي سجل خارج آخر ٥ بيتمسح
  // تلقائياً بعد كل أمر جديد. هذا يقلل تكلفة التخزين والقراءة على المستخدمين.
  const MAX_ROLLOUTS_KEPT = 5;

  /**
   * ينظف السجلات القديمة بحيث يبقى آخر MAX_ROLLOUTS_KEPT فقط.
   * يحصل بعد كتابة الأمر الجديد. آمن: لو الحذف فشل لأي سبب، الأمر الجديد
   * نفسه اتسجل بنجاح والمستخدمين يطبقوه عادي.
   */
  const trimOldRollouts = async (db) => {
    try {
      const snap = await db
        .collection('appUpdateRollouts')
        .orderBy('createdAtMs', 'desc')
        .offset(MAX_ROLLOUTS_KEPT)
        .limit(50)
        .get();

      if (snap.empty) return 0;

      // batch واحد يكفي لـ ٥٠ سجل (حد Firestore ٥٠٠ عملية في الـ batch).
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      return snap.size;
    } catch (err) {
      console.warn('[sendAppUpdateBroadcast] trimOldRollouts failed:', err?.message || err);
      return 0;
    }
  };

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

    // تنظيف السجلات الأقدم من آخر ٥ — يحصل بعد الكتابة عشان مايأثرش على المستخدم
    // لو فشل. الفشل غير مرئي ويعاد المحاولة في الأمر الجاي.
    const trimmedCount = await trimOldRollouts(db);

    return {
      ok: true,
      broadcastId: rolloutId,
      targetAudience,
      tokenCount: 0,
      successCount: 0,
      failureCount: 0,
      failedBatchesCount: 0,
      trimmedCount,
      resultText,
    };
  };

  return sendAppUpdateBroadcast;
};
