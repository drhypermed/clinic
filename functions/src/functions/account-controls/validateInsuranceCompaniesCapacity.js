// ─────────────────────────────────────────────────────────────────────────────
// validateInsuranceCompaniesCapacity — فحص سعة شركات التأمين على السيرفر
// ─────────────────────────────────────────────────────────────────────────────
// شركات التأمين بتتخزن في:
//   users/{uid}/insuranceCompanies/{companyId}  (مجموعة فرعية)
// السيرفر بيعد الوثائق الفعلية (count aggregation) ويقارنها بحد الأدمن.
// لو وصل للحد، بيرفض ويرجع رسالة الأدمن المخصصة + رابط واتساب.
//
// 🆕 ميزة 2026-04: تمييز بين الباقات (مجاني=2 · برو=10 · برو ماكس=50)
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

  const validateInsuranceCompaniesCapacity = async (request) => {
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
      freeKey: 'freeInsuranceCompaniesMaxCount',
      premiumKey: 'premiumInsuranceCompaniesMaxCount',
      proMaxKey: 'proMaxInsuranceCompaniesMaxCount',
    });

    // ─ تشديد: لو الـclient بعت companyId لشركة موجودة → تعديل (مش إنشاء) → سماح بدون فحص
    //   نتأكد من الوجود الفعلي عشان مش نصدّق client على بلاطة
    const companyIdToUpdate = String(request?.data?.companyId || '').trim();
    if (companyIdToUpdate) {
      const docRef = db.collection('users').doc(userId)
        .collection('insuranceCompanies').doc(companyIdToUpdate);
      const snap = await docRef.get();
      if (snap.exists) {
        return {
          accountType,
          limit,
          used: limit, // مش بنعدّ الفعلي للـedit — توفير قراءة
          remaining: 0,
          whatsappNumber: config.whatsappNumber,
          whatsappUrl: '',
          limitReachedMessage: '',
          whatsappMessage: '',
        };
      }
    }

    // count() aggregation = ~1 read لكل 1000 وثيقة (Firebase pricing)
    const ref = db.collection('users').doc(userId).collection('insuranceCompanies');
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
      freeKey: 'freeInsuranceCompaniesCapacityMessage',
      premiumKey: 'premiumInsuranceCompaniesCapacityMessage',
      proMaxKey: 'proMaxInsuranceCompaniesCapacityMessage',
    });
    const whatsappMessage = pickTierValue(accountType, config, {
      freeKey: 'freeInsuranceCompaniesCapacityWhatsappMessage',
      premiumKey: 'premiumInsuranceCompaniesCapacityWhatsappMessage',
      proMaxKey: 'proMaxInsuranceCompaniesCapacityWhatsappMessage',
    });
    const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

    throw new HttpsError('resource-exhausted', 'INSURANCE_COMPANIES_CAPACITY_REACHED', {
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

  return validateInsuranceCompaniesCapacity;
};
