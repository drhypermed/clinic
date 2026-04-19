
import type { PrescriptionFooterSettings } from '../../../types';
import { readFileAsDataUrl, sanitizeRichHtml, validateImageFile } from '../shared/securityUtils';

const FOOTER_HTML_KEYS: Array<keyof PrescriptionFooterSettings> = [
  'addressHtml',
  'workingHoursHtml',
  'consultationPeriodHtml',
  'phoneLabelHtml',
  'phoneNumberHtml',
  'whatsappLabelHtml',
  'whatsappNumberHtml',
  'socialMediaLabelHtml',
  'socialMediaHtml',
];

export const validateFooterImageFile = (file: File): string | null => {
  return validateImageFile(file);
};

export { readFileAsDataUrl };

export const sanitizeFooterPayload = (
  payload: Partial<PrescriptionFooterSettings>
): Partial<PrescriptionFooterSettings> => {
  if (!payload || typeof payload !== 'object') return payload;

  const nextPayload: Partial<PrescriptionFooterSettings> = { ...payload };
  const mutablePayload = nextPayload as Record<string, unknown>;

  FOOTER_HTML_KEYS.forEach((key) => {
    const value = mutablePayload[String(key)];
    if (typeof value === 'string') {
      mutablePayload[String(key)] = sanitizeRichHtml(value);
    }
  });

  return nextPayload;
};
