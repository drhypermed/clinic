/**
 * الملف: VitalsBackgroundControls.tsx
 * الوصف: يحتوي هذا الملف على أدوات التحكم في الألوان الخلفية لقسم العلامات الحيوية. 
 * يسمح بتعديل لون خلفية القسم بالكامل، ولون خلفية كل عنصر (بطاقة) على حدة، 
 * مع التحكم في درجة الشفافية لكل منهما.
 */

import React from 'react';
import type { VitalsSectionControlsProps } from './types';

export const VitalsBackgroundControls: React.FC<VitalsSectionControlsProps> = ({ section, updateSection }) => {
  return (
    <div className="space-y-3 pt-4 border-t border-slate-200">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <span>🎨 ألوان الخلفية</span>
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-600 mb-2 block">خلفية القسم</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={section.backgroundColor || '#f1f5f9'}
              onChange={(e) => updateSection({ backgroundColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">الشفافية</span>
                <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">
                  {Math.round((section.backgroundColorOpacity ?? 1) * 100)}%
                </span>
              </div>
              {/* شريط التحكم في شفافية خلفية القسم */}
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${(section.backgroundColorOpacity ?? 1) * 100}%`, backgroundColor: section.backgroundColor || '#a855f7' }}></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round((section.backgroundColorOpacity ?? 1) * 100)}
                  onChange={(e) => updateSection({ backgroundColorOpacity: parseInt(e.target.value, 10) / 100 })}
                  className="modern-slider slider-purple"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-600 mb-2 block">خلفية العناصر</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={section.itemBackgroundColor || '#ffffff'}
              onChange={(e) => updateSection({ itemBackgroundColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">الشفافية</span>
                <span className="text-xs font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                  {Math.round((section.itemBackgroundColorOpacity ?? 1) * 100)}%
                </span>
              </div>
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${(section.itemBackgroundColorOpacity ?? 1) * 100}%`, backgroundColor: section.itemBackgroundColor || '#10b981' }}></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round((section.itemBackgroundColorOpacity ?? 1) * 100)}
                  onChange={(e) => updateSection({ itemBackgroundColorOpacity: parseInt(e.target.value, 10) / 100 })}
                  className="modern-slider slider-emerald"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
