/**
 * publicAccountFunctions — إدارة حسابات الجمهور (Public Users) عبر Admin SDK.
 *
 * يوفّر دالتين:
 *   1) setPublicAccountDisabled: تعطيل/تفعيل ذري على Firestore + Firebase Auth + إبطال tokens.
 *   2) deletePublicAccount: حذف كامل (Auth + Firestore doc + subcollections) + إضافة للـ blacklist.
 *
 * موازي تماماً لدوال الأطباء (setDoctorAccountDisabled / deleteDoctorAccount).
 */

module.exports = (context) => {
  const {
    HttpsError,
    assertAdminRequest,
    getDb,
    admin,
  } = context;

  const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

  /**
   * حذف subcollection صغيرة تحت وثيقة مستخدم.
   * يحذف حتى 500 وثيقة لكل batch، ويدور حتى الإفراغ.
   */
  const deleteSubcollection = async ({ db, userId, subName }) => {
    let totalDeleted = 0;
    while (true) {
      const snap = await db.collection('users').doc(userId).collection(subName).limit(500).get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
      totalDeleted += snap.size;
      if (snap.size < 500) break;
    }
    return totalDeleted;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // setPublicAccountDisabled
  // ═══════════════════════════════════════════════════════════════════════════
  const setPublicAccountDisabled = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const userId = String(request?.data?.userId || '').trim();
    const disabled = Boolean(request?.data?.disabled);
    const reason = String(request?.data?.reason || '').trim().slice(0, 500);

    if (!userId) {
      throw new HttpsError('invalid-argument', 'معرف المستخدم مطلوب');
    }
    if (disabled && !reason) {
      throw new HttpsError('invalid-argument', 'سبب التعطيل مطلوب');
    }

    const db = getDb();
    const userRef = db.collection('users').doc(userId);

    // حماية إضافية: منع تعطيل أدمن عن طريق الخطأ.
    try {
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const targetEmail = normalizeEmail(userSnap.data()?.email || userSnap.data()?.doctorEmail);
        if (targetEmail) {
          const adminByEmail = await db.collection('admins').doc(targetEmail).get();
          if (adminByEmail.exists) {
            throw new HttpsError('permission-denied', 'لا يمكن تعطيل حساب أدمن عبر هذه الدالة');
          }
        }
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.warn('[setPublicAccountDisabled] admin check warning:', err?.message || err);
    }

    const nowIso = new Date().toISOString();

    // 1. Firebase Auth: يرفض الدخول الجديد فوراً.
    try {
      await admin.auth().updateUser(userId, { disabled });
    } catch (authErr) {
      if (authErr?.code !== 'auth/user-not-found') {
        throw new HttpsError('internal', `فشل تحديث Firebase Auth: ${authErr.message}`);
      }
      console.warn(`[setPublicAccountDisabled] Auth user not found: ${userId}`);
    }

    // 2. إبطال جلسات نشطة عند التعطيل.
    if (disabled) {
      try {
        await admin.auth().revokeRefreshTokens(userId);
      } catch (revokeErr) {
        if (revokeErr?.code !== 'auth/user-not-found') {
          console.warn('[setPublicAccountDisabled] revokeRefreshTokens failed:', revokeErr?.message || revokeErr);
        }
      }
    }

    // 3. Firestore: يُظهر الحساب في قوائم الإدارة.
    const payload = disabled
      ? {
          isAccountDisabled: true,
          disabledReason: reason,
          disabledAt: nowIso,
          disabledBy: adminEmail,
          updatedAt: nowIso,
        }
      : {
          isAccountDisabled: false,
          disabledReason: '',
          disabledAt: '',
          enabledBy: adminEmail,
          enabledAt: nowIso,
          updatedAt: nowIso,
        };

    try {
      await userRef.set(payload, { merge: true });
    } catch (firestoreErr) {
      console.error('[setPublicAccountDisabled] Firestore failed:', firestoreErr?.message || firestoreErr);
      throw new HttpsError('internal', `فشل تحديث Firestore: ${firestoreErr.message}`);
    }

    return {
      userId,
      disabled,
      reason: disabled ? reason : '',
      actor: adminEmail,
      timestamp: nowIso,
    };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // deletePublicAccount — حذف كامل + subcollections + blacklist
  // ═══════════════════════════════════════════════════════════════════════════
  const deletePublicAccount = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const userId = String(request?.data?.userId || '').trim();
    const deleteReason = String(request?.data?.deleteReason || '').trim().slice(0, 500);

    if (!userId) {
      throw new HttpsError('invalid-argument', 'معرف المستخدم مطلوب');
    }

    const db = getDb();
    const userRef = db.collection('users').doc(userId);
    const nowIso = new Date().toISOString();

    // جلب بيانات المستخدم قبل الحذف لاستخراج البريد.
    let userEmail = '';
    let userName = '';
    try {
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const data = userSnap.data() || {};
        userEmail = normalizeEmail(data.email || data.doctorEmail || data.publicEmail);
        userName = String(data.displayName || data.name || data.doctorName || 'مستخدم جمهور');

        // حماية: منع حذف أدمن.
        if (userEmail) {
          const adminByEmail = await db.collection('admins').doc(userEmail).get();
          if (adminByEmail.exists) {
            throw new HttpsError('permission-denied', 'لا يمكن حذف حساب أدمن عبر هذه الدالة');
          }
        }
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.warn('[deletePublicAccount] pre-read warning:', err?.message || err);
    }

    // 1. إضافة للـ blacklist (قبل الحذف حتى لا نفقد الإيميل).
    if (userEmail) {
      try {
        await db.collection('publicBlacklistedEmails').doc(userEmail).set(
          {
            email: userEmail,
            publicUserId: userId,
            publicUserName: userName,
            reason: deleteReason || 'تم حذف الحساب بواسطة الإدارة',
            blockedAt: nowIso,
            blockedBy: adminEmail,
            isBlocked: true,
            updatedAt: nowIso,
          },
          { merge: true },
        );
      } catch (blacklistErr) {
        console.warn('[deletePublicAccount] blacklist write failed:', blacklistErr?.message || blacklistErr);
      }
    }

    // 2. حذف حساب Firebase Auth.
    try {
      await admin.auth().deleteUser(userId);
    } catch (authErr) {
      if (authErr?.code !== 'auth/user-not-found') {
        console.warn('[deletePublicAccount] Auth delete warning:', authErr?.message || authErr);
      }
    }

    // 3. حذف subcollections المعروفة (bookings + reviews + notifications + وغيرها).
    const subcollectionsToClean = [
      'publicBookings',
      'bookings',
      'reviews',
      'notifications',
      'appointments',
      'dismissedBroadcasts',
      'settings',
    ];
    const deletedCounts = {};
    await Promise.all(
      subcollectionsToClean.map(async (subName) => {
        try {
          deletedCounts[subName] = await deleteSubcollection({ db, userId, subName });
        } catch (subErr) {
          console.warn(`[deletePublicAccount] subcollection ${subName} cleanup failed:`, subErr?.message || subErr);
          deletedCounts[subName] = 0;
        }
      }),
    );

    // 4. حذف وثيقة المستخدم نفسها.
    try {
      await userRef.delete();
    } catch (deleteErr) {
      console.error('[deletePublicAccount] doc delete failed:', deleteErr?.message || deleteErr);
      throw new HttpsError('internal', `فشل حذف وثيقة المستخدم: ${deleteErr.message}`);
    }

    return {
      userId,
      email: userEmail,
      deletedSubcollections: deletedCounts,
      blacklisted: Boolean(userEmail),
      actor: adminEmail,
      timestamp: nowIso,
    };
  };

  return {
    setPublicAccountDisabled,
    deletePublicAccount,
  };
};
