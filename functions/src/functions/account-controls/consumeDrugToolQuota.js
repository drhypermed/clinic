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

      const messageKeys = feature === 'interactionTool'
        ? { freeKey: 'freeInteractionToolLimitMessage', premiumKey: 'premiumInteractionToolLimitMessage', proMaxKey: 'proMaxInteractionToolLimitMessage' }
        : feature === 'renalTool'
          ? { freeKey: 'freeRenalToolLimitMessage', premiumKey: 'premiumRenalToolLimitMessage', proMaxKey: 'proMaxRenalToolLimitMessage' }
          : { freeKey: 'freePregnancyToolLimitMessage', premiumKey: 'premiumPregnancyToolLimitMessage', proMaxKey: 'proMaxPregnancyToolLimitMessage' };
      const whatsappKeys = feature === 'interactionTool'
        ? { freeKey: 'freeInteractionToolWhatsappMessage', premiumKey: 'premiumInteractionToolWhatsappMessage', proMaxKey: 'proMaxInteractionToolWhatsappMessage' }
        : feature === 'renalTool'
          ? { freeKey: 'freeRenalToolWhatsappMessage', premiumKey: 'premiumRenalToolWhatsappMessage', proMaxKey: 'proMaxRenalToolWhatsappMessage' }
          : { freeKey: 'freePregnancyToolWhatsappMessage', premiumKey: 'premiumPregnancyToolWhatsappMessage', proMaxKey: 'proMaxPregnancyToolWhatsappMessage' };
      const limitReachedMessage = pickTierValue(accountType, config, messageKeys);
      const whatsappMessage = pickTierValue(accountType, config, whatsappKeys);
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

      // حماية server-side: الأداة مقفولة للمجاني فقط — برو وبرو ماكس متاح لهم.
      // (الـ flag في الـ config اسمه premiumOnly تاريخياً لكن معناه "مدفوع فقط")
      const isProOnly = feature === 'interactionTool'
        ? Boolean(config.interactionToolPremiumOnly)
        : feature === 'renalTool'
          ? Boolean(config.renalToolPremiumOnly)
          : Boolean(config.pregnancyToolPremiumOnly);

      const isPaidTier = accountType === 'premium' || accountType === 'pro_max';
      if (isProOnly && !isPaidTier) {
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
        ? pickTierValue(accountType, config, { freeKey: 'freeInteractionToolDailyLimit', premiumKey: 'premiumInteractionToolDailyLimit', proMaxKey: 'proMaxInteractionToolDailyLimit' })
        : feature === 'renalTool'
          ? pickTierValue(accountType, config, { freeKey: 'freeRenalToolDailyLimit', premiumKey: 'premiumRenalToolDailyLimit', proMaxKey: 'proMaxRenalToolDailyLimit' })
          : pickTierValue(accountType, config, { freeKey: 'freePregnancyToolDailyLimit', premiumKey: 'premiumPregnancyToolDailyLimit', proMaxKey: 'proMaxPregnancyToolDailyLimit' });
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
