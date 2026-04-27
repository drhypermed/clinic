/**
 * MarketingPackagesSidebarLink — زر "باقات الدعاية" للـsidebars داخل التطبيق.
 *
 * بياخد الطبيب لصفحة /marketing-packages اللي بتعرض باقات التسويق والميديا.
 * نفس نمط UserGuideSidebarLink — variant doctor / admin بنفس الستايل.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBullhorn } from 'react-icons/fa6';

interface MarketingPackagesSidebarLinkProps {
  /** الستايل المناسب للـsidebar:
   *  - 'doctor': الـsidebar الرئيسي للأطباء/السكرتاريات (slate خفيف)
   *  - 'admin' : sidebar لوحة الأدمن (brand blue) */
  variant: 'doctor' | 'admin';
  /** يتنفّذ قبل الـnavigate — مفيد لقفل قائمة الموبايل قبل الانتقال */
  onBeforeNavigate?: () => void;
}

const MARKETING_PATH = '/marketing-packages';
const LABEL = 'باقات الدعاية';

export const MarketingPackagesSidebarLink: React.FC<MarketingPackagesSidebarLinkProps> = ({
  variant,
  onBeforeNavigate,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onBeforeNavigate?.();
    navigate(MARKETING_PATH);
  };

  if (variant === 'admin') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
      >
        <FaBullhorn className="w-3.5 h-3.5" />
        {LABEL}
      </button>
    );
  }

  // variant === 'doctor' — نفس نمط زر دليل الاستخدام
  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-transparent group"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
        <FaBullhorn className="w-5 h-5" />
      </div>
      <span className="font-bold text-sm">{LABEL}</span>
    </button>
  );
};
