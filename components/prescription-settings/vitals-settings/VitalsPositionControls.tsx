/**
 * الملف: VitalsPositionControls.tsx
 * الوصف: هذا المكون مسؤول عن تحديد الموقع الجغرافي لقسم العلامات الحيوية في الروشتة. 
 * يسمح للطبيب بتحريك القسم أفقياً ورأسياً بدقة (بكسل)، 
 * والتحكم في عرض المربعات (نسبة مئوية) لضمان التناسق مع بقية عناصر الصفحة.
 */

import React from 'react';
import type { VitalsSectionControlsProps } from './types';

export const VitalsPositionControls: React.FC<VitalsSectionControlsProps> = ({ section, updateSection }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <span>📍 موضع وحجم القسم</span>
      </label>
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-600 mb-2 block">تحريك جميع العناصر</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">أفقياً (يمين/يسار)</span>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {section.itemsOffsetX || 0}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* زر لتحريك القسم جهة اليسار */}
                <button
                  onClick={() => updateSection({ itemsOffsetX: (section.itemsOffsetX || 0) - 5 })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
                  title="يسار"
                >
                  ←
                </button>
                <div className="flex-1">
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${Math.min(100, Math.max(0, (((section.itemsOffsetX || 0) + 50) / 100) * 100))}%`, backgroundColor: '#3b82f6' }}></div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={section.itemsOffsetX || 0}
                      onChange={(e) => updateSection({ itemsOffsetX: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-blue"
                    />
                  </div>
                </div>
                <button
                  onClick={() => updateSection({ itemsOffsetX: (section.itemsOffsetX || 0) + 5 })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
                  title="يمين"
                >
                  →
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">عمودياً (فوق/تحت)</span>
                <span className="text-xs font-bold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
                  {section.itemsOffsetY || 0}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateSection({ itemsOffsetY: (section.itemsOffsetY || 0) - 5 })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
                  title="فوق"
                >
                  ↑
                </button>
                <div className="flex-1">
                  <div className="slider-wrapper">
                    <div className="slider-track"></div>
                    <div className="slider-fill" style={{ width: `${Math.min(100, Math.max(0, (((section.itemsOffsetY || 0) + 50) / 100) * 100))}%`, backgroundColor: '#10b981' }}></div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      value={section.itemsOffsetY || 0}
                      onChange={(e) => updateSection({ itemsOffsetY: parseInt(e.target.value, 10) })}
                      className="modern-slider slider-emerald"
                    />
                  </div>
                </div>
                <button
                  onClick={() => updateSection({ itemsOffsetY: (section.itemsOffsetY || 0) + 5 })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
                  title="تحت"
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-600">عرض المربعات (نسبة مئوية)</label>
            <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">
              {section.width !== undefined ? section.width : 100}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSection({ width: Math.max(50, (section.width !== undefined ? section.width : 100) - 5) })}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
              title="تصغير"
            >
              −
            </button>
            <div className="flex-1">
              <div className="slider-wrapper">
                <div className="slider-track"></div>
                <div className="slider-fill" style={{ width: `${(((section.width !== undefined ? section.width : 100) - 50) / (150 - 50)) * 100}%`, backgroundColor: '#a855f7' }}></div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="1"
                  value={section.width !== undefined ? section.width : 100}
                  onChange={(e) => updateSection({ width: parseInt(e.target.value, 10) })}
                  className="modern-slider slider-purple"
                />
              </div>
            </div>
            <button
              onClick={() => updateSection({ width: Math.min(150, (section.width !== undefined ? section.width : 100) + 5) })}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold transition-colors"
              title="توسيع"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-slate-500">توسيع/تصغير عرض المربعات (العناصر) فقط، وليس المساحة التي تحتويها</p>
        </div>
      </div>
    </div>
  );
};
