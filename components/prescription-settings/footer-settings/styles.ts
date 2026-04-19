/**
 * الملف: styles.ts (Footer)
 * الوصف: يحتوي هذا الملف على تعريفات التنسيق (CSS) الخاصة بأدوات التحكم في الفوتر. 
 * تم استخدامه لضمان مظهر عصري وموحد لمحركات التمرير (Sliders) التي تتحكم في الأبعاد والشفافية، 
 * مع دعم كامل للاتجاه من اليمين إلى اليسار (RTL).
 */

/**
 * أنماط واجهة المستخدم للفوتر (Footer UI Styles)
 * يحتوي على تعريفات CSS-in-JS لتنسيق أدوات التحكم (sliders) في قسم إعدادات الفوتر.
 */

export const FOOTER_SLIDER_STYLES = `
  .slider-wrapper {
      /* حاوية شريط التمرير: تحدد الموضع والحجم وتفعيل اتجاه RTL */
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
      box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(59, 130, 246, 0.15);
      transition: box-shadow 0.15s ease, transform 0.15s ease;
      position: relative;
      z-index: 4;
  }
  .modern-slider::-webkit-slider-thumb:active {
      cursor: grabbing;
      transform: scale(1.15);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
  }
  .modern-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
  }
  .modern-slider::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      border: 4px solid #3b82f6;
      cursor: grab;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2);
      transition: box-shadow 0.15s ease, transform 0.15s ease;
  }
  .modern-slider::-moz-range-thumb:active {
      cursor: grabbing;
      transform: scale(1.15);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .modern-slider::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .modern-slider::-moz-range-track {
      background: transparent;
      height: 10px;
  }
  .slider-blue::-webkit-slider-thumb {
      border-color: #3b82f6;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2), 0 0 0 6px rgba(59, 130, 246, 0.15);
  }
  .slider-blue::-webkit-slider-thumb:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 8px rgba(59, 130, 246, 0.2);
  }
  .slider-blue::-moz-range-thumb {
      border-color: #3b82f6;
  }
`;
