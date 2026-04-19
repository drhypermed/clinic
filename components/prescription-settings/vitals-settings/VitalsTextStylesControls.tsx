/**
 * الملف: VitalsTextStylesControls.tsx
 * الوصف: يحتوي هذا الملف على أدوات تنسيق الخطوط الخاصة بالقياسات الحيوية. 
 * يسمح بتخصيص نوع الخط وحجمه ولونه لكل من: 
 * مسميات القياسات (Labels)، القيم الرقمية (Values)، والوحدات (Units).
 */

import React from 'react';
import { StyleControl } from '../../editors/StyleControl';
import type { VitalsSectionControlsProps } from '../../../types';

export const VitalsTextStylesControls: React.FC<VitalsSectionControlsProps> = ({ section, updateSection }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <span>✍️ أنماط النصوص</span>
      </label>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">أنماط التسميات (Labels)</label>
          {/* التحكم في مظهر العناوين (مثل: الضغط، الوزن) */}
          <StyleControl
            style={section.labelStyle || {}}
            onChange={(style) => updateSection({ labelStyle: style })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">أنماط القيم (Values)</label>
          <StyleControl
            style={section.valueStyle || {}}
            onChange={(style) => updateSection({ valueStyle: style })}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">أنماط الوحدات (Units)</label>
          <StyleControl
            style={section.unitStyle || {}}
            onChange={(style) => updateSection({ unitStyle: style })}
          />
        </div>
      </div>
    </div>
  );
};
