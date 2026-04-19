/**
 * الملف: VitalsListSection.tsx
 * الوصف: هذا المكون مسؤول عن عرض وإدارة قائمة العلامات الحيوية الافتراضية. 
 * يسمح للمستخدم بتفعيل/تعطيل كل علامة، تعديل مسمياتها بالعربية والإنجليزية، 
 * وتغيير ترتيب ظهورها عبر الأسهم (Up/Down).
 */

import React from 'react';
import type { VitalsListSectionProps } from './types';

export const VitalsListSection: React.FC<VitalsListSectionProps> = ({
  vitals,
  updateVital,
  moveVital,
}) => {
  return (
    <>
      <p className="text-sm text-slate-500 mb-4">
        اختر القياسات والعلامات الحيوية التي تريد إظهارها في الروشتة ورتبها حسب أولويتك
      </p>

      {/* عرض قائمة العلامات الحيوية مرتبة حسب حقل order */}
      <div className="space-y-3">
        {[...vitals].sort((a, b) => a.order - b.order).map((vital) => (
          <div
            key={vital.key}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              vital.enabled ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* خانة الاختيار لتفعيل أو تعطيل العلامة الحيوية */}
            <input
              type="checkbox"
              checked={vital.enabled}
              onChange={(e) => updateVital(vital.key, { enabled: e.target.checked })}
              className="w-5 h-5 rounded accent-blue-600"
            />
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input
                type="text"
                value={vital.label}
                onChange={(e) => updateVital(vital.key, { label: e.target.value })}
                className="p-2 border rounded-lg text-sm font-bold text-center"
                placeholder="Label"
                dir="ltr"
              />
              <input
                type="text"
                value={vital.labelAr}
                onChange={(e) => updateVital(vital.key, { labelAr: e.target.value })}
                className="p-2 border rounded-lg text-sm font-bold text-center"
                placeholder="التسمية"
              />
              <input
                type="text"
                value={vital.unit}
                onChange={(e) => updateVital(vital.key, { unit: e.target.value })}
                className="p-2 border rounded-lg text-sm text-center"
                placeholder="الوحدة"
                dir="ltr"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveVital(vital.key, 'up')}
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => moveVital(vital.key, 'down')}
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
