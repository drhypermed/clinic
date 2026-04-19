/**
 * مكون إعدادات نصوص الهيدر (Header Text Sections)
 * يتيح للطبيب تخصيص النصوص الرئيسية في أعلى الروشتة (مثل اسم العيادة والتخصص) وتغيير أنماطها وألوانها.
 */

import React from 'react';
import { CollapsibleSection } from '../CollapsibleSection';
import { StyleControl } from '../../editors/StyleControl';
import { RichTextEditor } from '../../editors/RichTextEditor';
import { stripHtml, LABEL_CLASS } from '../utils';
import type { HeaderSectionSharedProps } from '../../../types';
import {
  updateDegreesLine,
  updateDegreesStyle,
  updateSpecialtiesLine,
  updateSpecialtiesStyle,
} from './helpers';

export const HeaderTextSections: React.FC<HeaderSectionSharedProps> = ({
  header,
  defaultHeader,
  updateHeader,
  openSection,
  toggle,
  handleStyleChange,
  handlePreset,
  editorRefs,
}) => {
  return (
    <>
      {/* --- مقطع تعديل اسم الطبيب --- */}
      <CollapsibleSection
        title="اسم الطبيب"
        isOpen={openSection === 'doctor'}
        onToggle={() => toggle('doctor')}
        className="bg-slate-50 p-3 rounded-lg border border-slate-200 m-2"
        color="emerald"
      >
        <label className={LABEL_CLASS + ' mb-2 block'}>اسم الطبيب</label>
        {/* محرر النصوص الغنية لاسم الطبيب (يدعم التنسيق الملون والعريض) */}
        <RichTextEditor
          ref={(el) => {
            if (editorRefs.current) editorRefs.current['doctorName'] = el;
          }}
          value={header.doctorNameHtml || header.doctorName}
          onChange={(html) => updateHeader({ doctorNameHtml: html, doctorName: stripHtml(html) })}
          baseStyle={header.doctorNameStyle || defaultHeader.doctorNameStyle}
          placeholder="اسم الطبيب"
        />
        <div className="mt-2">
          {/* أدوات التحكم في تنسيق الخط (نوع الخط، الحجم، اللون) */}
          <StyleControl
            style={header.doctorNameStyle || defaultHeader.doctorNameStyle}
            onChange={(s) =>
              handleStyleChange(
                s,
                'doctorName',
                header.doctorNameStyle || defaultHeader.doctorNameStyle,
                (x) => updateHeader({ doctorNameStyle: x })
              )
            }
            onApplyPreset={(s) => handlePreset(s, 'doctorName')}
          />
        </div>
      </CollapsibleSection>

      {/* --- مقطع الدرجات العلمية / محل العمل --- */}
      <CollapsibleSection
        title="الدرجات العلمية / محل العمل"
        isOpen={openSection === 'degrees'}
        onToggle={() => toggle('degrees')}
        className="p-4"
        color="amber"
      >
        <label className={LABEL_CLASS}>الدرجات العلمية / محل العمل (تظهر في أعلى يمين الروشتة)</label>
        <div className="space-y-4">
          {/* توليد 4 أسطر لإدخال الدرجات العلمية */}
          {[0, 1, 2, 3].map((idx) => {
            const style = header.degreesLineStyles?.[idx] || header.degreesStyle || defaultHeader.degreesStyle;
            const val = header.degreesHtmlLines?.[idx] ?? (header.degrees?.[idx] || '');
            return (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-400 mb-2 block">السطر {idx + 1}</span>
                <RichTextEditor
                  ref={(el) => {
                    if (editorRefs.current) editorRefs.current[`degrees-${idx}`] = el;
                  }}
                  value={val}
                  onChange={(html) => updateDegreesLine(header, updateHeader, idx, html)}
                  baseStyle={style}
                  minHeight="40px"
                  placeholder={`السطر ${idx + 1}`}
                />
                <div className="mt-2">
                  <StyleControl
                    style={style}
                    onChange={(s) =>
                      handleStyleChange(s, `degrees-${idx}`, style, (x) => updateDegreesStyle(header, updateHeader, idx, x))
                    }
                    onApplyPreset={(s) => handlePreset(s, `degrees-${idx}`)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* --- مقطع التخصصات وخدمات العيادة --- */}
      <CollapsibleSection
        title="التخصصات وخدمات العيادة"
        isOpen={openSection === 'specialties'}
        onToggle={() => toggle('specialties')}
        className="p-4"
        color="rose"
      >
        <label className={LABEL_CLASS}>التخصصات وخدمات العيادة (تظهر في أعلى يسار الروشتة)</label>
        <div className="space-y-4">
          {/* توليد 5 أسطر لإدخال التخصصات */}
          {[0, 1, 2, 3, 4].map((idx) => {
            const style = header.specialtiesLineStyles?.[idx] || header.specialtiesStyle || defaultHeader.specialtiesStyle;
            const val = header.specialtiesHtmlLines?.[idx] ?? (header.specialties?.[idx] || '');
            return (
              <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-400 mb-2 block">السطر {idx + 1}</span>
                <RichTextEditor
                  ref={(el) => {
                    if (editorRefs.current) editorRefs.current[`specialties-${idx}`] = el;
                  }}
                  value={val}
                  onChange={(html) => updateSpecialtiesLine(header, updateHeader, idx, html)}
                  baseStyle={style}
                  minHeight="40px"
                  placeholder={`السطر ${idx + 1}`}
                />
                <div className="mt-2">
                  <StyleControl
                    style={style}
                    onChange={(s) =>
                      handleStyleChange(
                        s,
                        `specialties-${idx}`,
                        style,
                        (x) => updateSpecialtiesStyle(header, updateHeader, idx, x)
                      )
                    }
                    onApplyPreset={(s) => handlePreset(s, `specialties-${idx}`)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>
    </>
  );
};
