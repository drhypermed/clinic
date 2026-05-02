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

import { BookingQuotaResult, CapacityCheckResult, DrugToolQuotaFeature, DrugToolQuotaResult, RecordsCapacityResult, SmartPrescriptionQuotaResult, StorageQuotaFeature } from './types';
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

/**
 * 🆕 (2026-05): الفحص بقى مقصور على الحساب المجاني فقط في الميزات المدفوعة.
 * الـ premium/pro_max بياخدوا "تخطي مباشر" للـ Cloud Function call عشان السرعة:
 *   - الطباعة + التنزيل + واتساب
 *   - حفظ روشتة جاهزة + عدد الروشتات الكلي
 *   - السجلات الطبية (الحد الكلي)
 *   - الأدوية المعدّلة (الحد الكلي)
 *
 * مكاسب الأداء: كل Cloud Function call بياخد ٢-٥ ثواني، فالتخطي بيوفر الوقت ده.
 * الأمان: الـ Cloud Function نفسها فيها نفس الفحص (لو حد عمل bypass على الـ frontend).
 */
const isPaidTier = (cachedAccountType?: TierValue): boolean =>
  cachedAccountType === 'premium' || cachedAccountType === 'pro_max';

/**
 * يقرأ الـ accountType من localStorage (الـ key متطابق مع `getAccountTypeCacheKey`).
 * بنستخدمه عشان الـ services اللي مش متاح ليها الـ accountType من الـ caller
 * تقدر تتخطى الـ Cloud Function call تلقائياً للـ paid tiers.
 *
 * فايدة: الـ cache بيتحدث لحظياً من Firestore subscription في useMainAppProfile.
 * فلو الطبيب الـ accountType اتغير، الـ cache بيتحدث في ثواني.
 */
export const readCachedAccountType = (uid?: string | null): TierValue | undefined => {
  if (!uid || typeof window === 'undefined') return undefined;
  try {
    const cached = window.localStorage.getItem(`account_type_${uid}`);
    if (cached === 'premium' || cached === 'pro_max' || cached === 'free') {
      return cached as TierValue;
    }
  } catch {
    // localStorage مش متاح (incognito/قديم) — نرجع undefined → الـ Cloud call يحصل عادي
  }
  return undefined;
};

/** نتيجة "كوتا غير محدودة" للـ paid tiers — ترجع بدون استدعاء السيرفر. */
const buildUnlimitedStorageResult = (
  feature: StorageQuotaFeature,
  tier: TierValue,
): StorageQuotaResult => ({
  accountType: tier,
  feature,
  limit: 0, // 0 = unlimited في هذا السياق
  used: 0,
  remaining: Number.MAX_SAFE_INTEGER,
  dayKey: '',
  whatsappNumber: '',
  whatsappUrl: '',
  limitReachedMessage: '',
  whatsappMessage: '',
});

const buildUnlimitedCapacityResult = (tier: TierValue): CapacityCheckResult => ({
  accountType: tier,
  limit: 0,
  used: 0,
  remaining: Number.MAX_SAFE_INTEGER,
  whatsappNumber: '',
  whatsappUrl: '',
  limitReachedMessage: '',
  whatsappMessage: '',
});

const buildUnlimitedRecordsResult = (tier: TierValue): RecordsCapacityResult => ({
  accountType: tier,
  limit: 0,
  used: 0,
  remaining: Number.MAX_SAFE_INTEGER,
  whatsappNumber: '',
  whatsappUrl: '',
  limitReachedMessage: '',
  whatsappMessage: '',
});

/** اختيار القيمة من الـ controls حسب الفئة — pro_max يقع على premium لو مش محدد */
const pickByTier = <T>(tier: TierValue, freeVal: T, premiumVal: T, proMaxVal: T | undefined): T => {
  if (tier === 'pro_max') {
    return (proMaxVal !== undefined && proMaxVal !== null ? proMaxVal : premiumVal);
  }
  if (tier === 'premium') return premiumVal;
  return freeVal;
};

