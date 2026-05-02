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
  const consumeSmartPrescriptionQuota = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    // 🆕 (2026-05) — mode بيحدد الزر:
    //   'analyze' (الافتراضي): زر "تحليل الحالة" (الزر العميق) — عداد smartPrescriptionCount
    //   'quickAdd': زر "إضافة بدون تحليل" (الزر السريع) — عداد منفصل quickAddCount
    // كان الزرّين بيشاركوا نفس العداد فاستهلاك زر بيقفل التاني (bug). دلوقتي كل واحد عداده.
    const rawMode = String(request?.data?.mode || 'analyze');
    if (rawMode !== 'analyze' && rawMode !== 'quickAdd') {
      throw new HttpsError('invalid-argument', 'Invalid mode');
    }
    const mode = rawMode;

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();
    const dayKey = getCairoDateKey(new Date());
    // doc منفصل لكل mode عشان العدّادين ميتداخلوش
    const usageDocId = mode === 'quickAdd' ? `quickAdd-${dayKey}` : `smartRx-${dayKey}`;

    const result = await db.runTransaction(async (tx) => {
      const doctorProfile = await loadUnifiedDoctorProfile({ db, userId, tx });
      if (!doctorProfile.exists) {
        throw new HttpsError('not-found', 'Doctor account not found');
      }

      const accountType = resolveDoctorAccountType(doctorProfile.mergedData);

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

      // مفاتيح الرسالة + الحد + اسم الحقل بناءً على الـmode (analyze vs quickAdd)
      const messageKeys = mode === 'quickAdd'
        ? { freeKey: 'freeQuickAddLimitMessage', premiumKey: 'premiumQuickAddLimitMessage', proMaxKey: 'proMaxQuickAddLimitMessage' }
        : { freeKey: 'freeAnalysisLimitMessage', premiumKey: 'premiumAnalysisLimitMessage', proMaxKey: 'proMaxAnalysisLimitMessage' };
      const whatsappKeys = mode === 'quickAdd'
        ? { freeKey: 'freeQuickAddWhatsappMessage', premiumKey: 'premiumQuickAddWhatsappMessage', proMaxKey: 'proMaxQuickAddWhatsappMessage' }
        : { freeKey: 'freeAnalysisWhatsappMessage', premiumKey: 'premiumAnalysisWhatsappMessage', proMaxKey: 'proMaxAnalysisWhatsappMessage' };
      const limitKeys = mode === 'quickAdd'
        ? { freeKey: 'freeQuickAddDailyLimit', premiumKey: 'premiumQuickAddDailyLimit', proMaxKey: 'proMaxQuickAddDailyLimit' }
        : { freeKey: 'freeDailyLimit', premiumKey: 'premiumDailyLimit', proMaxKey: 'proMaxDailyLimit' };
      // اسم الحقل في usage doc — منفصل لكل mode
      const fieldName = mode === 'quickAdd' ? 'quickAddCount' : 'smartPrescriptionCount';

      const limitReachedMessage = pickTierValue(accountType, config, messageKeys);
      const whatsappMessage = pickTierValue(accountType, config, whatsappKeys);
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);
      const limit = pickTierValue(accountType, config, limitKeys);

      const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
      const used = Number(usageDoc.mergedUsageData?.[fieldName] || 0);

      if (used >= limit) {
        // كود الخطأ بيتطابق مع الموجود في الـfrontend (SMART_RX_DAILY_LIMIT_REACHED) — نفس الـmessage
        // لكلا الـmodes عشان handler واحد في useDrHyper.smartActions يتعامل مع الاتنين
        throw new HttpsError('resource-exhausted', 'SMART_RX_DAILY_LIMIT_REACHED', {
          accountType,
          mode,
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

      const nextUsed = used + 1;
      tx.set(usageDoc.userUsageRef, {
        doctorId: userId,
        dayKey,
        accountType,
        mode, // نخزن الـmode في الـdoc للـdebugging والـanalytics
        [fieldName]: nextUsed,
        limitApplied: limit,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: usageDoc.userUsageSnap.exists
          ? usageDoc.userUsageSnap.data()?.createdAt || admin.firestore.FieldValue.serverTimestamp()
          : usageDoc.mergedUsageData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      return {
        accountType,
        mode,
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


  return consumeSmartPrescriptionQuota;
};
