/**
 * الملف: VitalsBorderControls.tsx
 * الوصف: هذا المكون مسؤول عن إعدادات الحدود (Borders) الخاصة بقسم العلامات الحيوية. 
 * يتيح تخصيص لون وشفافية الإطار الخارجي للقسم، وكذلك الإطارات الخاصة بكل عنصر قياس، 
 * لضمان التميز البصري وسهولة القراءة.
 */

import React from 'react';
import type { VitalsSectionControlsProps } from './types';

export const VitalsBorderControls: React.FC<VitalsSectionControlsProps> = ({ section, updateSection }) => {
  return (
    <div className="space-y-3 pt-4 border-t border-slate-200">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <span>🔲 ألوان الحدود</span>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-600 mb-2 block">حدود القسم</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={section.borderColor || '#cbd5e1'}
              onChange={(e) => updateSection({ borderColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">الشفافية</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {Math.round((section.borderOpacity ?? 1) * 100)}%
                </span>
              </div>
              {/* شريط التحكم في شفافية حدود القسم */}
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${(section.borderOpacity ?? 1) * 100}%`, backgroundColor: section.borderColor || '#3b82f6' }}></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round((section.borderOpacity ?? 1) * 100)}
                  onChange={(e) => updateSection({ borderOpacity: parseInt(e.target.value, 10) / 100 })}
                  className="modern-slider slider-blue"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-600 mb-2 block">حدود العناصر</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={section.itemBorderColor || '#cbd5e1'}
              onChange={(e) => updateSection({ itemBorderColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">الشفافية</span>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  {Math.round((section.itemBorderColorOpacity ?? 1) * 100)}%
                </span>
              </div>
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${(section.itemBorderColorOpacity ?? 1) * 100}%`, backgroundColor: section.itemBorderColor || '#14b8a6' }}></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round((section.itemBorderColorOpacity ?? 1) * 100)}
                  onChange={(e) => updateSection({ itemBorderColorOpacity: parseInt(e.target.value, 10) / 100 })}
                  className="modern-slider slider-teal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
