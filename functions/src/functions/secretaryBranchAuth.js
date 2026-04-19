/**
 * Helpers لكلمات سر السكرتارية per-branch.
 * كل فرع له مستند منفصل في subcollection: secretaryAuth/{secret}/branches/{branchId}
 * الفرع الرئيسي (main) يستخدم المستند الأساسي (legacy path) للتوافقية.
 */

const DEFAULT_BRANCH_ID = 'main';
const SECRETARY_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const normalizeText = (v) => String(v == null ? '' : v).trim();
const timestampToMs = (value) =>
  value && typeof value.toMillis === 'function' ? value.toMillis() : 0;

/**
 * قراءة بيانات المصادقة لفرع فرعي (non-main).
 * يُرجع { ref, exists, passwordHash, sessionToken, sessionTokenUpdatedAtMs } أو null للـ main.
 */
const readBranchAuthData = async ({ db, secret, branchId }) => {
  if (!branchId || branchId === DEFAULT_BRANCH_ID) return null;
  const ref = db.collection('secretaryAuth').doc(secret).collection('branches').doc(branchId);
  const snap = await ref.get();
  if (!snap.exists) return { ref, exists: false, passwordHash: '', sessionToken: '', sessionTokenUpdatedAtMs: 0 };
  const data = snap.data() || {};
  return {
    ref,
    exists: true,
    passwordHash: typeof data.passwordHash === 'string' ? normalizeText(data.passwordHash) : '',
    sessionToken: typeof data.sessionToken === 'string' ? normalizeText(data.sessionToken) : '',
    sessionTokenUpdatedAtMs: timestampToMs(data.sessionTokenUpdatedAt),
  };
};

/**
 * قراءة قائمة branch IDs للدكتور (غير الفرع الرئيسي).
 */
const readDoctorBranchIds = async ({ db, userId }) => {
  try {
    const snap = await db.collection('users').doc(userId).collection('branches').get();
    return snap.docs.map((d) => d.id).filter((id) => id && id !== DEFAULT_BRANCH_ID);
  } catch {
    return [];
  }
};

/**
 * التحقق من صلاحية session لفرع معين.
 * - lو branchId = main (أو undefined): يستخدم assertSecretarySessionIfRequired التقليدية.
 * - لو branchId غير main: يقرأ session من subcollection ويتحقق.
 */
const assertSecretarySessionForBranch = async ({
  db,
  secret,
  mainAuth,
  branchId,
  sessionToken,
  HttpsError,
  legacyAssertFn,
}) => {
  const normalizedBranch = branchId && branchId !== DEFAULT_BRANCH_ID ? branchId : DEFAULT_BRANCH_ID;

  if (normalizedBranch === DEFAULT_BRANCH_ID) {
    legacyAssertFn({ auth: mainAuth, sessionToken, HttpsError });
    return;
  }

  const branchAuth = await readBranchAuthData({ db, secret, branchId: normalizedBranch });
  if (!branchAuth || !branchAuth.passwordHash) {
    throw new HttpsError('unauthenticated', 'BRANCH_AUTH_NOT_SET');
  }
  if (!sessionToken || branchAuth.sessionToken !== sessionToken) {
    throw new HttpsError('unauthenticated', 'INVALID_SESSION_TOKEN');
  }
  if (
    !branchAuth.sessionTokenUpdatedAtMs ||
    (Date.now() - branchAuth.sessionTokenUpdatedAtMs) > SECRETARY_SESSION_MAX_AGE_MS
  ) {
    throw new HttpsError('unauthenticated', 'SECRETARY_SESSION_EXPIRED');
  }
};

/**
 * محاولة login على الفرع الرئيسي والفروع الفرعية لإيجاد كلمة سر مطابقة.
 *
 * ⚠️ **Ambiguity Protection:** لو أكثر من فرع عنده نفس كلمة السر (misconfig عرضي
 * من الطبيب)، الدالة ترفض وترمي خطأ `AMBIGUOUS_PASSWORD_MATCHES_MULTIPLE_BRANCHES`
 * — ما لم يُمرَّر `preferredBranchId` الذي يحدد الفرع المقصود. هذا يمنع سقوط عزل
 * الفروع بصمت: السكرتيرة تدخل على main بينما تقصد branch2 مثلاً.
 *
 * يُرجع `{ matchedBranchId, sessionToken, usedMainPath }` أو null لو ما فيش تطابق.
 * ينفذ ترقية hash تلقائية + تحديث session token في الـ storage.
 */
