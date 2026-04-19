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
  } = context;
  const consumeSmartPrescriptionQuota = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();
    const dayKey = getCairoDateKey(new Date());
    const usageDocId = `smartRx-${dayKey}`;

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
      const limitReachedMessage = accountType === 'premium'
        ? config.premiumAnalysisLimitMessage
        : config.freeAnalysisLimitMessage;
      const whatsappMessage = accountType === 'premium'
        ? config.premiumAnalysisWhatsappMessage
        : config.freeAnalysisWhatsappMessage;
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

      const limit = accountType === 'premium' ? config.premiumDailyLimit : config.freeDailyLimit;
  const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
  const used = Number(usageDoc.mergedUsageData?.smartPrescriptionCount || 0);

      if (used >= limit) {
        throw new HttpsError('resource-exhausted', 'SMART_RX_DAILY_LIMIT_REACHED', {
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

      const nextUsed = used + 1;
      tx.set(usageDoc.userUsageRef, {
        doctorId: userId,
        dayKey,
        accountType,
        smartPrescriptionCount: nextUsed,
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

  
  return consumeSmartPrescriptionQuota;
};
