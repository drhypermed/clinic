// ─────────────────────────────────────────────────────────────────────────────
// validateMedicationCustomizationsCapacity — فحص سعة الأدوية المعدّلة على السيرفر
// ─────────────────────────────────────────────────────────────────────────────
// الأدوية المعدّلة بتتخزن كـmap في وثيقة الطبيب نفسها:
//   users/{uid}.medicationCustomizations = { [medId]: customization }
// السيرفر بيعد المفاتيح ويقارنها بالحد المسموح من إعدادات الأدمن.
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

  const validateMedicationCustomizationsCapacity = async (request) => {
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

    // 🆕 (2026-05): paid tiers بدون فحص حد كلي للأدوية المعدّلة
    if (accountType === 'premium' || accountType === 'pro_max') {
      return {
        accountType,
        limit: 0,
        used: 0,
        remaining: Number.MAX_SAFE_INTEGER,
        whatsappNumber: '',
        whatsappUrl: '',
        limitReachedMessage: '',
        whatsappMessage: '',
      };
    }

    const limit = pickTierValue(accountType, config, {
      freeKey: 'freeMedicationCustomizationsMaxCount',
      premiumKey: 'premiumMedicationCustomizationsMaxCount',
      proMaxKey: 'proMaxMedicationCustomizationsMaxCount',
    });

    // الأدوية المعدّلة كـmap في user doc — نقرا الوثيقة ونعد المفاتيح (1 read فقط)
    const userData = doctorProfile.mergedData || {};
    const customizations = (userData.medicationCustomizations || {});
    const used = (typeof customizations === 'object' && customizations !== null)
      ? Object.keys(customizations).length
      : 0;

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
      freeKey: 'freeMedicationCustomizationsCapacityMessage',
      premiumKey: 'premiumMedicationCustomizationsCapacityMessage',
      proMaxKey: 'proMaxMedicationCustomizationsCapacityMessage',
    });
    const whatsappMessage = pickTierValue(accountType, config, {
      freeKey: 'freeMedicationCustomizationsCapacityWhatsappMessage',
      premiumKey: 'premiumMedicationCustomizationsCapacityWhatsappMessage',
      proMaxKey: 'proMaxMedicationCustomizationsCapacityWhatsappMessage',
    });
    const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

    throw new HttpsError('resource-exhausted', 'MEDICATION_CUSTOMIZATIONS_CAPACITY_REACHED', {
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

  return validateMedicationCustomizationsCapacity;
};
