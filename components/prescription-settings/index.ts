/**
 * الملف: index.ts (Prescription Settings)
 * الوصف: نقطة التصدير المركزية لمجلد إعدادات الروشتة. 
 * يُنظم هذا الملف عملية الوصول للمكونات والأنواع، مما يجعل استيرادها 
 * في أجزاء التطبيق الأخرى أكثر ترتيباً وسهولة (Clean Export Pattern).
 */

export { CollapsibleSection } from './CollapsibleSection';
export { PrescriptionSettingsPreview } from './PrescriptionSettingsPreview';
export { PrescriptionSettingsTabs } from './PrescriptionSettingsTabs';
export type { SettingsTabId } from './PrescriptionSettingsTabs';
export { HeaderSettingsTab } from './header-settings/HeaderSettingsTab';
export { FooterSettingsTab } from './footer-settings/FooterSettingsTab';
export { VitalsSettingsTab } from './vitals-settings/VitalsSettingsTab';
export { usePrescriptionSettingsForm } from './usePrescriptionSettingsForm';
export { stripHtml, LABEL_CLASS, PREVIEW_WIDTH_PX, getPaperDimensions, getPaperWidthPx, getPaperMargins, applyPaperSizeCssVars, injectPrintPageStyle, registerBeforePrintHandler, MM_TO_PX } from './utils';
export { PaperSizeSelector } from './PaperSizeSelector';
export { PrescriptionSettingsPage } from './PrescriptionSettingsPage';

