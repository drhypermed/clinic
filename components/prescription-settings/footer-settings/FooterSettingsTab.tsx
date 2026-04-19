/**
 * الملف: FooterSettingsTab.tsx
 * الوصف: هذا الملف هو التبويب الرئيسي لإعدادات تذييل الروشتة (الفوتر). 
 * وظيفته تجميع وتنظيم كافة المقاطع الفرعية المسؤولة عن تخصيص الجزء السفلي من الروشتة، 
 * مثل الخلفية، الشعار، بيانات التواصل، وأيقونات التواصل الاجتماعي.
 */

import React from 'react';
import type { PrescriptionFooterSettings } from '../../../types';
import type { FooterSettingsTabProps } from './types';
import { FOOTER_SLIDER_STYLES } from './styles';
import { sanitizeFooterPayload } from './securityUtils';
import { FooterBackgroundSection } from './FooterBackgroundSection';
import { FooterLogoSection } from './FooterLogoSection';
import { FooterInfoSections } from './FooterInfoSections';
import { FooterContactsSection } from './FooterContactsSection';
import { FooterSocialSection } from './FooterSocialSection';

export const FooterSettingsTab: React.FC<FooterSettingsTabProps> = ({
  footer,
  updateFooter,
  openSection,
  setOpenSection,
  showNotification,
  handleStyleChange,
  handlePreset,
  editorRefs,
  setFooterBgToCrop,
  setFooterLogoToCrop,
}) => {
  /** دالة لتبديل حالة فتح/إغلاق أقسام الأكورديون في تبويب الفوتر */
  const toggle = (id: string) => setOpenSection(openSection === id ? '' : id);

  /** 
   * دالة تحديث بيانات الفوتر مع تطبيق التعقيم (Sanitization)
   * تضمن هذه الدالة عدم حفظ أي كود خبيث في قاعدة البيانات عند تعديل نصوص الـ HTML
   */
  const safeUpdateFooter = (payload: Partial<PrescriptionFooterSettings>) => {
    updateFooter(sanitizeFooterPayload(payload));
  };

  // الخصائص المشتركة التي يتم توزيعها على المقاطع الفرعية للفوتر لتوحيد المنطق
  const sharedProps = {
    footer,
    updateFooter: safeUpdateFooter,
    openSection,
    toggle,
    showNotification,
    handleStyleChange,
    handlePreset,
    editorRefs,
  };

  return (
    <>
      <style>{FOOTER_SLIDER_STYLES}</style>
      <div className="space-y-6">
        <FooterBackgroundSection {...sharedProps} setFooterBgToCrop={setFooterBgToCrop} />
        <FooterLogoSection {...sharedProps} setFooterLogoToCrop={setFooterLogoToCrop} />
        <FooterInfoSections {...sharedProps} />
        <FooterContactsSection {...sharedProps} />
        <FooterSocialSection {...sharedProps} />
      </div>
    </>
  );
};

