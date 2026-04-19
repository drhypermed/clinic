/**
 * الملف: PublicBookingTopBar.tsx
 * الوصف: "شريط الأدوات العلوي" لفورم الجمهور. 
 * يوفر للمريض وسيلة للعودة للدليل الرئيسي للعيادة أو مشاركة صفحة الحجز 
 * مع الآخرين عبر منصات التواصل (واتساب، فيسبوك، إكس، إلخ). 
 * يحتوي أيضاً على مسار التصفح (Breadcrumbs) الذي يساعد المريض على 
 * معرفة مكانه الحالي داخل الموقع الطبي.
 */
import React from 'react';

import type { SharePlatform } from './types';

type PublicBookingTopBarProps = {
  isFromPublicSite: boolean;
  showShareMenu: boolean;
  linkCopied: boolean;
  doctorName: string;
  onBack: () => void;
  onToggleShareMenu: () => void;
  onShare: (platform: SharePlatform) => void;
};

export const PublicBookingTopBar: React.FC<PublicBookingTopBarProps> = ({
  isFromPublicSite,
  showShareMenu,
  linkCopied,
  doctorName,
  onBack,
  onToggleShareMenu,
  onShare,
}) => {
  if (!isFromPublicSite) return null;

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-10 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 font-black text-sm hover:bg-slate-50"
        >
          رجوع للصفحة الرئيسية
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={onToggleShareMenu}
            className="h-10 px-4 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-black text-sm hover:bg-orange-100 transition-colors"
            title="مشاركة على المنصات"
          >
            {linkCopied ? '✓ تم النسخ' : '📤 مشاركة'}
          </button>

          {showShareMenu && (
            <div className="absolute top-12 right-0 bg-white border border-orange-200 rounded-xl shadow-lg z-50 overflow-hidden min-w-48">
              <button
                type="button"
                onClick={() => onShare('copy')}
                className="w-full px-4 py-2 text-right hover:bg-orange-50 border-b border-orange-100 text-sm font-bold text-slate-700 flex items-center gap-2"
              >
                <span>📋</span>
                <span>نسخ الرابط</span>
              </button>
              <button
                type="button"
                onClick={() => onShare('whatsapp')}
                className="w-full px-4 py-2 text-right hover:bg-green-50 border-b border-orange-100 text-sm font-bold text-slate-700 flex items-center gap-2"
              >
                <span>💬</span>
                <span>واتس آب</span>
              </button>
              <button
                type="button"
                onClick={() => onShare('facebook')}
                className="w-full px-4 py-2 text-right hover:bg-blue-50 border-b border-orange-100 text-sm font-bold text-slate-700 flex items-center gap-2"
              >
                <span>👍</span>
                <span>فيس بوك</span>
              </button>
              <button
                type="button"
                onClick={() => onShare('twitter')}
                className="w-full px-4 py-2 text-right hover:bg-blue-50 border-b border-orange-100 text-sm font-bold text-slate-700 flex items-center gap-2"
              >
                <span>𝕏</span>
                <span>تويتر</span>
              </button>
              <button
                type="button"
                onClick={() => onShare('gmail')}
                className="w-full px-4 py-2 text-right hover:bg-red-50 text-sm font-bold text-slate-700 flex items-center gap-2"
              >
                <span>📧</span>
                <span>بريد إلكتروني</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
        <span className="hover:text-orange-600 cursor-pointer transition-colors">الرئيسية</span>
        <span className="text-slate-300">/</span>
        <span className="hover:text-orange-600 cursor-pointer transition-colors">دليل الأطباء</span>
        <span className="text-slate-300">/</span>
        <span className="text-orange-600 truncate max-w-[200px]">{doctorName.trim() || 'حجز موعد'}</span>
      </div>
    </>
  );
};
