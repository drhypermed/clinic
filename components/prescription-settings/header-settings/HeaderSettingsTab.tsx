/**
 * مكون تبويب إعدادات الهيدر (Header Settings Tab)
 * يجمع كل المقاطع المتعلقة بتخصيص الجزء العلوي من الروشتة (الخلفية، الشعار، نصوص العيادة، بيانات المريض).
 */

import React from 'react';
import type { PrescriptionHeaderSettings, TextStyle } from '../../../types';
import type { HeaderSettingsTabProps } from './types';
import { FOOTER_SLIDER_STYLES as HEADER_SLIDER_STYLES } from '../footer-settings/styles';
import { parsePresetToTextStyle } from './helpers';
import { sanitizeHeaderPayload } from './securityUtils';
import { HeaderBackgroundSection } from './HeaderBackgroundSection';
import { HeaderLogoSection } from './HeaderLogoSection';
import { HeaderTextSections } from './HeaderTextSections';
import { HeaderPatientInfoSection } from './HeaderPatientInfoSection';

export const HeaderSettingsTab: React.FC<HeaderSettingsTabProps> = ({
  header,
  defaultHeader,
  updateHeader,
  openSection,
  setOpenSection,
  showNotification,
  handleStyleChange,
  handlePreset,
  editorRefs,
  fileInputRef,
  setLogoToCrop,
  setHeaderBgToCrop,
}) => {
  /** تبديل حالة فتح/إغلاق الأقسام (Accordion) */
  const toggle = (id: string) => setOpenSection(openSection === id ? '' : id);

  /** تحديث الإعدادات مع تطبيق التعقيم (Sanitization) للأمان */
  const safeUpdateHeader = (payload: Partial<PrescriptionHeaderSettings>) => {
    updateHeader(sanitizeHeaderPayload(payload));
  };

  const defaultInfoLabelStyle: TextStyle = {
    color: header.infoBarLabelColor || '#991b1b',
    fontWeight: '900',
  };

  /** تطبيق التنسيقات الجاهزة على تسميات شريط المعلومات (اسم المريض، العمر، إلخ) */
  const applyInfoLabelPreset = (
    field: 'nameLabelStyle' | 'ageLabelStyle' | 'dateLabelStyle',
    base: TextStyle,
    presetStyle: string
  ) => {
    const parsed = parsePresetToTextStyle(presetStyle, base);
    safeUpdateHeader({ [field]: parsed } as Partial<PrescriptionHeaderSettings>);
  };

  // الخصائص المشتركة التي يتم تمريرها لكافة المقاطع الفرعية للهيدر
  const sharedProps = {
    header,
    defaultHeader,
    updateHeader: safeUpdateHeader,
    openSection,
    toggle,
    showNotification,
    handleStyleChange,
    handlePreset,
    editorRefs,
    fileInputRef,
    setLogoToCrop,
    setHeaderBgToCrop,
  };

  return (
    <>
      <style>{HEADER_SLIDER_STYLES}</style>
      <div className="space-y-6">
        <HeaderBackgroundSection {...sharedProps} />
        <HeaderLogoSection {...sharedProps} />
        <HeaderTextSections {...sharedProps} />
        <HeaderPatientInfoSection
          {...sharedProps}
          defaultInfoLabelStyle={defaultInfoLabelStyle}
          applyInfoLabelPreset={applyInfoLabelPreset}
        />
      </div>
    </>
  );
};


