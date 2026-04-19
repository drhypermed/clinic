/**
 * retryFailedAudienceBroadcasts — إعادة محاولة واحدة لـ tokens فشلت عبوراً.
 *
 * كيف تعمل:
 *   1. كل 5 دقائق: تبحث عن broadcasts فيها `retryAttempted == false` و `retryScheduledAtMs <= now`.
 *   2. تشترط أن البثّ حديث (آخر ساعتين) — تفادي إعادة محاولات قديمة جداً.
 *   3. ترسل الـ tokens مرة واحدة فقط، تحدّث stats البثّ، وتضع `retryAttempted = true`.
 *
 * ملاحظة: تعالج أقصى 5 broadcasts لكل تشغيل حتى لا تتجاوز حد مدة الدالة (540s).
 */

const MULTICAST_BATCH_SIZE = 450;
const MAX_BROADCASTS_PER_RUN = 5;
const MAX_BROADCAST_AGE_MS = 2 * 60 * 60 * 1000; // ساعتان

const chunkArray = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

module.exports = (context) => {
  const {
    admin,
    getDb,
    logMulticastResult,
    getInvalidFcmTokensFromResponse,
    removeTokenFromCollection,
    clearTokenRoleTopics,
    toAbsoluteWebUrl,
    stringifyNotificationData,
    HIGH_URGENCY_HEADERS,
  } = context;

  const cleanupInvalidTokens = async (invalidTokens) => {
    if (!Array.isArray(invalidTokens) || invalidTokens.length === 0) return;
    const uniqueTokens = Array.from(new Set(invalidTokens)).filter(Boolean);
    await Promise.all(
      uniqueTokens.map(async (token) => {
        try {
          await removeTokenFromCollection('fcmTokens', token);
        } catch {
          // ignore
        }
        try {
          await removeTokenFromCollection('secretaryFcmTokens', token);
        } catch {
          // ignore
        }
        try {
          await clearTokenRoleTopics(token);
        } catch {
          // ignore
        }
      }),
    );
  };

  const retryFailedAudienceBroadcasts = async () => {
    const db = getDb();
    const nowMs = Date.now();
    const oldestAllowedMs = nowMs - MAX_BROADCAST_AGE_MS;

    const snap = await db
      .collection('externalNotificationBroadcasts')
      .where('retryAttempted', '==', false)
      .where('retryScheduledAtMs', '>', 0)
      .where('retryScheduledAtMs', '<=', nowMs)
      .orderBy('retryScheduledAtMs', 'asc')
      .limit(MAX_BROADCASTS_PER_RUN)
      .get()
      .catch((err) => {
        console.warn('[retryFailedAudienceBroadcasts] Query failed:', err?.message || err);
        return null;
      });

    if (!snap || snap.empty) {
      return { processed: 0 };
    }

    let processed = 0;
    let totalRecovered = 0;

    for (const broadcastDoc of snap.docs) {
      const data = broadcastDoc.data() || {};
      const createdAtMs = Number(data.createdAtMs || 0);
      if (createdAtMs > 0 && createdAtMs < oldestAllowedMs) {
        // قديم جداً — نضع retryAttempted=true حتى لا يتكرر الاختيار
        await broadcastDoc.ref
          .set({ retryAttempted: true, retryCompletedAtMs: nowMs, retrySkippedReason: 'too_old' }, { merge: true })
          .catch(() => {});
        continue;
      }

      const retryableTokens = Array.isArray(data.retryableTokens) ? data.retryableTokens : [];
      const uniqueTokens = Array.from(
        new Set(retryableTokens.filter((t) => typeof t === 'string' && t.trim().length > 0)),
      );

      if (uniqueTokens.length === 0) {
        await broadcastDoc.ref
          .set({ retryAttempted: true, retryCompletedAtMs: nowMs }, { merge: true })
          .catch(() => {});
        continue;
      }

      const title = String(data.title || '').trim();
      const body = String(data.body || '').trim();
      if (!title || !body) {
        await broadcastDoc.ref
          .set({ retryAttempted: true, retryCompletedAtMs: nowMs, retrySkippedReason: 'missing_content' }, { merge: true })
          .catch(() => {});
        continue;
      }

      const relativeLink = '/';
      const absoluteLink = toAbsoluteWebUrl(relativeLink);
      const notificationTag = `admin_external_broadcast_retry_${broadcastDoc.id}`;

      let retrySuccessCount = 0;
      let retryFailureCount = 0;
      const invalidTokens = [];
      const batches = chunkArray(uniqueTokens, MULTICAST_BATCH_SIZE);

      for (const batch of batches) {
        try {
          const response = await admin.messaging().sendEachForMulticast({
            tokens: batch,
            data: stringifyNotificationData({
              type: 'admin_external_broadcast',
              externalOnly: '1',
              broadcastId: broadcastDoc.id,
              tag: notificationTag,
              title,
              body,
              audience: String(data.targetAudience || 'all'),
              createdAt: new Date().toISOString(),
              url: absoluteLink,
              link: relativeLink,
              isRetry: '1',
            }),
            webpush: {
              headers: HIGH_URGENCY_HEADERS,
              fcmOptions: { link: absoluteLink },
            },
          });
          logMulticastResult('retryFailedAudienceBroadcasts', response, batch);
          retrySuccessCount += Number(response?.successCount || 0);
          retryFailureCount += Number(response?.failureCount || 0);
          const batchInvalid = getInvalidFcmTokensFromResponse(response, batch);
          invalidTokens.push(...batchInvalid);
        } catch (batchErr) {
          retryFailureCount += batch.length;
          console.warn(
            `[retryFailedAudienceBroadcasts] batch error on ${broadcastDoc.id}:`,
            batchErr?.message || batchErr,
          );
        }
      }

      if (invalidTokens.length > 0) {
        await cleanupInvalidTokens(invalidTokens);
      }

      // تحديث البث — اعتبار الـ retry مكتملاً (مرة واحدة فقط)
      const newSuccessTotal = Number(data.successCount || 0) + retrySuccessCount;
      const newFailureTotal = Math.max(0, Number(data.failureCount || 0) - retrySuccessCount);
      await broadcastDoc.ref
        .set(
          {
            retryAttempted: true,
            retryCompletedAtMs: Date.now(),
            retrySuccessCount,
            retryFailureCount,
            successCount: newSuccessTotal,
            failureCount: newFailureTotal,
            // امسح الـ tokens بعد المعالجة — لا نخزّنها إلى الأبد
            retryableTokens: [],
          },
          { merge: true },
        )
        .catch((err) => {
          console.warn('[retryFailedAudienceBroadcasts] update failed:', err?.message || err);
        });

      processed += 1;
      totalRecovered += retrySuccessCount;
    }

    return { processed, totalRecovered };
  };

  return retryFailedAudienceBroadcasts;
};
