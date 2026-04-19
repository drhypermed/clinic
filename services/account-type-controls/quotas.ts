/**
 * نظام استهلاك الكوتا (Quota Consumption System)
 * هذا الملف يتواصل مع Cloud Functions لخصم الرصيد اليومي من العمليات المتاحة للطبيب:
 * 1. استهلاك كوتا التحليل الذكي للروشتات.
 * 2. استهلاك كوتا تخزين السجلات والروشتات الجاهزة.
 * 3. استهلاك كوتا الحجز (العام، الجمهور، السكرتارية).
 * 4. استهلاك كوتا الأدوات الطبية (التفاعلات، الوظائف الكلوية، الحمل).
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

/** محاولة استهلاك كوتا للتحليل الذكي للروشتة */
export const consumeSmartPrescriptionQuota = async (): Promise<SmartPrescriptionQuotaResult> => {
  await ensureAuthenticatedUser();
  try {
    const callable = httpsCallable(functions, 'consumeSmartPrescriptionQuota');
    const result = await callWithAuthRetry(() => callable());
    const data = (result.data || {}) as Record<string, unknown>;
    const normalizedControls = normalizeControls(data);
    return {
      accountType: (data.accountType === 'premium' ? 'premium' : 'free'),
      limit: toSafeLimit(data.limit, normalizedControls.freeDailyLimit),
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
    
    // تحديد الحد الاحتياطي بناءً على الميزة ونوع الحساب
    const fallbackLimit = data.accountType === 'premium'
      ? (feature === 'recordSave'
        ? normalizedControls.premiumRecordDailyLimit
        : feature === 'readyPrescriptionSave'
          ? normalizedControls.premiumReadyPrescriptionDailyLimit
          : normalizedControls.premiumMedicalReportDailyLimit)
      : (feature === 'recordSave'
        ? normalizedControls.freeRecordDailyLimit
        : feature === 'readyPrescriptionSave'
          ? normalizedControls.freeReadyPrescriptionDailyLimit
          : normalizedControls.freeMedicalReportDailyLimit);

    return {
      accountType: (data.accountType === 'premium' ? 'premium' : 'free'),
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
    
    const fallbackLimit = data.accountType === 'premium'
      ? (feature === 'publicBooking'
          ? normalizedControls.premiumPublicBookingDailyLimit
          : feature === 'publicFormBooking'
            ? normalizedControls.premiumPublicFormBookingDailyLimit
            : normalizedControls.premiumSecretaryEntryRequestDailyLimit)
      : (feature === 'publicBooking'
          ? normalizedControls.freePublicBookingDailyLimit
          : feature === 'publicFormBooking'
            ? normalizedControls.freePublicFormBookingDailyLimit
            : normalizedControls.freeSecretaryEntryRequestDailyLimit);

    return {
      accountType: (data.accountType === 'premium' ? 'premium' : 'free'),
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
    const isPremium = data.accountType === 'premium';
    
    const fallbackLimit = feature === 'interactionTool'
      ? (isPremium ? normalizedControls.premiumInteractionToolDailyLimit : normalizedControls.freeInteractionToolDailyLimit)
      : feature === 'renalTool'
        ? (isPremium ? normalizedControls.premiumRenalToolDailyLimit : normalizedControls.freeRenalToolDailyLimit)
        : (isPremium ? normalizedControls.premiumPregnancyToolDailyLimit : normalizedControls.freePregnancyToolDailyLimit);

    return {
      accountType: (isPremium ? 'premium' : 'free'),
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
