const {
  normalizeAudience,
  SUPPORTED_BROADCAST_AUDIENCES,
} = require('../../fcmTopics');
const createAudienceTokenResolver = require('./audienceTokenResolver');

const LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
// حد أقصى للبثوث الداخلية اليومية لكل أدمن — حماية من السبام.
const DAILY_IN_APP_BROADCAST_LIMIT_PER_ADMIN = 30;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const normalizeText = (value) => String(value || '').trim();

const ensureNonEmpty = (value, errorCode, HttpsError) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new HttpsError('invalid-argument', errorCode);
  }
  return normalized;
};

const maskEmail = (email) => {
  const normalized = normalizeText(email).toLowerCase();
  if (!normalized || !normalized.includes('@')) return '';

  const [localPart, domainPart] = normalized.split('@');
  if (!localPart || !domainPart) return '';

  const localMasked = localPart.length <= 2
    ? `${localPart.charAt(0)}***`
    : `${localPart.slice(0, 2)}***${localPart.slice(-1)}`;

  const domainParts = domainPart.split('.');
  const domainName = normalizeText(domainParts.shift());
  const domainSuffix = domainParts.join('.');

  const domainMasked = domainName
    ? `${domainName.charAt(0)}***${domainSuffix ? `.${domainSuffix}` : ''}`
    : domainPart;

  return `${localMasked}@${domainMasked}`;
};

module.exports = (context) => {
  const {
    HttpsError,
    admin,
    assertAdminRequest,
    getDb,
    getFcmTokensFromDoc,
  } = context;

  const audienceResolver = createAudienceTokenResolver({
    admin,
    getDb,
    getFcmTokensFromDoc,
  });

  const sendInAppAudienceNotificationBroadcast = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const db = getDb();

    // حد تردد يومي — يرفض البث إذا تجاوز أدمن ما DAILY_IN_APP_BROADCAST_LIMIT_PER_ADMIN في آخر 24 ساعة.
    const oneDayAgoIso = new Date(Date.now() - ONE_DAY_MS).toISOString();
    try {
      const recentBroadcastsSnap = await db
        .collection('inAppNotificationBroadcasts')
        .where('createdBy', '==', adminEmail)
        .where('createdAt', '>=', oneDayAgoIso)
        .count()
        .get();
      const recentCount = Number(recentBroadcastsSnap.data()?.count || 0);
      if (recentCount >= DAILY_IN_APP_BROADCAST_LIMIT_PER_ADMIN) {
        throw new HttpsError(
          'resource-exhausted',
          `DAILY_IN_APP_BROADCAST_LIMIT_REACHED:${DAILY_IN_APP_BROADCAST_LIMIT_PER_ADMIN}`
        );
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.warn('[sendInAppAudienceNotificationBroadcast] rate-limit check failed:', err?.message || err);
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

    const {
      roleKeys,
      tokens,
      excludedDueToOverlapCount,
      normalizedTargetEmail,
      candidateUserIds,
      customEmailRoleMode: resolvedCustomEmailRoleMode,
    } = await audienceResolver.collectTokensByAudience({
      targetAudience,
      targetEmail,
      customEmailRoleMode,
    });

    const broadcastRef = db.collection('inAppNotificationBroadcasts').doc();
    const broadcastId = broadcastRef.id;
    const targetScopeIds = Array.isArray(candidateUserIds)
      ? candidateUserIds.map((item) => normalizeText(item)).filter(Boolean).slice(0, 100)
      : [];

    const estimatedDeviceCount = tokens.length;
    const matchedUserIdsCount = targetScopeIds.length;

    await broadcastRef.set(
      {
        id: broadcastId,
        status: 'active',
        type: 'in_app_popup',
        channel: 'in_app_only',
        title,
        body,
        targetAudience,
        targetRoleKeys: roleKeys,
        customEmailRoleMode: targetAudience === 'custom' ? resolvedCustomEmailRoleMode : 'all_linked',
        targetScopeIds,
        targetEmail: targetAudience === 'custom' ? normalizedTargetEmail : '',
        targetEmailMasked: targetAudience === 'custom' ? maskEmail(normalizedTargetEmail) : '',
        createdBy: adminEmail,
        createdAt: nowIso,
        createdAtMs: nowMs,
        expiresAtMs,
        tokenCount: estimatedDeviceCount,
        successCount: estimatedDeviceCount,
        failureCount: 0,
        failedBatchesCount: 0,
        matchedUserIdsCount,
        excludedDueToOverlapCount,
        resultText:
          estimatedDeviceCount > 0
            ? 'تم نشر الإشعار الداخلي بنجاح وسيظهر للفئة المستهدفة وفق منطق الاستهداف.'
            : targetAudience === 'custom'
              ? 'لا توجد جلسات نشطة مرتبطة بالبريد الإلكتروني المستهدف حالياً، وتم حفظ الإشعار للعرض عند التحقق من التطابق.'
              : 'لا توجد أجهزة نشطة حالياً لهذه الفئة، وتم حفظ الإشعار الداخلي للوصول المتوافق.',
      },
      { merge: true }
    );

    return {
      ok: true,
      status: 'active',
      broadcastId,
      targetAudience,
      tokenCount: estimatedDeviceCount,
      successCount: estimatedDeviceCount,
      failureCount: 0,
      failedBatchesCount: 0,
      matchedUserIdsCount,
      excludedDueToOverlapCount,
      customEmailRoleMode: targetAudience === 'custom' ? resolvedCustomEmailRoleMode : 'all_linked',
      message:
        estimatedDeviceCount > 0
          ? 'تم نشر الإشعار الداخلي بنجاح.'
          : 'تم حفظ الإشعار الداخلي وسيظهر وفق شروط الاستهداف عند التطابق.',
    };
  };

  return sendInAppAudienceNotificationBroadcast;
};
