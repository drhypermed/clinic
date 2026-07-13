/**
 * الملف: constants.ts
 * الوصف: "مستودع المفاتيح والمجموعات للوحة التحكم".
 * يحتوي على:
 * 1. DEFAULT_FORM: القيم الأولية للحدود والرسائل — مُعاد تصديرها من DEFAULT_CONTROLS
 *    (المصدر الموحَّد) بدل التكرار، عشان لو الأدمن غيّر default في مكان، يتطبّق في الكل.
 * 2. مجموعات التحكم (GROUPS): تعريف هيكل الأقسام (تحليل الحالة، الترجمة، الروشتات...) وعرضها.
 * 3. مفاتيح البيانات (Keys): مصفوفات لتسهيل عملية التكرار وحفظ البيانات في Firestore.
 *
 * 🗑️ (2026-05) شيلنا جروب الترجمة — كانت بتقفل الزرّين، الترجمة دلوقتي جزء من الزر
 */

import type { GroupConfig, LimitKey, MessageKey, WhatsappMessageKey } from './types';
import type { AccountTypeControls } from '../../../services/accountTypeControlsService';
import { DEFAULT_CONTROLS } from '../../../services/account-type-controls/defaults';

// ─ DEFAULT_FORM = نفس DEFAULT_CONTROLS من services (المصدر الوحيد للحقيقة).
// ─ كان فيه تكرار قديم (~100 سطر) كان بيخلق bug: لو الأدمن غيّر رسالة في مكان،
//   مكنش بيتطبّق في المكان التاني. التوحيد ده يحل المشكلة دي نهائياً.
export const DEFAULT_FORM: AccountTypeControls = DEFAULT_CONTROLS;

export const LIMIT_KEYS: LimitKey[] = [
  'freeDailyLimit',
  'premiumDailyLimit',

  'plusDailyLimit',
  // 🆕 الزر السريع "إضافة بدون تحليل" (2026-05) — عداد منفصل عن التحليل العميق
  'freeQuickAddDailyLimit',
  'premiumQuickAddDailyLimit',

  'plusQuickAddDailyLimit',
  'proMaxQuickAddDailyLimit',
  // ─ السجلات بقت سعة كلية مش يومية ─
  'freeRecordsMaxCount',
  'premiumRecordsMaxCount',

  'plusRecordsMaxCount',
  'freePublicBookingDailyLimit',
  'premiumPublicBookingDailyLimit',

  'plusPublicBookingDailyLimit',
  'freeSecretaryEntryRequestDailyLimit',
  'premiumSecretaryEntryRequestDailyLimit',

  'plusSecretaryEntryRequestDailyLimit',
  'freeReadyPrescriptionDailyLimit',
  'premiumReadyPrescriptionDailyLimit',

  'plusReadyPrescriptionDailyLimit',
  'freeMedicalReportDailyLimit',
  'premiumMedicalReportDailyLimit',

  'plusMedicalReportDailyLimit',
  // ✂️ شيلنا حد الترجمة (2026-05) — الترجمة بقت جزء طبيعي من شغل الزرّين، مفيش حد منفصل
  // ─── الأزرار الذهبية + الكلى تحت "حدود الميزات" 🆕 ───
  'freeInteractionToolDailyLimit',
  'premiumInteractionToolDailyLimit',

  'plusInteractionToolDailyLimit',
  'freePregnancyToolDailyLimit',
  'premiumPregnancyToolDailyLimit',

  'plusPregnancyToolDailyLimit',
  'freeRenalToolDailyLimit',
  'premiumRenalToolDailyLimit',

  'plusRenalToolDailyLimit',
  'freeGuidelinesChatDailyLimit',
  'premiumGuidelinesChatDailyLimit',

  'plusGuidelinesChatDailyLimit',
  'freeReadyPrescriptionsMaxCount',
  'premiumReadyPrescriptionsMaxCount',

  'plusReadyPrescriptionsMaxCount',
  'freeMedicationCustomizationsMaxCount',
  'premiumMedicationCustomizationsMaxCount',

  'plusMedicationCustomizationsMaxCount',
  // ─── سعة الفروع 🆕 ───
  'freeBranchesMaxCount',
  'premiumBranchesMaxCount',

  'plusBranchesMaxCount',
  // ─── 🆕 سعة شركات التأمين ───
  'freeInsuranceCompaniesMaxCount',
  'premiumInsuranceCompaniesMaxCount',

  'plusInsuranceCompaniesMaxCount',
  // ─── برو ماكس ───
  'proMaxDailyLimit',
  'proMaxRecordsMaxCount',
  'proMaxPublicBookingDailyLimit',
  'proMaxSecretaryEntryRequestDailyLimit',
  'proMaxReadyPrescriptionDailyLimit',
  'proMaxMedicalReportDailyLimit',
  'proMaxInteractionToolDailyLimit',
  'proMaxPregnancyToolDailyLimit',
  'proMaxRenalToolDailyLimit',
  'proMaxGuidelinesChatDailyLimit',
  'proMaxReadyPrescriptionsMaxCount',
  'proMaxMedicationCustomizationsMaxCount',
  'proMaxBranchesMaxCount',
  'proMaxInsuranceCompaniesMaxCount',
];

