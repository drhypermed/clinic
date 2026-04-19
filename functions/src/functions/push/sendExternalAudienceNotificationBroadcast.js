const {
  normalizeAudience,
  SUPPORTED_BROADCAST_AUDIENCES,
} = require('../../fcmTopics');
const createAudienceTokenResolver = require('./audienceTokenResolver');

const MULTICAST_BATCH_SIZE = 450;
const LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const RETRY_POLICY = 'no_auto_retry';
// حد أقصى للبثوث اليومية لكل أدمن — حماية من السبام حتى لو حساب أدمن اختُرق.
const DAILY_BROADCAST_LIMIT_PER_ADMIN = 30;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const normalizeText = (value) => String(value || '').trim();

const ensureNonEmpty = (value, errorCode, HttpsError) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new HttpsError('invalid-argument', errorCode);
  }
  return normalized;
};

const chunkArray = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

module.exports = (context) => {
  const {
    HttpsError,
    admin,
    assertAdminRequest,
    getDb,
    getFcmTokensFromDoc,
    logMulticastResult,
    getInvalidFcmTokensFromResponse,
    removeTokenFromCollection,
    clearTokenRoleTopics,
    toAbsoluteWebUrl,
    stringifyNotificationData,
    HIGH_URGENCY_HEADERS,
  } = context;

  const audienceResolver = createAudienceTokenResolver({
    admin,
    getDb,
    getFcmTokensFromDoc,
  });

  const cleanupInvalidTokens = async (invalidTokens) => {
    if (!Array.isArray(invalidTokens) || invalidTokens.length === 0) return;

    const uniqueInvalidTokens = Array.from(new Set(invalidTokens.map((token) => normalizeText(token)).filter(Boolean)));

    for (const token of uniqueInvalidTokens) {
      await Promise.all([
        removeTokenFromCollection('secretaryFcmTokens', token),
        removeTokenFromCollection('users', token),
      ]);

      await clearTokenRoleTopics(token).catch(() => {
        // Best effort cleanup for topic subscriptions.
      });
    }
  };

  const buildFailureReasonStats = (failureReasonMap) =>
    Array.from(failureReasonMap.values())
      .map((item) => ({
        code: item.code,
        count: item.count,
        message: item.message,
      }))
      .sort((a, b) => b.count - a.count);

  const recordFailureReason = (failureReasonMap, code, message, count = 1) => {
    const normalizedCode = normalizeText(code || 'unknown_error') || 'unknown_error';
    const normalizedMessage = normalizeText(message);
    const current = failureReasonMap.get(normalizedCode) || {
      code: normalizedCode,
      count: 0,
      message: normalizedMessage,
    };
    current.count += Math.max(1, Number(count) || 1);
    if (!current.message && normalizedMessage) {
      current.message = normalizedMessage;
    }
    failureReasonMap.set(normalizedCode, current);
  };

  const sendExternalAudienceNotificationBroadcast = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const db = getDb();

    // حد تردد يومي — يرفض الإرسال إذا تجاوز أدمن ما DAILY_BROADCAST_LIMIT_PER_ADMIN بثّاً في آخر 24 ساعة.
    const oneDayAgoIso = new Date(Date.now() - ONE_DAY_MS).toISOString();
    try {
      const recentBroadcastsSnap = await db
        .collection('externalNotificationBroadcasts')
        .where('createdBy', '==', adminEmail)
        .where('createdAt', '>=', oneDayAgoIso)
        .count()
        .get();
      const recentCount = Number(recentBroadcastsSnap.data()?.count || 0);
      if (recentCount >= DAILY_BROADCAST_LIMIT_PER_ADMIN) {
        throw new HttpsError(
          'resource-exhausted',
          `DAILY_BROADCAST_LIMIT_REACHED:${DAILY_BROADCAST_LIMIT_PER_ADMIN}`
        );
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.warn('[sendExternalAudienceNotificationBroadcast] rate-limit check failed:', err?.message || err);
    }

    const title = ensureNonEmpty(request?.data?.title, 'TITLE_REQUIRED', HttpsError);
    const body = ensureNonEmpty(request?.data?.body, 'BODY_REQUIRED', HttpsError);

    if (title.length > 120) {
      throw new HttpsError('invalid-argument', 'TITLE_TOO_LONG');
    }
    if (body.length > 1000) {
      throw new HttpsError('invalid-argument', 'BODY_TOO_LONG');
    }

    const targetAudience = normalizeAudience(request?.data?.targetAudience || 'all');
    if (!SUPPORTED_BROADCAST_AUDIENCES.includes(targetAudience)) {
      throw new HttpsError('invalid-argument', 'INVALID_TARGET_AUDIENCE');
    }
    const targetEmail = audienceResolver.normalizeEmail(request?.data?.targetEmail);
    const customEmailRoleMode = audienceResolver.normalizeCustomEmailRoleMode(request?.data?.customEmailRoleMode);
    if (targetAudience === 'custom' && !audienceResolver.isValidEmail(targetEmail)) {
      throw new HttpsError('invalid-argument', 'TARGET_EMAIL_REQUIRED_FOR_CUSTOM_AUDIENCE');
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const nowMs = now.getTime();
    const expiresAtMs = nowMs + LOG_RETENTION_MS;

    const logRef = db.collection('externalNotificationBroadcasts').doc();
    const broadcastId = logRef.id;

    await logRef.set(
      {
        id: broadcastId,
        status: 'sending',
        targetAudience,
        targetEmail: targetAudience === 'custom' ? targetEmail : '',
        customEmailRoleMode: targetAudience === 'custom' ? customEmailRoleMode : 'all_linked',
        title,
        body,
        channel: 'external_push_only',
        createdBy: adminEmail,
        createdAt: nowIso,
        createdAtMs: nowMs,
        expiresAtMs,
        tokenCount: 0,
        successCount: 0,
        failureCount: 0,
        failedBatchesCount: 0,
      },
      { merge: true }
    );

    try {
      const {
        roleKeys,
        tokens: allTokens,
        excludedDueToOverlapCount,
        normalizedTargetEmail,
        candidateUserIds,
        customEmailRoleMode: resolvedCustomEmailRoleMode,
      } = await audienceResolver.collectTokensByAudience({
        targetAudience,
        targetEmail,
        customEmailRoleMode,
      });

      const tokenCount = allTokens.length;

      await logRef.set(
        {
          targetRoleKeys: roleKeys,
          targetEmail: targetAudience === 'custom' ? normalizedTargetEmail : '',
          customEmailRoleMode: targetAudience === 'custom' ? resolvedCustomEmailRoleMode : 'all_linked',
          matchedUserIdsCount: Array.isArray(candidateUserIds) ? candidateUserIds.length : 0,
        },
        { merge: true }
      );

      if (tokenCount === 0) {
        await logRef.set(
          {
            status: 'sent',
            sentAt: new Date().toISOString(),
            sentAtMs: Date.now(),
            tokenCount: 0,
            successCount: 0,
            failureCount: 0,
            failedBatchesCount: 0,
            excludedDueToOverlapCount,
            retryPolicy: RETRY_POLICY,
            retryAttempted: false,
            failureReasons: [],
            resultText:
              targetAudience === 'custom'
                ? 'لا توجد أجهزة نشطة مرتبطة بهذا البريد الإلكتروني حالياً.'
                : 'لا توجد أجهزة مستهدفة نشطة حالياً لهذه الفئة.',
          },
          { merge: true }
        );

        return {
          ok: true,
          status: 'sent',
          broadcastId,
          targetAudience,
          tokenCount: 0,
          successCount: 0,
          failureCount: 0,
          failedBatchesCount: 0,
          excludedDueToOverlapCount,
          retryPolicy: RETRY_POLICY,
          retryAttempted: false,
          failureReasons: [],
          message:
            targetAudience === 'custom'
              ? 'لا توجد أجهزة نشطة مرتبطة بهذا البريد الإلكتروني حالياً.'
              : 'لا توجد أجهزة مستهدفة نشطة حالياً.',
        };
      }

      const relativeLink = '/';
      const absoluteLink = toAbsoluteWebUrl(relativeLink);
      const notificationTag = `admin_external_broadcast_${broadcastId}`;

      let successCount = 0;
      let failureCount = 0;
      let failedBatchesCount = 0;
      const invalidTokens = [];
      const retryableTokens = []; // فشل عابر — يستحق إعادة محاولة
      const failureReasonMap = new Map();

      const tokenBatches = chunkArray(allTokens, MULTICAST_BATCH_SIZE);

      for (const batchTokens of tokenBatches) {
        try {
          const response = await admin.messaging().sendEachForMulticast({
            tokens: batchTokens,
            data: stringifyNotificationData({
              type: 'admin_external_broadcast',
              externalOnly: '1',
              broadcastId,
              tag: notificationTag,
              title,
              body,
              audience: targetAudience,
              createdAt: nowIso,
              url: absoluteLink,
              link: relativeLink,
            }),
            webpush: {
              headers: HIGH_URGENCY_HEADERS,
              fcmOptions: {
                link: absoluteLink,
              },
            },
          });

          logMulticastResult('sendExternalAudienceNotificationBroadcast', response, batchTokens);

          successCount += Number(response?.successCount || 0);
          failureCount += Number(response?.failureCount || 0);

          if (Array.isArray(response?.responses)) {
            response.responses.forEach((item) => {
              if (item?.success) return;
              recordFailureReason(
                failureReasonMap,
                item?.error?.code,
                item?.error?.message,
                1
              );
            });
          }

          const batchInvalidTokens = getInvalidFcmTokensFromResponse(response, batchTokens);
          invalidTokens.push(...batchInvalidTokens);

          // جمع الـ tokens التي فشلت عبوراً (ليست invalid نهائياً) لإعادة محاولة واحدة لاحقاً
          if (Array.isArray(response?.responses)) {
            const invalidSet = new Set(batchInvalidTokens);
            response.responses.forEach((item, idx) => {
              if (item?.success) return;
              const token = batchTokens[idx];
              if (token && !invalidSet.has(token)) {
                retryableTokens.push(token);
              }
            });
          }

          if (Number(response?.successCount || 0) === 0 && Number(response?.failureCount || 0) > 0) {
            failedBatchesCount += 1;
          }
        } catch (batchError) {
          failureCount += batchTokens.length;
          failedBatchesCount += 1;
          // Batch كامل فشل (مثلاً timeout) — كل الـ tokens قابلة لإعادة المحاولة
          retryableTokens.push(...batchTokens);
          recordFailureReason(
            failureReasonMap,
            batchError?.code || 'batch_exception',
            batchError?.message || 'Batch level exception',
            batchTokens.length
          );
        }
      }

      if (invalidTokens.length > 0) {
        await cleanupInvalidTokens(invalidTokens);
      }

      const status =
        failureCount === 0 ? 'sent' : successCount > 0 ? 'partial' : 'failed';
      const ok = successCount > 0 || tokenCount === 0;
      const failureReasons = buildFailureReasonStats(failureReasonMap);
      const topFailureReason = failureReasons[0]?.code || '';
      const resultText =
        status === 'sent'
          ? 'تم إرسال الإشعار الخارجي بنجاح.'
          : status === 'partial'
            ? `تم إرسال الإشعار مع وجود بعض الإخفاقات.${topFailureReason ? ` السبب الأكثر تكراراً: ${topFailureReason}` : ''}`
            : `فشل إرسال الإشعار لجميع الأجهزة المستهدفة.${topFailureReason ? ` السبب الأكثر تكراراً: ${topFailureReason}` : ''}`;

      // P2: لو فيه tokens فشلت عبوراً، نحجز إعادة محاولة واحدة بعد 5 دقائق.
      // الـ scheduler `retryFailedAudienceBroadcasts` سيقرأ هذا الحقل ويعيد الإرسال.
      const uniqueRetryableTokens = Array.from(new Set(retryableTokens))
        .filter((token) => typeof token === 'string' && token.trim().length > 0);
      const shouldScheduleRetry = uniqueRetryableTokens.length > 0;
      const retryScheduledAtMs = shouldScheduleRetry ? Date.now() + 5 * 60 * 1000 : 0;

      await logRef.set(
        {
          status,
          sentAt: new Date().toISOString(),
          sentAtMs: Date.now(),
          tokenCount,
          successCount,
          failureCount,
          failedBatchesCount,
          excludedDueToOverlapCount,
          retryPolicy: shouldScheduleRetry ? 'auto_retry_once_after_5min' : RETRY_POLICY,
          retryAttempted: false,
          retryScheduledAtMs,
          retryableTokens: shouldScheduleRetry ? uniqueRetryableTokens.slice(0, 5000) : [],
          failureReasons,
          resultText,
        },
        { merge: true }
      );

      return {
        ok,
        status,
        broadcastId,
        targetAudience,
        tokenCount,
        successCount,
        failureCount,
        failedBatchesCount,
        excludedDueToOverlapCount,
        retryPolicy: RETRY_POLICY,
        retryAttempted: false,
        failureReasons,
        message: resultText,
      };
    } catch (error) {
      await logRef
        .set(
          {
            status: 'failed',
            sentAt: new Date().toISOString(),
            sentAtMs: Date.now(),
            resultText: 'حدث خطأ تقني أثناء إرسال الإشعار الخارجي.',
            errorMessage: String(error?.message || error || ''),
          },
          { merge: true }
        )
        .catch(() => {});

      const rawCode = String(error?.code || '');
      const rawMessage = String(error?.message || '');
      throw new HttpsError('internal', 'EXTERNAL_BROADCAST_FAILED', {
        rawCode,
        rawMessage,
      });
    }
  };

  return sendExternalAudienceNotificationBroadcast;
};
