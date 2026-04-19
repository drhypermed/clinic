
module.exports = ({
  HttpsError,
  ENFORCE_APP_CHECK,
  assertAdminRequest,
  getDb,
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

  return { runCleanupNow, cleanupOldCompletedAppointments, cleanupOldErrorLogs, cleanupOldUsageEvents };
};
