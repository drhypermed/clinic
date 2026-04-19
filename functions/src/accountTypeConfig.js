
const { DEFAULT_SMART_RX_CONFIG } = require('./smartRxDefaults');

const ACCOUNT_TYPE_CONTROL_DOC_ID = 'accountTypeControls';

const toSafeLimit = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5000, Math.max(0, Math.floor(n)));
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
  const freeRecordDailyLimit = toSafeLimit(raw?.freeRecordDailyLimit, DEFAULT_SMART_RX_CONFIG.freeRecordDailyLimit);
  const premiumRecordDailyLimit = toSafeLimit(raw?.premiumRecordDailyLimit, DEFAULT_SMART_RX_CONFIG.premiumRecordDailyLimit);
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
  const freeRecordLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeRecordLimitMessage
  );
  const premiumRecordLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordLimitMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumRecordLimitMessage
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
  const freeRecordWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.freeRecordWhatsappMessage
  );
  const premiumRecordWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordWhatsappMessage, legacyMessage),
    DEFAULT_SMART_RX_CONFIG.premiumRecordWhatsappMessage
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
  const premiumTagLabel = normalizeMessageAllowEmpty(raw?.premiumTagLabel, DEFAULT_SMART_RX_CONFIG.premiumTagLabel);

  return {
    freeDailyLimit,
    premiumDailyLimit,
    freeRecordDailyLimit,
    premiumRecordDailyLimit,
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
    freeRecordLimitMessage,
    premiumRecordLimitMessage,
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
    freeRecordWhatsappMessage,
    premiumRecordWhatsappMessage,
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
  let accountType = doctorData?.accountType === 'premium' ? 'premium' : 'free';
  const premiumExpiryDate = typeof doctorData?.premiumExpiryDate === 'string' ? doctorData.premiumExpiryDate : '';
  if (accountType === 'premium' && premiumExpiryDate) {
    const expiryMs = new Date(premiumExpiryDate).getTime();
    if (Number.isFinite(expiryMs) && Date.now() >= expiryMs) {
      accountType = 'free';
    }
  }
  return accountType;
};

module.exports = {
  ACCOUNT_TYPE_CONTROL_DOC_ID,
  buildWhatsAppUrl,
  normalizeSmartRxConfig,
  getCairoDateKey,
  getSmartRxConfig,
  resolveDoctorAccountType,
};
