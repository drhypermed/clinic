/**
 * الملف: usePublicBookingShare.ts (Hook)
 * الوصف: نظام "المشاركة والانتشار". 
 * يتيح هذا الـ Hook للمريض (أو الطبيب عند استخدامه للفورم) نشر رابط الحجز 
 * بسهولة عبر: 
 * - نسخ الرابط للحافظة (Clipboard). 
 * - فتح نوافذ مشاركة مباشرة لمنصات (واتساب، فيسبوك، إكس، جي ميل). 
 * - صياغة رسائل دعائية تلقائية تشمل اسم الطبيب وتخصصه.
 */
import { useState } from 'react';

import type { SharePlatform } from '../../../types';
import { sanitizeExternalUrl } from './securityUtils';

type DoctorSummary = { doctorName: string; doctorSpecialty: string };

export const usePublicBookingShare = (doctorSummary: DoctorSummary) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const openExternalShareWindow = (url: string, width = 600, height = 400) => {
    const safeUrl = sanitizeExternalUrl(url);
    if (!safeUrl || typeof window === 'undefined') return;
    window.open(safeUrl, '_blank', `noopener,noreferrer,width=${width},height=${height}`);
  };

  const shareToSocialMedia = (platform: SharePlatform) => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const title = `احجز موعد مع ${doctorSummary.doctorName || 'الطبيب'}`;
    const text = `احجز موعد مع ${doctorSummary.doctorName || 'الطبيب'} - ${doctorSummary.doctorSpecialty || 'متخصص'} عبر موقعنا`;

    if (platform === 'facebook') {
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
      openExternalShareWindow(facebookShareUrl);
      return;
    }

    if (platform === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
      openExternalShareWindow(whatsappUrl, 560, 520);
      return;
    }

    if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      openExternalShareWindow(twitterUrl);
      return;
    }

    if (platform === 'gmail') {
      const gmailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
      const safeMailto = sanitizeExternalUrl(gmailUrl);
      if (safeMailto) window.location.href = safeMailto;
      return;
    }

    if (platform === 'copy') {
      const clipboard = navigator?.clipboard;
      if (!clipboard || typeof clipboard.writeText !== 'function') return;
      clipboard
        .writeText(url)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
          setShowShareMenu(false);
        })
        .catch(() => {});
    }
  };

  return {
    linkCopied,
    showShareMenu,
    setShowShareMenu,
    shareToSocialMedia,
  };
};
