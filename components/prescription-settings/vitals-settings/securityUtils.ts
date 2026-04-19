/**
 * الملف: securityUtils.ts (Vitals)
 * الوصف: مجموعة من الأدوات الأمنية المخصصة لتأمين بيانات قسم العلامات الحيوية. 
 * تتضمن دوال لتعقيم النصوص البسيطة، التحقق من صحة الألوان بصيغة Hex، 
 * وتدقيق وقص (Clamp) القيم الرقمية لضمان بقائها ضمن النطاقات المسموح بها.
 */

import type { VitalsSectionSettings } from '../../../types';
import { CONTROL_CHARS_REGEX as CONTROL_CHAR_REGEX } from '../../../utils/controlChars';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** تعقيم النصوص البسيطة بإزالة الأحرف التحكمية غير المرئية */
export const sanitizePlainText = (value: string): string => {
  return String(value || '').replace(CONTROL_CHAR_REGEX, '');
};

const sanitizeHexColor = (value: unknown, fallback: string): string => {
  const normalized = String(value || '').trim();
  return HEX_COLOR_REGEX.test(normalized) ? normalized : fallback;
};

/** 
 * تعقيم وتحصين البيانات المرسلة لقسم العلامات الحيوية 
 * تقوم هذه الدالة بفحص كامل الكائن (Payload) والتأكد من أن كل حقل (نصوص، ألوان، أرقام) 
 * يطابق المعايير المطلوبة قبل اعتماده.
 */
export const sanitizeVitalsSectionPayload = (
  payload: Partial<VitalsSectionSettings>
): Partial<VitalsSectionSettings> => {
  if (!payload || typeof payload !== 'object') return payload;

  const nextPayload: Partial<VitalsSectionSettings> = { ...payload };

  if ('title' in nextPayload && typeof nextPayload.title === 'string') {
    nextPayload.title = sanitizePlainText(nextPayload.title);
  }

  if ('titleUnderlineColor' in nextPayload) {
    nextPayload.titleUnderlineColor = sanitizeHexColor(nextPayload.titleUnderlineColor, '#dc2626');
  }
  if ('backgroundColor' in nextPayload) {
    nextPayload.backgroundColor = sanitizeHexColor(nextPayload.backgroundColor, '#f1f5f9');
  }
  if ('itemBackgroundColor' in nextPayload) {
    nextPayload.itemBackgroundColor = sanitizeHexColor(nextPayload.itemBackgroundColor, '#ffffff');
  }
  if ('borderColor' in nextPayload) {
    nextPayload.borderColor = sanitizeHexColor(nextPayload.borderColor, '#cbd5e1');
  }
  if ('itemBorderColor' in nextPayload) {
    nextPayload.itemBorderColor = sanitizeHexColor(nextPayload.itemBorderColor, '#cbd5e1');
  }

  if ('titleUnderlineOpacity' in nextPayload) {
    nextPayload.titleUnderlineOpacity = clamp(toNumber(nextPayload.titleUnderlineOpacity, 1), 0, 1);
  }
  if ('backgroundColorOpacity' in nextPayload) {
    nextPayload.backgroundColorOpacity = clamp(toNumber(nextPayload.backgroundColorOpacity, 1), 0, 1);
  }
  if ('itemBackgroundColorOpacity' in nextPayload) {
    nextPayload.itemBackgroundColorOpacity = clamp(toNumber(nextPayload.itemBackgroundColorOpacity, 1), 0, 1);
  }
  if ('borderOpacity' in nextPayload) {
    nextPayload.borderOpacity = clamp(toNumber(nextPayload.borderOpacity, 1), 0, 1);
  }
  if ('itemBorderColorOpacity' in nextPayload) {
    nextPayload.itemBorderColorOpacity = clamp(toNumber(nextPayload.itemBorderColorOpacity, 1), 0, 1);
  }

  if ('titleUnderlineWidth' in nextPayload) {
    nextPayload.titleUnderlineWidth = clamp(Math.round(toNumber(nextPayload.titleUnderlineWidth, 1)), 1, 10);
  }
  if ('itemsOffsetX' in nextPayload) {
    nextPayload.itemsOffsetX = clamp(Math.round(toNumber(nextPayload.itemsOffsetX, 0)), -50, 50);
  }
  if ('itemsOffsetY' in nextPayload) {
    nextPayload.itemsOffsetY = clamp(Math.round(toNumber(nextPayload.itemsOffsetY, 0)), -50, 50);
  }
  if ('width' in nextPayload) {
    nextPayload.width = clamp(Math.round(toNumber(nextPayload.width, 100)), 50, 150);
  }

  return nextPayload;
};

