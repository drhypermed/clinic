/**
 * الثوابت والدوال المساعدة (Banner Management Constants)
 * تحتوي على الإعدادات الافتراضية للبانر، منطق حساب تواريخ الانتهاء،
 * ودوال بناء هياكل البيانات الافتراضية للصور.
 */

import { BannerItem, HomeBannerData } from './types';
import { getBannerExpiryInfoText, toDateTimeLocalInputValue } from '../../../utils/homepageBannerTime';

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;
export const BANNER_WIDTH = 1600;
export const DEFAULT_BANNER_HEIGHT = 500;
export const DEFAULT_ROTATION_SECONDS = 5;

export const getDefaultExpiryDateTimeLocal = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return toDateTimeLocalInputValue(date);
};

export const getExpiryInfo = (expiresAt?: string, nowMs = Date.now()) => getBannerExpiryInfoText(expiresAt, nowMs);

export const createDefaultItem = (imageUrl: string): BannerItem => ({
  imageUrl,
  title: 'إعلان مميز',
  subtitle: '',
  ctaText: 'اعرف المزيد',
  targetUrl: '',
  isActive: true,
  expiresAt: getDefaultExpiryDateTimeLocal(),
});

export const getDefaultFormData = (): HomeBannerData => ({
  items: [],
  imageUrls: [],
  imageUrl: '',
  title: 'إعلان مميز',
  subtitle: '',
  ctaText: 'اعرف المزيد',
  targetUrl: '',
  isActive: true,
  bannerHeight: DEFAULT_BANNER_HEIGHT,
  rotationSeconds: DEFAULT_ROTATION_SECONDS,
});
