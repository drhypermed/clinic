/**
 * الملف: usePublicBookingConfigLoader.ts (Hook)
 * الوصف: "جالب الإعدادات". 
 * يقوم هذا الملف بمهمة حيوية عند فتح الصفحة لأول مرة: 
 * - جلب بيانات العيادة (اسم الطبيب واللوغو والعنوان) باستخدام الكود السري. 
 * - يتضمن "منطق إعادة المحاولة" (Retry Logic)؛ فإذا فشل التحميل أول مرة بسبب 
 *   ضعف الإنترنت، يحاول تلقائياً لمرتين إضافيتين قبل إظهار رسالة الخطأ. 
 * - يضمن عدم تحميل البيانات بشكل متكرر إذا لم يتغير الكود السري.
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

  useEffect(() => {
    if (resolvingSecret) return;
    if (!secret) {
      setConfigLoading(false);
      return;
    }
    setConfig(null);
    setConfigLoading(true);
    configRetryCountRef.current = 0;

    const tryFetch = () => {
      firestoreService.getBookingConfig(secret).then((c) => {
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
      });
    };
    tryFetch();

    return () => {
      if (configRetryTimeoutRef.current) clearTimeout(configRetryTimeoutRef.current);
    };
  }, [secret, resolvingSecret, setConfig, setConfigLoading]);

  const retryLoadConfig = () => {
    if (!secret) return;
    setConfigLoading(true);
    firestoreService.getBookingConfig(secret).then((c) => {
      setConfig(c);
      setConfigLoading(false);
    });
  };

  return { retryLoadConfig };
};
