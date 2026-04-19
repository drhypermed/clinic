/**
 * مكون إعدادات بيانات المريض (Header Patient Info Section)
 * يتيح للطبيب تخصيص طريقة عرض بيانات المريض (الاسم، السن، التاريخ) في هيدر الروشتة، بما في ذلك الأنماط والفواصل والتسميات.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import type { HeaderPatientInfoSectionProps } from '../../../types';
import { HeaderPatientInfoLabelsSection } from './HeaderPatientInfoLabelsSection';
import { HeaderPatientInfoAppearanceSection } from './HeaderPatientInfoAppearanceSection';
import { HeaderPatientInfoDividersSection } from './HeaderPatientInfoDividersSection';

export const HeaderPatientInfoSection: React.FC<HeaderPatientInfoSectionProps> = ({
  header,
  updateHeader,
  openSection,
  toggle,
  handleStyleChange,
  defaultInfoLabelStyle,
  applyInfoLabelPreset,
}) => {
  return (
    <>
      {/* قسم إعدادات بيانات المريض (الاسم، السن، تاريخ الكشف) */}
      <CollapsibleSection
        title="بيانات المريض (الاسم • السن • التاريخ)"
        isOpen={openSection === 'patientInfoBar'}
        onToggle={() => toggle('patientInfoBar')}
        className="p-4 bg-gradient-to-br from-slate-50 to-white"
        color="indigo"
      >
        <div className="space-y-5">
          {/* مقطع تعديل تسميات البيانات (مثل تغيير كلمة "الاسم" إلى "Patient Name") وأنماطها */}
          <HeaderPatientInfoLabelsSection
            header={header}
            updateHeader={updateHeader}
            handleStyleChange={handleStyleChange}
            defaultInfoLabelStyle={defaultInfoLabelStyle}
            applyInfoLabelPreset={applyInfoLabelPreset}
          />
          {/* مقطع تعديل المظهر العام لشريط البيانات (الخلفية، الحواف، الخطوط) */}
          <HeaderPatientInfoAppearanceSection header={header} updateHeader={updateHeader} />
          {/* مقطع تعديل الفواصل بين البيانات (النقاط أو الخطوط الفاصلة) */}
          <HeaderPatientInfoDividersSection header={header} updateHeader={updateHeader} />
        </div>
      </CollapsibleSection>
    </>
  );
};
