/**
 * الملف: FooterBackgroundSection.tsx
 * الوصف: هذا المكون مسؤول عن إعدادات خلفية تذييل الروشتة (الفوتر). 
 * يتيح للمستخدم رفع صورة تصميم جاهزة، والتحكم في شفافيتها وأبعادها وموضعها، 
 * بالإضافة إلى تعديل لون خلفية الفوتر والحد العلوي الفاصل.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { LABEL_CLASS } from '../utils';
import type { FooterBackgroundSectionProps } from '../../../types';
import { readFileAsDataUrl, validateFooterImageFile } from './securityUtils';
import { useImageUploadGate } from '../../../hooks/useImageUploadGate';
import { ImageUploadUpgradeModal } from '../../common/ImageUploadUpgradeModal';

export const FooterBackgroundSection: React.FC<FooterBackgroundSectionProps> = ({
  footer,
  updateFooter,
  openSection,
  toggle,
  showNotification,
  setFooterBgToCrop,
}) => {
  // ─ gate رفع الصور: Pro/ProMax مسموح، Free حسب إعدادات الأدمن
  const imageGate = useImageUploadGate();

  /**
   * معالجة تغيير ملف صورة الخلفية
   * تقوم بالتحقق من جودة الملف وحجمه، ثم تحويله إلى DataURL لتخزينه وعرضه
   */
  const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من صحة الملف (الحجم والنوع) عبر أداة الأمان
    const validationError = validateFooterImageFile(file);
    if (validationError) {
      showNotification('error', validationError);
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      // افتح الكروبر قبل اعتماد الصورة حتى يدعم القص/التدوير.
      setFooterBgToCrop(dataUrl);
      showNotification('success', 'تم تحميل الصورة. عدّل القص/التدوير ثم احفظ.');
    } catch {
      showNotification('error', 'تعذر قراءة الصورة. حاول مرة أخرى');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <CollapsibleSection
      title="🖼️ تصميم خلفية الفوتر والألوان"
      isOpen={openSection === 'footerBg'}
      onToggle={() => toggle('footerBg')}
      color="slate"
      className="p-4 bg-slate-50"
    >
      <div className="space-y-4">
        {/* قسم رفع صورة الخلفية */}
        <div>
          <p className="text-xs text-slate-500 mb-3">ارفع تصميم جاهز لخلفية الفوتر (صورة PNG أو JPG)</p>
          <input
            type="file"
            accept="image/*"
            id="footerBgInput"
            onChange={(e) => {
              if (!imageGate.requestImageUpload()) { e.target.value = ''; return; }
              void handleBackgroundFileChange(e);
            }}
            className="hidden"
          />
          {!footer.footerBackgroundImage ? (
            // زر الرفع في حالة عدم وجود صورة
            <button
              onClick={() => {
                if (!imageGate.requestImageUpload()) return;
                document.getElementById('footerBgInput')?.click();
              }}
              className="w-full py-4 border-2 border-dashed border-brand-300 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center gap-2 text-slate-500 hover:text-brand-600"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-bold">رفع تصميم جاهز مع التعديل عليه</span>
            </button>
          ) : (
            // عرض المعاينة وأزرار التحكم (تغيير/حذف) في حالة وجود صورة
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                <img src={footer.footerBackgroundImage} alt="Footer Background" className="w-full h-24 object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!imageGate.requestImageUpload()) return;
                    document.getElementById('footerBgInput')?.click();
                  }}
                  className="flex-1 py-2 bg-brand-100 text-brand-700 rounded-lg font-bold hover:bg-brand-200 transition-all text-sm"
                >
                  📤 رفع صورة جديدة
                </button>
                <button
                  onClick={() => {
                    updateFooter({ footerBackgroundImage: undefined, footerBgOpacity: 1 });
                    showNotification('success', 'تم حذف تصميم الفوتر');
                  }}
                  className="px-4 py-2 bg-danger-100 text-danger-700 rounded-lg font-bold hover:bg-danger-200 transition-all"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          )}
        </div>
        {footer.footerBackgroundImage && (
          <div className="border-t border-slate-200 my-4 pt-4 space-y-4">
            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">⚙️ إعدادات الصورة</h4>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">📏 حجم الصورة: {footer.footerBgScale ?? 100}%</label>
              <input
                type="range"
                min="10"
                max="200"
                value={footer.footerBgScale ?? 100}
                onChange={e => updateFooter({ footerBgScale: parseInt(e.target.value, 10) })}
                className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">↔️ الموضع الأفقي (يمين/يسار): {footer.footerBgPosX ?? 50}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={100 - (footer.footerBgPosX ?? 50)}
                onChange={e => updateFooter({ footerBgPosX: 100 - parseInt(e.target.value, 10) })}
                className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">↕️ الموضع الرأسي (فوق/تحت): {footer.footerBgPosY ?? 50}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={footer.footerBgPosY ?? 50}
                onChange={e => updateFooter({ footerBgPosY: parseInt(e.target.value, 10) })}
                className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ الشفافية: {Math.round((footer.footerBgOpacity ?? 1) * 100)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((footer.footerBgOpacity ?? 1) * 100)}
                onChange={e => updateFooter({ footerBgOpacity: parseInt(e.target.value, 10) / 100 })}
                className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
        {/* إعدادات لون خلفية الفوتر (في حالة عدم استخدام صورة أو خلف الصورة الشفافة) */}
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div>
            <label className={LABEL_CLASS}>لون الخلفية</label>
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={footer.backgroundColor || '#f8fafc'}
                  onChange={e => updateFooter({ backgroundColor: e.target.value })}
                  className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
                />
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{footer.backgroundColor || '#f8fafc'}</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ شفافية الخلفية: {Math.round((footer.backgroundColorOpacity ?? 1) * 100)}%</label>
                <div className="slider-wrapper">
                  <div className="slider-track"></div>
                  <div className="slider-fill" style={{ width: `${(footer.backgroundColorOpacity ?? 1) * 100}%`, backgroundColor: footer.backgroundColor || '#3b82f6' }}></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((footer.backgroundColorOpacity ?? 1) * 100)}
                    onChange={e => updateFooter({ backgroundColorOpacity: parseInt(e.target.value, 10) / 100 })}
                    className="modern-slider slider-blue"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>الخط العلوي (الحد الفاصل)</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={footer.showTopBorder !== false}
                  onChange={e => updateFooter({ showTopBorder: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
                <span className="text-sm text-slate-700">إظهار الخط العلوي</span>
              </label>
              {footer.showTopBorder !== false && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">اللون:</span>
                    <input
                      type="color"
                      value={footer.topBorderColor || '#991b1b'}
                      onChange={e => updateFooter({ topBorderColor: e.target.value })}
                      className="h-8 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ شفافية الخط: {Math.round((footer.topBorderOpacity ?? 1) * 100)}%</label>
                    <div className="slider-wrapper">
                      <div className="slider-track"></div>
                      <div className="slider-fill" style={{ width: `${(footer.topBorderOpacity ?? 1) * 100}%`, backgroundColor: footer.topBorderColor || '#3b82f6' }}></div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((footer.topBorderOpacity ?? 1) * 100)}
                        onChange={e => updateFooter({ topBorderOpacity: parseInt(e.target.value, 10) / 100 })}
                        className="modern-slider slider-blue"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageUploadUpgradeModal
        isOpen={imageGate.showUpgradeModal}
        onClose={imageGate.closeUpgradeModal}
        message={imageGate.upgradeMessage}
        whatsappUrl={imageGate.whatsappUrl}
      />
    </CollapsibleSection>
  );
};
