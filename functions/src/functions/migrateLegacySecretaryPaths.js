/**
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot migration: ينقل بيانات السكرتيرة القديمة من المسار المهجور
 * `secretaryAuth/{branchSecret}/branches/{branchId}` إلى المسار الجديد
 * `secretaryAuth/{mainSecret}/branches/{branchId}`.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * الخلفية:
 *   قبل إصلاح 2026-05-10، كانت كلمات سر فروع السكرتارية بتنحفظ تحت كل فرع
 *   على حدة (branchSecret). الإصلاح الجديد بيحفظها كلها تحت الـmainSecret.
 *
 *   الـ login flow بيعمل migration تلقائي على الـ fly (raedBranchAuthData)،
 *   لكن سكرتيرة قديمة عمرها ما دخلت تاني = بياناتها قاعدة في المسار القديم
 *   للأبد. الدالة دي تنقلها كلها في عملية واحدة من لوحة الأدمن.
 *
 * الأمان: callable يتطلب admin auth (assertAdminRequest).
 * الإجراء: read-only من المسار القديم → write للجديد → delete القديم.
 *           لو الـwrite فشل، القديم يفضل (آمن، مفيش data loss).
 *
 * الـoutput: تقرير {migrated, alreadyMigrated, skipped, errors, details[]}.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DEFAULT_BRANCH_ID = 'main';

const normalizeText = (v) => String(v == null ? '' : v).trim();

module.exports = ({ admin, getDb, assertAdminRequest }) => {
  /**
   * يقرأ خريطة `bookingSecretByBranch` من user doc + يقرأ الـsecrets القديمة
   * من `users/{uid}/branches/{branchId}.secretarySecret` (legacy field).
   *
   * يرجع: array من { userId, mainSecret, branchId, branchSecret } للفروع
   * اللي عندها branchSecret مختلف عن mainSecret (يعني محتاج migration).
   */
  const findCandidatesForMigration = async (db) => {
    const candidates = [];

    const usersSnap = await db.collection('users').get();
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data() || {};
      const userId = userDoc.id;
      const mainSecret = normalizeText(userData.bookingSecret);
      if (!mainSecret) continue;

      // فحص branches subcollection
      const branchesSnap = await db.collection('users').doc(userId).collection('branches').get();
      for (const branchDoc of branchesSnap.docs) {
        const branchId = branchDoc.id;
        if (branchId === DEFAULT_BRANCH_ID) continue;

        const branchData = branchDoc.data() || {};

        // أولوية: الـbookingSecretByBranch في user doc (الجديد الآمن)
        const bookingSecretByBranch = (userData.bookingSecretByBranch && typeof userData.bookingSecretByBranch === 'object')
          ? userData.bookingSecretByBranch
          : {};
        const newBranchSecret = normalizeText(bookingSecretByBranch[branchId]);

        // legacy: الـsecretarySecret على وثيقة الفرع
        const legacyBranchSecret = normalizeText(branchData.secretarySecret);

        // الـbranchSecret الفعلي = الجديد لو موجود، وإلا القديم
        const branchSecret = newBranchSecret || legacyBranchSecret;
        if (!branchSecret) continue;
        if (branchSecret === mainSecret) continue; // نفس المسار، مفيش حاجة تتنقل

        candidates.push({ userId, mainSecret, branchId, branchSecret });
      }
    }

    return candidates;
  };

  /**
   * ينقل وثيقة واحدة من المسار القديم للجديد.
   * يرجع: 'migrated' | 'already-migrated' | 'no-legacy-data' | 'error:...'
   */
  const migrateOne = async (db, { mainSecret, branchId, branchSecret }) => {
    const legacyRef = db.collection('secretaryAuth').doc(branchSecret).collection('branches').doc(branchId);
    const newRef = db.collection('secretaryAuth').doc(mainSecret).collection('branches').doc(branchId);

    const [legacySnap, newSnap] = await Promise.all([legacyRef.get(), newRef.get()]);

    // (1) لا توجد بيانات قديمة → مفيش حاجة نعملها
    if (!legacySnap.exists) return 'no-legacy-data';

    // (2) الجديد موجود بالفعل → اعتبره already migrated (مش هنكتب فوقه)
    //     لكن هنحذف القديم لو الـpasswordHash متطابق (نظافة).
    if (newSnap.exists) {
      const newData = newSnap.data() || {};
      const legacyData = legacySnap.data() || {};
      const samePassword =
        normalizeText(newData.passwordHash) === normalizeText(legacyData.passwordHash) &&
        normalizeText(newData.passwordHash) !== '';
      if (samePassword) {
        await legacyRef.delete().catch(() => undefined);
        return 'already-migrated';
      }
      // الجديد موجود لكن passwordHash مختلف — لا نلمسه، نسجّل warning
      return 'conflict-different-hash';
    }

    // (3) المسار الجديد فاضي والقديم فيه data → ننقل
    const legacyData = legacySnap.data() || {};
    await newRef.set(legacyData, { merge: true });
    await legacyRef.delete().catch(() => undefined);
    return 'migrated';
  };

  /**
   * Callable: يجرى الـmigration الكامل ويرجع تقرير.
   * يتطلب admin auth.
   */
  const migrateLegacySecretaryPaths = async (request) => {
    await assertAdminRequest(request);

    const db = getDb();
    const startedAt = Date.now();

    const candidates = await findCandidatesForMigration(db);

    const report = {
      candidatesFound: candidates.length,
      migrated: 0,
      alreadyMigrated: 0,
      noLegacyData: 0,
      conflicts: 0,
      errors: 0,
      details: [],
    };

    for (const candidate of candidates) {
      try {
        const result = await migrateOne(db, candidate);
        if (result === 'migrated') {
          report.migrated++;
          report.details.push({ ...candidate, status: 'migrated' });
        } else if (result === 'already-migrated') {
          report.alreadyMigrated++;
        } else if (result === 'no-legacy-data') {
          report.noLegacyData++;
        } else if (result === 'conflict-different-hash') {
          report.conflicts++;
          report.details.push({ ...candidate, status: 'conflict-different-hash' });
        }
      } catch (err) {
        report.errors++;
        report.details.push({
          ...candidate,
          status: 'error',
          message: String(err?.message || err),
        });
      }
    }

    report.elapsedMs = Date.now() - startedAt;
    return report;
  };

  return { migrateLegacySecretaryPaths };
};
