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

// ─ السقف الأقصى للحدود — ٦ أرقام (كان 5000 ورفعناه 2026-04 عشان السجلات
//   لـبرو وبرو ماكس محتاجة قيم كبيرة، مثلاً 100,000 سجل) ─
const MAX_LIMIT_VALUE = 999999;
/** تحويل القيمة إلى رقم كوتة آمن (لا يقل عن 0 ولا يزيد عن 999999) */
export const toSafeLimit = (value: unknown, fallback: number): number => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_LIMIT_VALUE, Math.max(0, Math.floor(n)));
};

const toBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

// ─────────────────────────────────────────────────────────────────────────────
// normalizeMessageAllowEmpty:
// كان قبل كده: لو القيمة undefined/null → افتراضية. لو فاضية ('') → فاضية.
// المشكلة: لو الأدمن حفظ قيمة فاضية مرة، أو الـschema القديم ساب حقل بدون قيمة،
//          الرسالة كانت بتظهر فاضية للأبد حتى لو في رسالة افتراضية كاملة.
//
// السلوك الجديد: لو القيمة فاضية بعد الـtrim → ارجع للافتراضية.
// ده بيضمن إن مفيش رسالة تظهر فاضية للطبيب (ولا نافذة بدون نص ولا واتساب فاضي).
// الاسم محتفظ به للـbackward-compat مع الـcallers الكتيرة.
// ─────────────────────────────────────────────────────────────────────────────
const normalizeMessageAllowEmpty = (value: unknown, fallback: string): string => {
  if (value === undefined || value === null) return fallback;
  const trimmed = String(value).trim();
  if (!trimmed) return fallback; // ← التغيير: فاضي = استخدم الافتراضية
  return trimmed.slice(0, 500);
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
  // ─── سعة السجلات (حد كلي مش يومي) ───
  const freeRecordsMaxCount = toSafeLimit(raw?.freeRecordsMaxCount, DEFAULT_CONTROLS.freeRecordsMaxCount);
  const premiumRecordsMaxCount = toSafeLimit(raw?.premiumRecordsMaxCount, DEFAULT_CONTROLS.premiumRecordsMaxCount);
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
  // ─── حدود الترجمة الذكية ───
  const freeTranslationDailyLimit = toSafeLimit(raw?.freeTranslationDailyLimit, DEFAULT_CONTROLS.freeTranslationDailyLimit);
  const premiumTranslationDailyLimit = toSafeLimit(raw?.premiumTranslationDailyLimit, DEFAULT_CONTROLS.premiumTranslationDailyLimit);
  const freeReadyPrescriptionsMaxCount = toSafeLimit(raw?.freeReadyPrescriptionsMaxCount, DEFAULT_CONTROLS.freeReadyPrescriptionsMaxCount);
  const premiumReadyPrescriptionsMaxCount = toSafeLimit(raw?.premiumReadyPrescriptionsMaxCount, DEFAULT_CONTROLS.premiumReadyPrescriptionsMaxCount);
  const freeMedicationCustomizationsMaxCount = toSafeLimit(raw?.freeMedicationCustomizationsMaxCount, DEFAULT_CONTROLS.freeMedicationCustomizationsMaxCount);
  const premiumMedicationCustomizationsMaxCount = toSafeLimit(raw?.premiumMedicationCustomizationsMaxCount, DEFAULT_CONTROLS.premiumMedicationCustomizationsMaxCount);
  // ─── سعة الفروع ───
  const freeBranchesMaxCount = toSafeLimit(raw?.freeBranchesMaxCount, DEFAULT_CONTROLS.freeBranchesMaxCount);
  const premiumBranchesMaxCount = toSafeLimit(raw?.premiumBranchesMaxCount, DEFAULT_CONTROLS.premiumBranchesMaxCount);
  // ─── 🆕 سعة شركات التأمين ───
  const freeInsuranceCompaniesMaxCount = toSafeLimit(raw?.freeInsuranceCompaniesMaxCount, DEFAULT_CONTROLS.freeInsuranceCompaniesMaxCount);
  const premiumInsuranceCompaniesMaxCount = toSafeLimit(raw?.premiumInsuranceCompaniesMaxCount, DEFAULT_CONTROLS.premiumInsuranceCompaniesMaxCount);
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

  // ─── 🆕 رفع الصور للحساب المجاني (toggle + رسالتين) ───
  const freeImageUploadsEnabled = toBoolean(raw?.freeImageUploadsEnabled, DEFAULT_CONTROLS.freeImageUploadsEnabled);
  const freeImageUploadsUpgradeMessage = normalizeMessageAllowEmpty(
    raw?.freeImageUploadsUpgradeMessage,
    DEFAULT_CONTROLS.freeImageUploadsUpgradeMessage,
  );
  const freeImageUploadsUpgradeWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freeImageUploadsUpgradeWhatsappMessage,
    DEFAULT_CONTROLS.freeImageUploadsUpgradeWhatsappMessage,
  );

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
  // ─── رسائل سعة السجلات الطبية ───
  const freeRecordsCapacityMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordsCapacityMessage, raw?.freeRecordLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freeRecordsCapacityMessage
  );
  const premiumRecordsCapacityMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordsCapacityMessage, raw?.premiumRecordLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumRecordsCapacityMessage
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
  // ─── رسائل تجاوز حد الترجمة الذكية ───
  const freeTranslationLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeTranslationLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.freeTranslationLimitMessage
  );
  const premiumTranslationLimitMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumTranslationLimitMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumTranslationLimitMessage
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
  // ─── رسائل سعة الفروع ───
  const freeBranchesCapacityMessage = normalizeMessageAllowEmpty(
    raw?.freeBranchesCapacityMessage,
    DEFAULT_CONTROLS.freeBranchesCapacityMessage
  );
  const premiumBranchesCapacityMessage = normalizeMessageAllowEmpty(
    raw?.premiumBranchesCapacityMessage,
    DEFAULT_CONTROLS.premiumBranchesCapacityMessage
  );
  // ─── 🆕 رسائل سعة شركات التأمين ───
  const freeInsuranceCompaniesCapacityMessage = normalizeMessageAllowEmpty(
    raw?.freeInsuranceCompaniesCapacityMessage,
    DEFAULT_CONTROLS.freeInsuranceCompaniesCapacityMessage
  );
  const premiumInsuranceCompaniesCapacityMessage = normalizeMessageAllowEmpty(
    raw?.premiumInsuranceCompaniesCapacityMessage,
    DEFAULT_CONTROLS.premiumInsuranceCompaniesCapacityMessage
  );
  const freeAnalysisWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeAnalysisWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeAnalysisWhatsappMessage
  );
  const premiumAnalysisWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumAnalysisWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumAnalysisWhatsappMessage
  );
  // ─── رسائل واتساب سعة السجلات الطبية ───
  const freeRecordsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeRecordsCapacityWhatsappMessage, raw?.freeRecordWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeRecordsCapacityWhatsappMessage
  );
  const premiumRecordsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumRecordsCapacityWhatsappMessage, raw?.premiumRecordWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumRecordsCapacityWhatsappMessage
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
  // ─── رسائل واتساب الترجمة الذكية ───
  const freeTranslationWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeTranslationWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeTranslationWhatsappMessage
  );
  const premiumTranslationWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumTranslationWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumTranslationWhatsappMessage
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
  // ─── رسائل واتساب سعة الفروع ───
  const freeBranchesCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeBranchesCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeBranchesCapacityWhatsappMessage
  );
  const premiumBranchesCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumBranchesCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumBranchesCapacityWhatsappMessage
  );
  // ─── 🆕 رسائل واتساب سعة شركات التأمين ───
  const freeInsuranceCompaniesCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.freeInsuranceCompaniesCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.freeInsuranceCompaniesCapacityWhatsappMessage
  );
  const premiumInsuranceCompaniesCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.premiumInsuranceCompaniesCapacityWhatsappMessage, legacyMessage),
    DEFAULT_CONTROLS.premiumInsuranceCompaniesCapacityWhatsappMessage
  );
  const interactionToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.interactionToolLockedMessage, legacyMessage),
    DEFAULT_CONTROLS.interactionToolLockedMessage
  );
  // ─── 🆕 رسائل الأزرار الذهبية (التداخلات + الحمل/الرضاعة) ───
  const freeInteractionToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.freeInteractionToolLimitMessage,
    DEFAULT_CONTROLS.freeInteractionToolLimitMessage,
  );
  const premiumInteractionToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.premiumInteractionToolLimitMessage,
    DEFAULT_CONTROLS.premiumInteractionToolLimitMessage,
  );
  const freeInteractionToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freeInteractionToolWhatsappMessage,
    DEFAULT_CONTROLS.freeInteractionToolWhatsappMessage,
  );
  const premiumInteractionToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.premiumInteractionToolWhatsappMessage,
    DEFAULT_CONTROLS.premiumInteractionToolWhatsappMessage,
  );
  const freePregnancyToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.freePregnancyToolLimitMessage,
    DEFAULT_CONTROLS.freePregnancyToolLimitMessage,
  );
  const premiumPregnancyToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.premiumPregnancyToolLimitMessage,
    DEFAULT_CONTROLS.premiumPregnancyToolLimitMessage,
  );
  const freePregnancyToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freePregnancyToolWhatsappMessage,
    DEFAULT_CONTROLS.freePregnancyToolWhatsappMessage,
  );
  const premiumPregnancyToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.premiumPregnancyToolWhatsappMessage,
    DEFAULT_CONTROLS.premiumPregnancyToolWhatsappMessage,
  );
  // ─── 🆕 أزرار تصدير الروشتة (طباعة + تنزيل + واتساب) — حدود يومية ─
  const freePrescriptionPrintDailyLimit = toSafeLimit(raw?.freePrescriptionPrintDailyLimit, DEFAULT_CONTROLS.freePrescriptionPrintDailyLimit);
  const premiumPrescriptionPrintDailyLimit = toSafeLimit(raw?.premiumPrescriptionPrintDailyLimit, DEFAULT_CONTROLS.premiumPrescriptionPrintDailyLimit);
  const freePrescriptionDownloadDailyLimit = toSafeLimit(raw?.freePrescriptionDownloadDailyLimit, DEFAULT_CONTROLS.freePrescriptionDownloadDailyLimit);
  const premiumPrescriptionDownloadDailyLimit = toSafeLimit(raw?.premiumPrescriptionDownloadDailyLimit, DEFAULT_CONTROLS.premiumPrescriptionDownloadDailyLimit);
  const freePrescriptionWhatsappDailyLimit = toSafeLimit(raw?.freePrescriptionWhatsappDailyLimit, DEFAULT_CONTROLS.freePrescriptionWhatsappDailyLimit);
  const premiumPrescriptionWhatsappDailyLimit = toSafeLimit(raw?.premiumPrescriptionWhatsappDailyLimit, DEFAULT_CONTROLS.premiumPrescriptionWhatsappDailyLimit);
  // ─ رسائل تجاوز الحد + واتساب ─
  const freePrescriptionPrintLimitMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionPrintLimitMessage, DEFAULT_CONTROLS.freePrescriptionPrintLimitMessage);
  const premiumPrescriptionPrintLimitMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionPrintLimitMessage, DEFAULT_CONTROLS.premiumPrescriptionPrintLimitMessage);
  const freePrescriptionPrintWhatsappMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionPrintWhatsappMessage, DEFAULT_CONTROLS.freePrescriptionPrintWhatsappMessage);
  const premiumPrescriptionPrintWhatsappMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionPrintWhatsappMessage, DEFAULT_CONTROLS.premiumPrescriptionPrintWhatsappMessage);
  const freePrescriptionDownloadLimitMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionDownloadLimitMessage, DEFAULT_CONTROLS.freePrescriptionDownloadLimitMessage);
  const premiumPrescriptionDownloadLimitMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionDownloadLimitMessage, DEFAULT_CONTROLS.premiumPrescriptionDownloadLimitMessage);
  const freePrescriptionDownloadWhatsappMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionDownloadWhatsappMessage, DEFAULT_CONTROLS.freePrescriptionDownloadWhatsappMessage);
  const premiumPrescriptionDownloadWhatsappMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionDownloadWhatsappMessage, DEFAULT_CONTROLS.premiumPrescriptionDownloadWhatsappMessage);
  const freePrescriptionWhatsappLimitMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionWhatsappLimitMessage, DEFAULT_CONTROLS.freePrescriptionWhatsappLimitMessage);
  const premiumPrescriptionWhatsappLimitMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionWhatsappLimitMessage, DEFAULT_CONTROLS.premiumPrescriptionWhatsappLimitMessage);
  const freePrescriptionWhatsappWhatsappMessage = normalizeMessageAllowEmpty(raw?.freePrescriptionWhatsappWhatsappMessage, DEFAULT_CONTROLS.freePrescriptionWhatsappWhatsappMessage);
  const premiumPrescriptionWhatsappWhatsappMessage = normalizeMessageAllowEmpty(raw?.premiumPrescriptionWhatsappWhatsappMessage, DEFAULT_CONTROLS.premiumPrescriptionWhatsappWhatsappMessage);

  // ─── 🆕 الكلى — رسائل ─
  const freeRenalToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.freeRenalToolLimitMessage,
    DEFAULT_CONTROLS.freeRenalToolLimitMessage,
  );
  const premiumRenalToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.premiumRenalToolLimitMessage,
    DEFAULT_CONTROLS.premiumRenalToolLimitMessage,
  );
  const freeRenalToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.freeRenalToolWhatsappMessage,
    DEFAULT_CONTROLS.freeRenalToolWhatsappMessage,
  );
  const premiumRenalToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.premiumRenalToolWhatsappMessage,
    DEFAULT_CONTROLS.premiumRenalToolWhatsappMessage,
  );
  const renalToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.renalToolLockedMessage, legacyMessage),
    DEFAULT_CONTROLS.renalToolLockedMessage
  );
  const pregnancyToolLockedMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.pregnancyToolLockedMessage, legacyMessage),
    DEFAULT_CONTROLS.pregnancyToolLockedMessage
  );
  // نعمل force override للقيم القديمة المحفوظة في Firestore من قبل إعادة التسمية.
  // لو الأدمن اتحفظ عنده 'Premium' أو 'premium' أو 'بريميوم' قديماً، نستخدم 'Pro'.
  const rawTagLabel = String(raw?.premiumTagLabel || '').trim();
  const isLegacyTag = rawTagLabel === 'Premium' || rawTagLabel === 'premium' || rawTagLabel === 'بريميوم' || rawTagLabel === 'مميز';
  const premiumTagLabel = (!rawTagLabel || isLegacyTag)
    ? DEFAULT_CONTROLS.premiumTagLabel
    : normalizeMessageAllowEmpty(rawTagLabel, DEFAULT_CONTROLS.premiumTagLabel);

  // ═══ برو ماكس — القيم المحفوظة من الأدمن (مع fallback لـ DEFAULT_CONTROLS) ═══
  const proMaxDefaults = DEFAULT_CONTROLS as Required<AccountTypeControls>;
  const proMaxDailyLimit = toSafeLimit(raw?.proMaxDailyLimit, proMaxDefaults.proMaxDailyLimit);
  const proMaxRecordsMaxCount = toSafeLimit(raw?.proMaxRecordsMaxCount, proMaxDefaults.proMaxRecordsMaxCount);
  const proMaxPublicBookingDailyLimit = toSafeLimit(raw?.proMaxPublicBookingDailyLimit, proMaxDefaults.proMaxPublicBookingDailyLimit);
  const proMaxPublicFormBookingDailyLimit = toSafeLimit(raw?.proMaxPublicFormBookingDailyLimit, proMaxDefaults.proMaxPublicFormBookingDailyLimit);
  const proMaxSecretaryEntryRequestDailyLimit = toSafeLimit(raw?.proMaxSecretaryEntryRequestDailyLimit, proMaxDefaults.proMaxSecretaryEntryRequestDailyLimit);
  const proMaxReadyPrescriptionDailyLimit = toSafeLimit(raw?.proMaxReadyPrescriptionDailyLimit, proMaxDefaults.proMaxReadyPrescriptionDailyLimit);
  const proMaxMedicalReportDailyLimit = toSafeLimit(raw?.proMaxMedicalReportDailyLimit, proMaxDefaults.proMaxMedicalReportDailyLimit);
  const proMaxTranslationDailyLimit = toSafeLimit(raw?.proMaxTranslationDailyLimit, proMaxDefaults.proMaxTranslationDailyLimit);
  const proMaxReadyPrescriptionsMaxCount = toSafeLimit(raw?.proMaxReadyPrescriptionsMaxCount, proMaxDefaults.proMaxReadyPrescriptionsMaxCount);
  const proMaxMedicationCustomizationsMaxCount = toSafeLimit(raw?.proMaxMedicationCustomizationsMaxCount, proMaxDefaults.proMaxMedicationCustomizationsMaxCount);
  const proMaxBranchesMaxCount = toSafeLimit(raw?.proMaxBranchesMaxCount, proMaxDefaults.proMaxBranchesMaxCount);
  const proMaxInsuranceCompaniesMaxCount = toSafeLimit(raw?.proMaxInsuranceCompaniesMaxCount, proMaxDefaults.proMaxInsuranceCompaniesMaxCount);
  const proMaxInteractionToolDailyLimit = toSafeLimit(raw?.proMaxInteractionToolDailyLimit, proMaxDefaults.proMaxInteractionToolDailyLimit);
  const proMaxRenalToolDailyLimit = toSafeLimit(raw?.proMaxRenalToolDailyLimit, proMaxDefaults.proMaxRenalToolDailyLimit);
  const proMaxPregnancyToolDailyLimit = toSafeLimit(raw?.proMaxPregnancyToolDailyLimit, proMaxDefaults.proMaxPregnancyToolDailyLimit);
  // ─── 🆕 برو ماكس: رسائل الأزرار الذهبية ───
  const proMaxInteractionToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.proMaxInteractionToolLimitMessage,
    proMaxDefaults.proMaxInteractionToolLimitMessage,
  );
  const proMaxInteractionToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.proMaxInteractionToolWhatsappMessage,
    proMaxDefaults.proMaxInteractionToolWhatsappMessage,
  );
  const proMaxPregnancyToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.proMaxPregnancyToolLimitMessage,
    proMaxDefaults.proMaxPregnancyToolLimitMessage,
  );
  const proMaxPregnancyToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.proMaxPregnancyToolWhatsappMessage,
    proMaxDefaults.proMaxPregnancyToolWhatsappMessage,
  );
  // ─── 🆕 برو ماكس: أزرار تصدير الروشتة ─
  const proMaxPrescriptionPrintDailyLimit = toSafeLimit(raw?.proMaxPrescriptionPrintDailyLimit, proMaxDefaults.proMaxPrescriptionPrintDailyLimit);
  const proMaxPrescriptionDownloadDailyLimit = toSafeLimit(raw?.proMaxPrescriptionDownloadDailyLimit, proMaxDefaults.proMaxPrescriptionDownloadDailyLimit);
  const proMaxPrescriptionWhatsappDailyLimit = toSafeLimit(raw?.proMaxPrescriptionWhatsappDailyLimit, proMaxDefaults.proMaxPrescriptionWhatsappDailyLimit);
  const proMaxPrescriptionPrintLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxPrescriptionPrintLimitMessage, proMaxDefaults.proMaxPrescriptionPrintLimitMessage);
  const proMaxPrescriptionPrintWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxPrescriptionPrintWhatsappMessage, proMaxDefaults.proMaxPrescriptionPrintWhatsappMessage);
  const proMaxPrescriptionDownloadLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxPrescriptionDownloadLimitMessage, proMaxDefaults.proMaxPrescriptionDownloadLimitMessage);
  const proMaxPrescriptionDownloadWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxPrescriptionDownloadWhatsappMessage, proMaxDefaults.proMaxPrescriptionDownloadWhatsappMessage);
  const proMaxPrescriptionWhatsappLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxPrescriptionWhatsappLimitMessage, proMaxDefaults.proMaxPrescriptionWhatsappLimitMessage);
  const proMaxPrescriptionWhatsappWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxPrescriptionWhatsappWhatsappMessage, proMaxDefaults.proMaxPrescriptionWhatsappWhatsappMessage);

  // ─── 🆕 برو ماكس: رسائل الكلى ─
  const proMaxRenalToolLimitMessage = normalizeMessageAllowEmpty(
    raw?.proMaxRenalToolLimitMessage,
    proMaxDefaults.proMaxRenalToolLimitMessage,
  );
  const proMaxRenalToolWhatsappMessage = normalizeMessageAllowEmpty(
    raw?.proMaxRenalToolWhatsappMessage,
    proMaxDefaults.proMaxRenalToolWhatsappMessage,
  );
  const proMaxAnalysisLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxAnalysisLimitMessage, proMaxDefaults.proMaxAnalysisLimitMessage);
  const proMaxRecordsCapacityMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.proMaxRecordsCapacityMessage, raw?.proMaxRecordLimitMessage),
    proMaxDefaults.proMaxRecordsCapacityMessage,
  );
  const proMaxPublicBookingLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxPublicBookingLimitMessage, proMaxDefaults.proMaxPublicBookingLimitMessage);
  const proMaxPublicFormBookingLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxPublicFormBookingLimitMessage, proMaxDefaults.proMaxPublicFormBookingLimitMessage);
  const proMaxSecretaryEntryRequestLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxSecretaryEntryRequestLimitMessage, proMaxDefaults.proMaxSecretaryEntryRequestLimitMessage);
  const proMaxReadyPrescriptionDailyLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionDailyLimitMessage, proMaxDefaults.proMaxReadyPrescriptionDailyLimitMessage);
  const proMaxMedicalReportLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxMedicalReportLimitMessage, proMaxDefaults.proMaxMedicalReportLimitMessage);
  const proMaxTranslationLimitMessage = normalizeMessageAllowEmpty(raw?.proMaxTranslationLimitMessage, proMaxDefaults.proMaxTranslationLimitMessage);
  const proMaxReadyPrescriptionsCapacityMessage = normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionsCapacityMessage, proMaxDefaults.proMaxReadyPrescriptionsCapacityMessage);
  const proMaxMedicationCustomizationsCapacityMessage = normalizeMessageAllowEmpty(raw?.proMaxMedicationCustomizationsCapacityMessage, proMaxDefaults.proMaxMedicationCustomizationsCapacityMessage);
  const proMaxBranchesCapacityMessage = normalizeMessageAllowEmpty(raw?.proMaxBranchesCapacityMessage, proMaxDefaults.proMaxBranchesCapacityMessage);
  const proMaxInsuranceCompaniesCapacityMessage = normalizeMessageAllowEmpty(raw?.proMaxInsuranceCompaniesCapacityMessage, proMaxDefaults.proMaxInsuranceCompaniesCapacityMessage);
  const proMaxAnalysisWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxAnalysisWhatsappMessage, proMaxDefaults.proMaxAnalysisWhatsappMessage);
  const proMaxRecordsCapacityWhatsappMessage = normalizeMessageAllowEmpty(
    firstDefined(raw?.proMaxRecordsCapacityWhatsappMessage, raw?.proMaxRecordWhatsappMessage),
    proMaxDefaults.proMaxRecordsCapacityWhatsappMessage,
  );
  const proMaxPublicBookingWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxPublicBookingWhatsappMessage, proMaxDefaults.proMaxPublicBookingWhatsappMessage);
  const proMaxPublicFormBookingWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxPublicFormBookingWhatsappMessage, proMaxDefaults.proMaxPublicFormBookingWhatsappMessage);
  const proMaxSecretaryEntryRequestWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxSecretaryEntryRequestWhatsappMessage, proMaxDefaults.proMaxSecretaryEntryRequestWhatsappMessage);
  const proMaxReadyPrescriptionWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionWhatsappMessage, proMaxDefaults.proMaxReadyPrescriptionWhatsappMessage);
  const proMaxMedicalReportWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxMedicalReportWhatsappMessage, proMaxDefaults.proMaxMedicalReportWhatsappMessage);
  const proMaxTranslationWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxTranslationWhatsappMessage, proMaxDefaults.proMaxTranslationWhatsappMessage);
  const proMaxReadyPrescriptionsCapacityWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxReadyPrescriptionsCapacityWhatsappMessage, proMaxDefaults.proMaxReadyPrescriptionsCapacityWhatsappMessage);
  const proMaxMedicationCustomizationsCapacityWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxMedicationCustomizationsCapacityWhatsappMessage, proMaxDefaults.proMaxMedicationCustomizationsCapacityWhatsappMessage);
  const proMaxBranchesCapacityWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxBranchesCapacityWhatsappMessage, proMaxDefaults.proMaxBranchesCapacityWhatsappMessage);
  const proMaxInsuranceCompaniesCapacityWhatsappMessage = normalizeMessageAllowEmpty(raw?.proMaxInsuranceCompaniesCapacityWhatsappMessage, proMaxDefaults.proMaxInsuranceCompaniesCapacityWhatsappMessage);
  // نفس الـ override للـ pro_max
  const rawProMaxTagLabel = String(raw?.proMaxTagLabel || '').trim();
  const isLegacyProMaxTag = rawProMaxTagLabel === 'Premium' || rawProMaxTagLabel === 'premium' || rawProMaxTagLabel === 'بريميوم' || rawProMaxTagLabel === 'مميز';
  const proMaxTagLabel = (!rawProMaxTagLabel || isLegacyProMaxTag)
    ? proMaxDefaults.proMaxTagLabel
    : normalizeMessageAllowEmpty(rawProMaxTagLabel, proMaxDefaults.proMaxTagLabel);

  return {
    freeDailyLimit,
    premiumDailyLimit,
    freeRecordsMaxCount,
    premiumRecordsMaxCount,
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
    freeTranslationDailyLimit,
    premiumTranslationDailyLimit,
    freeReadyPrescriptionsMaxCount,
    premiumReadyPrescriptionsMaxCount,
    freeMedicationCustomizationsMaxCount,
    premiumMedicationCustomizationsMaxCount,
    freeBranchesMaxCount,
    premiumBranchesMaxCount,
    freeInsuranceCompaniesMaxCount,
    premiumInsuranceCompaniesMaxCount,
    freeInteractionToolDailyLimit,
    premiumInteractionToolDailyLimit,
    freeRenalToolDailyLimit,
    premiumRenalToolDailyLimit,
    freePregnancyToolDailyLimit,
    premiumPregnancyToolDailyLimit,
    freeAnalysisLimitMessage,
    premiumAnalysisLimitMessage,
    freeRecordsCapacityMessage,
    premiumRecordsCapacityMessage,
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
    freeTranslationLimitMessage,
    premiumTranslationLimitMessage,
    freeReadyPrescriptionsCapacityMessage,
    premiumReadyPrescriptionsCapacityMessage,
    freeMedicationCustomizationsCapacityMessage,
    premiumMedicationCustomizationsCapacityMessage,
    freeBranchesCapacityMessage,
    premiumBranchesCapacityMessage,
    freeInsuranceCompaniesCapacityMessage,
    freeImageUploadsEnabled,
    freeImageUploadsUpgradeMessage,
    freeImageUploadsUpgradeWhatsappMessage,
    premiumInsuranceCompaniesCapacityMessage,
    whatsappNumber,
    freeAnalysisWhatsappMessage,
    premiumAnalysisWhatsappMessage,
    freeRecordsCapacityWhatsappMessage,
    premiumRecordsCapacityWhatsappMessage,
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
    freeTranslationWhatsappMessage,
    premiumTranslationWhatsappMessage,
    freeReadyPrescriptionsCapacityWhatsappMessage,
    premiumReadyPrescriptionsCapacityWhatsappMessage,
    freeMedicationCustomizationsCapacityWhatsappMessage,
    premiumMedicationCustomizationsCapacityWhatsappMessage,
    freeBranchesCapacityWhatsappMessage,
    premiumBranchesCapacityWhatsappMessage,
    freeInsuranceCompaniesCapacityWhatsappMessage,
    premiumInsuranceCompaniesCapacityWhatsappMessage,
    interactionToolPremiumOnly,
    renalToolPremiumOnly,
    pregnancyToolPremiumOnly,
    interactionToolLockedMessage,
    renalToolLockedMessage,
    pregnancyToolLockedMessage,
    // ─── 🆕 رسائل الأزرار الذهبية ───
    freeInteractionToolLimitMessage,
    premiumInteractionToolLimitMessage,
    freeInteractionToolWhatsappMessage,
    premiumInteractionToolWhatsappMessage,
    freePregnancyToolLimitMessage,
    premiumPregnancyToolLimitMessage,
    freePregnancyToolWhatsappMessage,
    premiumPregnancyToolWhatsappMessage,
    // ─── 🆕 الكلى ─
    freeRenalToolLimitMessage,
    premiumRenalToolLimitMessage,
    freeRenalToolWhatsappMessage,
    premiumRenalToolWhatsappMessage,
    // ─── 🆕 أزرار تصدير الروشتة ─
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
    premiumTagLabel,
    whatsappUrl: buildWhatsAppUrl(whatsappNumber, freeAnalysisWhatsappMessage),
    // برو ماكس
    proMaxDailyLimit,
    proMaxRecordsMaxCount,
    proMaxPublicBookingDailyLimit,
    proMaxPublicFormBookingDailyLimit,
    proMaxSecretaryEntryRequestDailyLimit,
    proMaxReadyPrescriptionDailyLimit,
    proMaxMedicalReportDailyLimit,
    proMaxTranslationDailyLimit,
    proMaxReadyPrescriptionsMaxCount,
    proMaxMedicationCustomizationsMaxCount,
    proMaxBranchesMaxCount,
    proMaxInsuranceCompaniesMaxCount,
    proMaxInteractionToolDailyLimit,
    proMaxRenalToolDailyLimit,
    proMaxPregnancyToolDailyLimit,
    // ─── 🆕 برو ماكس: رسائل الأزرار الذهبية ───
    proMaxInteractionToolLimitMessage,
    proMaxInteractionToolWhatsappMessage,
    proMaxPregnancyToolLimitMessage,
    proMaxPregnancyToolWhatsappMessage,
    proMaxRenalToolLimitMessage,
    proMaxRenalToolWhatsappMessage,
    // ─── 🆕 برو ماكس: أزرار تصدير الروشتة ─
    proMaxPrescriptionPrintDailyLimit,
    proMaxPrescriptionDownloadDailyLimit,
    proMaxPrescriptionWhatsappDailyLimit,
    proMaxPrescriptionPrintLimitMessage,
    proMaxPrescriptionPrintWhatsappMessage,
    proMaxPrescriptionDownloadLimitMessage,
    proMaxPrescriptionDownloadWhatsappMessage,
    proMaxPrescriptionWhatsappLimitMessage,
    proMaxPrescriptionWhatsappWhatsappMessage,
    proMaxAnalysisLimitMessage,
    proMaxRecordsCapacityMessage,
    proMaxPublicBookingLimitMessage,
    proMaxPublicFormBookingLimitMessage,
    proMaxSecretaryEntryRequestLimitMessage,
    proMaxReadyPrescriptionDailyLimitMessage,
    proMaxMedicalReportLimitMessage,
    proMaxTranslationLimitMessage,
    proMaxReadyPrescriptionsCapacityMessage,
    proMaxMedicationCustomizationsCapacityMessage,
    proMaxBranchesCapacityMessage,
    proMaxInsuranceCompaniesCapacityMessage,
    proMaxAnalysisWhatsappMessage,
    proMaxRecordsCapacityWhatsappMessage,
    proMaxPublicBookingWhatsappMessage,
    proMaxPublicFormBookingWhatsappMessage,
    proMaxSecretaryEntryRequestWhatsappMessage,
    proMaxReadyPrescriptionWhatsappMessage,
    proMaxMedicalReportWhatsappMessage,
    proMaxTranslationWhatsappMessage,
    proMaxReadyPrescriptionsCapacityWhatsappMessage,
    proMaxMedicationCustomizationsCapacityWhatsappMessage,
    proMaxBranchesCapacityWhatsappMessage,
    proMaxInsuranceCompaniesCapacityWhatsappMessage,
    proMaxTagLabel,
  };
};

