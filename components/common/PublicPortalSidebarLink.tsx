/**
 * PublicPortalSidebarLink — زر "بوابة الجمهور" داخل واجهة الطبيب.
 *
 * يفتح دومين الجمهور الرسمي كرابط خارجي، حتى لو الطبيب يستخدم تطبيق العيادة
 * المثبت كـPWA. اختلاف الدومين يخرج المستخدم من scope تطبيق الطبيب.
 */

import React from 'react';
import { FaUsers } from 'react-icons/fa6';

interface PublicPortalSidebarLinkProps {
  /** يتنفّذ قبل فتح الرابط — مفيد لقفل قائمة الموبايل قبل الخروج للتطبيق الآخر */
  onBeforeNavigate?: () => void;
}

const PUBLIC_PORTAL_URL = 'https://www.drhypermed.com/public';
const LABEL = 'بوابة الجمهور';

export const PublicPortalSidebarLink: React.FC<PublicPortalSidebarLinkProps> = ({
  onBeforeNavigate,
}) => {
  return (
    <a
      href={PUBLIC_PORTAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onBeforeNavigate?.()}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-blue-700 hover:bg-blue-50 hover:text-blue-800 bg-transparent group"
      aria-label="فتح بوابة الجمهور في تطبيق أو نافذة خارجية"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
        <FaUsers className="w-5 h-5" />
      </div>
      <span className="font-bold text-sm">{LABEL}</span>
    </a>
  );
};
