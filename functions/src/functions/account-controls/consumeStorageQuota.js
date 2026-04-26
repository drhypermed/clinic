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
  const consumeStorageQuota = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    // ─ recordSave اتشال من هنا 2026-04 — السجلات بقت "حد كلي" بفحص client-side
    //   (مش حد يومي بحساب server-side عبر هذه الـquota function).
    // ─ 🆕 ضفنا 3 ميزات جديدة 2026-04: تصدير الروشتة (طباعة + تنزيل + واتساب) ─
    const feature = String(request?.data?.feature || '');
    const validFeatures = [
      'readyPrescriptionSave',
      'medicalReportPrint',
      'prescriptionPrint',
      'prescriptionDownload',
      'prescriptionWhatsapp',
    ];
    if (!validFeatures.includes(feature)) {
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

      // مفاتيح الـ config لكل feature × tier — نستخدم pickTierValue للاختيار الصحيح
      const FEATURE_KEYS_MAP = {
        readyPrescriptionSave: {
          limit: { freeKey: 'freeReadyPrescriptionDailyLimit', premiumKey: 'premiumReadyPrescriptionDailyLimit', proMaxKey: 'proMaxReadyPrescriptionDailyLimit' },
          msg: { freeKey: 'freeReadyPrescriptionDailyLimitMessage', premiumKey: 'premiumReadyPrescriptionDailyLimitMessage', proMaxKey: 'proMaxReadyPrescriptionDailyLimitMessage' },
          wa: { freeKey: 'freeReadyPrescriptionWhatsappMessage', premiumKey: 'premiumReadyPrescriptionWhatsappMessage', proMaxKey: 'proMaxReadyPrescriptionWhatsappMessage' },
          fieldName: 'readyPrescriptionSaveCount',
        },
        medicalReportPrint: {
          limit: { freeKey: 'freeMedicalReportDailyLimit', premiumKey: 'premiumMedicalReportDailyLimit', proMaxKey: 'proMaxMedicalReportDailyLimit' },
          msg: { freeKey: 'freeMedicalReportLimitMessage', premiumKey: 'premiumMedicalReportLimitMessage', proMaxKey: 'proMaxMedicalReportLimitMessage' },
          wa: { freeKey: 'freeMedicalReportWhatsappMessage', premiumKey: 'premiumMedicalReportWhatsappMessage', proMaxKey: 'proMaxMedicalReportWhatsappMessage' },
          fieldName: 'medicalReportPrintCount',
        },
        // ─ 🆕 أزرار تصدير الروشتة ─
        prescriptionPrint: {
          limit: { freeKey: 'freePrescriptionPrintDailyLimit', premiumKey: 'premiumPrescriptionPrintDailyLimit', proMaxKey: 'proMaxPrescriptionPrintDailyLimit' },
          msg: { freeKey: 'freePrescriptionPrintLimitMessage', premiumKey: 'premiumPrescriptionPrintLimitMessage', proMaxKey: 'proMaxPrescriptionPrintLimitMessage' },
          wa: { freeKey: 'freePrescriptionPrintWhatsappMessage', premiumKey: 'premiumPrescriptionPrintWhatsappMessage', proMaxKey: 'proMaxPrescriptionPrintWhatsappMessage' },
          fieldName: 'prescriptionPrintCount',
        },
        prescriptionDownload: {
          limit: { freeKey: 'freePrescriptionDownloadDailyLimit', premiumKey: 'premiumPrescriptionDownloadDailyLimit', proMaxKey: 'proMaxPrescriptionDownloadDailyLimit' },
          msg: { freeKey: 'freePrescriptionDownloadLimitMessage', premiumKey: 'premiumPrescriptionDownloadLimitMessage', proMaxKey: 'proMaxPrescriptionDownloadLimitMessage' },
          wa: { freeKey: 'freePrescriptionDownloadWhatsappMessage', premiumKey: 'premiumPrescriptionDownloadWhatsappMessage', proMaxKey: 'proMaxPrescriptionDownloadWhatsappMessage' },
          fieldName: 'prescriptionDownloadCount',
        },
        prescriptionWhatsapp: {
          limit: { freeKey: 'freePrescriptionWhatsappDailyLimit', premiumKey: 'premiumPrescriptionWhatsappDailyLimit', proMaxKey: 'proMaxPrescriptionWhatsappDailyLimit' },
          msg: { freeKey: 'freePrescriptionWhatsappLimitMessage', premiumKey: 'premiumPrescriptionWhatsappLimitMessage', proMaxKey: 'proMaxPrescriptionWhatsappLimitMessage' },
          wa: { freeKey: 'freePrescriptionWhatsappWhatsappMessage', premiumKey: 'premiumPrescriptionWhatsappWhatsappMessage', proMaxKey: 'proMaxPrescriptionWhatsappWhatsappMessage' },
          fieldName: 'prescriptionWhatsappCount',
        },
      };
      const keysByFeature = FEATURE_KEYS_MAP[feature];

      const featureConfig = { fieldName: keysByFeature.fieldName };
      const limitReachedMessage = pickTierValue(accountType, config, keysByFeature.msg);
      const whatsappMessage = pickTierValue(accountType, config, keysByFeature.wa);
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);
      const limit = pickTierValue(accountType, config, keysByFeature.limit);

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
