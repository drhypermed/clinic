/**
 * ستايلات موحّدة لروابط التواصل الاجتماعي بألوانها الرسمية.
 * مشترك بين كرت الطبيب في النتائج (DoctorsResultsSection) ومودال
 * الصفحة التعريفيّه (DoctorDetailsModal) عشان نضمن نفس الهويّة البصريّة.
 *
 * الفلسفة: لون البراند الرسمي + الشعار المملوء الأبيض = أوضح من اللون
 * الحيادي، والمستخدم بيتعرّف على الأيقونه فوراً (Instinct recognition).
 */
import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { LuLink } from 'react-icons/lu';

export type SocialStyle = {
  // الأيقونه نفسها — class name بيوصل من المستهلك (سايز مختلف لكل ماكان: كرت/مودال)
  iconNode: (className: string) => React.ReactNode;
  // كلاس tailwind للخلفيّه (لون البراند الرسمي أو gradient لـInstagram)
  bg: string;
  // الـlabel اللي بيظهر للمستخدم وللـaria-label
  label: string;
};

// لون كل براند زي ما هو في موقعه الرسمي — مينفعش نلاعب فيه عشان UX recognition
export const SOCIAL_STYLES: Record<string, SocialStyle> = {
  facebook: {
    iconNode: (cls) => <FaFacebookF className={cls} />,
    bg: 'bg-[#1877F2]',                                                  // فيسبوك أزرق رسمي
    label: 'Facebook',
  },
  instagram: {
    iconNode: (cls) => <FaInstagram className={cls} />,
    // gradient الإنستاجرام الرسمي (أصفر → برتقالي → وردي → بنفسجي → أزرق)
    bg: 'bg-[linear-gradient(45deg,#FEDA75_0%,#FA7E1E_25%,#D62976_50%,#962FBF_75%,#4F5BD5_100%)]',
    label: 'Instagram',
  },
  tiktok: {
    iconNode: (cls) => <FaTiktok className={cls} />,
    bg: 'bg-black',                                                      // تيك توك أسود
    label: 'TikTok',
  },
  youtube: {
    iconNode: (cls) => <FaYoutube className={cls} />,
    bg: 'bg-[#FF0000]',                                                  // يوتيوب أحمر
    label: 'YouTube',
  },
  x: {
    iconNode: (cls) => <FaXTwitter className={cls} />,
    bg: 'bg-black',                                                      // X براند أسود بعد التحديث
    label: 'X',
  },
  twitter: {
    iconNode: (cls) => <FaXTwitter className={cls} />,
    bg: 'bg-black',
    label: 'X',
  },
  linkedin: {
    iconNode: (cls) => <FaLinkedinIn className={cls} />,
    bg: 'bg-[#0A66C2]',                                                  // لينكد إن أزرق رسمي
    label: 'LinkedIn',
  },
};

// Fallback لمنصّه غير معروفه — لون رمادي محايد بدل ما الكرت يبان مكسور
export const DEFAULT_SOCIAL_STYLE: SocialStyle = {
  iconNode: (cls) => <LuLink className={cls} strokeWidth={2.25} />,
  bg: 'bg-slate-600',
  label: 'رابط',
};

/** بيرجع الستايل المناسب حسب اسم البراند (case-insensitive partial match). */
export const getSocialStyle = (platform?: string): SocialStyle => {
  const key = (platform || '').toLowerCase();
  for (const [name, style] of Object.entries(SOCIAL_STYLES)) {
    if (key.includes(name)) return style;
  }
  return DEFAULT_SOCIAL_STYLE;
};
