/**
 * أدوات الأمان والتطهير (Banner Security Utils)
 * تحتوي على الدوال المسؤولة عن فحص الروابط، تنظيف النصوص من الرموز الغريبة،
 * والتحقق من سلامة وصحة كائنات البانر (Sanitization) قبل حفظها.
 */

import { BannerItem } from './types';
import { getDefaultExpiryDateTimeLocal } from './constants';
import { toDateTimeLocalInputValue } from '../../../utils/homepageBannerTime';
import { mapFirebaseActionError } from '../../../utils/firebaseErrorMap';
import { CONTROL_CHARS_REGEX } from '../../../utils/controlChars';

const SETTINGS_DOC_ID_REGEX = /^[A-Za-z0-9_-]{3,80}$/;

export const isDataUrl = (value: string) => value.startsWith('data:image');

export const sanitizeText = (value: unknown, maxLength: number) =>
  String(value || '')
    .replace(CONTROL_CHARS_REGEX, ' ')
    .trim()
    .slice(0, maxLength);

const isSafeLinkUrl = (value: string) => {
  const normalized = String(value || '').trim();
  if (!normalized) return false;
  if (normalized.startsWith('/')) return true;
  return /^https?:\/\//i.test(normalized);
};

export const sanitizeTargetUrl = (value: string) => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  return isSafeLinkUrl(normalized) ? normalized : '';
};

export const sanitizeSettingsDocId = (value: string) => {
  const normalized = String(value || '').trim();
  if (!SETTINGS_DOC_ID_REGEX.test(normalized)) return null;
  return normalized;
};

const sanitizeBannerItem = (item: Partial<BannerItem>): BannerItem | null => {
  const imageUrl = sanitizeText(item.imageUrl, 2000);
  if (!imageUrl) return null;

  return {
    imageUrl,
    title: sanitizeText(item.title || 'إعلان مميز', 120) || 'إعلان مميز',
    subtitle: sanitizeText(item.subtitle || '', 240),
    ctaText: sanitizeText(item.ctaText || 'اعرف المزيد', 80) || 'اعرف المزيد',
    targetUrl: sanitizeTargetUrl(item.targetUrl || ''),
    isActive: item.isActive !== false,
    expiresAt: toDateTimeLocalInputValue(sanitizeText(item.expiresAt || getDefaultExpiryDateTimeLocal(), 40)) || getDefaultExpiryDateTimeLocal(),
  };
};

export const sanitizeBannerItems = (items: Partial<BannerItem>[]) =>
  items
    .map((item) => sanitizeBannerItem(item))
    .filter((item): item is BannerItem => Boolean(item));

/** رسالة الخطأ الآمنة لعمليات البانر (تعيد تصدير الدالة المشتركة). */
export const getSafeErrorMessage = mapFirebaseActionError;
