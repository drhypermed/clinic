/**
 * الدوال المساعدة للهيدر (Header Helpers)
 * توفر أدوات لتحليل الأنماط الجاهزة (Presets) وتحويلها إلى كائنات TextStyle قابلة للاستخدام.
 */

import type { PrescriptionHeaderSettings, TextStyle } from '../../../types';
import { stripHtml } from '../utils';

/** 
 * تحديث سطر معين من الدرجات العلمية 
 * يتم مزامنة النسخة النصية (للبحث) مع نسخة الـ HTML (للعرض المنسق)
 */
export function updateDegreesLine(
  header: PrescriptionHeaderSettings,
  updateHeader: (u: Partial<PrescriptionHeaderSettings>) => void,
  idx: number,
  html: string
) {
  const newHtml = [...(header.degreesHtmlLines || [])];
  while (newHtml.length <= idx) newHtml.push('');
  newHtml[idx] = html;
  
  const newDegrees = [...(header.degrees || [])];
  while (newDegrees.length <= idx) newDegrees.push('');
  // استخلاص النص المجرد من الـ HTML للتخزين النظيف
  newDegrees[idx] = stripHtml(html);
  
  updateHeader({ degreesHtmlLines: newHtml, degrees: newDegrees });
}

/** تحديث سطر معين من تنسيقات الدرجات العلمية */
export function updateDegreesStyle(
  header: PrescriptionHeaderSettings,
  updateHeader: (u: Partial<PrescriptionHeaderSettings>) => void,
  idx: number,
  style: TextStyle
) {
  const arr = [...(header.degreesLineStyles || [])];
  while (arr.length <= idx) arr.push({});
  arr[idx] = style;
  updateHeader({ degreesLineStyles: arr });
}

export function updateSpecialtiesLine(
  header: PrescriptionHeaderSettings,
  updateHeader: (u: Partial<PrescriptionHeaderSettings>) => void,
  idx: number,
  html: string
) {
  const newHtml = [...(header.specialtiesHtmlLines || [])];
  while (newHtml.length <= idx) newHtml.push('');
  newHtml[idx] = html;
  const newSpec = [...(header.specialties || [])];
  while (newSpec.length <= idx) newSpec.push('');
  newSpec[idx] = stripHtml(html);
  updateHeader({ specialtiesHtmlLines: newHtml, specialties: newSpec });
}

export function updateSpecialtiesStyle(
  header: PrescriptionHeaderSettings,
  updateHeader: (u: Partial<PrescriptionHeaderSettings>) => void,
  idx: number,
  style: TextStyle
) {
  const arr = [...(header.specialtiesLineStyles || [])];
  while (arr.length <= idx) arr.push({});
  arr[idx] = style;
  updateHeader({ specialtiesLineStyles: arr });
}

/** تنظيف خصائص المؤثرات الخاصة من الستايل (مثل الظل والحدود والنقوش) قبل تطبيق ستايل جديد */
const clearPresetEffects = (baseStyle?: TextStyle): TextStyle => {
  const next = { ...(baseStyle || {}) };
  delete next.textStrokeWidth;
  delete next.textStrokeColor;
  delete next.textBgColor;
  delete next.textBgOpacity;
  delete next.textBgRadius;
  delete next.textBgPadding;
  delete next.textBgPaddingTop;
  delete next.textBgPaddingRight;
  delete next.textBgPaddingBottom;
  delete next.textBgPaddingLeft;
  delete next.textBgBorderWidth;
  delete next.textBgBorderColor;
  return next;
};

/** 
 * تحليل نص الستايل الجاهز (CSS String) وتحويله إلى كائن TextStyle
 * يستخدم عنصر عابر (Probe) لتحليل خصائص الـ CSS بدقة المتصفح
 */
export const parsePresetToTextStyle = (styleString: string, baseStyle?: TextStyle): TextStyle => {
  const cleaned = (styleString || '').trim();
  if (!cleaned) return clearPresetEffects(baseStyle);
  if (typeof document === 'undefined') return { ...(baseStyle || {}) };

  const probe = document.createElement('span');
  probe.style.cssText = cleaned;

  const next: TextStyle = { ...(baseStyle || {}) };
  if (probe.style.color) next.color = probe.style.color;
  if (probe.style.fontFamily) next.fontFamily = probe.style.fontFamily;
  if (probe.style.fontWeight) next.fontWeight = probe.style.fontWeight;
  if (probe.style.fontStyle) next.fontStyle = probe.style.fontStyle as 'normal' | 'italic';
  if (probe.style.fontSize) next.fontSize = probe.style.fontSize;

  const letterSpacing = parseFloat(probe.style.letterSpacing || '');
  if (Number.isFinite(letterSpacing)) next.letterSpacing = letterSpacing;

  const lineHeight = parseFloat(probe.style.lineHeight || '');
  if (Number.isFinite(lineHeight)) next.lineHeight = lineHeight;

  if (probe.style.backgroundColor) {
    next.textBgColor = probe.style.backgroundColor;
    next.textBgOpacity = 1;
  }
  const borderRadius = parseFloat(probe.style.borderRadius || '');
  if (Number.isFinite(borderRadius)) next.textBgRadius = borderRadius;

  const borderWidth = parseFloat(probe.style.borderWidth || '');
  if (Number.isFinite(borderWidth)) next.textBgBorderWidth = borderWidth;
  if (probe.style.borderColor) next.textBgBorderColor = probe.style.borderColor;

  const padding = parseFloat(probe.style.padding || '');
  if (Number.isFinite(padding)) next.textBgPadding = padding;

  const webkitStrokeWidth = parseFloat((probe.style as any).webkitTextStrokeWidth || '');
  if (Number.isFinite(webkitStrokeWidth)) next.textStrokeWidth = webkitStrokeWidth;
  const webkitStrokeColor = (probe.style as any).webkitTextStrokeColor || '';
  if (webkitStrokeColor) next.textStrokeColor = webkitStrokeColor;

  return next;
};

