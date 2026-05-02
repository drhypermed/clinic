const {
  buildDoctorUserProfilePayload,
  loadUnifiedDoctorProfile,
  loadUnifiedUsageDoc,
} = require('../../profileStore');

// مفاتيح الـ config لكل feature × tier — ثابتة، فنعرّفها مرّة واحدة على
// مستوى الموديول بدل ما نـallocate object جديد كل استدعاء (وكل retry للمعاملة).
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
  // ─ أزرار تصدير الروشتة ─
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

const VALID_FEATURES = Object.keys(FEATURE_KEYS_MAP);

// 🆕 (2026-05) — الميزات اللي اتفتحت للـ paid tiers بدون فحص.
// الـ medicalReportPrint مش هنا (لسه بفحص للجميع).
const FEATURES_OPEN_FOR_PAID = new Set([
  'prescriptionPrint',
  'prescriptionDownload',
  'prescriptionWhatsapp',
  'readyPrescriptionSave',
]);

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
    const feature = String(request?.data?.feature || '');
    if (!VALID_FEATURES.includes(feature)) {
      throw new HttpsError('invalid-argument', 'Invalid feature');
    }

    const userId = auth.uid;
    const db = getDb();
    const dayKey = getCairoDateKey(new Date());
    const usageDocId = `${feature}-${dayKey}`;

    // ─ تحسين سرعة 2026-05 ─
    // قبل التحسين: كل العمليات (config + doctor profile + usage) كانت بتتم
    // بالتسلسل، والـdoctor profile read كان جوّه المعاملة (transaction).
    // المعاملة الطويلة = contention أعلى + تأخير أكتر.
    //
    // بعد التحسين:
    //   1) config + doctor profile بيتقروا بالتوازي (Promise.all) → نوفر RTT واحد.
    //   2) doctor profile بقى بره المعاملة — accountType بيتغير نادراً جداً
    //      (admin upgrade) فالـstale read مش مشكلة لطباعة واحدة.
    //   3) المعاملة بقت قصيرة: قراءة usage doc + كتابة العداد بس.
    //   4) backfill ملف الطبيب (لو مش موجود) بقى fire-and-forget بره المعاملة.
    const [config, doctorProfile] = await Promise.all([
      getSmartRxConfig(),
      loadUnifiedDoctorProfile({ db, userId, tx: null }),
    ]);

    if (!doctorProfile.exists) {
      throw new HttpsError('not-found', 'Doctor account not found');
    }

    const accountType = resolveDoctorAccountType(doctorProfile.mergedData);

    // 🆕 (2026-05): paid tiers بدون فحص للميزات المدفوعة. نرجع فوراً بدون
    // كتابة عداد ولا فتح transaction → توفير ٢-٥ ثواني وكتابات Firestore.
    if (FEATURES_OPEN_FOR_PAID.has(feature) && (accountType === 'premium' || accountType === 'pro_max')) {
      return {
        accountType,
        feature,
        limit: 0, // 0 = unlimited
        used: 0,
        remaining: Number.MAX_SAFE_INTEGER,
        dayKey,
        whatsappNumber: '',
        whatsappUrl: '',
        limitReachedMessage: '',
        whatsappMessage: '',
      };
    }

    // backfill ملف الطبيب (مسار نادر — أول مرة بعد ترحيل قديم) — fire-and-forget
    // علشان ما يأخّرش الطباعة. أي فشل بيتسجل في الـlogs بدون ما يقطع المسار.
    if (!doctorProfile.userSnap.exists) {
      doctorProfile.userRef.set(buildDoctorUserProfilePayload({
        uid: userId,
        accountType,
        premiumStartDate: typeof doctorProfile.mergedData?.premiumStartDate === 'string' ? doctorProfile.mergedData.premiumStartDate : null,
        premiumExpiryDate: typeof doctorProfile.mergedData?.premiumExpiryDate === 'string' ? doctorProfile.mergedData.premiumExpiryDate : null,
        doctorName: typeof doctorProfile.mergedData?.doctorName === 'string' ? doctorProfile.mergedData.doctorName : '',
        doctorEmail: typeof doctorProfile.mergedData?.doctorEmail === 'string'
          ? doctorProfile.mergedData.doctorEmail
          : (typeof doctorProfile.mergedData?.email === 'string' ? doctorProfile.mergedData.email : ''),
        syncedFromLegacyDoctorAt: admin.firestore.FieldValue.serverTimestamp(),
      }), { merge: true }).catch((err) => {
        console.warn('[consumeStorageQuota] doctor profile backfill failed', { userId, err: err?.message });
      });
    }

    // حساب الحد + الرسائل بره المعاملة (كلها dependent على accountType + config بس)
    const keysByFeature = FEATURE_KEYS_MAP[feature];
    const fieldName = keysByFeature.fieldName;
    const limitReachedMessage = pickTierValue(accountType, config, keysByFeature.msg);
    const whatsappMessage = pickTierValue(accountType, config, keysByFeature.wa);
    const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);
    const limit = pickTierValue(accountType, config, keysByFeature.limit);

    // المعاملة الذرّية الوحيدة المتبقية: قراءة العداد + التحقق من الحد + الكتابة.
    // هي السبب الوحيد لاستخدام transaction — منع race condition بين ضغطتين
    // متزامنتين للطباعة من نفس الطبيب.
    const result = await db.runTransaction(async (tx) => {
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
