/**
 * الملف: CustomBoxesSection.tsx
 * الوصف: هذا المكون مسؤول عن إدارة "المربعات المخصصة" التي تظهر بجانب القياسات الحيوية. 
 * يسمح للطبيب بإضافة حقول إضافية غير موجودة افتراضياً، وتسميتها، 
 * وتحديد قيم افتراضية لها، وترتيبها حسب الرغبة.
 */

import React from 'react';
import type { CustomBoxesSectionProps } from './types';

export const CustomBoxesSection: React.FC<CustomBoxesSectionProps> = ({
  showCustomBoxes,
  onToggle,
  customBoxes,
  addCustomBox,
  updateCustomBox,
  deleteCustomBox,
  moveCustomBox,
}) => {
  const safeCustomBoxes = Array.isArray(customBoxes) ? customBoxes : [];

  return (
    <div className="mt-6 pt-6 border-t border-slate-200">
      {/* زر التبديل لفتح أو إغلاق قسم المربعات المخصصة */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-brand-50 rounded-xl border-2 border-success-200 hover:border-success-300 transition-all"
      >
        <span className="font-black text-slate-800 flex items-center gap-2">📦 المربعات المخصصة</span>
        <span className={`transition-transform ${showCustomBoxes ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {showCustomBoxes && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-500 mb-4">
            أضف مربعات مخصصة بجانب العلامات الحيوية (مثل: ملاحظات، تشخيص، إلخ)
          </p>

          {safeCustomBoxes.length > 0 && (
            <div className="space-y-3">
              {[...safeCustomBoxes].sort((a, b) => a.order - b.order).map((box) => (
                <div
                  key={box.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    box.enabled ? 'bg-success-50 border-success-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={box.enabled}
                    onChange={(e) => updateCustomBox?.(box.id, { enabled: e.target.checked })}
                    className="w-5 h-5 rounded accent-success-600"
                  />
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      value={box.label}
                      onChange={(e) => updateCustomBox?.(box.id, { label: e.target.value })}
                      className="w-full p-2 border rounded-lg text-sm font-bold text-center bg-white"
                      placeholder="اسم المربع (مثلاً: ملاحظات)"
                    />
                    <input
                      type="text"
                      value={box.value || ''}
                      onChange={(e) => updateCustomBox?.(box.id, { value: e.target.value })}
                      className="w-full p-2 border rounded-lg text-sm text-center bg-white"
                      placeholder="القيمة الافتراضية (اختياري)"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveCustomBox?.(box.id, 'up')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveCustomBox?.(box.id, 'down')}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => deleteCustomBox?.(box.id)}
                    className="p-2 hover:bg-danger-100 rounded text-danger-600"
                    title="حذف"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => addCustomBox?.()}
            className="w-full py-3 bg-gradient-to-r from-success-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            إضافة مربع مخصص
          </button>
        </div>
      )}
    </div>
  );
};
