module.exports = (context) => {
  const {
    HttpsError,
    admin,
    getDb,
    removeTokenFromCollection,
    syncTokenRoleTopics,
  } = context;

  const registerPushToken = async (request) => {
    const role = String(request?.data?.role || 'doctor').trim().toLowerCase();
    const token = String(request?.data?.token || '').trim();
    if (!token) {
      throw new HttpsError('invalid-argument', 'TOKEN_REQUIRED');
    }
    if (token.length < 20 || token.length > 4096) {
      throw new HttpsError('invalid-argument', 'INVALID_TOKEN_FORMAT');
    }
    const tokenHint = token.slice(-10);

    const db = getDb();
    const updatedAtIso = new Date().toISOString();
    const basePayload = {
      fcmToken: token,
      fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
      updatedAt: updatedAtIso,
    };

    if (role === 'public') {
      const authUid = String(request?.auth?.uid || '').trim();
      if (!authUid) {
        throw new HttpsError('unauthenticated', 'AUTH_REQUIRED_FOR_PUBLIC_PUSH');
      }

      const userId = String(request?.data?.userId || '').trim() || authUid;
      if (userId !== authUid) {
        throw new HttpsError('permission-denied', 'USER_MISMATCH');
      }

      const userRef = db.doc(`users/${authUid}`);
      await userRef.set({ ...basePayload, authRole: 'public', userRole: 'public' }, { merge: true });

      const removedFromOtherRolesCount = (
        await Promise.all([
          removeTokenFromCollection('users', token, authUid),
          removeTokenFromCollection('secretaryFcmTokens', token),
        ])
      ).reduce((sum, count) => sum + Number(count || 0), 0);

      console.log('[registerPushToken] public token saved', {
        userId: authUid,
        tokenHint,
        tokenLength: token.length,
        removedFromOtherRolesCount,
      });

      const topicSync = await syncTokenRoleTopics(token, 'public');

      return {
        ok: true,
        role: 'public',
        userId: authUid,
        topicSyncOk: Boolean(topicSync?.ok),
      };
    }

    if (role === 'secretary') {
      // السكرتيرة مش محتاجة Firebase Auth (عندها sessionToken منفصل بعد secretaryLogin).
      // نقبل:
      //   (أ) `auth.uid` من signInWithCustomToken (لو لسه صالح، بعد login فوري)
      //   (ب) أو `sessionToken` الذي تم إنشاؤه من `secretaryLoginWithDoctorEmail`
      //   الأسلوب (ب) يحل مشكلة re-opening المتصفح (الـ custom token ينتهي بعد ساعة
      //   لكن sessionToken محفوظ في localStorage ولسه صالح لفترة أطول).
      const secret = String(request?.data?.secret || '').trim();
      if (!secret) {
        throw new HttpsError('invalid-argument', 'SECRET_REQUIRED');
      }

      // تطبيع branchId — نستخدم 'main' لو مش محدد (للتوافق مع النظام القديم قبل التقسيم بالفروع)
      const rawBranchId = String(request?.data?.branchId || '').trim();
      const branchId = rawBranchId || 'main';

      // validation أساسي للـ branchId — منع محاولات تسريب أو injection عبر dot-notation
      // (مثلاً branchId = "../foo" أو "main.nested") التي تفسد مفاتيح الخريطة.
      // نقبل فقط أحرف/أرقام/شرطات/underscores، طول 1-64.
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(branchId)) {
        throw new HttpsError('invalid-argument', 'INVALID_BRANCH_ID');
      }

      let userId = '';
      let configData = null;
      try {
        const configSnap = await db.doc(`bookingConfig/${secret}`).get();
        if (!configSnap.exists) {
          throw new HttpsError('not-found', 'BOOKING_CONFIG_NOT_FOUND');
        }
        configData = configSnap.data() || {};
        userId = String(configData?.userId || '').trim();
      } catch (error) {
        if (error instanceof HttpsError) throw error;
        console.warn('[registerPushToken] bookingConfig lookup failed', { secret, error });
        throw new HttpsError('not-found', 'BOOKING_CONFIG_NOT_FOUND');
      }

      // التحقق من أن الـ branchId يخص الطبيب فعلاً (قبل أي كتابة).
      // 'main' دائماً صالح (الفرع الافتراضي). لأي branchId آخر، لازم يكون موجود
      // في `users/{userId}/branches/{branchId}`. بدون هذا الفحص، client خبيث
      // ممكن يسجل token على فرع وهمي يُفسد استهداف الإشعارات.
      if (userId && branchId !== 'main') {
        const branchDocSnap = await db
          .doc(`users/${userId}/branches/${branchId}`)
          .get()
          .catch(() => null);
        if (!branchDocSnap || !branchDocSnap.exists) {
          console.warn('[registerPushToken] branchId does not belong to doctor', {
            secret,
            userId,
            branchId,
          });
          throw new HttpsError('invalid-argument', 'INVALID_BRANCH_FOR_DOCTOR');
        }
      }

      // التحقق من الـ session — يقبل `auth.uid` أو `sessionToken` الموافق
      const authUidForSecretary = String(request?.auth?.uid || '').trim();
      const providedSessionToken = String(request?.data?.sessionToken || '').trim();
      const authUidMatchesSecret =
        authUidForSecretary.startsWith(`secretary:${secret}:`) ||
        // للتوافق مع Firebase Auth العادي: الطبيب صاحب الـ secret
        authUidForSecretary === userId;

      let sessionAccepted = authUidMatchesSecret;

      if (!sessionAccepted && providedSessionToken) {
        // تحقق من sessionToken في secretaryAuth/{secret}
        try {
          const authSnap = await db.doc(`secretaryAuth/${secret}`).get();
          if (authSnap.exists) {
            const authData = authSnap.data() || {};
            const storedSessionToken = String(authData.secretarySessionToken || '').trim();
            if (storedSessionToken && storedSessionToken === providedSessionToken) {
              sessionAccepted = true;
            }
          }
          // Fallback: التحقق من legacy session في bookingConfig
          if (!sessionAccepted) {
            const legacySessionToken = String(configData?.secretarySessionToken || '').trim();
            if (legacySessionToken && legacySessionToken === providedSessionToken) {
              sessionAccepted = true;
            }
          }
        } catch (sessionError) {
          console.warn('[registerPushToken] session verification failed:', sessionError);
        }
      }

      // استثناء: لو السكرتارية ما تحتاجش auth (secretaryAuthRequired=false)، نقبل بدون sessionToken
      if (!sessionAccepted && configData && configData.secretaryAuthRequired === false) {
        sessionAccepted = true;
      }

      if (!sessionAccepted) {
        console.warn('[registerPushToken] secretary auth rejected', {
          secret,
          hasAuthUid: Boolean(authUidForSecretary),
          authUidMatchesSecret,
          hasSessionToken: Boolean(providedSessionToken),
        });
        throw new HttpsError('unauthenticated', 'AUTH_REQUIRED_FOR_SECRETARY_PUSH');
      }

      // ⚠️ عزل الفروع على نفس المتصفح:
      //   نقرأ الخريطة الحالية `tokensByBranch` ونزيل الـ token من أي فرع آخر
      //   قبل إضافته للفرع الحالي. بدون هذا، لو سكرتيرة سجلت دخول على فرع A
      //   ثم دخلت فرع B على نفس المتصفح، نفس الـ token يبقى في كل من A و B،
      //   والإشعار المخصص لـ A يصل للجهاز الذي يعرض B → تسريب إشعارات.
      const tokenDocRef = db.doc(`secretaryFcmTokens/${secret}`);
      const tokenDocSnap = await tokenDocRef.get().catch(() => null);
      const existingTokensByBranch =
        tokenDocSnap?.exists &&
        tokenDocSnap.data()?.tokensByBranch &&
        typeof tokenDocSnap.data().tokensByBranch === 'object'
          ? tokenDocSnap.data().tokensByBranch
          : {};

      // بناء payload يزيل الـ token من فروع سابقة (غير الفرع الحالي)
      const writePayload = {
        ...basePayload,
        [`tokensByBranch.${branchId}`]: admin.firestore.FieldValue.arrayUnion(token),
        [`tokensByBranchUpdatedAt.${branchId}`]: updatedAtIso,
        ...(userId ? { userId } : {}),
      };

      Object.keys(existingTokensByBranch).forEach((otherBranchId) => {
        if (otherBranchId === branchId) return;
        const branchTokens = existingTokensByBranch[otherBranchId];
        if (Array.isArray(branchTokens) && branchTokens.includes(token)) {
          writePayload[`tokensByBranch.${otherBranchId}`] = admin.firestore.FieldValue.arrayRemove(token);
        }
      });

      await tokenDocRef.set(writePayload, { merge: true });

      let removedDoctorDocsCount = 0;
      if (userId) {
        removedDoctorDocsCount = (
          await Promise.all([
            removeTokenFromCollection('users', token),
          ])
        ).reduce((sum, count) => sum + Number(count || 0), 0);
      }
      console.log('[registerPushToken] secretary token saved', {
        secret,
        branchId,
        userId: userId || null,
        tokenHint,
        tokenLength: token.length,
        removedDoctorDocsCount,
      });

      const topicSync = await syncTokenRoleTopics(token, 'secretary');

      return {
        ok: true,
        role: 'secretary',
        secret,
        branchId,
        userId: userId || null,
        topicSyncOk: Boolean(topicSync?.ok),
      };
    }

    const authUid = String(request?.auth?.uid || '').trim();
    if (!authUid) {
      throw new HttpsError('unauthenticated', 'Authentication is required');
    }

    await db.doc(`users/${authUid}`).set({ ...basePayload, authRole: 'doctor', userRole: 'doctor' }, { merge: true });
    const removedSecretaryDocsCount = (
      await Promise.all([
        removeTokenFromCollection('secretaryFcmTokens', token),
        removeTokenFromCollection('users', token, authUid),
      ])
    ).reduce((sum, count) => sum + Number(count || 0), 0);
    console.log('[registerPushToken] doctor token saved', {
      userId: authUid,
      tokenHint,
      tokenLength: token.length,
      removedSecretaryDocsCount,
    });

    const topicSync = await syncTokenRoleTopics(token, 'doctor');

    return {
      ok: true,
      role: 'doctor',
      userId: authUid,
      topicSyncOk: Boolean(topicSync?.ok),
    };
  };

  

  return registerPushToken;
};
