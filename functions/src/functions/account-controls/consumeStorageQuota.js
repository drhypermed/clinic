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
  const consumeStorageQuota = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const feature = String(request?.data?.feature || '');
    if (feature !== 'recordSave' && feature !== 'readyPrescriptionSave' && feature !== 'medicalReportPrint') {
      throw new HttpsError('invalid-argument', 'Invalid feature');
    }

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();
    const dayKey = getCairoDateKey(new Date());
    const usageDocId = `${feature}-${dayKey}`;

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

      const featureConfig = feature === 'recordSave'
        ? {
          freeLimit: config.freeRecordDailyLimit,
          premiumLimit: config.premiumRecordDailyLimit,
          freeLimitMessage: config.freeRecordLimitMessage,
          premiumLimitMessage: config.premiumRecordLimitMessage,
          freeWhatsappMessage: config.freeRecordWhatsappMessage,
          premiumWhatsappMessage: config.premiumRecordWhatsappMessage,
          fieldName: 'recordSaveCount',
        }
        : feature === 'readyPrescriptionSave'
          ? {
            freeLimit: config.freeReadyPrescriptionDailyLimit,
            premiumLimit: config.premiumReadyPrescriptionDailyLimit,
            freeLimitMessage: config.freeReadyPrescriptionDailyLimitMessage,
            premiumLimitMessage: config.premiumReadyPrescriptionDailyLimitMessage,
            freeWhatsappMessage: config.freeReadyPrescriptionWhatsappMessage,
            premiumWhatsappMessage: config.premiumReadyPrescriptionWhatsappMessage,
            fieldName: 'readyPrescriptionSaveCount',
          }
          : {
            freeLimit: config.freeMedicalReportDailyLimit,
            premiumLimit: config.premiumMedicalReportDailyLimit,
            freeLimitMessage: config.freeMedicalReportLimitMessage,
            premiumLimitMessage: config.premiumMedicalReportLimitMessage,
            freeWhatsappMessage: config.freeMedicalReportWhatsappMessage,
            premiumWhatsappMessage: config.premiumMedicalReportWhatsappMessage,
            fieldName: 'medicalReportPrintCount',
          };

      const limitReachedMessage = accountType === 'premium'
        ? featureConfig.premiumLimitMessage
        : featureConfig.freeLimitMessage;
      const whatsappMessage = accountType === 'premium'
        ? featureConfig.premiumWhatsappMessage
        : featureConfig.freeWhatsappMessage;
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

      const limit = accountType === 'premium' ? featureConfig.premiumLimit : featureConfig.freeLimit;

      const fieldName = featureConfig.fieldName;
      const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
      const used = Number(usageDoc.mergedUsageData?.[fieldName] || 0);

      if (used >= limit) {
        throw new HttpsError('resource-exhausted', 'STORAGE_DAILY_LIMIT_REACHED', {
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

  
  return consumeStorageQuota;
};
