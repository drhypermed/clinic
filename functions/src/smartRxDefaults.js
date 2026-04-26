
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
  // ─ السجلات بقت "حد كلي" (سعة تخزين) — تغيّرت 2026-04 ─
  freeRecordsMaxCount: 100,
  premiumRecordsMaxCount: 1000,
  proMaxRecordsMaxCount: 5000,
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
  // ─ 🆕 أزرار تصدير الروشتة (طباعة + تنزيل + واتساب) — حدود يومية 2026-04 ─
  freePrescriptionPrintDailyLimit: 50,
  premiumPrescriptionPrintDailyLimit: 200,
  proMaxPrescriptionPrintDailyLimit: 500,
  freePrescriptionDownloadDailyLimit: 50,
  premiumPrescriptionDownloadDailyLimit: 200,
  proMaxPrescriptionDownloadDailyLimit: 500,
  freePrescriptionWhatsappDailyLimit: 50,
  premiumPrescriptionWhatsappDailyLimit: 200,
  proMaxPrescriptionWhatsappDailyLimit: 500,
  freeMedicalReportDailyLimit: 3,
  premiumMedicalReportDailyLimit: 80,
  proMaxMedicalReportDailyLimit: 80,
  // ─── الترجمة الذكية للروشتة (جديد — كانت بتشتغل بدون حد) ───
  freeTranslationDailyLimit: 5,
  premiumTranslationDailyLimit: 100,
  proMaxTranslationDailyLimit: 200,
  freeReadyPrescriptionsMaxCount: 5,
  premiumReadyPrescriptionsMaxCount: 100,
  proMaxReadyPrescriptionsMaxCount: 100,
  freeMedicationCustomizationsMaxCount: 20,
  premiumMedicationCustomizationsMaxCount: 500,
  proMaxMedicationCustomizationsMaxCount: 500,
  // ─── 🆕 سعة الفروع 2026-04 ───
  freeBranchesMaxCount: 1,
  premiumBranchesMaxCount: 2,
  proMaxBranchesMaxCount: 10,
  // ─── 🆕 سعة شركات التأمين 2026-04 ───
  freeInsuranceCompaniesMaxCount: 2,
  premiumInsuranceCompaniesMaxCount: 10,
  proMaxInsuranceCompaniesMaxCount: 50,
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
  freeRecordsCapacityMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية ({limit} سجل) للحساب المجاني. احذف سجل قبل الإضافة.',
  premiumRecordsCapacityMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية ({limit} سجل) لحساب برو. احذف سجل قبل الإضافة.',
  proMaxRecordsCapacityMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية ({limit} سجل) لحساب برو ماكس. احذف سجل قبل الإضافة.',
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
  // ─── الترجمة الذكية للروشتة (جديد) ───
  freeTranslationLimitMessage: 'تم استهلاك الحد اليومي للترجمة الذكية للروشتة ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumTranslationLimitMessage: 'تم استهلاك الحد اليومي للترجمة الذكية للروشتة ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxTranslationLimitMessage: 'تم استهلاك الحد اليومي للترجمة الذكية للروشتة ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
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
  // ─ 🆕 أزرار تصدير الروشتة — رسائل تجاوز الحد ─
  freePrescriptionPrintLimitMessage: 'تم استهلاك الحد اليومي لطباعة الروشتة ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumPrescriptionPrintLimitMessage: 'تم استهلاك الحد اليومي لطباعة الروشتة ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxPrescriptionPrintLimitMessage: 'تم استهلاك الحد اليومي لطباعة الروشتة ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
  freePrescriptionDownloadLimitMessage: 'تم استهلاك الحد اليومي لتنزيل الروشتة ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumPrescriptionDownloadLimitMessage: 'تم استهلاك الحد اليومي لتنزيل الروشتة ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxPrescriptionDownloadLimitMessage: 'تم استهلاك الحد اليومي لتنزيل الروشتة ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
  freePrescriptionWhatsappLimitMessage: 'تم استهلاك الحد اليومي لإرسال الروشتة عبر واتساب ({limit} مرة) للحساب المجاني. للتواصل واتساب',
  premiumPrescriptionWhatsappLimitMessage: 'تم استهلاك الحد اليومي لإرسال الروشتة عبر واتساب ({limit} مرة) لحساب برو. للتواصل واتساب',
  proMaxPrescriptionWhatsappLimitMessage: 'تم استهلاك الحد اليومي لإرسال الروشتة عبر واتساب ({limit} مرة) لحساب برو ماكس. للتواصل واتساب',
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
  freeRecordsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية وأرغب في ترقية باقتي لزيادة السعة.',
  premiumRecordsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية وأرغب في زيادة السعة.',
  proMaxRecordsCapacityWhatsappMessage: 'وصلت للحد الأقصى لتخزين السجلات الطبية في باقة برو ماكس وأرغب في زيادة السعة.',
  freePublicBookingWhatsappMessage: 'تجاوزت حد إضافة المواعيد اليومية وأرغب في الاشتراك.',
  premiumPublicBookingWhatsappMessage: 'استهلكت حد إضافة المواعيد اليومية وأرغب في ترقية الباقة.',
  proMaxPublicBookingWhatsappMessage: 'استهلكت حد إضافة المواعيد اليومية في باقة برو ماكس وأرغب في التواصل.',
  freePublicFormBookingWhatsappMessage: 'تجاوزت حد الحجز اليومي من فورم الجمهور وأرغب في الاشتراك.',
  premiumPublicFormBookingWhatsappMessage: 'استهلكت حد الحجز اليومي من فورم الجمهور وأرغب في ترقية الباقة.',
  proMaxPublicFormBookingWhatsappMessage: 'استهلكت حد الحجز اليومي من فورم الجمهور في باقة برو ماكس وأرغب في التواصل.',
  freeSecretaryEntryRequestWhatsappMessage: 'تجاوزت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في الاشتراك.',
  premiumSecretaryEntryRequestWhatsappMessage: 'استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في ترقية الباقة.',
  proMaxSecretaryEntryRequestWhatsappMessage: 'استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية في باقة برو ماكس وأرغب في التواصل.',
  freeReadyPrescriptionWhatsappMessage: 'تجاوزت حد حفظ الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionWhatsappMessage: 'استهلكت حد حفظ الروشتات الجاهزة وأرغب في ترقية الباقة.',
  proMaxReadyPrescriptionWhatsappMessage: 'استهلكت حد حفظ الروشتات الجاهزة في باقة برو ماكس وأرغب في التواصل.',
  freeMedicalReportWhatsappMessage: 'تجاوزت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في الاشتراك.',
  premiumMedicalReportWhatsappMessage: 'استهلكت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في ترقية الباقة.',
  proMaxMedicalReportWhatsappMessage: 'استهلكت الحد اليومي لطباعة التقرير الطبي للحالة في باقة برو ماكس وأرغب في التواصل.',
  // ─── الترجمة الذكية للروشتة (جديد) ───
  freeTranslationWhatsappMessage: 'تجاوزت الحد اليومي للترجمة الذكية للروشتة وأرغب في الاشتراك.',
  premiumTranslationWhatsappMessage: 'استهلكت الحد اليومي للترجمة الذكية للروشتة وأرغب في ترقية الباقة.',
  proMaxTranslationWhatsappMessage: 'استهلكت الحد اليومي للترجمة الذكية للروشتة في باقة برو ماكس وأرغب في التواصل.',
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
  // ─ 🆕 أزرار تصدير الروشتة — رسائل واتساب ─
  freePrescriptionPrintWhatsappMessage: 'تجاوزت الحد اليومي لطباعة الروشتة وأرغب في الاشتراك.',
  premiumPrescriptionPrintWhatsappMessage: 'استهلكت الحد اليومي لطباعة الروشتة وأرغب في ترقية الباقة.',
  proMaxPrescriptionPrintWhatsappMessage: 'استهلكت الحد اليومي لطباعة الروشتة في باقة برو ماكس وأرغب في التواصل.',
  freePrescriptionDownloadWhatsappMessage: 'تجاوزت الحد اليومي لتنزيل الروشتة وأرغب في الاشتراك.',
  premiumPrescriptionDownloadWhatsappMessage: 'استهلكت الحد اليومي لتنزيل الروشتة وأرغب في ترقية الباقة.',
  proMaxPrescriptionDownloadWhatsappMessage: 'استهلكت الحد اليومي لتنزيل الروشتة في باقة برو ماكس وأرغب في التواصل.',
  freePrescriptionWhatsappWhatsappMessage: 'تجاوزت الحد اليومي لإرسال الروشتة عبر واتساب وأرغب في الاشتراك.',
  premiumPrescriptionWhatsappWhatsappMessage: 'استهلكت الحد اليومي لإرسال الروشتة عبر واتساب وأرغب في ترقية الباقة.',
  proMaxPrescriptionWhatsappWhatsappMessage: 'استهلكت الحد اليومي لإرسال الروشتة عبر واتساب في باقة برو ماكس وأرغب في التواصل.',
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
