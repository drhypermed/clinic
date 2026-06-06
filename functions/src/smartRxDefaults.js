
// ─────────────────────────────────────────────────────────────────────────
// الفئات: free = مجاني | premium = برو (القيمة الداخلية بقت "برو" في الواجهة)
//         plus = بلس | pro_max = برو ماكس (الأدمن يضبط مميزاتها لاحقاً)
// ملاحظة: احتفظنا بـ `premium*` keys كما هي عشان backward compat — الرسائل
// العربية بس اتغيرت لتقول "برو" بدل "المميز".
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_SMART_RX_CONFIG = {
  // ─── الكوتا اليومية ───
  freeDailyLimit: 2,
  premiumDailyLimit: 50,
  plusDailyLimit: 0,
  proMaxDailyLimit: 50,                   // (برو ماكس) الأدمن يضبطها لاحقاً
  // 🆕 الزر السريع "إضافة بدون تحليل" — حدود منفصلة عن التحليل العميق (2026-05)
  // كان مشترك على نفس عداد التحليل فاستهلاك زر بيقفل التاني — اتفصل
  freeQuickAddDailyLimit: 5,
  premiumQuickAddDailyLimit: 100,
  plusQuickAddDailyLimit: 0,
  proMaxQuickAddDailyLimit: 200,
  // ─ السجلات بقت "حد كلي" (سعة تخزين) — تغيّرت 2026-04 ─
  freeRecordsMaxCount: 100,
  premiumRecordsMaxCount: 1000,
  plusRecordsMaxCount: 1000,
  proMaxRecordsMaxCount: 5000,
  freePublicBookingDailyLimit: 10,
  premiumPublicBookingDailyLimit: 200,
  plusPublicBookingDailyLimit: 200,
  proMaxPublicBookingDailyLimit: 200,
  freeSecretaryEntryRequestDailyLimit: 20,
  premiumSecretaryEntryRequestDailyLimit: 300,
  plusSecretaryEntryRequestDailyLimit: 300,
  proMaxSecretaryEntryRequestDailyLimit: 300,
  freeReadyPrescriptionDailyLimit: 3,
  premiumReadyPrescriptionDailyLimit: 50,
  plusReadyPrescriptionDailyLimit: 50,
  proMaxReadyPrescriptionDailyLimit: 50,
  // ─ 🆕 أزرار تصدير الروشتة (طباعة + تنزيل + واتساب) — حدود يومية 2026-04 ─
  freeMedicalReportDailyLimit: 3,
  premiumMedicalReportDailyLimit: 80,
  plusMedicalReportDailyLimit: 0,
  proMaxMedicalReportDailyLimit: 80,
  // ✂️ شيلنا حد الترجمة (2026-05) — الترجمة بقت جزء من الزرّين
  freeReadyPrescriptionsMaxCount: 5,
  premiumReadyPrescriptionsMaxCount: 100,
  plusReadyPrescriptionsMaxCount: 100,
  proMaxReadyPrescriptionsMaxCount: 100,
  freeMedicationCustomizationsMaxCount: 20,
  premiumMedicationCustomizationsMaxCount: 500,
  plusMedicationCustomizationsMaxCount: 500,
  proMaxMedicationCustomizationsMaxCount: 500,
  // ─── 🆕 سعة الفروع 2026-04 ───
  freeBranchesMaxCount: 1,
  premiumBranchesMaxCount: 2,
  plusBranchesMaxCount: 2,
  proMaxBranchesMaxCount: 10,
  // ─── 🆕 سعة شركات التأمين 2026-04 ───
  freeInsuranceCompaniesMaxCount: 2,
  premiumInsuranceCompaniesMaxCount: 10,
  plusInsuranceCompaniesMaxCount: 10,
  proMaxInsuranceCompaniesMaxCount: 50,
  freeInteractionToolDailyLimit: 5000,
  premiumInteractionToolDailyLimit: 5000,
  plusInteractionToolDailyLimit: 0,
  proMaxInteractionToolDailyLimit: 5000,
  freeRenalToolDailyLimit: 5000,
  premiumRenalToolDailyLimit: 5000,
  plusRenalToolDailyLimit: 0,
  proMaxRenalToolDailyLimit: 5000,
  freePregnancyToolDailyLimit: 5000,
  premiumPregnancyToolDailyLimit: 5000,
  plusPregnancyToolDailyLimit: 0,
  proMaxPregnancyToolDailyLimit: 5000,
  freeGuidelinesChatDailyLimit: 2,
  premiumGuidelinesChatDailyLimit: 15,
  plusGuidelinesChatDailyLimit: 15,
  proMaxGuidelinesChatDailyLimit: 30,

  // ─── رسائل استنفاد الكوتا (العربية المصرية) ───
  freeAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (50 مرة) لحساب برو. للتواصل واتساب',
  proMaxAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  // 🆕 رسائل الزر السريع "إضافة بدون تحليل"
  freeQuickAddLimitMessage: 'تم استهلاك الحد اليومي للإضافة بدون تحليل ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumQuickAddLimitMessage: 'تم استهلاك الحد اليومي للإضافة بدون تحليل ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxQuickAddLimitMessage: 'تم استهلاك الحد اليومي للإضافة بدون تحليل ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
  freeRecordsCapacityMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية ({limit} سجل) للحساب المجاني. احذف سجل قبل الإضافة.',
  premiumRecordsCapacityMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية ({limit} سجل) لحساب برو. احذف سجل قبل الإضافة.',
  proMaxRecordsCapacityMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية ({limit} سجل) لحساب برو ماكس. احذف سجل قبل الإضافة.',
  freePublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumPublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) لحساب برو. للتواصل واتساب',
  proMaxPublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) لحساب برو ماكس. للتواصل واتساب',
  freeSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) لحساب برو. للتواصل واتساب',
  proMaxSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) لحساب برو ماكس. للتواصل واتساب',
  freeReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (50 مرة) لحساب برو. للتواصل واتساب',
  proMaxReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  freeMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) لحساب برو. للتواصل واتساب',
  proMaxMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) لحساب برو ماكس. للتواصل واتساب',
  // ✂️ شيلنا رسائل الترجمة (2026-05)
  // ─── أدوات الأدوية (التداخلات + الحمل + الكلى) — اتنقلوا لـ"حدود الميزات" ───
  freeInteractionToolLimitMessage: 'تم استهلاك الحد اليومي لفحص التداخلات الدوائية ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumInteractionToolLimitMessage: 'تم استهلاك الحد اليومي لفحص التداخلات الدوائية ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxInteractionToolLimitMessage: 'تم استهلاك الحد اليومي لفحص التداخلات الدوائية ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
  freePregnancyToolLimitMessage: 'تم استهلاك الحد اليومي لفحص الدواء أثناء الحمل والرضاعة ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumPregnancyToolLimitMessage: 'تم استهلاك الحد اليومي لفحص الدواء أثناء الحمل والرضاعة ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxPregnancyToolLimitMessage: 'تم استهلاك الحد اليومي لفحص الدواء أثناء الحمل والرضاعة ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
  freeRenalToolLimitMessage: 'تم استهلاك الحد اليومي لحاسبة جرعات الكلى ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumRenalToolLimitMessage: 'تم استهلاك الحد اليومي لحاسبة جرعات الكلى ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxRenalToolLimitMessage: 'تم استهلاك الحد اليومي لحاسبة جرعات الكلى ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
  freeGuidelinesChatLimitMessage: 'تم استهلاك الحد اليومي لشات الجايدلاينز ({limit} رسالة) للحساب المجاني. للتواصل واتساب',
  premiumGuidelinesChatLimitMessage: 'تم استهلاك الحد اليومي لشات الجايدلاينز ({limit} رسالة) لحساب برو. للتواصل واتساب',
  plusGuidelinesChatLimitMessage: 'تم استهلاك الحد اليومي لشات الجايدلاينز ({limit} رسالة) لحساب Plus. قراءة ملخصات الجايدلاينز مفتوحة لباقة Plus، ولرفع حد الشات تواصل واتساب.',
  proMaxGuidelinesChatLimitMessage: 'تم استهلاك الحد اليومي لشات الجايدلاينز ({limit} رسالة) لحساب برو ماكس. للتواصل واتساب',
  // ─ 🆕 أزرار تصدير الروشتة — رسائل تجاوز الحد ─
  freeReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) للحساب المجاني. احذف واحدة أولاً ثم أضف الجديدة.',
  premiumReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) لحساب برو. احذف واحدة أولاً ثم أضف الجديدة.',
  proMaxReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) لحساب برو ماكس. احذف واحدة أولاً ثم أضف الجديدة.',
  freeMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) للحساب المجاني.',
  premiumMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) لحساب برو.',
  proMaxMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) لحساب برو ماكس.',
  // ─── 🆕 رسائل سعة الفروع + شركات التأمين 2026-04 ───
  freeBranchesCapacityMessage: 'وصلت للحد الأقصى لعدد الفروع ({limit} فرع) للحساب المجاني. للترقية واتساب.',
  premiumBranchesCapacityMessage: 'وصلت للحد الأقصى لعدد الفروع ({limit} فرع) لحساب برو. للتواصل واتساب.',
  proMaxBranchesCapacityMessage: 'وصلت للحد الأقصى لعدد الفروع ({limit} فرع) لحساب برو ماكس. للتواصل واتساب.',
  freeInsuranceCompaniesCapacityMessage: 'وصلت للحد الأقصى لعدد شركات التأمين ({limit} شركة) للحساب المجاني. للترقية واتساب.',
  premiumInsuranceCompaniesCapacityMessage: 'وصلت للحد الأقصى لعدد شركات التأمين ({limit} شركة) لحساب برو. للتواصل واتساب.',
  proMaxInsuranceCompaniesCapacityMessage: 'وصلت للحد الأقصى لعدد شركات التأمين ({limit} شركة) لحساب برو ماكس. للتواصل واتساب.',

  // ─── رسائل واتساب للترقية ───
  whatsappNumber: '201092805293',
  freeAnalysisWhatsappMessage: 'تجاوزت حد تحليل الحالة وأرغب في الاشتراك.',
  premiumAnalysisWhatsappMessage: 'استهلكت حد تحليل الحالة وأرغب في ترقية الباقة.',
  proMaxAnalysisWhatsappMessage: 'استهلكت حد تحليل الحالة في باقة برو ماكس وأرغب في التواصل.',
  // 🆕 رسائل واتساب الزر السريع "إضافة بدون تحليل"
  freeQuickAddWhatsappMessage: 'تجاوزت حد الإضافة بدون تحليل وأرغب في الاشتراك.',
  premiumQuickAddWhatsappMessage: 'استهلكت حد الإضافة بدون تحليل وأرغب في ترقية الباقة.',
  proMaxQuickAddWhatsappMessage: 'استهلكت حد الإضافة بدون تحليل في باقة برو ماكس وأرغب في التواصل.',
  freeRecordsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية وأرغب في ترقية باقتي لزيادة السعة.',
  premiumRecordsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية وأرغب في زيادة السعة.',
  proMaxRecordsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية في باقة برو ماكس وأرغب في زيادة السعة.',
  freePublicBookingWhatsappMessage: 'تجاوزت حد إضافة المواعيد اليومية وأرغب في الاشتراك.',
  premiumPublicBookingWhatsappMessage: 'استهلكت حد إضافة المواعيد اليومية وأرغب في ترقية الباقة.',
  proMaxPublicBookingWhatsappMessage: 'استهلكت حد إضافة المواعيد اليومية في باقة برو ماكس وأرغب في التواصل.',
  freeSecretaryEntryRequestWhatsappMessage: 'تجاوزت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في الاشتراك.',
  premiumSecretaryEntryRequestWhatsappMessage: 'استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في ترقية الباقة.',
  proMaxSecretaryEntryRequestWhatsappMessage: 'استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية في باقة برو ماكس وأرغب في التواصل.',
  freeReadyPrescriptionWhatsappMessage: 'تجاوزت حد حفظ الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionWhatsappMessage: 'استهلكت حد حفظ الروشتات الجاهزة وأرغب في ترقية الباقة.',
  proMaxReadyPrescriptionWhatsappMessage: 'استهلكت حد حفظ الروشتات الجاهزة في باقة برو ماكس وأرغب في التواصل.',
  freeMedicalReportWhatsappMessage: 'تجاوزت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في الاشتراك.',
  premiumMedicalReportWhatsappMessage: 'استهلكت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في ترقية الباقة.',
  proMaxMedicalReportWhatsappMessage: 'استهلكت الحد اليومي لطباعة التقرير الطبي للحالة في باقة برو ماكس وأرغب في التواصل.',
  // ✂️ شيلنا رسائل واتساب الترجمة (2026-05)
  // ─── أدوات الأدوية (التداخلات + الحمل + الكلى) ───
  freeInteractionToolWhatsappMessage: 'تجاوزت الحد اليومي لفحص التداخلات الدوائية وأرغب في الاشتراك.',
  premiumInteractionToolWhatsappMessage: 'استهلكت الحد اليومي لفحص التداخلات الدوائية وأرغب في ترقية الباقة.',
  proMaxInteractionToolWhatsappMessage: 'استهلكت الحد اليومي لفحص التداخلات الدوائية في باقة برو ماكس وأرغب في التواصل.',
  freePregnancyToolWhatsappMessage: 'تجاوزت الحد اليومي لفحص الدواء أثناء الحمل والرضاعة وأرغب في الاشتراك.',
  premiumPregnancyToolWhatsappMessage: 'استهلكت الحد اليومي لفحص الدواء أثناء الحمل والرضاعة وأرغب في ترقية الباقة.',
  proMaxPregnancyToolWhatsappMessage: 'استهلكت الحد اليومي لفحص الدواء أثناء الحمل والرضاعة في باقة برو ماكس وأرغب في التواصل.',
  freeRenalToolWhatsappMessage: 'تجاوزت الحد اليومي لحاسبة جرعات الكلى وأرغب في الاشتراك.',
  premiumRenalToolWhatsappMessage: 'استهلكت الحد اليومي لحاسبة جرعات الكلى وأرغب في ترقية الباقة.',
  proMaxRenalToolWhatsappMessage: 'استهلكت الحد اليومي لحاسبة جرعات الكلى في باقة برو ماكس وأرغب في التواصل.',
  freeGuidelinesChatWhatsappMessage: 'تجاوزت الحد اليومي لشات الجايدلاينز وأرغب في الاشتراك.',
  premiumGuidelinesChatWhatsappMessage: 'استهلكت الحد اليومي لشات الجايدلاينز وأرغب في ترقية الباقة.',
  plusGuidelinesChatWhatsappMessage: 'استهلكت الحد اليومي لشات الجايدلاينز ضمن باقة Plus وأرغب في رفع حد الشات. قراءة ملخصات الجايدلاينز مفتوحة لدي.',
  proMaxGuidelinesChatWhatsappMessage: 'استهلكت الحد اليومي لشات الجايدلاينز في باقة برو ماكس وأرغب في التواصل.',
  // ─ 🆕 أزرار تصدير الروشتة — رسائل واتساب ─
  freeReadyPrescriptionsCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionsCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في ترقية الباقة.',
  proMaxReadyPrescriptionsCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد الروشتات الجاهزة في باقة برو ماكس وأرغب في التواصل.',
  freeMedicationCustomizationsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في الاشتراك.',
  premiumMedicationCustomizationsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في ترقية الباقة.',
  proMaxMedicationCustomizationsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة في باقة برو ماكس وأرغب في التواصل.',
  // ─── 🆕 رسائل واتساب سعة الفروع + شركات التأمين 2026-04 ───
  freeBranchesCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد الفروع وأرغب في الاشتراك.',
  premiumBranchesCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد الفروع وأرغب في ترقية الباقة.',
  proMaxBranchesCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد الفروع في باقة برو ماكس وأرغب في التواصل.',
  freeInsuranceCompaniesCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد شركات التأمين وأرغب في الاشتراك.',
  premiumInsuranceCompaniesCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد شركات التأمين وأرغب في ترقية الباقة.',
  proMaxInsuranceCompaniesCapacityWhatsappMessage: 'وصلت للحد الأقصى لعدد شركات التأمين في باقة برو ماكس وأرغب في التواصل.',

  // ✂️ شيلنا الـ flags premiumOnly + رسائل الـ locked القديمه.
  // المنطق دلوقتي موحّد: الحد اليومي للمجاني وحده يحدد. لو الحد = 0
  // → الأداه مقفولة عليه ورسالة الـ limit بتظهر (مش رسالة قفل منفصلة).

  // ─── شارات العرض في الـ UI ───
  premiumTagLabel: 'Pro',              // كان Pro — دلوقتي Pro (هو هو الـ tier بس بلمح اسم)
  proMaxTagLabel: 'Pro Max',           // شارة الفئة الجديدة
};

