
const { ROLE_TOPICS, ALL_ROLE_TOPICS } = require('./fcmTopics');

const createFcmHelpers = ({ admin, getDb }) => {
  const normalizeFcmTokens = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((token) => String(token || '').trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      const token = value.trim();
      return token ? [token] : [];
    }
    return [];
  };

  
  const getFcmTokensFromDoc = (data) => {
    const tokens = new Set([
      ...normalizeFcmTokens(data?.fcmTokens),
      ...normalizeFcmTokens(data?.fcmToken),
    ]);
    return Array.from(tokens).slice(0, 500);
  };

  
  const loadDoctorFcmTokens = async (userId) => {
    if (!userId) return [];
    const db = getDb();
    const userSnap = await db.doc(`users/${userId}`).get().catch(() => null);

    const merged = new Set([
      ...getFcmTokensFromDoc(userSnap?.exists ? userSnap.data() : {}),
    ]);
    return Array.from(merged).slice(0, 500);
  };

  
  const resolveDoctorUserIdsByEmail = async (doctorEmail) => {
    const db = getDb();
    const userIds = new Set();
    const normalizedDoctorEmail = String(doctorEmail || '').trim().toLowerCase();
    if (normalizedDoctorEmail) {
      const lookups = [
        db.collection('users').where('doctorEmail', '==', normalizedDoctorEmail).limit(5).get().catch(() => null),
        db.collection('users').where('email', '==', normalizedDoctorEmail).limit(5).get().catch(() => null),
      ];
      const snapshots = await Promise.all(lookups);
      snapshots.forEach((snap) => {
        if (!snap) return;
        snap.forEach((doc) => userIds.add(String(doc.id || '').trim()));
      });

      try {
        const authUser = await admin.auth().getUserByEmail(normalizedDoctorEmail);
        if (authUser?.uid) {
          userIds.add(String(authUser.uid || '').trim());
        }
      } catch (error) {
        const code = String(error?.code || '');
        if (code !== 'auth/user-not-found') {
          console.warn('[resolveDoctorUserIdsByEmail] getUserByEmail lookup failed:', {
            doctorEmail: normalizedDoctorEmail,
            code,
            message: String(error?.message || ''),
          });
        }
      }
    }
    return Array.from(userIds).map((id) => id.trim()).filter(Boolean).slice(0, 20);
  };

  
  const resolveDoctorCandidateUserIds = async ({ secret, preferredUserId, doctorEmail }) => {
    const db = getDb();
    const userIds = new Set();

    const normalizedPreferredUserId = String(preferredUserId || '').trim();
    if (normalizedPreferredUserId) {
      userIds.add(normalizedPreferredUserId);
    }

    const normalizedSecret = String(secret || '').trim();
    if (normalizedSecret) {
      try {
        const usersBySecret = await db.collection('users').where('bookingSecret', '==', normalizedSecret).limit(10).get();
        usersBySecret.forEach((doc) => userIds.add(String(doc.id || '').trim()));
      } catch {
      }
    }

    const byEmail = await resolveDoctorUserIdsByEmail(doctorEmail);
    byEmail.forEach((id) => userIds.add(id));

    return Array.from(userIds).map((id) => id.trim()).filter(Boolean).slice(0, 20);
  };

  const loadDoctorFcmTokensForCandidates = async (candidateUserIds) => {
    if (!Array.isArray(candidateUserIds) || candidateUserIds.length === 0) return [];
    const tokenSet = new Set();
    for (const userId of candidateUserIds) {
      const tokens = await loadDoctorFcmTokens(String(userId || '').trim());
      tokens.forEach((token) => tokenSet.add(token));
    }
    return Array.from(tokenSet).slice(0, 500);
  };

  
  const resolveDoctorCandidatesForAppointment = async ({ eventUserId, appointmentData }) => {
    const db = getDb();
    const data = appointmentData || {};
    const candidateUserIds = new Set();

    const normalizedEventUserId = String(eventUserId || '').trim();
    if (normalizedEventUserId) {
      candidateUserIds.add(normalizedEventUserId);
    }

    const normalizedDoctorId = String(data?.doctorId || '').trim();
    if (normalizedDoctorId) {
      candidateUserIds.add(normalizedDoctorId);
    }

    const normalizedBookingSecret = String(data?.bookingSecret || '').trim();
    if (normalizedBookingSecret) {
      try {
        const usersBySecret = await db.collection('users').where('bookingSecret', '==', normalizedBookingSecret).limit(10).get();
        usersBySecret.forEach((doc) => candidateUserIds.add(String(doc.id || '').trim()));
      } catch (error) {
        console.warn('[resolveDoctorCandidatesForAppointment] users by bookingSecret lookup failed:', error);
      }
    }

    const normalizedPublicSecret = String(data?.publicBookingSecret || '').trim();
    if (normalizedPublicSecret) {
      try {
        const usersByPublicSecret = await db.collection('users').where('publicBookingSecret', '==', normalizedPublicSecret).limit(10).get();
        usersByPublicSecret.forEach((doc) => candidateUserIds.add(String(doc.id || '').trim()));
      } catch (error) {
        console.warn('[resolveDoctorCandidatesForAppointment] users by publicBookingSecret lookup failed:', error);
      }
    }

    const ownerDoc = normalizedEventUserId
      ? await db.doc(`users/${normalizedEventUserId}`).get().catch(() => null)
      : null;
    const ownerDoctorEmail = ownerDoc?.exists ? String(ownerDoc.data()?.doctorEmail || '').trim().toLowerCase() : '';
    const payloadDoctorEmail = String(data?.doctorEmail || '').trim().toLowerCase();
    const emailCandidates = new Set([ownerDoctorEmail, payloadDoctorEmail].filter(Boolean));
    for (const email of emailCandidates) {
      const byEmail = await resolveDoctorUserIdsByEmail(email);
      byEmail.forEach((id) => candidateUserIds.add(id));
    }

    return Array.from(candidateUserIds).map((id) => id.trim()).filter(Boolean).slice(0, 30);
  };

  const logMulticastResult = (label, response, tokens) => {
    const maskTokenForLogs = (token) => {
      const value = String(token || '').trim();
      if (!value) return '';
      if (value.length <= 10) return `${value.slice(0, 2)}***${value.slice(-2)}`;
      return `${value.slice(0, 6)}***${value.slice(-6)}`;
    };
    const successCount = Number(response?.successCount || 0);
    const failureCount = Number(response?.failureCount || 0);
    console.log(`[${label}] multicast result`, {
      tokenCount: tokens.length,
      successCount,
      failureCount,
    });
    if (!failureCount || !Array.isArray(response?.responses)) return;
    response.responses.forEach((item, index) => {
      if (!item?.success) {
        const errorCode = item?.error?.code || 'unknown';
        const errorMessage = item?.error?.message || '';
        console.warn(`[${label}] token failed`, {
          token: maskTokenForLogs(tokens[index]),
          errorCode,
          errorMessage,
        });
      }
    });
  };

  
  const getInvalidFcmTokensFromResponse = (response, tokens) => {
    if (!Array.isArray(response?.responses) || !Array.isArray(tokens)) return [];
    const invalidCodes = new Set([
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token',
    ]);
    return response.responses
      .map((item, index) => {
        if (item?.success) return '';
        const code = String(item?.error?.code || '');
        return invalidCodes.has(code) ? String(tokens[index] || '').trim() : '';
      })
      .filter(Boolean);
  };

  
  const removeTokenFromCollection = async (collectionName, token, exceptDocId = '') => {
    const db = getDb();
    const normalizedToken = String(token || '').trim();
    if (!collectionName || !normalizedToken) return 0;

    try {
      const collectionRef = db.collection(collectionName);
      const [arraySnap, singleSnap] = await Promise.all([
        collectionRef.where('fcmTokens', 'array-contains', normalizedToken).limit(50).get().catch(() => null),
        collectionRef.where('fcmToken', '==', normalizedToken).limit(50).get().catch(() => null),
      ]);

      const docsMap = new Map();
      [arraySnap, singleSnap].forEach((snap) => {
        if (!snap) return;
        snap.forEach((docSnap) => {
          const docId = String(docSnap.id || '').trim();
          if (!docId || (exceptDocId && docId === exceptDocId)) return;
          docsMap.set(docId, docSnap);
        });
      });

      if (docsMap.size === 0) return 0;

      const nowIso = new Date().toISOString();
      await Promise.all(
        Array.from(docsMap.values()).map((docSnap) => {
          const payload = {
            fcmTokens: admin.firestore.FieldValue.arrayRemove(normalizedToken),
            updatedAt: nowIso,
          };
          const currentSingleToken = String(docSnap.data()?.fcmToken || '').trim();
          if (currentSingleToken && currentSingleToken === normalizedToken) {
            payload.fcmToken = admin.firestore.FieldValue.delete();
          }
          return docSnap.ref.set(payload, { merge: true });
        })
      );

      return docsMap.size;
    } catch {
      return 0;
    }
  };

  
  const cleanupInvalidDoctorTokens = async (userId, invalidTokens) => {
    if (!userId || !Array.isArray(invalidTokens) || invalidTokens.length === 0) return;
    try {
      const db = getDb();
      const userRef = db.doc(`users/${userId}`);
      const userSnap = await userRef.get().catch(() => null);

      const updates = [];
      if (userSnap?.exists) {
        const payload = {
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
        };
        const currentSingleToken = String(userSnap.data()?.fcmToken || '').trim();
        if (currentSingleToken && invalidTokens.includes(currentSingleToken)) {
          payload.fcmToken = admin.firestore.FieldValue.delete();
        }
        updates.push(userRef.set(payload, { merge: true }));
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }
      console.log('[FCM] cleaned invalid doctor tokens', {
        userId,
        removedCount: invalidTokens.length,
      });
    } catch (err) {
      console.warn('[FCM] Failed to cleanup invalid doctor tokens:', userId, err?.message || err);
    }
  };

  const cleanupInvalidSecretaryTokens = async (secret, invalidTokens) => {
    if (!secret || !Array.isArray(invalidTokens) || invalidTokens.length === 0) return;
    try {
      const tokenRef = getDb().doc(`secretaryFcmTokens/${secret}`);
      const tokenSnap = await tokenRef.get();
      if (!tokenSnap.exists) return;

      const payload = {
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
      };
      const currentSingleToken = String(tokenSnap.data()?.fcmToken || '').trim();
      if (currentSingleToken && invalidTokens.includes(currentSingleToken)) {
        payload.fcmToken = admin.firestore.FieldValue.delete();
      }
      await tokenRef.set(payload, { merge: true });
      console.log('[FCM] cleaned invalid secretary tokens', {
        secret,
        removedCount: invalidTokens.length,
      });
    } catch (err) {
      console.warn('[FCM] Failed to cleanup invalid secretary tokens:', secret, err?.message || err);
    }
  };

  const subscribeTokenToTopic = async (token, topic) => {
    const normalizedToken = String(token || '').trim();
    const normalizedTopic = String(topic || '').trim();
    if (!normalizedToken || !normalizedTopic) return { ok: false };

    try {
      await admin.messaging().subscribeToTopic([normalizedToken], normalizedTopic);
      return { ok: true };
    } catch (error) {
      console.warn('[FCM] subscribeToTopic failed:', {
        topic: normalizedTopic,
        error: String(error?.message || error || ''),
      });
      return { ok: false };
    }
  };

  const unsubscribeTokenFromTopic = async (token, topic) => {
    const normalizedToken = String(token || '').trim();
    const normalizedTopic = String(topic || '').trim();
    if (!normalizedToken || !normalizedTopic) return { ok: false };

    try {
      await admin.messaging().unsubscribeFromTopic([normalizedToken], normalizedTopic);
      return { ok: true };
    } catch (error) {
      console.warn('[FCM] unsubscribeFromTopic failed:', {
        topic: normalizedTopic,
        error: String(error?.message || error || ''),
      });
      return { ok: false };
    }
  };

  const clearTokenRoleTopics = async (token) => {
    const normalizedToken = String(token || '').trim();
    if (!normalizedToken) {
      return {
        ok: false,
        clearedTopics: 0,
      };
    }

    const results = await Promise.all(
      ALL_ROLE_TOPICS.map((topic) => unsubscribeTokenFromTopic(normalizedToken, topic))
    );

    const clearedTopics = results.filter((item) => item.ok).length;
    return {
      ok: true,
      clearedTopics,
    };
  };

  const syncTokenRoleTopics = async (token, role) => {
    const normalizedToken = String(token || '').trim();
    const normalizedRole = String(role || '').trim().toLowerCase();
    const targetTopic = ROLE_TOPICS[normalizedRole];

    if (!normalizedToken || !targetTopic) {
      return {
        ok: false,
        role: normalizedRole,
        topic: String(targetTopic || ''),
      };
    }

    await clearTokenRoleTopics(normalizedToken);
    const subscribeResult = await subscribeTokenToTopic(normalizedToken, targetTopic);

    return {
      ok: subscribeResult.ok,
      role: normalizedRole,
      topic: targetTopic,
    };
  };

  return {
    getFcmTokensFromDoc,
    loadDoctorFcmTokens,
    resolveDoctorUserIdsByEmail,
    resolveDoctorCandidateUserIds,
    loadDoctorFcmTokensForCandidates,
    resolveDoctorCandidatesForAppointment,
    logMulticastResult,
    getInvalidFcmTokensFromResponse,
    removeTokenFromCollection,
    cleanupInvalidDoctorTokens,
    cleanupInvalidSecretaryTokens,
    clearTokenRoleTopics,
    syncTokenRoleTopics,
  };
};

module.exports = { createFcmHelpers };
