/**
 * نظام استهلاك الكوتا (Quota Consumption System)
 * هذا الملف يتواصل مع Cloud Functions لخصم الرصيد اليومي من العمليات المتاحة للطبيب:
 * 1. استهلاك كوتا التحليل الذكي للروشتات.
 * 2. استهلاك كوتا تخزين السجلات والروشتات الجاهزة.
 * 3. استهلاك كوتا الحجز (العام، الجمهور، السكرتارية).
 * 4. استهلاك كوتا الأدوات الطبية (التفاعلات، الوظائف الكلوية، الحمل).
 *
 * بيدعم 3 فئات: free | premium (=برو) | pro_max (=برو ماكس).
 * pro_max لو مش عندها قيمة خاصة، بترجع لقيمة premium كـ fallback.
 */

import { BookingQuotaResult, CapacityCheckResult, DrugToolQuotaFeature, DrugToolQuotaResult, RecordsCapacityResult, SmartPrescriptionQuotaResult, StorageQuotaFeature, TranslationQuotaResult } from './types';
import { StorageQuotaResult } from './types';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebaseConfig';
import { callWithAuthRetry, ensureAuthenticatedUser, mapCallableError } from './auth';
import { normalizeControls, resolveSafeQuotaWhatsappUrl, toSafeLimit } from './normalize';
import {
  decrementCapacityCache,
  isNetworkOfflineError,
  readCapacityCache,
  saveCapacityCache,
} from './capacityCache';
import type {
  BookingQuotaFeature } from '../../types';

const resolveWhatsappUrl = (data: Record<string, unknown>, fallback: string): string => {
  return resolveSafeQuotaWhatsappUrl(data.whatsappUrl, fallback);
};

type TierValue = 'free' | 'premium' | 'pro_max';

/** تطبيع accountType القادم من الـ function — يقبل 3 قيم */
const toTier = (value: unknown): TierValue => {
  if (value === 'premium') return 'premium';
  if (value === 'pro_max') return 'pro_max';
  return 'free';
};

/** اختيار القيمة من الـ controls حسب الفئة — pro_max يقع على premium لو مش محدد */
const pickByTier = <T>(tier: TierValue, freeVal: T, premiumVal: T, proMaxVal: T | undefined): T => {
  if (tier === 'pro_max') {
    return (proMaxVal !== undefined && proMaxVal !== null ? proMaxVal : premiumVal);
  }
  if (tier === 'premium') return premiumVal;
  return freeVal;
};

/** محاولة استهلاك كوتا للتحليل الذكي للروشتة */
export const consumeSmartPrescriptionQuota = async (): Promise<SmartPrescriptionQuotaResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'consumeSmartPrescriptionQuota');
    const result = await callWithAuthRetry(() => callable());
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);
    const fallbackLimit = pickByTier(tier,
      normalizedControls.freeDailyLimit,
      normalizedControls.premiumDailyLimit,
      normalizedControls.proMaxDailyLimit);
    return {
      accountType: tier,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      dayKey: String(data.dayKey || ''),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};

