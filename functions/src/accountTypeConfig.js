
const { DEFAULT_SMART_RX_CONFIG } = require('./smartRxDefaults');

const ACCOUNT_TYPE_CONTROL_DOC_ID = 'accountTypeControls';

// ─ السقف الأقصى للحدود — ٦ أرقام (كان 5000 ورفعناه 2026-04 عشان السجلات لـبرو/برو ماكس) ─
const MAX_LIMIT_VALUE = 999999;
const toSafeLimit = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_LIMIT_VALUE, Math.max(0, Math.floor(n)));
};

const toBoolean = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

const normalizeMessageAllowEmpty = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim().slice(0, 500);
};

const firstDefined = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

const normalizeWhatsAppDigits = (value) => String(value || '').replace(/\D/g, '').slice(0, 20);

const buildWhatsAppUrl = (digits, message) => {
  if (!digits) return '';
  const text = encodeURIComponent(String(message || '').trim());
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};


const normalizeSmartRxConfig = (raw) => {
  const freeDailyLimit = toSafeLimit(raw?.freeDailyLimit, DEFAULT_SMART_RX_CONFIG.freeDailyLimit);
  const premiumDailyLimit = toSafeLimit(raw?.premiumDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumDailyLimit);
  // ─ السجلات بقت "حد كلي" (سعة) — تغيّرت 2026-04 من حد يومي ─
  const freeRecordsMaxCount = toSafeLimit(raw?.freeRecordsMaxCount, DEFAULT_SMART_RX_CONFIG.freeRecordsMaxCount);
  const premiumRecordsMaxCount = toSafeLimit(raw?.premiumRecordsMaxCount, DEFAULT_SMART_RX_CONFIG.premiumRecordsMaxCount);
  // ─ الترجمة الذكية للروشتة (جديد 2026-04) ─
  const freeTranslationDailyLimit = toSafeLimit(raw?.freeTranslationDailyLimit, DEFAULT_SMART_RX_CONFIG.freeTranslationDailyLimit);
  const premiumTranslationDailyLimit = toSafeLimit(raw?.premiumTranslationDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumTranslationDailyLimit);
  // ─ الفروع (جديد 2026-04) ─
  const freeBranchesMaxCount = toSafeLimit(raw?.freeBranchesMaxCount, DEFAULT_SMART_RX_CONFIG.freeBranchesMaxCount);
  const premiumBranchesMaxCount = toSafeLimit(raw?.premiumBranchesMaxCount, DEFAULT_SMART_RX_CONFIG.premiumBranchesMaxCount);
  // ─ 🆕 سعة شركات التأمين 2026-04 ─
  const freeInsuranceCompaniesMaxCount = toSafeLimit(raw?.freeInsuranceCompaniesMaxCount, DEFAULT_SMART_RX_CONFIG.freeInsuranceCompaniesMaxCount);
  const premiumInsuranceCompaniesMaxCount = toSafeLimit(raw?.premiumInsuranceCompaniesMaxCount, DEFAULT_SMART_RX_CONFIG.premiumInsuranceCompaniesMaxCount);
  // ─ 🆕 رسائل سعة شركات التأمين ─
  const freeInsuranceCompaniesCapacityMessage = normalizeMessageAllowEmpty(raw?.freeInsuranceCompaniesCapacityMessage, DEFAULT_SMART_RX_CONFIG.freeInsuranceCompaniesCapacityMessage);
  const premiumInsuranceCompaniesCapacityMessage = normalizeMessageAllowEmpty(raw?.premiumInsuranceCompaniesCapacityMessage, DEFAULT_SMART_RX_CONFIG.premiumInsuranceCompaniesCapacityMessage);
  const freeInsuranceCompaniesCapacityWhatsappMessage = normalizeMessageAllowEmpty(raw?.freeInsuranceCompaniesCapacityWhatsappMessage, DEFAULT_SMART_RX_CONFIG.freeInsuranceCompaniesCapacityWhatsappMessage);
  const premiumInsuranceCompaniesCapacityWhatsappMessage = normalizeMessageAllowEmpty(raw?.premiumInsuranceCompaniesCapacityWhatsappMessage, DEFAULT_SMART_RX_CONFIG.premiumInsuranceCompaniesCapacityWhatsappMessage);
  const freePublicBookingDailyLimit = toSafeLimit(raw?.freePublicBookingDailyLimit, DEFAULT_SMART_RX_CONFIG.freePublicBookingDailyLimit);
  const premiumPublicBookingDailyLimit = toSafeLimit(raw?.premiumPublicBookingDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumPublicBookingDailyLimit);
  const freePublicFormBookingDailyLimit = toSafeLimit(raw?.freePublicFormBookingDailyLimit, DEFAULT_SMART_RX_CONFIG.freePublicFormBookingDailyLimit);
  const premiumPublicFormBookingDailyLimit = toSafeLimit(raw?.premiumPublicFormBookingDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumPublicFormBookingDailyLimit);
  const freeSecretaryEntryRequestDailyLimit = toSafeLimit(raw?.freeSecretaryEntryRequestDailyLimit, DEFAULT_SMART_RX_CONFIG.freeSecretaryEntryRequestDailyLimit);
  const premiumSecretaryEntryRequestDailyLimit = toSafeLimit(raw?.premiumSecretaryEntryRequestDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumSecretaryEntryRequestDailyLimit);
  const freeReadyPrescriptionDailyLimit = toSafeLimit(raw?.freeReadyPrescriptionDailyLimit, DEFAULT_SMART_RX_CONFIG.freeReadyPrescriptionDailyLimit);
  const premiumReadyPrescriptionDailyLimit = toSafeLimit(raw?.premiumReadyPrescriptionDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumReadyPrescriptionDailyLimit);
  const freeMedicalReportDailyLimit = toSafeLimit(raw?.freeMedicalReportDailyLimit, DEFAULT_SMART_RX_CONFIG.freeMedicalReportDailyLimit);
  const premiumMedicalReportDailyLimit = toSafeLimit(raw?.premiumMedicalReportDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumMedicalReportDailyLimit);
  const freeReadyPrescriptionsMaxCount = toSafeLimit(raw?.freeReadyPrescriptionsMaxCount, DEFAULT_SMART_RX_CONFIG.freeReadyPrescriptionsMaxCount);
  const premiumReadyPrescriptionsMaxCount = toSafeLimit(raw?.premiumReadyPrescriptionsMaxCount, DEFAULT_SMART_RX_CONFIG.premiumReadyPrescriptionsMaxCount);
  const freeMedicationCustomizationsMaxCount = toSafeLimit(raw?.freeMedicationCustomizationsMaxCount, DEFAULT_SMART_RX_CONFIG.freeMedicationCustomizationsMaxCount);
  const premiumMedicationCustomizationsMaxCount = toSafeLimit(raw?.premiumMedicationCustomizationsMaxCount, DEFAULT_SMART_RX_CONFIG.premiumMedicationCustomizationsMaxCount);
  const freeInteractionToolDailyLimit = toSafeLimit(raw?.freeInteractionToolDailyLimit, DEFAULT_SMART_RX_CONFIG.freeInteractionToolDailyLimit);
  const premiumInteractionToolDailyLimit = toSafeLimit(raw?.premiumInteractionToolDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumInteractionToolDailyLimit);
  const freeRenalToolDailyLimit = toSafeLimit(raw?.freeRenalToolDailyLimit, DEFAULT_SMART_RX_CONFIG.freeRenalToolDailyLimit);
  const premiumRenalToolDailyLimit = toSafeLimit(raw?.premiumRenalToolDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumRenalToolDailyLimit);
  const freePregnancyToolDailyLimit = toSafeLimit(raw?.freePregnancyToolDailyLimit, DEFAULT_SMART_RX_CONFIG.freePregnancyToolDailyLimit);
  const premiumPregnancyToolDailyLimit = toSafeLimit(raw?.premiumPregnancyToolDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumPregnancyToolDailyLimit);
  const interactionToolPremiumOnly = toBoolean(raw?.interactionToolPremiumOnly, DEFAULT_SMART_RX_CONFIG.interactionToolPremiumOnly);
  const renalToolPremiumOnly = toBoolean(raw?.renalToolPremiumOnly, DEFAULT_SMART_RX_CONFIG.renalToolPremiumOnly);
  const pregnancyToolPremiumOnly = toBoolean(raw?.pregnancyToolPremiumOnly, DEFAULT_SMART_RX_CONFIG.pregnancyToolPremiumOnly);
  const whatsappNumber = normalizeWhatsAppDigits(raw?.whatsappNumber || DEFAULT_SMART_RX_CONFIG.whatsappNumber);
  const legacyMessage = String(raw?.whatsappMessage || '').trim().slice(0, 500);
  const freeAnalysisLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeAnalysisLimitMessage, raw?.freeLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeAnalysisLimitMessage
  );
  const premiumAnalysisLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumAnalysisLimitMessage, raw?.premiumLimitMessage, raw?.premiumWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumAnalysisLimitMessage
  );
  // ─ رسائل سعة السجلات (تغيّرت من daily للحد الكلي) ─
  const freeRecordsCapacityMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordsCapacityMessage, raw?.freeRecordLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeRecordsCapacityMessage
  );
  const premiumRecordsCapacityMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordsCapacityMessage, raw?.premiumRecordLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumRecordsCapacityMessage
  );
  // ─ رسائل الترجمة الذكية (جديد) ─
  const freeTranslationLimitMessage = normalizeMessageAllowEmpty(
    raw?.freeTranslationLimitMessage,
    DEFAULT_SMART_RX_CONFIG.freeTranslationLimitMessage,
  );
  const premiumTranslationLimitMessage = normalizeMessageAllowEmpty(
    raw?.premiumTranslationLimitMessage,
    DEFAULT_SMART_RX_CONFIG.premiumTranslationLimitMessage,
  );
  // ─ رسائل أدوات الأدوية (الأزرار الذهبية + الكلى) — اتنقلوا لـ"حدود الميزات" ─
  const freeInteractionToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.freeInteractionToolLimitMessage,
    DEFAULT_SMART_RX_CONFIG.freeInteractionToolLimitMessage,
  );
  const premiumInteractionToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.premiumInteractionToolLimitMessage,
    DEFAULT_SMART_RX_CONFIG.premiumInteractionToolLimitMessage,
  );
  const freePregnancyToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.freePregnancyToolLimitMessage,
    DEFAULT_SMART_RX_CONFIG.freePregnancyToolLimitMessage,
  );
  const premiumPregnancyToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.premiumPregnancyToolLimitMessage,
    DEFAULT_SMART_RX_CONFIG.premiumPregnancyToolLimitMessage,
  );
  // ─ 🆕 أزرار تصدير الروشتة — حدود يومية + رسائل + واتساب ─
  const freePrescriptionPrintDailyLimit = toSafeLimit(raw?.freePrescriptionPrintDailyLimit, DEFAULT_SMART_RX_CONFIG.freePrescriptionPrintDailyLimit);
  const premiumPrescriptionPrintDailyLimit = toSafeLimit(raw?.premiumPrescriptionPrintDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionPrintDailyLimit);
  const freePrescriptionDownloadDailyLimit = toSafeLimit(raw?.freePrescriptionDownloadDailyLimit, DEFAULT_SMART_RX_CONFIG.freePrescriptionDownloadDailyLimit);
  const premiumPrescriptionDownloadDailyLimit = toSafeLimit(raw?.premiumPrescriptionDownloadDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionDownloadDailyLimit);
  const freePrescriptionWhatsappDailyLimit = toSafeLimit(raw?.freePrescriptionWhatsappDailyLimit, DEFAULT_SMART_RX_CONFIG.freePrescriptionWhatsappDailyLimit);
  const premiumPrescriptionWhatsappDailyLimit = toSafeLimit(raw?.premiumPrescriptionWhatsappDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionWhatsappDailyLimit);
  const freePrescriptionPrintLimitMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionPrintLimitMessage, DEFAULT_SMART_RX_CONFIG.freePrescriptionPrintLimitMessage);
  const premiumPrescriptionPrintLimitMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionPrintLimitMessage, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionPrintLimitMessage);
  const freePrescriptionPrintWhatsappMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionPrintWhatsappMessage, DEFAULT_SMART_RX_CONFIG.freePrescriptionPrintWhatsappMessage);
  const premiumPrescriptionPrintWhatsappMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionPrintWhatsappMessage, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionPrintWhatsappMessage);
  const freePrescriptionDownloadLimitMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionDownloadLimitMessage, DEFAULT_SMART_RX_CONFIG.freePrescriptionDownloadLimitMessage);
  const premiumPrescriptionDownloadLimitMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionDownloadLimitMessage, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionDownloadLimitMessage);
  const freePrescriptionDownloadWhatsappMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionDownloadWhatsappMessage, DEFAULT_SMART_RX_CONFIG.freePrescriptionDownloadWhatsappMessage);
  const premiumPrescriptionDownloadWhatsappMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionDownloadWhatsappMessage, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionDownloadWhatsappMessage);
  const freePrescriptionWhatsappLimitMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionWhatsappLimitMessage, DEFAULT_SMART_RX_CONFIG.freePrescriptionWhatsappLimitMessage);
  const premiumPrescriptionWhatsappLimitMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionWhatsappLimitMessage, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionWhatsappLimitMessage);
  const freePrescriptionWhatsappWhatsappMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionWhatsappWhatsappMessage, DEFAULT_SMART_RX_CONFIG.freePrescriptionWhatsappWhatsappMessage);
  const premiumPrescriptionWhatsappWhatsappMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionWhatsappWhatsappMessage, DEFAULT_SMART_RX_CONFIG.premiumPrescriptionWhatsappWhatsappMessage);

  const freeRenalToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.freeRenalToolLimitMessage,
    DEFAULT_SMART_RX_CONFIG.freeRenalToolLimitMessage,
  );
  const premiumRenalToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.premiumRenalToolLimitMessage,
    DEFAULT_SMART_RX_CONFIG.premiumRenalToolLimitMessage,
  );
  const freePublicBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicBookingLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freePublicBookingLimitMessage
  );
  const premiumPublicBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicBookingLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumPublicBookingLimitMessage
  );
  const freePublicFormBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicFormBookingLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freePublicFormBookingLimitMessage
  );
  const premiumPublicFormBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicFormBookingLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumPublicFormBookingLimitMessage
  );
  const freeSecretaryEntryRequestLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeSecretaryEntryRequestLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeSecretaryEntryRequestLimitMessage
  );
  const premiumSecretaryEntryRequestLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumSecretaryEntryRequestLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumSecretaryEntryRequestLimitMessage
  );
  const freeReadyPrescriptionDailyLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeReadyPrescriptionDailyLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeReadyPrescriptionDailyLimitMessage
  );
  const premiumReadyPrescriptionDailyLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumReadyPrescriptionDailyLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumReadyPrescriptionDailyLimitMessage
  );
  const freeMedicalReportLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeMedicalReportLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeMedicalReportLimitMessage
  );
  const premiumMedicalReportLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumMedicalReportLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumMedicalReportLimitMessage
  );
  const freeReadyPrescriptionsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.freeReadyPrescriptionsCapacityMessage,
    DEFAULT_SMART_RX_CONFIG.freeReadyPrescriptionsCapacityMessage
  );
  const premiumReadyPrescriptionsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.premiumReadyPrescriptionsCapacityMessage,
    DEFAULT_SMART_RX_CONFIG.premiumReadyPrescriptionsCapacityMessage
  );
  const freeMedicationCustomizationsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.freeMedicationCustomizationsCapacityMessage,
    DEFAULT_SMART_RX_CONFIG.freeMedicationCustomizationsCapacityMessage
  );
  const premiumMedicationCustomizationsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.premiumMedicationCustomizationsCapacityMessage,
    DEFAULT_SMART_RX_CONFIG.premiumMedicationCustomizationsCapacityMessage
  );
  const freeAnalysisWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeAnalysisWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeAnalysisWhatsappMessage
  );
  const premiumAnalysisWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumAnalysisWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumAnalysisWhatsappMessage
  );
  // ─ رسائل واتساب السجلات (تغيّرت من daily للحد الكلي) ─
  const freeRecordsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordsCapacityWhatsappMessage, raw?.freeRecordWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeRecordsCapacityWhatsappMessage
  );
  const premiumRecordsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordsCapacityWhatsappMessage, raw?.premiumRecordWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumRecordsCapacityWhatsappMessage
  );
  // ─ رسائل واتساب الترجمة الذكية (جديد) ─
  const freeTranslationWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freeTranslationWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.freeTranslationWhatsappMessage,
  );
  const premiumTranslationWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.premiumTranslationWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.premiumTranslationWhatsappMessage,
  );
  // ─ رسائل واتساب أدوات الأدوية (التداخلات + الحمل + الكلى) ─
  const freeInteractionToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freeInteractionToolWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.freeInteractionToolWhatsappMessage,
  );
  const premiumInteractionToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.premiumInteractionToolWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.premiumInteractionToolWhatsappMessage,
  );
  const freePregnancyToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freePregnancyToolWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.freePregnancyToolWhatsappMessage,
  );
  const premiumPregnancyToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.premiumPregnancyToolWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.premiumPregnancyToolWhatsappMessage,
  );
  const freeRenalToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freeRenalToolWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.freeRenalToolWhatsappMessage,
  );
  const premiumRenalToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.premiumRenalToolWhatsappMessage,
    DEFAULT_SMART_RX_CONFIG.premiumRenalToolWhatsappMessage,
  );
  const freePublicBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicBookingWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freePublicBookingWhatsappMessage
  );
  const premiumPublicBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicBookingWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumPublicBookingWhatsappMessage
  );
  const freePublicFormBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicFormBookingWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freePublicFormBookingWhatsappMessage
  );
  const premiumPublicFormBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicFormBookingWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumPublicFormBookingWhatsappMessage
  );
  const freeSecretaryEntryRequestWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeSecretaryEntryRequestWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeSecretaryEntryRequestWhatsappMessage
  );
  const premiumSecretaryEntryRequestWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumSecretaryEntryRequestWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumSecretaryEntryRequestWhatsappMessage
  );
  const freeReadyPrescriptionWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeReadyPrescriptionWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeReadyPrescriptionWhatsappMessage
  );
  const premiumReadyPrescriptionWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumReadyPrescriptionWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumReadyPrescriptionWhatsappMessage
  );
  const freeMedicalReportWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeMedicalReportWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeMedicalReportWhatsappMessage
  );
  const premiumMedicalReportWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumMedicalReportWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumMedicalReportWhatsappMessage
  );
  const freeReadyPrescriptionsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeReadyPrescriptionsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeReadyPrescriptionsCapacityWhatsappMessage
  );
  const premiumReadyPrescriptionsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumReadyPrescriptionsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumReadyPrescriptionsCapacityWhatsappMessage
  );
  const freeMedicationCustomizationsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeMedicationCustomizationsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeMedicationCustomizationsCapacityWhatsappMessage
  );
  const premiumMedicationCustomizationsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumMedicationCustomizationsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumMedicationCustomizationsCapacityWhatsappMessage
  );
  const interactionToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.interactionToolLockedMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.interactionToolLockedMessage
  );
  const renalToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.renalToolLockedMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.renalToolLockedMessage
  );
  const pregnancyToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.pregnancyToolLockedMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.pregnancyToolLockedMessage
  );
  // override للقيم القديمة ('Premium'/'بريميوم'/'مميز') المحفوظة قبل إعادة التسمية
  const _rawTagLabel = String(raw?.premiumTagLabel || '').trim();
  const _isLegacyTag = _rawTagLabel === 'Premium' || _rawTagLabel === 'premium' || _rawTagLabel === 'بريميوم' || _rawTagLabel === 'مميز';
  const premiumTagLabel = (!_rawTagLabel || _isLegacyTag)
    ? DEFAULT_SMART_RX_CONFIG.premiumTagLabel
    : normalizeMessageAllowEmpty(_rawTagLabel, DEFAULT_SMART_RX_CONFIG.premiumTagLabel);

  return {
    freeDailyLimit,
    premiumDailyLimit,
    // ─ السجلات (سعة كلية بعد 2026-04) ─
    freeRecordsMaxCount,
    premiumRecordsMaxCount,
    // ─ الترجمة الذكية ─
    freeTranslationDailyLimit,
    premiumTranslationDailyLimit,
    // ─ الفروع ─
    freeBranchesMaxCount,
    premiumBranchesMaxCount,
    // ─ 🆕 شركات التأمين ─
    freeInsuranceCompaniesMaxCount,
    premiumInsuranceCompaniesMaxCount,
    freeInsuranceCompaniesCapacityMessage,
    premiumInsuranceCompaniesCapacityMessage,
    freeInsuranceCompaniesCapacityWhatsappMessage,
    premiumInsuranceCompaniesCapacityWhatsappMessage,
    freePublicBookingDailyLimit,
    premiumPublicBookingDailyLimit,
    freePublicFormBookingDailyLimit,
    premiumPublicFormBookingDailyLimit,
    freeSecretaryEntryRequestDailyLimit,
    premiumSecretaryEntryRequestDailyLimit,
    freeReadyPrescriptionDailyLimit,
    premiumReadyPrescriptionDailyLimit,
    freeMedicalReportDailyLimit,
    premiumMedicalReportDailyLimit,
    freeReadyPrescriptionsMaxCount,
    premiumReadyPrescriptionsMaxCount,
    freeMedicationCustomizationsMaxCount,
    premiumMedicationCustomizationsMaxCount,
    freeInteractionToolDailyLimit,
    premiumInteractionToolDailyLimit,
    freeRenalToolDailyLimit,
    premiumRenalToolDailyLimit,
    freePregnancyToolDailyLimit,
    premiumPregnancyToolDailyLimit,
    freeAnalysisLimitMessage,
    premiumAnalysisLimitMessage,
    // ─ رسائل سعة السجلات + الترجمة (جديد 2026-04) ─
    freeRecordsCapacityMessage,
    premiumRecordsCapacityMessage,
    freeTranslationLimitMessage,
    premiumTranslationLimitMessage,
    // ─ رسائل أدوات الأدوية (التداخلات + الحمل + الكلى) ─
    freeInteractionToolLimitMessage,
    premiumInteractionToolLimitMessage,
    freePregnancyToolLimitMessage,
    premiumPregnancyToolLimitMessage,
    freeRenalToolLimitMessage,
    premiumRenalToolLimitMessage,
    // ─ 🆕 أزرار تصدير الروشتة ─
    freePrescriptionPrintDailyLimit,
    premiumPrescriptionPrintDailyLimit,
    freePrescriptionDownloadDailyLimit,
    premiumPrescriptionDownloadDailyLimit,
    freePrescriptionWhatsappDailyLimit,
    premiumPrescriptionWhatsappDailyLimit,
    freePrescriptionPrintLimitMessage,
    premiumPrescriptionPrintLimitMessage,
    freePrescriptionPrintWhatsappMessage,
    premiumPrescriptionPrintWhatsappMessage,
    freePrescriptionDownloadLimitMessage,
    premiumPrescriptionDownloadLimitMessage,
    freePrescriptionDownloadWhatsappMessage,
    premiumPrescriptionDownloadWhatsappMessage,
    freePrescriptionWhatsappLimitMessage,
    premiumPrescriptionWhatsappLimitMessage,
    freePrescriptionWhatsappWhatsappMessage,
    premiumPrescriptionWhatsappWhatsappMessage,
    freePublicBookingLimitMessage,
    premiumPublicBookingLimitMessage,
    freePublicFormBookingLimitMessage,
    premiumPublicFormBookingLimitMessage,
    freeSecretaryEntryRequestLimitMessage,
    premiumSecretaryEntryRequestLimitMessage,
    freeReadyPrescriptionDailyLimitMessage,
    premiumReadyPrescriptionDailyLimitMessage,
    freeMedicalReportLimitMessage,
    premiumMedicalReportLimitMessage,
    freeReadyPrescriptionsCapacityMessage,
    premiumReadyPrescriptionsCapacityMessage,
    freeMedicationCustomizationsCapacityMessage,
    premiumMedicationCustomizationsCapacityMessage,
    whatsappNumber,
    freeAnalysisWhatsappMessage,
    premiumAnalysisWhatsappMessage,
    // ─ رسائل واتساب: السجلات (سعة) + الترجمة (جديد 2026-04) ─
    freeRecordsCapacityWhatsappMessage,
    premiumRecordsCapacityWhatsappMessage,
    freeTranslationWhatsappMessage,
    premiumTranslationWhatsappMessage,
    // ─ رسائل واتساب أدوات الأدوية ─
    freeInteractionToolWhatsappMessage,
    premiumInteractionToolWhatsappMessage,
    freePregnancyToolWhatsappMessage,
    premiumPregnancyToolWhatsappMessage,
    freeRenalToolWhatsappMessage,
    premiumRenalToolWhatsappMessage,
    freePublicBookingWhatsappMessage,
    premiumPublicBookingWhatsappMessage,
    freePublicFormBookingWhatsappMessage,
    premiumPublicFormBookingWhatsappMessage,
    freeSecretaryEntryRequestWhatsappMessage,
    premiumSecretaryEntryRequestWhatsappMessage,
    freeReadyPrescriptionWhatsappMessage,
    premiumReadyPrescriptionWhatsappMessage,
    freeMedicalReportWhatsappMessage,
    premiumMedicalReportWhatsappMessage,
    freeReadyPrescriptionsCapacityWhatsappMessage,
    premiumReadyPrescriptionsCapacityWhatsappMessage,
    freeMedicationCustomizationsCapacityWhatsappMessage,
    premiumMedicationCustomizationsCapacityWhatsappMessage,
    interactionToolPremiumOnly,
    renalToolPremiumOnly,
    pregnancyToolPremiumOnly,
    interactionToolLockedMessage,
    renalToolLockedMessage,
    pregnancyToolLockedMessage,
    premiumTagLabel,
    whatsappUrl: buildWhatsAppUrl(whatsappNumber, freeAnalysisWhatsappMessage),
    // ═══ حقول الفئة الجديدة "برو ماكس" — pass-through مع fallback للـ defaults ═══
    proMaxDailyLimit: toSafeLimit(raw?.proMaxDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxDailyLimit),
    // ─ السجلات (سعة كلية) + الترجمة + الفروع — جديد 2026-04 ─
    proMaxRecordsMaxCount: toSafeLimit(raw?.proMaxRecordsMaxCount, DEFAULT_SMART_RX_CONFIG.proMaxRecordsMaxCount),
    proMaxTranslationDailyLimit: toSafeLimit(raw?.proMaxTranslationDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxTranslationDailyLimit),
    proMaxBranchesMaxCount: toSafeLimit(raw?.proMaxBranchesMaxCount, DEFAULT_SMART_RX_CONFIG.proMaxBranchesMaxCount),
    // ─ 🆕 برو ماكس: شركات التأمين ─
    proMaxInsuranceCompaniesMaxCount: toSafeLimit(raw?.proMaxInsuranceCompaniesMaxCount, DEFAULT_SMART_RX_CONFIG.proMaxInsuranceCompaniesMaxCount),
    proMaxInsuranceCompaniesCapacityMessage: normalizeMessageAllowEmpty(raw?.proMaxInsuranceCompaniesCapacityMessage, DEFAULT_SMART_RX_CONFIG.proMaxInsuranceCompaniesCapacityMessage),
    proMaxInsuranceCompaniesCapacityWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxInsuranceCompaniesCapacityWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxInsuranceCompaniesCapacityWhatsappMessage),
    proMaxPublicBookingDailyLimit: toSafeLimit(raw?.proMaxPublicBookingDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxPublicBookingDailyLimit),
    proMaxPublicFormBookingDailyLimit: toSafeLimit(raw?.proMaxPublicFormBookingDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxPublicFormBookingDailyLimit),
    proMaxSecretaryEntryRequestDailyLimit: toSafeLimit(raw?.proMaxSecretaryEntryRequestDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxSecretaryEntryRequestDailyLimit),
    proMaxReadyPrescriptionDailyLimit: toSafeLimit(raw?.proMaxReadyPrescriptionDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxReadyPrescriptionDailyLimit),
    proMaxMedicalReportDailyLimit: toSafeLimit(raw?.proMaxMedicalReportDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxMedicalReportDailyLimit),
    proMaxReadyPrescriptionsMaxCount: toSafeLimit(raw?.proMaxReadyPrescriptionsMaxCount, DEFAULT_SMART_RX_CONFIG.proMaxReadyPrescriptionsMaxCount),
    proMaxMedicationCustomizationsMaxCount: toSafeLimit(raw?.proMaxMedicationCustomizationsMaxCount, DEFAULT_SMART_RX_CONFIG.proMaxMedicationCustomizationsMaxCount),
    proMaxInteractionToolDailyLimit: toSafeLimit(raw?.proMaxInteractionToolDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxInteractionToolDailyLimit),
    proMaxRenalToolDailyLimit: toSafeLimit(raw?.proMaxRenalToolDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxRenalToolDailyLimit),
    proMaxPregnancyToolDailyLimit: toSafeLimit(raw?.proMaxPregnancyToolDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxPregnancyToolDailyLimit),
    proMaxAnalysisLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxAnalysisLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxAnalysisLimitMessage),
    // ─ رسائل برو ماكس: سعة السجلات + الترجمة (جديد 2026-04) ─
    proMaxRecordsCapacityMessage: normalizeMessageAllowEmpty(
      firstDefined(raw?.proMaxRecordsCapacityMessage, raw?.proMaxRecordLimitMessage),
      DEFAULT_SMART_RX_CONFIG.proMaxRecordsCapacityMessage,
    ),
    proMaxTranslationLimitMessage: normalizeMessageAllowEmpty(
      raw?.proMaxTranslationLimitMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxTranslationLimitMessage,
    ),
    // ─ رسائل برو ماكس: أدوات الأدوية ─
    proMaxInteractionToolLimitMessage: normalizeMessageAllowEmpty(
      raw?.proMaxInteractionToolLimitMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxInteractionToolLimitMessage,
    ),
    proMaxPregnancyToolLimitMessage: normalizeMessageAllowEmpty(
      raw?.proMaxPregnancyToolLimitMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxPregnancyToolLimitMessage,
    ),
    proMaxRenalToolLimitMessage: normalizeMessageAllowEmpty(
      raw?.proMaxRenalToolLimitMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxRenalToolLimitMessage,
    ),
    // ─ 🆕 برو ماكس: أزرار تصدير الروشتة ─
    proMaxPrescriptionPrintDailyLimit: toSafeLimit(raw?.proMaxPrescriptionPrintDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionPrintDailyLimit),
    proMaxPrescriptionDownloadDailyLimit: toSafeLimit(raw?.proMaxPrescriptionDownloadDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionDownloadDailyLimit),
    proMaxPrescriptionWhatsappDailyLimit: toSafeLimit(raw?.proMaxPrescriptionWhatsappDailyLimit, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionWhatsappDailyLimit),
    proMaxPrescriptionPrintLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxPrescriptionPrintLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionPrintLimitMessage),
    proMaxPrescriptionPrintWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxPrescriptionPrintWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionPrintWhatsappMessage),
    proMaxPrescriptionDownloadLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxPrescriptionDownloadLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionDownloadLimitMessage),
    proMaxPrescriptionDownloadWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxPrescriptionDownloadWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionDownloadWhatsappMessage),
    proMaxPrescriptionWhatsappLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxPrescriptionWhatsappLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionWhatsappLimitMessage),
    proMaxPrescriptionWhatsappWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxPrescriptionWhatsappWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxPrescriptionWhatsappWhatsappMessage),
    proMaxPublicBookingLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxPublicBookingLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxPublicBookingLimitMessage),
    proMaxPublicFormBookingLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxPublicFormBookingLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxPublicFormBookingLimitMessage),
    proMaxSecretaryEntryRequestLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxSecretaryEntryRequestLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxSecretaryEntryRequestLimitMessage),
    proMaxReadyPrescriptionDailyLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionDailyLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxReadyPrescriptionDailyLimitMessage),
    proMaxMedicalReportLimitMessage: normalizeMessageAllowEmpty(raw?.proMaxMedicalReportLimitMessage, DEFAULT_SMART_RX_CONFIG.proMaxMedicalReportLimitMessage),
    proMaxReadyPrescriptionsCapacityMessage: normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionsCapacityMessage, DEFAULT_SMART_RX_CONFIG.proMaxReadyPrescriptionsCapacityMessage),
    proMaxMedicationCustomizationsCapacityMessage: normalizeMessageAllowEmpty(raw?.proMaxMedicationCustomizationsCapacityMessage, DEFAULT_SMART_RX_CONFIG.proMaxMedicationCustomizationsCapacityMessage),
    proMaxAnalysisWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxAnalysisWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxAnalysisWhatsappMessage),
    // ─ رسائل واتساب برو ماكس: سعة السجلات + الترجمة (جديد 2026-04) ─
    proMaxRecordsCapacityWhatsappMessage: normalizeMessageAllowEmpty(
      firstDefined(raw?.proMaxRecordsCapacityWhatsappMessage, raw?.proMaxRecordWhatsappMessage),
      DEFAULT_SMART_RX_CONFIG.proMaxRecordsCapacityWhatsappMessage,
    ),
    proMaxTranslationWhatsappMessage: normalizeMessageAllowEmpty(
      raw?.proMaxTranslationWhatsappMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxTranslationWhatsappMessage,
    ),
    // ─ رسائل واتساب برو ماكس: أدوات الأدوية ─
    proMaxInteractionToolWhatsappMessage: normalizeMessageAllowEmpty(
      raw?.proMaxInteractionToolWhatsappMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxInteractionToolWhatsappMessage,
    ),
    proMaxPregnancyToolWhatsappMessage: normalizeMessageAllowEmpty(
      raw?.proMaxPregnancyToolWhatsappMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxPregnancyToolWhatsappMessage,
    ),
    proMaxRenalToolWhatsappMessage: normalizeMessageAllowEmpty(
      raw?.proMaxRenalToolWhatsappMessage,
      DEFAULT_SMART_RX_CONFIG.proMaxRenalToolWhatsappMessage,
    ),
    proMaxPublicBookingWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxPublicBookingWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxPublicBookingWhatsappMessage),
    proMaxPublicFormBookingWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxPublicFormBookingWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxPublicFormBookingWhatsappMessage),
    proMaxSecretaryEntryRequestWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxSecretaryEntryRequestWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxSecretaryEntryRequestWhatsappMessage),
    proMaxReadyPrescriptionWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxReadyPrescriptionWhatsappMessage),
    proMaxMedicalReportWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxMedicalReportWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxMedicalReportWhatsappMessage),
    proMaxReadyPrescriptionsCapacityWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionsCapacityWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxReadyPrescriptionsCapacityWhatsappMessage),
    proMaxMedicationCustomizationsCapacityWhatsappMessage: normalizeMessageAllowEmpty(raw?.proMaxMedicationCustomizationsCapacityWhatsappMessage, DEFAULT_SMART_RX_CONFIG.proMaxMedicationCustomizationsCapacityWhatsappMessage),
    proMaxTagLabel: (() => {
      const _raw = String(raw?.proMaxTagLabel || '').trim();
      const _isLegacy = _raw === 'Premium' || _raw === 'premium' || _raw === 'بريميوم' || _raw === 'مميز';
      return (!_raw || _isLegacy) ? DEFAULT_SMART_RX_CONFIG.proMaxTagLabel : normalizeMessageAllowEmpty(_raw, DEFAULT_SMART_RX_CONFIG.proMaxTagLabel);
    })(),
  };
};


