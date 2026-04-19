const {
  normalizeAudience,
  SUPPORTED_BROADCAST_AUDIENCES,
} = require('../../fcmTopics');
const createAudienceTokenResolver = require('./audienceTokenResolver');

/**
 * estimateAudienceSize — يقدّر حجم الجمهور قبل الإرسال الفعلي.
 *
 * الهدف: يرى الأدمن "سيتم الإرسال إلى X مستخدم" قبل الضغط على تأكيد،
 * فيُتفادى الإرسال العرضي لآلاف المستخدمين بنية خاطئة.
 *
 * لا يرسل أي إشعار، ولا يكتب في Firestore. فقط يقرأ ويعدّ.
 */
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

  const estimateAudienceSize = async (request) => {
    await assertAdminRequest(request);

    const targetAudience = normalizeAudience(request?.data?.targetAudience || 'all');
    if (!SUPPORTED_BROADCAST_AUDIENCES.includes(targetAudience)) {
      throw new HttpsError('invalid-argument', 'INVALID_TARGET_AUDIENCE');
    }

    const targetEmail = audienceResolver.normalizeEmail(request?.data?.targetEmail);
    const customEmailRoleMode = audienceResolver.normalizeCustomEmailRoleMode(
      request?.data?.customEmailRoleMode,
    );
    if (targetAudience === 'custom' && !audienceResolver.isValidEmail(targetEmail)) {
      throw new HttpsError('invalid-argument', 'TARGET_EMAIL_REQUIRED_FOR_CUSTOM_AUDIENCE');
    }

    const audienceResult = await audienceResolver.collectTokensByAudience({
      targetAudience,
      targetEmail,
      customEmailRoleMode,
    });

    const tokens = Array.isArray(audienceResult?.tokens) ? audienceResult.tokens : [];
    const uniqueTokens = new Set(tokens);

    return {
      targetAudience,
      tokenCount: tokens.length,
      uniqueTokenCount: uniqueTokens.size,
      excludedDueToOverlapCount: Number(audienceResult?.excludedDueToOverlapCount || 0),
      candidateUserIds: Array.isArray(audienceResult?.candidateUserIds)
        ? audienceResult.candidateUserIds.length
        : 0,
    };
  };

  return estimateAudienceSize;
};
