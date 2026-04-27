/**
 * الملف: usePublicBookingConfigLoader.ts (Hook)
 * الوصف: "جالب الإعدادات".
 * يقوم هذا الملف بمهمة حيوية عند فتح الصفحة لأول مرة:
 * - جلب بيانات العيادة (اسم الطبيب واللوغو والعنوان) باستخدام الكود السري.
 * - يتضمن "منطق إعادة المحاولة" (Retry Logic)؛ فإذا فشل التحميل أول مرة بسبب
 *   ضعف الإنترنت، يحاول تلقائياً لمرتين إضافيتين قبل إظهار رسالة الخطأ.
 * - يضمن عدم تحميل البيانات بشكل متكرر إذا لم يتغير الكود السري.
 *
 * حماية race conditions: secretRequestIdRef counter يزيد مع كل تغيُّر secret،
 * وكل async response (الأساسي + إعادة المحاوله) بيتأكد إن الـcounter ما اتغيَّرش
 * قبل ما يكتب على الـstate. كده لو طلب قديم اتأخر، رده بيتجاهل ومش بيكتب فوق
 * الإعدادات الجديدة بعد التنقل لرابط تاني.
 *
 * مسار الخطأ: قبل الإصلاح، لو الـpromise رفض (شبكه/صلاحيات)، الـloading كان
 * يفضل true للأبد. الإصلاح يضمن إن الـloading يقفل في كل الحالات (success/failure/null).
 */
import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

import { firestoreService } from '../../../services/firestore';
import type { Config } from '../../../types';

type UsePublicBookingConfigLoaderParams = {
  secret: string;
  resolvingSecret: boolean;
  setConfig: Dispatch<SetStateAction<Config | null>>;
  setConfigLoading: Dispatch<SetStateAction<boolean>>;
};

export const usePublicBookingConfigLoader = ({
  secret,
  resolvingSecret,
  setConfig,
  setConfigLoading,
}: UsePublicBookingConfigLoaderParams) => {
  const configRetryCountRef = useRef(0);
  const configRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Counter يزيد مع كل تغيُّر secret — يحمي من stale async responses.
  const secretRequestIdRef = useRef(0);

  useEffect(() => {
    if (resolvingSecret) return;
    if (!secret) {
      setConfigLoading(false);
      return;
    }

    secretRequestIdRef.current += 1;
    const myRequestId = secretRequestIdRef.current;

    setConfig(null);
    setConfigLoading(true);
    configRetryCountRef.current = 0;

    const tryFetch = () => {
      firestoreService.getBookingConfig(secret)
        .then((c) => {
          // الرد ده لطلب قديم؟ اخرج بدون setState
          if (secretRequestIdRef.current !== myRequestId) return;

          if (c) {
            setConfig(c);
            setConfigLoading(false);
            return;
          }
          if (configRetryCountRef.current >= 2) {
            setConfigLoading(false);
            return;
          }
          const delay = configRetryCountRef.current === 0 ? 1500 : 3000;
          configRetryCountRef.current += 1;
          configRetryTimeoutRef.current = setTimeout(tryFetch, delay);
        })
        .catch((err) => {
          // catch — قبل الإصلاح، لو الـpromise رفض الـloading كان يفضل true للأبد.
          if (secretRequestIdRef.current !== myRequestId) return;
          console.warn('[PublicBooking] getBookingConfig failed:', err);
          if (configRetryCountRef.current >= 2) {
            setConfigLoading(false);
            return;
          }
          const delay = configRetryCountRef.current === 0 ? 1500 : 3000;
          configRetryCountRef.current += 1;
          configRetryTimeoutRef.current = setTimeout(tryFetch, delay);
        });
    };
    tryFetch();

    return () => {
      if (configRetryTimeoutRef.current) clearTimeout(configRetryTimeoutRef.current);
    };
  }, [secret, resolvingSecret, setConfig, setConfigLoading]);

  const retryLoadConfig = () => {
    if (!secret) return;

    secretRequestIdRef.current += 1;
    const myRequestId = secretRequestIdRef.current;

    setConfigLoading(true);
    firestoreService.getBookingConfig(secret)
      .then((c) => {
        if (secretRequestIdRef.current !== myRequestId) return;
        setConfig(c);
        setConfigLoading(false);
      })
      .catch((err) => {
        // catch — لو إعادة المحاوله فشلت، الـloading لازم يقفل (مكنش بيقفل قبل الإصلاح).
        if (secretRequestIdRef.current !== myRequestId) return;
        console.warn('[PublicBooking] retryLoadConfig failed:', err);
        setConfigLoading(false);
      });
  };

  return { retryLoadConfig };
};