export const DRUG_TOOLS_LIMIT_KEYS: Array<
  | 'freeInteractionToolDailyLimit'
  | 'premiumInteractionToolDailyLimit'

  | 'plusInteractionToolDailyLimit'
  | 'proMaxInteractionToolDailyLimit'
  | 'freeRenalToolDailyLimit'
  | 'premiumRenalToolDailyLimit'

  | 'plusRenalToolDailyLimit'
  | 'proMaxRenalToolDailyLimit'
  | 'freePregnancyToolDailyLimit'
  | 'premiumPregnancyToolDailyLimit'

  | 'plusPregnancyToolDailyLimit'
  | 'proMaxPregnancyToolDailyLimit'
> = [
    'freeInteractionToolDailyLimit',
    'premiumInteractionToolDailyLimit',

    'plusInteractionToolDailyLimit',
    'proMaxInteractionToolDailyLimit',
    'freeRenalToolDailyLimit',
    'premiumRenalToolDailyLimit',

    'plusRenalToolDailyLimit',
    'proMaxRenalToolDailyLimit',
    'freePregnancyToolDailyLimit',
    'premiumPregnancyToolDailyLimit',

    'plusPregnancyToolDailyLimit',
    'proMaxPregnancyToolDailyLimit',
  ];

export const LIMIT_MESSAGE_KEYS: MessageKey[] = [
  'freeAnalysisLimitMessage',
  'premiumAnalysisLimitMessage',

  'plusAnalysisLimitMessage',
  // 🆕 رسائل الزر السريع "إضافة بدون تحليل"
  'freeQuickAddLimitMessage',
  'premiumQuickAddLimitMessage',

  'plusQuickAddLimitMessage',
  'proMaxQuickAddLimitMessage',
  'freeRecordsCapacityMessage',
  'premiumRecordsCapacityMessage',

  'plusRecordsCapacityMessage',
  'freePublicBookingLimitMessage',
  'premiumPublicBookingLimitMessage',

  'plusPublicBookingLimitMessage',
  'freeSecretaryEntryRequestLimitMessage',
  'premiumSecretaryEntryRequestLimitMessage',

  'plusSecretaryEntryRequestLimitMessage',
  'freeReadyPrescriptionDailyLimitMessage',
  'premiumReadyPrescriptionDailyLimitMessage',

  'plusReadyPrescriptionDailyLimitMessage',
  'freeMedicalReportLimitMessage',
  'premiumMedicalReportLimitMessage',

  'plusMedicalReportLimitMessage',
  // ✂️ شيلنا رسائل الترجمة (2026-05) — الترجمة بقت جزء من الزرّين
  // ─── 🆕 الأزرار الذهبية (التداخلات + الحمل/الرضاعة) + الكلى ───
  'freeInteractionToolLimitMessage',
  'premiumInteractionToolLimitMessage',

  'plusInteractionToolLimitMessage',
  'freePregnancyToolLimitMessage',
  'premiumPregnancyToolLimitMessage',

  'plusPregnancyToolLimitMessage',
  'freeRenalToolLimitMessage',
  'premiumRenalToolLimitMessage',

  'plusRenalToolLimitMessage',
  'freeGuidelinesChatLimitMessage',
  'premiumGuidelinesChatLimitMessage',

  'plusGuidelinesChatLimitMessage',
  'freeReadyPrescriptionsCapacityMessage',
  'premiumReadyPrescriptionsCapacityMessage',

  'plusReadyPrescriptionsCapacityMessage',
  'freeMedicationCustomizationsCapacityMessage',
  'premiumMedicationCustomizationsCapacityMessage',

  'plusMedicationCustomizationsCapacityMessage',
  // ─── سعة الفروع 🆕 ───
  'freeBranchesCapacityMessage',
  'premiumBranchesCapacityMessage',

  'plusBranchesCapacityMessage',
  // ─── 🆕 سعة شركات التأمين ───
  'freeInsuranceCompaniesCapacityMessage',
  'premiumInsuranceCompaniesCapacityMessage',

  'plusInsuranceCompaniesCapacityMessage',
  // ─── برو ماكس ───
  'proMaxAnalysisLimitMessage',
  'proMaxRecordsCapacityMessage',
  'proMaxPublicBookingLimitMessage',
  'proMaxSecretaryEntryRequestLimitMessage',
  'proMaxReadyPrescriptionDailyLimitMessage',
  'proMaxMedicalReportLimitMessage',
  'proMaxInteractionToolLimitMessage',
  'proMaxPregnancyToolLimitMessage',
  'proMaxRenalToolLimitMessage',
  'proMaxGuidelinesChatLimitMessage',
  'proMaxReadyPrescriptionsCapacityMessage',
  'proMaxMedicationCustomizationsCapacityMessage',
  'proMaxBranchesCapacityMessage',
  'proMaxInsuranceCompaniesCapacityMessage',
];

