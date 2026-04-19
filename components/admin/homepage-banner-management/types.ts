/**
 * تعريفات الأنواع (Banner Management Types)
 * تحدد الهيكل البرمجي لصور البانر (BannerItem) وبيانات الحالة العامة (HomeBannerData).
 */

export interface BannerItem {
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  targetUrl: string;
  isActive: boolean;
  expiresAt: string;
}

export interface HomeBannerData {
  items: BannerItem[];
  imageUrls: string[];
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  targetUrl: string;
  isActive: boolean;
  bannerHeight: number;
  rotationSeconds: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HomepageBannerManagementPanelProps {
  adminEmail?: string | null;
  settingsDocId?: string;
  panelTitle?: string;
  panelDescription?: string;
}

export interface CropAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}
