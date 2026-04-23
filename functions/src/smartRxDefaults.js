
// ─────────────────────────────────────────────────────────────────────────
// الفئات: free = مجاني | premium = برو (القيمة الداخلية بقت "برو" في الواجهة)
//         pro_max = برو ماكس (جديدة — الأدمن يضبط مميزاتها لاحقاً)
// ملاحظة: احتفظنا بـ `premium*` keys كما هي عشان backward compat — الرسائل
// العربية بس اتغيرت لتقول "برو" بدل "المميز".
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_SMART_RX_CONFIG = {
  // ─── الكوتا اليومية ───
  freeDailyLimit: 2,
  premiumDailyLimit: 50,
  proMaxDailyLimit: 50,                   // (برو ماكس) الأدمن يضبطها لاحقاً
  freeRecordDailyLimit: 3,
  premiumRecordDailyLimit: 50,
  proMaxRecordDailyLimit: 50,
  freePublicBookingDailyLimit: 10,
  premiumPublicBookingDailyLimit: 200,
  proMaxPublicBookingDailyLimit: 200,
  freePublicFormBookingDailyLimit: 10,
  premiumPublicFormBookingDailyLimit: 200,
  proMaxPublicFormBookingDailyLimit: 200,
  freeSecretaryEntryRequestDailyLimit: 20,
  premiumSecretaryEntryRequestDailyLimit: 300,
  proMaxSecretaryEntryRequestDailyLimit: 300,
  freeReadyPrescriptionDailyLimit: 3,
  premiumReadyPrescriptionDailyLimit: 50,
  proMaxReadyPrescriptionDailyLimit: 50,
  freeMedicalReportDailyLimit: 3,
  premiumMedicalReportDailyLimit: 80,
  proMaxMedicalReportDailyLimit: 80,
  freeReadyPrescriptionsMaxCount: 5,
  premiumReadyPrescriptionsMaxCount: 100,
  proMaxReadyPrescriptionsMaxCount: 100,
  freeMedicationCustomizationsMaxCount: 20,
  premiumMedicationCustomizationsMaxCount: 500,
  proMaxMedicationCustomizationsMaxCount: 500,
  freeInteractionToolDailyLimit: 5000,
  premiumInteractionToolDailyLimit: 5000,
  proMaxInteractionToolDailyLimit: 5000,
  freeRenalToolDailyLimit: 5000,
  premiumRenalToolDailyLimit: 5000,
  proMaxRenalToolDailyLimit: 5000,
  freePregnancyToolDailyLimit: 5000,
  premiumPregnancyToolDailyLimit: 5000,
  proMaxPregnancyToolDailyLimit: 5000,

  // ─── رسائل استنفاد الكوتا (العربية المصرية) ───
  freeAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (50 مرة) لحساب برو. للتواصل واتساب',
  proMaxAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  freeRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (50 مرة) لحساب برو. للتواصل واتساب',
  proMaxRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  freePublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumPublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) لحساب برو. للتواصل واتساب',
  proMaxPublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) لحساب برو ماكس. للتواصل واتساب',
  freePublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumPublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) لحساب برو. للتواصل واتساب',
  proMaxPublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) لحساب برو ماكس. للتواصل واتساب',
  freeSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) لحساب برو. للتواصل واتساب',
  proMaxSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) لحساب برو ماكس. للتواصل واتساب',
  freeReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (50 مرة) لحساب برو. للتواصل واتساب',
  proMaxReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  freeMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) لحساب برو. للتواصل واتساب',
  proMaxMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) لحساب برو ماكس. للتواصل واتساب',
  freeReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) للحساب المجاني. احذف واحدة أولاً ثم أضف الجديدة.',
  premiumReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) لحساب برو. احذف واحدة أولاً ثم أضف الجديدة.',
  proMaxReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) لحساب برو ماكس. احذف واحدة أولاً ثم أضف الجديدة.',
  freeMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) للحساب المجاني.',
  premiumMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) لحساب برو.',
  proMaxMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) لحساب برو ماكس.',

  // ─── رسائل واتساب للترقية ───
  whatsappNumber: '201092805293',
  freeAnalysisWhatsappMessage: 'السلام عليكم، تجاوزت حد تحليل الحالة وأرغب في الاشتراك.',
  premiumAnalysisWhatsappMessage: 'السلام عليكم، استهلكت حد تحليل الحالة وأرغب في ترقية الباقة.',
  proMaxAnalysisWhatsappMessage: 'السلام عليكم، استهلكت حد تحليل الحالة في باقة برو ماكس وأرغب في التواصل.',
  freeRecordWhatsappMessage: 'السلام عليكم، تجاوزت حد حفظ السجلات وأرغب في الاشتراك.',
  premiumRecordWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ السجلات وأرغب في ترقية الباقة.',
  proMaxRecordWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ السجلات في باقة برو ماكس وأرغب في التواصل.',
  freePublicBookingWhatsappMessage: 'السلام عليكم، تجاوزت حد إضافة المواعيد اليومية وأرغب في الاشتراك.',
  premiumPublicBookingWhatsappMessage: 'السلام عليكم، استهلكت حد إضافة المواعيد اليومية وأرغب في ترقية الباقة.',
  proMaxPublicBookingWhatsappMessage: 'السلام عليكم، استهلكت حد إضافة المواعيد اليومية في باقة برو ماكس وأرغب في التواصل.',
  freePublicFormBookingWhatsappMessage: 'السلام عليكم، تجاوزت حد الحجز اليومي من فورم الجمهور وأرغب في الاشتراك.',
  premiumPublicFormBookingWhatsappMessage: 'السلام عليكم، استهلكت حد الحجز اليومي من فورم الجمهور وأرغب في ترقية الباقة.',
  proMaxPublicFormBookingWhatsappMessage: 'السلام عليكم، استهلكت حد الحجز اليومي من فورم الجمهور في باقة برو ماكس وأرغب في التواصل.',
  freeSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، تجاوزت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في الاشتراك.',
  premiumSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في ترقية الباقة.',
  proMaxSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية في باقة برو ماكس وأرغب في التواصل.',
  freeReadyPrescriptionWhatsappMessage: 'السلام عليكم، تجاوزت حد حفظ الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ الروشتات الجاهزة وأرغب في ترقية الباقة.',
  proMaxReadyPrescriptionWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ الروشتات الجاهزة في باقة برو ماكس وأرغب في التواصل.',
  freeMedicalReportWhatsappMessage: 'السلام عليكم، تجاوزت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في الاشتراك.',
  premiumMedicalReportWhatsappMessage: 'السلام عليكم، استهلكت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في ترقية الباقة.',
  proMaxMedicalReportWhatsappMessage: 'السلام عليكم، استهلكت الحد اليومي لطباعة التقرير الطبي للحالة في باقة برو ماكس وأرغب في التواصل.',
  freeReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في ترقية الباقة.',
  proMaxReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة في باقة برو ماكس وأرغب في التواصل.',
  freeMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في الاشتراك.',
  premiumMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في ترقية الباقة.',
  proMaxMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة في باقة برو ماكس وأرغب في التواصل.',

  // ─── تحكم الأدوات الخاصة (قفل/فتح) ───
  // premium*Only keys اتسموا كده تاريخياً — دلوقتي بيعنوا "مدفوع (برو أو برو ماكس)".
  interactionToolPremiumOnly: true,
  renalToolPremiumOnly: true,
  pregnancyToolPremiumOnly: true,
  interactionToolLockedMessage: 'هذه الأداة متاحة لحساب برو وبرو ماكس فقط.',
  renalToolLockedMessage: 'هذه الأداة متاحة لحساب برو وبرو ماكس فقط.',
  pregnancyToolLockedMessage: 'هذه الأداة متاحة لحساب برو وبرو ماكس فقط.',

  // ─── شارات العرض في الـ UI ───
  premiumTagLabel: 'Pro',              // كان Pro — دلوقتي Pro (هو هو الـ tier بس بلمح اسم)
  proMaxTagLabel: 'Pro Max',           // شارة الفئة الجديدة
};


