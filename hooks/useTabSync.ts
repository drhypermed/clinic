/**
 * useTabSync — مزامنة حالة التاب المحلية مع URL search params.
 *
 * عند تغيير التاب يدوياً: يتم تحديث الـ URL.
 * عند الضغط على زر الرجوع/الأمام في المتصفح: يتم تحديث التاب المحلي.
 * التاب الافتراضي لا يظهر في الـ URL (للحفاظ على نظافة الرابط).
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useTabSync<T extends string>(
  paramKey: string,
  localValue: T,
  setLocalValue: (val: T) => void,
  defaultValue: T,
  validValues: readonly T[],
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInternalUpdate = useRef(false);

  // مزامنة: URL → الحالة المحلية (عند تغيير الرابط يدوياً أو back/forward)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const urlValue = searchParams.get(paramKey) as T | null;
    if (urlValue && validValues.includes(urlValue) && urlValue !== localValue) {
      setLocalValue(urlValue);
    } else if (!urlValue && localValue !== defaultValue) {
      // لو الـ param اتشال من الـ URL (مثلاً عند الرجوع للصفحة بدون param)
      setLocalValue(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, paramKey]);

  // مزامنة: الحالة المحلية → URL (عند ضغط المستخدم على تاب)
  const setTabWithUrl = useCallback((newValue: T) => {
    setLocalValue(newValue);
    isInternalUpdate.current = true;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newValue === defaultValue) {
        next.delete(paramKey);
      } else {
        next.set(paramKey, newValue);
      }
      return next;
    }, { replace: true });
  }, [paramKey, defaultValue, setLocalValue, setSearchParams]);

  return { setTabWithUrl };
}
