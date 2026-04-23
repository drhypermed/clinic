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

import { BookingQuotaResult, DrugToolQuotaFeature, DrugToolQuotaResult, SmartPrescriptionQuotaResult, StorageQuotaFeature } from './types';
import { StorageQuotaResult } from './types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { callWithAuthRetry, ensureAuthenticatedUser, mapCallableError } from './auth';
import { normalizeControls, resolveSafeQuotaWhatsappUrl, toSafeLimit } from './normalize';
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
    const fallbackLimit = feature === 'recordSave'
      ? pickByTier(tier, normalizedControls.freeRecordDailyLimit, normalizedControls.premiumRecordDailyLimit, normalizedControls.proMaxRecordDailyLimit)
      : feature === 'readyPrescriptionSave'
        ? pickByTier(tier, normalizedControls.freeReadyPrescriptionDailyLimit, normalizedControls.premiumReadyPrescriptionDailyLimit, normalizedControls.proMaxReadyPrescriptionDailyLimit)
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
