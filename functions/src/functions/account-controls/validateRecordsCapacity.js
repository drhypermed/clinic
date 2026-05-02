// ─────────────────────────────────────────────────────────────────────────────
// validateRecordsCapacity — فحص سعة السجلات الطبية على السيرفر
// ─────────────────────────────────────────────────────────────────────────────
// قبل (2026-04 وقبل): الفحص client-side بـ records.length في الذاكرة. كان
// ممكن طبيب فاهم تقنياً يتجاوزه عبر dev tools ويخزن سجلات بدون حد.
//
// دلوقتي: الـserver بيعد سجلات الطبيب الفعلية ويقارنها بالحد المسموح من إعدادات
// الأدمن (3 فئات: مجاني / برو / برو ماكس). لو وصل للحد، بيرفض ويرجع رسالة
// الأدمن المخصصة + رابط واتساب.
//
// 💰 التكلفة: count() aggregation = 1 read لكل 1000 سجل (Firebase pricing).
// عملياً: ~1-5 reads لكل فحص = $0.90/شهر لـ 1k طبيب يحفظ 50 سجل/يوم.
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

  const validateRecordsCapacity = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();

    // 1) نحدد باقة الطبيب الفعلية (مع احترام انتهاء الاشتراك)
    const doctorProfile = await loadUnifiedDoctorProfile({ db, userId });
    if (!doctorProfile.exists) {
      throw new HttpsError('not-found', 'Doctor account not found');
    }
    const accountType = resolveDoctorAccountType(doctorProfile.mergedData);

    // 🆕 (2026-05): paid tiers بدون فحص حد كلي للسجلات — نوفر count aggregation
    // وتخطي قراءة الـrecord. التشغيل أسرع وتكلفة Firebase أقل.
    if (accountType === 'premium' || accountType === 'pro_max') {
      return {
        accountType,
        limit: 0, // 0 = unlimited
        used: 0,
        remaining: Number.MAX_SAFE_INTEGER,
        whatsappNumber: '',
        whatsappUrl: '',
        limitReachedMessage: '',
        whatsappMessage: '',
      };
    }

    // 2) نختار الحد المسموح حسب الباقة
    const limit = pickTierValue(accountType, config, {
      freeKey: 'freeRecordsMaxCount',
      premiumKey: 'premiumRecordsMaxCount',
      proMaxKey: 'proMaxRecordsMaxCount',
    });

    // ─ تشديد 2026-04: لو الـclient بعت recordId لسجل موجود، يبقى ده تعديل
    //   (مش إنشاء جديد) — العدد مش هيزيد، فنسمح بدون فحص الحد. السيرفر
    //   بيتأكد من الوجود الفعلي عشان ميصدّقش الـclient على بلاطة (طبيب
    //   فاهم تقنياً مش يقدر يبعت id عشوائي ويتجاوز الفحص).
    //   💰 التكلفة: 1 read للـdoc بدل count aggregation = أرخص للـedits.
    const recordIdToUpdate = String(request?.data?.recordId || '').trim();
    if (recordIdToUpdate) {
      const recordRef = db.collection('users').doc(userId)
        .collection('records').doc(recordIdToUpdate);
      const recordSnap = await recordRef.get();
      if (recordSnap.exists) {
        // سجل موجود → تعديل → سماح بدون فحص الحد
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
      // الـid مش موجود → نكمّل كأنه إنشاء جديد (الـcount aggregation تحت)
    }

    // 3) نعد السجلات الفعلية للطبيب (count aggregation رخيص)
    const recordsRef = db.collection('users').doc(userId).collection('records');
    const countSnap = await recordsRef.count().get();
    const used = Number(countSnap.data()?.count || 0);

    // 4) لو السعة لسه فيها مكان — نسمح
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

    // 5) السعة وصلت للنهاية — نرفض ونرجع رسالة الأدمن
    const limitReachedMessage = pickTierValue(accountType, config, {
      freeKey: 'freeRecordsCapacityMessage',
      premiumKey: 'premiumRecordsCapacityMessage',
      proMaxKey: 'proMaxRecordsCapacityMessage',
    });
    const whatsappMessage = pickTierValue(accountType, config, {
      freeKey: 'freeRecordsCapacityWhatsappMessage',
      premiumKey: 'premiumRecordsCapacityWhatsappMessage',
      proMaxKey: 'proMaxRecordsCapacityWhatsappMessage',
    });
    const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

    throw new HttpsError('resource-exhausted', 'RECORDS_CAPACITY_REACHED', {
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

  return validateRecordsCapacity;
};
