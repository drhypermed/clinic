// ─────────────────────────────────────────────────────────────────────────────
// consumeTranslationQuota — وظيفة السيرفر اللي بتعد الترجمة الذكية وتمنعها بعد الحد
// ─────────────────────────────────────────────────────────────────────────────
// كانت الترجمة بتشتغل تلقائياً مع كل روشتة بدون حد. الوظيفة دي بتضيف الحماية:
//   - بتقرأ نوع الباقة (مجاني / برو / برو ماكس)
//   - بتجيب الحد المسموح من إعدادات الأدمن (config.freeTranslationDailyLimit ...)
//   - بتعد كم مرة الترجمة اشتغلت اليوم (translationCount في وثيقة الاستخدام)
//   - لو وصل للحد: بترفض وترجع رسالة الأدمن المخصّصة + رسالة الواتساب
//   - لو لسه ما وصلش: بتزود العداد بـ1 وتسمح بالترجمة
//
// نفس الـpattern بالظبط زي consumeSmartPrescriptionQuota — بس الـkeys مختلفة.
// ─────────────────────────────────────────────────────────────────────────────

const {
  buildDoctorUserProfilePayload,
  loadUnifiedDoctorProfile,
  loadUnifiedUsageDoc,
} = require('../../profileStore');

module.exports = (context) => {
  const {
    HttpsError,
    getSmartRxConfig,
    getDb,
    admin,
    getCairoDateKey,
    resolveDoctorAccountType,
    buildWhatsAppUrl,
    pickTierValue,
  } = context;

  const consumeTranslationQuota = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();
    const dayKey = getCairoDateKey(new Date());
    // وثيقة استخدام منفصلة للترجمة عشان ما تختلطش بالعدادات التانية
    const usageDocId = `translation-${dayKey}`;

    const result = await db.runTransaction(async (tx) => {
      const doctorProfile = await loadUnifiedDoctorProfile({ db, userId, tx });
      if (!doctorProfile.exists) {
        throw new HttpsError('not-found', 'Doctor account not found');
      }

      const accountType = resolveDoctorAccountType(doctorProfile.mergedData);

      // لو يوزر جديد، نسجّل ملفه الأساسي مرة واحدة (نفس باقي الـquota functions)
      if (!doctorProfile.userSnap.exists) {
        tx.set(doctorProfile.userRef, buildDoctorUserProfilePayload({
          uid: userId,
          accountType,
          premiumStartDate: typeof doctorProfile.mergedData?.premiumStartDate === 'string' ? doctorProfile.mergedData.premiumStartDate : null,
          premiumExpiryDate: typeof doctorProfile.mergedData?.premiumExpiryDate === 'string' ? doctorProfile.mergedData.premiumExpiryDate : null,
          doctorName: typeof doctorProfile.mergedData?.doctorName === 'string' ? doctorProfile.mergedData.doctorName : '',
          doctorEmail: typeof doctorProfile.mergedData?.doctorEmail === 'string'
            ? doctorProfile.mergedData.doctorEmail
            : (typeof doctorProfile.mergedData?.email === 'string' ? doctorProfile.mergedData.email : ''),
          syncedFromLegacyDoctorAt: admin.firestore.FieldValue.serverTimestamp(),
        }), { merge: true });
      }

      // نقرأ الرسائل الخاصة بالترجمة من إعدادات الأدمن (3 فئات)
      const limitReachedMessage = pickTierValue(accountType, config, {
        freeKey: 'freeTranslationLimitMessage',
        premiumKey: 'premiumTranslationLimitMessage',
        proMaxKey: 'proMaxTranslationLimitMessage',
      });
      const whatsappMessage = pickTierValue(accountType, config, {
        freeKey: 'freeTranslationWhatsappMessage',
        premiumKey: 'premiumTranslationWhatsappMessage',
        proMaxKey: 'proMaxTranslationWhatsappMessage',
      });
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

      // نقرأ الحد المسموح من إعدادات الأدمن (3 فئات)
      const limit = pickTierValue(accountType, config, {
        freeKey: 'freeTranslationDailyLimit',
        premiumKey: 'premiumTranslationDailyLimit',
        proMaxKey: 'proMaxTranslationDailyLimit',
      });

      const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
      const used = Number(usageDoc.mergedUsageData?.translationCount || 0);

      // وصل للحد؟ نرفض ونرجع تفاصيل كاملة للعميل
      if (used >= limit) {
        throw new HttpsError('resource-exhausted', 'TRANSLATION_DAILY_LIMIT_REACHED', {
          accountType,
          limit,
          used,
          remaining: 0,
          dayKey,
          whatsappNumber: config.whatsappNumber,
          whatsappUrl,
          limitReachedMessage,
          whatsappMessage,
        });
      }

      // لسه في فسحة — نزود العداد ونسمح
      const nextUsed = used + 1;
      tx.set(usageDoc.userUsageRef, {
        doctorId: userId,
        dayKey,
        accountType,
        translationCount: nextUsed,
        limitApplied: limit,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: usageDoc.userUsageSnap.exists
          ? usageDoc.userUsageSnap.data()?.createdAt || admin.firestore.FieldValue.serverTimestamp()
          : usageDoc.mergedUsageData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      return {
        accountType,
        limit,
        used: nextUsed,
        remaining: Math.max(limit - nextUsed, 0),
        dayKey,
        whatsappNumber: config.whatsappNumber,
        whatsappUrl,
        limitReachedMessage,
        whatsappMessage,
      };
    });

    return result;
  };

  return consumeTranslationQuota;
};
