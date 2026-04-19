/**
 * توحيد ومعالجة بيانات الكوتا (Quota Data Normalization)
 * هذا الملف مسؤول عن ضمان صحة وسلامة البيانات القادمة من السيرفر أو الإعدادات اليدوية:
 * 1. تنظيف الروابط الخارجية (مثل روابط واتساب).
 * 2. التأكد من أن حدود الاستخدام (Limits) تقع ضمن النطاق المسموح به.
 * 3. دمج الإعدادات الافتراضية (Defaults) مع الإعدادات المخصصة القادمة من Firestore.
 * 4. توحيد صياغة الرسائل والأرقام.
 */

import type { AccountTypeControls } from './types';
import { DEFAULT_CONTROLS } from './defaults';

const startsWithHttpProtocol = (value: string) => /^https?:\/\//i.test(value);
const startsWithWhatsAppHost = (value: string) => /^(wa\.me\/|api\.whatsapp\.com\/)/i.test(value);

/** تنظيف الروابط الخارجية للتأكد من أنها تبدأ بـ http/https أو رابط واتساب صحيح */
const sanitizeExternalHttpUrl = (value?: string): string => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const normalized = startsWithHttpProtocol(raw)
    ? raw
    : (startsWithWhatsAppHost(raw) ? `https://${raw}` : '');
  if (!normalized) return '';

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString();
  } catch {
    return '';
  }
};

/** اختيار رابط واتساب آمن مع توفير بديل في حال الخطأ */
export const resolveSafeQuotaWhatsappUrl = (candidate: unknown, fallback: string): string => {
  const candidateSafe = sanitizeExternalHttpUrl(String(candidate || ''));
  if (candidateSafe) return candidateSafe;
  return sanitizeExternalHttpUrl(fallback);
};

const normalizeDigits = (value: string): string => (value || '').replace(/\D/g, '').slice(0, 20);

/** تحويل القيمة إلى رقم كوتة آمن (لا يقل عن 0 ولا يزيد عن 5000 للتحكم في الضغط) */
export const toSafeLimit = (value: unknown, fallback: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(5000, Math.max(0, Math.floor(n)));
};

const toBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

const normalizeMessageAllowEmpty = (value: unknown, fallback: string): string => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim().slice(0, 500);
};

