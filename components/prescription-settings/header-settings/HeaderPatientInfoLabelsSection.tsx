import React from 'react';
import { StyleControl } from '../../editors/StyleControl';
import { LABEL_CLASS } from '../utils';
import type { HeaderPatientInfoSectionProps } from '../../../types';

type HeaderPatientInfoLabelsSectionProps = Pick<
  HeaderPatientInfoSectionProps,
  'header' | 'updateHeader' | 'handleStyleChange' | 'defaultInfoLabelStyle' | 'applyInfoLabelPreset'
>;

export const HeaderPatientInfoLabelsSection: React.FC<HeaderPatientInfoLabelsSectionProps> = ({
  header,
  updateHeader,
  handleStyleChange,
  defaultInfoLabelStyle,
  applyInfoLabelPreset,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* حقل تعديل نص "الاسم" وتنسيقه */}
      <div className="space-y-2">
        <label className={LABEL_CLASS}>نص الاسم</label>
        <input
          type="text"
          value={header.nameLabel || 'الاسم'}
          onChange={(e) => updateHeader({ nameLabel: e.target.value })}
          className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm font-bold focus:border-brand-500 outline-none"
        />
        {/* التحكم في ستايل تسمية الاسم (لون، حجم، نوع الخط) */}
        <StyleControl
          style={header.nameLabelStyle || defaultInfoLabelStyle}
          onChange={(s) =>
            handleStyleChange(
              s,
              'nameLabelStyle',
              header.nameLabelStyle || defaultInfoLabelStyle,
              (x) => updateHeader({ nameLabelStyle: x })
            )
          }
          onApplyPreset={(s) => applyInfoLabelPreset('nameLabelStyle', header.nameLabelStyle || defaultInfoLabelStyle, s)}
        />
      </div>
      {/* حقل تعديل نص "السن" وتنسيقه */}
      <div className="space-y-2">
        <label className={LABEL_CLASS}>نص السن</label>
        <input
          type="text"
          value={header.ageLabel || 'السن'}
          onChange={(e) => updateHeader({ ageLabel: e.target.value })}
          className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm font-bold focus:border-brand-500 outline-none"
        />
        {/* التحكم في ستايل تسمية السن */}
        <StyleControl
          style={header.ageLabelStyle || defaultInfoLabelStyle}
          onChange={(s) =>
            handleStyleChange(
              s,
              'ageLabelStyle',
              header.ageLabelStyle || defaultInfoLabelStyle,
              (x) => updateHeader({ ageLabelStyle: x })
            )
          }
          onApplyPreset={(s) => applyInfoLabelPreset('ageLabelStyle', header.ageLabelStyle || defaultInfoLabelStyle, s)}
        />
      </div>
      {/* حقل تعديل نص "التاريخ" وتنسيقه */}
      <div className="space-y-2">
        <label className={LABEL_CLASS}>نص التاريخ</label>
        <input
          type="text"
          value={header.dateLabel || 'التاريخ'}
          onChange={(e) => updateHeader({ dateLabel: e.target.value })}
          className="w-full p-2.5 border-2 border-slate-200 rounded-lg text-sm font-bold focus:border-brand-500 outline-none"
        />
        {/* التحكم في ستايل تسمية التاريخ */}
        <StyleControl
          style={header.dateLabelStyle || defaultInfoLabelStyle}
          onChange={(s) =>
            handleStyleChange(
              s,
              'dateLabelStyle',
              header.dateLabelStyle || defaultInfoLabelStyle,
              (x) => updateHeader({ dateLabelStyle: x })
            )
          }
          onApplyPreset={(s) => applyInfoLabelPreset('dateLabelStyle', header.dateLabelStyle || defaultInfoLabelStyle, s)}
        />
      </div>
    </div>
  );
};