const getCairoDateKey = (date = new Date()) => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Cairo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(date);


const getSmartRxConfig = async (db) => {
  const snap = await db.collection('settings').doc(ACCOUNT_TYPE_CONTROL_DOC_ID).get();
  if (!snap.exists) return normalizeSmartRxConfig({});
  return normalizeSmartRxConfig(snap.data() || {});
};


const resolveDoctorAccountType = (doctorData) => {
  const raw = doctorData?.accountType;
  // 3 فئات مدعومة: free | premium (برو) | pro_max (برو ماكس).
  // برو وبرو ماكس بيشاركوا نفس حقل premiumExpiryDate للانتهاء.
  let accountType = raw === 'premium' ? 'premium' : raw === 'pro_max' ? 'pro_max' : 'free';
  const premiumExpiryDate = typeof doctorData?.premiumExpiryDate === 'string' ? doctorData.premiumExpiryDate : '';
  if ((accountType === 'premium' || accountType === 'pro_max') && premiumExpiryDate) {
    const expiryMs = new Date(premiumExpiryDate).getTime();
    if (Number.isFinite(expiryMs) && Date.now() >= expiryMs) {
      accountType = 'free';
    }
  }
  return accountType;
};

/**
 * Helper: يختار القيمة المناسبة من الـ config حسب الفئة.
 * pro_max: لو عنده قيمة خاصة نستخدمها، لو لأ نرجع لقيمة برو (fallback).
 * premium: قيمة برو.
 * free: قيمة المجاني.
 * ملاحظة: proMax بيرث من premium كـ default لحد ما الأدمن يضبط حدود مختلفة.
 */
const pickTierValue = (accountType, config, { freeKey, premiumKey, proMaxKey }) => {
  if (accountType === 'pro_max') {
    const v = config[proMaxKey];
    if (v !== undefined && v !== null && v !== '') return v;
    return config[premiumKey];
  }
  if (accountType === 'premium') return config[premiumKey];
  return config[freeKey];
};

module.exports = {
  ACCOUNT_TYPE_CONTROL_DOC_ID,
  buildWhatsAppUrl,
  normalizeSmartRxConfig,
  getCairoDateKey,
  getSmartRxConfig,
  resolveDoctorAccountType,
  pickTierValue,
};
