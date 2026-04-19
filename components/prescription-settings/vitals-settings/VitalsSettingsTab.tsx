/**
 * الملف: VitalsSettingsTab.tsx
 * الوصف: هذا المكون هو التبويب الرئيسي لإعدادات العلامات الحيوية (Vitals). 
 * يعمل كحاوية (Container) تجمع بين قائمة العلامات، المربعات المخصصة، ولوحة التحكم في التنسيق، 
 * مع الربط بآليات الأمان لتعقيم المدخلات قبل حفظها.
 */

import React, { useState } from 'react';
import type { CustomBox, VitalSignConfig, VitalsSectionSettings } from '../../../types';
import type { VitalsSettingsTabProps } from './types';
import { VITALS_SLIDER_STYLES } from './styles';
import { sanitizePlainText, sanitizeVitalsSectionPayload } from './securityUtils';
import { VitalsListSection } from './VitalsListSection';
import { CustomBoxesSection } from './CustomBoxesSection';
import { VitalsSectionStylePanel } from './VitalsSectionStylePanel';

export const VitalsSettingsTab: React.FC<VitalsSettingsTabProps> = ({
  vitals,
  updateVital,
  moveVital,
  vitalsSection,
  updateVitalsSection,
  customBoxes = [],
  addCustomBox,
  updateCustomBox,
  deleteCustomBox,
  moveCustomBox,
}) => {
  const [showStyleSection, setShowStyleSection] = useState(false);
  const [showCustomBoxes, setShowCustomBoxes] = useState(false);
  const safeCustomBoxes = Array.isArray(customBoxes) ? customBoxes : [];

  const section = vitalsSection || {};
  const updateSection = updateVitalsSection || (() => {});

  /** 
   * تحديث بيانات علامة حيوية محددة مع التعقيم 
   * تضمن هذه الدالة أن المسميات (اللغة العربية والإنجليزية) والوحدات خالية من أي أكواد ضارة
   */
  const safeUpdateVital = (key: string, updates: Partial<VitalSignConfig>) => {
    const nextUpdates: Partial<VitalSignConfig> = { ...updates };
    if (typeof nextUpdates.label === 'string') {
      nextUpdates.label = sanitizePlainText(nextUpdates.label);
    }
    if (typeof nextUpdates.labelAr === 'string') {
      nextUpdates.labelAr = sanitizePlainText(nextUpdates.labelAr);
    }
    if (typeof nextUpdates.unit === 'string') {
      nextUpdates.unit = sanitizePlainText(nextUpdates.unit);
    }
    updateVital(key, nextUpdates);
  };

  const safeUpdateCustomBox = (id: string, updates: Partial<CustomBox>) => {
    if (!updateCustomBox) return;
    const nextUpdates: Partial<CustomBox> = { ...updates };

    if (typeof nextUpdates.label === 'string') {
      nextUpdates.label = sanitizePlainText(nextUpdates.label);
    }
    if (typeof nextUpdates.value === 'string') {
      nextUpdates.value = sanitizePlainText(nextUpdates.value);
    }

    updateCustomBox(id, nextUpdates);
  };

  const safeUpdateSection = (updates: Partial<VitalsSectionSettings>) => {
    updateSection(sanitizeVitalsSectionPayload(updates));
  };

  return (
    <>
      <style>{VITALS_SLIDER_STYLES}</style>
      <div className="space-y-4">
        <VitalsListSection
          vitals={vitals}
          updateVital={safeUpdateVital}
          moveVital={moveVital}
        />

        <CustomBoxesSection
          showCustomBoxes={showCustomBoxes}
          onToggle={() => setShowCustomBoxes(!showCustomBoxes)}
          customBoxes={safeCustomBoxes}
          addCustomBox={addCustomBox}
          updateCustomBox={safeUpdateCustomBox}
          deleteCustomBox={deleteCustomBox}
          moveCustomBox={moveCustomBox}
        />

        <VitalsSectionStylePanel
          showStyleSection={showStyleSection}
          onToggle={() => setShowStyleSection(!showStyleSection)}
          section={section}
          updateSection={safeUpdateSection}
        />
      </div>
    </>
  );
};

