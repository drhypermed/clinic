/**
 * مكون بنر الإعلانات (AdBanner):
 * يعرض هذا المكون شريطاً إعلانياً دواراً (Carousel) للأطباء/الجمهور.
 *
 * الميزات:
 * 1. دعم الصور الفردية أو المتعددة مع التبديل التلقائي (Auto-rotation).
 * 2. فلترة الإعلانات المنتهية الصلاحية أو غير النشطة تلقائياً.
 * 3. دعم الروابط الخارجية عند الضغط على الإعلان.
 * 4. الحفاظ على نسبة العرض إلى الارتفاع (Aspect Ratio) لضمان عدم تشوه الصور.
 * 5. تقليب يدوي بالسحب (swipe يمين/شمال) + نقاط مباشرة، والـauto-rotation
 *    بيـreset عند أي تدخّل يدوي عشان نفس مدة الأدمن تبدأ من الأول.
 * 6. تخطّي الصور الفاشلة بدل ما يختفي البانر بالكامل لمجرد فشل صورة وسط مجموعة.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTrustedNow } from '../../hooks/useTrustedNow';
import { filterActiveBannerItems } from '../../utils/homepageBannerTime';

// ─ أقل مسافة سحب أفقي (px) عشان نعتبر اللمسة swipe — أقل من كده يبقى مجرد لمسة
//   عرضية. 40px رقم متوازن: مش ضعيف يعمل تقليب غلط، ومش قوي يحتاج جهد.
const SWIPE_DISTANCE_THRESHOLD_PX = 40;
// ─ لو الحركة العمودية أكبر من الأفقية بكتير، يبقى المستخدم بيـscroll الصفحة،
//   مش بيقلّب البانر — نتجاهل اللمسة.
const SWIPE_VERTICAL_TOLERANCE_PX = 60;

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

// ─ مدة الـtimeout الأمني (تُعتبر بعدها الصورة فاشلة لو ما طلقتش onLoad/onError).
//   الـCORS أحياناً بيوقف الصورة بدون أي event، فالـtimeout دا الحماية الوحيدة.
//   زدناها من 10s لـ20s عشان النت البطيء (3G ريفي + صور كبيرة) ميـfailش بالغلط.
const SILENT_FAILURE_TIMEOUT_MS = 20000;

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
  const { nowMs } = useTrustedNow();
  const safeHeight = Math.max(120, Number(displayHeight) || 500);
  const bannerAspectRatio = 1600 / safeHeight;

  // ─ بنفلتر الإعلانات المنتهية/غير النشطة قبل أي شيء — العميل ما يشوفش
  //   صور قديمة الأدمن نسي يحذفها.
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

  const [activeIndex, setActiveIndex] = useState(0);
  // ─ مجموعة indices الصور اللي فشلت (سواء onError أو silent timeout).
  //   بنستخدمها عشان نتخطاها في التقليب — صورة واحدة معطوبة وسط 3 ما تخفيش
  //   البانر بالكامل، نقفز للتانية فوراً.
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  // ─ علامة إن الصورة الحالية تحمّلت بنجاح — تتحكم في الـsilent-failure timer.
  const [currentLoaded, setCurrentLoaded] = useState(false);
  // ─ نحتفظ بنقطة بداية اللمسة (X و Y) عشان نحسب اتجاه/مسافة الـswipe في touchEnd.
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // ─ reset كامل لما قائمة الصور تتغير (الأدمن غيّر البانر، أو مدّة انتهت).
  useEffect(() => {
    setActiveIndex(0);
    setFailedIndices(new Set());
    setCurrentLoaded(false);
  }, [imagesKey]);

  // ─ reset لـcurrentLoaded عند تغيير الصورة (يدوي/تلقائي) — كل صورة جديدة
  //   لازم تطلق onLoad تاني عشان نعتبرها محمّلة.
  useEffect(() => {
    setCurrentLoaded(false);
  }, [activeIndex]);

  // ─ يلاقي أول index صالح في الاتجاه المطلوب (1 = الأمام، -1 = الخلف).
  //   يتخطى الـfailedIndices. يرجع -1 لو كل الصور فشلت.
  const findNextValidIndex = (current: number, direction: 1 | -1): number => {
    const total = allImages.length;
    if (total === 0) return -1;
    for (let step = 1; step <= total; step++) {
      const candidate = ((current + direction * step) % total + total) % total;
      if (!failedIndices.has(candidate)) return candidate;
    }
    return -1;
  };

  const goNext = () => {
    const next = findNextValidIndex(activeIndex, 1);
    if (next !== -1 && next !== activeIndex) setActiveIndex(next);
  };

  const goPrev = () => {
    const prev = findNextValidIndex(activeIndex, -1);
    if (prev !== -1 && prev !== activeIndex) setActiveIndex(prev);
  };

  // ─ يضيف index للـfailed set (idempotent — لو موجود مش بيعمل re-render).
  const markIndexFailed = (idx: number) => {
    setFailedIndices((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  // ─ لو الصورة الحالية بقت في الـfailed set، نقفز للتانية الصالحة فوراً.
  //   ده بيشتغل سواء الفشل من onError أو من silent-timeout.
  useEffect(() => {
    if (!failedIndices.has(activeIndex)) return;
    const total = allImages.length;
    for (let step = 1; step <= total; step++) {
      const candidate = (activeIndex + step) % total;
      if (!failedIndices.has(candidate)) {
        setActiveIndex(candidate);
        return;
      }
    }
    // كل الصور فشلت → البانر هيختفي عبر return null تحت
  }, [activeIndex, failedIndices, allImages.length]);

  // ─ Auto-rotation: الـtimer بيتـreset كل ما activeIndex يتغير (يدوي أو تلقائي)،
  //   فلو المستخدم ضغط سهم/dot → نفس مدة الأدمن تبدأ من الأول.
  //   لو مفيش غير صورة صالحة واحدة، مفيش تقليب أصلاً.
  useEffect(() => {
    const validCount = allImages.length - failedIndices.size;
    if (validCount <= 1) return;
    const delay = Math.max(1, rotationSeconds) * 1000;
    const timer = window.setTimeout(goNext, delay);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, allImages.length, failedIndices, rotationSeconds, imagesKey]);

  // ─ Safety net للفشل الصامت (CORS بيوقف الصورة بدون onError).
  //   لو الصورة ما حملتش خلال 20s، نعتبرها فاشلة ونتخطاها. الـtimer
  //   بيتلغي تلقائياً لو currentLoaded بقت true قبل الـ20s.
  useEffect(() => {
    if (currentLoaded) return;
    const timer = window.setTimeout(() => {
      markIndexFailed(activeIndex);
    }, SILENT_FAILURE_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [currentLoaded, activeIndex, imagesKey]);

  // لو كل الصور فشلت أو ما فيش صور = نخفي البانر تماماً
  if (allImages.length === 0 || failedIndices.size >= allImages.length) return null;

  const currentImage = allImages[activeIndex];
  const currentItem = activeItems[activeIndex] || null;
  const hasPerImageItems = activeItems.length > 0;
  const resolvedLink = hasPerImageItems
    ? (currentItem?.targetUrl || '').trim()
    : (link || '').trim();
  const resolvedAlt = currentItem?.title || altText;

  // عدد الصور الصالحة — لإظهار/إخفاء عناصر التحكم (نقاط)
  const validImagesCount = allImages.length - failedIndices.size;

  // ─ بداية اللمسة: نسجّل النقطة فقط، من غير ما نوقف الحدث (عشان الـscroll يفضل شغّال).
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (validImagesCount <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  // ─ نهاية اللمسة: نحسب الفرق الأفقي/العمودي. لو السحب أفقي وكافٍ، نقلّب.
  //   في RTL: السحب لليمين = نرجع للسابق، السحب للشمال = نروح للتالي
  //   (نفس سلوك أي قارئ RTL — يدك بتمشي مع اتجاه القراءة).
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || validImagesCount <= 1) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaY) > SWIPE_VERTICAL_TOLERANCE_PX) return; // المستخدم بيـscroll
    if (Math.abs(deltaX) < SWIPE_DISTANCE_THRESHOLD_PX) return; // لمسة قصيرة
    if (deltaX > 0) goPrev(); // سحب يمين → السابق
    else goNext();            // سحب شمال → التالي
  };

  const BannerContent = (
    <div
      className={`relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: `${bannerAspectRatio}` }}
      >
        {/* key على activeIndex بيخلي React يعيد ركّب الـimg لما الصورة تتغير
            — ده يضمن إن onLoad/onError يـtriggerوا للصورة الجديدة فعلاً. */}
        <img
          key={`banner-img-${activeIndex}`}
          src={currentImage}
          alt={resolvedAlt}
          className="w-full h-full object-cover"
          onLoad={() => setCurrentLoaded(true)}
          onError={() => markIndexFailed(activeIndex)}
          loading="lazy"
        />
      </div>

      {/* نقاط للقفز المباشر لصورة معينة — بنخفي نقاط الصور الفاشلة.
          التقليب اليدوي بقى بالـswipe (يمين/شمال) من اللمس على الموبايل،
          والنقاط للوصول السريع لصورة محددة. */}
      {validImagesCount > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/35 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
          {allImages.map((_, idx) => {
            if (failedIndices.has(idx)) return null;
            return (
              <button
                key={`banner-dot-${idx}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`إعلان ${idx + 1}`}
              />
            );
          })}
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