export const WHATSAPP_MESSAGE_KEYS: WhatsappMessageKey[] = [
  'freeAnalysisWhatsappMessage',
  'premiumAnalysisWhatsappMessage',

  'plusAnalysisWhatsappMessage',
  // 🆕 رسائل واتساب الزر السريع "إضافة بدون تحليل"
  'freeQuickAddWhatsappMessage',
  'premiumQuickAddWhatsappMessage',

  'plusQuickAddWhatsappMessage',
  'proMaxQuickAddWhatsappMessage',
  'freeRecordsCapacityWhatsappMessage',
  'premiumRecordsCapacityWhatsappMessage',

  'plusRecordsCapacityWhatsappMessage',
  'freePublicBookingWhatsappMessage',
  'premiumPublicBookingWhatsappMessage',

  'plusPublicBookingWhatsappMessage',
  'freeSecretaryEntryRequestWhatsappMessage',
  'premiumSecretaryEntryRequestWhatsappMessage',

  'plusSecretaryEntryRequestWhatsappMessage',
  'freeReadyPrescriptionWhatsappMessage',
  'premiumReadyPrescriptionWhatsappMessage',

  'plusReadyPrescriptionWhatsappMessage',
  'freeMedicalReportWhatsappMessage',
  'premiumMedicalReportWhatsappMessage',

  'plusMedicalReportWhatsappMessage',
  // ✂️ شيلنا رسائل واتساب الترجمة (2026-05)
  // ─── 🆕 الأزرار الذهبية + الكلى ───
  'freeInteractionToolWhatsappMessage',
  'premiumInteractionToolWhatsappMessage',

  'plusInteractionToolWhatsappMessage',
  'freePregnancyToolWhatsappMessage',
  'premiumPregnancyToolWhatsappMessage',

  'plusPregnancyToolWhatsappMessage',
  'freeRenalToolWhatsappMessage',
  'premiumRenalToolWhatsappMessage',

  'plusRenalToolWhatsappMessage',
  'freeGuidelinesChatWhatsappMessage',
  'premiumGuidelinesChatWhatsappMessage',

  'plusGuidelinesChatWhatsappMessage',
  'freeReadyPrescriptionsCapacityWhatsappMessage',
  'premiumReadyPrescriptionsCapacityWhatsappMessage',

  'plusReadyPrescriptionsCapacityWhatsappMessage',
  'freeMedicationCustomizationsCapacityWhatsappMessage',
  'premiumMedicationCustomizationsCapacityWhatsappMessage',

  'plusMedicationCustomizationsCapacityWhatsappMessage',
  // ─── سعة الفروع 🆕 ───
  'freeBranchesCapacityWhatsappMessage',
  'premiumBranchesCapacityWhatsappMessage',

  'plusBranchesCapacityWhatsappMessage',
  // ─── 🆕 سعة شركات التأمين ───
  'freeInsuranceCompaniesCapacityWhatsappMessage',
  'premiumInsuranceCompaniesCapacityWhatsappMessage',

  'plusInsuranceCompaniesCapacityWhatsappMessage',
  // ─── برو ماكس ───
  'proMaxAnalysisWhatsappMessage',
  'proMaxRecordsCapacityWhatsappMessage',
  'proMaxPublicBookingWhatsappMessage',
  'proMaxSecretaryEntryRequestWhatsappMessage',
  'proMaxReadyPrescriptionWhatsappMessage',
  'proMaxMedicalReportWhatsappMessage',
  'proMaxInteractionToolWhatsappMessage',
  'proMaxPregnancyToolWhatsappMessage',
  'proMaxRenalToolWhatsappMessage',
  'proMaxGuidelinesChatWhatsappMessage',
  'proMaxReadyPrescriptionsCapacityWhatsappMessage',
  'proMaxMedicationCustomizationsCapacityWhatsappMessage',
  'proMaxBranchesCapacityWhatsappMessage',
  'proMaxInsuranceCompaniesCapacityWhatsappMessage',
];

