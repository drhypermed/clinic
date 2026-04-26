/**
 * الملف: VitalsSectionStylePanel.tsx
 * الوصف: هذا المكون هو لوحة التحكم الشاملة في مظهر قسم العلامات الحيوية. 
 * يعمل كمجلد (Accordion) يضم بداخله كافة الأقسام الفرعية مثل: 
 * العناوين، الخلفيات، الحدود، تنسيق النصوص، والموضع الجغرافي للقسم في الروشتة.
 */

import React from 'react';
import type { VitalsSectionStylePanelProps } from './types';
import { VitalsTitleControls } from './VitalsTitleControls';
import { VitalsBackgroundControls } from './VitalsBackgroundControls';
import { VitalsBorderControls } from './VitalsBorderControls';
import { VitalsTextStylesControls } from './VitalsTextStylesControls';
import { VitalsPositionControls } from './VitalsPositionControls';

export const VitalsSectionStylePanel: React.FC<VitalsSectionStylePanelProps> = ({
  showStyleSection,
  onToggle,
  section,
  updateSection,
}) => {
  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      {/* زر التبديل لفتح أو إغلاق لوحة التحكم في الأنماط */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-brand-50 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all"
      >
        <span className="font-black text-slate-800 flex items-center gap-2">
          🎨 تصميم قسم {section.title || 'Vitals & measurements'}
        </span>
        <span className={`transition-transform ${showStyleSection ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {showStyleSection && (
        <div className="mt-4 space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-visible">
          <VitalsTitleControls section={section} updateSection={updateSection} />
          <VitalsBackgroundControls section={section} updateSection={updateSection} />
          <VitalsBorderControls section={section} updateSection={updateSection} />
          <VitalsTextStylesControls section={section} updateSection={updateSection} />
          <VitalsPositionControls section={section} updateSection={updateSection} />
        </div>
      )}
    </div>
  );
};
