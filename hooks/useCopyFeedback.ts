import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * خيارات إنشاء Hook النسخ للحافظة.
 */
export interface UseCopyFeedbackOptions {
  /** المدة (بالميللي ثانية) التي يبقى خلالها `copied=true` قبل أن يرجع `false`. الافتراضي 2000. */
  resetMs?: number;
}

/**
 * خيارات استدعاء واحد لعملية النسخ.
 */
export interface CopyOptions {
  /**
   * يُستدعى إن فشل `navigator.clipboard.writeText` (مثلاً المتصفح حجب النسخ).
   * إن لم يُمرَّر، يُبتلع الخطأ بصمت كما كانت تفعل معظم نقاط الاستدعاء الأصلية.
   */
  onError?: (error: unknown) => void;
}

/**
 * Hook موحّد لنسخ نص إلى الحافظة مع إشعار "تم النسخ" مؤقت.
 *
 * يحافظ على نفس سلوك الأنماط اليدوية التي كانت منتشرة في المشروع:
 *   - `copied=true` بعد نجاح النسخ، ثم يرجع `false` بعد `resetMs` (افتراضياً 2000ms).
 *   - فحص توفر `navigator.clipboard` (يكافئ الحراسة اليدوية قبل النسخ).
 *   - ابتلاع الخطأ بصمت افتراضياً (يمكن تفعيل `onError` يدوياً).
 *
 * فوائد إضافية مجانية:
 *   - إلغاء المؤقت السابق إن نسخ المستخدم مرتين متتابعتين (بدل شعار متذبذب).
 *   - منع `setState` بعد unmount إذا طال الوقت.
 */
export const useCopyFeedback = (options: UseCopyFeedbackOptions = {}) => {
  const resetMs = options.resetMs ?? 2000;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string, copyOpts?: CopyOptions) => {
      if (!text) return;
      if (typeof navigator === 'undefined' || !navigator.clipboard) return;
      try {
        await navigator.clipboard.writeText(text);
        if (!mountedRef.current) return;
        setCopied(true);
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          if (mountedRef.current) setCopied(false);
          timeoutRef.current = null;
        }, resetMs);
      } catch (error) {
        copyOpts?.onError?.(error);
      }
    },
    [resetMs],
  );

  return { copied, copy };
};
