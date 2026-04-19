/**
 * الملف: FooterLogoSection.tsx
 * الوصف: هذا المكون مسؤول عن إعدادات شعار تذييل الروشتة (Footer Logo). 
 * يتيح للمستخدم رفع شعار إضافي يظهر في الفوتر، والتحكم في أبعاده وموضعه وشفافيته، 
 * مع إمكانية القص اليدوي للصورة المرفوعة لضمان تناسق المظهر.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import type { FooterLogoSectionProps } from '../../../types';
import { readFileAsDataUrl, validateFooterImageFile } from './securityUtils';

export const FooterLogoSection: React.FC<FooterLogoSectionProps> = ({
  footer,
  updateFooter,
  openSection,
  toggle,
  showNotification,
  setFooterLogoToCrop,
}) => {
  /** 
   * معالجة رفع ملف الشعار 
   * يتم التحقق من جودة الملف ثم إرساله إلى مكون القص (Cropper) قبل اعتماده نهائياً
   */
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من صحة الملف (الحجم والنوع)
    const validationError = validateFooterImageFile(file);
    if (validationError) {
      showNotification('error', validationError);
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      // فتح واجهة القص للصورة المرفوعة
      setFooterLogoToCrop(dataUrl);
    } catch {
      showNotification('error', 'تعذر قراءة الصورة. حاول مرة أخرى');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <CollapsibleSection
      title="شعار الفوتر (Logo)"
      isOpen={openSection === 'footerLogo'}
      onToggle={() => toggle('footerLogo')}
      color="indigo"
      className="flex items-start gap-4 p-4 bg-indigo-50/30"
    >
      <div className="flex-1 space-y-4">
        {/* قسم رفع وتحميل صورة الشعار */}
        <label className="block text-sm font-bold text-slate-600 mb-2">رفع شعار/لوجو للفوتر</label>
        <p className="text-xs text-slate-500 mb-2">يفضل صورة بخلفية شفافة (PNG) - حجم صغير</p>
        <input
          type="file"
          accept="image/*"
          id="footerLogoInput"
          onChange={handleLogoFileChange}
          className="hidden"
        />
        {!footer.logoBase64 && (
          // زر اختيار الملف في حالة عدم وجود شعار مسبق
          <button
            onClick={() => document.getElementById('footerLogoInput')?.click()}
            className="w-full py-4 border-2 border-dashed border-indigo-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2 text-indigo-500 hover:text-indigo-600"
          >
            <span className="text-2xl">📂</span>
            <span className="font-bold">اختر صورة شعار الفوتر</span>
          </button>
        )}
        {footer.logoBase64 && (
          <div className="mt-4 pt-4 border-t-2 border-dashed border-indigo-200">
            <h3 className="font-bold text-slate-700 mb-3 text-sm">أبعاد ومكان اللوجو</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">الحجم: {footer.logoWidth ?? 80}px</label>
                <input
                  type="range"
                  min="40"
                  max="300"
                  value={footer.logoWidth ?? 80}
                  onChange={e => updateFooter({ logoWidth: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">أفقي (يمين/يسار): {footer.logoPosX ?? 10}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={100 - (footer.logoPosX ?? 10)}
                  onChange={e => updateFooter({ logoPosX: 100 - parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">رأسي (أعلى/أسفل): {footer.logoPosY ?? 50}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={footer.logoPosY ?? 50}
                  onChange={e => updateFooter({ logoPosY: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ الشفافية: {Math.round((footer.logoOpacity ?? 1) * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((footer.logoOpacity ?? 1) * 100)}
                  onChange={e => updateFooter({ logoOpacity: parseInt(e.target.value, 10) / 100 })}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {footer.logoBase64 && (
        <div className="relative mt-2 p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-center flex flex-col items-center gap-2">
          <img src={footer.logoBase64} alt="Logo Preview" className="h-24 w-auto object-contain rounded-full border" />
          <div className="text-[11px] font-mono text-slate-500 bg-slate-100 py-1 px-2 rounded inline-block">
            Size: {Math.round((footer.logoBase64.length * 3) / 4 / 1024)} KB
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => document.getElementById('footerLogoInput')?.click()}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded hover:bg-indigo-100 transition-colors"
            >
              تغيير
            </button>
            <button
              onClick={() => updateFooter({ logoBase64: undefined })}
              className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition-colors"
            >
              حذف
            </button>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
};
