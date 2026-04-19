
const DEFAULT_SMART_RX_CONFIG = {
  freeDailyLimit: 2,
  premiumDailyLimit: 50,
  freeRecordDailyLimit: 3,
  premiumRecordDailyLimit: 50,
  freePublicBookingDailyLimit: 10,
  premiumPublicBookingDailyLimit: 200,
  freePublicFormBookingDailyLimit: 10,
  premiumPublicFormBookingDailyLimit: 200,
  freeSecretaryEntryRequestDailyLimit: 20,
  premiumSecretaryEntryRequestDailyLimit: 300,
  freeReadyPrescriptionDailyLimit: 3,
  premiumReadyPrescriptionDailyLimit: 50,
  freeMedicalReportDailyLimit: 3,
  premiumMedicalReportDailyLimit: 80,
  freeReadyPrescriptionsMaxCount: 5,
  premiumReadyPrescriptionsMaxCount: 100,
  freeMedicationCustomizationsMaxCount: 20,
  premiumMedicationCustomizationsMaxCount: 500,
  freeInteractionToolDailyLimit: 5000,
  premiumInteractionToolDailyLimit: 5000,
  freeRenalToolDailyLimit: 5000,
  premiumRenalToolDailyLimit: 5000,
  freePregnancyToolDailyLimit: 5000,
  premiumPregnancyToolDailyLimit: 5000,
  freeAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (50 مرة) للحساب المميز. للتواصل واتساب',
  freeRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (50 مرة) للحساب المميز. للتواصل واتساب',
  freePublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumPublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) للحساب المميز. للتواصل واتساب',
  freePublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumPublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) للحساب المميز. للتواصل واتساب',
  freeSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) للحساب المميز. للتواصل واتساب',
  freeReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (50 مرة) للحساب المميز. للتواصل واتساب',
  freeMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) للحساب المميز. للتواصل واتساب',
  freeReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) للحساب المجاني. احذف واحدة أولاً ثم أضف الجديدة.',
  premiumReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) للحساب المميز. احذف واحدة أولاً ثم أضف الجديدة.',
  freeMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) للحساب المجاني.',
  premiumMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) للحساب المميز.',
  whatsappNumber: '201551020238',
  freeAnalysisWhatsappMessage: 'السلام عليكم، تجاوزت حد تحليل الحالة وأرغب في الاشتراك.',
  premiumAnalysisWhatsappMessage: 'السلام عليكم، استهلكت حد تحليل الحالة وأرغب في ترقية الباقة.',
  freeRecordWhatsappMessage: 'السلام عليكم، تجاوزت حد حفظ السجلات وأرغب في الاشتراك.',
  premiumRecordWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ السجلات وأرغب في ترقية الباقة.',
  freePublicBookingWhatsappMessage: 'السلام عليكم، تجاوزت حد إضافة المواعيد اليومية وأرغب في الاشتراك.',
  premiumPublicBookingWhatsappMessage: 'السلام عليكم، استهلكت حد إضافة المواعيد اليومية وأرغب في ترقية الباقة.',
  freePublicFormBookingWhatsappMessage: 'السلام عليكم، تجاوزت حد الحجز اليومي من فورم الجمهور وأرغب في الاشتراك.',
  premiumPublicFormBookingWhatsappMessage: 'السلام عليكم، استهلكت حد الحجز اليومي من فورم الجمهور وأرغب في ترقية الباقة.',
  freeSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، تجاوزت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في الاشتراك.',
  premiumSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في ترقية الباقة.',
  freeReadyPrescriptionWhatsappMessage: 'السلام عليكم، تجاوزت حد حفظ الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ الروشتات الجاهزة وأرغب في ترقية الباقة.',
  freeMedicalReportWhatsappMessage: 'السلام عليكم، تجاوزت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في الاشتراك.',
  premiumMedicalReportWhatsappMessage: 'السلام عليكم، استهلكت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في ترقية الباقة.',
  freeReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في ترقية الباقة.',
  freeMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في الاشتراك.',
  premiumMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في ترقية الباقة.',
  interactionToolPremiumOnly: true,
  renalToolPremiumOnly: true,
  pregnancyToolPremiumOnly: true,
  interactionToolLockedMessage: 'هذه الأداة متاحة للحساب المميز فقط.',
  renalToolLockedMessage: 'هذه الأداة متاحة للحساب المميز فقط.',
  pregnancyToolLockedMessage: 'هذه الأداة متاحة للحساب المميز فقط.',
  premiumTagLabel: 'Premium',
};


/**
 * حدود الاستخدام اليومية لـ AI — شبكة أمان ثانية (Last-Resort Backstop) على
 * كل كولات Gemini المجموعة. الحدود الحقيقية لكل خدمة بتتحدد من صفحة الأدمن
 * عبر `AccountTypeControls` (ملف `defaults.ts`): تحليل، تقرير، تفاعلات، ...
 *
 * الأرقام هنا متضبطة عالية نسبياً عشان مايعملش تعارض مع إعدادات الأدمن:
 * - Free (100/يوم): مع إن الأدمن غالباً مُحدِّد 2-10 لكل خدمة، ده سقف إجمالي.
 * - Premium (1000/يوم): مع إن الأدمن مُحدِّد 50-80 لكل خدمة منطقياً = ~200 كول،
 *   سقف 1000 يمنع أي abuse عبر drug tools لو الأدمن ضبط حدودها عالية.
 *
 * لو الأدمن عايز يحمي نفسه أكتر: يقلّل حدود `InteractionTool` / `RenalTool` /
 * `PregnancyTool` من 5000 لأرقام منطقية زي 50-100/يوم.
 */
const DEFAULT_AI_PROXY_LIMITS = {
  freeDailyLimit: 100,
  premiumDailyLimit: 1000,
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