/** محاولة استهلاك كوتا لعمليات التخزين (سجلات المرضى أو الروشتات الجاهزة) */
export const consumeStorageQuota = async (feature: StorageQuotaFeature): Promise<StorageQuotaResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'consumeStorageQuota');
    const result = await callWithAuthRetry(() => callable({ feature }));
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);

    // تحديد الحد الاحتياطي بناءً على الميزة × الفئة
    // ملاحظة: recordSave اتشال — السجلات بقت بفحص "حد كلي" client-side
    // ─ 🆕 ضفنا 3 ميزات لتصدير الروشتة (طباعة + تنزيل + واتساب) 2026-04 ─
    const fallbackLimit =
      feature === 'readyPrescriptionSave'
        ? pickByTier(tier, normalizedControls.freeReadyPrescriptionDailyLimit, normalizedControls.premiumReadyPrescriptionDailyLimit, normalizedControls.proMaxReadyPrescriptionDailyLimit)
        : feature === 'prescriptionPrint'
          ? pickByTier(tier, normalizedControls.freePrescriptionPrintDailyLimit, normalizedControls.premiumPrescriptionPrintDailyLimit, normalizedControls.proMaxPrescriptionPrintDailyLimit)
          : feature === 'prescriptionDownload'
            ? pickByTier(tier, normalizedControls.freePrescriptionDownloadDailyLimit, normalizedControls.premiumPrescriptionDownloadDailyLimit, normalizedControls.proMaxPrescriptionDownloadDailyLimit)
            : feature === 'prescriptionWhatsapp'
              ? pickByTier(tier, normalizedControls.freePrescriptionWhatsappDailyLimit, normalizedControls.premiumPrescriptionWhatsappDailyLimit, normalizedControls.proMaxPrescriptionWhatsappDailyLimit)
              : pickByTier(tier, normalizedControls.freeMedicalReportDailyLimit, normalizedControls.premiumMedicalReportDailyLimit, normalizedControls.proMaxMedicalReportDailyLimit);

    return {
      accountType: tier,
      feature,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      dayKey: String(data.dayKey || ''),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};

/**
 * محاولة استهلاك كوتا لعمليات الحجز.
 * لا تتطلب تسجيل دخول الطبيب مباشرة (لأنها قد تُستدعى من السكرتير أو الجمهور).
 */
