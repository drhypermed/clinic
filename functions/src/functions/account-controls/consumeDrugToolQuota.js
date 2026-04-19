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
  const consumeDrugToolQuota = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const feature = String(request?.data?.feature || '');
    if (feature !== 'interactionTool' && feature !== 'renalTool' && feature !== 'pregnancyTool') {
      throw new HttpsError('invalid-argument', 'Invalid feature');
    }

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();
    const dayKey = getCairoDateKey(new Date());
    const usageDocId = `drugTool-${feature}-${dayKey}`;

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

      const toolTitle = feature === 'interactionTool'
        ? 'التفاعلات الدوائية'
        : feature === 'renalTool'
          ? 'جرعات الكلى'
          : 'الأمان في الحمل والرضاعة';
      const planLabel = accountType === 'premium' ? 'المميز' : 'المجاني';
      const limitReachedMessage = `تم استهلاك الحد اليومي لأداة ${toolTitle} ({limit}) للحساب ${planLabel}. للتواصل واتساب`;
      const whatsappMessage = accountType === 'premium'
        ? config.premiumAnalysisWhatsappMessage
        : config.freeAnalysisWhatsappMessage;
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

      // حماية server-side لعلم premiumOnly: لو الأداة مقفولة للحساب المجاني،
      // نرفض الطلب فوراً بدلاً من الاعتماد على حاجز الواجهة فقط.
      const isPremiumOnly = feature === 'interactionTool'
        ? Boolean(config.interactionToolPremiumOnly)
        : feature === 'renalTool'
          ? Boolean(config.renalToolPremiumOnly)
          : Boolean(config.pregnancyToolPremiumOnly);

      if (isPremiumOnly && accountType !== 'premium') {
        const lockedMessage = feature === 'interactionTool'
          ? config.interactionToolLockedMessage
          : feature === 'renalTool'
            ? config.renalToolLockedMessage
            : config.pregnancyToolLockedMessage;
        throw new HttpsError('permission-denied', 'DRUG_TOOL_PREMIUM_ONLY', {
          accountType,
          feature,
          premiumOnly: true,
          lockedMessage,
          whatsappNumber: config.whatsappNumber,
          whatsappUrl,
          whatsappMessage,
        });
      }

      const limit = feature === 'interactionTool'
        ? (accountType === 'premium' ? config.premiumInteractionToolDailyLimit : config.freeInteractionToolDailyLimit)
        : feature === 'renalTool'
          ? (accountType === 'premium' ? config.premiumRenalToolDailyLimit : config.freeRenalToolDailyLimit)
          : (accountType === 'premium' ? config.premiumPregnancyToolDailyLimit : config.freePregnancyToolDailyLimit);
      const fieldName = feature === 'interactionTool'
        ? 'interactionToolCount'
        : feature === 'renalTool'
          ? 'renalToolCount'
          : 'pregnancyToolCount';

      const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
      const used = Number(usageDoc.mergedUsageData?.[fieldName] || 0);

      if (used >= limit) {
        throw new HttpsError('resource-exhausted', 'DRUG_TOOL_DAILY_LIMIT_REACHED', {
          accountType,
          feature,
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
        feature,
        [fieldName]: nextUsed,
        limitApplied: limit,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: usageDoc.userUsageSnap.exists
          ? usageDoc.userUsageSnap.data()?.createdAt || admin.firestore.FieldValue.serverTimestamp()
          : usageDoc.mergedUsageData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      return {
        accountType,
        feature,
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

  return consumeDrugToolQuota;
};
