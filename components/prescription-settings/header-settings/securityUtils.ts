
import type { PrescriptionHeaderSettings } from '../../../types';
import {
  readFileAsDataUrl,
  sanitizeRichHtml,
  sanitizeStringArray,
  validateImageFile,
} from '../shared/securityUtils';

const HEADER_HTML_KEYS: Array<keyof PrescriptionHeaderSettings> = [
  'doctorNameHtml',
  'degreesHtml',
  'specialtiesHtml',
];

const HEADER_HTML_ARRAY_KEYS: Array<keyof PrescriptionHeaderSettings> = [
  'degreesHtmlLines',
  'specialtiesHtmlLines',
];

export const validateHeaderImageFile = (file: File): string | null => {
  return validateImageFile(file);
};

export { readFileAsDataUrl };

export const sanitizeHeaderPayload = (
  payload: Partial<PrescriptionHeaderSettings>
): Partial<PrescriptionHeaderSettings> => {
  if (!payload || typeof payload !== 'object') return payload;

  const nextPayload: Partial<PrescriptionHeaderSettings> = { ...payload };
  const mutablePayload = nextPayload as Record<string, unknown>;

  HEADER_HTML_KEYS.forEach((key) => {
    const value = mutablePayload[String(key)];
    if (typeof value === 'string') {
      mutablePayload[String(key)] = sanitizeRichHtml(value);
    }
  });

  HEADER_HTML_ARRAY_KEYS.forEach((key) => {
    mutablePayload[String(key)] = sanitizeStringArray(mutablePayload[String(key)]);
  });

  return nextPayload;
};
