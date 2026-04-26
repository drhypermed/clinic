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
 * لا يرسل أي إشعار، لكن يقرأ من Firestore لذا له تكلفة قراءات كبيرة.
 * عشان كده له حد ساعي صارم لمنع استنزاف الميزانية لو حساب أدمن اختُرق.
 */

// حد التقديرات لكل أدمن في الساعة الواحدة. أكتر من ده على الأرجح ضغط زر بالغلط
// أو محاولة استنزاف، فلا يخدم استخدام مشروع.
const HOURLY_ESTIMATE_LIMIT_PER_ADMIN = 60;
const ONE_HOUR_MS = 60 * 60 * 1000;

const normalizeText = (value) => String(value || '').trim();

// مفتاح المستند آمن (يحوّل @ و. إلى _) عشان يفضل id صالح في Firestore.
const buildRateLimitDocId = (adminEmail) =>
  normalizeText(adminEmail).toLowerCase().replace(/[^a-z0-9_-]/g, '_');

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

  /**
   * فحص الحد الساعي لتقدير الجمهور لكل أدمن.
   * يستخدم نافذة ثابتة ساعة: لو وصل الأدمن للحد، نرفض حتى نهاية النافذة.
   */
  const enforceHourlyEstimateLimit = async (adminEmail) => {
    const docId = buildRateLimitDocId(adminEmail);
    if (!docId) return;

    const db = getDb();
    const ref = db.collection('audienceEstimateRateLimits').doc(docId);
    const nowMs = Date.now();

    await db.runTransaction(async (txn) => {
      const snap = await txn.get(ref);
      const data = snap.exists ? snap.data() || {} : {};
      const windowStartMs = Number(data.windowStartMs || 0);
      const count = Number(data.count || 0);

      // النافذة انتهت أو ما اتفتحتش — نبدأ جديدة بعدّاد ١.
      if (!Number.isFinite(windowStartMs) || nowMs - windowStartMs >= ONE_HOUR_MS) {
        txn.set(ref, {
          adminEmail: normalizeText(adminEmail).toLowerCase(),
          windowStartMs: nowMs,
          count: 1,
          updatedAtMs: nowMs,
        });
        return;
      }

      // النافذة شغالة — لو وصلنا الحد، نرفض.
      if (count >= HOURLY_ESTIMATE_LIMIT_PER_ADMIN) {
        throw new HttpsError(
          'resource-exhausted',
          `HOURLY_ESTIMATE_LIMIT_REACHED:${HOURLY_ESTIMATE_LIMIT_PER_ADMIN}`,
        );
      }

      txn.update(ref, {
        count: count + 1,
        updatedAtMs: nowMs,
      });
    });
  };

  const estimateAudienceSize = async (request) => {
    const adminEmail = await assertAdminRequest(request);

    // فحص الحد قبل أي قراءة ثقيلة لمنع الاستنزاف.
    await enforceHourlyEstimateLimit(adminEmail);

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
