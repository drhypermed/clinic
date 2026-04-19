/**
 * usePreviewScroll:
 * منطق الـ Sticky/Scroll الذكي للمعاينة الحية.
 * - A5 (أي تبويب): تطفو مع التمرير.
 * - غير A5 + header/footer: تطفو (المحتوى قصير).
 * - غير A5 + vitals/middle/print: ثابتة في مكانها.
 */
import { RefObject, useEffect, useState } from 'react';
import type { SettingsTabId } from '../PrescriptionSettingsTabs';
import type { PrescriptionSettings } from '../../../types';

interface HookArgs {
  activeTab: SettingsTabId;
  localSettings: PrescriptionSettings;
  containerRef: RefObject<HTMLDivElement | null>;
  innerContentRef: RefObject<HTMLDivElement | null>;
}

export function usePreviewScroll({
  activeTab,
  localSettings,
  containerRef,
  innerContentRef,
}: HookArgs) {
  const [offsetY, setOffsetY] = useState(0);
  const [headerFooterHeight, setHeaderFooterHeight] = useState<number>(0);

  // هل المقاس A5 (الافتراضي)؟
  const isA5 = !localSettings?.paperSize || localSettings.paperSize.size === 'A5';

  // تبويب الطباعة ثابت دائماً، غيره يعتمد على المقاس/التبويب
  const isStickyMode =
    activeTab !== 'print' && (isA5 || activeTab === 'header' || activeTab === 'footer');

  // إعادة ضبط التمرير عند تغيير التبويب
  useEffect(() => {
    setOffsetY(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // قياس ارتفاع المحتوى (للهيدر والفوتر) باستخدام ResizeObserver
  useEffect(() => {
    if (!innerContentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (innerContentRef.current) {
        setHeaderFooterHeight(innerContentRef.current.offsetHeight + 5);
      }
    });
    observer.observe(innerContentRef.current, { box: 'border-box' });
    return () => observer.disconnect();
  }, [activeTab, localSettings, innerContentRef]);

  // معالج التمرير — يعمل فقط في الـ sticky mode
  useEffect(() => {
    if (!isStickyMode) {
      setOffsetY(0);
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const headerOffset = 10;
      if (containerRect.top < headerOffset) {
        setOffsetY(headerOffset - containerRect.top);
      } else {
        setOffsetY(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isStickyMode, activeTab, containerRef]);

  return { offsetY, headerFooterHeight, isStickyMode, isA5 };
}
