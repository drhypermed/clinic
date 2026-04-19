
const createAdminCore = ({ admin, HttpsError }) => {
  const ROOT_ADMIN_EMAIL = String(process.env.ROOT_ADMIN_EMAIL || '').trim().toLowerCase();
  const ROOT_ADMIN_UID = String(process.env.ROOT_ADMIN_UID || '').trim();

  let dbInstance = null;
  
  const getDb = () => {
    if (!dbInstance) {
      dbInstance = admin.firestore();
    }
    return dbInstance;
  };

  const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

  
  const resolveCallableAuth = async (request) => {
    const requestAuth = request?.auth || null;
    let uid = String(requestAuth?.uid || '').trim();
    let email = normalizeEmail(requestAuth?.token?.email);

    if (uid && email) {
      return { uid, email };
    }

    // Fallback: verify Authorization bearer token manually when callable auth payload is missing.
    const authHeader = String(request?.rawRequest?.headers?.authorization || '').trim();
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!bearerMatch) {
      return { uid, email };
    }

    try {
      const decoded = await admin.auth().verifyIdToken(bearerMatch[1], true);
      uid = uid || String(decoded?.uid || '').trim();
      email = email || normalizeEmail(decoded?.email);
    } catch (error) {
      console.warn('[adminCore] Bearer auth fallback failed:', error?.message || error);
    }

    return { uid, email };
  };

  
  const assertAdminRequest = async (request) => {
    const { uid, email } = await resolveCallableAuth(request);
    if (!uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    if (uid === ROOT_ADMIN_UID) {
      return email || 'root-admin';
    }

    if (ROOT_ADMIN_EMAIL && email === ROOT_ADMIN_EMAIL) {
      return email;
    }

    if (!email) {
      throw new HttpsError('permission-denied', 'Admin email is required');
    }

    const adminDoc = await getDb().collection('admins').doc(email).get();
    if (!adminDoc.exists) {
      throw new HttpsError('permission-denied', 'Admin privileges are required');
    }

    return email;
  };

  
  const deleteQueryBatch = async (query, label) => {
    let deleted = 0;
    while (true) {
      const snap = await query.limit(500).get();
      if (snap.empty) break;
      const batch = getDb().batch();
      snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
      deleted += snap.size;
    }
    console.log(`[cleanup] Deleted ${deleted} ${label}.`);
    return deleted;
  };

  
  const deleteExpiredSlotsByScan = async (nowMs) => {
    const db = getDb();
    const configsSnap = await db.collection('publicBookingConfig').get();
    let deleted = 0;
    for (const configDoc of configsSnap.docs) {
      const slotsRef = db.collection('publicBookingConfig').doc(configDoc.id).collection('slots');
      const slotsSnap = await slotsRef.get();
      let batch = db.batch();
      let batchCount = 0;
      for (const slot of slotsSnap.docs) {
        const dateTime = slot.data()?.dateTime;
        const t = dateTime && typeof dateTime.toDate === 'function'
          ? dateTime.toDate().getTime()
          : new Date(dateTime).getTime();
        if (!Number.isFinite(t) || t < nowMs) {
          batch.delete(slot.ref);
          batchCount += 1;
          deleted += 1;
          if (batchCount >= 400) {
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        }
      }
      if (batchCount > 0) await batch.commit();
    }
    console.log(`[cleanup] Deleted ${deleted} public slots (scan).`);
    return deleted;
  };

  return {
    getDb,
    assertAdminRequest,
    deleteQueryBatch,
    deleteExpiredSlotsByScan,
  };
};

module.exports = { createAdminCore };
