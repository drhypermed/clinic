/**
 * cleanupLegacyBookingPasswordPlain — دالة مؤقتة لتنظيف حقل legacy.
 *
 * الهدف: حذف حقل `bookingPasswordPlain` (كلمة مرور نص صريح قديمة) من كل
 * وثائق users. النظام الحديث يستخدم secretaryPasswordHash (PBKDF2 150k rounds).
 *
 * طريقة الاستخدام (مرة واحدة فقط):
 *   1. npm run deploy (أو firebase deploy --only functions:cleanupLegacyBookingPasswordPlain)
 *   2. استدعاء الدالة من Firebase Console → Functions → "Test function"
 *      أو من console.log في المتصفح كأدمن:
 *        const fn = firebase.functions().httpsCallable('cleanupLegacyBookingPasswordPlain');
 *        await fn({});
 *   3. بعد النجاح، احذف هذا الملف + السطر في functions/index.js
 *
 * الإخراج: { ok, scanned, cleaned, errors }
 */

module.exports = (context) => {
  const {
    HttpsError,
    assertAdminRequest,
    getDb,
    admin,
  } = context;

  const cleanupLegacyBookingPasswordPlain = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const db = getDb();

    let scanned = 0;
    let cleaned = 0;
    const errors = [];
    let lastDoc = null;
    const PAGE_SIZE = 300;

    while (true) {
      let query = db.collection('users').orderBy(admin.firestore.FieldPath.documentId()).limit(PAGE_SIZE);
      if (lastDoc) query = query.startAfter(lastDoc);

      const snap = await query.get();
      if (snap.empty) break;

      for (const docSnap of snap.docs) {
        scanned += 1;
        const data = docSnap.data() || {};
        if ('bookingPasswordPlain' in data) {
          try {
            await docSnap.ref.update({
              bookingPasswordPlain: admin.firestore.FieldValue.delete(),
            });
            cleaned += 1;
          } catch (err) {
            errors.push({ userId: docSnap.id, message: err?.message || String(err) });
          }
        }
      }

      lastDoc = snap.docs[snap.docs.length - 1] || null;
      if (snap.size < PAGE_SIZE) break;
    }

    console.log('[cleanupLegacyBookingPasswordPlain]', {
      adminEmail, scanned, cleaned, errorCount: errors.length,
    });

    return {
      ok: true,
      scanned,
      cleaned,
      errors,
      message: `تم فحص ${scanned} وثيقة، حذف الحقل من ${cleaned}، أخطاء: ${errors.length}.`,
    };
  };

  return { cleanupLegacyBookingPasswordPlain };
};
