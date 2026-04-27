/**
 * useDrHyper.saveRecord.quotaCheck:
 * فحص "سعة السجلات" قبل الحفظ — تطوّر السلوك:
 *   - قبل 2026-04: حد يومي (server-side عبر consumeStorageQuota('recordSave'))
 *   - بدايات 2026-04: حد كلي client-side (records.length في الذاكرة)
 *   - دلوقتي 2026-04: حد كلي SERVER-SIDE (validateRecordsCapacity على Cloud Function)
 *
 * ليه التطور؟ الفحص في المتصفح كان ممكن يتجاوزه طبيب فاهم تقنياً عبر dev tools.
 * السيرفر دلوقتي بيعد السجلات الفعلية ويرفض لو وصل للحد — مفيش طريق للتجاوز.
 *
 * بيتعامل مع 3 حالات:
 * 1) السعة وصلت → فتح نافذة تنبيه + إرجاع reason='quota'.
 * 2) خطأ شبكة/auth → نمنع الحفظ (تشديد أمني — ما بقاش local-first).
 * 3) لو الفحص ناجح → نسمح بالحفظ.
 */
import React from 'react';
import { validateRecordsCapacity } from '../../services/accountTypeControlsService';
import {
  getQuotaVerificationFailureMessage,
  isQuotaLimitExceededError,
  retryOnTransientError,
} from '../../services/account-type-controls/quotaErrors';

/** نتيجة فحص السعة: إمّا نكمل الحفظ أو نرجع بسبب محدّد. */
type QuotaCheckResult =
  | { ok: true }
  | { ok: false; reason: 'quota' | 'auth' };

interface CapacityCheckArgs {
  /** المستخدم الحالي — للتأكد من الـauth قبل النداء */
  user: { uid: string } | null | undefined;
  /** عدد السجلات في الذاكرة — للاستخدام كـfallback لو السيرفر مش متاح
   *  (ملاحظة: مش الـsource of truth بعد التشديد الأمني — بنعتمد على السيرفر) */
  currentRecordsCount: number;
  /** لو موجود = الـcaller بيعدّل سجل قائم (نفس الـid، عدد ثابت). السيرفر
   *  هيتأكد من وجوده ويسمح بدون فحص الحد. لو غير موجود = إنشاء جديد. */
  recordIdForUpdate?: string;
  /** فتح نافذة تنبيه السعة (مع رابط واتساب) */
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

/** استخراج تفاصيل خطأ السعة من Cloud Function response */
const extractCapacityErrorDetails = (error: unknown) => {
  const details = (error as { details?: Record<string, unknown> })?.details;
  if (!details || typeof details !== 'object') return null;
  return {
    accountType: String(details.accountType || ''),
    limit: Number(details.limit || 0),
    used: Number(details.used || 0),
    remaining: Number(details.remaining || 0),
    whatsappNumber: String(details.whatsappNumber || ''),
    whatsappUrl: String(details.whatsappUrl || ''),
    limitReachedMessage: String(details.limitReachedMessage || ''),
  };
};

export async function runPreSaveQuotaCheck({
  user,
  // currentRecordsCount: مش بنستخدمه بعد التشديد — السيرفر هو الـsource of truth
  currentRecordsCount: _currentRecordsCount,
  recordIdForUpdate,
  openQuotaNoticeModal,
  showNotification,
  e,
}: CapacityCheckArgs): Promise<QuotaCheckResult> {
  if (!user?.uid) {
    showNotification('يجب تسجيل الدخول أولاً ثم إعادة المحاولة.', 'error', e);
    return { ok: false, reason: 'auth' };
  }

  try {
    // السيرفر بيعد السجلات الفعلية ويقارنها بحد الأدمن.
    // لو فيه recordIdForUpdate (تعديل سجل قائم) → السيرفر بيتأكد من وجوده
    // وبيسمح بدون فحص الحد (لأن العدد الكلي مش هيزيد).
    // ─ retry تلقائي على أخطاء النت العابرة (3 محاولات، إجمالي ~5 ثواني) ─
    //   ده بيحل 90% من مشاكل النت السيئ بدون ما الطبيب يحس بأي حاجة.
    await retryOnTransientError(() =>
      validateRecordsCapacity(
        recordIdForUpdate ? { recordId: recordIdForUpdate } : undefined,
      ),
    );
    return { ok: true };
  } catch (err: unknown) {
    // السعة وصلت للنهاية → نفتح المودال برسالة الأدمن + رابط واتساب
    if (isQuotaLimitExceededError(err)) {
      const details = extractCapacityErrorDetails(err);
      if (details) {
        const message = String(details.limitReachedMessage || '').trim()
          .replace(/\{\s*limit\s*\}/gi, String(details.limit))
          .replace(/\{\s*used\s*\}/gi, String(details.used))
          .replace(/\{\s*remaining\s*\}/gi, String(details.remaining));
        openQuotaNoticeModal({
          message: message || 'وصلت للحد الأقصى لتخزين السجلات الطبية. احذف سجل قبل الإضافة.',
          whatsappNumber: details.whatsappNumber,
          whatsappUrl: details.whatsappUrl,
        });
        return { ok: false, reason: 'quota' };
      }
    }

    const message = getQuotaVerificationFailureMessage('تعذر التحقق من سعة السجلات الطبية الآن. حاول مرة أخرى.');
    openQuotaNoticeModal({ message });
    console.warn('Records capacity check failed; blocking save:', err);
    return { ok: false, reason: 'quota' };
  }
}