/**
 * حدود الاستخدام اليومية لـ AI — شبكة أمان ثانية (Last-Resort Backstop) على
 * كل كولات Gemini المجموعة. الحدود الحقيقية لكل خدمة بتتحدد من صفحة الأدمن
 * عبر `AccountTypeControls` (ملف `defaults.ts`): تحليل، تقرير، تفاعلات، ...
 *
 * الأرقام هنا متضبطة عالية نسبياً عشان مايعملش تعارض مع إعدادات الأدمن:
 * - Free (100/يوم): مع إن الأدمن غالباً مُحدِّد 2-10 لكل خدمة، ده سقف إجمالي.
 * - Pro/Pro Max (1000/يوم): مع إن الأدمن مُحدِّد 50-80 لكل خدمة منطقياً،
 *   سقف 1000 يمنع أي abuse عبر drug tools لو الأدمن ضبط حدودها عالية.
 */
const DEFAULT_AI_PROXY_LIMITS = {
  freeDailyLimit: 100,
  premiumDailyLimit: 1000,
  proMaxDailyLimit: 1000,
};


const ALLOWED_GEMINI_MODELS = new Set([
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]);

module.exports = {
  DEFAULT_SMART_RX_CONFIG,
  DEFAULT_AI_PROXY_LIMITS,
  ALLOWED_GEMINI_MODELS,
};
