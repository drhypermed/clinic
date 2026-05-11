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
 *
 * ⚠️ Backwards compatibility: قبل إصلاح 2026-05، كانت كلمات سر الفروع
 * بتنحفظ تحت `secretaryAuth/{branchSecret}/branches/{branchId}` (غلط).
 * الإصلاح الجديد بيحفظها تحت `secretaryAuth/{mainSecret}/branches/{branchId}`.
 * عشان نلاقي البيانات القديمه، لو القراءة من mainSecret فاضية، نحاول
 * نقرأ من branchSecret كـfallback. لو لقينا، نرجّع البيانات (الـrunning
 * code يقدر يعمل migration بعدين).
 */
const readBranchAuthData = async ({ db, secret, branchId, userId }) => {
  if (!branchId || branchId === DEFAULT_BRANCH_ID) return null;
  const ref = db.collection('secretaryAuth').doc(secret).collection('branches').doc(branchId);
  const snap = await ref.get();
  if (snap.exists) {
    const data = snap.data() || {};
    return {
      ref,
      exists: true,
      passwordHash: typeof data.passwordHash === 'string' ? normalizeText(data.passwordHash) : '',
      sessionToken: typeof data.sessionToken === 'string' ? normalizeText(data.sessionToken) : '',
      sessionTokenUpdatedAtMs: timestampToMs(data.sessionTokenUpdatedAt),
    };
  }

  // Fallback: ابحث في الـpath القديم (تحت branchSecret) لو فيه data قديمه
  // محفوظه قبل الإصلاح. لازم userId عشان نقرأ branch secret.
  // 🔒 2026-05-10: نقرا الـ secret من المكان الآمن أولاً (وثيقة المستخدم)،
  //    fallback لوثيقة الفرع للتوافق مع البيانات القديمة.
  if (userId) {
    try {
      let branchSecret = '';
      // المكان الآمن الجديد
      const userSnap = await db.collection('users').doc(userId).get();
      if (userSnap.exists) {
        const userData = userSnap.data() || {};
        const map = userData.bookingSecretByBranch || {};
        branchSecret = normalizeText(map?.[branchId]) || '';
      }
      // Fallback للقديم — وثيقة الفرع
      if (!branchSecret) {
        const branchDoc = await db.collection('users').doc(userId).collection('branches').doc(branchId).get();
        branchSecret = branchDoc.exists
          ? normalizeText(branchDoc.data()?.secretarySecret)
          : '';
      }
      if (branchSecret && branchSecret !== secret) {
        const legacyRef = db.collection('secretaryAuth').doc(branchSecret).collection('branches').doc(branchId);
        const legacySnap = await legacyRef.get();
        if (legacySnap.exists) {
          const legacyData = legacySnap.data() || {};
          return {
            ref, // الـref الجديد (mainSecret) — أي كتابة تروح هناك
            legacyRef, // الـref القديم — للـmigration بعدين
            exists: true,
            passwordHash: typeof legacyData.passwordHash === 'string' ? normalizeText(legacyData.passwordHash) : '',
            sessionToken: typeof legacyData.sessionToken === 'string' ? normalizeText(legacyData.sessionToken) : '',
            sessionTokenUpdatedAtMs: timestampToMs(legacyData.sessionTokenUpdatedAt),
          };
        }
      }
    } catch {
      // لو فشل الـfallback، نكمّل بـempty result
    }
  }

  return { ref, exists: false, passwordHash: '', sessionToken: '', sessionTokenUpdatedAtMs: 0 };
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
    // ⚠️ نمرر userId عشان الـfallback يقدر يقرأ من path القديم لو الـdata
    // محفوظه قبل إصلاح 2026-05.
    const branchAuth = await readBranchAuthData({ db, secret, branchId, userId });
    if (!branchAuth || !branchAuth.passwordHash) continue;
    if (!verifyPassword(secretaryPassword, branchAuth.passwordHash)) continue;
    matches.push({ branchId, kind: 'branch', branchAuth });
  }

  if (matches.length === 0) return null;

  // اختيار الفرع المطابق:
  //   - لو واحد فقط → نستخدمه
  //   - لو أكثر + preferredBranchId مُمرَّر → نستخدم المفضّل لو موجود، وإلا نرفض
  //   - لو أكثر بدون preferredBranchId → نرفض مع تفاصيل الفروع المطابقة عشان
  //     الـ UI يقدر يعرض اختيار للسكرتارية بدل ما توقف مسدودة (2026-05-11).
  let selected = null;
  if (matches.length === 1) {
    selected = matches[0];
  } else {
    const normalizedPreferred = String(preferredBranchId || '').trim();
    if (normalizedPreferred) {
      selected = matches.find((m) => m.branchId === normalizedPreferred) || null;
    }
    if (!selected) {
      // قراءة أسماء الفروع المطابقة عشان الـ UI يعرضها للسكرتارية تختار.
      // آمن أمنياً لأن السكرتارية بالفعل قدمت كلمة سر صحيحة (مطابقة لأكثر من فرع)،
      // فمعرفة أسماء فروع الطبيب نفسه = معلومة عن إعداد، مش معلومة سرية.
      const matchedBranches = await Promise.all(
        matches.map(async (m) => {
          let branchName = '';
          if (m.branchId === DEFAULT_BRANCH_ID) {
            branchName = 'الفرع الرئيسي';
          } else {
            try {
              const branchDoc = await db.collection('users').doc(userId).collection('branches').doc(m.branchId).get();
              if (branchDoc.exists) {
                branchName = normalizeText(branchDoc.data()?.name) || `فرع ${m.branchId}`;
              } else {
                branchName = `فرع ${m.branchId}`;
              }
            } catch {
              branchName = `فرع ${m.branchId}`;
            }
          }
          return { branchId: m.branchId, branchName };
        })
      );

      if (HttpsError) {
        throw new HttpsError(
          'failed-precondition',
          'AMBIGUOUS_PASSWORD_MATCHES_MULTIPLE_BRANCHES',
          { status: 'AMBIGUOUS_PASSWORD_MATCHES_MULTIPLE_BRANCHES', branches: matchedBranches }
        );
      }
      const err = new Error('AMBIGUOUS_PASSWORD_MATCHES_MULTIPLE_BRANCHES');
      err.details = { status: 'AMBIGUOUS_PASSWORD_MATCHES_MULTIPLE_BRANCHES', branches: matchedBranches };
      throw err;
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

  // Migration: لو الـauth جاي من path قديم (legacyRef موجود)، ننقل الـpasswordHash
  // لـpath الجديد ونحذف القديم. كده المرة الجاية الـlogin هيلاقيها مباشرةً.
  const isLegacyPath = Boolean(selectedBranchAuth.legacyRef);
  if (isLegacyPath) {
    try {
      // نسخ الـpasswordHash للمسار الجديد
      await selectedBranchAuth.ref.set({
        passwordHash: selectedBranchAuth.passwordHash,
        updatedAt: nowTs,
      }, { merge: true });
      // مسح الـpath القديم بعد ما اتنقل بنجاح
      await selectedBranchAuth.legacyRef.delete().catch(() => undefined);
    } catch (migrationError) {
      console.warn('[secretaryBranchAuth] Migration from legacy path failed:', migrationError?.message || migrationError);
      // ما نوقفش الـlogin لو الـmigration فشلت
    }
  }

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
    // نمرر userId للـfallback (path قديم) — نفس فكرة tryMatchSecretaryPasswordAcrossBranches.
    const branchAuth = await readBranchAuthData({ db, secret, branchId, userId });
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