/**
 * محاولة استهلاك كوتا للتحليل الذكي للروشتة.
 *
 * 🆕 (2026-05) — `mode` بيحدد الزر:
 *   • 'analyze' (الافتراضي): زر "تحليل الحالة" (الزر العميق) — عداد smartPrescriptionCount
 *   • 'quickAdd': زر "إضافة بدون تحليل" (الزر السريع) — عداد منفصل quickAddCount
 *
 * كان الزرّين بيشاركوا نفس العداد فاستهلاك زر بيقفل التاني (bug). دلوقتي عداد لكل واحد.
 */
export type SmartPrescriptionQuotaMode = 'analyze' | 'quickAdd';

export const consumeSmartPrescriptionQuota = async (
  mode: SmartPrescriptionQuotaMode = 'analyze',
): Promise<SmartPrescriptionQuotaResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'consumeSmartPrescriptionQuota');
    const result = await callWithAuthRetry(() => callable({ mode }));
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    const tier = toTier(data.accountType);
    // الحد الاحتياطي يختلف حسب الـmode — كل زر له حده الخاص في الإعدادات
    const fallbackLimit = mode === 'quickAdd'
      ? pickByTier(tier,
          normalizedControls.freeQuickAddDailyLimit,
          normalizedControls.premiumQuickAddDailyLimit,
          normalizedControls.proMaxQuickAddDailyLimit)
      : pickByTier(tier,
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

/**
 * محاولة استهلاك كوتا لعمليات التخزين (سجلات المرضى أو الروشتات الجاهزة).
 *
 * 🆕 (2026-05) — `cachedAccountType`: لو الـ caller عارف الحساب premium/pro_max
 * بنتخطى الـ Cloud Function call تماماً للميزات المدفوعة (طباعة/تنزيل/واتساب/
 * حفظ روشتة جاهزة). ده بيوفر ٢-٥ ثواني انتظار في كل ضغطة. الـ medicalReport
 * يفضل بفحص (خرج عن نطاق الترقية).
 */
export const consumeStorageQuota = async (
  feature: StorageQuotaFeature,
  options?: { cachedAccountType?: TierValue },
): Promise<StorageQuotaResult> => {
  // التخطي: الميزات اللي اتفتحت للـ paid في 2026-05 فقط
  const SKIP_FOR_PAID: ReadonlySet<StorageQuotaFeature> = new Set([
    'prescriptionPrint', 'prescriptionDownload', 'prescriptionWhatsapp', 'readyPrescriptionSave',
  ] as StorageQuotaFeature[]);
  if (SKIP_FOR_PAID.has(feature) && isPaidTier(options?.cachedAccountType)) {
    return buildUnlimitedStorageResult(feature, options!.cachedAccountType as TierValue);
  }

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
  options?: { cachedAccountType?: TierValue },
): Promise<RecordsCapacityResult> => {
  // 🆕 (2026-05): paid tiers بدون فحص حد كلي للسجلات الطبية — التشغيل أسرع
  if (isPaidTier(options?.cachedAccountType)) {
    return buildUnlimitedRecordsResult(options!.cachedAccountType as TierValue);
  }
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
export const validateReadyPrescriptionsCapacity = async (
  options?: { cachedAccountType?: TierValue },
): Promise<CapacityCheckResult> => {
  // 🆕 (2026-05): paid tiers بدون فحص حد كلي للروشتات الجاهزة
  if (isPaidTier(options?.cachedAccountType)) {
    return buildUnlimitedCapacityResult(options!.cachedAccountType as TierValue);
  }
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
export const validateMedicationCustomizationsCapacity = async (
  options?: { cachedAccountType?: TierValue },
): Promise<CapacityCheckResult> => {
  // 🆕 (2026-05): paid tiers بدون فحص حد كلي للأدوية المعدّلة
  if (isPaidTier(options?.cachedAccountType)) {
    return buildUnlimitedCapacityResult(options!.cachedAccountType as TierValue);
  }
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

// ✂️ شيلنا consumeTranslationQuota (2026-05) — الترجمة بقت بدون حد منفصل،
//   حد كل زر (التحليل العميق + الزر السريع) هو الحاكم الفعلي للترجمة.

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