export const consumeBookingQuota = async (
  feature: BookingQuotaFeature,
  doctorId: string,
  secret?: string
): Promise<BookingQuotaResult> => {
  try {
    const callable = httpsCallable(functions, 'consumeBookingQuota');
    const payload: Record<string, unknown> = { feature, doctorId };
    if (secret) payload.secret = secret;
    const result = await callWithAuthRetry(() => callable(payload));
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);

    const fallbackLimit = feature === 'publicBooking'
      ? pickByTier(tier, normalizedControls.freePublicBookingDailyLimit, normalizedControls.premiumPublicBookingDailyLimit, normalizedControls.proMaxPublicBookingDailyLimit)
      : feature === 'publicFormBooking'
        ? pickByTier(tier, normalizedControls.freePublicFormBookingDailyLimit, normalizedControls.premiumPublicFormBookingDailyLimit, normalizedControls.proMaxPublicFormBookingDailyLimit)
        : pickByTier(tier, normalizedControls.freeSecretaryEntryRequestDailyLimit, normalizedControls.premiumSecretaryEntryRequestDailyLimit, normalizedControls.proMaxSecretaryEntryRequestDailyLimit);

    return {
      accountType: tier,
      feature,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      dayKey: String(data.dayKey || ''),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};

/**
 * فحص سعة السجلات الطبية على السيرفر — تشديد أمني 2026-04.
 * كان قبل: العدّ في المتصفح بـ records.length (ممكن يتجاوز عبر dev tools).
 * دلوقتي: السيرفر بيعد السجلات الفعلية ويقارنها بحد الأدمن.
 * بيرجع النتيجة لو السعة لسه فيها مكان، وبيرمي error لو وصل للحد.
 *
 * @param params.recordId — لو موجود = الـclient بيعدّل سجل موجود (مش إنشاء جديد)،
 *                          السيرفر هيتأكد من وجوده ويسمح بدون فحص الحد. ضروري
 *                          للسماح للأطباء عند الحد بتعديل سجلاتهم.
 */
export const validateRecordsCapacity = async (
  params?: { recordId?: string },
): Promise<RecordsCapacityResult> => {
  await ensureAuthenticatedUser();
  const userId = auth.currentUser?.uid || '';
  try {
    const callable = httpsCallable(functions, 'validateRecordsCapacity');
    // نمرر الـrecordId للسيرفر بس لو موجود (تعديل سجل قائم) — السيرفر
    // هيستخدمه عشان يتجاوز فحص الحد بأمان.
    const payload = params?.recordId ? { recordId: params.recordId } : {};
    const result = await callWithAuthRetry(() => callable(payload));
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);
    const fallbackLimit = pickByTier(tier,
      normalizedControls.freeRecordsMaxCount,
      normalizedControls.premiumRecordsMaxCount,
      normalizedControls.proMaxRecordsMaxCount);
    const finalResult: RecordsCapacityResult = {
      accountType: tier,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
    // ─ نخزن الفحص الناجح للاستخدام offline لاحقاً (لو إنشاء جديد بس،
    //   مش لما يكون recordIdForUpdate لأن السيرفر هنا بيتخطى الحد).
    if (!params?.recordId) {
      saveCapacityCache(userId, 'records', {
        remaining: finalResult.remaining,
        limit: finalResult.limit,
        accountType: finalResult.accountType,
      });
    }
    return finalResult;
  } catch (error: unknown) {
    // ─ Offline fallback: لو خطأ شبكة وعندنا فحص ناجح أقل من ساعة، نسمح بالحفظ.
    //   التعديل (recordId موجود) مايحتاجش فحص أصلاً، فبنرجع نتيجة "كله تمام".
    if (isNetworkOfflineError(error)) {
      if (params?.recordId) {
        // تعديل سجل قائم — مفيش فحص حد، نرجع نتيجة افتراضية ناجحة
        return {
          accountType: 'free',
          limit: 0,
          used: 0,
          remaining: 9999,
          whatsappNumber: '',
          whatsappUrl: '',
          limitReachedMessage: '',
          whatsappMessage: '',
        };
      }
      const cached = readCapacityCache(userId, 'records');
      if (cached && cached.remaining > 0) {
        decrementCapacityCache(userId, 'records');
        return {
          accountType: cached.accountType as TierValue,
          limit: cached.limit,
          used: Math.max(0, cached.limit - cached.remaining),
          remaining: cached.remaining,
          whatsappNumber: '',
          whatsappUrl: '',
          limitReachedMessage: '',
          whatsappMessage: '',
        };
      }
    }
    return mapCallableError(error);
  }
};

/**
 * فحص سعة الروشتات الجاهزة على السيرفر — تشديد أمني 2026-04.
 * السيرفر بيعد الروشتات الجاهزة الفعلية ويقارنها بحد الأدمن.
 */
export const validateReadyPrescriptionsCapacity = async (): Promise<CapacityCheckResult> => {
  await ensureAuthenticatedUser();
  const userId = auth.currentUser?.uid || '';
  try {
    const callable = httpsCallable(functions, 'validateReadyPrescriptionsCapacity');
    const result = await callWithAuthRetry(() => callable());
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);
    const fallbackLimit = pickByTier(tier,
      normalizedControls.freeReadyPrescriptionsMaxCount,
      normalizedControls.premiumReadyPrescriptionsMaxCount,
      normalizedControls.proMaxReadyPrescriptionsMaxCount);
    const finalResult: CapacityCheckResult = {
      accountType: tier,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
    // نخزّن الفحص الناجح للسماح بالحفظ offline لمدة ساعة
    saveCapacityCache(userId, 'readyPrescriptions', {
      remaining: finalResult.remaining,
      limit: finalResult.limit,
      accountType: finalResult.accountType,
    });
    return finalResult;
  } catch (error: unknown) {
    // Offline fallback: نسمح بالحفظ لو فيه فحص ناجح أقل من ساعة
    if (isNetworkOfflineError(error)) {
      const cached = readCapacityCache(userId, 'readyPrescriptions');
      if (cached && cached.remaining > 0) {
        decrementCapacityCache(userId, 'readyPrescriptions');
        return {
          accountType: cached.accountType as TierValue,
          limit: cached.limit,
          used: Math.max(0, cached.limit - cached.remaining),
          remaining: cached.remaining,
          whatsappNumber: '',
          whatsappUrl: '',
          limitReachedMessage: '',
          whatsappMessage: '',
        };
      }
    }
    return mapCallableError(error);
  }
};

/**
 * فحص سعة شركات التأمين على السيرفر — تشديد أمني 2026-04.
 * السيرفر بيعد المجموعة الفرعية ويقارنها بحد الأدمن.
 * لو passed companyId فيه → تعديل (سماح بدون فحص). لو فاضي → إنشاء جديد (فحص).
 */
export const validateInsuranceCompaniesCapacity = async (
  payload?: { companyId?: string },
): Promise<CapacityCheckResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'validateInsuranceCompaniesCapacity');
    const result = await callWithAuthRetry(() => callable(payload || {}));
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);
    const fallbackLimit = pickByTier(tier,
      normalizedControls.freeInsuranceCompaniesMaxCount,
      normalizedControls.premiumInsuranceCompaniesMaxCount,
      normalizedControls.proMaxInsuranceCompaniesMaxCount);
    return {
      accountType: tier,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};

