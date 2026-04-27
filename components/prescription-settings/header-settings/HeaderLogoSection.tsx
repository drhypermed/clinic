/**
 * مكون إعدادات شعار العيادة (Header Logo Section)
 * يتيح للطبيب رفع شعار العيادة (اللوجو) وتخصيص أبعاده وموضعه وشفافيته في هيدر الروشتة.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { LABEL_CLASS } from '../utils';
import type { HeaderSectionSharedProps } from '../../../types';
import { readFileAsDataUrl, validateHeaderImageFile } from './securityUtils';
import { useImageUploadGate } from '../../../hooks/useImageUploadGate';
import { ImageUploadUpgradeModal } from '../../common/ImageUploadUpgradeModal';

export const HeaderLogoSection: React.FC<HeaderSectionSharedProps> = ({ header, updateHeader, openSection, toggle, showNotification, fileInputRef, setLogoToCrop }) => {
  // ─ gate رفع الصور: Pro/ProMax مسموح، Free حسب إعدادات الأدمن
  const imageGate = useImageUploadGate();

  /** معالج تغيير ملف شعار العيادة (اللوجو) */
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // التحقق من توافق الصورة (الحجم والنوع)
    const validationError = validateHeaderImageFile(f);
    if (validationError) {
      showNotification('error', validationError);
      e.target.value = '';
      return;
    }

    try {
      // قراءة الصورة وفتح نافذة القص (Cropper)
      const dataUrl = await readFileAsDataUrl(f);
      setLogoToCrop(dataUrl);
    } catch {
      showNotification('error', 'تعذر قراءة الصورة. حاول مرة أخرى');
    } finally {
      // تفريغ المدخل للسماح باختيار ملف آخر
      e.target.value = '';
    }
  };
  return (
    <>
                {/* لوجو الهيدر */}
                <CollapsibleSection
                    title="شعار العيادة / اللوجو"
                    isOpen={openSection === 'logo'}
                    onToggle={() => toggle('logo')}
                    className="flex flex-col-reverse md:flex-row md:items-start gap-5 p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl m-2"
                    color="indigo"
                >
                    <div className="flex-1 w-full">
                        <label className={LABEL_CLASS}>شعار العيادة / اللوجو</label>
                        <p className="text-xs text-slate-500 mb-2">يفضل صورة بخلفية شفافة (PNG) - حجم صغير</p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => {
                              if (!imageGate.requestImageUpload()) { e.target.value = ''; return; }
                              void handleLogoFileChange(e);
                            }}
                            className="hidden"
                        />
                        {!header.logoBase64 && (
                            <button
                                onClick={() => {
                                  if (!imageGate.requestImageUpload()) return;
                                  fileInputRef.current?.click();
                                }}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <span className="text-xl">📂</span>
                                اختر صورة الشعار
                            </button>
                        )}
                        {/* إعدادات التحكم في أبعاد وموضع اللوجو بمجرد رفعه */}
                        {header.logoBase64 && (
                            <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200">
                                <h3 className="font-bold text-slate-700 mb-3 text-sm">أبعاد ومكان اللوجو</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* التحكم في عرض اللوجو بالبكسل */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">الحجم: {header.logoWidth ?? 80}px</label>
                                        <input
                                            type="range"
                                            min="40"
                                            max="500"
                                            value={header.logoWidth ?? 80}
                                            onChange={e => updateHeader({ logoWidth: parseInt(e.target.value) })}
                                            className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    {/* التحكم في الإزاحة الأفقية */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">أفقي (يمين/يسار): {header.logoPosX ?? 50}%</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={100 - (header.logoPosX ?? 50)}
                                            onChange={e => updateHeader({ logoPosX: 100 - parseInt(e.target.value) })}
                                            className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    {/* التحكم في الإزاحة الرأسية */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">رأسي (أعلى/أسفل): {header.logoPosY ?? 55}%</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={header.logoPosY ?? 55}
                                            onChange={e => updateHeader({ logoPosY: parseInt(e.target.value) })}
                                            className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    {/* التحكم في درجة الشفافية */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ الشفافية: {Math.round((header.logoOpacity ?? 1) * 100)}%</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={Math.round((header.logoOpacity ?? 1) * 100)}
                                            onChange={e => updateHeader({ logoOpacity: parseInt(e.target.value) / 100 })}
                                            className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {header.logoBase64 && (
                        <div className="relative p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-center flex flex-col items-center gap-3 w-full md:w-64 shrink-0">
                            <img src={header.logoBase64} alt="Logo Preview" className="h-24 max-w-full object-contain rounded-lg border p-1" />
                            <div className="flex gap-2 w-full max-w-[250px] justify-center">
                                <button
                                    onClick={() => {
                                      if (!imageGate.requestImageUpload()) return;
                                      fileInputRef.current?.click();
                                    }}
                                    className="flex-1 px-2 py-2.5 bg-brand-50 text-brand-600 text-sm font-bold rounded-lg hover:bg-brand-100 transition-colors active:scale-95"
                                >
                                    تغيير
                                </button>
                                <button
                                    onClick={() => updateHeader({ logoBase64: undefined })}
                                    className="flex-1 px-2 py-2.5 bg-danger-50 text-danger-600 text-sm font-bold rounded-lg hover:bg-danger-100 transition-colors active:scale-95"
                                >
                                    حذف
                                </button>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 bg-slate-100 py-1 px-2 rounded inline-block w-full text-center mt-1">
                                الحجم: {Math.round((header.logoBase64.length * 3) / 4 / 1024)} KB
                            </div>
                        </div>
                    )}
                </CollapsibleSection>

      <ImageUploadUpgradeModal
        isOpen={imageGate.showUpgradeModal}
        onClose={imageGate.closeUpgradeModal}
        message={imageGate.upgradeMessage}
        whatsappUrl={imageGate.whatsappUrl}
      />
    </>
  );
};