Object.keys(DEFAULT_SMART_RX_CONFIG).forEach((key) => {
  if (!key.startsWith('premium')) return;
  const plusKey = `plus${key.slice('premium'.length)}`;
  if (DEFAULT_SMART_RX_CONFIG[plusKey] === undefined) {
    const value = DEFAULT_SMART_RX_CONFIG[key];
    DEFAULT_SMART_RX_CONFIG[plusKey] = typeof value === 'string'
      ? value.replace(/باقة برو/g, 'باقة Plus').replace(/حساب برو/g, 'حساب Plus').replace(/ضمن باقة برو/g, 'ضمن باقة Plus')
      : value;
  }
});

Object.assign(DEFAULT_SMART_RX_CONFIG, {
  plusDailyLimit: 0,
  plusQuickAddDailyLimit: 0,
  plusInteractionToolDailyLimit: 0,
  plusRenalToolDailyLimit: 0,
  plusPregnancyToolDailyLimit: 0,
  plusMedicalReportDailyLimit: 0,
  plusGuidelinesChatDailyLimit: 15,
  plusAnalysisLimitMessage: 'عزيزي الطبيب، تم بلوغ الحد اليومي ({limit} مرة) لميزة «إضافة إلى الروشتة والسجلات مع تحليل الحالة» ضمن باقة Plus. لرفع الحد، تواصل معنا عبر واتساب.',
  plusQuickAddLimitMessage: 'عزيزي الطبيب، تم بلوغ الحد اليومي ({limit} مرة) لميزة «إضافة إلى الروشتة والسجلات بدون تحليل الحالة» ضمن باقة Plus. لرفع الحد، تواصل معنا عبر واتساب.',
  plusInteractionToolLimitMessage: 'عزيزي الطبيب، تم بلوغ الحد اليومي ({limit} مرة) لميزة «فحص التداخلات الدوائية» ضمن باقة Plus. لرفع الحد، تواصل معنا عبر واتساب.',
  plusPregnancyToolLimitMessage: 'عزيزي الطبيب، تم بلوغ الحد اليومي ({limit} مرة) لميزة «فحص الدواء أثناء الحمل والرضاعة» ضمن باقة Plus. لرفع الحد، تواصل معنا عبر واتساب.',
  plusRenalToolLimitMessage: 'عزيزي الطبيب، تم بلوغ الحد اليومي ({limit} مرة) لميزة «حاسبة جرعات الكلى» ضمن باقة Plus. لرفع الحد، تواصل معنا عبر واتساب.',
  plusGuidelinesChatLimitMessage: 'عزيزي الطبيب، تم بلوغ الحد اليومي ({limit} رسالة) لميزة «شات الجايدلاينز» ضمن باقة Plus. قراءة ملخصات الجايدلاينز مفتوحة لباقة Plus، ولرفع حد الشات تواصل معنا عبر واتساب.',
  plusMedicalReportLimitMessage: 'عزيزي الطبيب، تم بلوغ الحد اليومي ({limit} تقرير) لميزة «طباعة تقرير طبي للحالة» ضمن باقة Plus. لرفع الحد، تواصل معنا عبر واتساب.',
  plusAnalysisWhatsappMessage: 'تحية طيبة، وصلت للحد اليومي لتحليل الحالة ضمن باقة Plus وأرغب في رفع الحد أو معرفة خيارات الترقية.',
  plusQuickAddWhatsappMessage: 'تحية طيبة، وصلت للحد اليومي للإضافة بدون تحليل ضمن باقة Plus وأرغب في رفع الحد أو معرفة خيارات الترقية.',
  plusInteractionToolWhatsappMessage: 'تحية طيبة، وصلت للحد اليومي لفحص التداخلات الدوائية ضمن باقة Plus وأرغب في رفع الحد أو معرفة خيارات الترقية.',
  plusPregnancyToolWhatsappMessage: 'تحية طيبة، وصلت للحد اليومي لفحص أمان الحمل والرضاعة ضمن باقة Plus وأرغب في رفع الحد أو معرفة خيارات الترقية.',
  plusRenalToolWhatsappMessage: 'تحية طيبة، وصلت للحد اليومي لحاسبة جرعات الكلى ضمن باقة Plus وأرغب في رفع الحد أو معرفة خيارات الترقية.',
  plusGuidelinesChatWhatsappMessage: 'تحية طيبة، وصلت للحد اليومي لشات الجايدلاينز ضمن باقة Plus وأرغب في رفع حد الشات. قراءة ملخصات الجايدلاينز مفتوحة لدي.',
  plusMedicalReportWhatsappMessage: 'تحية طيبة، وصلت للحد اليومي للتقرير الطبي الذكي ضمن باقة Plus وأرغب في رفع الحد أو معرفة خيارات الترقية.',
  plusTagLabel: 'Plus',
});