/**
 * فحص سعة الأدوية المعدّلة على السيرفر — تشديد أمني 2026-04.
 * السيرفر بيقرا الـmap من user doc ويعد المفاتيح ويقارنها بحد الأدمن.
 */
export const validateMedicationCustomizationsCapacity = async (): Promise<CapacityCheckResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'validateMedicationCustomizationsCapacity');
    const result = await callWithAuthRetry(() => callable());
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);
    const fallbackLimit = pickByTier(tier,
      normalizedControls.freeMedicationCustomizationsMaxCount,
      normalizedControls.premiumMedicationCustomizationsMaxCount,
      normalizedControls.proMaxMedicationCustomizationsMaxCount);
    return {
      accountType: tier,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};

/**
 * محاولة استهلاك كوتا الترجمة الذكية للروشتة (جديد).
 * بتشتغل تلقائياً مع كل روشتة قبل ما الـAI يترجم البيانات السريرية.
 * لو الطبيب وصل للحد اليومي، السيرفر بيرفض ويرجع رسالة الأدمن.
 */
export const consumeTranslationQuota = async (): Promise<TranslationQuotaResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'consumeTranslationQuota');
    const result = await callWithAuthRetry(() => callable());
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);
    const fallbackLimit = pickByTier(tier,
      normalizedControls.freeTranslationDailyLimit,
      normalizedControls.premiumTranslationDailyLimit,
      normalizedControls.proMaxTranslationDailyLimit);
    return {
      accountType: tier,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      dayKey: String(data.dayKey || ''),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};

/** محاولة استهلاك كوتا للأدوات الطبيبة المساعدة */
export const consumeDrugToolQuota = async (
  feature: DrugToolQuotaFeature
): Promise<DrugToolQuotaResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'consumeDrugToolQuota');
    const result = await callWithAuthRetry(() => callable({ feature }));
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);

    const fallbackLimit = feature === 'interactionTool'
      ? pickByTier(tier, normalizedControls.freeInteractionToolDailyLimit, normalizedControls.premiumInteractionToolDailyLimit, normalizedControls.proMaxInteractionToolDailyLimit)
      : feature === 'renalTool'
        ? pickByTier(tier, normalizedControls.freeRenalToolDailyLimit, normalizedControls.premiumRenalToolDailyLimit, normalizedControls.proMaxRenalToolDailyLimit)
        : pickByTier(tier, normalizedControls.freePregnancyToolDailyLimit, normalizedControls.premiumPregnancyToolDailyLimit, normalizedControls.proMaxPregnancyToolDailyLimit);

    return {
      accountType: tier,
      feature,
      limit: toSafeLimit(data.limit, fallbackLimit),
      used: toSafeLimit(data.used, 0),
      remaining: toSafeLimit(data.remaining, 0),
      dayKey: String(data.dayKey || ''),
      whatsappNumber: normalizedControls.whatsappNumber,
      whatsappUrl: resolveWhatsappUrl(data, normalizedControls.whatsappUrl),
      limitReachedMessage: String(data.limitReachedMessage || ''),
      whatsappMessage: String(data.whatsappMessage || ''),
    };
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};
