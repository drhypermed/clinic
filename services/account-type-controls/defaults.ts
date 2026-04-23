/**
 * الإعدادات الافتراضية للتحكم في الحسابات (Default Account Type Controls)
 * هذا الملف يحتوي على القيم الافتراضية لحدود الاستخدام والرسائل:
 * 1. سعة الحساب المجاني (التحليل، السجلات، الحجز).
 * 2. سعة حساب برو (Pro).
 * 3. الرسائل المخصصة لكل حالة تجاوز حد.
 * 4. بيانات التواصل والدعم الفني عبر واتساب للترقية.
 */

import type { AccountTypeControls } from './types';

export const DEFAULT_CONTROLS: AccountTypeControls = {
  // حدود التحليل الذكي للروشتة (يومياً)
  freeDailyLimit: 2,
  premiumDailyLimit: 50,

  // حدود حفظ سجلات المرضى (يومياً)
  freeRecordDailyLimit: 3,
  premiumRecordDailyLimit: 50,

  // حدود الحجز العام والمباشر (يومياً)
  freePublicBookingDailyLimit: 10,
  premiumPublicBookingDailyLimit: 200,
  freePublicFormBookingDailyLimit: 10,
  premiumPublicFormBookingDailyLimit: 200,

  // حدود معالجة طلبات السكرتارية (يومياً)
  freeSecretaryEntryRequestDailyLimit: 20,
  premiumSecretaryEntryRequestDailyLimit: 300,

  // حدود حفظ الروشتات الجاهزة (يومياً)
  freeReadyPrescriptionDailyLimit: 3,
  premiumReadyPrescriptionDailyLimit: 50,

  // حدود طباعة التقرير الطبي للحالة (يومياً)
  freeMedicalReportDailyLimit: 3,
  premiumMedicalReportDailyLimit: 80,

  // الحد الأقصى التراكمي للروشتات الجاهزة المخزنة
  freeReadyPrescriptionsMaxCount: 5,
  premiumReadyPrescriptionsMaxCount: 100,

  // الحد الأقصى لتخزين الأدوية المعدلة يدوياً
  freeMedicationCustomizationsMaxCount: 20,
  premiumMedicationCustomizationsMaxCount: 500,

  // حدود أدوات الفحص الدوائي (افتراضياً 5000 لضمان عدم الحظر حالياً)
  freeInteractionToolDailyLimit: 5000,
  premiumInteractionToolDailyLimit: 5000,
  freeRenalToolDailyLimit: 5000,
  premiumRenalToolDailyLimit: 5000,
  freePregnancyToolDailyLimit: 5000,
  premiumPregnancyToolDailyLimit: 5000,

  // رسائل تنبيهات تخطي الحدود
  freeAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (50 مرة) لحساب برو. للتواصل واتساب',
  freeRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (50 مرة) لحساب برو. للتواصل واتساب',
  freePublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumPublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) لحساب برو. للتواصل واتساب',
  freePublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumPublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) لحساب برو. للتواصل واتساب',
  freeSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) لحساب برو. للتواصل واتساب',
  freeReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (3 مرات) للحساب المجاني. للتواصل واتساب',
  premiumReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (50 مرة) لحساب برو. للتواصل واتساب',
  freeMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) للحساب المجاني. للتواصل واتساب',
  premiumMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) لحساب برو. للتواصل واتساب',
  freeReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) للحساب المجاني. احذف واحدة أولاً ثم أضف الجديدة.',
  premiumReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) لحساب برو. احذف واحدة أولاً ثم أضف الجديدة.',
  freeMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) للحساب المجاني.',
  premiumMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) لحساب برو.',

  // بيانات التواصل واتساب
  whatsappNumber: '201092805293',
  freeAnalysisWhatsappMessage: 'السلام عليكم، تجاوزت حد تحليل الحالة وأرغب في الاشتراك.',
  premiumAnalysisWhatsappMessage: 'السلام عليكم، استهلكت حد تحليل الحالة وأرغب في ترقية الباقة.',
  freeRecordWhatsappMessage: 'السلام عليكم، تجاوزت حد حفظ السجلات وأرغب في الاشتراك.',
  premiumRecordWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ السجلات وأرغب في ترقية الباقة.',
  freePublicBookingWhatsappMessage: 'السلام عليكم، تجاوزت حد إضافة المواعيد اليومية وأرغب في الاشتراك.',
  premiumPublicBookingWhatsappMessage: 'السلام عليكم، استهلكت حد إضافة المواعيد اليومية وأرغب في ترقية الباقة.',
  freePublicFormBookingWhatsappMessage: 'السلام عليكم، تجاوزت حد الحجز اليومي من فورم الجمهور وأرغب في الاشتراك.',
  premiumPublicFormBookingWhatsappMessage: 'السلام عليكم، استهلكت حد الحجز اليومي من فورم الجمهور وأرغب في ترقية الباقة.',
  freeSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، تجاوزت حد ارسال موعد للطبيب من خلال السكرتارية وأرغب في الاشتراك.',
  premiumSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية وأرغب في ترقية الباقة.',
  freeReadyPrescriptionWhatsappMessage: 'السلام عليكم، تجاوزت حد حفظ الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ الروشتات الجاهزة وأرغب في ترقية الباقة.',
  freeMedicalReportWhatsappMessage: 'السلام عليكم، تجاوزت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في الاشتراك.',
  premiumMedicalReportWhatsappMessage: 'السلام عليكم، استهلكت الحد اليومي لطباعة التقرير الطبي للحالة وأرغب في ترقية الباقة.',
  freeReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في الاشتراك.',
  premiumReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة وأرغب في ترقية الباقة.',
  freeMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في الاشتراك.',
  premiumMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة وأرغب في ترقية الباقة.',

  // تخصيص ظهور الأدوات الطبية
  interactionToolPremiumOnly: true,
  renalToolPremiumOnly: true,
  pregnancyToolPremiumOnly: true,
  interactionToolLockedMessage: 'هذه الأداة متاحة لحساب برو فقط.',
  renalToolLockedMessage: 'هذه الأداة متاحة لحساب برو فقط.',
  pregnancyToolLockedMessage: 'هذه الأداة متاحة لحساب برو فقط.',
  premiumTagLabel: 'Pro',
  whatsappUrl: 'https://wa.me/201092805293',

  // ═══ الفئة الجديدة "برو ماكس" — قيم مبدئية (نفس برو حالياً). الأدمن يضبطها لاحقاً ═══
  proMaxDailyLimit: 50,
  proMaxRecordDailyLimit: 50,
  proMaxPublicBookingDailyLimit: 200,
  proMaxPublicFormBookingDailyLimit: 200,
  proMaxSecretaryEntryRequestDailyLimit: 300,
  proMaxReadyPrescriptionDailyLimit: 50,
  proMaxMedicalReportDailyLimit: 80,
  proMaxReadyPrescriptionsMaxCount: 100,
  proMaxMedicationCustomizationsMaxCount: 500,
  proMaxInteractionToolDailyLimit: 5000,
  proMaxRenalToolDailyLimit: 5000,
  proMaxPregnancyToolDailyLimit: 5000,
  proMaxAnalysisLimitMessage: 'تم استهلاك الحد اليومي لتحليل الحالة (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  proMaxRecordLimitMessage: 'تم استهلاك الحد اليومي لحفظ السجلات (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  proMaxPublicBookingLimitMessage: 'تم استهلاك الحد اليومي لإضافة موعد عند الطبيب ({limit}) لحساب برو ماكس. للتواصل واتساب',
  proMaxPublicFormBookingLimitMessage: 'تم استهلاك الحد اليومي للحجز من فورم الجمهور ({limit}) لحساب برو ماكس. للتواصل واتساب',
  proMaxSecretaryEntryRequestLimitMessage: 'تم استهلاك الحد اليومي لارسال موعد للطبيب من خلال السكرتارية ({limit}) لحساب برو ماكس. للتواصل واتساب',
  proMaxReadyPrescriptionDailyLimitMessage: 'تم استهلاك الحد اليومي لحفظ الروشتات الجاهزة (50 مرة) لحساب برو ماكس. للتواصل واتساب',
  proMaxMedicalReportLimitMessage: 'تم استهلاك الحد اليومي لطباعة التقرير الطبي للحالة ({limit}) لحساب برو ماكس. للتواصل واتساب',
  proMaxReadyPrescriptionsCapacityMessage: 'وصلت للحد الأقصى للروشتات الجاهزة ({limit}) لحساب برو ماكس. احذف واحدة أولاً ثم أضف الجديدة.',
  proMaxMedicationCustomizationsCapacityMessage: 'وصلت للحد الأقصى لتخزين الأدوية المعدلة ({limit}) لحساب برو ماكس.',
  proMaxAnalysisWhatsappMessage: 'السلام عليكم، استهلكت حد تحليل الحالة في باقة برو ماكس وأرغب في التواصل.',
  proMaxRecordWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ السجلات في باقة برو ماكس وأرغب في التواصل.',
  proMaxPublicBookingWhatsappMessage: 'السلام عليكم، استهلكت حد إضافة المواعيد اليومية في باقة برو ماكس وأرغب في التواصل.',
  proMaxPublicFormBookingWhatsappMessage: 'السلام عليكم، استهلكت حد الحجز اليومي من فورم الجمهور في باقة برو ماكس وأرغب في التواصل.',
  proMaxSecretaryEntryRequestWhatsappMessage: 'السلام عليكم، استهلكت حد ارسال الموعد للطبيب من خلال السكرتارية في باقة برو ماكس وأرغب في التواصل.',
  proMaxReadyPrescriptionWhatsappMessage: 'السلام عليكم، استهلكت حد حفظ الروشتات الجاهزة في باقة برو ماكس وأرغب في التواصل.',
  proMaxMedicalReportWhatsappMessage: 'السلام عليكم، استهلكت الحد اليومي لطباعة التقرير الطبي للحالة في باقة برو ماكس وأرغب في التواصل.',
  proMaxReadyPrescriptionsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لعدد الروشتات الجاهزة في باقة برو ماكس وأرغب في التواصل.',
  proMaxMedicationCustomizationsCapacityWhatsappMessage: 'السلام عليكم، وصلت للحد الأقصى لتخزين الأدوية المعدلة في باقة برو ماكس وأرغب في التواصل.',
  proMaxTagLabel: 'Pro Max',
};

export const ACCOUNT_TYPE_CONTROL_DOC_ID = 'accountTypeControls';
