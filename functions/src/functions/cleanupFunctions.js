
module.exports = ({
  HttpsError,
  ENFORCE_APP_CHECK,
  assertAdminRequest,
  getDb,
  admin,
  deleteQueryBatch,
  deleteExpiredSlotsByScan,
}) => {
  
  const runCleanupNow = async (request) => {
    await assertAdminRequest(request);
    const now = new Date();
    const nowIso = now.toISOString();
    const slotsQuery = getDb().collectionGroup('slots').where('dateTime', '<', nowIso);
    
    let slotsDeleted = await deleteQueryBatch(slotsQuery, 'public slots (manual)');
    if (slotsDeleted === 0) {
      slotsDeleted = await deleteExpiredSlotsByScan(now.getTime());
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const cutoffIso = startOfToday.toISOString();
    const apptsQuery = getDb().collectionGroup('appointments')
      .where('dateTime', '<', cutoffIso)
      .where('examCompletedAt', '==', null);
    
    const apptsDeleted = await deleteQueryBatch(apptsQuery, 'expired appointments (manual)');

    return { slotsDeleted, apptsDeleted, cutoff: cutoffIso };
  };

  const cleanupOldCompletedAppointments = async () => {
    const now = new Date();
    // حذف المواعيد المنفذة بعد 3 شهور لتوفير استهلاك السحابة
    const THREE_MONTHS_MS = 3 * 30 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(now.getTime() - THREE_MONTHS_MS);
    const cutoffIso = cutoff.toISOString();
    // Range query: examCompletedAt is a valid ISO date and older than 6 months.
    // Lower bound excludes null/missing fields (Firestore inequality filters exclude missing fields).
    const minValidDate = '2000-01-01T00:00:00.000Z';
    const query = getDb().collectionGroup('appointments')
      .where('examCompletedAt', '>=', minValidDate)
      .where('examCompletedAt', '<', cutoffIso);

    const deleted = await deleteQueryBatch(query, 'completed appointments older than 3 months');
    console.log(`[cleanupOldCompletedAppointments] Deleted ${deleted} completed appointments older than ${cutoffIso}`);
    return { deleted, cutoff: cutoffIso };
  };

  /**
   * تنظيف سجلات الأخطاء الأقدم من 30 يوم.
   * الأخطاء القديمة مالهاش لازمة وبتكلف فلوس تخزين وفهرسة.
   * بيانات المرضى والوصفات والمواعيد مش بتتأثر خالص.
   */
  const cleanupOldErrorLogs = async () => {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const db = getDb();

    // errorLogs بتستعمل serverTimestamp — نبحث عن الأقدم من 30 يوم
    const errorQuery = db.collection('errorLogs')
      .where('timestamp', '<', cutoff);
    const errorDeleted = await deleteQueryBatch(errorQuery, 'error logs older than 30 days');
    console.log(`[cleanupOldErrorLogs] Deleted ${errorDeleted} error logs`);

    // messageLogs نفس الكلام
    const messageQuery = db.collection('messageLogs')
      .where('timestamp', '<', cutoff);
    const messageDeleted = await deleteQueryBatch(messageQuery, 'message logs older than 30 days');
    console.log(`[cleanupOldErrorLogs] Deleted ${messageDeleted} message logs`);

    return { errorDeleted, messageDeleted, cutoff: cutoff.toISOString() };
  };

  /**
   * تنظيف أحداث تتبع الاستخدام الأقدم من 90 يوم.
   * دي بتسجل "الدكتور استعمل ميزة X" — مش بيانات مرضى.
   * العدادات التراكمية في ملف الدكتور (usageStats) مش بتتأثر.
   */
  const cleanupOldUsageEvents = async () => {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const db = getDb();

    const usageQuery = db.collection('usageEvents')
      .where('timestamp', '<', cutoff);
    const deleted = await deleteQueryBatch(usageQuery, 'usage events older than 90 days');
    console.log(`[cleanupOldUsageEvents] Deleted ${deleted} usage events`);

    return { deleted, cutoff: cutoff.toISOString() };
  };

  /**
   * تنظيف ذكي شامل للبيانات القديمة — حسب الباقة (Tier-Based Retention).
   *
   * ─── سياسة الاحتفاظ (2026-05) ───
   *   • مجاني (free)         → 5 سنين
   *   • برو (premium)        → 5 سنين
   *   • برو ماكس (pro_max)   → 7 سنين ← مزية إضافية للباقة الأعلى
   *
   * ─── سياسة موازية: تعطيل + حذف الحسابات الخاملة ───
   *   • مجاني خامل > 3 شهور → الحساب يتعطل تلقائياً (disableInactiveFreeAccounts)
   *   • معطل > 1 سنة → الحساب يتحذف نهائياً (deleteAbandonedDisabledAccounts)
   *
   * ─── اللي بيتحذف بنفس الـ retention ───
   *   1. سجلات المرضى     — users/{uid}/records/*
   *   2. التقارير المالية اليومية — users/{uid}/financialData/daily/entries/{date}
   *   3. التقارير المالية الشهرية — users/{uid}/financialData/monthly/entries/{month}
   *   4. تاريخ تغيير الأسعار — users/{uid}/financialData/priceHistory/entries/{autoId}
   *      (entries بتاريخ changedAt أقدم من cutoff)
   *   5. الملفات الفاضية   — users/{uid}/settings/patientFile__* (smart cleanup)
   *
   * ─── الجدولة (2026-05): شهرياً ───
   * يشتغل يوم 1 من كل شهر، 4 الفجر بتوقيت القاهرة.
   *
   * ─── Smart Cleanup للملفات الفاضية ───
   * الملف بيتحذف فقط لو:
   *   1. مفيش له سجلات متبقية (آخر زيارة عدّت الـ retention)
   *   2. مفيش فيه additionalInfo (ملاحظات الطبيب)
   *   3. مفيش له مصروفات/تأمينات في patientFileData
   * أي شرط منهم بـ"يحقق" → الملف يفضل.
   *
   * ─── اللي بيفضل دايماً ───
   * • Settings الأخرى (إعدادات الطبيب، التخصص، إلخ)
   * • patientFileData للملفات اللي فيها قيمة (مصروفات/تأمينات)
   *
   * ─── أمان ───
   * • Firestore exports يومية — أي حذف بالخطأ يرجع
   * • فحص متعدد قبل حذف ملف المريض
   */
  const cleanupOldPatientRecords = async () => {
    const now = new Date();
    const nowMs = now.getTime();
    const PATIENT_FILE_DOC_PREFIX = 'patientFile__';
    const minValidDate = '1900-01-01T00:00:00.000Z';
    const db = getDb();

    // ─── ثوابت سياسة الاحتفاظ حسب الباقة (Tier-Based Retention) ───
    const DAY_MS = 24 * 60 * 60 * 1000;
    const YEAR_MS = 365.25 * DAY_MS;
    const RETENTION_BY_TIER = {
      free: 5 * YEAR_MS,        // 🆕 (2026-05) 5 سنين للمجاني — متساوية مع البرو لحفظ بيانات الطبيب
      premium: 5 * YEAR_MS,
      pro_max: 7 * YEAR_MS,
    };

    // accountType بيتحدد من ملف الطبيب — مع تطبيع آمن (default: free)
    const resolveTierKey = (accountTypeRaw) => {
      const tier = String(accountTypeRaw || 'free').trim().toLowerCase();
      if (tier === 'pro_max') return 'pro_max';
      if (tier === 'premium') return 'premium';
      return 'free';
    };

    // ─── cutoffs ثابتة لكل tier (NOW واحد للجلسة، فالـ cutoffs مش بتتغير) ───
    const cutoffsByTier = {
      free: new Date(nowMs - RETENTION_BY_TIER.free).toISOString(),
      premium: new Date(nowMs - RETENTION_BY_TIER.premium).toISOString(),
      pro_max: new Date(nowMs - RETENTION_BY_TIER.pro_max).toISOString(),
    };

    // ─── 1) قراءة كل الأطباء المسجّلين (مرة واحدة، rolling) ───
    const usersSnap = await db.collection('users').get();

    // إجماليات global للـ logging
    let totalDeletedRecords = 0;
    let totalInspectedFiles = 0;
    let totalDeletedEmptyFiles = 0;
    let totalDeletedDailyFinancials = 0;
    let totalDeletedMonthlyFinancials = 0;
    let totalDeletedPriceHistory = 0;

    // helper: استخراج المفتاح الأصلي من docId مالي (يدعم prefix الفروع)
    // الـ format: "YYYY-MM-DD" للـ main أو "{branchId}__YYYY-MM-DD" للفروع
    const parseFinancialDocKey = (docId) => {
      const sep = docId.indexOf('__');
      return sep === -1 ? docId : docId.substring(sep + 2);
    };

    // helper: تحويل أي شكل timestamp (Firestore Timestamp / ms / s / ISO string) لـ ms
    // priceHistory entries فيها changedAt/updatedAt/createdAt بأشكال مختلفة حسب الكتابة
    const timestampToMs = (value) => {
      if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
      if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      }
      if (!value || typeof value !== 'object') return 0;
      if (typeof value.toMillis === 'function') {
        const ms = Number(value.toMillis());
        return Number.isFinite(ms) && ms > 0 ? ms : 0;
      }
      const seconds = Number(value._seconds ?? value.seconds ?? NaN);
      if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
      return 0;
    };

    // ─── 2) لكل طبيب: حدد الـ cutoff حسب باقته، ثم cleanup ───
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data() || {};
      const tierKey = resolveTierKey(userData.accountType);
      const retentionMs = RETENTION_BY_TIER[tierKey];
      const cutoffIso = cutoffsByTier[tierKey];

      // المرحلة 1+2: حذف السجلات القديمة لهذا الطبيب + جمع الملفات المتأثرة
      const affectedFiles = new Map(); // fileKey → { fileId, nameKey }
      const recordsRef = db.collection('users').doc(userId).collection('records');
      const recordsQuery = recordsRef
        .where('date', '>=', minValidDate)
        .where('date', '<', cutoffIso);

      let userDeletedRecords = 0;
      while (true) {
        const snap = await recordsQuery.limit(500).get();
        if (snap.empty) break;

        const batch = db.batch();
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const nameKey = String(data.patientFileNameKey || '').trim();
          const fileId = String(data.patientFileId || '').trim();
          if (nameKey || fileId) {
            const fileKey = fileId || `name:${nameKey}`;
            affectedFiles.set(fileKey, { nameKey, fileId });
          }
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        userDeletedRecords += snap.size;
      }
      totalDeletedRecords += userDeletedRecords;

      // المرحلة 3: لكل ملف متأثر، فحص لو "فاضي" واحذفه
      for (const fileInfo of affectedFiles.values()) {
        totalInspectedFiles += 1;
        const { nameKey, fileId } = fileInfo;
        const resolvedFileId = fileId
          || (nameKey ? `${PATIENT_FILE_DOC_PREFIX}${encodeURIComponent(nameKey)}` : '');
        if (!resolvedFileId) continue;

        // 1) فحص: في records تانية متبقية للمريض دلوقتي؟
        let hasRemainingRecords = false;
        if (nameKey) {
          const remainingByName = await recordsRef
            .where('patientFileNameKey', '==', nameKey)
            .limit(1).get();
          if (!remainingByName.empty) hasRemainingRecords = true;
        }
        if (!hasRemainingRecords && fileId) {
          const remainingById = await recordsRef
            .where('patientFileId', '==', fileId)
            .limit(1).get();
          if (!remainingById.empty) hasRemainingRecords = true;
        }
        if (hasRemainingRecords) continue;

        // 2) فحص: الملف نفسه فيه additionalInfo؟
        const fileRef = db.collection('users').doc(userId)
          .collection('settings').doc(resolvedFileId);
        const fileSnap = await fileRef.get();
        if (!fileSnap.exists) continue;
        const fileData = fileSnap.data() || {};
        const hasAdditionalInfo = String(fileData.additionalInfo || '').trim().length > 0;
        if (hasAdditionalInfo) continue;

        // 3) فحص: في patientFileData بمصروفات/تأمينات؟
        const fileDataRef = db.collection('users').doc(userId)
          .collection('patientFileData').doc(resolvedFileId);
        const fileDataSnap = await fileDataRef.get();
        let hasCostsOrInsurance = false;
        if (fileDataSnap.exists) {
          const fd = fileDataSnap.data() || {};
          const costsCount = Array.isArray(fd.costItems) ? fd.costItems.length : 0;
          const insuranceCount = Array.isArray(fd.insuranceItems) ? fd.insuranceItems.length : 0;
          if (costsCount > 0 || insuranceCount > 0) hasCostsOrInsurance = true;
        }
        if (hasCostsOrInsurance) continue;

        // كل الفحوصات عدّت → الملف فاضي → احذفه + patientFileData المرتبط
        const deleteBatch = db.batch();
        deleteBatch.delete(fileRef);
        if (fileDataSnap.exists) deleteBatch.delete(fileDataRef);
        await deleteBatch.commit();
        totalDeletedEmptyFiles += 1;
      }

      // ─── المرحلة 4: حذف التقارير المالية اليومية الأقدم من cutoff ───
      // الـ doc IDs بصيغة "YYYY-MM-DD" أو "{branchId}__YYYY-MM-DD" (للفروع).
      // نستخدم string compare بعد parsing عشان نراعي الفروع.
      // الـ cutoff للمقارنة: الـ date string بصيغة YYYY-MM-DD (10 أحرف).
      const cutoffDate = new Date(nowMs - retentionMs);
      const cutoffDateKey = cutoffDate.toISOString().substring(0, 10); // YYYY-MM-DD

      try {
        const dailyRef = db.collection('users').doc(userId)
          .collection('financialData').doc('daily').collection('entries');
        const dailySnap = await dailyRef.get();
        if (!dailySnap.empty) {
          let dailyBatch = db.batch();
          let dailyOps = 0;
          for (const docSnap of dailySnap.docs) {
            const entryDateKey = parseFinancialDocKey(docSnap.id);
            // نتحقق من الـ format الصحيح (YYYY-MM-DD، 10 أحرف، يبدأ بـ year)
            if (entryDateKey.length !== 10) continue;
            if (entryDateKey < cutoffDateKey) {
              dailyBatch.delete(docSnap.ref);
              dailyOps += 1;
              totalDeletedDailyFinancials += 1;
              if (dailyOps >= 400) {
                await dailyBatch.commit();
                dailyBatch = db.batch();
                dailyOps = 0;
              }
            }
          }
          if (dailyOps > 0) await dailyBatch.commit();
        }
      } catch (err) {
        console.warn(`[cleanupOldPatientRecords] daily financials cleanup failed for ${userId}:`, err?.message);
      }

      // ─── المرحلة 5: حذف التقارير المالية الشهرية الأقدم من cutoff ───
      // الـ doc IDs بصيغة "YYYY-MM" أو "{branchId}__YYYY-MM" (للفروع).
      const cutoffMonthKey = cutoffDateKey.substring(0, 7); // YYYY-MM

      try {
        const monthlyRef = db.collection('users').doc(userId)
          .collection('financialData').doc('monthly').collection('entries');
        const monthlySnap = await monthlyRef.get();
        if (!monthlySnap.empty) {
          let monthlyBatch = db.batch();
          let monthlyOps = 0;
          for (const docSnap of monthlySnap.docs) {
            const entryMonthKey = parseFinancialDocKey(docSnap.id);
            // نتحقق من الـ format الصحيح (YYYY-MM، 7 أحرف)
            if (entryMonthKey.length !== 7) continue;
            if (entryMonthKey < cutoffMonthKey) {
              monthlyBatch.delete(docSnap.ref);
              monthlyOps += 1;
              totalDeletedMonthlyFinancials += 1;
              if (monthlyOps >= 400) {
                await monthlyBatch.commit();
                monthlyBatch = db.batch();
                monthlyOps = 0;
              }
            }
          }
          if (monthlyOps > 0) await monthlyBatch.commit();
        }
      } catch (err) {
        console.warn(`[cleanupOldPatientRecords] monthly financials cleanup failed for ${userId}:`, err?.message);
      }

      // ─── المرحلة 6: حذف priceHistory entries الأقدم من cutoff ───
      // الـ entries مفيهاش date في الـ docId (autoId) — بنقرأ كل واحد ونفحص
      // الـ changedAt (أو updatedAt/createdAt كـ fallback). أي شكل timestamp
      // مدعوم: Firestore Timestamp / ms number / ISO string.
      // ⚠️ أمان: لو الـ entry مفيهوش timestamp صالح (= 0)، بنتركه — حماية ضد
      //         حذف عشوائي لـ entries malformed.
      const cutoffMs = nowMs - retentionMs;

      try {
        const priceHistoryRef = db.collection('users').doc(userId)
          .collection('financialData').doc('priceHistory').collection('entries');
        const priceHistorySnap = await priceHistoryRef.get();
        if (!priceHistorySnap.empty) {
          let priceBatch = db.batch();
          let priceOps = 0;
          for (const docSnap of priceHistorySnap.docs) {
            const data = docSnap.data() || {};
            // أولوية: changedAt → updatedAt → createdAt (نفس منطق toPriceChangeHistoryEntry)
            const entryMs = timestampToMs(data.changedAt)
              || timestampToMs(data.updatedAt)
              || timestampToMs(data.createdAt);
            // entryMs = 0 يعني malformed → نتجاهله (نتركه)
            if (entryMs > 0 && entryMs < cutoffMs) {
              priceBatch.delete(docSnap.ref);
              priceOps += 1;
              totalDeletedPriceHistory += 1;
              if (priceOps >= 400) {
                await priceBatch.commit();
                priceBatch = db.batch();
                priceOps = 0;
              }
            }
          }
          if (priceOps > 0) await priceBatch.commit();
        }
      } catch (err) {
        console.warn(`[cleanupOldPatientRecords] priceHistory cleanup failed for ${userId}:`, err?.message);
      }
    }

    console.log(
      `[cleanupOldPatientRecords] Tiered cleanup complete: ` +
      `${totalDeletedRecords} records, ` +
      `${totalDeletedEmptyFiles} empty files (of ${totalInspectedFiles} inspected), ` +
      `${totalDeletedDailyFinancials} daily financial entries, ` +
      `${totalDeletedMonthlyFinancials} monthly financial entries, ` +
      `${totalDeletedPriceHistory} priceHistory entries. ` +
      `Cutoffs: free=${cutoffsByTier.free}, premium=${cutoffsByTier.premium}, pro_max=${cutoffsByTier.pro_max}`
    );
    return {
      deletedRecords: totalDeletedRecords,
      inspectedFiles: totalInspectedFiles,
      deletedEmptyFiles: totalDeletedEmptyFiles,
      deletedDailyFinancials: totalDeletedDailyFinancials,
      deletedMonthlyFinancials: totalDeletedMonthlyFinancials,
      deletedPriceHistory: totalDeletedPriceHistory,
      cutoffs: cutoffsByTier,
    };
  };

  /**
   * تنظيف وثائق "إشعارات الحجز المُتعامل معاها" الأقدم من 3 أيام.
   * 3 أيام كافية: الإشعار بيُتعامل معاه عادةً خلال ساعات، فبعد 3 أيام مفيش جهاز
   * هيعيد عرضه. النافذة الضيّقة بتوفر ~90% من قراءات الـ subscription على scale.
   */
  const cleanupOldDismissedAppointmentNotifications = async () => {
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const db = getDb();

    const query = db.collectionGroup('dismissedAppointmentNotifications')
      .where('dismissedAt', '<', cutoff);
    const deleted = await deleteQueryBatch(
      query,
      'dismissed appointment notifications older than 3 days'
    );
    console.log(`[cleanupOldDismissedAppointmentNotifications] Deleted ${deleted} records`);

    return { deleted, cutoff: cutoff.toISOString() };
  };

  /**
   * تعطيل الحسابات المجانية اللي انتهت مدتها (Auto-Disable Free Accounts).
   *
   * ─── المنطق الصحيح (2026-05) ───
   * المجاني = "اشتراك تجريبي مدته 3 شهور" — مش بناءً على الخمول.
   * كل طبيب مجاني عنده `freeAccountExpiryDate` بيتم تعيينه عند:
   *   - الاعتماد الأولي للحساب (handleApprove)
   *   - تحويل الباقة لمجاني (handleUpdateAccountType)
   * بعد انتهاء التاريخ ده → الحساب يتعطل تلقائياً.
   *
   * ─── Migration للأطباء القدامى ───
   * طبيب مجاني approved لكن مفيش عنده freeAccountExpiryDate (موجود قبل الـ feature)
   *   → نضيف الـ field = now + 90 يوم (grace period) ولا نعطل دلوقتي
   * أول مرة الـ function تشتغل، كل الأطباء القدامى ياخدوا 90 يوم grace.
   *
   * ─── النتيجة عند الطبيب ───
   * لو حاول يدخل بعد التعطيل، الـ login flow بيعرض الـ disabledReason:
   * "انتهت مدة حسابك المجاني (3 شهور) — تواصل مع الإدارة لتجديد الفترة المجانية أو الترقية للبرو"
   *
   * ─── الـ guards ───
   * • accountType !== 'free' → تخطى
   * • verificationStatus !== 'approved' → تخطى (pending/rejected)
   * • isAccountDisabled === true → تخطى
   * • premiumExpiryDate في المستقبل → تخطى (الطبيب عنده اشتراك paid لسه شغال)
   * • freeAccountExpiryDate لسه ما عداش → تخطى
   *
   * ─── الجدولة: شهرياً ───
   */
  const disableInactiveFreeAccounts = async () => {
    const db = getDb();
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const FREE_TRIAL_MS = 90 * 24 * 60 * 60 * 1000;

    // helper: convert any timestamp shape to ms
    const tsToMs = (value) => {
      if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
      if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      }
      if (!value || typeof value !== 'object') return 0;
      if (typeof value.toMillis === 'function') {
        const ms = Number(value.toMillis());
        return Number.isFinite(ms) && ms > 0 ? ms : 0;
      }
      const seconds = Number(value._seconds ?? value.seconds ?? NaN);
      if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
      return 0;
    };

    const usersSnap = await db.collection('users').get();

    let disabledCount = 0;
    let migratedCount = 0; // أطباء قدامى ضفنا لهم freeAccountExpiryDate
    let inspectedCount = 0;
    let skippedNonFreeCount = 0;
    let skippedNotApprovedCount = 0;
    let skippedAlreadyDisabledCount = 0;
    let skippedHasPaidCount = 0;
    let skippedNotExpiredYetCount = 0;

    for (const userDoc of usersSnap.docs) {
      inspectedCount += 1;
      const userId = userDoc.id;
      const data = userDoc.data() || {};

      // Guard 1: مش طبيب مجاني → تخطى
      const accountType = String(data.accountType || '').trim().toLowerCase();
      if (accountType !== 'free') {
        skippedNonFreeCount += 1;
        continue;
      }

      // Guard 2: مش approved → تخطى (تحت المراجعة أو مرفوض)
      const verificationStatus = String(data.verificationStatus || '').trim().toLowerCase();
      if (verificationStatus !== 'approved') {
        skippedNotApprovedCount += 1;
        continue;
      }

      // Guard 3: متعطل بالفعل → تخطى
      if (data.isAccountDisabled === true) {
        skippedAlreadyDisabledCount += 1;
        continue;
      }

      // Guard 4: عنده اشتراك مدفوع لسه شغال (نادر لكن آمن) → تخطى
      const premiumExpiryMs = tsToMs(data.premiumExpiryDate);
      if (premiumExpiryMs > nowMs) {
        skippedHasPaidCount += 1;
        continue;
      }

      // Migration: لو مفيش freeAccountExpiryDate (طبيب قديم) → نضيفه ولا نعطل
      const freeExpiryMs = tsToMs(data.freeAccountExpiryDate);
      if (freeExpiryMs === 0) {
        try {
          const newExpiryIso = new Date(nowMs + FREE_TRIAL_MS).toISOString();
          await db.collection('users').doc(userId).set({
            freeAccountExpiryDate: newExpiryIso,
            freeAccountStartDate: nowIso,
            updatedAt: nowIso,
          }, { merge: true });
          migratedCount += 1;
        } catch (err) {
          console.warn(`[disableInactiveFreeAccounts] migration failed for ${userId}:`, err?.message);
        }
        continue; // ما يتعطلش — لسه ياخد 90 يوم grace
      }

      // Guard 5: المدة لسه ما انتهتش → تخطى
      if (freeExpiryMs > nowMs) {
        skippedNotExpiredYetCount += 1;
        continue;
      }

      // ✅ المدة المجانية انتهت → تعطيل
      try {
        try {
          await admin.auth().revokeRefreshTokens(userId);
        } catch (revokeErr) {
          if (revokeErr.code !== 'auth/user-not-found') {
            console.warn(`[disableInactiveFreeAccounts] revokeRefreshTokens failed for ${userId}:`, revokeErr.message);
          }
        }

        const disabledReasonMessage =
          'انتهت مدة حسابك المجاني (3 شهور). الحساب المجاني محدود بمدة تجريبية، وبعدها يتم التعطيل التلقائي. ' +
          'لاستعادة حسابك: تواصل مع الإدارة عبر الواتساب — هتلاقي خيارين: (1) تجديد الفترة المجانية، (2) الترقية لباقة برو/برو ماكس بدون انتهاء تلقائي. ' +
          '⚠️ تنبيه: لو فضل الحساب متعطل سنة كاملة، البيانات ستُحذف نهائياً.';

        await db.collection('users').doc(userId).set({
          isAccountDisabled: true,
          disabledReason: disabledReasonMessage,
          disabledAt: nowIso,
          disabledBy: 'system_free_trial_expired',
          updatedAt: nowIso,
        }, { merge: true });

        disabledCount += 1;
      } catch (err) {
        console.warn(`[disableInactiveFreeAccounts] Failed to disable ${userId}:`, err?.message);
      }
    }

    console.log(
      `[disableInactiveFreeAccounts] Inspected ${inspectedCount}, ` +
      `disabled ${disabledCount} expired free accounts, migrated ${migratedCount} legacy accounts. ` +
      `Skipped: nonFree=${skippedNonFreeCount}, notApproved=${skippedNotApprovedCount}, ` +
      `alreadyDisabled=${skippedAlreadyDisabledCount}, hasPaid=${skippedHasPaidCount}, ` +
      `notExpiredYet=${skippedNotExpiredYetCount}.`
    );
    return { disabledCount, migratedCount, inspectedCount };
  };

  /**
   * حذف نهائي للحسابات المتعطلة لأكتر من سنة (Permanent Delete).
   *
   * ─── المنطق ───
   * طبيب isAccountDisabled=true + disabledAt > 1 سنة
   *   → حذف auth user + حذف users/{uid} document + حذف كل subcollections
   *
   * ⚠️ ده حذف نهائي ومش بيرجع. Firestore exports اليومية بتحفظ نسخة احتياطية
   * لكن استرجاعها يدوي ومعقد.
   *
   * ─── الجدولة ───
   * شهرياً (يوم 1، 5:30 الفجر).
   *
   * ─── الـ guards ───
   * • لازم isAccountDisabled = true
   * • لازم disabledAt موجود + > 1 سنة
   * • لو disabledBy = 'system_auto_inactive' (أوتو من النظام) → آمن للحذف
   * • لو disabledBy = أدمن معين (يدوي) → آمن للحذف برضه (مرت سنة من قراره)
   * • مستثنى: الأدمن الجذري ROOT_ADMIN_UID مهما حصل
   */
  const deleteAbandonedDisabledAccounts = async () => {
    const db = getDb();
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const cutoffMs = nowMs - ONE_YEAR_MS;
    const cutoffIso = new Date(cutoffMs).toISOString();
    const ROOT_ADMIN_UID = 'OrdU20b9pBXfUYrh4z8hNR0F14B2'; // متطابق مع الـ frontend

    const tsToMs = (value) => {
      if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
      if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      }
      if (!value || typeof value !== 'object') return 0;
      if (typeof value.toMillis === 'function') {
        const ms = Number(value.toMillis());
        return Number.isFinite(ms) && ms > 0 ? ms : 0;
      }
      const seconds = Number(value._seconds ?? value.seconds ?? NaN);
      if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
      return 0;
    };

    const usersSnap = await db.collection('users').get();

    let deletedCount = 0;
    let inspectedCount = 0;
    let skippedReasons = { rootAdmin: 0, notDisabled: 0, recent: 0, noTimestamp: 0 };

    for (const userDoc of usersSnap.docs) {
      inspectedCount += 1;
      const userId = userDoc.id;
      const data = userDoc.data() || {};

      // Guard 1: الأدمن الجذري — مش بيتحذف مهما حصل
      if (userId === ROOT_ADMIN_UID) {
        skippedReasons.rootAdmin += 1;
        continue;
      }

      // Guard 2: لازم يكون متعطل
      if (data.isAccountDisabled !== true) {
        skippedReasons.notDisabled += 1;
        continue;
      }

      // Guard 3: لازم يكون له disabledAt timestamp صالح
      const disabledMs = tsToMs(data.disabledAt);
      if (disabledMs === 0) {
        skippedReasons.noTimestamp += 1;
        continue;
      }

      // Guard 4: مرت سنة على التعطيل؟
      if (disabledMs > cutoffMs) {
        skippedReasons.recent += 1;
        continue;
      }

      // ✅ الحساب متعطل لأكتر من سنة → حذف نهائي
      try {
        // 1) حذف من Firebase Auth
        try {
          await admin.auth().deleteUser(userId);
        } catch (authErr) {
          if (authErr.code !== 'auth/user-not-found') {
            console.warn(`[deleteAbandonedDisabledAccounts] Auth delete failed for ${userId}:`, authErr.message);
          }
        }

        // 2) حذف الـ subcollections (records, settings, financialData, etc.)
        // الـ Firestore Admin SDK ما عندوش recursive delete في batch، فبنحذف collection by collection
        const subcollections = await db.collection('users').doc(userId).listCollections();
        for (const sub of subcollections) {
          // حذف documents في كل subcollection على دفعات
          const subQuery = sub;
          while (true) {
            const subSnap = await subQuery.limit(500).get();
            if (subSnap.empty) break;
            const batch = db.batch();
            // حذف nested subcollections للـ doc الواحد قبل حذفه (مثلاً financialData/{daily,monthly,priceHistory}/entries)
            for (const docSnap of subSnap.docs) {
              try {
                const nestedSubs = await docSnap.ref.listCollections();
                for (const nested of nestedSubs) {
                  while (true) {
                    const nestedSnap = await nested.limit(500).get();
                    if (nestedSnap.empty) break;
                    const nestedBatch = db.batch();
                    nestedSnap.docs.forEach((nDoc) => nestedBatch.delete(nDoc.ref));
                    await nestedBatch.commit();
                  }
                }
              } catch (nestedErr) {
                console.warn(`[deleteAbandonedDisabledAccounts] Nested delete failed for ${userId}:`, nestedErr?.message);
              }
              batch.delete(docSnap.ref);
            }
            await batch.commit();
          }
        }

        // 3) حذف الـ user document نفسه
        await db.collection('users').doc(userId).delete();

        deletedCount += 1;
        console.log(`[deleteAbandonedDisabledAccounts] Deleted abandoned account ${userId} (disabled ${data.disabledAt})`);
      } catch (err) {
        console.error(`[deleteAbandonedDisabledAccounts] Failed to delete ${userId}:`, err?.message);
      }
    }

    console.log(
      `[deleteAbandonedDisabledAccounts] Inspected ${inspectedCount}, deleted ${deletedCount}. ` +
      `Skipped: rootAdmin=${skippedReasons.rootAdmin}, notDisabled=${skippedReasons.notDisabled}, ` +
      `recent=${skippedReasons.recent}, noTimestamp=${skippedReasons.noTimestamp}. Cutoff=${cutoffIso}`
    );
    return { deletedCount, inspectedCount, cutoff: cutoffIso };
  };

  return {
    runCleanupNow,
    cleanupOldCompletedAppointments,
    cleanupOldErrorLogs,
    cleanupOldUsageEvents,
    cleanupOldDismissedAppointmentNotifications,
    cleanupOldPatientRecords,
    disableInactiveFreeAccounts,
    deleteAbandonedDisabledAccounts,
  };
};
