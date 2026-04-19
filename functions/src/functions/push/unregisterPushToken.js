module.exports = (context) => {
  const {
    HttpsError,
    getDb,
    removeTokenFromCollection,
    clearTokenRoleTopics,
  } = context;

  const unregisterPushToken = async (request) => {
    const role = String(request?.data?.role || 'doctor').trim().toLowerCase();
    const token = String(request?.data?.token || '').trim();
    if (!token) {
      throw new HttpsError('invalid-argument', 'TOKEN_REQUIRED');
    }
    if (token.length < 20 || token.length > 4096) {
      throw new HttpsError('invalid-argument', 'INVALID_TOKEN_FORMAT');
    }

    if (role === 'public') {
      const authUid = String(request?.auth?.uid || '').trim();
      if (!authUid) {
        throw new HttpsError('unauthenticated', 'AUTH_REQUIRED_FOR_PUBLIC_PUSH');
      }
      const userId = String(request?.data?.userId || '').trim() || authUid;
      if (userId !== authUid) {
        throw new HttpsError('permission-denied', 'USER_MISMATCH');
      }

        const removedPublicDocsCount = await removeTokenFromCollection('users', token);

      console.log('[unregisterPushToken] public token removed', {
        userId: authUid,
        removedPublicDocsCount,
        tokenHint: token.slice(-10),
      });

      const topicCleanup = await clearTokenRoleTopics(token);

      return {
        ok: true,
        role: 'public',
        userId: authUid,
        removedPublicDocsCount,
        topicCleanupOk: Boolean(topicCleanup?.ok),
      };
    }

    if (role === 'secretary') {
      const secret = String(request?.data?.secret || '').trim();
      if (!secret) {
        throw new HttpsError('invalid-argument', 'SECRET_REQUIRED');
      }

      const db = getDb();
      const configSnap = await db.doc(`bookingConfig/${secret}`).get().catch(() => null);
      if (!configSnap?.exists) {
        throw new HttpsError('not-found', 'BOOKING_CONFIG_NOT_FOUND');
      }

      const removedSecretaryDocsCount = await removeTokenFromCollection('secretaryFcmTokens', token);
      console.log('[unregisterPushToken] secretary token removed', {
        secret,
        removedSecretaryDocsCount,
        tokenHint: token.slice(-10),
      });

      const topicCleanup = await clearTokenRoleTopics(token);

      return {
        ok: true,
        role: 'secretary',
        secret,
        removedSecretaryDocsCount,
        topicCleanupOk: Boolean(topicCleanup?.ok),
      };
    }

    const authUid = String(request?.auth?.uid || '').trim();
    if (!authUid) {
      throw new HttpsError('unauthenticated', 'Authentication is required');
    }
    const userId = String(request?.data?.userId || '').trim() || authUid;
    if (userId !== authUid) {
      throw new HttpsError('permission-denied', 'USER_MISMATCH');
    }

      const removedDoctorDocsCount = await removeTokenFromCollection('users', token);

    console.log('[unregisterPushToken] doctor token removed', {
      userId: authUid,
      removedDoctorDocsCount,
      tokenHint: token.slice(-10),
    });

    const topicCleanup = await clearTokenRoleTopics(token);

    return {
      ok: true,
      role: 'doctor',
      userId: authUid,
      removedDoctorDocsCount,
      topicCleanupOk: Boolean(topicCleanup?.ok),
    };
  };

  

  return unregisterPushToken;
};
