/**
 * مكون بنر الإعلانات (AdBanner):
 * يعرض هذا المكون شريطاً إعلانياً دواراً (Carousel) للأطباء.
 * الميزات:
 * 1. دعم الصور الفردية أو المتعددة مع التبديل التلقائي (Auto-rotation).
 * 2. فلترة الإعلانات المنتهية الصلاحية أو غير النشطة تلقائياً.
 * 3. دعم الروابط الخارجية عند الضغط على الإعلان.
 * 4. الحفاظ على نسبة العرض إلى الارتفاع (Aspect Ratio) لضمان عدم تشوه الصور.
 */

import React, { useState } from 'react';
import { useTrustedNow } from '../../hooks/useTrustedNow';
import { filterActiveBannerItems } from '../../utils/homepageBannerTime';

interface AdBannerItem {
  imageUrl: string; // رابط الصورة
  title?: string; // عنوان الإعلان (يستخدم كـ Alt text)
  subtitle?: string;
  ctaText?: string;
  targetUrl?: string; // الرابط الذي يفتح عند الضغط
  isActive?: boolean; // هل الإعلان نشط؟
  expiresAt?: string; // تاريخ انتهاء الصلاحية
}

interface AdBannerProps {
  imageUrl?: string;
  imageUrls?: string[];
  items?: AdBannerItem[];
  altText?: string;
  link?: string;
  className?: string;
  displayHeight?: number;
  rotationSeconds?: number;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  imageUrl,
  imageUrls,
  items,
  altText = 'إعلان',
  link,
  className = '',
  displayHeight,
  rotationSeconds = 5,
}) => {
  const [imageError, setImageError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // إضافي: نتتبّع إذا كانت الصورة الحالية تحمّلت فعلاً — علشان ما نرسمش
  // الحاوية بالـ aspect-ratio قبل التحميل (ده كان بيخلق فراغاً لو الصوره فشلت بصمت)
  const [imageLoaded, setImageLoaded] = useState(false);
  const { nowMs } = useTrustedNow();
  const safeHeight = Math.max(120, Number(displayHeight) || 500);
  const bannerAspectRatio = 1600 / safeHeight;

  const activeItems = filterActiveBannerItems(Array.isArray(items) ? items : [], nowMs);

  const allImages = (activeItems.length > 0
    ? activeItems.map((item) => item.imageUrl)
    : Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : imageUrl
        ? [imageUrl]
        : []
  ).filter(Boolean);
  const imagesKey = allImages.join('|');

  const currentItem = activeItems[activeIndex] || null;
  const hasPerImageItems = activeItems.length > 0;
  const resolvedLink = hasPerImageItems
    ? (currentItem?.targetUrl || '').trim()
    : (link || '').trim();
  const resolvedAlt = currentItem?.title || altText;

  const currentImage = allImages[activeIndex] || '';

  React.useEffect(() => {
    setActiveIndex(0);
    setImageError(false);
    // نعيد imageLoaded لـfalse لما مصدر الصور يتغير — البانر الجديد ما يظهرش حتى يتأكد التحميل
    setImageLoaded(false);
  }, [imagesKey]);

  // لو الصورة ما تحمّلتش خلال 10 ثواني (مثلاً CORS يمنعها بصمت) نعتبرها فشلت
  // بدل ما نسيب فراغ بدون onError. ده بيحمي من "البانر مش بيظهر بس مساحته موجودة".
  React.useEffect(() => {
    if (!currentImage || imageLoaded || imageError) return;
    const timer = window.setTimeout(() => setImageError(true), 10000);
    return () => window.clearTimeout(timer);
  }, [currentImage, imageLoaded, imageError]);

  React.useEffect(() => {
    if (allImages.length <= 1) return;
    const nextDelay = Math.max(1, rotationSeconds) * 1000;
    const timeout = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % allImages.length);
    }, nextDelay);
    return () => window.clearTimeout(timeout);
  }, [allImages.length, rotationSeconds, activeIndex, imagesKey]);

  if (imageError || !currentImage) return null;

  // لو الصورة لسه ما تحمّلتش: نرسم img خفي خارج الـlayout — بس يشغل onLoad
  // بدون ما ياخد مساحه في الصفحه. ده بيمنع الفراغ اللي كان بيظهر لما الصورة تفشل بصمت.
  if (!imageLoaded) {
    return (
      <img
        src={currentImage}
        alt=""
        aria-hidden="true"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />
    );
  }

  const BannerContent = (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${bannerAspectRatio}`,
        }}
      >
      <img
        src={currentImage}
        alt={resolvedAlt}
        className="w-full h-full object-cover"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
      </div>
      {allImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/35 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
          {allImages.map((_, idx) => (
            <button
              key={`banner-dot-${idx}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
              aria-label={`banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (resolvedLink) {
    return (
      <a href={resolvedLink} target="_blank" rel="noopener noreferrer" className="block">
        {BannerContent}
      </a>
    );
  }

  return BannerContent;
};
