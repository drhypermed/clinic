/**
 * مكون إعدادات خلفية الهيدر (Header Background Section)
 * يوفر واجهة لتخصيص خلفية الجزء العلوي من الروشتة، بما في ذلك رفع الصور وتعديل المقاسات والموضع والشفافية، والتحكم في ألوان الخلفية والحدود الفاصلة.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { LABEL_CLASS } from '../utils';
import type { HeaderSectionSharedProps } from '../../../types';
import { readFileAsDataUrl, validateHeaderImageFile } from './securityUtils';

export const HeaderBackgroundSection: React.FC<HeaderSectionSharedProps> = ({ header, updateHeader, openSection, toggle, showNotification, setHeaderBgToCrop }) => {
  /** معالج تغيير ملف صورة الخلفية */
  const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // التحقق من صحة الملف (الحجم والنوع)
    const validationError = validateHeaderImageFile(f);
    if (validationError) {
      showNotification('error', validationError);
      e.target.value = '';
      return;
    }

    try {
      // قراءة الملف وتحويله إلى Data URL لعرضه فورياً
      const dataUrl = await readFileAsDataUrl(f);
            setHeaderBgToCrop(dataUrl);
            showNotification('success', 'تم تحميل الصورة. عدّل القص/التدوير ثم احفظ.');
    } catch {
      showNotification('error', 'تعذر قراءة الصورة. حاول مرة أخرى');
    } finally {
      // تفريغ المدخل للسماح برفع نفس الملف مرة أخرى إذا لزم الأمر
      e.target.value = '';
    }
  };
  return (
    <>
                {/* خلفية الهيدر */}
                <CollapsibleSection
                    title="🖼️ تصميم خلفية الهيدر والألوان"
                    isOpen={openSection === 'background'}
                    onToggle={() => toggle('background')}
                    className="p-4 bg-gradient-to-br from-brand-50 to-white"
                    color="blue"
                >
                    <p className="text-xs text-slate-500 mb-3">ارفع تصميم جاهز لخلفية الهيدر (صورة PNG أو JPG)</p>
                    <input
                        type="file"
                        accept="image/*"
                        id="headerBgInput"
                        onChange={handleBackgroundFileChange}
                        className="hidden"
                    />
                    {/* زر الرفع في حال عدم وجود صورة */}
                    {!header.headerBackgroundImage ? (
                        <button
                            onClick={() => document.getElementById('headerBgInput')?.click()}
                            className="w-full py-4 border-2 border-dashed border-brand-300 rounded-xl hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center gap-2 text-slate-500 hover:text-brand-600"
                        >
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-bold">رفع تصميم جاهز مع التعديل عليه</span>
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {/* معاينة مصغرة للصورة المرفوعة */}
                            <div className="relative rounded-lg overflow-hidden border border-slate-200">
                                <img src={header.headerBackgroundImage} alt="Header Background" className="w-full h-24 object-cover" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => document.getElementById('headerBgInput')?.click()}
                                    className="flex-1 py-2 bg-brand-100 text-brand-700 rounded-lg font-bold hover:bg-brand-200 transition-all text-sm"
                                >
                                    📤 رفع صورة جديدة
                                </button>
                                <button
                                    onClick={() => {
                                        updateHeader({ headerBackgroundImage: undefined });
                                        showNotification('success', 'تم حذف تصميم الهيدر');
                                    }}
                                    className="px-4 py-2 bg-danger-100 text-danger-700 rounded-lg font-bold hover:bg-danger-200 transition-all"
                                >
                                    🗑️ حذف
                                </button>
                            </div>
                        </div>
                    )}
                    {/* إعدادات التحكم في وضع الصورة وأبعادها */}
                    {header.headerBackgroundImage && (
                        <div className="border-t border-slate-200 my-4 pt-4 space-y-4">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">⚙️ إعدادات الصورة</h4>

                            {/* التحكم في التكبير والتصغير */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">📏 حجم الصورة: {header.headerBgScale ?? 100}%</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    value={header.headerBgScale ?? 100}
                                    onChange={e => updateHeader({ headerBgScale: parseInt(e.target.value) })}
                                    className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* المسافة من اليمين واليسار */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">↔️ الموضع الأفقي (يمين/يسار): {header.headerBgPosX ?? 50}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={100 - (header.headerBgPosX ?? 50)}
                                    onChange={e => updateHeader({ headerBgPosX: 100 - parseInt(e.target.value) })}
                                    className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* المسافة من الأعلى والأسفل */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">↕️ الموضع الرأسي (فوق/تحت): {header.headerBgPosY ?? 50}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={header.headerBgPosY ?? 50}
                                    onChange={e => updateHeader({ headerBgPosY: parseInt(e.target.value) })}
                                    className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* درجة شفافية الصورة */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ الشفافية: {Math.round((header.headerBackgroundOpacity ?? 1) * 100)}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={Math.round((header.headerBackgroundOpacity ?? 1) * 100)}
                                    onChange={e => updateHeader({ headerBackgroundOpacity: parseInt(e.target.value) / 100 })}
                                    className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                    <div className="border-t border-slate-200 my-4 pt-4 space-y-4">
                        <div>
                            <label className={LABEL_CLASS}>لون الخلفية</label>
                            <div className="space-y-3">
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={header.backgroundColor || '#ffffff'}
                                        onChange={e => updateHeader({ backgroundColor: e.target.value })}
                                        className="h-10 w-16 rounded cursor-pointer border border-slate-200 p-1"
                                    />
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{header.backgroundColor || '#ffffff'}</span>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ شفافية الخلفية: {Math.round((header.backgroundColorOpacity ?? 1) * 100)}%</label>
                                    <div className="slider-wrapper">
                                        <div className="slider-track"></div>
                                        <div className="slider-fill" style={{ width: `${(header.backgroundColorOpacity ?? 1) * 100}%`, backgroundColor: header.backgroundColor || '#3b82f6' }}></div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={Math.round((header.backgroundColorOpacity ?? 1) * 100)}
                                            onChange={e => updateHeader({ backgroundColorOpacity: parseInt(e.target.value) / 100 })}
                                            className="modern-slider slider-blue"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className={LABEL_CLASS}>الخط السفلي (الحد الفاصل)</label>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                                    <input
                                        type="checkbox"
                                        checked={header.showBottomBorder !== false}
                                        onChange={e => updateHeader({ showBottomBorder: e.target.checked })}
                                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                                    />
                                    <span className="text-sm font-bold text-slate-700">إظهار الخط السفلي</span>
                                </label>
                                {header.showBottomBorder !== false && (
                                    <div className="space-y-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500">لون الخط:</span>
                                            <input
                                                type="color"
                                                value={header.bottomBorderColor || header.borderColor || '#7f1d1d'}
                                                onChange={e => updateHeader({ bottomBorderColor: e.target.value })}
                                                className="h-8 w-16 rounded cursor-pointer border border-slate-200 p-0.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">🌫️ شفافية الخط: {Math.round((header.bottomBorderOpacity ?? 1) * 100)}%</label>
                                            <div className="slider-wrapper">
                                                <div className="slider-track"></div>
                                                <div className="slider-fill" style={{ width: `${(header.bottomBorderOpacity ?? 1) * 100}%`, backgroundColor: header.bottomBorderColor || header.borderColor || '#3b82f6' }}></div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={Math.round((header.bottomBorderOpacity ?? 1) * 100)}
                                                    onChange={e => updateHeader({ bottomBorderOpacity: parseInt(e.target.value) / 100 })}
                                                    className="modern-slider slider-blue"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
    </>
  );
};
