/**
 * الملف: VitalsTitleControls.tsx
 * الوصف: يحتوي هذا المكون على أدوات التحكم الخاصة بعنوان قسم العلامات الحيوية. 
 * يسمح بتعديل اسم القسم (مثلاً من "العلامات الحيوية" إلى "القياسات")، 
 * وتنسيق خط العنوان، ولون وسمك الخط الزخرفي الموجود تحته.
 */

import React from 'react';
import { StyleControl } from '../../editors/StyleControl';
import type { VitalsSectionControlsProps } from '../../../types';

export const VitalsTitleControls: React.FC<VitalsSectionControlsProps> = ({ section, updateSection }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <span>📝 اسم القسم</span>
      </label>
      {/* حقل إدخال اسم القسم الرئيسي */}
      <input
        type="text"
        value={section.title ?? ''}
        onChange={(e) => updateSection({ title: e.target.value })}
        className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm font-bold focus:border-brand-500 outline-none"
        placeholder="القياسات والعلامات الحيوية"
      />
      <div className="relative z-10">
        <label className="text-xs font-bold text-slate-600 mb-2 block">أنماط العنوان</label>
        <StyleControl
          style={section.titleStyle || {}}
          onChange={(style) => updateSection({ titleStyle: style })}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-600 mb-3 block">خط تحت العنوان</label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600 whitespace-nowrap">اللون:</label>
            <input
              type="color"
              value={section.titleUnderlineColor || '#dc2626'}
              onChange={(e) => updateSection({ titleUnderlineColor: e.target.value })}
              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">الشفافية</span>
                <span className="text-xs font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full">
                  {Math.round((section.titleUnderlineOpacity ?? 1) * 100)}%
                </span>
              </div>
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${(section.titleUnderlineOpacity ?? 1) * 100}%`, backgroundColor: section.titleUnderlineColor || '#dc2626' }}></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round((section.titleUnderlineOpacity ?? 1) * 100)}
                  onChange={(e) => updateSection({ titleUnderlineOpacity: parseInt(e.target.value, 10) / 100 })}
                  className="modern-slider slider-red"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600 whitespace-nowrap">السمك:</label>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">بالبكسل</span>
                <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">
                  {section.titleUnderlineWidth || 1}px
                </span>
              </div>
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${((section.titleUnderlineWidth || 1) / 10) * 100}%`, backgroundColor: '#64748b' }}></div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={section.titleUnderlineWidth || 1}
                  onChange={(e) => updateSection({ titleUnderlineWidth: parseInt(e.target.value, 10) })}
                  className="modern-slider slider-slate"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
