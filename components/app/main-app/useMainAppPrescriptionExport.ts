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
}

export const useMainAppPrescriptionExport = ({
  paperSize,
  patientName,
  phone,
  userId,
  showNotification,
  setWhatsappGuideOpen,
}: UseMainAppPrescriptionExportParams) => {
  return usePrescriptionExport({
    paperSize,
    patientName,
    phone,
    /** تسجيل عملية التصدير في التحليلات — فشل التسجيل غير حرج. */
    onTrack: (operation) => {
      if (!userId) return;
      usageTrackingService
        .trackEvent({ doctorId: userId, eventType: 'print', metadata: { type: 'prescription', operation } })
        .catch(() => { /* تتبّع غير حرج */ });
    },
    /**
     * إرشاد المستخدم عند الحاجة:
     *   - whatsapp: نفتح مودال دليل الواتساب (شرح بالخطوات)
     *   - download: نعرض notification عن اختيار "حفظ كملف PDF"
     */
    onPrompt: (operation) => {
      if (operation === 'whatsapp') {
        setWhatsappGuideOpen(true);
      } else if (operation === 'download') {
        showNotification(
          'اختر "حفظ كملف PDF" من قائمة الوجهة في نافذة الطباعة — سيُحفظ الملف باسم المريض تلقائياً.',
          'success',
          { id: 'prescription-export-prompt-download' }
        );
      }
    },
    /** رسائل خطأ واضحة بالعربي لكل نوع عملية. */
    onError: (operation) => {
      const messages: Record<typeof operation, string> = {
        print: 'تعذر طباعة الروشتة، يرجى المحاولة مرة أخرى.',
        download: 'تعذر تنزيل الروشتة كملف PDF، يرجى المحاولة مرة أخرى.',
        whatsapp: 'تعذر إرسال الروشتة عبر واتساب، يرجى المحاولة مرة أخرى.',
      };
      showNotification(messages[operation], 'error', { id: `prescription-export-${operation}` });
    },
  });
};
