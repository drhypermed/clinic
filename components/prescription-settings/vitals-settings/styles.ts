/**
 * الملف: styles.ts (Vitals)
 * الوصف: تعريفات التنسيق البرمجية الخاصة بأشرطة التمرير (Sliders) في قسم العلامات الحيوية. 
 * تم تخصيص ألوان مميزة لكل شريط (أرجواني، أزرق، زمردي، أحمر، رمادي، تيج) 
 * لسهولة التمييز البصري بين مختلف إعدادات التحكم.
 */

export const VITALS_SLIDER_STYLES = `
  .slider-wrapper {
    position: relative;
    width: 100%;
    height: 14px;
    display: flex;
    align-items: center;
    direction: rtl;
  }
  .slider-track {
    position: absolute;
    width: 100%;
    height: 10px;
    border-radius: 10px;
    background: #e2e8f0;
    z-index: 1;
    left: 0;
    right: 0;
  }
  .slider-fill {
    position: absolute;
    height: 10px;
    border-radius: 10px;
    right: 0;
    z-index: 2;
    transition: none;
    will-change: width;
  }
  .modern-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 14px;
    border-radius: 0;
    background: transparent;
    outline: none;
    cursor: pointer;
    position: relative;
    z-index: 3;
    margin: 0;
    padding: 0;
    direction: rtl;
  }
  .modern-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #3b82f6;
    cursor: grab;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(59, 130, 246, 0.15);
    transition: box-shadow 0.15s ease, transform 0.15s ease;
    position: relative;
    z-index: 4;
  }
  .modern-slider::-webkit-slider-thumb:active {
    cursor: grabbing;
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
  }
  .modern-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
  }
  .modern-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #3b82f6;
    cursor: grab;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.15s ease, transform 0.15s ease;
  }
  .modern-slider::-moz-range-thumb:active {
    cursor: grabbing;
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .modern-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  .modern-slider::-moz-range-track {
    background: transparent;
    height: 10px;
  }
  .slider-purple::-webkit-slider-thumb {
    border-color: #a855f7;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(168, 85, 247, 0.15);
  }
  .slider-purple::-webkit-slider-thumb:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(168, 85, 247, 0.2);
  }
  .slider-purple::-moz-range-thumb {
    border-color: #a855f7;
  }
  .slider-blue::-webkit-slider-thumb {
    border-color: #3b82f6;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(59, 130, 246, 0.15);
  }
  .slider-blue::-webkit-slider-thumb:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
  }
  .slider-blue::-moz-range-thumb {
    border-color: #3b82f6;
  }
  .slider-emerald::-webkit-slider-thumb {
    border-color: #10b981;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(16, 185, 129, 0.15);
  }
  .slider-emerald::-webkit-slider-thumb:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(16, 185, 129, 0.2);
  }
  .slider-emerald::-moz-range-thumb {
    border-color: #10b981;
  }
  .slider-red::-webkit-slider-thumb {
    border-color: #dc2626;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(220, 38, 38, 0.15);
  }
  .slider-red::-webkit-slider-thumb:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(220, 38, 38, 0.2);
  }
  .slider-red::-moz-range-thumb {
    border-color: #dc2626;
  }
  .slider-slate::-webkit-slider-thumb {
    border-color: #64748b;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(100, 116, 139, 0.15);
  }
  .slider-slate::-webkit-slider-thumb:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(100, 116, 139, 0.2);
  }
  .slider-slate::-moz-range-thumb {
    border-color: #64748b;
  }
  .slider-teal::-webkit-slider-thumb {
    border-color: #14b8a6;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 0 6px rgba(20, 184, 166, 0.15);
  }
  .slider-teal::-webkit-slider-thumb:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(20, 184, 166, 0.2);
  }
  .slider-teal::-moz-range-thumb {
    border-color: #14b8a6;
  }
`;
