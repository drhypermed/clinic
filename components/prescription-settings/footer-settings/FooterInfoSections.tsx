/**
 * الملف: FooterInfoSections.tsx
 * الوصف: هذا المكون مسؤول عن إعدادات النصوص المعلوماتية في الفوتر. 
 * يتضمن ذلك عنوان العيادة، مواعيد العمل، ومدة صلاحية الاستشارة، 
 * مع إمكانية تنسيق كل نص بشكل مستقل باستخدام محرر النصوص الغنية.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { StyleControl } from '../../editors/StyleControl';
import { RichTextEditor } from '../../editors/RichTextEditor';
import { stripHtml } from '../utils';
import type { FooterSectionSharedProps } from '../../../types';

export const FooterInfoSections: React.FC<FooterSectionSharedProps> = ({ footer, updateFooter, openSection, toggle, handleStyleChange, handlePreset, editorRefs }) => {
  return (
    <>
            <CollapsibleSection
                title="📍 عنوان العيادة"
                isOpen={openSection === 'address'}
                onToggle={() => toggle('address')}
                color="emerald"
                className="p-4 bg-gradient-to-br from-success-50 to-white"
            >
                <div className="space-y-4">
                    <label className="text-sm font-bold text-success-800 block">نص العنوان</label>
                    {/* محرر نصوص غنية لإدخال العنوان مع دعم الألوان والتنسيقات */}
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                        <RichTextEditor
                            ref={el => { if (editorRefs.current) editorRefs.current['address'] = el; }}
                            value={footer.addressHtml || footer.address}
                            onChange={html => updateFooter({ addressHtml: html, address: stripHtml(html) })}
                            placeholder="اكتب عنوان العيادة هنا..."
                        />
                    </div>
                    <div>
                        <StyleControl
                            style={footer.addressStyle || {}}
                            onChange={s => handleStyleChange(s, 'address', footer.addressStyle || {}, x => updateFooter({ addressStyle: x }))}
                            onApplyPreset={s => handlePreset(s, 'address')}
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* مواعيد العمل */}
            <CollapsibleSection
                title="🕒 مواعيد العمل"
                isOpen={openSection === 'workingHours'}
                onToggle={() => toggle('workingHours')}
                color="amber"
                className="p-4 bg-gradient-to-br from-warning-50 to-white"
            >
                <div className="space-y-4">
                    <label className="text-sm font-bold text-warning-800 block">تفاصيل المواعيد</label>
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                        <RichTextEditor
                            ref={el => { if (editorRefs.current) editorRefs.current['workingHours'] = el; }}
                            value={footer.workingHoursHtml || footer.workingHours}
                            onChange={html => updateFooter({ workingHoursHtml: html, workingHours: stripHtml(html) })}
                            placeholder="مثال: يومياً من ٥ عصراً ما عدا الجمعة"
                        />
                    </div>
                    <div>
                        <StyleControl
                            style={footer.workingHoursStyle || {}}
                            onChange={s => handleStyleChange(s, 'workingHours', footer.workingHoursStyle || {}, x => updateFooter({ workingHoursStyle: x }))}
                            onApplyPreset={s => handlePreset(s, 'workingHours')}
                        />
                    </div>
                </div>
            </CollapsibleSection>

            {/* مدة الاستشارة */}
            <CollapsibleSection
                title="📅 مدة الاستشارة"
                isOpen={openSection === 'consultation'}
                onToggle={() => toggle('consultation')}
                color="indigo"
                className="p-4 bg-gradient-to-br from-brand-50 to-white"
            >
                <div className="space-y-4">
                    <label className="text-sm font-bold text-brand-800 block">نص مدة الاستشارة</label>
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                        <RichTextEditor
                            ref={el => { if (editorRefs.current) editorRefs.current['consultation'] = el; }}
                            value={footer.consultationPeriodHtml || footer.consultationPeriod}
                            onChange={html => updateFooter({ consultationPeriodHtml: html, consultationPeriod: stripHtml(html) })}
                            placeholder="مثال: الاستشارة صالحة خلال أسبوعين"
                        />
                    </div>
                    <div>
                        <StyleControl
                            style={footer.consultationPeriodStyle || {}}
                            onChange={s => handleStyleChange(s, 'consultation', footer.consultationPeriodStyle || {}, x => updateFooter({ consultationPeriodStyle: x }))}
                            onApplyPreset={s => handlePreset(s, 'consultation')}
                        />
                    </div>
                </div>
            </CollapsibleSection>
    </>
  );
};