/**
 * حدود الاستخدام اليومية لـ AI — شبكة أمان ثانية (Last-Resort Backstop) على
 * كل كولات Gemini المجموعة. الحدود الحقيقية لكل خدمة بتتحدد من صفحة الأدمن
 * عبر `AccountTypeControls` (ملف `defaults.ts`): تحليل، تقرير، تفاعلات، ...
 *
 * الأرقام هنا متضبطة كهامش أمان معقول فوق إعدادات الأدمن:
 * - Free (50/يوم): الأدمن غالباً مُحدِّد 2-3 لكل خدمة (تحليل/تقرير/...) =
 *   مجموع ~10-15. هامش 3x كافي لأي زر Quick أو ميزة جديدة.
 * - Pro/Pro Max (200/يوم): الأدمن مُحدِّد 50-80 لكل خدمة = مجموع ~50-100.
 *   هامش 2x يمنع أي abuse لو bug في client تعدّى حدود الأدوات الفردية.
 *
 * (سابقاً كانت 100/1000 — خُفِّضت 2026-05 لتقليل المخاطرة المالية على scale.
 *  لو حد طبيب لقي نفسه moosumi'sh على الـbackstop ده، يبقى في bug فعلي
 *  عند الأدوات الفردية لازم نشوفه — مش signal نزود الـbackstop.)
 */
const DEFAULT_AI_PROXY_LIMITS = {
  freeDailyLimit: 50,
  premiumDailyLimit: 200,
  plusDailyLimit: 0,
  proMaxDailyLimit: 200,
};


const ALLOWED_GEMINI_MODELS = new Set([
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
]);

module.exports = {
  DEFAULT_SMART_RX_CONFIG,
  DEFAULT_AI_PROXY_LIMITS,
  ALLOWED_GEMINI_MODELS,
};
