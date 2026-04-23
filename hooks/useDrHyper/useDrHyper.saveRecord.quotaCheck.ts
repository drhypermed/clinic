/**
 * useDrHyper.saveRecord.quotaCheck:
 * فحص الحصة اليومية (Storage Daily Quota) قبل حفظ السجل.
 * بيتعامل مع 3 حالات:
 * 1) انتهاء الحصة فعلاً → فتح نافذة تنبيه + إرجاع reason='quota'.
 * 2) خطأ مؤقت (offline/network) → تحذير فقط والاستمرار local-first.
 * 3) خطأ مصادقة → إرجاع reason='auth' مع notification.
 */
import React from 'react';
import { isQuotaTransientError } from '../../services/account-type-controls/quotaErrors';

/** نتيجة فحص الحصة: إمّا نكمل الحفظ أو نرجع بسبب محدّد. */
export type QuotaCheckResult =
  | { ok: true }
  | { ok: false; reason: 'quota' | 'auth' };

interface QuotaCheckArgs {
  // نطابق التوقيع الأصلي في CreateSaveRecordActionParams (Promise<unknown>)
  consumeStorageQuota: (feature: 'recordSave' | 'readyPrescriptionSave') => Promise<unknown>;
  extractSmartQuotaErrorDetails: (error: unknown) => {
    accountType?: string;
    whatsappNumber?: string;
    whatsappUrl?: string;
    dayKey?: string;
  } | null;
  getQuotaReachedMessage: (
    details: { accountType?: string } | null,
    fallback: string,
  ) => string;
  openQuotaNoticeModal: (args: {
    message: string;
    whatsappNumber?: string;
    whatsappUrl?: string;
    dayKey?: string;
  }) => void;
  showNotification: (
    message: string,
    type: 'info' | 'error' | 'success',
    e?: React.MouseEvent | { id?: string },
  ) => void;
  e?: React.MouseEvent<HTMLElement>;
}

export async function runPreSaveQuotaCheck({
  consumeStorageQuota,
  extractSmartQuotaErrorDetails,
  getQuotaReachedMessage,
  openQuotaNoticeModal,
  showNotification,
  e,
}: QuotaCheckArgs): Promise<QuotaCheckResult> {
  try {
    await consumeStorageQuota('recordSave');
    return { ok: true };
  } catch (quotaError: unknown) {
    const errorObj = quotaError as { code?: string; message?: string };
    const code = String(errorObj?.code || '');
    const message = String(errorObj?.message || '');
    const isDailyLimit =
      code === 'resource-exhausted' || message.includes('STORAGE_DAILY_LIMIT_REACHED');
    const details = extractSmartQuotaErrorDetails(quotaError);

    // (1) انتهاء الحصة فعلاً → افتح نافذة التنبيه
    if (isDailyLimit && details) {
      // 3 فئات: مجاني / برو / برو ماكس — ممنوع الاعتماد على ternary ثنائي هنا
      const fallback =
        details.accountType === 'free'
          ? 'تم استهلاك حد حفظ السجلات اليومي للحساب المجاني'
          : details.accountType === 'pro_max'
            ? 'تم استهلاك حد حفظ السجلات اليومي لحساب برو ماكس'
            : 'تم استهلاك حد حفظ السجلات اليومي لحساب برو';
      openQuotaNoticeModal({
        message: getQuotaReachedMessage(details, fallback),
        whatsappNumber: details.whatsappNumber,
        whatsappUrl: details.whatsappUrl,
        dayKey: details.dayKey,
      });
      return { ok: false, reason: 'quota' };
    }

    // (2) خطأ مؤقت/أوفلاين → كمل بدون ضجيج
    if (isQuotaTransientError(quotaError)) {
      console.warn(
        'Record quota check transient/offline failure, continuing local-first save:',
        quotaError,
      );
      return { ok: true };
    }

    // (3) خطأ مصادقة → أرجع reason='auth'
    const quotaErrorMessage = message.trim();
    const normalizedQuotaErrorMessage = quotaErrorMessage.toLowerCase();
    const isAuthFailure =
      quotaErrorMessage.includes('فشلت المصادقة') ||
      quotaErrorMessage.includes('تسجيل الدخول') ||
      normalizedQuotaErrorMessage.includes('unauthenticated');

    if (isAuthFailure) {
      console.warn('Record quota check failed due to auth:', quotaError);
      showNotification(
        quotaErrorMessage || 'فشلت المصادقة. أعد تسجيل الدخول ثم حاول مرة أخرى.',
        'error',
        e,
      );
      return { ok: false, reason: 'auth' };
    }

    // (4) أي خطأ تاني → كـ quota failure عام
    console.error('Error consuming record save quota:', quotaError);
    showNotification('حدث خطأ أثناء التحقق من حد الحفظ اليومي', 'error', e);
    return { ok: false, reason: 'quota' };
  }
}
