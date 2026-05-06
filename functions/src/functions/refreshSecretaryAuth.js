/**
 * refreshSecretaryAuth — تجديد Firebase Auth للسكرتيرة بدون طلب باسوورد جديد.
 *
 * المشكلة: السكرتيرة بتعمل login مرة واحدة وبتحصل على:
 *   1) sessionToken مدته ٣٠ يوم (في localStorage)
 *   2) Firebase customAuthToken مدته ساعة واحدة (للكتابة المباشرة على Firestore)
 *
 * بعد ساعة، الـ Firebase Auth بيضيع → السكرتيرة مش قادرة تقرأ branches أو
 * أي شيء في Firestore يطلب auth حقيقي. الحل: تنادي على الدالة دي اللي بتتحقق
 * من sessionToken وترجع customAuthToken جديد.
 *
 * مكان جلسة السكرتيرة بيختلف حسب نوع الفرع:
 *   - main:    secretaryAuth/{secret}.secretarySessionToken
 *   - فرع فرعي: secretaryAuth/{secret}/branches/{branchId}.sessionToken
 */

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // ٣٠ يوم — نفس مدة الجلسة في secretaryLogin
const SECRET_PATTERN = /^b_[a-z0-9]{10,120}$/i;
const BRANCH_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

module.exports = (context) => {
  const { HttpsError, getDb, admin } = context;

  const refreshSecretaryAuth = async (request) => {
    // ── ١) استخراج وفحص المدخلات ──
    const secret = String(request?.data?.secret || '').trim();
    const sessionToken = String(request?.data?.sessionToken || '').trim();
    const rawBranchId = String(request?.data?.branchId || '').trim();
    const branchId = rawBranchId || 'main';

    if (!secret) throw new HttpsError('invalid-argument', 'SECRET_REQUIRED');
    if (!sessionToken) throw new HttpsError('invalid-argument', 'SESSION_TOKEN_REQUIRED');
    if (!SECRET_PATTERN.test(secret)) {
      throw new HttpsError('invalid-argument', 'INVALID_SECRET');
    }
    // فحص branchId يمنع injection عبر dot-notation (مثل "../foo")
    if (!BRANCH_ID_PATTERN.test(branchId)) {
      throw new HttpsError('invalid-argument', 'INVALID_BRANCH_ID');
    }

    const db = getDb();
    const now = Date.now();

    // ── ٢) قراءة bookingConfig للحصول على userId ──
    // لا نقدر نعمل custom token بدون userId الطبيب لأن claims الـ token بتتضمنه.
    const configSnap = await db.doc(`bookingConfig/${secret}`).get();
    if (!configSnap.exists) {
      throw new HttpsError('not-found', 'BOOKING_CONFIG_NOT_FOUND');
    }
    const configData = configSnap.data() || {};
    const userId = String(configData.userId || '').trim();
    if (!userId) {
      throw new HttpsError('failed-precondition', 'BOOKING_CONFIG_NO_USER');
    }

    // ── ٣) فحص أن الفرع يخص الطبيب فعلاً (لمنع تجديد لفرع وهمي) ──
    if (branchId !== 'main') {
      const branchDocSnap = await db.doc(`users/${userId}/branches/${branchId}`).get();
      if (!branchDocSnap.exists) {
        throw new HttpsError('invalid-argument', 'INVALID_BRANCH_FOR_DOCTOR');
      }
    }

    // ── ٤) التحقق من sessionToken في المسار الصحيح ──
    let sessionValid = false;
    let sessionUpdatedAtMs = 0;

    if (branchId === 'main') {
      // الفرع الرئيسي — top-level doc
      const authSnap = await db.doc(`secretaryAuth/${secret}`).get();
      if (authSnap.exists) {
        const data = authSnap.data() || {};
        const stored = String(data.secretarySessionToken || '').trim();
        if (stored && stored === sessionToken) {
          sessionValid = true;
          const updatedAt = data.secretarySessionTokenUpdatedAt;
          sessionUpdatedAtMs = (updatedAt && typeof updatedAt.toMillis === 'function')
            ? updatedAt.toMillis()
            : 0;
        }
      }
      // Fallback قديم — لو الجلسة لسه في bookingConfig (قبل migration)
      if (!sessionValid) {
        const legacy = String(configData.secretarySessionToken || '').trim();
        if (legacy && legacy === sessionToken) {
          sessionValid = true;
          const legacyUpdatedAt = configData.secretarySessionTokenUpdatedAt;
          sessionUpdatedAtMs = (legacyUpdatedAt && typeof legacyUpdatedAt.toMillis === 'function')
            ? legacyUpdatedAt.toMillis()
            : 0;
        }
      }
    } else {
      // فرع فرعي — subcollection
      const branchAuthSnap = await db
        .doc(`secretaryAuth/${secret}/branches/${branchId}`)
        .get();
      if (branchAuthSnap.exists) {
        const data = branchAuthSnap.data() || {};
        const stored = String(data.sessionToken || '').trim();
        if (stored && stored === sessionToken) {
          sessionValid = true;
          const updatedAt = data.sessionTokenUpdatedAt;
          sessionUpdatedAtMs = (updatedAt && typeof updatedAt.toMillis === 'function')
            ? updatedAt.toMillis()
            : 0;
        }
      }
    }

    if (!sessionValid) {
      throw new HttpsError('unauthenticated', 'INVALID_SESSION_TOKEN');
    }

    // ── ٥) فحص عمر الجلسة (٣٠ يوم كحد أقصى) ──
    if (sessionUpdatedAtMs > 0 && (now - sessionUpdatedAtMs) > SESSION_MAX_AGE_MS) {
      throw new HttpsError('unauthenticated', 'SECRETARY_SESSION_EXPIRED');
    }

    // ── ٦) إصدار Firebase customAuthToken جديد ──
    // نفس صيغة الـ UID اللي بيعملها secretaryLoginWithDoctorEmail عشان rules
    // الفروع تشتغل (ا لقاعدة بتعتمد على pattern `secretary:{secret}:{branchId}`).
    const customAuthUid = `secretary:${secret}:${branchId}`;
    let customAuthToken = '';
    try {
      customAuthToken = await admin.auth().createCustomToken(customAuthUid, {
        role: 'secretary',
        secret,
        branchId,
        doctorUserId: userId,
      });
    } catch (tokenError) {
      console.warn(
        '[refreshSecretaryAuth] Failed to mint custom auth token:',
        tokenError?.message || tokenError
      );
      throw new HttpsError('internal', 'CUSTOM_TOKEN_MINT_FAILED');
    }

    return {
      ok: true,
      customAuthToken,
      userId,
      branchId,
    };
  };

  return { refreshSecretaryAuth };
};