const tryMatchSecretaryPasswordAcrossBranches = async ({
  db, admin, auth, secret, userId, secretaryPassword, resolvedDoctorEmail,
  verifyPassword, hashPassword, generateSessionToken, nowMs, nowTs, HttpsError,
  preferredBranchId,
}) => {
  // جمع **كل** الفروع التي تطابق كلمة السر (بدلاً من أول واحد)
  const matches = [];

  // فرع رئيسي
  if (auth.secretaryPasswordHash && verifyPassword(secretaryPassword, auth.secretaryPasswordHash)) {
    matches.push({ branchId: DEFAULT_BRANCH_ID, kind: 'main', auth });
  }

  // فروع فرعية
  const branchIds = await readDoctorBranchIds({ db, userId });
  for (const branchId of branchIds) {
    const branchAuth = await readBranchAuthData({ db, secret, branchId });
    if (!branchAuth || !branchAuth.passwordHash) continue;
    if (!verifyPassword(secretaryPassword, branchAuth.passwordHash)) continue;
    matches.push({ branchId, kind: 'branch', branchAuth });
  }

  if (matches.length === 0) return null;

  // اختيار الفرع المطابق:
  //   - لو واحد فقط → نستخدمه
  //   - لو أكثر + preferredBranchId مُمرَّر → نستخدم المفضّل لو موجود، وإلا نرفض
  //   - لو أكثر بدون preferredBranchId → نرفض لمنع اختيار خاطئ صامت
  let selected = null;
  if (matches.length === 1) {
    selected = matches[0];
  } else {
    const normalizedPreferred = String(preferredBranchId || '').trim();
    if (normalizedPreferred) {
      selected = matches.find((m) => m.branchId === normalizedPreferred) || null;
    }
    if (!selected) {
      // رفض صريح — المسؤولية على الطبيب ليغير كلمات السر المتطابقة،
      // أو على الـ UI يمرر preferredBranchId واضح.
      if (HttpsError) {
        throw new HttpsError('failed-precondition', 'AMBIGUOUS_PASSWORD_MATCHES_MULTIPLE_BRANCHES');
      }
      throw new Error('AMBIGUOUS_PASSWORD_MATCHES_MULTIPLE_BRANCHES');
    }
  }

  // تنفيذ الـ login للفرع المختار
  if (selected.kind === 'main') {
    const selectedAuth = selected.auth;
    // ترقية hash قديم → PBKDF2
    if (selectedAuth.secretaryPasswordHash.startsWith('dh_')) {
      await selectedAuth.authRef.set({ secretaryPasswordHash: hashPassword(secretaryPassword), updatedAt: nowTs }, { merge: true });
    }

    const hasFreshSession =
      Boolean(selectedAuth.secretarySessionToken) &&
      selectedAuth.secretarySessionTokenUpdatedAtMs > 0 &&
      (nowMs - selectedAuth.secretarySessionTokenUpdatedAtMs) <= 30 * 24 * 60 * 60 * 1000;
    const sessionToken = hasFreshSession ? selectedAuth.secretarySessionToken : generateSessionToken();

    if (!hasFreshSession) {
      await selectedAuth.authRef.set({
        userId,
        doctorEmail: resolvedDoctorEmail || admin.firestore.FieldValue.delete(),
        secretarySessionToken: sessionToken,
        secretarySessionTokenUpdatedAt: nowTs,
        updatedAt: nowTs,
      }, { merge: true });
    }
    return { matchedBranchId: DEFAULT_BRANCH_ID, sessionToken, usedMainPath: true };
  }

  // فرع فرعي
  const selectedBranchAuth = selected.branchAuth;
  if (selectedBranchAuth.passwordHash.startsWith('dh_')) {
    await selectedBranchAuth.ref.set({ passwordHash: hashPassword(secretaryPassword), updatedAt: nowTs }, { merge: true });
  }

  const hasFreshBranchSession =
    Boolean(selectedBranchAuth.sessionToken) &&
    selectedBranchAuth.sessionTokenUpdatedAtMs > 0 &&
    (nowMs - selectedBranchAuth.sessionTokenUpdatedAtMs) <= 30 * 24 * 60 * 60 * 1000;
  const sessionToken = hasFreshBranchSession ? selectedBranchAuth.sessionToken : generateSessionToken();

  if (!hasFreshBranchSession) {
    await selectedBranchAuth.ref.set({ sessionToken, sessionTokenUpdatedAt: nowTs, updatedAt: nowTs }, { merge: true });
  }
  return { matchedBranchId: selected.branchId, sessionToken, usedMainPath: false };
};

/**
 * يتحقق هل الدكتور أصلاً عنده كلمة سر سكرتارية في أي فرع.
 * يُرجع true لو أي فرع (main أو فرعي) عنده passwordHash.
 */
const hasAnySecretaryPassword = async ({ db, auth, secret, userId }) => {
  if (auth.secretaryPasswordHash) return true;
  const branchIds = await readDoctorBranchIds({ db, userId });
  for (const branchId of branchIds) {
    const branchAuth = await readBranchAuthData({ db, secret, branchId });
    if (branchAuth && branchAuth.passwordHash) return true;
  }
  return false;
};

/**
 * يتحقق إن الـ branchId يخص الدكتور (موجود في users/{uid}/branches) أو = main.
 * يحمي ضد stale branchId في session السكرتارية لو الفرع اتحذف.
 */
const assertBranchBelongsToDoctor = async ({ db, userId, branchId, HttpsError }) => {
  if (!branchId || branchId === DEFAULT_BRANCH_ID) return;
  try {
    const snap = await db.collection('users').doc(userId).collection('branches').doc(branchId).get();
    if (!snap.exists) throw new HttpsError('permission-denied', 'INVALID_BRANCH_ID');
  } catch (err) {
    if (err && err.code) throw err; // Re-throw HttpsError
    throw new HttpsError('internal', 'BRANCH_LOOKUP_FAILED');
  }
};

module.exports = {
  DEFAULT_BRANCH_ID,
  readBranchAuthData,
  readDoctorBranchIds,
  assertSecretarySessionForBranch,
  tryMatchSecretaryPasswordAcrossBranches,
  hasAnySecretaryPassword,
  assertBranchBelongsToDoctor,
};
