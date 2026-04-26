/**
 * SocialIconRenderer — مصدر موحد لأيقونات وسائل التواصل المستخدمة في السطر السفلي للروشتة.
 *
 * كان الكود مكرراً في موضعين (PrescriptionFooter و PrescriptionFooterLineManagementPanel)
 * مما يعرّض لخطر drift عند تعديل أيقونة في مكان ونسيانها في الآخر. هذا الملف
 * يُوحّد المصدر ويضمن تطابق العرض بين الروشتة المطبوعة ومعاينة الأدمن.
 */

import React from 'react';

/** الأنواع المدعومة — يجب أن تتطابق مع SYSTEM_REQUEST_ICON_OPTIONS */
type SocialIconName =
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'telegram'
  | 'phone'
  | 'link'
  | 'custom';

interface SocialIconProps {
  icon: SocialIconName | string;
  color: string;
  size?: number;
}

export const SocialIconRenderer: React.FC<SocialIconProps> = ({ icon, color, size = 12 }) => {
  const style: React.CSSProperties = { width: size, height: size, color };

  switch (icon) {
    case 'whatsapp':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="currentColor" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.9 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5zm8.88 1.87a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.78 15.17l-.4 4.2c.57 0 .81-.25 1.1-.54l2.64-2.52 5.47 4c1 .56 1.72.27 1.98-.92l3.58-16.77h0c.31-1.43-.52-1.99-1.5-1.62L1.7 9.28C.3 9.83.32 10.6 1.46 10.95l5.37 1.68L19.3 4.8c.59-.38 1.13-.17.69.21" />
        </svg>
      );
    case 'phone':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.26 1.02l-1.7 1.7a16 16 0 006.56 6.56l1.7-1.7a1 1 0 011.02-.26l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C10.16 21 3 13.84 3 5V5z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 01-5.656-5.656l1-1m8.486-1.486a4 4 0 00-5.656 0l-2 2a4 4 0 105.656 5.656l1-1" />
        </svg>
      );
  }
};