const firstDefined = (...values: unknown[]): unknown => {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

/** بناء رابط واتساب يحتوي على رسالة جاهزة */
const buildWhatsAppUrl = (digits: string, message: string): string => {
  if (!digits) return '';
  const text = encodeURIComponent((message || '').trim());
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};

/** 
 * توحيد كائن الإعدادات بالكامل (Normalize Controls) 
 * يضمن هذا التابع عدم وجود قيم مفقودة أو غير منطقية في واجهة التحكم.
 */
export const normalizeControls = (raw: any): AccountTypeControls => {
  const freeDailyLimit = toSafeLimit(raw?.freeDailyLimit, DEFAULT_CONTROLS.freeDailyLimit);
  const premiumDailyLimit = toSafeLimit(raw?.premiumDailyLimit, DEFAULT_CONTROLS.premiumDailyLimit);
  const freeRecordDailyLimit = toSafeLimit(raw?.freeRecordDailyLimit, DEFAULT_CONTROLS.freeRecordDailyLimit);
  const premiumRecordDailyLimit = toSafeLimit(raw?.premiumRecordDailyLimit, DEFAULT_CONTROLS.premiumRecordDailyLimit);
  const freePublicBookingDailyLimit = toSafeLimit(raw?.freePublicBookingDailyLimit, DEFAULT_CONTROLS.freePublicBookingDailyLimit);
  const premiumPublicBookingDailyLimit = toSafeLimit(raw?.premiumPublicBookingDailyLimit, DEFAULT_CONTROLS.premiumPublicBookingDailyLimit);
  const freePublicFormBookingDailyLimit = toSafeLimit(raw?.freePublicFormBookingDailyLimit, DEFAULT_CONTROLS.freePublicFormBookingDailyLimit);
  const premiumPublicFormBookingDailyLimit = toSafeLimit(raw?.premiumPublicFormBookingDailyLimit, DEFAULT_CONTROLS.premiumPublicFormBookingDailyLimit);
  const freeSecretaryEntryRequestDailyLimit = toSafeLimit(raw?.freeSecretaryEntryRequestDailyLimit, DEFAULT_CONTROLS.freeSecretaryEntryRequestDailyLimit);
  const premiumSecretaryEntryRequestDailyLimit = toSafeLimit(raw?.premiumSecretaryEntryRequestDailyLimit, DEFAULT_CONTROLS.premiumSecretaryEntryRequestDailyLimit);
  const freeReadyPrescriptionDailyLimit = toSafeLimit(raw?.freeReadyPrescriptionDailyLimit, DEFAULT_CONTROLS.freeReadyPrescriptionDailyLimit);
  const premiumReadyPrescriptionDailyLimit = toSafeLimit(raw?.premiumReadyPrescriptionDailyLimit, DEFAULT_CONTROLS.premiumReadyPrescriptionDailyLimit);
  const freeMedicalReportDailyLimit = toSafeLimit(raw?.freeMedicalReportDailyLimit, DEFAULT_CONTROLS.freeMedicalReportDailyLimit);
  const premiumMedicalReportDailyLimit = toSafeLimit(raw?.premiumMedicalReportDailyLimit, DEFAULT_CONTROLS.premiumMedicalReportDailyLimit);
  const freeReadyPrescriptionsMaxCount = toSafeLimit(raw?.freeReadyPrescriptionsMaxCount, DEFAULT_CONTROLS.freeReadyPrescriptionsMaxCount);
  const premiumReadyPrescriptionsMaxCount = toSafeLimit(raw?.premiumReadyPrescriptionsMaxCount, DEFAULT_CONTROLS.premiumReadyPrescriptionsMaxCount);
  const freeMedicationCustomizationsMaxCount = toSafeLimit(raw?.freeMedicationCustomizationsMaxCount, DEFAULT_CONTROLS.freeMedicationCustomizationsMaxCount);
  const premiumMedicationCustomizationsMaxCount = toSafeLimit(raw?.premiumMedicationCustomizationsMaxCount, DEFAULT_CONTROLS.premiumMedicationCustomizationsMaxCount);
  const freeInteractionToolDailyLimit = toSafeLimit(raw?.freeInteractionToolDailyLimit, DEFAULT_CONTROLS.freeInteractionToolDailyLimit);
  const premiumInteractionToolDailyLimit = toSafeLimit(raw?.premiumInteractionToolDailyLimit, DEFAULT_CONTROLS.premiumInteractionToolDailyLimit);
  const freeRenalToolDailyLimit = toSafeLimit(raw?.freeRenalToolDailyLimit, DEFAULT_CONTROLS.freeRenalToolDailyLimit);
  const premiumRenalToolDailyLimit = toSafeLimit(raw?.premiumRenalToolDailyLimit, DEFAULT_CONTROLS.premiumRenalToolDailyLimit);
  const freePregnancyToolDailyLimit = toSafeLimit(raw?.freePregnancyToolDailyLimit, DEFAULT_CONTROLS.freePregnancyToolDailyLimit);
  const premiumPregnancyToolDailyLimit = toSafeLimit(raw?.premiumPregnancyToolDailyLimit, DEFAULT_CONTROLS.premiumPregnancyToolDailyLimit);
  const interactionToolPremiumOnly = toBoolean(raw?.interactionToolPremiumOnly, DEFAULT_CONTROLS.interactionToolPremiumOnly);
  const renalToolPremiumOnly = toBoolean(raw?.renalToolPremiumOnly, DEFAULT_CONTROLS.renalToolPremiumOnly);
  const pregnancyToolPremiumOnly = toBoolean(raw?.pregnancyToolPremiumOnly, DEFAULT_CONTROLS.pregnancyToolPremiumOnly);
  const whatsappNumber = normalizeDigits(raw?.whatsappNumber || DEFAULT_CONTROLS.whatsappNumber);
  
  const legacyMessage = String(raw?.whatsappMessage || '').trim().slice(0, 500);

  // معالجة رسائل التنبيه مع دعم التوافق مع النسخ القديمة (Legacy)
  const freeAnalysisLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeAnalysisLimitMessage, raw?.freeLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freeAnalysisLimitMessage
  );
  const premiumAnalysisLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumAnalysisLimitMessage, raw?.premiumLimitMessage, raw?.premiumWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumAnalysisLimitMessage
  );
  const freeRecordLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freeRecordLimitMessage
  );
  const premiumRecordLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumRecordLimitMessage
  );
  const freePublicBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicBookingLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freePublicBookingLimitMessage
  );
  const premiumPublicBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicBookingLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumPublicBookingLimitMessage
  );
  const freePublicFormBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicFormBookingLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freePublicFormBookingLimitMessage
  );
  const premiumPublicFormBookingLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicFormBookingLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumPublicFormBookingLimitMessage
  );
  const freeSecretaryEntryRequestLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeSecretaryEntryRequestLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freeSecretaryEntryRequestLimitMessage
  );
  const premiumSecretaryEntryRequestLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumSecretaryEntryRequestLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumSecretaryEntryRequestLimitMessage
  );
  const freeReadyPrescriptionDailyLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeReadyPrescriptionDailyLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freeReadyPrescriptionDailyLimitMessage
  );
  const premiumReadyPrescriptionDailyLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumReadyPrescriptionDailyLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumReadyPrescriptionDailyLimitMessage
  );
  const freeMedicalReportLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeMedicalReportLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freeMedicalReportLimitMessage
  );
  const premiumMedicalReportLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumMedicalReportLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumMedicalReportLimitMessage
  );
  const freeReadyPrescriptionsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.freeReadyPrescriptionsCapacityMessage,
    DEFAULT_CONTROLS.freeReadyPrescriptionsCapacityMessage
  );
  const premiumReadyPrescriptionsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.premiumReadyPrescriptionsCapacityMessage,
    DEFAULT_CONTROLS.premiumReadyPrescriptionsCapacityMessage
  );
  const freeMedicationCustomizationsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.freeMedicationCustomizationsCapacityMessage,
    DEFAULT_CONTROLS.freeMedicationCustomizationsCapacityMessage
  );
  const premiumMedicationCustomizationsCapacityMessage = normalizeMessageAllowEmpty(
    raw?.premiumMedicationCustomizationsCapacityMessage,
    DEFAULT_CONTROLS.premiumMedicationCustomizationsCapacityMessage
  );
  const freeAnalysisWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeAnalysisWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeAnalysisWhatsappMessage
  );
  const premiumAnalysisWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumAnalysisWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumAnalysisWhatsappMessage
  );
  const freeRecordWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeRecordWhatsappMessage
  );
  const premiumRecordWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumRecordWhatsappMessage
  );
  const freePublicBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicBookingWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freePublicBookingWhatsappMessage
  );
  const premiumPublicBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicBookingWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumPublicBookingWhatsappMessage
  );
  const freePublicFormBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freePublicFormBookingWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freePublicFormBookingWhatsappMessage
  );
  const premiumPublicFormBookingWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumPublicFormBookingWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumPublicFormBookingWhatsappMessage
  );
  const freeSecretaryEntryRequestWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeSecretaryEntryRequestWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeSecretaryEntryRequestWhatsappMessage
  );
  const premiumSecretaryEntryRequestWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumSecretaryEntryRequestWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumSecretaryEntryRequestWhatsappMessage
  );
  const freeReadyPrescriptionWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeReadyPrescriptionWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeReadyPrescriptionWhatsappMessage
  );
  const premiumReadyPrescriptionWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumReadyPrescriptionWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumReadyPrescriptionWhatsappMessage
  );
  const freeMedicalReportWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeMedicalReportWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeMedicalReportWhatsappMessage
  );
  const premiumMedicalReportWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumMedicalReportWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumMedicalReportWhatsappMessage
  );
  const freeReadyPrescriptionsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeReadyPrescriptionsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeReadyPrescriptionsCapacityWhatsappMessage
  );
  const premiumReadyPrescriptionsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumReadyPrescriptionsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumReadyPrescriptionsCapacityWhatsappMessage
  );
  const freeMedicationCustomizationsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeMedicationCustomizationsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeMedicationCustomizationsCapacityWhatsappMessage
  );
  const premiumMedicationCustomizationsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumMedicationCustomizationsCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumMedicationCustomizationsCapacityWhatsappMessage
  );
  const interactionToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.interactionToolLockedMessage, legacyMessage),
    DEFAULT_CONTROLS.interactionToolLockedMessage
  );
  const renalToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.renalToolLockedMessage, legacyMessage),
    DEFAULT_CONTROLS.renalToolLockedMessage
  );
  const pregnancyToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.pregnancyToolLockedMessage, legacyMessage),
    DEFAULT_CONTROLS.pregnancyToolLockedMessage
  );
  const premiumTagLabel = normalizeMessageAllowEmpty(
    raw?.premiumTagLabel,
    DEFAULT_CONTROLS.premiumTagLabel
  );

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

