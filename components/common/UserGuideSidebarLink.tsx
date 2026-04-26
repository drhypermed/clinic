/**
 * UserGuideSidebarLink — زر "دليل الاستخدام" للـsidebars داخل التطبيق.
 *
 * نفس الدليل المتاح برا (/user-guide) — بنوديه للمستخدم بعد تسجيل الدخول من
 * أي sidebar. الـcomponent ده هو المصدر الوحيد للـnavigation logic + النص
 * + الأيقونة، عشان لو غيّرنا المسار أو الاسم لاحقاً نعدّل في مكان واحد.
 *
 * الستايل بيتغيّر حسب variant (الـsidebars عندها themes مختلفة)، بس الـlogic
 * نفسه ثابت — مفيش تكرار للكود.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookOpen } from 'react-icons/fa6';

interface UserGuideSidebarLinkProps {
  /** الستايل المناسب للـsidebar:
   *  - 'doctor': الـsidebar الرئيسي للأطباء/السكرتاريات (slate خفيف)
   *  - 'admin' : sidebar لوحة الأدمن (brand blue) */
  variant: 'doctor' | 'admin';
  /** يتنفّذ قبل الـnavigate — مفيد لقفل قائمة الموبايل قبل الانتقال */
  onBeforeNavigate?: () => void;
}

const USER_GUIDE_PATH = '/user-guide';
const LABEL = 'دليل الاستخدام';

export const UserGuideSidebarLink: React.FC<UserGuideSidebarLinkProps> = ({
  variant,
  onBeforeNavigate,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onBeforeNavigate?.();
    navigate(USER_GUIDE_PATH);
  };

  if (variant === 'admin') {
    // ستايل compact يطابق زر "العودة للعيادة" + "تسجيل الخروج" في DashboardSidebar
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
      >
        <FaBookOpen className="w-3.5 h-3.5" />
        {LABEL}
      </button>
    );
  }

  // variant === 'doctor' — نفس نمط زر تسجيل الخروج في Sidebar.tsx بس بـtheme أزرق
  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-transparent group"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
        <FaBookOpen className="w-5 h-5" />
      </div>
      <span className="font-bold text-sm">{LABEL}</span>
    </button>
  );
};
