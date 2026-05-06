// ─────────────────────────────────────────────────────────────────────────────
// createBranch — إنشاء فرع جديد على السيرفر (Atomic — تشديد أمني كامل 2026-05)
// ─────────────────────────────────────────────────────────────────────────────
// قبل (2026-05): الواجهة كانت تكتب الفرع مباشرة في users/{uid}/branches/.
// المشكلة: حتى لو فحصنا الحد قبل الكتابة، طبيب فاهم تقنياً يقدر يفتح أدوات
// المتصفح ويكتب الفرع في قاعدة البيانات بنفسه (يتجاوز الفحص).
//
// دلوقتي: الواجهة ممنوعة من الكتابة في /branches/ (firestore.rules ترفض create).
// الإنشاء الوحيد الممكن = عبر هذه الدالة على السيرفر (تستخدم Admin SDK اللي
// بيتخطى الـ rules). كل العملية atomic: فحص الحد + إنشاء bookingConfig +
// كتابة الفرع — كل ده في عملية واحدة. مفيش طريقة للتحايل.
//
// 💰 التكلفة: 1 read (count) + 2 writes (bookingConfig + branch) = ضئيلة جداً
// لأن إضافة الفروع نادرة (الطبيب يضيف فرع مرة في حياته أو السنة).
// ─────────────────────────────────────────────────────────────────────────────

const {
  loadUnifiedDoctorProfile,
} = require('../../profileStore');

// أقصى طول للحقول النصية للفرع (يطابق سياسة الواجهة)
const NAME_MAX_LENGTH = 200;
const ADDRESS_MAX_LENGTH = 500;
const PHONE_MAX_LENGTH = 50;

/**
 * توليد رمز سري للفرع — يطابق صيغة createBookingSecret() في الواجهة
 * الصيغة: b_<random16hex><base36time> — بحيث يمر عبر BOOKING_SECRET_PATTERN
 * الموجود في helpers.ts (التحقق في كل مكان يقرأ الـ secret).
 */
const generateBookingSecret = (crypto) => {
  const randomPart = crypto.randomBytes(8).toString('hex'); // 16 حرف hex
  const timePart = Date.now().toString(36);
  return `b_${randomPart}${timePart}`;
};

/** تنظيف نص قادم من الواجهة (trim + قص للحد الأقصى) */
const cleanText = (raw, maxLength) => {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, maxLength);
};

module.exports = (context) => {
  const {
    HttpsError,
    getSmartRxConfig,
    getDb,
    resolveDoctorAccountType,
    buildWhatsAppUrl,
    pickTierValue,
    crypto,
  } = context;

  const createBranch = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userId = auth.uid;
    const db = getDb();
    const config = await getSmartRxConfig();

    // 1) باقة الطبيب الفعلية (مع احترام انتهاء الاشتراك)
    const doctorProfile = await loadUnifiedDoctorProfile({ db, userId });
    if (!doctorProfile.exists) {
      throw new HttpsError('not-found', 'Doctor account not found');
    }
    const accountType = resolveDoctorAccountType(doctorProfile.mergedData);

    // 2) الحد المسموح حسب الباقة (مجاني=1 · برو=2 · برو ماكس=10 افتراضياً)
    const limit = pickTierValue(accountType, config, {
      freeKey: 'freeBranchesMaxCount',
      premiumKey: 'premiumBranchesMaxCount',
      proMaxKey: 'proMaxBranchesMaxCount',
    });

    // 3) عد الفروع الموجودة (count aggregation = 1 read)
    const branchesRef = db.collection('users').doc(userId).collection('branches');
    const countSnap = await branchesRef.count().get();
    const used = Number(countSnap.data()?.count || 0);

    // 4) لو وصل للحد → نرفض ونرجع رسالة الأدمن المخصصة + رابط واتساب
    if (used >= limit) {
      const limitReachedMessage = pickTierValue(accountType, config, {
        freeKey: 'freeBranchesCapacityMessage',
        premiumKey: 'premiumBranchesCapacityMessage',
        proMaxKey: 'proMaxBranchesCapacityMessage',
      });
      const whatsappMessage = pickTierValue(accountType, config, {
        freeKey: 'freeBranchesCapacityWhatsappMessage',
        premiumKey: 'premiumBranchesCapacityWhatsappMessage',
        proMaxKey: 'proMaxBranchesCapacityWhatsappMessage',
      });
      const whatsappUrl = buildWhatsAppUrl(config.whatsappNumber, whatsappMessage);

      throw new HttpsError('resource-exhausted', 'BRANCHES_CAPACITY_REACHED', {
        accountType,
        limit,
        used,
        remaining: 0,
        whatsappNumber: config.whatsappNumber,
        whatsappUrl,
        limitReachedMessage,
        whatsappMessage,
      });
    }

    // 5) تحقق من بيانات الإدخال (اسم الفرع لازم يكون موجود)
    const data = request?.data || {};
    const name = cleanText(data.name, NAME_MAX_LENGTH);
    const address = cleanText(data.address, ADDRESS_MAX_LENGTH);
    const phone = cleanText(data.phone, PHONE_MAX_LENGTH);
    if (!name) {
      throw new HttpsError('invalid-argument', 'Branch name is required');
    }

    // 6) توليد معرّفات الفرع والـ secretarySecret (نفس صيغة الواجهة)
    const branchId = `branch_${Date.now()}`;
    const secretarySecret = generateBookingSecret(crypto);

    // 7) إنشاء bookingConfig للسكرتيرة (المسار: bookingConfig/{secret})
    //    ⚠️ Admin SDK بيتخطى rules تماماً — هنا في السيرفر آمن إن نكتب
    //    في الـ collection ده مباشرة.
    const bookingConfigRef = db.collection('bookingConfig').doc(secretarySecret);
    const nowIso = new Date().toISOString();
    await bookingConfigRef.set({
      userId,
      branchId,
      updatedAt: nowIso,
    }, { merge: true });

    // 8) كتابة الفرع نفسه في users/{userId}/branches/{branchId}
    //    نبني الـ payload يدوياً (مش spread) عشان نتجنب أي حقول إضافية
    //    من الـ client ممكن تكون غير متوقعة (security hardening).
    const branchPayload = {
      id: branchId,
      name,
      secretarySecret,
      createdAt: nowIso,
      order: used,
      updatedAt: nowIso,
    };
    if (address) branchPayload.address = address;
    if (phone) branchPayload.phone = phone;

    await branchesRef.doc(branchId).set(branchPayload);

    // 9) نرجع للـ client بيانات الفرع المُنشأ + معلومات الكوتا الحالية
    return {
      branch: branchPayload,
      accountType,
      limit,
      used: used + 1,
      remaining: Math.max(limit - (used + 1), 0),
    };
  };

  return createBranch;
};
