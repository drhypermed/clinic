/**
 * الملف: FooterContactsSection.tsx
 * الوصف: هذا المكون مسؤول عن إعدادات أرقام التواصل في تذييل الروشتة. 
 * يتيح للطبيب إضافة أرقام الهاتف والواتساب، وتخصيص تسمياتها (Labels)، 
 * والتحكم الكامل في ظهور وألوان وأحجام أيقونات الاتصال والواتساب.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { StyleControl } from '../../editors/StyleControl';
import { RichTextEditor } from '../../editors/RichTextEditor';
import { stripHtml } from '../utils';
import type { FooterSectionSharedProps } from '../../../types';

export const FooterContactsSection: React.FC<FooterSectionSharedProps> = ({ footer, updateFooter, openSection, toggle, handleStyleChange, handlePreset, editorRefs }) => {
  return (
    <>
            <CollapsibleSection
                title="📱 أرقام التواصل (هاتف / واتساب)"
                isOpen={openSection === 'phones'}
                onToggle={() => toggle('phones')}
                color="rose"
                className="p-4 bg-gradient-to-br from-rose-50 to-white"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* الهاتف */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-rose-800 block">نص التسمية (قبل رقم الهاتف)</label>
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                                <RichTextEditor
                                    ref={el => { if (editorRefs.current) editorRefs.current['phoneLabel'] = el; }}
                                    value={footer.phoneLabelHtml || footer.phoneLabel || 'للحجز والاستفسار (اتصال):'}
                                    onChange={html => updateFooter({ phoneLabelHtml: html, phoneLabel: stripHtml(html) })}
                                    placeholder="للحجز والاستفسار (اتصال):"
                                />
                            </div>
                        </div>
                        <div>
                            <StyleControl
                                style={footer.phoneLabelStyle || {}}
                                onChange={s => handleStyleChange(s, 'phoneLabel', footer.phoneLabelStyle || {}, x => updateFooter({ phoneLabelStyle: x }))}
                                onApplyPreset={s => handlePreset(s, 'phoneLabel')}
                            />
                        </div>
                        {/* حقل إدخال رقم الهاتف الفعلي وتنسيقه */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-rose-800 block">رقم الهاتف (اتصال)</label>
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                                <RichTextEditor
                                    ref={el => { if (editorRefs.current) editorRefs.current['phone'] = el; }}
                                    value={footer.phoneNumberHtml || footer.phoneNumber}
                                    onChange={html => updateFooter({ phoneNumberHtml: html, phoneNumber: stripHtml(html) })}
                                    placeholder="رقم الهاتف..."
                                />
                            </div>
                        </div>
                        <div>
                            <StyleControl
                                style={footer.phoneStyle || {}}
                                onChange={s => handleStyleChange(s, 'phone', footer.phoneStyle || {}, x => updateFooter({ phoneStyle: x }))}
                                onApplyPreset={s => handlePreset(s, 'phone')}
                            />
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                            <input
                                type="checkbox"
                                checked={footer.showPhoneIcon !== false}
                                onChange={e => updateFooter({ showPhoneIcon: e.target.checked })}
                                className="w-5 h-5 rounded accent-rose-600"
                            />
                            <label className="text-sm font-bold text-slate-700 cursor-pointer">إظهار أيقونة الاتصال</label>
                        </div>
                        {footer.showPhoneIcon !== false && (
                            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 space-y-3">
                                <h4 className="text-xs font-bold text-rose-800 mb-2">🎨 إعدادات أيقونة الاتصال</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-rose-700 mb-1 block">لون الأيقونة</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={footer.phoneIconStyle?.color || '#b91c1c'}
                                                onChange={e => updateFooter({ 
                                                    phoneIconStyle: { 
                                                        ...footer.phoneIconStyle, 
                                                        color: e.target.value 
                                                    } 
                                                })}
                                                className="h-8 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                                            />
                                            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{footer.phoneIconStyle?.color || '#b91c1c'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-rose-700 mb-1 block">الحجم: {footer.phoneIconStyle?.size || 10}px</label>
                                        <input
                                            type="range"
                                            min="6"
                                            max="20"
                                            value={footer.phoneIconStyle?.size || 10}
                                            onChange={e => updateFooter({ 
                                                phoneIconStyle: { 
                                                    ...footer.phoneIconStyle, 
                                                    size: parseInt(e.target.value) 
                                                } 
                                            })}
                                            className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-rose-700 mb-1 block">إزاحة أفقية: {footer.phoneIconStyle?.xOffset || 0}px</label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={footer.phoneIconStyle?.xOffset || 0}
                                            onChange={e => updateFooter({ 
                                                phoneIconStyle: { 
                                                    ...footer.phoneIconStyle, 
                                                    xOffset: parseInt(e.target.value) 
                                                } 
                                            })}
                                            className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-rose-700 mb-1 block">إزاحة رأسية: {footer.phoneIconStyle?.yOffset || 0}px</label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={footer.phoneIconStyle?.yOffset || 0}
                                            onChange={e => updateFooter({ 
                                                phoneIconStyle: { 
                                                    ...footer.phoneIconStyle, 
                                                    yOffset: parseInt(e.target.value) 
                                                } 
                                            })}
                                            className="w-full accent-rose-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* الواتساب */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-teal-800 block">نص التسمية (قبل رقم الواتساب)</label>
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                                <RichTextEditor
                                    ref={el => { if (editorRefs.current) editorRefs.current['whatsappLabel'] = el; }}
                                    value={footer.whatsappLabelHtml || footer.whatsappLabel || 'للحجز والاستفسار (واتساب):'}
                                    onChange={html => updateFooter({ whatsappLabelHtml: html, whatsappLabel: stripHtml(html) })}
                                    placeholder="للحجز والاستفسار (واتساب):"
                                />
                            </div>
                        </div>
                        <div>
                            <StyleControl
                                style={footer.whatsappLabelStyle || {}}
                                onChange={s => handleStyleChange(s, 'whatsappLabel', footer.whatsappLabelStyle || {}, x => updateFooter({ whatsappLabelStyle: x }))}
                                onApplyPreset={s => handlePreset(s, 'whatsappLabel')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-teal-800 block">رقم الواتساب</label>
                            <div className="border rounded-lg overflow-hidden shadow-sm">
                                <RichTextEditor
                                    ref={el => { if (editorRefs.current) editorRefs.current['whatsapp'] = el; }}
                                    value={footer.whatsappNumberHtml || footer.whatsappNumber}
                                    onChange={html => updateFooter({ whatsappNumberHtml: html, whatsappNumber: stripHtml(html) })}
                                    placeholder="رقم الواتساب..."
                                />
                            </div>
                        </div>
                        <div>
                            <StyleControl
                                style={footer.whatsappStyle || {}}
                                onChange={s => handleStyleChange(s, 'whatsapp', footer.whatsappStyle || {}, x => updateFooter({ whatsappStyle: x }))}
                                onApplyPreset={s => handlePreset(s, 'whatsapp')}
                            />
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                            <input
                                type="checkbox"
                                checked={footer.showWhatsappIcon !== false}
                                onChange={e => updateFooter({ showWhatsappIcon: e.target.checked })}
                                className="w-5 h-5 rounded accent-teal-600"
                            />
                            <label className="text-sm font-bold text-slate-700 cursor-pointer">إظهار أيقونة الواتساب</label>
                        </div>
                        {footer.showWhatsappIcon !== false && (
                            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 space-y-3">
                                <h4 className="text-xs font-bold text-teal-800 mb-2">🎨 إعدادات أيقونة الواتساب</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-teal-700 mb-1 block">لون الأيقونة</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={footer.whatsappIconStyle?.color || '#16a34a'}
                                                onChange={e => updateFooter({ 
                                                    whatsappIconStyle: { 
                                                        ...footer.whatsappIconStyle, 
                                                        color: e.target.value 
                                                    } 
                                                })}
                                                className="h-8 w-12 rounded cursor-pointer border border-slate-200 p-0.5"
                                            />
                                            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{footer.whatsappIconStyle?.color || '#16a34a'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-teal-700 mb-1 block">الحجم: {footer.whatsappIconStyle?.size || 10}px</label>
                                        <input
                                            type="range"
                                            min="6"
                                            max="20"
                                            value={footer.whatsappIconStyle?.size || 10}
                                            onChange={e => updateFooter({ 
                                                whatsappIconStyle: { 
                                                    ...footer.whatsappIconStyle, 
                                                    size: parseInt(e.target.value) 
                                                } 
                                            })}
                                            className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-teal-700 mb-1 block">إزاحة أفقية: {footer.whatsappIconStyle?.xOffset || 0}px</label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={footer.whatsappIconStyle?.xOffset || 0}
                                            onChange={e => updateFooter({ 
                                                whatsappIconStyle: { 
                                                    ...footer.whatsappIconStyle, 
                                                    xOffset: parseInt(e.target.value) 
                                                } 
                                            })}
                                            className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-teal-700 mb-1 block">إزاحة رأسية: {footer.whatsappIconStyle?.yOffset || 0}px</label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={footer.whatsappIconStyle?.yOffset || 0}
                                            onChange={e => updateFooter({ 
                                                whatsappIconStyle: { 
                                                    ...footer.whatsappIconStyle, 
                                                    yOffset: parseInt(e.target.value) 
                                                } 
                                            })}
                                            className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CollapsibleSection>
    </>
  );
};
