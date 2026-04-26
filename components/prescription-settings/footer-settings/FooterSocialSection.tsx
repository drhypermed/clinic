/**
 * الملف: FooterSocialSection.tsx
 * الوصف: هذا المكون مسؤول عن إعدادات روابط التواصل الاجتماعي في الفوتر. 
 * يتيح للطبيب إضافة اسم حسابه (Handle) وتفعيل أيقونات المنصات المختلفة 
 * (فيسبوك، إنستجرام، يوتيوب، تيك توك) مع التحكم في ألوانها وأحجامها ومواقعها بدقة.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { StyleControl } from '../../editors/StyleControl';
import { RichTextEditor } from '../../editors/RichTextEditor';
import { stripHtml } from '../utils';
import type { FooterSectionSharedProps } from '../../../types';

export const FooterSocialSection: React.FC<FooterSectionSharedProps> = ({ footer, updateFooter, openSection, toggle, handleStyleChange, handlePreset, editorRefs }) => {
  return (
    <>
            <CollapsibleSection
                title="🌐 التواصل الاجتماعي"
                isOpen={openSection === 'social'}
                onToggle={() => toggle('social')}
                color="blue"
                className="p-4 bg-gradient-to-br from-brand-50 to-white"
            >
                <div className="space-y-4">
                    {/* مفتاح تفعيل/تعطيل ظهور كامل قسم السوشيال ميديا في الفوتر */}
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-brand-50 rounded-lg border border-brand-100 w-fit">
                        <input
                            type="checkbox"
                            checked={footer.showSocialMedia}
                            onChange={e => updateFooter({ showSocialMedia: e.target.checked })}
                            className="w-5 h-5 rounded accent-brand-600"
                        />
                        <span className="font-bold text-brand-900">إظهار أيقونات السوشيال ميديا في الفوتر</span>
                    </label>
                    {footer.showSocialMedia && (
                        <div className="space-y-4">
                            {/* النص قبل الأيقونات */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-brand-800 block">النص قبل الأيقونات</label>
                                <div className="border rounded-lg overflow-hidden shadow-sm">
                                    <RichTextEditor
                                        ref={el => { if (editorRefs.current) editorRefs.current['socialLabel'] = el; }}
                                        value={footer.socialMediaLabelHtml || footer.socialMediaLabel || 'لمتابعة الفيديوهات الطبية الخاصة بنا :'}
                                        onChange={html => updateFooter({ socialMediaLabelHtml: html, socialMediaLabel: stripHtml(html) })}
                                        placeholder="لمتابعة الفيديوهات الطبية الخاصة بنا :"
                                    />
                                </div>
                                <div>
                                    <StyleControl
                                        style={footer.socialMediaLabelStyle || {}}
                                        onChange={s => handleStyleChange(s, 'socialLabel', footer.socialMediaLabelStyle || {}, x => updateFooter({ socialMediaLabelStyle: x }))}
                                        onApplyPreset={s => handlePreset(s, 'socialLabel')}
                                    />
                                </div>
                            </div>
                            
                            {/* اسم الحساب */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-brand-800 block">اسم الحساب / الـ Handle</label>
                                <div className="border rounded-lg overflow-hidden shadow-sm">
                                    <RichTextEditor
                                        ref={el => { if (editorRefs.current) editorRefs.current['social'] = el; }}
                                        value={footer.socialMediaHtml || footer.socialMediaHandle}
                                        onChange={html => updateFooter({ socialMediaHtml: html, socialMediaHandle: stripHtml(html) })}
                                        placeholder="مثال: @DrAhmedClinic"
                                    />
                                </div>
                                <div>
                                    <StyleControl
                                        style={footer.socialStyle || {}}
                                        onChange={s => handleStyleChange(s, 'social', footer.socialStyle || {}, x => updateFooter({ socialStyle: x }))}
                                        onApplyPreset={s => handlePreset(s, 'social')}
                                    />
                                </div>
                            </div>

                            {/* إعدادات الأيقونات */}
                            <div className="border-t border-brand-200 pt-4 space-y-4">
                                <h4 className="text-sm font-bold text-brand-900 mb-3">🎨 إعدادات الأيقونات</h4>
                                
                                {/* Facebook */}
                                <div className="p-3 bg-brand-50 rounded-lg border border-brand-200 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={footer.showFacebookIcon !== false}
                                            onChange={e => updateFooter({ showFacebookIcon: e.target.checked })}
                                            className="w-5 h-5 rounded accent-brand-600"
                                        />
                                        <label className="text-sm font-bold text-brand-800 cursor-pointer">Facebook</label>
                                    </div>
                                    {footer.showFacebookIcon !== false && (
                                        <div className="space-y-3 pl-7">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-brand-700 mb-1 block">اللون</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={footer.facebookIconStyle?.color || '#1877F2'}
                                                            onChange={e => updateFooter({ 
                                                                facebookIconStyle: { 
                                                                    ...footer.facebookIconStyle, 
                                                                    color: e.target.value 
                                                                } 
                                                            })}
                                                            className="h-8 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                                                        />
                                                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{footer.facebookIconStyle?.color || '#1877F2'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-brand-700 mb-1 block">الحجم: {footer.facebookIconStyle?.size || 12}px</label>
                                                    <input
                                                        type="range"
                                                        min="6"
                                                        max="20"
                                                        value={footer.facebookIconStyle?.size || 12}
                                                        onChange={e => updateFooter({ 
                                                            facebookIconStyle: { 
                                                                ...footer.facebookIconStyle, 
                                                                size: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-brand-700 mb-1 block">إزاحة أفقية: {footer.facebookIconStyle?.xOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.facebookIconStyle?.xOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            facebookIconStyle: { 
                                                                ...footer.facebookIconStyle, 
                                                                xOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-brand-700 mb-1 block">إزاحة رأسية: {footer.facebookIconStyle?.yOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.facebookIconStyle?.yOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            facebookIconStyle: { 
                                                                ...footer.facebookIconStyle, 
                                                                yOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Instagram */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={footer.showInstagramIcon !== false}
                                            onChange={e => updateFooter({ showInstagramIcon: e.target.checked })}
                                            className="w-5 h-5 rounded accent-slate-600"
                                        />
                                        <label className="text-sm font-bold text-slate-800 cursor-pointer">Instagram</label>
                                    </div>
                                    {footer.showInstagramIcon !== false && (
                                        <div className="space-y-3 pl-7">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">اللون</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={footer.instagramIconStyle?.color || '#E1306C'}
                                                            onChange={e => updateFooter({ 
                                                                instagramIconStyle: { 
                                                                    ...footer.instagramIconStyle, 
                                                                    color: e.target.value 
                                                                } 
                                                            })}
                                                            className="h-8 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                                                        />
                                                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{footer.instagramIconStyle?.color || '#E1306C'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">الحجم: {footer.instagramIconStyle?.size || 12}px</label>
                                                    <input
                                                        type="range"
                                                        min="6"
                                                        max="20"
                                                        value={footer.instagramIconStyle?.size || 12}
                                                        onChange={e => updateFooter({ 
                                                            instagramIconStyle: { 
                                                                ...footer.instagramIconStyle, 
                                                                size: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">إزاحة أفقية: {footer.instagramIconStyle?.xOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.instagramIconStyle?.xOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            instagramIconStyle: { 
                                                                ...footer.instagramIconStyle, 
                                                                xOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">إزاحة رأسية: {footer.instagramIconStyle?.yOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.instagramIconStyle?.yOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            instagramIconStyle: { 
                                                                ...footer.instagramIconStyle, 
                                                                yOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* YouTube */}
                                <div className="p-3 bg-danger-50 rounded-lg border border-danger-200 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={footer.showYouTubeIcon !== false}
                                            onChange={e => updateFooter({ showYouTubeIcon: e.target.checked })}
                                            className="w-5 h-5 rounded accent-danger-600"
                                        />
                                        <label className="text-sm font-bold text-danger-800 cursor-pointer">YouTube</label>
                                    </div>
                                    {footer.showYouTubeIcon !== false && (
                                        <div className="space-y-3 pl-7">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-danger-700 mb-1 block">اللون</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={footer.youtubeIconStyle?.color || '#FF0000'}
                                                            onChange={e => updateFooter({ 
                                                                youtubeIconStyle: { 
                                                                    ...footer.youtubeIconStyle, 
                                                                    color: e.target.value 
                                                                } 
                                                            })}
                                                            className="h-8 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                                                        />
                                                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{footer.youtubeIconStyle?.color || '#FF0000'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-danger-700 mb-1 block">الحجم: {footer.youtubeIconStyle?.size || 12}px</label>
                                                    <input
                                                        type="range"
                                                        min="6"
                                                        max="20"
                                                        value={footer.youtubeIconStyle?.size || 12}
                                                        onChange={e => updateFooter({ 
                                                            youtubeIconStyle: { 
                                                                ...footer.youtubeIconStyle, 
                                                                size: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-danger-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-danger-700 mb-1 block">إزاحة أفقية: {footer.youtubeIconStyle?.xOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.youtubeIconStyle?.xOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            youtubeIconStyle: { 
                                                                ...footer.youtubeIconStyle, 
                                                                xOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-danger-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-danger-700 mb-1 block">إزاحة رأسية: {footer.youtubeIconStyle?.yOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.youtubeIconStyle?.yOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            youtubeIconStyle: { 
                                                                ...footer.youtubeIconStyle, 
                                                                yOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-danger-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* TikTok */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={footer.showTikTokIcon !== false}
                                            onChange={e => updateFooter({ showTikTokIcon: e.target.checked })}
                                            className="w-5 h-5 rounded accent-slate-600"
                                        />
                                        <label className="text-sm font-bold text-slate-800 cursor-pointer">TikTok</label>
                                    </div>
                                    {footer.showTikTokIcon !== false && (
                                        <div className="space-y-3 pl-7">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">اللون</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={footer.tiktokIconStyle?.color || '#000000'}
                                                            onChange={e => updateFooter({ 
                                                                tiktokIconStyle: { 
                                                                    ...footer.tiktokIconStyle, 
                                                                    color: e.target.value 
                                                                } 
                                                            })}
                                                            className="h-8 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                                                        />
                                                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{footer.tiktokIconStyle?.color || '#000000'}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">الحجم: {footer.tiktokIconStyle?.size || 12}px</label>
                                                    <input
                                                        type="range"
                                                        min="6"
                                                        max="20"
                                                        value={footer.tiktokIconStyle?.size || 12}
                                                        onChange={e => updateFooter({ 
                                                            tiktokIconStyle: { 
                                                                ...footer.tiktokIconStyle, 
                                                                size: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">إزاحة أفقية: {footer.tiktokIconStyle?.xOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.tiktokIconStyle?.xOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            tiktokIconStyle: { 
                                                                ...footer.tiktokIconStyle, 
                                                                xOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 mb-1 block">إزاحة رأسية: {footer.tiktokIconStyle?.yOffset || 0}px</label>
                                                    <input
                                                        type="range"
                                                        min="-10"
                                                        max="10"
                                                        value={footer.tiktokIconStyle?.yOffset || 0}
                                                        onChange={e => updateFooter({ 
                                                            tiktokIconStyle: { 
                                                                ...footer.tiktokIconStyle, 
                                                                yOffset: parseInt(e.target.value) 
                                                            } 
                                                        })}
                                                        className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CollapsibleSection>
    </>
  );
};