const GROUPS: GroupConfig[] = [
  {
    id: 'analysis',
    title: 'إضافة إلى الروشتة والسجلات مع تحليل الحالة (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب تحليل الحالة (مجاني)',
      whatsappPlaceholder: 'رسالة تحليل الحالة - مجاني',
      limitKey: 'freeDailyLimit',
      messageKey: 'freeAnalysisLimitMessage',
      whatsappMessageKey: 'freeAnalysisWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب تحليل الحالة (برو)',
      whatsappPlaceholder: 'رسالة تحليل الحالة - برو',
      limitKey: 'premiumDailyLimit',
      messageKey: 'premiumAnalysisLimitMessage',
      whatsappMessageKey: 'premiumAnalysisWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب تحليل الحالة (Plus)',
      whatsappPlaceholder: 'رسالة تحليل الحالة - Plus',
      limitKey: 'plusDailyLimit',
      messageKey: 'plusAnalysisLimitMessage',
      whatsappMessageKey: 'plusAnalysisWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب تحليل الحالة (برو ماكس)',
      whatsappPlaceholder: 'رسالة تحليل الحالة - برو ماكس',
      limitKey: 'proMaxDailyLimit',
      messageKey: 'proMaxAnalysisLimitMessage',
      whatsappMessageKey: 'proMaxAnalysisWhatsappMessage',
    },
  },
  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 (2026-05) إضافة إلى الروشتة والسجلات بدون تحليل (الزر السريع)
  // ─ كان مشترك على نفس عداد التحليل العميق فاستهلاك زر بيقفل التاني.
  // ─ اتفصل لعداد منفصل: كل زر له حد يومي خاص + رسائل خاصة لكل باقة.
  // ─ الزر ده أرخص في AI (ترجمة فقط) فمنطقي حده أعلى من التحليل العميق.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'quick_add',
    title: 'إضافة إلى الروشتة والسجلات بدون تحليل (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الزر السريع (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة الزر السريع - مجاني',
      limitKey: 'freeQuickAddDailyLimit',
      messageKey: 'freeQuickAddLimitMessage',
      whatsappMessageKey: 'freeQuickAddWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الزر السريع (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة الزر السريع - برو',
      limitKey: 'premiumQuickAddDailyLimit',
      messageKey: 'premiumQuickAddLimitMessage',
      whatsappMessageKey: 'premiumQuickAddWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الزر السريع (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة الزر السريع - Plus',
      limitKey: 'plusQuickAddDailyLimit',
      messageKey: 'plusQuickAddLimitMessage',
      whatsappMessageKey: 'plusQuickAddWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الزر السريع (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة الزر السريع - برو ماكس',
      limitKey: 'proMaxQuickAddDailyLimit',
      messageKey: 'proMaxQuickAddLimitMessage',
      whatsappMessageKey: 'proMaxQuickAddWhatsappMessage',
    },
  },
  // ✂️ شيلنا جروب الترجمة (2026-05) — الترجمة بقت جزء طبيعي من الزرّين،
  //   حد كل زر هو اللي بيتحكم فيها. كانت بتقفل الزرّين الاتنين لما حدها يخلص.
  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 الأزرار الذهبية تحت الروشتة — التداخلات الدوائية
  // ─ كانت في قسم "أدوات الأدوية" المنفصل، اتنقلت 2026-04 لقسم "حدود الميزات"
  //   كحد يومي كامل (مع رسالة + واتساب) عشان الأدمن يقدر يضبطها زي باقي الميزات.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'interaction_tool',
    title: 'فحص التداخلات الدوائية (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب التداخلات (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص التداخلات - مجاني',
      limitKey: 'freeInteractionToolDailyLimit',
      messageKey: 'freeInteractionToolLimitMessage',
      whatsappMessageKey: 'freeInteractionToolWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب التداخلات (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص التداخلات - برو',
      limitKey: 'premiumInteractionToolDailyLimit',
      messageKey: 'premiumInteractionToolLimitMessage',
      whatsappMessageKey: 'premiumInteractionToolWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب التداخلات (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص التداخلات - Plus',
      limitKey: 'plusInteractionToolDailyLimit',
      messageKey: 'plusInteractionToolLimitMessage',
      whatsappMessageKey: 'plusInteractionToolWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب التداخلات (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص التداخلات - برو ماكس',
      limitKey: 'proMaxInteractionToolDailyLimit',
      messageKey: 'proMaxInteractionToolLimitMessage',
      whatsappMessageKey: 'proMaxInteractionToolWhatsappMessage',
    },
  },
  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 الأزرار الذهبية تحت الروشتة — فحص الحمل والرضاعة
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'pregnancy_tool',
    title: 'فحص الدواء أثناء الحمل والرضاعة (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الحمل والرضاعة (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص الحمل والرضاعة - مجاني',
      limitKey: 'freePregnancyToolDailyLimit',
      messageKey: 'freePregnancyToolLimitMessage',
      whatsappMessageKey: 'freePregnancyToolWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الحمل والرضاعة (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص الحمل والرضاعة - برو',
      limitKey: 'premiumPregnancyToolDailyLimit',
      messageKey: 'premiumPregnancyToolLimitMessage',
      whatsappMessageKey: 'premiumPregnancyToolWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الحمل والرضاعة (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص الحمل والرضاعة - Plus',
      limitKey: 'plusPregnancyToolDailyLimit',
      messageKey: 'plusPregnancyToolLimitMessage',
      whatsappMessageKey: 'plusPregnancyToolWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الحمل والرضاعة (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة فحص الحمل والرضاعة - برو ماكس',
      limitKey: 'proMaxPregnancyToolDailyLimit',
      messageKey: 'proMaxPregnancyToolLimitMessage',
      whatsappMessageKey: 'proMaxPregnancyToolWhatsappMessage',
    },
  },
  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 حاسبة جرعات الكلى — اتنقلت 2026-04 من قسم "أدوات الأدوية" المنفصل
  // ─ بقت زي التداخلات والحمل: حد يومي + رسالة + واتساب لكل باقة
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'renal_tool',
    title: 'حاسبة جرعات الكلى (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب جرعات الكلى (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة جرعات الكلى - مجاني',
      limitKey: 'freeRenalToolDailyLimit',
      messageKey: 'freeRenalToolLimitMessage',
      whatsappMessageKey: 'freeRenalToolWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب جرعات الكلى (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة جرعات الكلى - برو',
      limitKey: 'premiumRenalToolDailyLimit',
      messageKey: 'premiumRenalToolLimitMessage',
      whatsappMessageKey: 'premiumRenalToolWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب جرعات الكلى (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة جرعات الكلى - Plus',
      limitKey: 'plusRenalToolDailyLimit',
      messageKey: 'plusRenalToolLimitMessage',
      whatsappMessageKey: 'plusRenalToolWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب جرعات الكلى (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة جرعات الكلى - برو ماكس',
      limitKey: 'proMaxRenalToolDailyLimit',
      messageKey: 'proMaxRenalToolLimitMessage',
      whatsappMessageKey: 'proMaxRenalToolWhatsappMessage',
    },
  },
  {
    id: 'guidelines_chat',
    title: 'شات الجايدلاينز (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شات الجايدلاينز (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شات الجايدلاينز - مجاني',
      limitKey: 'freeGuidelinesChatDailyLimit',
      messageKey: 'freeGuidelinesChatLimitMessage',
      whatsappMessageKey: 'freeGuidelinesChatWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شات الجايدلاينز (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شات الجايدلاينز - برو',
      limitKey: 'premiumGuidelinesChatDailyLimit',
      messageKey: 'premiumGuidelinesChatLimitMessage',
      whatsappMessageKey: 'premiumGuidelinesChatWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شات الجايدلاينز (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شات الجايدلاينز - Plus',
      limitKey: 'plusGuidelinesChatDailyLimit',
      messageKey: 'plusGuidelinesChatLimitMessage',
      whatsappMessageKey: 'plusGuidelinesChatWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شات الجايدلاينز (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شات الجايدلاينز - برو ماكس',
      limitKey: 'proMaxGuidelinesChatDailyLimit',
      messageKey: 'proMaxGuidelinesChatLimitMessage',
      whatsappMessageKey: 'proMaxGuidelinesChatWhatsappMessage',
    },
  },
  // ─ السجلات الطبية بقت "حد كلي" (سعة) — كانت "حد يومي" قبل 2026-04 ─
  // ─ السلوك زي الروشتات الجاهزة: مجموع كلي مخزّن، لما يخلص لازم يحذف ─
  {
    id: 'records_capacity',
    title: 'حفظ السجلات (حد كلي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة السجلات (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة السجلات - مجاني',
      limitKey: 'freeRecordsMaxCount',
      messageKey: 'freeRecordsCapacityMessage',
      whatsappMessageKey: 'freeRecordsCapacityWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة السجلات (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة السجلات - برو',
      limitKey: 'premiumRecordsMaxCount',
      messageKey: 'premiumRecordsCapacityMessage',
      whatsappMessageKey: 'premiumRecordsCapacityWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة السجلات (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة السجلات - Plus',
      limitKey: 'plusRecordsMaxCount',
      messageKey: 'plusRecordsCapacityMessage',
      whatsappMessageKey: 'plusRecordsCapacityWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة السجلات (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة السجلات - برو ماكس',
      limitKey: 'proMaxRecordsMaxCount',
      messageKey: 'proMaxRecordsCapacityMessage',
      whatsappMessageKey: 'proMaxRecordsCapacityWhatsappMessage',
    },
  },
  {
    id: 'medical_report_print',
    title: 'طباعة تقرير طبي للحالة (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب طباعة التقرير (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة طباعة التقرير - مجاني',
      limitKey: 'freeMedicalReportDailyLimit',
      messageKey: 'freeMedicalReportLimitMessage',
      whatsappMessageKey: 'freeMedicalReportWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب طباعة التقرير (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة طباعة التقرير - برو',
      limitKey: 'premiumMedicalReportDailyLimit',
      messageKey: 'premiumMedicalReportLimitMessage',
      whatsappMessageKey: 'premiumMedicalReportWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب طباعة التقرير (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة طباعة التقرير - Plus',
      limitKey: 'plusMedicalReportDailyLimit',
      messageKey: 'plusMedicalReportLimitMessage',
      whatsappMessageKey: 'plusMedicalReportWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب طباعة التقرير (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة طباعة التقرير - برو ماكس',
      limitKey: 'proMaxMedicalReportDailyLimit',
      messageKey: 'proMaxMedicalReportLimitMessage',
      whatsappMessageKey: 'proMaxMedicalReportWhatsappMessage',
    },
  },
  {
    id: 'public_booking',
    title: 'إضافة الموعد — صفحة المواعيد (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب إضافة موعد (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لإضافة موعد - مجاني',
      limitKey: 'freePublicBookingDailyLimit',
      messageKey: 'freePublicBookingLimitMessage',
      whatsappMessageKey: 'freePublicBookingWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب إضافة موعد (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لإضافة موعد - برو',
      limitKey: 'premiumPublicBookingDailyLimit',
      messageKey: 'premiumPublicBookingLimitMessage',
      whatsappMessageKey: 'premiumPublicBookingWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب إضافة موعد (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لإضافة موعد - Plus',
      limitKey: 'plusPublicBookingDailyLimit',
      messageKey: 'plusPublicBookingLimitMessage',
      whatsappMessageKey: 'plusPublicBookingWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب إضافة موعد (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لإضافة موعد - برو ماكس',
      limitKey: 'proMaxPublicBookingDailyLimit',
      messageKey: 'proMaxPublicBookingLimitMessage',
      whatsappMessageKey: 'proMaxPublicBookingWhatsappMessage',
    },
  },
  {
    id: 'secretary_request',
    title: 'إرسال إلى الطبيب من السكرتارية (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب ارسال الموعد للطبيب (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لارسال الموعد للطبيب - مجاني',
      limitKey: 'freeSecretaryEntryRequestDailyLimit',
      messageKey: 'freeSecretaryEntryRequestLimitMessage',
      whatsappMessageKey: 'freeSecretaryEntryRequestWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب ارسال الموعد للطبيب (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لارسال الموعد للطبيب - برو',
      limitKey: 'premiumSecretaryEntryRequestDailyLimit',
      messageKey: 'premiumSecretaryEntryRequestLimitMessage',
      whatsappMessageKey: 'premiumSecretaryEntryRequestWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب ارسال الموعد للطبيب (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لارسال الموعد للطبيب - Plus',
      limitKey: 'plusSecretaryEntryRequestDailyLimit',
      messageKey: 'plusSecretaryEntryRequestLimitMessage',
      whatsappMessageKey: 'plusSecretaryEntryRequestWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب ارسال الموعد للطبيب (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة واتساب لارسال الموعد للطبيب - برو ماكس',
      limitKey: 'proMaxSecretaryEntryRequestDailyLimit',
      messageKey: 'proMaxSecretaryEntryRequestLimitMessage',
      whatsappMessageKey: 'proMaxSecretaryEntryRequestWhatsappMessage',
    },
  },
  {
    id: 'ready_daily',
    title: 'حفظ روشتة جاهزة (حد يومي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الروشتات الجاهزة (مجاني)',
      whatsappPlaceholder: 'رسالة الروشتات الجاهزة - مجاني',
      limitKey: 'freeReadyPrescriptionDailyLimit',
      messageKey: 'freeReadyPrescriptionDailyLimitMessage',
      whatsappMessageKey: 'freeReadyPrescriptionWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الروشتات الجاهزة (برو)',
      whatsappPlaceholder: 'رسالة الروشتات الجاهزة - برو',
      limitKey: 'premiumReadyPrescriptionDailyLimit',
      messageKey: 'premiumReadyPrescriptionDailyLimitMessage',
      whatsappMessageKey: 'premiumReadyPrescriptionWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الروشتات الجاهزة (Plus)',
      whatsappPlaceholder: 'رسالة الروشتات الجاهزة - Plus',
      limitKey: 'plusReadyPrescriptionDailyLimit',
      messageKey: 'plusReadyPrescriptionDailyLimitMessage',
      whatsappMessageKey: 'plusReadyPrescriptionWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد اليومي',
      messageLabel: 'رسالة تجاوز الحد',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الروشتات الجاهزة (برو ماكس)',
      whatsappPlaceholder: 'رسالة الروشتات الجاهزة - برو ماكس',
      limitKey: 'proMaxReadyPrescriptionDailyLimit',
      messageKey: 'proMaxReadyPrescriptionDailyLimitMessage',
      whatsappMessageKey: 'proMaxReadyPrescriptionWhatsappMessage',
    },
  },
  {
    id: 'ready_capacity',
    title: 'عدد الروشتات الجاهزة المخزّنة (حد كلي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الروشتات (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الروشتات الجاهزة - مجاني',
      limitKey: 'freeReadyPrescriptionsMaxCount',
      messageKey: 'freeReadyPrescriptionsCapacityMessage',
      whatsappMessageKey: 'freeReadyPrescriptionsCapacityWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الروشتات (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الروشتات الجاهزة - برو',
      limitKey: 'premiumReadyPrescriptionsMaxCount',
      messageKey: 'premiumReadyPrescriptionsCapacityMessage',
      whatsappMessageKey: 'premiumReadyPrescriptionsCapacityWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الروشتات (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الروشتات الجاهزة - Plus',
      limitKey: 'plusReadyPrescriptionsMaxCount',
      messageKey: 'plusReadyPrescriptionsCapacityMessage',
      whatsappMessageKey: 'plusReadyPrescriptionsCapacityWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الروشتات (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الروشتات الجاهزة - برو ماكس',
      limitKey: 'proMaxReadyPrescriptionsMaxCount',
      messageKey: 'proMaxReadyPrescriptionsCapacityMessage',
      whatsappMessageKey: 'proMaxReadyPrescriptionsCapacityWhatsappMessage',
    },
  },
  {
    id: 'medication_customizations_capacity',
    title: 'تخزين الأدوية المعدّلة (حد كلي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الأدوية المعدلة (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الأدوية المعدلة - مجاني',
      limitKey: 'freeMedicationCustomizationsMaxCount',
      messageKey: 'freeMedicationCustomizationsCapacityMessage',
      whatsappMessageKey: 'freeMedicationCustomizationsCapacityWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الأدوية المعدلة (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الأدوية المعدلة - برو',
      limitKey: 'premiumMedicationCustomizationsMaxCount',
      messageKey: 'premiumMedicationCustomizationsCapacityMessage',
      whatsappMessageKey: 'premiumMedicationCustomizationsCapacityWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الأدوية المعدلة (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الأدوية المعدلة - Plus',
      limitKey: 'plusMedicationCustomizationsMaxCount',
      messageKey: 'plusMedicationCustomizationsCapacityMessage',
      whatsappMessageKey: 'plusMedicationCustomizationsCapacityWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب الأدوية المعدلة (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الأدوية المعدلة - برو ماكس',
      limitKey: 'proMaxMedicationCustomizationsMaxCount',
      messageKey: 'proMaxMedicationCustomizationsCapacityMessage',
      whatsappMessageKey: 'proMaxMedicationCustomizationsCapacityWhatsappMessage',
    },
  },
  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 سعة الفروع (إعلان الطبيب) — ميزة بتفرّق بين الباقات
  // ─ مجاني = فرع واحد · برو = 3 فروع · برو ماكس = 10 فروع (افتراضياً)
  // ─ كان MAX_BRANCHES_PER_DOCTOR=5 hardcoded — دلوقتي ينقرأ من إعدادات الأدمن.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'branches_capacity',
    title: 'عدد الفروع — إعلان الطبيب (حد كلي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الفروع (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الفروع - مجاني',
      limitKey: 'freeBranchesMaxCount',
      messageKey: 'freeBranchesCapacityMessage',
      whatsappMessageKey: 'freeBranchesCapacityWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الفروع (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الفروع - برو',
      limitKey: 'premiumBranchesMaxCount',
      messageKey: 'premiumBranchesCapacityMessage',
      whatsappMessageKey: 'premiumBranchesCapacityWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الفروع (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الفروع - Plus',
      limitKey: 'plusBranchesMaxCount',
      messageKey: 'plusBranchesCapacityMessage',
      whatsappMessageKey: 'plusBranchesCapacityWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب سعة الفروع (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة سعة الفروع - برو ماكس',
      limitKey: 'proMaxBranchesMaxCount',
      messageKey: 'proMaxBranchesCapacityMessage',
      whatsappMessageKey: 'proMaxBranchesCapacityWhatsappMessage',
    },
  },
  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 شركات التأمين (سعة كلية) — تمييز بين الباقات 2026-04
  // ─ مجاني = 2 شركة · برو = 10 · برو ماكس = 50 (افتراضياً)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'insurance_companies_capacity',
    title: 'عدد شركات التأمين (حد كلي)',
    free: {
      name: 'مجاني',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شركات التأمين (مجاني)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شركات التأمين - مجاني',
      limitKey: 'freeInsuranceCompaniesMaxCount',
      messageKey: 'freeInsuranceCompaniesCapacityMessage',
      whatsappMessageKey: 'freeInsuranceCompaniesCapacityWhatsappMessage',
    },
    premium: {
      name: 'برو',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شركات التأمين (برو)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شركات التأمين - برو',
      limitKey: 'premiumInsuranceCompaniesMaxCount',
      messageKey: 'premiumInsuranceCompaniesCapacityMessage',
      whatsappMessageKey: 'premiumInsuranceCompaniesCapacityWhatsappMessage',
    },
    plus: {
      name: 'Plus',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شركات التأمين (Plus)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شركات التأمين - Plus',
      limitKey: 'plusInsuranceCompaniesMaxCount',
      messageKey: 'plusInsuranceCompaniesCapacityMessage',
      whatsappMessageKey: 'plusInsuranceCompaniesCapacityWhatsappMessage',
    },
    proMax: {
      name: 'برو ماكس',
      limitLabel: 'الحد الأقصى',
      messageLabel: 'رسالة السعة القصوى',
      whatsappLabel: 'رسالة واتساب',
      whatsappPreviewLabel: 'معاينة واتساب شركات التأمين (برو ماكس)',
      messagePlaceholder: 'استخدم {limit} لإظهار الرقم',
      whatsappPlaceholder: 'رسالة شركات التأمين - برو ماكس',
      limitKey: 'proMaxInsuranceCompaniesMaxCount',
      messageKey: 'proMaxInsuranceCompaniesCapacityMessage',
      whatsappMessageKey: 'proMaxInsuranceCompaniesCapacityWhatsappMessage',
    },
  },
];

const withPlusPlan = (group: GroupConfig): GroupConfig => {
  if (group.plus) return group;
  return {
    ...group,
    plus: {
      ...group.premium,
      name: 'Plus',
      limitKey: group.premium.limitKey.replace(/^premium/, 'plus') as LimitKey,
      messageKey: group.premium.messageKey.replace(/^premium/, 'plus') as MessageKey,
      whatsappMessageKey: group.premium.whatsappMessageKey.replace(/^premium/, 'plus') as WhatsappMessageKey,
      whatsappPreviewLabel: `${group.premium.whatsappPreviewLabel} - Plus`,
      whatsappPlaceholder: `${group.premium.whatsappPlaceholder || ''} - Plus`.trim(),
    },
  };
};

const END_GROUP_IDS = new Set(['public_booking', 'secretary_request']);
export const ORDERED_GROUPS = [
  ...GROUPS.filter((group) => !END_GROUP_IDS.has(group.id)),
  ...GROUPS.filter((group) => END_GROUP_IDS.has(group.id)),
].map(withPlusPlan);
