// ─────────────────────────────────────────────────────────────────────────────
// validateReadyPrescriptionsCapacity — فحص سعة الروشتات الجاهزة على السيرفر
// ─────────────────────────────────────────────────────────────────────────────
// قبل (حتى 2026-04): الفحص client-side فقط — ممكن يتجاوز عبر dev tools.
// دلوقتي: السيرفر بيعد الروشتات الجاهزة الفعلية ويقارنها بالحد المسموح من
// إعدادات الأدمن (3 فئات: مجاني / برو / برو ماكس). لو وصل للحد، بيرفض ويرجع
// رسالة الأدمن المخصصة + رابط واتساب.
// ─────────────────────────────────────────────────────────────────────────────

const {
  loadUnifiedDoctorProfile,
} = require('../../profileStore');

module.exports = (context) => {
  const {
    HttpsError,
    getSmartRxConfig,
    getDb,
    resolveDoctorAccountType,
    buildWhatsAppUrl,
    pickTierValue,
  } = context;

  const validateReadyPrescriptionsCapacity = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();

    const doctorProfile = await loadUnifiedDoctorProfile({ db, userId });
    if (!doctorProfile.exists) {
      throw new HttpsError('not-found', 'Doctor account not found');
    }
    const accountType = resolveDoctorAccountType(doctorProfile.mergedData);

    const limit = pickTierValue(accountType, config, {
      freeKey: 'freeReadyPrescriptionsMaxCount',
      premiumKey: 'premiumReadyPrescriptionsMaxCount',
      proMaxKey: 'proMaxReadyPrescriptionsMaxCount',
    });

    // count() aggregation = ~1 read لكل 1000 وثيقة (Firebase pricing)
    const ref = db.collection('users').doc(userId).collection('readyPrescriptions');
    const countSnap = await ref.count().get();
    const used = Number(countSnap.data()?.count || 0);

    if (used < limit) {
      return {
        accountType,
        limit,
        used,
        remaining: Math.max(limit - used, 0),
        whatsappNumber: config.whatsappNumber,
        whatsappUrl: '',
        limitReachedMessage: '',
        whatsappMessage: '',
      };
    }

    const limitReachedMessage = pickTierValue(accountType, config, {
      freeKey: 'freeReadyPrescriptionsCapacityMessage',
      premiumKey: 'premiumReadyPrescriptionsCapacityMessage',
      proMaxKey: 'proMaxReadyPrescriptionsCapacityMessage',
    });
    const whatsappMessage = pickTierValue(accountType, config, {
      freeKey: 'freeReadyPrescriptionsCapacityWhatsappMessage',
      premiumKey: 'premiumReadyPrescriptionsCapacityWhatsappMessage',
      proMaxKey: 'proMaxReadyPrescriptionsCapacityWhatsappMessage',
    });
    const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

    throw new HttpsError('resource-exhausted', 'READY_PRESCRIPTIONS_CAPACITY_REACHED', {
      accountType,
      limit,
      used,
      remaining: 0,
      whatsappNumber: config.whatsappNumber,
      whatsappUrl,
      limitReachedMessage,
      whatsappMessage,
    });
  };

  return validateReadyPrescriptionsCapacity;
};
