// ─────────────────────────────────────────────────────────────────────────────
// Hook تصدير الروشتة من الواجهة الرئيسية (useMainAppPrescriptionExport)
// ─────────────────────────────────────────────────────────────────────────────
// غلاف حول usePrescriptionExport لاستخدامه من MainApp مع callbacks مخصصة:
//   • onTrack: يُسجل استخدام العمليات (طباعة/تنزيل/واتساب) في usageTrackingService
//   • onPrompt: يعرض إرشادات للمستخدم (مثلاً فتح مودال دليل الواتساب)
//   • onError: يعرض notification عربي عند فشل أي عملية
//
// فصلناه عشان MainApp ما يبقاش فيه كلام الـ usage tracking + ترجمة الأخطاء.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { usePrescriptionExport } from '../../../hooks/usePrescriptionExport';
import { usageTrackingService } from '../../../services/usageTrackingService';
import type { PaperSizeSettings } from '../../../types';

interface UseMainAppPrescriptionExportParams {
  paperSize: PaperSizeSettings | undefined;
  patientName: string;
  phone: string;
  userId: string;
  showNotification: (msg: string, type?: any, options?: any) => void;
  setWhatsappGuideOpen: (open: boolean) => void;
  /** 🆕 يُستدعى لما الكوتا تنتهي لأي إجراء تصدير — لفتح مودال الحد + الواتساب */
  openQuotaNoticeModal?: (payload: {
    message: string;
    whatsappNumber?: string;
    whatsappUrl?: string;
    persist?: boolean;
  }) => void;
}

export const useMainAppPrescriptionExport = ({
  paperSize,
  patientName,
  phone,
  userId,
  showNotification,
  setWhatsappGuideOpen,
  openQuotaNoticeModal,
}: UseMainAppPrescriptionExportParams) => {
  // ─── تثبيت الـ callbacks بـ useCallback ───────────────────────────────────
  // قبل التثبيت: كانت بتتعرّف inline في كل render، فالـ checkQuota الجوّه في
  // usePrescriptionExport بتتعمل من جديد، وبالتالي handlePrint/Download/WhatsApp
  // كلها بتتغير reference في كل render → الأزرار في prescription-actions كانت
  // بتفقد memoization. التثبيت ده بيخلي onClick handlers ثابتة طول الجلسة.

  /** تسجيل عملية التصدير في التحليلات — فشل التسجيل غير حرج. */
  const onTrack = useCallback((operation: 'print' | 'download' | 'whatsapp') => {
    if (!userId) return;
    usageTrackingService
      .trackEvent({ doctorId: userId, eventType: 'print', metadata: { type: 'prescription', operation } })
      .catch(() => { /* تتبّع غير حرج */ });
  }, [userId]);

  /**
   * إرشاد المستخدم عند الحاجة:
   *   - whatsapp: نفتح مودال دليل الواتساب (شرح بالخطوات)
   *   - download: نعرض notification عن اختيار "حفظ كملف PDF"
   */
  const onPrompt = useCallback((operation: 'print' | 'download' | 'whatsapp') => {
    if (operation === 'whatsapp') {
      setWhatsappGuideOpen(true);
    } else if (operation === 'download') {
      showNotification(
        'اختر "حفظ كملف PDF" من قائمة الوجهة في نافذة الطباعة — سيُحفظ الملف باسم المريض تلقائياً.',
        'success',
        { id: 'prescription-export-prompt-download' }
      );
    }
  }, [setWhatsappGuideOpen, showNotification]);

  /** رسائل خطأ واضحة بالعربي لكل نوع عملية. */
  const onError = useCallback((operation: 'print' | 'download' | 'whatsapp') => {
    const messages: Record<'print' | 'download' | 'whatsapp', string> = {
      print: 'تعذر طباعة الروشتة، يرجى المحاولة مرة أخرى.',
      download: 'تعذر تنزيل الروشتة كملف PDF، يرجى المحاولة مرة أخرى.',
      whatsapp: 'تعذر إرسال الروشتة عبر واتساب، يرجى المحاولة مرة أخرى.',
    };
    showNotification(messages[operation], 'error', { id: `prescription-export-${operation}` });
  }, [showNotification]);

  /** 🆕 لما الحد اليومي ينتهي — نفتح المودال الموحّد للكوتا (رسالة الأدمن + واتساب). */
  const onQuotaLimitReached = useCallback((
    _operation: 'print' | 'download' | 'whatsapp',
    details: { message: string; whatsappNumber: string; whatsappUrl: string; limit: number },
  ) => {
    if (openQuotaNoticeModal) {
      openQuotaNoticeModal({
        message: details.message,
        whatsappNumber: details.whatsappNumber,
        whatsappUrl: details.whatsappUrl,
        persist: true,
      });
    } else {
      showNotification(details.message, 'error', { id: `prescription-export-quota` });
    }
  }, [openQuotaNoticeModal, showNotification]);

  return usePrescriptionExport({
    paperSize,
    patientName,
    phone,
    onTrack,
    onPrompt,
    onError,
    onQuotaLimitReached,
  });
};
